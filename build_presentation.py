import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

output_dir = r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI"
pptx_filename = os.path.join(output_dir, "DocuSense_AI_CBC2.0_Design_Submission.pptx")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette Definitions
C_NAVY_DARK = RGBColor(15, 23, 42)      # #0F172A
C_CARD_BG = RGBColor(30, 41, 59)       # #1E293B
C_BLUE_ACCENT = RGBColor(56, 189, 248)  # #38BDF8
C_GREEN_ACCENT = RGBColor(52, 211, 153) # #34D399
C_PURPLE_ACCENT = RGBColor(167, 139, 250) # #A78BFA
C_AMBER_ACCENT = RGBColor(251, 191, 36) # #FBBF24
C_RED_ACCENT = RGBColor(239, 68, 68)    # #EF4444
C_TEXT_WHITE = RGBColor(248, 250, 252)  # #F8FAFC
C_TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8
C_LIGHT_BG = RGBColor(241, 245, 249)    # #F1F5F9
C_WHITE = RGBColor(255, 255, 255)
C_DARK_TEXT = RGBColor(30, 41, 59)

def set_slide_background(slide, color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_header(slide, title_text, category_text="CBC 2.0 HACKATHON | DOMAIN: AI & ML"):
    # Header Banner
    header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.0))
    header_box.fill.solid()
    header_box.fill.fore_color.rgb = C_NAVY_DARK
    header_box.line.color.rgb = C_BLUE_ACCENT
    header_box.line.width = Pt(1.5)

    tf = header_box.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.5)

    p1 = tf.paragraphs[0]
    p1.text = category_text.upper()
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = C_BLUE_ACCENT

    p2 = tf.add_paragraph()
    p2.text = title_text
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = C_TEXT_WHITE

# -------------------------------------------------------------
# SLIDE 1: TITLE SLIDE
# -------------------------------------------------------------
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide1, C_NAVY_DARK)

# Title Card Accent Box
box1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.2), Inches(11.333), Inches(5.1))
box1.fill.solid()
box1.fill.fore_color.rgb = C_CARD_BG
box1.line.color.rgb = C_BLUE_ACCENT
box1.line.width = Pt(2)

tf1 = box1.text_frame
tf1.vertical_anchor = MSO_ANCHOR.MIDDLE
tf1.margin_left = Inches(0.8)

p = tf1.paragraphs[0]
p.text = "CBC 2.0 HACKATHON DESIGN SUBMISSION — ROUND 1"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = C_BLUE_ACCENT
p.alignment = PP_ALIGN.LEFT

p = tf1.add_paragraph()
p.text = "DocuSense AI"
p.font.size = Pt(44)
p.font.bold = True
p.font.color.rgb = C_TEXT_WHITE
p.alignment = PP_ALIGN.LEFT

p = tf1.add_paragraph()
p.text = "Intelligent Document Information Extraction & Validation Platform"
p.font.size = Pt(20)
p.font.color.rgb = C_GREEN_ACCENT
p.alignment = PP_ALIGN.LEFT

p = tf1.add_paragraph()
p.text = "\nProblem Statement #3: Automated Document Extraction & Rule Validation"
p.font.size = Pt(14)
p.font.color.rgb = C_TEXT_MUTED

p = tf1.add_paragraph()
p.text = "Team Name: CACHE CODE | Target: 18-Hour Working Prototype on CPU Laptop Hardware"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = C_AMBER_ACCENT

# -------------------------------------------------------------
# SLIDE 2: PROBLEM DEFINITION & OPERATIONAL BOTTLENECK
# -------------------------------------------------------------
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide2, C_LIGHT_BG)
add_header(slide2, "Section A — Problem Definition & Operational Bottlenecks")

# Left Column Card: The Problem
card_left = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.5))
card_left.fill.solid()
card_left.fill.fore_color.rgb = C_WHITE
card_left.line.color.rgb = C_RED_ACCENT
card_left.line.width = Pt(1.5)

tf = card_left.text_frame
tf.margin_left = Inches(0.3)
tf.margin_right = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "The Existing Manual Document Problem"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = C_RED_ACCENT

