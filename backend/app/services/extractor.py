import re
import json

SCHEMAS = {
    "invoice": {
        "document_type": "invoice",
        "display_name": "Vendor Invoice",
        "fields": [
            {"key": "invoice_number", "label": "Invoice Number", "type": "string", "required": True},
            {"key": "invoice_date", "label": "Invoice Date", "type": "date", "required": True},
            {"key": "vendor_name", "label": "Vendor Name", "type": "string", "required": True},
            {"key": "buyer_name", "label": "Buyer / Customer Name", "type": "string", "required": False},
            {"key": "tax_id", "label": "Vendor GSTIN / Tax ID", "type": "string", "required": False},
            {"key": "buyer_tax_id", "label": "Buyer GSTIN / Tax ID", "type": "string", "required": False},
            {"key": "place_of_supply", "label": "Place of Supply", "type": "string", "required": False},
            {"key": "subtotal", "label": "Subtotal", "type": "currency", "required": False},
            {"key": "tax_amount", "label": "Tax Amount", "type": "currency", "required": False},
            {"key": "total_amount", "label": "Total Amount", "type": "currency", "required": True},
            {"key": "currency", "label": "Currency", "type": "string", "required": False},
            {"key": "payment_due_date", "label": "Payment Due Date", "type": "date", "required": False}
        ]
    },
    "receipt": {
        "document_type": "receipt",
        "display_name": "Payment / Fee Receipt",
        "fields": [
            {"key": "receipt_number", "label": "Receipt / Receipt No.", "type": "string", "required": True},
            {"key": "receipt_date", "label": "Payment Date", "type": "date", "required": True},
            {"key": "payer_name", "label": "Payer / Student Name", "type": "string", "required": True},
            {"key": "payee_organization", "label": "Payee / University / Organization", "type": "string", "required": True},
            {"key": "payment_amount", "label": "Payment Amount", "type": "currency", "required": True},
            {"key": "payment_method", "label": "Payment Method", "type": "string", "required": False},
            {"key": "transaction_id", "label": "Transaction / Ref ID", "type": "string", "required": False}
        ]
    },
    "certificate": {
        "document_type": "certificate",
        "display_name": "Academic / Professional Certificate",
        "fields": [
            {"key": "certificate_name", "label": "Certificate Title / Subject", "type": "string", "required": True},
            {"key": "holder_name", "label": "Recipient / Holder Name", "type": "string", "required": True},
            {"key": "issuing_organization", "label": "Issuing Organization", "type": "string", "required": True},
            {"key": "certificate_id", "label": "Certificate / Registration ID", "type": "string", "required": False},
            {"key": "issue_date", "label": "Issue Date", "type": "date", "required": True},
            {"key": "expiry_date", "label": "Expiry Date", "type": "date", "required": False},
            {"key": "qualification", "label": "Qualification / Credential", "type": "string", "required": False}
        ]
    },
    "application_form": {
        "document_type": "application_form",
        "display_name": "Official Application Form",
        "fields": [
            {"key": "applicant_name", "label": "Applicant Full Name", "type": "string", "required": True},
            {"key": "application_id", "label": "Application / Reference ID", "type": "string", "required": True},
            {"key": "email", "label": "Email Address", "type": "email", "required": True},
            {"key": "phone", "label": "Phone Number", "type": "phone", "required": True},
            {"key": "date_of_birth", "label": "Date of Birth", "type": "date", "required": False},
            {"key": "address", "label": "Address", "type": "string", "required": False},
            {"key": "application_date", "label": "Application Date", "type": "date", "required": False}
        ]
    },
    "travel_ticket": {
        "document_type": "travel_ticket",
        "display_name": "Travel Ticket / Travel Invoice",
        "fields": [
            {"key": "ticket_number", "label": "Ticket / Booking Ref (PNR)", "type": "string", "required": True},
            {"key": "passenger_name", "label": "Passenger / Customer Name", "type": "string", "required": True},
            {"key": "operator_name", "label": "Operator / Airline / Carrier", "type": "string", "required": True},
            {"key": "origin", "label": "Origin / From", "type": "string", "required": False},
            {"key": "destination", "label": "Destination / To", "type": "string", "required": False},
            {"key": "travel_date", "label": "Travel Date", "type": "date", "required": True},
            {"key": "total_fare", "label": "Total Fare / Amount", "type": "currency", "required": True},
            {"key": "tax_id", "label": "Tax ID / GSTIN", "type": "string", "required": False}
        ]
    },
    "unclassified": {
        "document_type": "unclassified",
        "display_name": "Unknown Document",
        "fields": [
            {"key": "generic_title", "label": "Document Title / Subject", "type": "string", "required": False},
            {"key": "generic_id", "label": "Reference ID / Number", "type": "string", "required": False},
            {"key": "generic_date", "label": "Document Date", "type": "date", "required": False}
        ]
    }
}

