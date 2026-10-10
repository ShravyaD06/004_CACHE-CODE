import json
import csv
import io

def export_document_json(document, fields, validation_issues) -> dict:
    """Exports document results as a structured JSON dict."""
    extracted_dict = {}
    for f in fields:
        evidence = json.loads(f.evidence_json) if f.evidence_json else {}
        bbox = json.loads(f.bbox_json) if f.bbox_json else []
        extracted_dict[f.field_key] = {
            "value": f.extracted_value,
            "confidence": f.confidence_score,
            "confidence_level": f.confidence_level,
            "validation_status": f.validation_status,
            "is_human_corrected": f.is_human_corrected,
            "evidence": {
                "page_number": f.page_number,
                "bbox": bbox,
                "raw_text": f.raw_text,
                "candidates": evidence.get("candidates", [])
            }
        }

    return {
        "document_id": document.id,
        "filename": document.filename,
        "document_type": document.doc_type,
        "status": document.status,
        "created_at": document.created_at.isoformat(),
        "extracted_fields": extracted_dict,
        "validation_issues": [
            {
                "issue_type": issue.issue_type,
                "severity": issue.severity,
                "message": issue.message
            }
            for issue in validation_issues
        ]
    }

def export_document_csv(document, fields) -> str:
    """Exports document results as CSV text."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Document ID", "Filename", "Doc Type", "Field Key",
        "Field Label", "Extracted Value", "Confidence", "Validation Status", "Human Corrected"
    ])
    for f in fields:
        writer.writerow([
            document.id,
            document.filename,
            document.doc_type,
            f.field_key,
            f.field_label,
            f.extracted_value or "",
            f.confidence_score,
            f.validation_status,
            "YES" if f.is_human_corrected else "NO"
        ])
    return output.getvalue()
