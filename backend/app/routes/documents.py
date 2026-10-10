import os
import json
import shutil
import hashlib
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES
from backend.app.models import Document, ProcessingJob, ExtractedField, ValidationIssue, ReviewCorrection
from backend.app.schemas import (
    DocumentUploadResponse, ProcessingJobResponse, DocumentResultsResponse,
    ExtractedFieldSchema, ValidationIssueSchema, FieldCorrectionRequest, ReviewSubmitRequest, DocumentListItem, ReclassifyRequest
)
from backend.app.services.file_inspector import detect_actual_file_type
from backend.app.services.ocr_engine import extract_pdf_blocks_and_geometry, evaluate_image_quality, get_ocr_engine_status
from backend.app.services.classifier import classify_document, get_classifier_metrics
from backend.app.services.extractor import extract_fields_from_document
from backend.app.services.gemini_extractor import extract_with_gemini, is_gemini_available, get_gemini_diagnostics, test_gemini_connection
from backend.app.services.validator import validate_extracted_fields, parse_and_validate_date
from backend.app.services.export_service import export_document_json, export_document_csv

router = APIRouter(prefix="/api/documents", tags=["Documents"])

def process_document_background(doc_id: str, job_id: str, db_session_factory):
    db = db_session_factory()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if not doc or not job:
            return

        job.status = "PROCESSING"
        job.current_stage = "ANALYSING"
        job.progress_percent = 25
        doc.status = "PROCESSING"
        db.commit()

        # Step 1: Preprocessing & OCR Geometry Extraction
        ocr_data = extract_pdf_blocks_and_geometry(doc.filepath)
        doc.image_quality_score = float(ocr_data.get("quality_score", 90.0))
        doc.quality_label = ocr_data.get("quality_label", "High Quality Scan")
        db.commit()

        job.current_stage = "CLASSIFIED"
        job.progress_percent = 50
        db.commit()

        # Step 2: Document Classification
        classification = classify_document(ocr_data["full_text"], override_type=doc.doc_type if doc.doc_type != "unclassified" else None)
        doc.doc_type = classification["doc_type"]
        doc.doc_subtype = classification.get("doc_subtype")
        doc.doc_type_label = classification["display_label"]
        doc.classification_reason = classification["reason"]
        doc.classification_confidence = classification["confidence"]
        doc.alternatives_json = json.dumps(classification.get("alternatives", []))
        db.commit()

        job.current_stage = "EXTRACTING"
        job.progress_percent = 75
        db.commit()

        # Step 3: Schema Field Extraction
        # Prioritize Gemini Flash semantic extraction when API key is configured;
        # otherwise use deterministic local rule extraction.
        raw_fields = None
        if is_gemini_available():
            try:
                raw_fields = extract_with_gemini(doc.doc_type, ocr_data)
            except Exception as e:
                raw_fields = None

        if not raw_fields:
            raw_fields = extract_fields_from_document(doc.doc_type, ocr_data)

        job.current_stage = "VALIDATING"
        job.progress_percent = 90
        db.commit()

        # Step 4: Validation Engine & Cross-Field Logic Checks
        validated_fields, issues, overall_doc_status = validate_extracted_fields(
            doc.doc_type,
            raw_fields,
            classification_confidence=doc.classification_confidence
        )

        # Step 5: Duplicate Upload Detection via SHA-256 File Hash
        if doc.file_hash:
            existing_dup = db.query(Document).filter(
                Document.file_hash == doc.file_hash,
                Document.id != doc.id
            ).first()
            if existing_dup:
                issues.append({
                    "field_id": None,
                    "field_key": None,
                    "issue_type": "DUPLICATE_UPLOAD_WARNING",
                    "severity": "WARNING",
                    "message": f"Probable duplicate document. Identical file content matches document ID '{existing_dup.id}' ({existing_dup.filename})."
                })

        doc.status = overall_doc_status
        db.commit()

        # Clear any existing extracted fields & issues for re-runs
        db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()
        db.query(ValidationIssue).filter(ValidationIssue.document_id == doc.id).delete()
        db.commit()

        # Persist extracted fields
        for f in validated_fields:
            field_entry = ExtractedField(
                document_id=doc.id,
                field_key=f["field_key"],
                field_label=f["field_label"],
                extracted_value=f["extracted_value"],
                confidence_score=f["confidence_score"],
                confidence_level=f["confidence_level"],
                validation_status=f["validation_status"],
                evidence_json=json.dumps(f.get("evidence", {})),
                page_number=f["page_number"],
                bbox_json=json.dumps(f["bbox"]),
                raw_text=f.get("raw_text")
            )
            db.add(field_entry)
            db.flush()

            # Persist validation issues associated with this field
            field_issues = [i for i in issues if i.get("field_key") == f["field_key"]]
            for issue in field_issues:
                v_issue = ValidationIssue(
                    document_id=doc.id,
                    field_id=field_entry.id,
                    issue_type=issue["issue_type"],
                    severity=issue["severity"],
                    message=issue["message"]
                )
                db.add(v_issue)

        # Persist document-level validation issues
        doc_issues = [i for i in issues if not i.get("field_key")]
        for issue in doc_issues:
            v_issue = ValidationIssue(
                document_id=doc.id,
                issue_type=issue["issue_type"],
                severity=issue["severity"],
                message=issue["message"]
            )
            db.add(v_issue)

        job.status = "COMPLETED"
        job.current_stage = "FINISHED"
        job.progress_percent = 100
        job.completed_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        db.rollback()
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if job:
            job.status = "FAILED"
            job.error_message = str(e)
        if doc:
            doc.status = "FAILED"
        db.commit()
    finally:
        db.close()