bullet_points_left = [
    ("Unstructured Heterogeneity: ", "Organizations process invoices, certificates, and forms with hundreds of non-standard visual layouts."),
    ("High Error Rates: ", "Manual entry yields 3–8% error rates (typos, date format confusion, missing fields)."),
    ("Time-Consuming Bottleneck: ", "Operations personnel spend ~10 minutes per document verifying line items and cross-checking data."),
    ("Poor Scan Quality: ", "Low resolution, mobile photo distortions, and noise render primitive OCR systems ineffective.")
]

for title, desc in bullet_points_left:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(11.5)

# Right Column Card: Practical Impact
card_right = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5))
card_right.fill.solid()
card_right.fill.fore_color.rgb = C_WHITE
card_right.line.color.rgb = C_BLUE_ACCENT
card_right.line.width = Pt(1.5)

tf = card_right.text_frame
tf.margin_left = Inches(0.3)
tf.margin_right = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "DocuSense AI Proposed Solution"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

bullet_points_right = [
    ("Intelligent Automated Processing: ", "End-to-end pipeline covering Upload → Preprocessing → OCR → AI Extraction → Rule Validation → Review."),
    ("Validation-Aware Engine: ", "Instant validation of ISO dates, numeric sanity checks, tax IDs, required fields, and multi-location conflicts."),
    ("Human-in-the-Loop Workflow: ", "Highlights low-confidence scores and validation errors for side-by-side one-click human verification."),
    ("Privacy & Laptop CPU Support: ", "Optimized for lightweight execution without requiring high-cost cloud GPUs.")
]

for title, desc in bullet_points_right:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(11.5)

# -------------------------------------------------------------
# SLIDE 3: USER ROLES & USER JOURNEY
# -------------------------------------------------------------
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide3, C_LIGHT_BG)
add_header(slide3, "Section B — User Roles & End-to-End Journey")

# Roles Table Card
table_shape = slide3.shapes.add_table(4, 3, Inches(0.8), Inches(1.4), Inches(11.7), Inches(2.2))
table = table_shape.table
table.columns[0].width = Inches(2.5)
table.columns[1].width = Inches(4.7)
table.columns[2].width = Inches(4.5)

headers = ["User Role", "Core Responsibilities", "Primary UI View"]
for i, h in enumerate(headers):
    cell = table.cell(0, i)
    cell.text = h
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_NAVY_DARK
    for p in cell.text_frame.paragraphs:
        p.font.bold = True
        p.font.color.rgb = C_TEXT_WHITE
        p.font.size = Pt(11)

roles_data = [
    ("Document User", "Uploads documents, triggers processing jobs, views summary, exports JSON/CSV.", "Upload & Ingestion Dashboard"),
    ("Reviewer / Validator", "Inspects low-confidence fields, resolves validation errors & multi-value conflicts.", "Side-by-Side Review Canvas"),
    ("Schema Admin", "Defines JSON field schemas, configures validation regex rules, sets thresholds.", "Schema & Rule Configurator")
]

for row_idx, data in enumerate(roles_data, start=1):
    for col_idx, text in enumerate(data):
        cell = table.cell(row_idx, col_idx)
        cell.text = text
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_WHITE
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_DARK_TEXT

# Journey Step Box
jbox = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.9), Inches(11.7), Inches(3.1))
jbox.fill.solid()
jbox.fill.fore_color.rgb = C_WHITE
jbox.line.color.rgb = C_GREEN_ACCENT
jbox.line.width = Pt(1.5)

tf = jbox.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.2)

p = tf.paragraphs[0]
p.text = "End-to-End User Journey (5 Key Stages)"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

journey_steps = [
    ("1. Drag & Drop Upload: ", "User drops batch of PDF/PNG files into the dashboard."),
    ("2. Automated Ingestion: ", "OpenCV binarizes scan, PaddleOCR parses text layout, system classifies doc type."),
    ("3. Rule Validation: ", "Pydantic validator flags invalid formats, missing values, or multi-location value conflicts."),
    ("4. Interactive Verification: ", "Reviewer opens side-by-side canvas; SVG overlays highlight bounding boxes on source PDF."),
    ("5. Export & Audit Trail: ", "Approved fields saved to SQLite with reviewer timestamp and exported to ERP JSON/CSV.")
]

for title, desc in journey_steps:
    p = tf.add_paragraph()
    p.text = title
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(11)

# -------------------------------------------------------------
# SLIDE 4: UI/UX WIREFRAME & REVIEW CANVAS
# -------------------------------------------------------------
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide4, C_NAVY_DARK)
add_header(slide4, "Section C — UI/UX Wireframe & Side-by-Side Canvas", "VISUAL INTERFACE & EVIDENCE HIGHLIGHTING")