def extract_fields_from_document(doc_type: str, ocr_data: dict, db_schema: dict = None) -> list:
    """
    Extracts structured fields matching doc_type schema from ocr_data blocks & text.
    Handles evidence tracking, bounding boxes, and multi-candidate conflict detection.
    """
    schema = db_schema or SCHEMAS.get(doc_type, SCHEMAS["unclassified"])
    full_text = ocr_data.get("full_text", "")
    pages = ocr_data.get("pages", [])

    extracted_results = []

    for field_def in schema["fields"]:
        key = field_def["key"]
        label = field_def.get("label", key.replace("_", " ").title())
        req = field_def.get("required", False)
        f_type = field_def.get("type", "string")

        candidates = find_candidates_for_field(key, f_type, pages, full_text)

        if not candidates:
            # Missing or unextracted field
            extracted_results.append({
                "field_key": key,
                "field_label": label,
                "extracted_value": None,
                "confidence_score": 0.0,
                "confidence_level": "LOW",
                "validation_status": "MISSING" if req else "EMPTY",
                "page_number": 1,
                "bbox": None,
                "raw_text": None,
                "evidence": {
                    "candidates": [],
                    "extraction_method": "local_rules",
                    "ocr_confidence": None,
                    "rule_confidence": 0.0
                },
                "extraction_method": "local_rules"
            })
        elif len(candidates) == 1:
            cand = candidates[0]
            extracted_results.append({
                "field_key": key,
                "field_label": label,
                "extracted_value": cand["value"],
                "confidence_score": cand["confidence"],
                "confidence_level": "HIGH" if cand["confidence"] > 0.85 else "MEDIUM",
                "validation_status": "VALID",
                "page_number": cand["page"],
                "bbox": cand["bbox"],
                "raw_text": cand["raw_text"],
                "evidence": {
                    "candidates": candidates,
                    "extraction_method": "local_rules",
                    "ocr_confidence": cand.get("ocr_confidence", 0.95),
                    "rule_confidence": cand["confidence"]
                },
                "extraction_method": "local_rules"
            })
        else:
            # Multi-location conflict! (Same field found multiple times with different values)
            primary = candidates[0]
            distinct_values = set(c["value"] for c in candidates)
            has_conflict = len(distinct_values) > 1

            extracted_results.append({
                "field_key": key,
                "field_label": label,
                "extracted_value": primary["value"],
                "confidence_score": primary["confidence"],
                "confidence_level": "MEDIUM" if has_conflict else "HIGH",
                "validation_status": "CONFLICT_DETECTED" if has_conflict else "VALID",
                "page_number": primary["page"],
                "bbox": primary["bbox"],
                "raw_text": primary["raw_text"],
                "evidence": {
                    "has_conflict": has_conflict,
                    "candidates": candidates,
                    "extraction_method": "local_rules",
                    "ocr_confidence": primary.get("ocr_confidence", 0.95),
                    "rule_confidence": primary["confidence"]
                },
                "extraction_method": "local_rules"
            })

    return extracted_results

