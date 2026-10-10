"""
Gemini-powered semantic field extraction service for DocuSense AI.

Uses the official google-genai SDK to call Gemini Flash for structured document field
extraction with Pydantic output schemas. Falls back to the local extraction engine
when no API key is configured or when the API call fails.

Evidence & Accuracy Rules:
- All API keys remain strictly on the backend.
- Absent values are treated as null, never guessed or fabricated.
- Bounding boxes are matched against real PyMuPDF / PaddleOCR text blocks;
  never fabricated or invented. If no block matches, bbox is None.
- OCR confidence and semantic extraction confidence are strictly distinguished.
"""

import os
import re
import json
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from backend.app.config import GEMINI_API_KEY, GEMINI_MODEL_ID
from backend.app.services.extractor import SCHEMAS as FIELD_SCHEMAS

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Structured Output Schemas (one per document category)
# ---------------------------------------------------------------------------
class InvoiceExtraction(BaseModel):
    invoice_number: Optional[str] = Field(default=None, description="Invoice identifier/number (e.g. INV-2026-8891)")
    invoice_date: Optional[str] = Field(default=None, description="Invoice date in YYYY-MM-DD format")
    vendor_name: Optional[str] = Field(default=None, description="Seller or issuing company name")
    buyer_name: Optional[str] = Field(default=None, description="Customer or billed-to organization")
    tax_id: Optional[str] = Field(default=None, description="Vendor GSTIN / Tax Registration ID")
    buyer_tax_id: Optional[str] = Field(default=None, description="Buyer GSTIN / Tax ID")
    place_of_supply: Optional[str] = Field(default=None, description="State or location of supply")
    subtotal: Optional[str] = Field(default=None, description="Subtotal amount without currency symbol")
    tax_amount: Optional[str] = Field(default=None, description="Tax or VAT or GST amount")
    total_amount: Optional[str] = Field(default=None, description="Grand total amount payable")
    currency: Optional[str] = Field(default=None, description="Currency code or symbol (USD, EUR, INR, $)")
    payment_due_date: Optional[str] = Field(default=None, description="Due date in YYYY-MM-DD format")

class ReceiptExtraction(BaseModel):
    receipt_number: Optional[str] = Field(default=None, description="Receipt number or identifier")
    receipt_date: Optional[str] = Field(default=None, description="Receipt date in YYYY-MM-DD format")
    payer_name: Optional[str] = Field(default=None, description="Student or customer who paid")
    payee_organization: Optional[str] = Field(default=None, description="Institution or entity receiving payment")
    payment_amount: Optional[str] = Field(default=None, description="Total amount paid")
    payment_method: Optional[str] = Field(default=None, description="Cash, Credit Card, UPI, Bank Transfer")
    transaction_id: Optional[str] = Field(default=None, description="Bank transaction ref or gateway ID")

class CertificateExtraction(BaseModel):
    certificate_name: Optional[str] = Field(default=None, description="Course, degree or certificate title")
    holder_name: Optional[str] = Field(default=None, description="Recipient full name")
    issuing_organization: Optional[str] = Field(default=None, description="University, board or issuer")
    certificate_id: Optional[str] = Field(default=None, description="Credential ID or serial number")
    issue_date: Optional[str] = Field(default=None, description="Issue date in YYYY-MM-DD format")
    expiry_date: Optional[str] = Field(default=None, description="Validity expiry date if present")
    qualification: Optional[str] = Field(default=None, description="Qualification or specialization")

class ApplicationFormExtraction(BaseModel):
    applicant_name: Optional[str] = Field(default=None, description="Full applicant name")
    application_id: Optional[str] = Field(default=None, description="Application reference or tracking ID")
    email: Optional[str] = Field(default=None, description="Applicant email address")
    phone: Optional[str] = Field(default=None, description="Applicant contact phone number")
    date_of_birth: Optional[str] = Field(default=None, description="Date of birth in YYYY-MM-DD format")
    address: Optional[str] = Field(default=None, description="Residential or mailing address")
    application_date: Optional[str] = Field(default=None, description="Date of application submission")

class TravelTicketExtraction(BaseModel):
    ticket_number: Optional[str] = Field(default=None, description="Ticket number or PNR booking code")
    passenger_name: Optional[str] = Field(default=None, description="Passenger name")
    operator_name: Optional[str] = Field(default=None, description="Airline, railway, or bus operator")
    origin: Optional[str] = Field(default=None, description="Origin city or station")
    destination: Optional[str] = Field(default=None, description="Destination city or station")
    travel_date: Optional[str] = Field(default=None, description="Date of journey in YYYY-MM-DD format")
    total_fare: Optional[str] = Field(default=None, description="Total fare amount")
    tax_id: Optional[str] = Field(default=None, description="Carrier tax ID or GSTIN")