# Insert generated Wireframe Image
img_path = os.path.join(output_dir, "ui_wireframe_review.png")
if os.path.exists(img_path):
    slide4.shapes.add_picture(img_path, Inches(0.6), Inches(1.3), width=Inches(12.1))

# -------------------------------------------------------------
# SLIDE 5: PROPOSED SYSTEM ARCHITECTURE
# -------------------------------------------------------------
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide5, C_NAVY_DARK)
add_header(slide5, "Section D — Proposed System Architecture Diagram", "TECHNICAL STACK & COMPONENT RESPONSIBILITIES")

# Insert generated Architecture Diagram Image
img_arch = os.path.join(output_dir, "system_architecture.png")
if os.path.exists(img_arch):
    slide5.shapes.add_picture(img_arch, Inches(0.6), Inches(1.2), width=Inches(12.1))

# -------------------------------------------------------------
# SLIDE 6: END-TO-END DATA FLOW PIPELINE
# -------------------------------------------------------------
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide6, C_NAVY_DARK)
add_header(slide6, "Section D (Cont.) — Complete End-to-End Data Processing Flow", "STEP-BY-STEP DATA PROCESSING PIPELINE")

img_flow = os.path.join(output_dir, "data_flow.png")
if os.path.exists(img_flow):
    slide6.shapes.add_picture(img_flow, Inches(0.6), Inches(1.2), width=Inches(12.1))

# -------------------------------------------------------------
# SLIDE 7: AI/ML STRATEGY & LAYERED EXTRACTION PIPELINE
# -------------------------------------------------------------
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide7, C_LIGHT_BG)
add_header(slide7, "Section E — AI/ML Strategy & Layered Pipeline")

card1 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.7), Inches(5.5))
card1.fill.solid()
card1.fill.fore_color.rgb = C_WHITE
card1.line.color.rgb = C_PURPLE_ACCENT
card1.line.width = Pt(1.5)

tf = card1.text_frame
tf.margin_left = Inches(0.4)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "Layered AI Extraction Architecture"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

ai_layers = [
    ("1. OCR & Layout Analysis (PaddleOCR / PyMuPDF): ", "Parses document geometry into tokens with bounding box coordinates [x, y, w, h] and raw OCR confidence scores."),
    ("2. Spatial Anchor Extraction: ", "Locates key text anchors (e.g. 'Invoice Date:', 'Grand Total:') and uses spatial proximity matching (bounding box right/below) to associate values."),
    ("3. Zero-Shot LLM Schema Assistance (Optional Cloud API): ", "Converts OCR bounding box tokens into structured JSON fields matching predefined schema definitions when API is accessible."),
    ("4. Offline Spatial Heuristic Fallback: ", "If external API is offline/unavailable, automatically runs local regex + spatial proximity heuristics to ensure zero downtime."),
    ("5. Confidence Score Calibration Formula: ", "Final Confidence = 0.50*(OCR Confidence) + 0.30*(Spatial Proximity Score) + 0.20*(Validation Rule Signal).")
]

for title, desc in ai_layers:
    p = tf.add_paragraph()
    p.text = title
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_NAVY_DARK
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(11)

# -------------------------------------------------------------
# SLIDE 8: CONFIGURABLE SCHEMAS & EVIDENCE OUTPUT JSON
# -------------------------------------------------------------
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide8, C_NAVY_DARK)
add_header(slide8, "Section E (Cont.) — Configurable Schemas & Output JSON", "STRUCTURED JSON WITH TRACEABILITY METADATA")

card_json = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.3), Inches(11.7), Inches(5.7))
card_json.fill.solid()
card_json.fill.fore_color.rgb = C_CARD_BG
card_json.line.color.rgb = C_GREEN_ACCENT
card_json.line.width = Pt(1.5)

tf = card_json.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.2)