def find_candidates_for_field(key: str, f_type: str, pages: list, full_text: str) -> list:
    candidates = []

    regex_patterns = {
        "invoice_number": [
            r"(?:invoice|inv|bill)\s*(?:no|num|\#|number|id|ref|code)[\.\:\s]+([A-Za-z0-9\-\/]{3,35})",
            r"(?:tax\s*invoice\s*no|tax\s*invoice\s*\#)[\.\:\s]+([A-Za-z0-9\-\/]{3,35})",
            r"\binvoice\s*no[:\s]+([A-Za-z0-9\-\/]{3,35})",
            r"\b(?:invoice\s*id|bill\s*no|bill\s*number)[:\s]+([A-Za-z0-9\-\/]{3,35})"
        ],
        "invoice_date": [
            r"(?:invoice\s*date|date)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})",
            r"(?:date)[:\s]*([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})"
        ],
        "vendor_name": [
            r"(?:vendor|supplier|from|seller|issuer)[:\s]*([A-Za-z0-9\s\,\.\&\-]{3,60})",
            r"^([A-Z][A-Za-z0-9\s\,\.]{3,45}\s+(?:Inc|LLC|Corp|Corporation|Solutions|Pvt|Ltd|Limited|Company|Co\.))"
        ],
        "buyer_name": [
            r"(?:bill\s*to|buyer|customer|client|billed\s*to|ship\s*to|recipient)[:\s]*([A-Za-z0-9\s\,\.\-]{3,60})"
        ],
        "tax_id": [
            r"(?:gstin|tin|vat\s*no|tax\s*id|registration\s*no|reg\s*no|tax\s*reg|seller\s*gstin)[:\s]*([A-Za-z0-9\-\/]{6,35})"
        ],
        "buyer_tax_id": [
            r"(?:buyer\s*gstin|customer\s*gstin|buyer\s*tin|billed\s*to\s*gstin)[:\s]*([A-Za-z0-9\-\/]{6,35})"
        ],
        "place_of_supply": [
            r"(?:place\s*of\s*supply|state\s*code|pos|supply\s*place)[:\s]*([A-Za-z0-9\s\,\.\-]{3,40})"
        ],
        "subtotal": [
            r"subtotal[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"sub\s*total[:\s]*\$?\s*([0-9\,\.\s]{2,12})"
        ],
        "tax_amount": [
            r"tax\s*amount[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"(?:tax|vat|gst)[:\s]*\$?\s*([0-9\,\.\s]{2,12})"
        ],
        "total_amount": [
            r"grand\s*total[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"total\s*amount[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"(?<!sub)(?<!sub\s)\btotal[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"amount\s*due[:\s]*\$?\s*([0-9\,\.\s]{2,12})"
        ],
        "currency": [
            r"(USD|EUR|GBP|INR|\$|\€|\£|\₹)"
        ],
        "payment_due_date": [
            r"(?:due\s*date|payment\s*due)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"
        ],
        "ticket_number": [
            r"(?:pnr|ticket\s*no|booking\s*ref|booking\s*id|ticket\s*number|ref\s*code)[:\s]*([A-Za-z0-9\-\/]{4,30})"
        ],
        "passenger_name": [
            r"(?:passenger\s*name|passenger|traveller\s*name|traveller|customer)[:\s]*([A-Za-z\s\,\.]{3,50})"
        ],
        "operator_name": [
            r"(?:operator|carrier|airline|bus\s*operator|travel\s*agency|issuer)[:\s]*([A-Za-z0-9\s\,\.]{3,50})"
        ],
        "origin": [
            r"(?:from|origin|departure\s*from|from\s*station)[:\s]*([A-Za-z0-9\s\,\.\(\)\-]{3,40})"
        ],
        "destination": [
            r"(?:to|destination|arrival\s*at|to\s*station)[:\s]*([A-Za-z0-9\s\,\.\(\)\-]{3,40})"
        ],
        "travel_date": [
            r"(?:travel\s*date|flight\s*date|departure\s*date|journey\s*date|date\s*of\s*travel)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})"
        ],
        "total_fare": [
            r"(?:total\s*fare|fare\s*amount|total\s*amount|total\s*paid)[:\s]*\$?\s*([0-9\,\.\s]{2,12})"
        ],
        "receipt_number": [
            r"(?:receipt\s*no|receipt\s*\#|receipt\s*number|rec\s*no)[:\s]*([A-Za-z0-9\-\/]{3,30})",
            r"receipt[:\s]*([A-Za-z0-9\-\/]{3,30})"
        ],
        "receipt_date": [
            r"(?:receipt\s*date|payment\s*date|date)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})",
            r"(?:date)[:\s]*([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})"
        ],
        "payer_name": [
            r"(?:received\s*from|student\s*name|payer\s*name|name)[:\s]*([A-Za-z\s\.\']{3,50})"
        ],
        "payee_organization": [
            r"(?:payee|institution|university|organization|to)[:\s]*([A-Za-z0-9\s\.\,\&]{3,50})",
            r"([A-Z][A-Za-z0-9\s]{3,35}\s+(?:University|Institute|Academy|College|Bank))"
        ],
        "payment_amount": [
            r"(?:amount\s*paid|paid\s*amount|fee\s*amount|total\s*paid|amount)[:\s]*\$?\s*([0-9\,\.\s]{2,12})",
            r"rs\.?\s*([0-9\,\.\s]{2,12})"
        ],
        "payment_method": [
            r"(?:mode\s*of\s*payment|payment\s*method|paid\s*via)[:\s]*([A-Za-z\s]{3,20})"
        ],
        "transaction_id": [
            r"(?:transaction\s*id|tx\s*id|ref\s*id|payment\s*ref)[:\s]*([A-Za-z0-9\-]{4,30})"
        ],
        "holder_name": [
            r"(?:awarded\s*certificate\s*to|certify\s*that|presented\s*to|this\s*is\s*to\s*certify\s*that)[\s\:\n]+([A-Za-z\.\'\s]{3,40}?)(?:\n|has\s|who\s|is\s|\Z)",
            r"(?:holder\s*name|candidate\s*name|recipient)[:\s]*([A-Za-z\s\.\']{3,50})",
            r"(?:name)[:\s]*([A-Za-z\s\.\']{3,50})"
        ],
        "certificate_name": [
            r"(?:completed\s+the\s+(?:advanced\s+)?course\s+in|advanced\s+course\s+in)[\s\:\n]+([A-Za-z0-9\s\,\&\-]{3,60}?)(?:\n|\Z)",
            r"(?:certificate\s+of|degree\s+of)[\s\:\n]+([A-Za-z0-9\s\,\&\-]{3,60}?)(?:\n|\Z)",
            r"(?:course|title)[:\s]*([A-Za-z0-9\s]{3,50})"
        ],
        "issuing_organization": [
            r"(?:issued\ by|institution|university|organization)[:\s]*([A-Za-z0-9\s]{3,50})",
            r"([A-Z][A-Za-z0-9\s]{3,35}\s+(?:University|Institute|Academy|Board))"
        ],
        "issue_date": [
            r"(?:issue\ date|date\ of\ issue|date)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})",
            r"(?:date)[:\s]*([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})"
        ],
        "expiry_date": [
            r"(?:expiry\ date|valid\ until|expires)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"
        ],
        "certificate_id": [
            r"(?:credential\ id|serial\ no|cert\ id)[:\s]*([A-Za-z0-9\-]{4,30})"
        ],
        "qualification": [
            r"(?:qualification|subject|specialization)[:\s]*([A-Za-z0-9\s]{3,40})"
        ],
        "applicant_name": [
            r"(?:applicant\ name|full\ name|name)[:\s]*([A-Za-z\s]{3,40})"
        ],
        "email": [
            r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"
        ],
        "phone": [
            r"(?:phone|mobile|contact)[:\s]*(\+?[0-9\s\-\(\)]{7,15})",
            r"(\+?[0-9]{1,3}[\s\-]?[0-9]{8,12})"
        ],
        "application_id": [
            r"(?:application\ id|app\ ref|ref\ no)[:\s]*([A-Za-z0-9\-]{4,30})"
        ],
        "date_of_birth": [
            r"(?:date\ of\ birth|dob)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"
        ],
        "address": [
            r"(?:address|residential\ address)[:\s]*([A-Za-z0-9\s\,\.]{5,60})"
        ],
        "application_date": [
            r"(?:application\ date|applied\ on|date)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"
        ],
        "generic_title": [
            r"(?:subject|title|re)[:\s]*([A-Za-z0-9\s]{3,50})"
        ],
        "generic_id": [
            r"(?:ref|id|no)[:\s]*([A-Za-z0-9\-]{4,30})"
        ],
        "generic_date": [
            r"(?:date)[:\s]*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"
        ]
    }

    patterns = regex_patterns.get(key, [r"(?:" + key.replace("_", r"\s*") + r")[:\s]*([A-Za-z0-9\s\,\.\-]{2,40})"])

    # Search through page blocks for coordinates
    for page in pages:
        p_num = page["page_number"]
        for block in page["blocks"]:
            text = block["text"]
            bbox = block["bbox"]

            for pat in patterns:
                matches = re.findall(pat, text, re.IGNORECASE)
                for val in matches:
                    clean_val = val.strip().strip(":").strip()
                    if clean_val and len(clean_val) > 1:
                        candidates.append({
                            "value": clean_val,
                            "confidence": 0.90 if len(candidates) == 0 else 0.75,
                            "page": p_num,
                            "bbox": bbox,
                            "raw_text": text,
                            "ocr_confidence": block.get("ocr_confidence", 0.95)
                        })

    # If no candidate found in block search, try full text search
    if not candidates:
        for pat in patterns:
            matches = re.findall(pat, full_text, re.IGNORECASE)
            for val in matches:
                clean_val = val.strip().strip(":").strip()
                if "\n" in clean_val and f_type != "text":
                    clean_val = clean_val.split("\n")[0].strip()
                if clean_val:
                    # Search page blocks for exact or substring match to find real bbox
                    matched_bbox = None
                    matched_page = 1
                    matched_raw = None
                    matched_ocr_conf = None
                    for page in pages:
                        p_n = page.get("page_number", 1)
                        for block in page.get("blocks", []):
                            b_text = block.get("text", "")
                            if clean_val.lower() in b_text.lower() or (len(b_text) > 3 and b_text.lower() in clean_val.lower()):
                                matched_bbox = block.get("bbox")
                                matched_page = p_n
                                matched_raw = b_text
                                matched_ocr_conf = block.get("ocr_confidence", 0.95)
                                break
                        if matched_raw:
                            break

                    candidates.append({
                        "value": clean_val,
                        "confidence": 0.82 if matched_raw else 0.70,
                        "page": matched_page,
                        "bbox": matched_bbox,
                        "raw_text": matched_raw or f"Matched from document text: '{clean_val}'",
                        "ocr_confidence": matched_ocr_conf
                    })

    return candidates
