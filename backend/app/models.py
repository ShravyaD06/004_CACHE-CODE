import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_hash = Column(String, nullable=True)  # SHA-256 hash for duplicate upload detection
    mime_type = Column(String, nullable=False)
    actual_file_type = Column(String, default="PDF")  # PDF, JPEG, PNG, TIFF, UNKNOWN
    doc_type = Column(String, default="unclassified")  # invoice, receipt, certificate, application_form, unclassified
    doc_subtype = Column(String, nullable=True)  # e.g., university_fee_receipt, degree_certificate
    doc_type_label = Column(String, default="Unknown Document")
    classification_reason = Column(Text, nullable=True)
    classification_confidence = Column(Float, default=0.0)
    alternatives_json = Column(Text, nullable=True)  # JSON representation of alternative categories
    image_quality_score = Column(Float, default=90.0)  # 0-100 quality score
    quality_label = Column(String, default="High Quality Scan")
    rejection_reason = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    status = Column(String, default="UPLOADED")  # UPLOADED, PROCESSING, CLASSIFIED, EXTRACTING, VALIDATING, NEEDS_CLASSIFICATION_REVIEW, NEEDS_REVIEW, READY_FOR_REVIEW, APPROVED, REJECTED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")
    fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    validation_issues = relationship("ValidationIssue", back_populates="document", cascade="all, delete-orphan")
    corrections = relationship("ReviewCorrection", back_populates="document", cascade="all, delete-orphan")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    status = Column(String, default="QUEUED")  # QUEUED, PROCESSING, COMPLETED, FAILED
    current_stage = Column(String, default="UPLOADED")
    progress_percent = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="jobs")

class ExtractionSchema(Base):
    __tablename__ = "extraction_schemas"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_type = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    schema_json = Column(Text, nullable=False)  # JSON text definition of fields
    is_active = Column(Boolean, default=True)

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    field_key = Column(String, nullable=False)
    field_label = Column(String, nullable=False)
    extracted_value = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)
    confidence_level = Column(String, default="UNKNOWN")  # HIGH, MEDIUM, LOW, UNKNOWN
    validation_status = Column(String, default="VALID")  # VALID, INVALID_FORMAT, MISSING, CONFLICT_DETECTED, VALIDATED_BY_HUMAN
    evidence_json = Column(Text, nullable=True)  # JSON representation of evidence & candidates
    page_number = Column(Integer, default=1)
    bbox_json = Column(Text, nullable=True)  # [ymin, xmin, ymax, xmax] percentages
    raw_text = Column(Text, nullable=True)
    is_human_corrected = Column(Boolean, default=False)

    document = relationship("Document", back_populates="fields")
    validation_issues = relationship("ValidationIssue", back_populates="field", cascade="all, delete-orphan")
    corrections = relationship("ReviewCorrection", back_populates="field", cascade="all, delete-orphan")

class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    field_id = Column(String, ForeignKey("extracted_fields.id"), nullable=True)
    issue_type = Column(String, nullable=False)  # MISSING_REQUIRED, INVALID_FORMAT, CONFLICT_DETECTED, ARITHMETIC_MISMATCH
    severity = Column(String, default="ERROR")  # ERROR, WARNING, INFO
    message = Column(Text, nullable=False)

    document = relationship("Document", back_populates="validation_issues")
    field = relationship("ExtractedField", back_populates="validation_issues")

class ReviewCorrection(Base):
    __tablename__ = "review_corrections"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    field_id = Column(String, ForeignKey("extracted_fields.id"), nullable=False)
    previous_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    reviewer_id = Column(String, default="reviewer_01")
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="corrections")
    field = relationship("ExtractedField", back_populates="corrections")