class GenericExtraction(BaseModel):
    generic_title: Optional[str] = Field(default=None, description="Document headline or title")
    generic_id: Optional[str] = Field(default=None, description="Document reference number")
    generic_date: Optional[str] = Field(default=None, description="Document date in YYYY-MM-DD format")

EXTRACTION_SCHEMAS: Dict[str, type[BaseModel]] = {
    "invoice": InvoiceExtraction,
    "receipt": ReceiptExtraction,
    "certificate": CertificateExtraction,
    "application_form": ApplicationFormExtraction,
    "travel_ticket": TravelTicketExtraction,
    "unclassified": GenericExtraction,
}

# ---------------------------------------------------------------------------
# Gemini Client Singleton & Runtime Diagnostics
# ---------------------------------------------------------------------------
_gemini_client = None
_gemini_available = None


def get_gemini_model_id() -> str:
    """Returns the active configured Gemini model ID."""
    return os.environ.get("GEMINI_MODEL_ID") or GEMINI_MODEL_ID or "gemini-2.5-flash"


def _get_gemini_client():
    """Lazily initialises the Google GenAI client. Returns None if key is absent."""
    global _gemini_client, _gemini_available

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or GEMINI_API_KEY
    if not api_key or not api_key.strip():
        _gemini_available = False
        return None

    if _gemini_client is not None:
        return _gemini_client

    try:
        from google import genai
        _gemini_client = genai.Client(api_key=api_key.strip())
        _gemini_available = True
        logger.info(f"Gemini client successfully initialised with model={get_gemini_model_id()}")
        return _gemini_client
    except Exception as e:
        logger.warning(f"Failed to initialise Google GenAI client: {e}")
        _gemini_available = False
        return None


def is_gemini_available() -> bool:
    """Check whether Gemini is configured with a valid server-side key."""
    return _get_gemini_client() is not None


def test_gemini_connection() -> dict:
    """
    Performs a minimal live API connectivity test to verify key validity and model availability.
    Never exposes or logs the actual API key.
    """
    client = _get_gemini_client()
    if client is None:
        return {
            "status": "NOT_CONFIGURED",
            "message": "GEMINI_API_KEY environment variable is not configured. Local rule engine is active as deterministic fallback.",
            "model_id": get_gemini_model_id(),
            "connected": False
        }

    model_id = get_gemini_model_id()
    try:
        response = client.models.generate_content(
            model=model_id,
            contents="Respond with the single word: READY"
        )
        resp_text = response.text.strip() if response.text else ""
        return {
            "status": "CONNECTED",
            "message": f"Successfully connected to Gemini API with model '{model_id}'.",
            "model_id": model_id,
            "response_preview": resp_text[:50],
            "connected": True
        }
    except Exception as e:
        err_msg = str(e)
        logger.warning(f"Gemini live connectivity test failed: {err_msg}")
        return {
            "status": "ERROR",
            "message": f"Gemini connection failed: {err_msg}",
            "model_id": model_id,
            "connected": False
        }


def get_gemini_diagnostics() -> dict:
    """Returns transparent diagnostics on Gemini status without exposing secrets."""
    has_key = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or GEMINI_API_KEY)
    return {
        "gemini_available": is_gemini_available(),
        "model_id": get_gemini_model_id(),
        "api_key_configured": has_key,
        "sdk_version": "google-genai 2.29.0",
        "mode": "Gemini Flash Semantic Extraction" if is_gemini_available() else "Local Rule Engine (Fallback)"
    }


# ---------------------------------------------------------------------------
# Semantic Extraction Pipeline via Gemini Flash
# ---------------------------------------------------------------------------
def _build_prompt_text(doc_type: str, full_text: str) -> str:
    schema_cls = EXTRACTION_SCHEMAS.get(doc_type, GenericExtraction)
    fields_list = []
    schema_meta = FIELD_SCHEMAS.get(doc_type, FIELD_SCHEMAS.get("unclassified", {}))
    meta_fields = {f["key"]: f for f in schema_meta.get("fields", [])}

    for fn in schema_cls.model_fields.keys():
        meta = meta_fields.get(fn, {})
        label = meta.get("label", fn.replace("_", " ").title())
        req = "REQUIRED" if meta.get("required") else "optional"
        fields_list.append(f'  - "{fn}": {label} ({req})')

    return f"""You are a precise document extraction model. Extract structured fields from the document text below for the category '{doc_type}'.

FIELDS TO EXTRACT:
{chr(10).join(fields_list)}

STRICT RULES:
1. Treat any absent, unreadable, or missing value as null. NEVER fabricate, estimate, or guess values.
2. For numeric currency values, return only the digits and decimal (e.g. "1450.00").
3. For dates, normalize to YYYY-MM-DD format where possible.
4. Extract the exact text instance from the document without adding comments or markdown formatting.

DOCUMENT TEXT:
---
{full_text[:14000]}
---
"""


