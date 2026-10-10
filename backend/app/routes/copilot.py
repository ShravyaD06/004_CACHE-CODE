import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Document, ExtractedField, ValidationIssue, ReviewCorrection
from backend.app.services.extractor import SCHEMAS
from backend.app.services.gemini_extractor import is_gemini_available, get_gemini_model_id

HUMAN_LABELS = {
    "CONFLICT_DETECTED": "Conflicting values detected",
    "NEEDS_REVIEW": "Needs review",
    "NEEDS_CLASSIFICATION_REVIEW": "Requires category review",
    "READY_FOR_REVIEW": "Ready for review",
    "VALID": "Valid",
    "MISSING": "Missing required information",
    "VALIDATED_BY_HUMAN": "Human verified",
    "INVALID_FORMAT": "Invalid format",
    "ARITHMETIC_MISMATCH": "Arithmetic discrepancy",
    "DUPLICATE_UPLOAD_WARNING": "Probable duplicate upload",
    "APPROVED": "Approved",
    "REJECTED": "Rejected",
    "FAILED": "Processing failed"
}

def humanize_enum(enum_val: str) -> str:
    if not enum_val:
        return ""
    return HUMAN_LABELS.get(enum_val, enum_val.replace("_", " ").title())

router = APIRouter(prefix="/api/documents", tags=["Copilot"])

class CopilotRequest(BaseModel):
    action: str
    prompt: Optional[str] = None

class CopilotResponse(BaseModel):
    action: str
    mode: str = "Local rule-based assistance"
    title: str
    markdown_content: str
    structured_data: Optional[dict] = None
    suggestions: list[str]