json_snippet = """{
  "document_id": "doc_9f8b2c1a",
  "filename": "vendor_invoice_2026_04.pdf",
  "detected_type": "invoice",
  "overall_validation_status": "REQUIRES_REVIEW",
  "extracted_fields": {
    "invoice_number": {
      "value": "INV-2026-8891",
      "confidence": 0.94,
      "validation_status": "VALID",
      "evidence": { "page_number": 1, "bbox": [140, 520, 160, 680], "raw_ocr_text": "Invoice No: INV-2026-8891" }
    },
    "total_amount": {
      "value": 1450.00,
      "confidence": 0.65,
      "validation_status": "CONFLICT_DETECTED",
      "validation_message": "Conflicting values found ($1,450.00 vs $1,420.00)",
      "conflicting_candidates": [
        { "value": 1450.00, "bbox": [680, 500, 700, 620], "context": "Grand Total: $1,450.00" },
        { "value": 1420.00, "bbox": [520, 500, 540, 620], "context": "Subtotal: $1,420.00" }
      ]
    }
  }
}"""

p = tf.paragraphs[0]
p.text = json_snippet
p.font.name = "Consolas"
p.font.size = Pt(9.5)
p.font.color.rgb = C_TEXT_WHITE

# -------------------------------------------------------------
# SLIDE 9: EDGE-CASE HANDLING & SAFEGUARDS MATRIX
# -------------------------------------------------------------
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide9, C_LIGHT_BG)
add_header(slide9, "Section F — Edge-Case Handling & Mitigation Matrix")

table_shape = slide9.shapes.add_table(6, 4, Inches(0.6), Inches(1.3), Inches(12.133), Inches(5.7))
table = table_shape.table
table.columns[0].width = Inches(2.2)
table.columns[1].width = Inches(3.2)
table.columns[2].width = Inches(3.6)
table.columns[3].width = Inches(3.133)

headers = ["Edge Case Scenario", "System Detection Method", "Automated Pipeline Response", "User Experience (UI)"]
for i, h in enumerate(headers):
    cell = table.cell(0, i)
    cell.text = h
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_NAVY_DARK
    for p in cell.text_frame.paragraphs:
        p.font.bold = True
        p.font.color.rgb = C_TEXT_WHITE
        p.font.size = Pt(10)

edge_data = [
    ("Blurry / Low-Res Scan", "OpenCV Laplacian variance < 100.0", "Applies sharpen kernel & contrast fix; flags low confidence", "Warning banner: 'Low resolution scan detected'"),
    ("Missing Required Field", "Schema required check fails", "Sets status: MISSING; flags doc for review", "Red highlight on field with 'Click to Enter'"),
    ("Invalid Date / Format", "Regex / strptime exception", "Sets INVALID_FORMAT; retains raw string", "Pill alert: 'Unrecognized date format'"),
    ("Conflicting Multi-Value", "Multiple matches with differing values", "Stores primary + candidate array with bboxes", "Conflict Resolver modal with side-by-side bboxes"),
    ("Corrupted / Invalid File", "PyMuPDF fitz.open() failure", "Catches exception; returns HTTP 422 payload", "Error card: 'File could not be parsed'")
]

for row_idx, data in enumerate(edge_data, start=1):
    for col_idx, text in enumerate(data):
        cell = table.cell(row_idx, col_idx)
        cell.text = text
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_WHITE
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_DARK_TEXT

# -------------------------------------------------------------
# SLIDE 10: STRETCH FEATURE — EVIDENCE-LINKED HIGH-LIGHTING
# -------------------------------------------------------------
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide10, C_LIGHT_BG)
add_header(slide10, "Section G — Stretch Feature: Evidence-Linked Source Highlighting")

card_stretch = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.7), Inches(5.5))
card_stretch.fill.solid()
card_stretch.fill.fore_color.rgb = C_WHITE
card_stretch.line.color.rgb = C_BLUE_ACCENT
card_stretch.line.width = Pt(1.5)

tf = card_stretch.text_frame
tf.margin_left = Inches(0.4)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "Traceable SVG Bounding Box Engine"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

features = [
    ("Normalized Coordinate Storage: ", "Bounding box pixel values are converted to percentage-based bounding coordinates: [ymin%, xmin%, ymax%, xmax%]."),
    ("Interactive Canvas Synchronization: ", "Clicking an extracted field in the right panel auto-scrolls the left PDF canvas and triggers a pulsating SVG outline on the exact source text."),
    ("Color-Coded Status Overlays: ", "Green SVG rectangles represent Valid fields; Red represents Format Errors; Amber represents Conflicting values."),
    ("Fallback Text Anchor Matching: ", "If precise bounding box coordinates are unavailable (e.g. digital PDFs without layout bounding box metadata), the UI highlights the surrounding text anchor snippet inside a preview box.")
]

