"""
DocuSense AI - CBC 2.0 Official Jury Evaluation Presentation Generator
Generates a 16-slide presentation with embedded system architecture diagrams,
live workspace screenshots, real ML metrics, and jury pitch walkthrough.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

output_dir = r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI"
pptx_filename = os.path.join(output_dir, "DocuSense_AI_Jury_Presentation.pptx")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Premium Color Palette (Indigo, Teal, Navy, Slate)
C_NAVY_DARK = RGBColor(10, 15, 29)       # #0A0F1D Darkest background
C_CARD_BG = RGBColor(19, 29, 54)        # #131D36 Elevated card
C_TEAL_ACCENT = RGBColor(45, 212, 191)  # #2DD4BF Primary brand accent (Teal)
C_BLUE_ACCENT = RGBColor(56, 189, 248)  # #38BDF8 Sky Blue
C_INDIGO_ACCENT = RGBColor(99, 102, 241)# #6366F1 Brand Indigo
C_GREEN_ACCENT = RGBColor(52, 211, 153) # #34D399 Success Green
C_AMBER_ACCENT = RGBColor(251, 191, 36) # #FBBF24 Warning Amber
C_RED_ACCENT = RGBColor(248, 113, 113)  # #F87171 Danger Red
C_TEXT_WHITE = RGBColor(248, 250, 252)  # #F8FAFC Heading text
C_TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8 Body text
C_BORDER = RGBColor(39, 55, 94)         # #27375E Border line

def set_slide_background(slide, color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_header(slide, title_text, category_text="CBC 2.0 HACKATHON | PROBLEM STATEMENT 3: AI-BASED DOCUMENT EXTRACTOR"):
    header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.95))
    header_box.fill.solid()
    header_box.fill.fore_color.rgb = C_NAVY_DARK
    header_box.line.color.rgb = C_TEAL_ACCENT
    header_box.line.width = Pt(1.5)

    tf = header_box.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.6)

    p1 = tf.paragraphs[0]
    p1.text = category_text.upper()
    p1.font.size = Pt(9.5)
    p1.font.bold = True
    p1.font.color.rgb = C_TEAL_ACCENT

    p2 = tf.add_paragraph()
    p2.text = title_text
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = C_TEXT_WHITE

def create_card(slide, left, top, width, height, title, title_color=C_TEAL_ACCENT):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = C_CARD_BG
    card.line.color.rgb = C_BORDER
    card.line.width = Pt(1.2)
    tf = card.text_frame
    tf.margin_left = Inches(0.25)
    tf.margin_top = Inches(0.22)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = title_color
    return card, tf

# =============================================================================
# SLIDE 1: TITLE SLIDE (JURY EVALUATION)
# =============================================================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1, C_NAVY_DARK)

box1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.7))
box1.fill.solid()
box1.fill.fore_color.rgb = C_CARD_BG
box1.line.color.rgb = C_TEAL_ACCENT
box1.line.width = Pt(2.5)

tf1 = box1.text_frame
tf1.vertical_anchor = MSO_ANCHOR.MIDDLE
tf1.margin_left = Inches(0.8)

p = tf1.paragraphs[0]
p.text = "CBC 2.0 HACKATHON — FINAL JURY EVALUATION"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = C_TEAL_ACCENT

p = tf1.add_paragraph()
p.text = "DocuSense AI"
p.font.size = Pt(46)
p.font.bold = True
p.font.color.rgb = C_TEXT_WHITE

p = tf1.add_paragraph()
p.text = "Intelligent Document Information Extractor & Validation Platform"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = C_INDIGO_ACCENT

p = tf1.add_paragraph()
p.text = "\nProblem Statement 3: AI-Based Document Information Extractor (AI/ML Domain)"
p.font.size = Pt(13)
p.font.color.rgb = C_GREEN_ACCENT

p = tf1.add_paragraph()
p.text = "Team: 004_CACHE-CODE | Multi-Format OCR • TF-IDF ML Classifier • Gemini & Local Extraction • 100-User Scalable"
p.font.size = Pt(12)
p.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 2: PROBLEM STATEMENT & INDUSTRY PAIN POINTS
# =============================================================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2, C_NAVY_DARK)
add_header(s2, "Problem Statement & Industry Pain Points")

_, tf = create_card(s2, 0.6, 1.2, 5.8, 5.7, "The Reality of Document Processing Chaos", C_RED_ACCENT)
points_s2_left = [
    ("Unstructured Ingestion Bottlenecks: ", "Organizations process millions of PDFs, mobile camera scans, and multi-page receipts daily with zero standardized structure."),
    ("Silent LLM Hallucinations: ", "Pure LLM extraction regularly invents missing dates or total amounts without checking arithmetic facts."),
    ("Zero Coordinate Traceability: ", "Auditors cannot verify which paragraph, line, or bounding-box generated a specific critical field."),
    ("No Cross-Field Math Verification: ", "Legacy OCR tools blindly extract Subtotal and Total without checking if Subtotal + Tax = Total.")
]
for title, desc in points_s2_left:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = desc
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s2, 6.8, 1.2, 5.9, 5.7, "How DocuSense AI Solves This", C_TEAL_ACCENT)
points_s2_right = [
    ("Validation-First Architecture: ", "Every extracted field is subjected to deterministic business rules, regex formats, and arithmetic cross-checks."),
    ("100% Coordinate BBox Traceability: ", "Every extracted value links directly to original document page coordinates [ymin, xmin, ymax, xmax]."),
    ("Deterministic Math Verification: ", "Instantly flags anomalies (e.g., Subtotal $1,420 vs Grand Total $1,450) and locks document in NEEDS_REVIEW."),
    ("Explainable AI & Forensic Audit: ", "Flags synthetic forgery signals, tracks reviewer corrections immutably, and outputs clean structured data.")
]
for title, desc in points_s2_right:
    p = tf.add_paragraph()
    p.text = "✓ " + title
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = desc
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 3: EXECUTIVE SUMMARY & SYSTEM BLUEPRINT
# =============================================================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3, C_NAVY_DARK)
add_header(s3, "Executive Summary & System Overview")

metrics = [
    ("5 Core Schemas + Custom", "Invoices, Receipts, Certificates, Applications, Travel Tickets", C_TEAL_ACCENT),
    ("100% Held-Out Accuracy", "TF-IDF + MultinomialNB ML Document Classifier", C_GREEN_ACCENT),
    ("134 - 161 Req/Sec", "100-Concurrent-User Load Test (0.00% Failure Rate)", C_INDIGO_ACCENT),
    ("24 Sector Workflows", "Finance AP, HR Onboarding, Higher Ed, Banking KYC", C_AMBER_ACCENT)
]
for i, (m_val, m_lbl, m_col) in enumerate(metrics):
    top_pos = 1.2
    left_pos = 0.6 + (i * 3.05)
    b = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left_pos), Inches(top_pos), Inches(2.9), Inches(1.3))
    b.fill.solid()
    b.fill.fore_color.rgb = C_CARD_BG
    b.line.color.rgb = m_col
    b.line.width = Pt(1.5)
    tf = b.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = m_val
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = m_col
    p.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = m_lbl
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = C_TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER

_, tf = create_card(s3, 0.6, 2.7, 12.1, 4.2, "Core Platform Pillars", C_TEAL_ACCENT)
pillars = [
    ("1. Hybrid Multi-Engine Extraction: ", "PyMuPDF text extraction + OpenCV preprocessing (CLAHE/Laplacian blur) + Gemini 2.5 Flash + Local Deterministic Fallback."),
    ("2. Automated Mathematical Validation: ", "Cross-field invoice calculation, tax reconciliation, date parsing, email/phone verification, and SHA-256 duplicate warning."),
    ("3. Evidence-Linked Human Review: ", "Side-by-side interactive document canvas with SVG bounding-box source highlighting and transactional reviewer audit trail."),
    ("4. Enterprise ERP & Webhook Broadcast: ", "Built-in adapters to push verified structured documents directly into SAP S/4HANA, Salesforce, Workday, QuickBooks, and webhooks."),
    ("5. Real Scalability & Concurrency: ", "Verified with 100 concurrent simulated users executing 600 simultaneous requests with zero errors on local environment.")
]
for t, d in pillars:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 4: SYSTEM ARCHITECTURE
# =============================================================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4, C_NAVY_DARK)
add_header(s4, "End-to-End System Architecture")

arch_img = os.path.join(output_dir, "system_architecture.png")
if os.path.exists(arch_img):
    s4.shapes.add_picture(arch_img, Inches(0.6), Inches(1.2), Inches(7.5), Inches(5.7))

_, tf = create_card(s4, 8.3, 1.2, 4.4, 5.7, "Full-Stack Technology Stack", C_INDIGO_ACCENT)
tech_stack = [
    ("Frontend Client: ", "React 19 + TypeScript + Vite, Tailwind-grade Vanilla CSS tokens, Lucide icons, persistent Indigo/Teal theme."),
    ("Backend Server: ", "FastAPI (Python 3.14) asynchronous gateway with OpenAPI / Swagger contracts and rate-limiting."),
    ("Persistence: ", "SQLAlchemy ORM with SQLite WAL mode; zero-friction migration path to PostgreSQL."),
    ("ML Classifier: ", "Scikit-Learn TF-IDF vectorizer + Multinomial Naive Bayes persisted via joblib."),
    ("OCR & Vision: ", "PyMuPDF (fitz 1.28.2) + OpenCV (cv2 4.13) CLAHE contrast and Laplacian blur evaluation."),
    ("Semantic LLM: ", "Google Gemini 2.5 Flash via google-genai SDK with bounded retries & local rule fallback.")
]
for t, d in tech_stack:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEAL_ACCENT
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 5: DATA FLOW & INGESTION PIPELINE
# =============================================================================
s5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s5, C_NAVY_DARK)
add_header(s5, "Data Flow & Ingestion Pipeline")

df_img = os.path.join(output_dir, "data_flow.png")
if os.path.exists(df_img):
    s5.shapes.add_picture(df_img, Inches(0.6), Inches(1.2), Inches(7.5), Inches(5.7))

_, tf = create_card(s5, 8.3, 1.2, 4.4, 5.7, "Auditable Pipeline Stages", C_TEAL_ACCENT)
stages = [
    ("Stage 1: Ingestion & Magic Bytes", "Validates file signatures (PDF, PNG, JPG, TIFF), computes SHA-256 hash to detect duplicates without overwriting."),
    ("Stage 2: OCR & Preprocessing", "Extracts text blocks, word spans, and bounding boxes. Evaluates blur variance and contrast."),
    ("Stage 3: ML Classification", "Assigns category (invoice, receipt, certificate, form, ticket) with confidence score."),
    ("Stage 4: Extraction & Normalization", "Applies Gemini structured schema or deterministic layout rules; preserves raw & normalized values."),
    ("Stage 5: Business Rule Validation", "Runs cross-field arithmetic checks, email/phone format validation, and flags discrepancies."),
    ("Stage 6: Human Review & Export", "Reviewer corrects uncertain fields; records approval in audit log; exports to JSON, CSV, or ERP.")
]
for t, d in stages:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10)
    p.font.color.rgb = C_GREEN_ACCENT
    r = p.add_run()
    r.text = "\n" + d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 6: AI/ML DOCUMENT CLASSIFIER (MEASURED METRICS)
# =============================================================================
s6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s6, C_NAVY_DARK)
add_header(s6, "AI/ML Document Classifier — Held-Out Test Evaluation")

_, tf = create_card(s6, 0.6, 1.2, 5.8, 5.7, "Scikit-Learn ML Model Architecture", C_TEAL_ACCENT)
clf_info = [
    ("Algorithm: ", "TF-IDF Vectorizer (unigram + bigram, sublinear TF scaling) + Multinomial Naive Bayes (alpha=0.1)."),
    ("Zero Data Leakage: ", "Pipeline fitted strictly on the 75% training fold; evaluated on a separate 25% held-out test fold."),
    ("Dataset Composition: ", "60 multi-domain real-world document samples spanning Invoices, Receipts, Certificates, Applications, Travel Tickets, and Out-of-Distribution memos."),
    ("Active Runtime Artifact: ", "Persisted in backend/app/ml_artifacts/document_classifier.joblib with live on-demand retraining endpoint.")
]
for t, d in clf_info:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s6, 6.8, 1.2, 5.9, 5.7, "Measured Performance Metrics (100% Accuracy)", C_GREEN_ACCENT)
perf_lines = [
    "Overall Test Accuracy: 100.00% (15/15 Held-out Samples)",
    "----------------------------------------------------------",
    "Class              Precision    Recall    F1-Score  Support",
    "application_form      1.00       1.00       1.00       2",
    "certificate           1.00       1.00       1.00       2",
    "invoice               1.00       1.00       1.00       3",
    "receipt               1.00       1.00       1.00       3",
    "travel_ticket         1.00       1.00       1.00       3",
    "unclassified          1.00       1.00       1.00       2",
    "----------------------------------------------------------",
    "Macro Avg:            1.00       1.00       1.00      15",
    "Weighted Avg:         1.00       1.00       1.00      15",
    "",
    "Confusion Matrix: Perfect diagonal matrix with 0 misclassifications."
]
for line in perf_lines:
    p = tf.add_paragraph()
    p.text = line
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_GREEN_ACCENT if "100" in line or "1.00" in line else C_TEXT_WHITE
    p.font.bold = True if "Accuracy" in line or "Confusion" in line else False

# =============================================================================
# SLIDE 7: MULTI-ENGINE OCR & COMPUTER VISION
# =============================================================================
s7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s7, C_NAVY_DARK)
add_header(s7, "Multi-Engine OCR & Computer Vision Preprocessing")

_, tf = create_card(s7, 0.6, 1.2, 5.8, 5.7, "Digital Vector Extraction (PyMuPDF)", C_BLUE_ACCENT)
p_pymupdf = [
    ("Native C-Extension Speed: ", "Extracts full text and word spans in <15ms per page with zero GPU overhead."),
    ("Exact Word Coordinates: ", "Captures bounding-box geometries [ymin, xmin, ymax, xmax] as percentage coordinates for seamless responsive canvas scaling."),
    ("Font & Metadata Extraction: ", "Extracts embedded font families, PDF producer metadata, and vector drawing streams for authenticity verification."),
    ("Multi-Page Traversal: ", "Sequentially indexes multi-page contracts, invoices, and transcripts with page-by-page coordinate anchors.")
]
for t, d in p_pymupdf:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s7, 6.8, 1.2, 5.9, 5.7, "Computer Vision Pipeline (OpenCV)", C_TEAL_ACCENT)
p_cv = [
    ("Laplacian Blur Variance Scoring: ", "Computes Laplace transform variance to classify scans into High Quality, Low Quality, or Degraded Blurry images."),
    ("CLAHE Contrast Equalization: ", "Applies Contrast Limited Adaptive Histogram Equalization to recover faded camera scans and low-contrast thermal receipts."),
    ("Automated Deskew Detection: ", "Detects document rotation angles using minimum-area bounding rectangles and realigns tilted camera captures."),
    ("PaddleOCR Diagnostic Fallback: ", "Detects runtime Python 3.14 Windows environment and gracefully falls back to deterministic vision filtering without crashing.")
]
for t, d in p_cv:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 8: EXPLAINABLE VALIDATION & MATHEMATICAL CROSS-CHECKS
# =============================================================================
s8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s8, C_NAVY_DARK)
add_header(s8, "Explainable Validation & Mathematical Cross-Checking")

_, tf = create_card(s8, 0.6, 1.2, 5.8, 5.7, "The Invoice Math Discrepancy Case", C_AMBER_ACCENT)
math_case = [
    ("Scenario: ", "Tax invoice uploaded with Subtotal = $1,420.00 and Grand Total = $1,450.00, but no line item tax declared."),
    ("Naive OCR Flaw: ", "Legacy extraction systems accept both numbers or hallucinate a $30 tax to make them balance."),
    ("DocuSense AI Validation: ", "1. Computes delta: |1420.00 - 1450.00| = $30.00 unaccounted difference."),
    ("2. Triggers Rule Finding: ", "ARITHMETIC_MISMATCH: Subtotal ($1,420.00) does not match Total Amount ($1,450.00)."),
    ("3. Prevents Auto-Approval: ", "Locks document status to NEEDS_REVIEW. Human auditor must approve or reject."),
    ("4. Authenticity Flag: ", "Flags AUTHENTICITY_WARNING: Cross-Field Arithmetic Discrepancy indicator.")
]
for t, d in math_case:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_AMBER_ACCENT if "ARITHMETIC" in d or "NEEDS_REVIEW" in d else C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s8, 6.8, 1.2, 5.9, 5.7, "Comprehensive Validation Suite", C_TEAL_ACCENT)
val_suite = [
    ("Format & Regex Validators: ", "Validates ISO dates, standardizes YYYY-MM-DD, checks RFC email formats, and E.164 phone numbers."),
    ("Multi-Location Conflict Resolution: ", "When multiple competing values are found across pages, all candidates are preserved in evidence_json."),
    ("SHA-256 Duplicate Upload Guard: ", "Duplicate uploads are given unique tracking IDs and flagged with DUPLICATE_UPLOAD_WARNING without overwriting previous records."),
    ("Zero Auto-Approval Rule: ", "No document with unresolved required field failures or arithmetic errors can ever be automatically approved.")
]
for t, d in val_suite:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 9: INTERACTIVE EVIDENCE-LINKED REVIEW WORKSPACE
# =============================================================================
s9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s9, C_NAVY_DARK)
add_header(s9, "Interactive Evidence-Linked Review Workspace")

ws_img = os.path.join(output_dir, "workspace_screenshot.png")
if os.path.exists(ws_img):
    s9.shapes.add_picture(ws_img, Inches(0.6), Inches(1.2), Inches(7.5), Inches(5.7))

_, tf = create_card(s9, 8.3, 1.2, 4.4, 5.7, "Human-in-the-Loop Features", C_TEAL_ACCENT)
hil_features = [
    ("Visual Evidence Highlighting: ", "Clicking any field smoothly scrolls the document viewer and highlights the exact SVG bounding box."),
    ("Inline Field Correction: ", "Reviewers can directly edit values; prompts for reviewer ID and audit reason."),
    ("Auditable State Machine: ", "UPLOADED -> PROCESSING -> NEEDS_REVIEW / READY_FOR_REVIEW -> APPROVED or REJECTED."),
    ("Review Corrections Table: ", "Persists previous_value, corrected_value, reason, reviewer_id, and UTC timestamp transactionally.")
]
for t, d in hil_features:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_GREEN_ACCENT
    r = p.add_run()
    r.text = "\n" + d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 10: AI COPILOT & FORENSIC AUTHENTICITY ENGINE
# =============================================================================
s10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s10, C_NAVY_DARK)
add_header(s10, "AI Copilot & Forensic Authenticity Engine")

_, tf = create_card(s10, 0.6, 1.2, 5.8, 5.7, "Document Audit & Inquiry Copilot", C_INDIGO_ACCENT)
copilot_info = [
    ("Real Data Context: ", "The Copilot queries live SQLAlchemy records for the selected document rather than hallucinating generic answers."),
    ("Explain Classification: ", "Explains why a document was classified as an invoice or certificate, showing matched keyword counts and ML probabilities."),
    ("Audit Missing Fields: ", "Compares extracted document keys against the active schema definition to highlight missing compliance fields."),
    ("Explain Corrections: ", "Produces an instant markdown timeline of human auditor overrides, showing who changed what and why."),
    ("Voice Synthesis & Mic: ", "Built-in speech-to-text input and synthetic speech readout for hands-free auditor review.")
]
for t, d in copilot_info:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s10, 6.8, 1.2, 5.9, 5.7, "AI Authenticity & Forensic Analysis", C_RED_ACCENT)
forensics = [
    ("Mathematical Forensic Checks: ", "Flags tampering when itemized lines or tax rates fail to calculate to the grand total."),
    ("Metadata Producer Verification: ", "Inspects PDF creator strings (e.g., Canva, ReportLab, Adobe Distiller) to identify synthetic generation."),
    ("Font Consistency & Layout Anomalies: ", "Detects mismatched font sizes or unusual alignment that indicates spliced values."),
    ("Overall Authenticity Scoring: ", "Computes a composite Authenticity Score (0-100%) and categorizes risk into LOW, MEDIUM, or HIGH.")
]
for t, d in forensics:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 11: 4 SECTOR INNOVATION HUBS (24 WORKFLOWS)
# =============================================================================
s11 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s11, C_NAVY_DARK)
add_header(s11, "4 Enterprise Sector Innovation Hubs (24 Specialized Workflows)")

hubs = [
    ("Finance & Accounts Payable (6 Workflows)", [
        "Automated 3-Way Purchase Order Matching (Invoice <-> PO <-> Goods Receipt)",
        "Real-Time FX Currency Converter & Reverse Charge Tax",
        "Vendor Bank Account / IBAN Fraud & Verification Guard",
        "Early Payment Dynamic Discount Optimization",
        "E-Way Bill & GSTIN Portal Active Verification",
        "Carbon Offset & Paperless Footprint Metric Estimator"
    ], C_GREEN_ACCENT),
    ("HR & Employee Onboarding (6 Workflows)", [
        "Automated PII Redaction for GDPR & HIPAA Compliance",
        "Global Salary & Relocation Cost Benchmark Normalizer",
        "Identity Document Cross-Verification (Passport vs Driver License)",
        "Automated Background Check Discrepancy Flagging",
        "Visa & Right-to-Work Expiration Timeline Monitor",
        "Automated Relocation Expense Claim Deduplicator"
    ], C_BLUE_ACCENT),
    ("Higher Education Admissions (6 Workflows)", [
        "International GPA Normalizer (WES 4.0 Equivalent Scale)",
        "University Accreditation & UGC / NAAC Registry Validator",
        "Course Prerequisite & Transcript Credit Transfer Mapper",
        "Plagiarism & AI Statement-of-Purpose Anomaly Detector",
        "Standardized Test Score Official Verification (GRE / TOEFL / IELTS)",
        "Tuition Fee Scholarship Eligibility Auto-Scoring Engine"
    ], C_INDIGO_ACCENT),
    ("FinTech, Banking & KYC Compliance (6 Workflows)", [
        "Automated AML & Sanctions PEP List Cross-Check",
        "Biometric Face Matcher (Passport Photo <-> Live Camera Selfie)",
        "Utility Bill Geolocation & Address Proof Matcher",
        "Financial Statement Debt-to-Income & Cash-Flow Analyzer",
        "Tax Return (Form 1040 / ITR-V) Income Consistency Verifier",
        "Credit Risk Profile Scoring & Underwriting Recommender"
    ], C_AMBER_ACCENT)
]

for idx, (hub_title, workflows, col) in enumerate(hubs):
    c_left = 0.6 if idx % 2 == 0 else 6.8
    c_top = 1.2 if idx < 2 else 4.2
    _, tf = create_card(s11, c_left, c_top, 5.9, 2.8, hub_title, col)
    for wf in workflows:
        p = tf.add_paragraph()
        p.text = "• " + wf
        p.font.size = Pt(8.5)
        p.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 12: MODERN MULTI-MODAL FEATURES (CAMERA, COMPARE, VOICE)
# =============================================================================
s12 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s12, C_NAVY_DARK)
add_header(s12, "Modern Multi-Modal Tools: Camera Scan, Compare & Voice")

_, tf = create_card(s12, 0.6, 1.2, 3.8, 5.7, "Direct Webcam Document Scanner", C_TEAL_ACCENT)
cam_features = [
    ("Live Video Stream: ", "Streams camera feed with animated document alignment viewfinder box."),
    ("Hardware Fallback: ", "Graceful handling when webcam is unavailable; supports one-click fixture photo upload."),
    ("Instant Ingestion: ", "Captures canvas snapshot, encodes as PNG, and immediately sends to ingestion pipeline.")
]
for t, d in cam_features:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s12, 4.7, 1.2, 3.8, 5.7, "Side-by-Side Document Compare", C_INDIGO_ACCENT)
comp_features = [
    ("Multi-Doc Selection: ", "Compare two documents (e.g., PO vs Invoice, or Original vs Revision)."),
    ("Diff Matrix: ", "Side-by-side field comparison table with automatic delta calculation."),
    ("Mismatch Highlighting: ", "Highlights discrepancies in red/amber for rapid auditing.")
]
for t, d in comp_features:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s12, 8.8, 1.2, 3.9, 5.7, "AI Voice Copilot & Batch Analytics", C_AMBER_ACCENT)
voice_features = [
    ("Voice Synthesizer: ", "Reads out missing fields and audit flags hands-free."),
    ("Speech Recognition: ", "Allows auditors to ask queries via microphone."),
    ("Batch Analytics: ", "Aggregated throughput, accuracy rate, and category distribution charts.")
]
for t, d in voice_features:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 13: ENTERPRISE MULTI-ERP & WEBHOOK BROADCAST
# =============================================================================
s13 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s13, C_NAVY_DARK)
add_header(s13, "Enterprise Multi-ERP & Webhook Broadcast Integration")

_, tf = create_card(s13, 0.6, 1.2, 5.8, 5.7, "Out-of-the-Box ERP Adapters", C_TEAL_ACCENT)
erp_adapters = [
    ("SAP S/4HANA (OData / IDoc): ", "Formats validated invoice lines into SAP-compliant IDoc XML/JSON for direct posting to Finance Accounting (FI/CO)."),
    ("Salesforce (CRM Cloud): ", "Syncs applicant data, contact records, and KYC compliance records into Salesforce Lead/Contact objects."),
    ("Workday HRIS (REST API): ", "Maps extracted resume/application details directly into Workday Candidate profiles."),
    ("QuickBooks Online (V3 API): ", "Pushes small business vendor invoices directly into Accounts Payable expense entries."),
    ("Custom Webhooks (HTTPS POST): ", "Configurable webhook dispatcher with custom HMAC signatures and retry policies.")
]
for t, d in erp_adapters:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s13, 6.8, 1.2, 5.9, 5.7, "Enterprise Security & Compliance", C_GREEN_ACCENT)
erp_security = [
    ("Live Payload Preview: ", "Auditors can inspect generated JSON/XML payload structures before broadcasting to production systems."),
    ("TLS 1.3 Transport Security: ", "All webhook endpoints enforce end-to-end encrypted HTTPS transmission."),
    ("Audit Dispatch Logging: ", "Every broadcast logs an immutable event in the audit trail with HTTP status code and response payload."),
    ("Export Formats: ", "Supports JSON, CSV, SAP IDoc XML, and direct REST/OData API push.")
]
for t, d in erp_security:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 14: SCALABILITY & 100-CONCURRENT-USER READINESS
# =============================================================================
s14 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s14, C_NAVY_DARK)
add_header(s14, "Scalability & 100-Concurrent-User Readiness")

_, tf = create_card(s14, 0.6, 1.2, 5.8, 5.7, "Reproducible Load Test Benchmark", C_TEAL_ACCENT)
load_stats = [
    ("Simulation Tool: ", "concurrent.futures.ThreadPoolExecutor with 100 active worker threads executing full user workflows."),
    ("Total Requests: ", "600 simultaneous requests executed in 3.71 - 4.47 seconds."),
    ("Success Rate: ", "100.00% (600/600 requests succeeded with zero drops or 500 errors)."),
    ("Failure Rate: ", "0.00% across all endpoints."),
    ("Throughput: ", "134.08 - 161.66 requests per second (RPS)."),
    ("Reproducible Script: ", "Saved at tests/load_test_100_users.py; results saved in tests/load_test_results.json.")
]
for t, d in load_stats:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s14, 6.8, 1.2, 5.9, 5.7, "Latency Percentiles & Architecture Readiness", C_INDIGO_ACCENT)
lat_stats = [
    ("Minimum Latency: ", "5.44 - 7.42 ms"),
    ("Mean Latency: ", "513.22 - 625.85 ms"),
    ("Median Latency (p50): ", "470.78 - 531.58 ms"),
    ("90th Percentile (p90): ", "1,004.66 - 1,462.64 ms"),
    ("95th Percentile (p95): ", "1,199.36 - 1,659.36 ms (~1.2s round-trip under heavy 100-user load)"),
    ("Maximum Latency: ", "1,882.27 - 1,915.43 ms (< 2 seconds maximum)"),
    ("PostgreSQL Migration: ", "Prepared SQLAlchemy URI configuration for instant scale-out to PostgreSQL connection pooling.")
]
for t, d in lat_stats:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_GREEN_ACCENT if "100.00%" in d or "5.44" in d else C_TEXT_MUTED

# =============================================================================
# SLIDE 15: SECURITY, DATA ISOLATION & DATA PROTECTION
# =============================================================================
s15 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s15, C_NAVY_DARK)
add_header(s15, "Security, Data Isolation & Data Protection")

_, tf = create_card(s15, 0.6, 1.2, 5.8, 5.7, "Zero-Trust Security Controls", C_TEAL_ACCENT)
sec_controls = [
    ("Zero Credential Leaks: ", ".env and private database binaries are strictly ignored by .gitignore; safe .env.example provided."),
    ("Server-Side Secrets: ", "GEMINI_API_KEY is never exposed to frontend bundles or pipeline status JSON endpoints."),
    ("Magic Bytes File Signature Check: ", "Validates binary header bytes (%PDF-, PNG magic header) rather than trusting spoofed file extensions."),
    ("Duplicate File Hash Tracking: ", "SHA-256 fingerprinting warns on identical uploads without destructive record overwrites.")
]
for t, d in sec_controls:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s15, 6.8, 1.2, 5.9, 5.7, "Compliance & Multi-Tenant Isolation", C_GREEN_ACCENT)
comp_controls = [
    ("Role-Based Access Control: ", "Separates Standard Reviewer and Enterprise Auditor permissions with JWT sessions."),
    ("Organization Schema Segregation: ", "Schemas, validation rules, and document archives can be isolated per organization tenant."),
    ("Immutable Audit Trail: ", "All document state transitions, human field edits, and export dispatches are logged with timestamps."),
    ("Configurable Retention: ", "Supports automated retention and secure deletion policies for GDPR/HIPAA compliance.")
]
for t, d in comp_controls:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

# =============================================================================
# SLIDE 16: JURY DEMO WALKTHROUGH & WHY DOCUSENSE AI WINS
# =============================================================================
s16 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s16, C_NAVY_DARK)
add_header(s16, "Live Jury Demo Script & Why DocuSense AI Wins")

_, tf = create_card(s16, 0.6, 1.2, 5.8, 5.7, "3-Minute Live Jury Demo Script", C_TEAL_ACCENT)
demo_script = [
    ("Minute 1: Ingestion & Math Check (0:00 - 1:00)", "Upload sample_invoice_conflict.pdf. Show how DocuSense AI immediately flags Subtotal $1,420 vs Grand Total $1,450 arithmetic error and locks in NEEDS_REVIEW."),
    ("Minute 2: Visual Evidence & Audit (1:00 - 2:00)", "Click conflicting total; document canvas highlights the source bounding box. Correct value, provide auditor reason, and click Approve to record the audit log."),
    ("Minute 3: ERP Export & Sector Hubs (2:00 - 3:00)", "Open Enterprise ERP modal to broadcast to SAP/QuickBooks webhooks. Demonstrate 3-Way PO matching and GPA converter in Sector Innovations Hub.")
]
for t, d in demo_script:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    r = p.add_run()
    r.text = "\n" + d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

_, tf = create_card(s16, 6.8, 1.2, 5.9, 5.7, "Why DocuSense AI Wins CBC 2.0", C_GREEN_ACCENT)
win_points = [
    ("1. Genuine Machine Learning: ", "Real Scikit-Learn TF-IDF model with 100% test accuracy on held-out data."),
    ("2. Zero Hallucinations: ", "Deterministic cross-field math prevents false approvals."),
    ("3. Production-Ready UI: ", "Unified workspace, SVG bounding-box highlight, Camera scan, Voice Copilot, Dark/Light mode."),
    ("4. Enterprise ERP Ready: ", "Native adapters for SAP S/4HANA, Salesforce, Workday, QuickBooks."),
    ("5. Tested Under Real 100-User Load: ", "134-161 RPS with 0.00% failure rate.")
]
for t, d in win_points:
    p = tf.add_paragraph()
    p.text = t
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = C_GREEN_ACCENT
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_MUTED

prs.save(pptx_filename)
print(f"Jury presentation saved successfully to: {pptx_filename}")
