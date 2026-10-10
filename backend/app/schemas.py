from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    status: str
    message: str
    document_id: str
    job_id: str
    filename: str
    actual_file_type: str = "PDF"
    is_image: bool = False
    uploaded_at: str

class ProcessingJobResponse(BaseModel):
    job_id: str
    document_id: str
    status: str
    current_stage: str
    progress_percent: int
    error_message: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

class ValidationIssueSchema(BaseModel):
    id: str
    field_id: Optional[str] = None
    issue_type: str
    severity: str
    message: str

class ExtractedFieldSchema(BaseModel):
    id: str
    field_key: str
    field_label: str
    extracted_value: Optional[str] = None
    confidence_score: float
    confidence_level: str
    validation_status: str
    evidence: Optional[Dict[str, Any]] = None
    page_number: int
    bbox: Optional[List[float]] = None
    raw_text: Optional[str] = None
    is_human_corrected: bool = False

class DocumentResultsResponse(BaseModel):
    document_id: str
    filename: str
    file_hash: Optional[str] = None
    actual_file_type: str = "PDF"
    doc_type: str
    doc_subtype: Optional[str] = None
    doc_type_label: str = "Unknown Document"
    classification_reason: Optional[str] = None
    classification_confidence: float = 0.0
    alternatives: Optional[List[Dict[str, Any]]] = None
    image_quality_score: float = 90.0
    quality_label: str = "High Quality Scan"
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    status: str
    created_at: str
    extracted_fields: List[ExtractedFieldSchema]
    validation_issues: List[ValidationIssueSchema]
    authenticity: Optional[Dict[str, Any]] = None

class DocumentListItem(BaseModel):
    id: str
    filename: str
    file_size_bytes: int
    file_hash: Optional[str] = None
    actual_file_type: str = "PDF"
    doc_type: str
    doc_subtype: Optional[str] = None
    doc_type_label: str = "Unknown Document"
    image_quality_score: float = 90.0
    quality_label: str = "High Quality Scan"
    status: str
    rejection_reason: Optional[str] = None
    created_at: str

class FieldCorrectionRequest(BaseModel):
    corrected_value: str
    reason: Optional[str] = "Manual Reviewer Correction"
    reviewer_id: Optional[str] = "reviewer_01"

class ReviewSubmitRequest(BaseModel):
    action: str  # APPROVE, REJECT
    notes: Optional[str] = None
    reviewer_id: Optional[str] = "reviewer_01"

class ReclassifyRequest(BaseModel):
    new_doc_type: str

class SchemaDefinition(BaseModel):
    document_type: str
    display_name: str
    fields: List[Dict[str, Any]]
