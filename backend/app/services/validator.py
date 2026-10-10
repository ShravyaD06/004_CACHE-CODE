import re
from datetime import datetime

def validate_extracted_fields(doc_type: str, fields: list, classification_confidence: float = 0.80) -> tuple[list, list, str]:
    """
    Validates field format, required presence, email/phone regex, dates, and invoice math logic.
    Returns (validated_fields, validation_issues, overall_doc_status).
    """
    issues = []
    
    # State Machine rules:
    # 1. If document category is unclassified or confidence < 0.5 -> NEEDS_CLASSIFICATION_REVIEW
    # 2. If errors/conflicts or missing required fields exist -> NEEDS_REVIEW
    # 3. If processing finished cleanly -> READY_FOR_REVIEW
    
    if doc_type == "unclassified" or classification_confidence < 0.5:
        overall_status = "NEEDS_CLASSIFICATION_REVIEW"
        issues.append({
            "field_id": None,
            "field_key": None,
            "issue_type": "UNCERTAIN_CLASSIFICATION",
            "severity": "WARNING",
            "message": "Document category is unconfirmed. Review required to assign category and schema."
        })
    else:
        overall_status = "READY_FOR_REVIEW"

    field_map = {f["field_key"]: f for f in fields}

    for f in fields:
        key = f["field_key"]
        label = f["field_label"]
        val = f["extracted_value"]
        status = f["validation_status"]

        # 1. Missing or Empty Value Check
        if not val or str(val).strip() == "" or status in ("MISSING", "EMPTY"):
            if status == "MISSING":
                issues.append({
                    "field_id": None,
                    "field_key": key,
                    "issue_type": "MISSING_REQUIRED",
                    "severity": "ERROR",
                    "message": f"Required field '{label}' is missing from document."
                })
                if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                    overall_status = "NEEDS_REVIEW"
            else:
                f["validation_status"] = "EMPTY"
            continue

        # 2. Multi-location Conflict Check
        if status == "CONFLICT_DETECTED":
            issues.append({
                "field_id": None,
                "field_key": key,
                "issue_type": "CONFLICT_DETECTED",
                "severity": "WARNING",
                "message": f"Conflicting candidate values found for '{label}' in multiple document locations."
            })
            if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                overall_status = "NEEDS_REVIEW"

        # 3. Format Validation Checks
        if val:
            if "date" in key or key == "dob":
                parsed_date = parse_and_validate_date(val)
                if not parsed_date:
                    f["validation_status"] = "INVALID_FORMAT"
                    issues.append({
                        "field_id": None,
                        "field_key": key,
                        "issue_type": "INVALID_FORMAT",
                        "severity": "ERROR",
                        "message": f"Field '{label}' value '{val}' is not a valid date format."
                    })
                    if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                        overall_status = "NEEDS_REVIEW"
                else:
                    f["extracted_value"] = parsed_date  # Normalize date to YYYY-MM-DD

            elif key == "email":
                if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", val):
                    f["validation_status"] = "INVALID_FORMAT"
                    issues.append({
                        "field_id": None,
                        "field_key": key,
                        "issue_type": "INVALID_FORMAT",
                        "severity": "ERROR",
                        "message": f"Invalid email format: '{val}'"
                    })
                    if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                        overall_status = "NEEDS_REVIEW"

            elif key == "phone":
                clean_phone = re.sub(r"[^\d\+]", "", val)
                if len(clean_phone) < 7:
                    f["validation_status"] = "INVALID_FORMAT"
                    issues.append({
                        "field_id": None,
                        "field_key": key,
                        "issue_type": "INVALID_FORMAT",
                        "severity": "WARNING",
                        "message": f"Phone number '{val}' appears incomplete."
                    })
                    if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                        overall_status = "NEEDS_REVIEW"

    # 4. Cross-Field Invoice Arithmetic Math Check (Subtotal + Tax == Total)
    if doc_type == "invoice":
        subtotal_val = parse_float_currency(field_map.get("subtotal", {}).get("extracted_value"))
        tax_val = parse_float_currency(field_map.get("tax_amount", {}).get("extracted_value"))
        total_val = parse_float_currency(field_map.get("total_amount", {}).get("extracted_value"))

        if subtotal_val is not None and tax_val is not None and total_val is not None:
            expected_total = round(subtotal_val + tax_val, 2)
            if abs(expected_total - total_val) > 0.05:
                issues.append({
                    "field_id": None,
                    "field_key": "total_amount",
                    "issue_type": "ARITHMETIC_MISMATCH",
                    "severity": "WARNING",
                    "message": f"Arithmetic discrepancy: Subtotal (${subtotal_val:.2f}) + Tax (${tax_val:.2f}) = ${expected_total:.2f}, but Total Amount is ${total_val:.2f}."
                })
                if overall_status != "NEEDS_CLASSIFICATION_REVIEW":
                    overall_status = "NEEDS_REVIEW"

    return fields, issues, overall_status

def parse_and_validate_date(val_str: str) -> str:
    """Parses raw date string and returns normalized YYYY-MM-DD or None."""
    formats = [
        "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y",
        "%d %b %Y", "%d %B %Y", "%b %d, %Y", "%B %d, %Y"
    ]
    val_clean = val_str.strip()
    for fmt in formats:
        try:
            dt = datetime.strptime(val_clean, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def parse_float_currency(val_str: str) -> float:
    """Converts string currency like '$1,450.00' to float 1450.00."""
    if not val_str:
        return None
    try:
        clean = re.sub(r"[^\d\.]", "", val_str)
        return float(clean)
    except ValueError:
        return None
