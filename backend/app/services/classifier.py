"""
Document Classification Service for DocuSense AI.

Classification Targets:
- 'invoice': Vendor Invoice / Tax Invoice
- 'receipt': Payment / Tuition Fee Receipt
- 'certificate': Academic / Professional Certificate
- 'application_form': Official Membership / Service Application
- 'travel_ticket': Travel Ticket / Boarding Pass / Travel Invoice
- 'unclassified': Unknown / Out-of-Distribution / Needs Review

Architecture:
1. Genuine Machine Learning model: TF-IDF vectorizer + Multinomial Naive Bayes
   classifier trained on characteristic multi-domain document corpora with strict train/test split.
2. Persisted Model Artifact: Loaded from disk (joblib) with on-demand retraining support.
3. Keyword rules engine: Used as transparent fallback when ML confidence is marginal
   or for offline edge cases.
4. Transparent provenance: Explicitly labels whether classification was performed by
   'ml_tfidf_model', 'keyword_rules_fallback', or 'manual_override'.
"""

import os
import json
import logging
import joblib
from typing import Optional, Dict, Any

from backend.app.services.train_classifier import train_and_evaluate

logger = logging.getLogger(__name__)

# Directory for ML model artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACT_DIR = os.path.join(BASE_DIR, "ml_artifacts")
MODEL_PATH = os.path.join(ARTIFACT_DIR, "document_classifier.joblib")
METRICS_PATH = os.path.join(ARTIFACT_DIR, "eval_metrics.json")

# ---------------------------------------------------------------------------
# ML Pipeline Management (Lazy Loading & Retraining)
# ---------------------------------------------------------------------------
_ml_pipeline = None


def get_classifier_pipeline():
    """Returns the loaded Scikit-Learn pipeline, loading or training if necessary."""
    global _ml_pipeline
    if _ml_pipeline is not None:
        return _ml_pipeline

    if os.path.exists(MODEL_PATH):
        try:
            _ml_pipeline = joblib.load(MODEL_PATH)
            logger.info(f"Loaded trained document classifier from {MODEL_PATH}")
            return _ml_pipeline
        except Exception as e:
            logger.warning(f"Error loading persisted classifier: {e}. Retraining...")

    try:
        metrics = train_and_evaluate(ARTIFACT_DIR)
        _ml_pipeline = joblib.load(MODEL_PATH)
        logger.info("Classifier successfully trained, evaluated, and loaded.")
        return _ml_pipeline
    except Exception as e:
        logger.error(f"Failed to train/load ML classifier: {e}")
        return None


def retrain_model() -> Dict[str, Any]:
    """Retrains the ML classifier, updates the persisted artifact, and returns new metrics."""
    global _ml_pipeline
    metrics = train_and_evaluate(ARTIFACT_DIR)
    _ml_pipeline = joblib.load(MODEL_PATH)
    logger.info("Classifier retrained and reloaded in memory.")
    return metrics


def get_classifier_metrics() -> Dict[str, Any]:
    """Returns stored evaluation metrics and confusion matrix from the held-out test set."""
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Error reading metrics artifact: {e}")
    # If metrics not yet generated, train and evaluate
    return train_and_evaluate(ARTIFACT_DIR)


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
    clf_pipeline = get_classifier_pipeline()
    ml_predicted_type = None
    ml_confidence = 0.0
    ml_alternatives = []

    if clf_pipeline is not None:
        try:
            classes = list(clf_pipeline.classes_)
            probs = clf_pipeline.predict_proba([text_lower])[0]
            ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)

            ml_predicted_type, top_prob = ranked[0]
            ml_confidence = round(float(top_prob), 2)

            for c, p in ranked[1:4]:
                if p > 0.05:
                    ml_alternatives.append({
                        "type": str(c),
                        "label": LABELS.get(str(c), str(c)),
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
    chosen_type = None
    chosen_confidence = 0.50
    classification_method = "ml_tfidf_model"
    reason = ""

    # Out-of-distribution or predicted unclassified check
    if ml_predicted_type == "unclassified" or (ml_predicted_type and ml_confidence < 0.45 and rule_best_score == 0):
        chosen_type = "unclassified"
        chosen_confidence = max(0.30, ml_confidence) if ml_confidence < 0.60 else 0.35
        classification_method = "ml_tfidf_model" if ml_predicted_type == "unclassified" else "keyword_rules_fallback"
        reason = "Document classified as out-of-distribution or unclassified. Human review required to assign schema."
    elif ml_predicted_type and ml_confidence >= 0.50 and (rule_best_score >= 1 or ml_confidence >= 0.70):
        chosen_type = ml_predicted_type
        chosen_confidence = min(0.98, max(0.65, ml_confidence))
        classification_method = "ml_tfidf_model"
        reason = f"Classified by Scikit-Learn TF-IDF model ({int(ml_confidence * 100)}% confidence). Matched {rule_best_score} anchor keywords."
    elif rule_best_score >= 2:
        chosen_type = rule_best_type
        chosen_confidence = min(0.95, 0.65 + (rule_best_score * 0.08))
        classification_method = "keyword_rules_fallback"
        reason = f"Classified by keyword rules fallback: matched {rule_best_score} anchor keywords for '{rule_best_label}'."
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

    chosen_type_str = str(chosen_type)
    best_label = LABELS.get(chosen_type_str, "Unknown Document")

    # Subtype detection logic
    subtype = f"{chosen_type_str}_standard"
    if chosen_type_str == "receipt" and any(k in text_lower for k in ["fee", "tuition", "university", "college", "admission"]):
        subtype = "university_fee_receipt"
        best_label = "University Fee Receipt"
    elif chosen_type_str == "certificate" and any(k in text_lower for k in ["degree", "bachelor", "master", "phd"]):
        subtype = "degree_certificate"
        best_label = "Degree Certificate"

    # Merge alternatives
    alternatives = ml_alternatives if ml_alternatives else []
    if not alternatives and rule_scores[1][1] >= 1:
        alternatives.append({
            "type": str(rule_scores[1][0]),
            "label": rule_scores[1][2],
            "score": float(rule_scores[1][1])
        })

    return {
        "doc_type": chosen_type_str,
        "doc_subtype": subtype,
        "display_label": best_label,
        "confidence": float(round(chosen_confidence, 2)),
        "is_uncertain": chosen_confidence < 0.70 or chosen_type_str == "unclassified",
        "alternatives": alternatives,
        "reason": reason,
        "classification_method": classification_method
    }
