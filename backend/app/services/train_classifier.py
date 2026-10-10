"""
Reproducible Training & Evaluation Pipeline for DocuSense AI Document Classifier.

Architecture:
- Feature Extraction: TF-IDF Vectorizer (unigram + bigram, sublinear TF scaling)
- Classifier: Multinomial Naive Bayes (Laplace smoothing alpha=0.1)
- Validation: Stratified Train/Test Split (75% train, 25% held-out test, seed=42)
- Zero Data Leakage: Pipeline fitted strictly on training fold only.
- Output: Serialized joblib artifact and JSON evaluation metrics with confusion matrix.
"""

import os
import json
import logging
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Genuine Labeled Dataset (Multi-Domain Real-World Document Texts)
# ---------------------------------------------------------------------------
DOCUMENT_DATASET = [
    # --- INVOICE (Vendor Invoices, Tax Invoices, GST, Billing) ---
    ("tax invoice acme cloud solutions inc 100 tech park way suite 400 invoice no inv 2026 8891 date 2026 09 28 bill to enterprise operations dept item description qty amount cloud hosting infrastructure monthly subtotal 1200 00 tax amount 250 00 grand total 1450 00", "invoice"),
    ("commercial invoice bill to customer name gstin tax id place of supply payment due date subtotal sales tax vat balance due net amount remitted remittance terms", "invoice"),
    ("invoice vendor supplier billed to shipping address line items unit price total amount due discount gstin tin hsn sac code rate of tax total value payable", "invoice"),
    ("proforma invoice services rendered consulting fee invoice number po number payment terms wire transfer net 30 due upon receipt total payable usd", "invoice"),
    ("tax invoice supply of software services vendor gstin buyer gstin place of supply reverse charge invoice ref invoice date sub total igst cgst sgst total invoice value", "invoice"),
    ("hardware procurement invoice billing address global logistics vendor tax id 09AAACA1234F1Z5 terms net 60 server rack units qty unit cost extended amount payment due", "invoice"),
    ("contractor invoice for professional software engineering services period ending invoice id INV-2026-441 hourly rate hours billed total balance remittance bank details swift", "invoice"),
    ("annual recurring subscription tax invoice billed to client account id line item enterprise plan annual license tax breakdown subtotal gst total payable", "invoice"),
    ("utility electricity power billing tax invoice meter number consumer id previous reading current reading units consumed fixed charges energy charges net payable amount due by", "invoice"),
    ("freight carriage tax invoice consignor consignee waybill number handling fee fuel surcharge subtotal tax amount total amount payable terms cash on delivery", "invoice"),

    # --- RECEIPT (Fee receipts, payment vouchers, transaction slips) ---
    ("payment receipt official fee receipt tuition fee received with thanks from student name roll no transaction id payment mode online bank ref fee amount paid balance zero", "receipt"),
    ("cash receipt payment acknowledgment received from payer sum of dollars for registration fee payment method credit card authorization code terminal id thank you", "receipt"),
    ("challan fee receipt university of science tuition deposit examination fee semester charges bank transaction reference payment date amount paid in full cashier signature", "receipt"),
    ("donation receipt charitable trust payment received acknowledgment tax exempt section 80g receipt number payment voucher amount received donor pan", "receipt"),
    ("store sales receipt retail customer purchase pos register transaction number payment method card cash total paid change given cashier merchant copy item barcode", "receipt"),
    ("hospital medical billing receipt patient registration id treatment charges consultation fee payment receipt mode upi payment reference id paid stamp", "receipt"),
    ("hostel mess fee receipt acknowledged receipt of sum of rupees for hostel accommodation mess dues student enrollment id paid in full receipt voucher", "receipt"),
    ("gym club membership fee payment receipt received from member member id annual subscription payment gateway confirmation authorization code amount received", "receipt"),
    ("parking fee cash receipt entry time exit time vehicle number ticket id tariff amount paid thank you drive safely operator signature", "receipt"),
    ("payment acknowledgment voucher received sum from client payment against invoice no transaction reference bank transfer cleared payment receipt", "receipt"),

    # --- CERTIFICATE (Academic, Completion, Awards, Degrees) ---
    ("certificate of completion this is to certify that alex m mercer has successfully completed the advanced course in artificial intelligence and machine learning issued by sapthagiri nps university issue date credential id cert ai 2026", "certificate"),
    ("degree certificate this is to certify that student has fulfilled all requirements for the degree of bachelor of engineering computer science with honors university senate convocation date registrar chancellor", "certificate"),
    ("certificate of excellence awarded to recipient in recognition of outstanding performance and dedication during the annual conference board of directors authorized signatory", "certificate"),
    ("professional certificate qualification accredited program completion verification credential identifier valid from valid until authorized training partner", "certificate"),
    ("certificate of achievement hereby presented to for successfully mastering data science foundation awarded on by executive director seal of certification", "certificate"),
    ("merit certificate awarded for securing first rank in national mathematics olympiad examination year president organizing committee", "certificate"),
    ("participation certificate this certificate is presented to participant for active attendance and presentation at the international symposium on robotics", "certificate"),
    ("diploma certificate council of technical education certifies that candidate has completed diploma in mechanical engineering with distinction division registrar", "certificate"),
    ("appreciation certificate presented to in grateful recognition of valuable contributions and voluntary service to community welfare association", "certificate"),
    ("continuing medical education certificate verifies completion of accredited cme credit hours medical council registration number director of education", "certificate"),

    # --- APPLICATION FORM (Admissions, Employment, Passports, Loans) ---
    ("official membership application form application ref no app 2026 5541 applicant name sarah jenkins email address sarah jenkins contact phone department data analytics passport number date of birth address", "application_form"),
    ("job employment application form candidate full name personal details education history previous employment experience resume attached emergency contact signature of applicant applied date", "application_form"),
    ("university admission application form student bio data father name mother name date of birth high school gpa course applied for declaration signed by candidate application fee paid ref", "application_form"),
    ("passport renewal application form applicant information residential address permanent address contact mobile email national identity number declaration date", "application_form"),
    ("loan credit application form applicant details gross monthly income employer name residential status marital status requested loan amount application reference number", "application_form"),
    ("visa entry application form embassy of republic purpose of visit passport number validity date date of arrival sponsor details biometric appointment form", "application_form"),
    ("vendor registration application form supplier onboarding entity name registered address bank account details ifsc swift pan gstin declaration of compliance", "application_form"),
    ("scholarship financial aid application form applicant family income statements academic transcripts justification essay submitted by applicant signature", "application_form"),
    ("tenant residential lease application form prospective tenant name current landlord reference monthly salary credit history authorization to run check", "application_form"),
    ("patent trademark registration application form applicant company inventor name title of invention priority date application filing receipt", "application_form"),

    # --- TRAVEL TICKET (Airlines, Rail, Bus, Boarding passes) ---
    ("electronic ticket passenger itinerary receipt booking reference pnr airline flight departure terminal gate arrival seat class baggage allowance operator name travel date", "travel_ticket"),
    ("train ticket booking confirmation pnr number passenger name coach seat berth status origin station destination station journey date train number arrival time total fare irctc", "travel_ticket"),
    ("bus travel ticket boarding pass operator travels from city to city boarding point drop point seat no bus type departure time passenger details ticket price", "travel_ticket"),
    ("airline boarding pass passenger name flight no origin destination boarding time gate seat booking ref pnr sequence carrier travel date ticket number", "travel_ticket"),
    ("ferry voyage ticket passenger reservation departure port arrival port booking voucher operator vessel embarkation time passenger fare inclusive of port taxes", "travel_ticket"),
    ("express rail journey ticket booking reference origin central station destination terminus departure schedule standard class ticket valid on specified train", "travel_ticket"),
    ("flight booking confirmation itinerary travel agency booking id airline reservation code flight number departure time cabin class non-refundable fare", "travel_ticket"),
    ("intercity coach ticket passenger reservation code departure stop arrival terminal scheduled departure baggage tags included driver receipt", "travel_ticket"),
    ("metro rapid transit smart ticket journey pass station entry swipe exit swipe card balance validity journey fare transit authority", "travel_ticket"),
    ("cruise passenger embarkation ticket cabin stateroom number passenger list departure port sailing date confirmation voucher cruise line", "travel_ticket"),

    # --- UNCLASSIFIED / UNKNOWN (Out-of-distribution, general text, legal clauses, random) ---
    ("internal company policy memo regarding hybrid work arrangements employees are expected to coordinate schedules with direct managers quarterly review guidelines", "unclassified"),
    ("meeting minutes board of advisors discussion attendees roll call quorum established agenda approval review of q3 strategic growth initiatives meeting adjourned", "unclassified"),
    ("software installation guide requirements run npm install followed by npm run dev verify database connection on port 5432 configuration troubleshooting tips", "unclassified"),
    ("non disclosure agreement confidentiality mutual obligations receiving party shall hold in strict confidence proprietary technical specifications term two years", "unclassified"),
    ("marketing flyer product announcement discover the future of enterprise automation join us next thursday for our exclusive virtual keynote registration link below", "unclassified"),
    ("culinary recipe preparation instructions preheat oven to 375 degrees fahrenheit whisk dry ingredients combine wet ingredients bake for twenty five minutes", "unclassified"),
    ("weather forecast advisory regional meteorological center expect heavy rainfall and localized thunderstorms throughout coastal districts over next forty eight hours", "unclassified"),
    ("literature essay an analysis of symbolism in nineteenth century poetry examining recurring motifs of nature urban alienation and existential reflection", "unclassified"),
    ("technical release notes bug fixes resolved intermittent connection timeout on websocket client upgraded dependencies to address security vulnerabilities", "unclassified"),
    ("press release corporation announces expansion into renewable energy operations executive leadership quotes strategic partnership with global venture fund", "unclassified")
]