@router.post("/{document_id}/copilot", response_model=CopilotResponse)
def get_copilot_insights(
    document_id: str,
    payload: CopilotRequest,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    issues = db.query(ValidationIssue).filter(ValidationIssue.document_id == document_id).all()
    corrections = db.query(ReviewCorrection).filter(ReviewCorrection.document_id == document_id).order_by(ReviewCorrection.created_at.desc()).all()

    action = payload.action.lower()

    if action == "explain_classification":
        return build_explain_classification(doc)
    elif action == "explain_validation_errors":
        return build_explain_validation_errors(doc, issues)
    elif action == "find_missing_fields":
        return build_find_missing_fields(doc, fields)
    elif action == "summarize_extracted_information":
        return build_summarize_extracted_information(doc, fields)
    elif action == "suggest_schema":
        return build_suggest_schema(doc, fields)
    elif action == "explain_conflicting_values":
        return build_explain_conflicting_values(doc, fields)
    elif action in ("explain_corrections", "audit_corrections"):
        return build_explain_corrections(doc, corrections)
    else:
        return build_custom_assistant_response(doc, fields, issues, corrections, payload.prompt or payload.action)

def build_explain_classification(doc: Document) -> CopilotResponse:
    confidence_pct = int((doc.classification_confidence or 0.0) * 100)
    reason = doc.classification_reason or "Keywords and text patterns matched expected format."
    alternatives = json.loads(doc.alternatives_json) if doc.alternatives_json else []

    alt_text = ""
    if alternatives:
        alt_items = [f"- **{a.get('label', a.get('type'))}**: score {a.get('score', 0)}" for a in alternatives]
        alt_text = "\n\n**Secondary Candidates Considered:**\n" + "\n".join(alt_items)

    md = f"""### Classification Analysis
**Assigned Category:** `{doc.doc_type_label}` (Subtype: `{doc.doc_subtype or 'standard'}`)
**Confidence Rating:** `{confidence_pct}%`

#### Rationale & Evidence:
{reason}

{alt_text}

> **Note:** If this classification is inaccurate, use the **Reclassify** dropdown in the canvas toolbar to reassign the document category and rerun schema extraction."""

    return CopilotResponse(
        action="explain_classification",
        title="Classification Explanation",
        markdown_content=md,
        suggestions=["Explain validation errors", "Summarize extracted information", "Find missing fields"]
    )

def build_explain_validation_errors(doc: Document, issues: list[ValidationIssue]) -> CopilotResponse:
    if not issues:
        md = f"### Validation Status: All Clean\nNo validation errors or warnings were detected for **{doc.filename}**."
        return CopilotResponse(
            action="explain_validation_errors",
            title="Validation Error Analysis",
            markdown_content=md,
            structured_data={"issues": []},
            suggestions=["Summarize extracted information", "Suggest a suitable schema"]
        )

    errors = [i for i in issues if i.severity == "ERROR"]
    warnings = [i for i in issues if i.severity != "ERROR"]

    md = f"### Integrity Engine Analysis for {doc.filename}\n"
    md += f"Total issues detected: **{len(issues)}** ({len(errors)} Blocking Errors, {len(warnings)} Warnings)\n\n"

    if errors:
        md += "#### 🚫 Blocking Errors (Requires Fix Before Approval):\n"
        for idx, e in enumerate(errors, 1):
            md += f"{idx}. **{humanize_enum(e.issue_type)}**: {e.message}\n"
        md += "\n"

    if warnings:
        md += "#### ⚠️ Non-Blocking Warnings:\n"
        for idx, w in enumerate(warnings, 1):
            md += f"{idx}. **{humanize_enum(w.issue_type)}**: {w.message}\n"
        md += "\n"

    md += "> **Action Required:** Click on any highlighted field input on the review canvas to edit and correct invalid or missing values."

    structured_issues = [
        {
            "id": i.id,
            "issue_type": i.issue_type,
            "issue_type_label": humanize_enum(i.issue_type),
            "severity": i.severity,
            "message": i.message
        }
        for i in issues
    ]

    return CopilotResponse(
        action="explain_validation_errors",
        title="Validation Error Explanation",
        markdown_content=md,
        structured_data={"issues": structured_issues},
        suggestions=["Find missing fields", "Explain conflicting values", "Summarize extracted information"]
    )

def build_find_missing_fields(doc: Document, fields: list[ExtractedField]) -> CopilotResponse:
    schema = SCHEMAS.get(doc.doc_type, SCHEMAS["unclassified"])
    schema_fields = schema.get("fields", [])
    
    extracted_keys = {f.field_key: f for f in fields if f.extracted_value}
    missing_required = []
    missing_optional = []

    for sf in schema_fields:
        k = sf["key"]
        label = sf.get("label", k)
        is_req = sf.get("required", False)
        if k not in extracted_keys:
            if is_req:
                missing_required.append(label)
            else:
                missing_optional.append(label)

    md = f"### Missing Field Audit for {doc.doc_type_label}\n"
    if missing_required:
        md += "#### ❌ Missing Required Fields:\n"
        for item in missing_required:
            md += f"- **{item}** (Required by schema rules)\n"
        md += "\n"
    else:
        md += "✅ **All required schema fields are present.**\n\n"

    if missing_optional:
        md += "#### ℹ️ Missing Optional Fields:\n"
        for item in missing_optional:
            md += f"- {item}\n"
    
    return CopilotResponse(
        action="find_missing_fields",
        title="Missing Field Audit",
        markdown_content=md,
        structured_data={"missing_required": missing_required, "missing_optional": missing_optional},
        suggestions=["Explain validation errors", "Summarize extracted information"]
    )

def build_summarize_extracted_information(doc: Document, fields: list[ExtractedField]) -> CopilotResponse:
    if not fields:
        md = "No extracted fields found for this document."
        structured_fields = []
    else:
        md = f"### Extracted Data Summary — {doc.filename}\n"
        md += f"**Category:** {doc.doc_type_label} | **Status:** `{humanize_enum(doc.status)}`\n\n"
        md += "| Field Name | Extracted Value | Status | Confidence | Page |\n"
        md += "| :--- | :--- | :--- | :--- | :--- |\n"

        structured_fields = []
        for f in fields:
            val = f.extracted_value if f.extracted_value else "Not Found"
            status_label = humanize_enum(f.validation_status)
            conf_pct = f"{int(f.confidence_score * 100)}%"
            md += f"| **{f.field_label}** | `{val}` | `{status_label}` | {conf_pct} | Page {f.page_number} |\n"
            structured_fields.append({
                "field_key": f.field_key,
                "field_label": f.field_label,
                "extracted_value": f.extracted_value,
                "validation_status": f.validation_status,
                "validation_status_label": status_label,
                "confidence_score": f.confidence_score,
                "confidence_level": f.confidence_level,
                "page_number": f.page_number
            })

    return CopilotResponse(
        action="summarize_extracted_information",
        title="Extracted Data Summary",
        markdown_content=md,
        structured_data={"fields": structured_fields},
        suggestions=["Explain validation errors", "Suggest a suitable schema"]
    )

def build_suggest_schema(doc: Document, fields: list[ExtractedField]) -> CopilotResponse:
    curr_schema = SCHEMAS.get(doc.doc_type, SCHEMAS["unclassified"])
    field_list = curr_schema.get("fields", [])

    md = f"### Schema Recommendation for `{doc.doc_type_label}`\n"
    md += f"The active target schema is **{curr_schema.get('display_name')}** containing **{len(field_list)}** configured fields.\n\n"
    md += "#### Recommended Field Definitions:\n"

    for f in field_list:
        req_str = "Required" if f.get("required") else "Optional"
        md += f"- **{f.get('label')}** (`{f.get('key')}`): Type `{f.get('type')}`, {req_str}\n"

    md += "\n> **Configuration Note:** Additional custom fields or validation regexes can be configured via the **Schemas** management tab."

    return CopilotResponse(
        action="suggest_schema",
        title="Schema Recommendation",
        markdown_content=md,
        suggestions=["Find missing fields", "Summarize extracted information"]
    )

def build_explain_conflicting_values(doc: Document, fields: list[ExtractedField]) -> CopilotResponse:
    conflict_fields = []
    for f in fields:
        evidence = json.loads(f.evidence_json) if f.evidence_json else {}
        if f.validation_status == "CONFLICT_DETECTED" or evidence.get("has_conflict"):
            conflict_fields.append((f, evidence))

    if not conflict_fields:
        md = "### Conflict Analysis\nNo conflicting candidate values detected across document text blocks."
        return CopilotResponse(
            action="explain_conflicting_values",
            title="Conflicting Value Analysis",
            markdown_content=md,
            suggestions=["Explain validation errors", "Summarize extracted information"]
        )

    md = f"### Conflicting Value Analysis ({len(conflict_fields)} Field(s))\n"
    for f, ev in conflict_fields:
        md += f"#### Field: `{f.field_label}`\n"
        md += f"Primary Selected Value: `{f.extracted_value}` (Page {f.page_number})\n\n"
        cands = ev.get("candidates", [])
        if cands:
            md += "**Candidate Source Evidence Found:**\n"
            for idx, c in enumerate(cands, 1):
                md += f"{idx}. Value: `{c.get('value')}` | Page {c.get('page')} | Snippet: *\"{c.get('raw_text')}\"*\n"
        md += "\n"

    return CopilotResponse(
        action="explain_conflicting_values",
        title="Conflicting Value Explanation",
        markdown_content=md,
        suggestions=["Find missing fields", "Explain validation errors", "Audit human corrections"]
    )

def build_explain_corrections(doc: Document, corrections: list[ReviewCorrection]) -> CopilotResponse:
    if not corrections:
        md = f"### Human Correction Audit Trail\nNo manual field corrections have been submitted for **{doc.filename}**.\n\nAll currently displayed field values originate directly from automated pipeline extraction."
        return CopilotResponse(
            action="explain_corrections",
            title="Correction History Audit",
            markdown_content=md,
            structured_data={"corrections_count": 0},
            suggestions=["Summarize extracted information", "Explain validation errors"]
        )

    md = f"### Human Correction Audit Trail ({len(corrections)} Correction(s))\n"
    md += f"The following fields were manually modified during human review for **{doc.filename}**:\n\n"
    md += "| Field Key | Previous Value | Corrected Value | Reason | Reviewer | Timestamp |\n"
    md += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"

    structured_list = []
    for c in corrections:
        field_key = getattr(c.field, "field_key", c.field_id) if c.field else c.field_id
        prev = f"`{c.previous_value}`" if c.previous_value else "*[empty]*"
        curr = f"`{c.corrected_value}`"
        reason = c.reason or "Manual reviewer correction"
        time_str = c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "N/A"
        md += f"| **{field_key}** | {prev} | {curr} | {reason} | `{c.reviewer_id}` | {time_str} |\n"
        structured_list.append({
            "field_id": c.field_id,
            "field_key": field_key,
            "previous_value": c.previous_value,
            "corrected_value": c.corrected_value,
            "reason": c.reason,
            "reviewer_id": c.reviewer_id,
            "created_at": time_str
        })

    md += "\n> **Audit Note:** Human-corrected fields have status `VALIDATED_BY_HUMAN` and cannot be automatically overridden."

    return CopilotResponse(
        action="explain_corrections",
        title="Human Correction Audit",
        markdown_content=md,
        structured_data={"corrections": structured_list},
        suggestions=["Summarize extracted information", "Explain validation errors"]
    )

def build_custom_assistant_response(doc: Document, fields: list[ExtractedField], issues: list[ValidationIssue], corrections: list[ReviewCorrection], prompt: str) -> CopilotResponse:
    p_lower = prompt.lower()
    if "correct" in p_lower or "audit" in p_lower or "history" in p_lower:
        return build_explain_corrections(doc, corrections)
    elif "classif" in p_lower:
        return build_explain_classification(doc)
    elif "error" in p_lower or "validat" in p_lower or "warn" in p_lower:
        return build_explain_validation_errors(doc, issues)
    elif "miss" in p_lower:
        return build_find_missing_fields(doc, fields)
    elif "conflict" in p_lower:
        return build_explain_conflicting_values(doc, fields)
    elif "schema" in p_lower:
        return build_suggest_schema(doc, fields)

    # If Gemini Flash is available, use real document data to answer custom user questions
    if is_gemini_available():
        try:
            from google import genai
            from backend.app.config import GEMINI_API_KEY
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            # Format actual document context
            context_fields = [{"key": f.field_key, "value": f.extracted_value, "status": f.validation_status} for f in fields]
            context_issues = [{"type": i.issue_type, "message": i.message} for i in issues]
            context_corrections = [{"field_id": c.field_id, "prev": c.previous_value, "curr": c.corrected_value} for c in corrections]
            
            context_str = f"""Document Filename: {doc.filename}
Document Category: {doc.doc_type_label} (Confidence: {int((doc.classification_confidence or 0.0) * 100)}%)
Extracted Fields: {json.dumps(context_fields)}
Validation Issues: {json.dumps(context_issues)}
Human Corrections: {json.dumps(context_corrections)}
"""
            llm_prompt = f"""You are DocuSense Copilot. Answer the user prompt based STRICTLY on the actual document context below.
Do not invent or fabricate facts.

CONTEXT:
{context_str}

USER PROMPT:
{prompt}

Provide a concise, helpful Markdown response."""

            response = client.models.generate_content(
                model=get_gemini_model_id(),
                contents=llm_prompt
            )
            if response.text:
                return CopilotResponse(
                    action="custom_query",
                    mode=f"Gemini Flash ({get_gemini_model_id()})",
                    title="DocuSense Intelligence",
                    markdown_content=response.text.strip(),
                    suggestions=["Summarize extracted information", "Audit human corrections", "Explain validation errors"]
                )
        except Exception:
            pass

    return build_summarize_extracted_information(doc, fields)
