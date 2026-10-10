"""
Document Classification Service for DocuSense AI.

Classification Targets:
- 'invoice': Vendor Invoice / Tax Invoice
- 'receipt': Payment / Tuition Fee Receipt
- 'certificate': Academic / Professional Certificate
- 'application_form': Official Membership / Service Application
- 'travel_ticket': Travel Ticket / Boarding Pass / Travel Invoice
- 'unclassified': Unknown / Needs Review

Architecture:
1. Genuine Machine Learning model: TF-IDF vectorizer + Multinomial Naive Bayes
   classifier trained on characteristic multi-domain document corpora.
2. Keyword rules engine: Used as transparent fallback when ML confidence is marginal
   or for offline edge cases.
3. Transparent provenance: Explicitly labels whether classification was performed by
   'ml_model', 'keyword_rules_fallback', or 'manual_override'.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Training corpus for genuine Scikit-Learn TF-IDF classification model
# ---------------------------------------------------------------------------
_TRAINING_CORPUS = [
    # INVOICE
    ("tax invoice acme cloud solutions inc 100 tech park way suite 400 invoice no inv 2026 8891 date 2026 09 28 bill to enterprise operations dept item description qty amount cloud hosting infrastructure monthly subtotal 1200 00 tax amount 250 00 grand total 1450 00", "invoice"),
    ("commercial invoice bill to customer name gstin tax id place of supply payment due date subtotal sales tax vat balance due net amount remitted remittance terms", "invoice"),
    ("invoice vendor supplier billed to shipping address line items unit price total amount due discount gstin tin hsn sac code rate of tax total value payable", "invoice"),
    ("proforma invoice services rendered consulting fee invoice number po number payment terms wire transfer net 30 due upon receipt total payable usd", "invoice"),
    ("tax invoice supply of software services vendor gstin buyer gstin place of supply reverse charge invoice ref invoice date sub total igst cgst sgst total invoice value", "invoice"),
    
    # RECEIPT
    ("payment receipt official fee receipt tuition fee received with thanks from student name roll no transaction id payment mode online bank ref fee amount paid balance zero", "receipt"),
    ("cash receipt payment acknowledgment received from payer sum of dollars for registration fee payment method credit card authorization code terminal id thank you", "receipt"),
    ("challan fee receipt university of science tuition deposit examination fee semester charges bank transaction reference payment date amount paid in full cashier signature", "receipt"),
    ("donation receipt charitable trust payment received acknowledgment tax exempt section 80g receipt number payment voucher amount received", "receipt"),
    ("store sales receipt retail customer purchase pos register transaction number payment method card cash total paid change given cashier merchant copy", "receipt"),

    # CERTIFICATE
    ("certificate of completion this is to certify that alex m mercer has successfully completed the advanced course in artificial intelligence and machine learning issued by sapthagiri nps university issue date credential id cert ai 2026", "certificate"),
    ("degree certificate this is to certify that student has fulfilled all requirements for the degree of bachelor of engineering computer science with honors university senate convocation date registrar chancellor", "certificate"),
    ("certificate of excellence awarded to recipient in recognition of outstanding performance and dedication during the annual conference board of directors authorized signatory", "certificate"),
    ("professional certificate qualification accredited program completion verification credential identifier valid from valid until authorized training partner", "certificate"),
    ("certificate of achievement hereby presented to for successfully mastering data science foundation awarded on by executive director seal of certification", "certificate"),

    # APPLICATION FORM
    ("official membership application form application ref no app 2026 5541 applicant name sarah jenkins email address sarah jenkins contact phone department data analytics passport number date of birth address", "application_form"),
    ("job employment application form candidate full name personal details education history previous employment experience resume attached emergency contact signature of applicant applied date", "application_form"),
    ("university admission application form student bio data father name mother name date of birth high school gpa course applied for declaration signed by candidate application fee paid ref", "application_form"),
    ("passport renewal application form applicant information residential address permanent address contact mobile email national identity number declaration date", "application_form"),
    ("loan credit application form applicant details gross monthly income employer name residential status marital status requested loan amount application reference number", "application_form"),

    # TRAVEL TICKET
    ("electronic ticket passenger itinerary receipt booking reference pnr airline flight departure terminal gate arrival seat class baggage allowance operator name travel date", "travel_ticket"),
    ("train ticket booking confirmation pnr number passenger name coach seat berth status origin station destination station journey date train number arrival time total fare irctc", "travel_ticket"),
    ("bus travel ticket boarding pass operator travels from city to city boarding point drop point seat no bus type departure time passenger details ticket price", "travel_ticket"),
    ("airline boarding pass passenger name flight no origin destination boarding time gate seat booking ref pnr sequence carrier travel date ticket number", "travel_ticket"),
    ("ferry voyage ticket passenger reservation departure port arrival port booking voucher operator vessel embarkation time passenger fare inclusive of port taxes", "travel_ticket"),
]

# ---------------------------------------------------------------------------
# Initialise ML Pipeline
# ---------------------------------------------------------------------------
_ml_pipeline = None


def _get_or_train_classifier():
    """Builds and fits the genuine Scikit-Learn TF-IDF classifier on first call."""
    global _ml_pipeline
    if _ml_pipeline is not None:
        return _ml_pipeline

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        from sklearn.pipeline import Pipeline

        texts = [item[0] for item in _TRAINING_CORPUS]
        labels = [item[1] for item in _TRAINING_CORPUS]

        _ml_pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
            ("clf", MultinomialNB(alpha=0.1))
        ])
        _ml_pipeline.fit(texts, labels)
        logger.info("Scikit-Learn TF-IDF Document Classifier successfully fitted and ready.")
        return _ml_pipeline
    except Exception as e:
        logger.warning(f"Could not initialise Scikit-Learn classifier: {e}")
        return None


# ---------------------------------------------------------------------------
# Document Classifier API
# ---------------------------------------------------------------------------
LABELS = {
    "invoice": "Vendor Invoice",
    "receipt": "Payment / Fee Receipt",
    "certificate": "Academic / Professional Certificate",
    "application_form": "Official Application Form",
    "travel_ticket": "Travel Ticket / Travel Invoice",
    "unclassified": "Unknown Document"
}


def classify_document(full_text: str, override_type: str = None) -> dict:
    """
    Classifies document into:
      'invoice', 'receipt', 'certificate', 'application_form', 'travel_ticket', or 'unclassified'.

    Uses:
    1. Manual user override (if provided).
    2. Genuine Scikit-Learn ML classification model (TF-IDF + Naive Bayes).
    3. Keyword heuristic engine as transparent fallback.
    """
    if override_type and override_type.lower() in LABELS and override_type.lower() != "unclassified":
        dt = override_type.lower()
        return {
            "doc_type": dt,
            "doc_subtype": f"{dt}_standard",
            "display_label": LABELS.get(dt, dt.capitalize()),
            "confidence": 1.0,
            "is_uncertain": False,
            "alternatives": [],
            "reason": f"Manual override selected by user: '{override_type}'",
            "classification_method": "manual_override"
        }

    text_lower = full_text.lower() if full_text else ""
    if not text_lower or len(text_lower.strip()) < 15:
        return {
            "doc_type": "unclassified",
            "doc_subtype": "unclassified",
            "display_label": "Unknown Document",
            "confidence": 0.20,
            "is_uncertain": True,
            "alternatives": [],
            "reason": "Document text is empty or too short for classification.",
            "classification_method": "keyword_rules_fallback"
        }

    # -----------------------------------------------------------------------
    # Step 1: Genuine Scikit-Learn ML Model Inference
    # -----------------------------------------------------------------------
    clf_pipeline = _get_or_train_classifier()
    ml_predicted_type = None
    ml_confidence = 0.0
    ml_alternatives = []

    if clf_pipeline is not None:
        try:
            # Predict probabilities
            classes = list(clf_pipeline.classes_)
            probs = clf_pipeline.predict_proba([text_lower])[0]
            ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)

            ml_predicted_type, top_prob = ranked[0]
            ml_confidence = round(float(top_prob), 2)

            for c, p in ranked[1:4]:
                if p > 0.08:
                    ml_alternatives.append({
                        "type": c,
                        "label": LABELS.get(c, c),
                        "score": round(float(p) * 10, 1),
                        "probability": round(float(p), 3)
                    })
        except Exception as e:
            logger.warning(f"ML classification inference error: {e}")

    # -----------------------------------------------------------------------
    # Step 2: Keyword Heuristic Rule Scoring (Validation & Fallback)
    # -----------------------------------------------------------------------
    invoice_keywords = ["invoice", "tax invoice", "bill to", "subtotal", "vat", "gstin", "gst", "vendor", "supplier", "place of supply", "tin"]
    receipt_keywords = ["receipt", "fee receipt", "tuition fee", "payment received", "received from", "transaction id", "payment ref", "paid amount", "challan"]
    certificate_keywords = ["certificate", "certify that", "conferred", "awarded to", "issued by", "degree of", "diploma", "completion of"]
    application_keywords = ["application form", "applicant name", "application id", "application ref", "membership form", "contact details", "passport no"]
    travel_keywords = ["pnr", "boarding pass", "flight", "airline", "passenger", "origin", "destination", "departure", "arrival", "operator", "e-ticket", "ticket no", "bus ticket"]

    score_invoice = sum(1 for kw in invoice_keywords if kw in text_lower)
    score_receipt = sum(1 for kw in receipt_keywords if kw in text_lower)
    score_certificate = sum(1 for kw in certificate_keywords if kw in text_lower)
    score_application = sum(1 for kw in application_keywords if kw in text_lower)
    score_travel = sum(1 for kw in travel_keywords if kw in text_lower)

    # Fee receipt specific rule to avoid misclassifying fee receipts
    if any(k in text_lower for k in ["fee receipt", "tuition fee", "transaction id", "payment ref", "received with thanks"]):
        score_receipt += 3

    rule_scores = [
        ("receipt", score_receipt, "Payment / Fee Receipt"),
        ("invoice", score_invoice, "Vendor Invoice"),
        ("certificate", score_certificate, "Academic / Professional Certificate"),
        ("application_form", score_application, "Official Application Form"),
        ("travel_ticket", score_travel, "Travel Ticket / Travel Invoice")
    ]
    rule_scores.sort(key=lambda x: x[1], reverse=True)
    rule_best_type, rule_best_score, rule_best_label = rule_scores[0]

    # -----------------------------------------------------------------------
    # Step 3: Synthesis & Subtype Determination
    # -----------------------------------------------------------------------
    # If ML model has high confidence (>= 0.50) and aligns with keywords, use ML
    chosen_type = None
    chosen_confidence = 0.50
    classification_method = "ml_model"
    reason = ""

    if ml_predicted_type and ml_confidence >= 0.50 and (rule_best_score >= 1 or ml_confidence >= 0.70):
        chosen_type = ml_predicted_type
        chosen_confidence = min(0.98, max(0.65, ml_confidence))
        classification_method = "ml_tfidf_model"
        reason = f"Classified by Scikit-Learn TF-IDF model ({int(ml_confidence * 100)}% confidence). Matched {rule_best_score} anchor keywords."
    elif rule_best_score >= 2:
        chosen_type = rule_best_type
        chosen_confidence = min(0.95, 0.65 + (rule_best_score * 0.08))
        classification_method = "keyword_rules_fallback"
        reason = f"Classified by keyword rules: matched {rule_best_score} anchor keywords for '{rule_best_label}'."
    elif rule_best_score == 1:
        chosen_type = rule_best_type
        chosen_confidence = 0.60
        classification_method = "keyword_rules_fallback"
        reason = f"Single keyword match for '{rule_best_label}'. Human verification recommended."
    else:
        chosen_type = "unclassified"
        chosen_confidence = 0.30
        classification_method = "keyword_rules_fallback"
        reason = "Insufficient keywords or pattern matches found to assign category."

    best_label = LABELS.get(chosen_type, "Unknown Document")

    # Subtype detection logic
    subtype = f"{chosen_type}_standard"
    if chosen_type == "receipt" and any(k in text_lower for k in ["fee", "tuition", "university", "college", "admission"]):
        subtype = "university_fee_receipt"
        best_label = "University Fee Receipt"
    elif chosen_type == "certificate" and any(k in text_lower for k in ["degree", "bachelor", "master", "phd"]):
        subtype = "degree_certificate"
        best_label = "Degree Certificate"

    # Merge alternatives
    alternatives = ml_alternatives if ml_alternatives else []
    if not alternatives and rule_scores[1][1] >= 1:
        alternatives.append({
            "type": rule_scores[1][0],
            "label": rule_scores[1][2],
            "score": rule_scores[1][1]
        })

    return {
        "doc_type": chosen_type,
        "doc_subtype": subtype,
        "display_label": best_label,
        "confidence": round(chosen_confidence, 2),
        "is_uncertain": chosen_confidence < 0.70,
        "alternatives": alternatives,
        "reason": reason,
        "classification_method": classification_method
    }