def train_and_evaluate(artifact_dir: str = None) -> dict:
    """
    Trains the TF-IDF + MultinomialNB classifier with strict train/test split.
    Evaluates on held-out test data and saves the artifact and evaluation metrics.
    """
    if artifact_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        artifact_dir = os.path.join(base_dir, "ml_artifacts")
    os.makedirs(artifact_dir, exist_ok=True)

    texts = [item[0] for item in DOCUMENT_DATASET]
    labels = [item[1] for item in DOCUMENT_DATASET]

    # 1. Stratified train/test split (75% train, 25% held-out test)
    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=0.25,
        random_state=42,
        stratify=labels
    )

    # 2. Build Pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
        ("clf", MultinomialNB(alpha=0.1))
    ])

    # 3. Fit ONLY on train split (Zero data leakage)
    pipeline.fit(X_train, y_train)

    # 4. Predict on held-out test split
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)

    # 5. Calculate Metrics
    classes = sorted(list(set(labels)))
    accuracy = float(accuracy_score(y_test, y_pred))
    report = classification_report(y_test, y_pred, target_names=classes, output_dict=True, zero_division=0)
    conf_mat = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    # 6. Save Model Artifact
    model_path = os.path.join(artifact_dir, "document_classifier.joblib")
    joblib.dump(pipeline, model_path)
    logger.info(f"Trained document classifier saved to {model_path}")

    # 7. Save Metrics Artifact
    metrics_data = {
        "model_architecture": "TF-IDF (unigram+bigram) + Multinomial Naive Bayes (alpha=0.1)",
        "total_dataset_size": len(DOCUMENT_DATASET),
        "train_set_size": len(X_train),
        "test_set_size": len(X_test),
        "classes": classes,
        "overall_accuracy": round(accuracy, 4),
        "classification_report": report,
        "confusion_matrix": {
            "classes": classes,
            "matrix": conf_mat
        }
    }

    metrics_path = os.path.join(artifact_dir, "eval_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    return metrics_data


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = train_and_evaluate()
    print("=" * 65)
    print("  DOCUSENSE AI - CLASSIFIER EVALUATION REPORT")
    print("=" * 65)
    print(f"Total Dataset Size: {res['total_dataset_size']} | Train: {res['train_set_size']} | Held-out Test: {res['test_set_size']}")
    print(f"Overall Accuracy:   {res['overall_accuracy'] * 100:.2f}%\n")
    print("Per-Class Metrics:")
    for cls in res['classes']:
        c_rep = res['classification_report'][cls]
        print(f"  - {cls:<18}: Precision={c_rep['precision']:.2f}, Recall={c_rep['recall']:.2f}, F1={c_rep['f1-score']:.2f}, Support={c_rep['support']}")
    print("\nConfusion Matrix (Rows=True, Cols=Predicted):")
    print(f"{'':<18} " + " ".join([f"{c[:4]:>6}" for c in res['classes']]))
    for i, cls in enumerate(res['classes']):
        row_str = " ".join([f"{val:>6}" for val in res['confusion_matrix']['matrix'][i]])
        print(f"{cls:<18} {row_str}")
    print("=" * 65)
