export interface CandidateEvidence {
  value: string;
  confidence: number;
  page: number;
  bbox: [number, number, number, number];
  raw_text: string;
}

export interface ExtractedField {
  id: string;
  field_key: string;
  field_label: string;
  extracted_value: string | null;
  confidence_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  validation_status: 'VALID' | 'INVALID_FORMAT' | 'MISSING' | 'CONFLICT_DETECTED' | 'VALIDATED_BY_HUMAN';
  evidence?: {
    has_conflict?: boolean;
    candidates?: CandidateEvidence[];
    extraction_method?: string;
  };
  page_number: number;
  bbox: [number, number, number, number];
  raw_text?: string;
  is_human_corrected: boolean;
}

export interface ValidationIssue {
  id: string;
  field_id?: string;
  issue_type: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_size_bytes: number;
  file_hash?: string | null;
  actual_file_type?: string;
  doc_type: string;
  doc_subtype?: string | null;
  doc_type_label?: string;
  image_quality_score?: number;
  quality_label?: string;
  status: 'UPLOADED' | 'PROCESSING' | 'CLASSIFIED' | 'EXTRACTING' | 'VALIDATING' | 'NEEDS_CLASSIFICATION_REVIEW' | 'NEEDS_REVIEW' | 'READY_FOR_REVIEW' | 'REQUIRES_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED' | string;
  rejection_reason?: string | null;
  created_at: string;
}

export interface ClassificationAlternative {
  type: string;
  label: string;
  score: number;
}

export interface AuthenticitySignal {
  id: string;
  category: 'metadata' | 'visual' | 'linguistics' | 'arithmetic';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  evidence?: string;
}

export interface AuthenticityReport {
  authenticity_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  verdict: string;
  signals: AuthenticitySignal[];
  metadata_provenance?: {
    producer?: string;
    creator?: string;
    has_exif?: boolean;
    camera_model?: string;
  };
  linguistic_metrics?: {
    burstiness_score?: number;
    vocabulary_richness?: number;
    is_suspiciously_uniform?: boolean;
  };
}

export interface DocumentResults {
  document_id: string;
  filename: string;
  file_hash?: string | null;
  actual_file_type?: string;
  doc_type: string;
  doc_subtype?: string | null;
  doc_type_label?: string;
  classification_reason?: string | null;
  classification_confidence?: number;
  alternatives?: ClassificationAlternative[];
  image_quality_score?: number;
  quality_label?: string;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  status: string;
  created_at: string;
  extracted_fields: ExtractedField[];
  validation_issues: ValidationIssue[];
  authenticity?: AuthenticityReport;
}

export interface ProcessingJobStatus {
  job_id: string;
  document_id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  current_stage: 'QUEUED' | 'UPLOADED' | 'UPLOADING' | 'ANALYSING' | 'CLASSIFIED' | 'EXTRACTING' | 'VALIDATING' | 'FINISHED';
  progress_percent: number;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface SchemaField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

export interface ExtractionSchema {
  document_type: string;
  display_name: string;
  fields: SchemaField[];
}

export interface CopilotResponse {
  action: string;
  mode: string;
  title: string;
  markdown_content: string;
  structured_data?: any;
  suggestions: string[];
}