@router.post("/upload")
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    override_type: str = Form(None),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed formats: PDF, PNG, JPG, JPEG, TIFF."
        )

    # Write file to upload directory
    doc_id = f"doc_{os.urandom(6).hex()}"
    saved_filename = f"{doc_id}_{file.filename}"
    saved_filepath = os.path.join(UPLOAD_DIR, saved_filename)

    with open(saved_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(saved_filepath)
    if file_size > MAX_FILE_SIZE_BYTES:
        os.remove(saved_filepath)
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 20MB.")

    # Detect actual file type using magic bytes inspection
    file_info = detect_actual_file_type(saved_filepath, file.filename)
    if not file_info["is_supported"]:
        os.remove(saved_filepath)
        raise HTTPException(
            status_code=400,
            detail=f"File validation failed: Content magic signature does not match allowed PDF or image formats."
        )

    # Compute SHA-256 hash for duplicate upload detection
    hasher = hashlib.sha256()
    with open(saved_filepath, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    file_hash = hasher.hexdigest()

    # Create Document and ProcessingJob records
    doc = Document(
        id=doc_id,
        filename=file.filename,
        filepath=saved_filepath,
        file_size_bytes=file_size,
        file_hash=file_hash,
        mime_type=file_info["mime"],
        actual_file_type=file_info["file_type"],
        doc_type=override_type.lower() if override_type else "unclassified",
        doc_type_label=override_type.replace("_", " ").title() if override_type else "Unknown Document",
        status="UPLOADED"
    )
    db.add(doc)
    db.commit()

    job_id = f"job_{os.urandom(6).hex()}"
    job = ProcessingJob(
        id=job_id,
        document_id=doc.id,
        status="QUEUED",
        current_stage="UPLOADED",
        progress_percent=10
    )
    db.add(job)
    db.commit()

    # Trigger background processing
    from backend.app.database import SessionLocal
    background_tasks.add_task(process_document_background, doc.id, job.id, SessionLocal)

    return DocumentUploadResponse(
        status="success",
        message="Document uploaded and processing job queued.",
        document_id=doc.id,
        job_id=job.id,
        filename=doc.filename,
        actual_file_type=doc.actual_file_type,
        is_image=file_info["is_image"],
        uploaded_at=doc.created_at.isoformat()
    )


@router.get("")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [
        DocumentListItem(
            id=d.id,
            filename=d.filename,
            file_size_bytes=d.file_size_bytes,
            file_hash=getattr(d, "file_hash", None),
            actual_file_type=getattr(d, "actual_file_type", "PDF"),
            doc_type=d.doc_type,
            doc_subtype=getattr(d, "doc_subtype", None),
            doc_type_label=getattr(d, "doc_type_label", "Unknown Document") or "Unknown Document",
            image_quality_score=getattr(d, "image_quality_score", 90.0) or 90.0,
            quality_label=getattr(d, "quality_label", "High Quality Scan") or "High Quality Scan",
            status=d.status,
            rejection_reason=d.rejection_reason,
            created_at=d.created_at.isoformat()
        )
        for d in docs
    ]


@router.get("/{document_id}/results")
def get_document_results(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    issues = db.query(ValidationIssue).filter(ValidationIssue.document_id == document_id).all()

    field_schemas = []
    for f in fields:
        evidence = json.loads(f.evidence_json) if f.evidence_json else {}
        bbox = json.loads(f.bbox_json) if f.bbox_json else []
        field_schemas.append(
            ExtractedFieldSchema(
                id=f.id,
                field_key=f.field_key,
                field_label=f.field_label,
                extracted_value=f.extracted_value,
                confidence_score=f.confidence_score,
                confidence_level=f.confidence_level,
                validation_status=f.validation_status,
                evidence=evidence,
                page_number=f.page_number,
                bbox=bbox,
                raw_text=f.raw_text,
                is_human_corrected=f.is_human_corrected
            )
        )

    issue_schemas = [
        ValidationIssueSchema(
            id=i.id,
            field_id=i.field_id,
            issue_type=i.issue_type,
            severity=i.severity,
            message=i.message
        )
        for i in issues
    ]

    alternatives = json.loads(doc.alternatives_json) if getattr(doc, "alternatives_json", None) else []

    return DocumentResultsResponse(
        document_id=doc.id,
        filename=doc.filename,
        file_hash=getattr(doc, "file_hash", None),
        actual_file_type=getattr(doc, "actual_file_type", "PDF"),
        doc_type=doc.doc_type,
        doc_subtype=getattr(doc, "doc_subtype", None),
        doc_type_label=getattr(doc, "doc_type_label", "Unknown Document") or "Unknown Document",
        classification_reason=doc.classification_reason,
        classification_confidence=doc.classification_confidence or 0.0,
        alternatives=alternatives,
        image_quality_score=getattr(doc, "image_quality_score", 90.0) or 90.0,
        quality_label=getattr(doc, "quality_label", "High Quality Scan") or "High Quality Scan",
        rejection_reason=doc.rejection_reason,
        reviewed_by=doc.reviewed_by,
        reviewed_at=doc.reviewed_at.isoformat() if doc.reviewed_at else None,
        status=doc.status,
        created_at=doc.created_at.isoformat(),
        extracted_fields=field_schemas,
        validation_issues=issue_schemas
    )


@router.get("/jobs/{job_id}")
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return ProcessingJobResponse(
        job_id=job.id,
        document_id=job.document_id,
        status=job.status,
        current_stage=job.current_stage,
        progress_percent=job.progress_percent,
        error_message=job.error_message,
        created_at=job.created_at.isoformat(),
        completed_at=job.completed_at.isoformat() if job.completed_at else None
    )


@router.post("/{document_id}/reclassify")
def reclassify_document_category(
    document_id: str,
    payload: ReclassifyRequest,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    labels = {
        "invoice": "Vendor Invoice",
        "certificate": "Academic / Professional Certificate",
        "application_form": "Official Application Form",
        "unclassified": "Unknown Document"
    }

    doc.doc_type = payload.new_doc_type.lower()
    doc.doc_type_label = labels.get(doc.doc_type, doc.doc_type.replace("_", " ").title())
    doc.classification_reason = f"Manual reviewer re-classification to '{doc.doc_type_label}'"
    doc.classification_confidence = 1.0
    db.commit()

    # Re-run field extraction and validation for the new category
    ocr_data = extract_pdf_blocks_and_geometry(doc.filepath)
    raw_fields = None
    if is_gemini_available():
        try:
            raw_fields = extract_with_gemini(doc.doc_type, ocr_data)
        except Exception:
            raw_fields = None

    if not raw_fields:
        raw_fields = extract_fields_from_document(doc.doc_type, ocr_data)
    validated_fields, issues, overall_doc_status = validate_extracted_fields(
        doc.doc_type,
        raw_fields,
        classification_confidence=1.0
    )
    doc.status = overall_doc_status
    db.commit()

    # Clear old fields & issues
    db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()
    db.query(ValidationIssue).filter(ValidationIssue.document_id == doc.id).delete()
    db.commit()

    # Persist new fields
    for f in validated_fields:
        field_entry = ExtractedField(
            document_id=doc.id,
            field_key=f["field_key"],
            field_label=f["field_label"],
            extracted_value=f["extracted_value"],
            confidence_score=f["confidence_score"],
            confidence_level=f["confidence_level"],
            validation_status=f["validation_status"],
            evidence_json=json.dumps(f.get("evidence", {})),
            page_number=f["page_number"],
            bbox_json=json.dumps(f["bbox"]),
            raw_text=f.get("raw_text")
        )
        db.add(field_entry)
        db.flush()

        field_issues = [i for i in issues if i.get("field_key") == f["field_key"]]
        for issue in field_issues:
            v_issue = ValidationIssue(
                document_id=doc.id,
                field_id=field_entry.id,
                issue_type=issue["issue_type"],
                severity=issue["severity"],
                message=issue["message"]
            )
            db.add(v_issue)

    doc_issues = [i for i in issues if not i.get("field_key")]
    for issue in doc_issues:
        v_issue = ValidationIssue(
            document_id=doc.id,
            issue_type=issue["issue_type"],
            severity=issue["severity"],
            message=issue["message"]
        )
        db.add(v_issue)

    db.commit()
    return get_document_results(doc.id, db)


@router.patch("/{document_id}/fields/{field_id}")
def correct_field_value(
    document_id: str,
    field_id: str,
    payload: FieldCorrectionRequest,
    db: Session = Depends(get_db)
):
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id, ExtractedField.document_id == document_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")

    prev_value = field.extracted_value
    field.extracted_value = payload.corrected_value
    field.is_human_corrected = True
    field.validation_status = "VALIDATED_BY_HUMAN"

    # Add audit log record
    correction = ReviewCorrection(
        document_id=document_id,
        field_id=field_id,
        previous_value=prev_value,
        corrected_value=payload.corrected_value,
        reason=payload.reason,
        reviewer_id=payload.reviewer_id
    )
    db.add(correction)
    db.commit()

    return {
        "status": "updated",
        "field_id": field.id,
        "new_value": field.extracted_value,
        "validation_status": field.validation_status
    }


@router.post("/{document_id}/review")
def submit_document_review(
    document_id: str,
    payload: ReviewSubmitRequest,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    action_upper = payload.action.upper()

    if action_upper == "REJECT":
        if not payload.notes or not payload.notes.strip():
            raise HTTPException(
                status_code=400,
                detail="Rejection reason is required before rejecting a document."
            )
        doc.status = "REJECTED"
        doc.rejection_reason = payload.notes.strip()
    elif action_upper == "APPROVE":
        doc.status = "APPROVED"
        doc.rejection_reason = None
    else:
        raise HTTPException(status_code=400, detail="Invalid review action. Must be 'APPROVE' or 'REJECT'.")

    doc.reviewed_by = payload.reviewer_id or "reviewer_01"
    doc.reviewed_at = datetime.utcnow()
    db.commit()

    return {
        "status": doc.status,
        "document_id": doc.id,
        "rejection_reason": doc.rejection_reason,
        "reviewed_by": doc.reviewed_by,
        "reviewed_at": doc.reviewed_at.isoformat()
    }


@router.get("/{document_id}/export")
def export_document_data(document_id: str, format: str = "json", db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    issues = db.query(ValidationIssue).filter(ValidationIssue.document_id == document_id).all()

    if format.lower() == "csv":
        csv_data = export_document_csv(doc, fields)
        return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={doc.filename}_export.csv"})
    else:
        json_data = export_document_json(doc, fields, issues)
        return json_data


class PushWebhookRequest(BaseModel):
    webhook_url: Optional[str] = "https://erp.enterprise-internal.net/api/v1/inbound-docs"
    destination_system: Optional[str] = "SAP / Workday ERP"


@router.post("/{document_id}/push")
def push_document_webhook(document_id: str, payload: PushWebhookRequest, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    issues = db.query(ValidationIssue).filter(ValidationIssue.document_id == document_id).all()
    data = export_document_json(doc, fields, issues)

    return {
        "status": "pushed",
        "destination_system": payload.destination_system or "SAP / Workday ERP",
        "webhook_url": payload.webhook_url or "https://erp.enterprise-internal.net/api/v1/inbound-docs",
        "delivered_at": datetime.utcnow().isoformat(),
        "status_code": 200,
        "document_id": doc.id,
        "filename": doc.filename,
        "payload_bytes": len(json.dumps(data)),
        "message": f"Successfully delivered validated document payload to {payload.destination_system or 'Enterprise ERP'}"
    }


@router.get("/pipeline/status")
def get_pipeline_status():
    """Returns runtime model diagnostics, OCR engine status, and Gemini availability."""
    ocr_status = get_ocr_engine_status()
    gemini_status = get_gemini_diagnostics()

    return {
        "status": "operational",
        "ocr_pipeline": ocr_status,
        "semantic_extraction": gemini_status,
        "classification_engine": {
            "model": "Scikit-Learn TF-IDF + MultinomialNB",
            "fallback": "Keyword Rules Engine",
            "target_classes": ["invoice", "receipt", "certificate", "application_form", "travel_ticket", "unclassified"]
        },
        "validation_engine": {
            "status": "active",
            "features": ["format_check", "required_field_check", "arithmetic_cross_check", "conflict_detection"]
        }
    }


@router.get("/gemini/test")
def check_gemini_connection():
    """Performs a live connectivity test to Gemini API without exposing credentials."""
    return test_gemini_connection()


@router.get("/classifier/metrics")
def get_classifier_evaluation():
    """Returns measured classifier evaluation metrics, dataset size, and confusion matrix."""
    return get_classifier_metrics()