for title, desc in features:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_NAVY_DARK
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(11)

# -------------------------------------------------------------
# SLIDE 11: DATABASE DESIGN & ER DIAGRAM
# -------------------------------------------------------------
slide11 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide11, C_NAVY_DARK)
add_header(slide11, "Section H — Database Design & Relational ER Diagram", "RELATIONAL SCHEMA (SQLITE / SQLALCHEMY)")

img_er = os.path.join(output_dir, "er_diagram.png")
if os.path.exists(img_er):
    slide11.shapes.add_picture(img_er, Inches(0.6), Inches(1.2), width=Inches(12.1))

# -------------------------------------------------------------
# SLIDE 12: SCALABILITY, PRIVACY & TESTING PLAN
# -------------------------------------------------------------
slide12 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide12, C_LIGHT_BG)
add_header(slide12, "Section J & K — Privacy, Security & Testing Framework")

card_j = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.5))
card_j.fill.solid()
card_j.fill.fore_color.rgb = C_WHITE
card_j.line.color.rgb = C_GREEN_ACCENT
card_j.line.width = Pt(1.5)

tf = card_j.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "Privacy, Security & Async Architecture"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

j_points = [
    ("Async Task Queue: ", "FastAPI BackgroundTasks queue decouples file ingestion from UI gateway."),
    ("PII Encryption: ", "Names, emails, and phone numbers encrypted at rest via AES-256."),
    ("Zero Retention Policy: ", "External API calls enforce zero-data-retention headers."),
    ("Local Offline Mode: ", "100% offline PaddleOCR + regex mode for sensitive documents."),
    ("Production Path: ", "Upgrade from SQLite to PostgreSQL + S3 + Redis Celery workers.")
]

for title, desc in j_points:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(10.5)

card_k = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5))
card_k.fill.solid()
card_k.fill.fore_color.rgb = C_WHITE
card_k.line.color.rgb = C_BLUE_ACCENT
card_k.line.width = Pt(1.5)

tf = card_k.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "Testing & Ground-Truth Evaluation"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

k_points = [
    ("Evaluation Metrics: ", "Field extraction precision/recall against manually annotated ground-truth dataset (30 documents)."),
    ("Latency Target: ", "< 12 seconds per multi-page document on standard laptop CPUs."),
    ("Test Matrix Coverage: ", "Includes clean PDFs, blurry phone photos, missing values, invalid date formats, and conflicting line items."),
    ("Human Correction Rate: ", "Measures time saved by human reviewer during side-by-side verification.")
]

for title, desc in k_points:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(10.5)

# -------------------------------------------------------------
# SLIDE 13: 18-HOUR IMPLEMENTATION PLAN & TEAM DIVISION
# -------------------------------------------------------------
slide13 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide13, C_LIGHT_BG)
add_header(slide13, "Section L — 18-Hour Execution Roadmap & Team Responsibilities")

# Team Table
table_shape = slide13.shapes.add_table(5, 3, Inches(0.8), Inches(1.3), Inches(11.7), Inches(2.3))
table = table_shape.table
table.columns[0].width = Inches(2.2)
table.columns[1].width = Inches(2.5)
table.columns[2].width = Inches(7.0)

headers = ["Team Member", "Core Role", "Primary Technical Ownership"]
for i, h in enumerate(headers):
    cell = table.cell(0, i)
    cell.text = h
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_NAVY_DARK
    for p in cell.text_frame.paragraphs:
        p.font.bold = True
        p.font.color.rgb = C_TEXT_WHITE
        p.font.size = Pt(10)

team_data = [
    ("Member 1", "AI / OCR Lead", "PyMuPDF parsing, PaddleOCR engine, spatial key-value & LLM extraction pipeline."),
    ("Member 2", "Backend & DB Lead", "FastAPI REST endpoints, SQLite data models, validation engine & job queue."),
    ("Member 3", "Frontend Lead", "React + TS UI, dashboard, side-by-side SVG overlay canvas & review form."),
    ("Member 4", "Integration & QA Lead", "End-to-end integration, edge-case test dataset, JSON/CSV exports & pitch demo script.")
]