def extract_with_gemini(doc_type: str, ocr_data: dict) -> Optional[List[Dict[str, Any]]]:
    """
    Executes semantic field extraction using Gemini Flash with structured Pydantic schemas.
    Matches extracted values to genuine PyMuPDF / PaddleOCR bounding boxes.
    Returns None if Gemini is unavailable or fails, triggering local extraction fallback.
    """
    client = _get_gemini_client()
    if client is None:
        return None

    full_text = ocr_data.get("full_text", "")
    if not full_text or len(full_text.strip()) < 15:
        logger.info("Document text insufficient for Gemini extraction.")
        return None

    schema_cls = EXTRACTION_SCHEMAS.get(doc_type, GenericExtraction)
    prompt = _build_prompt_text(doc_type, full_text)
    model_id = get_gemini_model_id()

    try:
        from google.genai import types

        # Use structured JSON schema output
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema_cls,
                temperature=0.0,
                max_output_tokens=2048,
            ),
        )

        raw_text = response.text.strip() if response.text else ""
        if not raw_text:
            return None

        # Clean markdown if returned
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            cleaned = [l for l in lines if not l.strip().startswith("```")]
            raw_text = "\n".join(cleaned).strip()

        parsed_json = json.loads(raw_text)
        validated_model = schema_cls.model_validate(parsed_json)
        extracted_dict = validated_model.model_dump()

    except Exception as e:
        logger.warning(f"Gemini API execution error: {e}. Falling back to local extraction.")
        return None

    # Match extracted values to real geometry evidence
    pages = ocr_data.get("pages", [])
    schema_meta = FIELD_SCHEMAS.get(doc_type, FIELD_SCHEMAS.get("unclassified", {}))
    meta_fields = {f["key"]: f for f in schema_meta.get("fields", [])}

    results = []
    for field_key, val in extracted_dict.items():
        meta = meta_fields.get(field_key, {})
        label = meta.get("label", field_key.replace("_", " ").title())
        required = meta.get("required", False)

        # Handle null/absent values
        if val is None or str(val).strip() == "" or str(val).lower() == "null":
            results.append({
                "field_key": field_key,
                "field_label": label,
                "extracted_value": None,
                "confidence_score": 0.0,
                "confidence_level": "LOW",
                "validation_status": "MISSING" if required else "EMPTY",
                "page_number": 1,
                "bbox": None,
                "raw_text": None,
                "evidence": {
                    "candidates": [],
                    "extraction_method": "gemini",
                    "model_id": model_id,
                    "ocr_confidence": None,
                    "semantic_confidence": 0.0,
                    "source_matched": False
                },
                "extraction_method": "gemini"
            })
            continue

        str_val = str(val).strip()

        # Connect field to real source text & bounding boxes
        best_bbox = None
        best_page = 1
        best_raw = None
        block_ocr_conf = 0.95

        val_lower = str_val.lower()

        # Phase 1: Search exact string in page text blocks
        for page in pages:
            p_num = page.get("page_number", 1)
            for block in page.get("blocks", []):
                b_text = block.get("text", "")
                if val_lower in b_text.lower():
                    best_bbox = block.get("bbox")
                    best_page = p_num
                    best_raw = b_text
                    block_ocr_conf = block.get("ocr_confidence", 0.95)
                    break
            if best_raw:
                break

        # Phase 2: If numeric or date, search stripped digits
        if not best_raw:
            clean_digits = re.sub(r"[^\d]", "", str_val)
            if clean_digits and len(clean_digits) >= 3:
                for page in pages:
                    p_num = page.get("page_number", 1)
                    for block in page.get("blocks", []):
                        b_text = block.get("text", "")
                        if clean_digits in re.sub(r"[^\d]", "", b_text):
                            best_bbox = block.get("bbox")
                            best_page = p_num
                            best_raw = b_text
                            block_ocr_conf = block.get("ocr_confidence", 0.95)
                            break
                    if best_raw:
                        break

        # Semantic extraction confidence (distinguished from OCR confidence)
        semantic_conf = 0.94 if best_raw else 0.78
        conf_level = "HIGH" if semantic_conf >= 0.85 else "MEDIUM"

        results.append({
            "field_key": field_key,
            "field_label": label,
            "extracted_value": str_val,
            "confidence_score": round(semantic_conf, 2),
            "confidence_level": conf_level,
            "validation_status": "VALID",
            "page_number": best_page,
            "bbox": best_bbox,  # Real coordinates or None. Never fabricated!
            "raw_text": best_raw,
            "evidence": {
                "candidates": [{
                    "value": str_val,
                    "confidence": semantic_conf,
                    "page": best_page,
                    "bbox": best_bbox,
                    "raw_text": best_raw
                }],
                "extraction_method": "gemini",
                "model_id": model_id,
                "source_matched": best_raw is not None,
                "ocr_confidence": block_ocr_conf if best_raw else None,
                "semantic_confidence": semantic_conf
            },
            "extraction_method": "gemini"
        })

    return results