for row_idx, data in enumerate(team_data, start=1):
    for col_idx, text in enumerate(data):
        cell = table.cell(row_idx, col_idx)
        cell.text = text
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_WHITE
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_DARK_TEXT

# Milestones Box
mbox = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.8), Inches(11.7), Inches(3.2))
mbox.fill.solid()
mbox.fill.fore_color.rgb = C_WHITE
mbox.line.color.rgb = C_AMBER_ACCENT
mbox.line.width = Pt(1.5)

tf = mbox.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.2)

p = tf.paragraphs[0]
p.text = "18-Hour Milestone Timetable"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = C_NAVY_DARK

milestones = [
    ("Hours 0-1: ", "Setup & Interface Agreements — Initialize Git, FastAPI scaffold, OpenAPI spec, React Vite project."),
    ("Hours 1-5: ", "Parallel Component Build — M1 OCR pipeline, M2 FastAPI & SQLite DB, M3 React canvas UI, M4 test corpus."),
    ("Hours 5-9: ", "First Pipeline Integration — Connect upload API to OCR & render extracted fields on UI."),
    ("Hours 9-13: ", "Validation & Review Workflow — Integrate format validators, conflict flagger & review form."),
    ("Hours 13-15: ", "High-Value Differentiator — Implement SVG evidence bounding box highlighting & canvas auto-scroll."),
    ("Hours 15-18: ", "End-to-End Testing & Rehearsal — Run full test matrix, verify exports, freeze code & rehearse pitch.")
]

for title, desc in milestones:
    p = tf.add_paragraph()
    p.text = title
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_DARK_TEXT
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(10)

# -------------------------------------------------------------
# SLIDE 14: DEMO SCENARIO & UNIQUE VALUE PROPOSITION
# -------------------------------------------------------------
slide14 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide14, C_NAVY_DARK)
add_header(slide14, "Section M & N — Demo Scenario & Unique Value Proposition", "HACKATHON PITCH & COMPETITIVE ADVANTAGE")

card_demo = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.5))
card_demo.fill.solid()
card_demo.fill.fore_color.rgb = C_CARD_BG
card_demo.line.color.rgb = C_BLUE_ACCENT
card_demo.line.width = Pt(1.5)

tf = card_demo.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "3-Minute Live Demo Walkthrough"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = C_BLUE_ACCENT

demo_steps = [
    ("1. Batch Upload (0:00-0:35): ", "Upload clean invoice, missing date cert & conflicting invoice."),
    ("2. Automated Flagging (0:35-1:15): ", "Show dashboard auto-flagging missing date and conflicting total."),
    ("3. Evidence Highlighting (1:15-2:05): ", "Click conflicting total; PDF auto-scrolls to highlighted bboxes ($1,450 vs $1,420)."),
    ("4. One-Click Override (2:05-2:40): ", "Select correct total, fill missing date, click Approve."),
    ("5. Export (2:40-3:00): ", "Download clean structured JSON & CSV export.")
]

for title, desc in demo_steps:
    p = tf.add_paragraph()
    p.text = title
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_TEXT_WHITE
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(10)
    run.font.color.rgb = C_TEXT_MUTED

card_uvp = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5))
card_uvp.fill.solid()
card_uvp.fill.fore_color.rgb = C_CARD_BG
card_uvp.line.color.rgb = C_GREEN_ACCENT
card_uvp.line.width = Pt(1.5)

tf = card_uvp.text_frame
tf.margin_left = Inches(0.3)
tf.margin_top = Inches(0.3)

p = tf.paragraphs[0]
p.text = "Unique Value Proposition (UVP)"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = C_GREEN_ACCENT

uvp_points = [
    ("Validation-First Architecture: ", "Goes beyond raw OCR text by enforcing automated business rules and format validation."),
    ("Transparent Evidence Highlighting: ", "Eliminates black-box AI errors by linking every value to SVG source bounding boxes."),
    ("Multi-Location Conflict Resolver: ", "Intelligently flags and presents competing candidate values instead of silent overwrites."),
    ("Laptop CPU Optimization: ", "Runs efficiently on standard developer laptops without expensive GPU infrastructure.")
]

for title, desc in uvp_points:
    p = tf.add_paragraph()
    p.text = "• " + title
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_WHITE
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.size = Pt(10.5)
    run.font.color.rgb = C_TEXT_MUTED

prs.save(pptx_filename)
print(f"Presentation saved successfully to: {pptx_filename}")
