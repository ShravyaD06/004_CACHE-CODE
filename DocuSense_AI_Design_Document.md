# DocuSense AI — Technical Design Document & Implementation Blueprint
**CBC 2.0 Hackathon Submission — Round 1 Design Document**
**Domain:** AI & ML | **Problem Statement #3:** Intelligent Document Information Extraction & Validation Platform  
**Team Name:** CACHE CODE | **Project Name:** DocuSense AI  

---

## Executive Summary

**DocuSense AI** is an intelligent, privacy-first, enterprise-grade document information extraction and validation platform engineered specifically to operate efficiently on standard commodity hardware (ordinary laptops without dedicated GPUs). Organizations deal daily with unstructured invoices, certificates, identity documents, and application forms. Traditional template-based OCR systems break whenever document layouts shift, while manual data entry is slow, expensive, and error-prone (suffering 3–8% human entry error rates).

DocuSense AI bridges this gap through a **validation-aware, human-in-the-loop extraction pipeline**. Combining PyMuPDF parsing, OpenCV preprocessing, PaddleOCR text extraction, zero-shot LLM spatial understanding, robust Python format/rule validation engines, and interactive SVG evidence-bounding-box highlighting, DocuSense AI converts unstructured documents into verified structured JSON/CSV data with full traceability.

---

## Section A — Problem & Proposed Solution

### A.1 The Manual Document Processing Problem
In modern enterprise operations (finance, HR, compliance, healthcare, education), processing incoming unstructured documents is a critical operational bottleneck:
1. **Layout Heterogeneity:** Invoices from 100 vendors exhibit 100 distinct visual layouts (single vs. multi-column, line-item tables, header/footer positioning variations).
2. **Manual Entry Errors:** Keying numbers, IBANs, tax IDs, and dates manually leads to transposition errors, date format misinterpretations (MM/DD/YYYY vs. DD/MM/YYYY), and missing required fields.
3. **High Operational Overhead:** Accounts Payable teams spend up to 12 minutes per invoice verifying line items, cross-calculating taxes, and copying data into ERPs.
4. **Scanned Quality Degradation:** Distorted scans, watermarks, smartphone photos, and low DPI scans cause standard OCR tools to fail silently or return garbage strings.

### A.2 Proposed Solution: DocuSense AI
DocuSense AI is an end-to-end web application that automates document ingestion, classification, field extraction, validation, and correction:

```
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────────┐    ┌────────────────────┐
│ Upload Document │ ─► │ Auto-Classification│ ─► │ AI Field Extraction │ ─► │ Format & Business  │
│ (PDF / Image)   │    │ & Layout Parsing   │    │ & Confidence Scoring│    │  Rule Validation   │
└─────────────────┘    └────────────────────┘    └─────────────────────┘    └──────────┬─────────┘
                                                                                       │
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────────┐               ▼
│ Export JSON/CSV │ ◄─ │ Persistence & Audit│ ◄─ │ Side-by-Side Human  │ ◄── [ Validation Alerts ]
│  to Enterprise  │    │   Record Storage   │    │ Correction Overlay  │     [ & Conflict Flags  ]
└─────────────────┘    └────────────────────┘    └─────────────────────┘
```

### A.3 Target Users & Key Use Cases
- **Accounts Payable & Finance:** Automated processing of vendor invoices, line item extraction, GST/Tax validation, and cross-sum verification.
- **HR & Onboarding Teams:** Extraction of employee certificates, academic transcripts, identity documents, and resume credentials.
- **Customer Operations & Admissions:** Verification of submitted application forms, contact details, identification numbers, and signature presence checks.

### A.4 Measurable Operational Benefits
- **80%+ Reduction in Processing Time:** Reduces document processing lifecycle from ~10 minutes down to ~15 seconds per document.
- **Zero Silent Errors:** Automated validation rules instantly highlight invalid dates, tax numbers, missing fields, or arithmetic discrepancies.
- **100% Traceability:** Every extracted value is linked directly to its visual bounding box location on the original document for instant side-by-side verification.

---

## Section B — User Roles & Responsibilities

DocuSense AI enforces a role-based access model designed for practical hackathon execution while maintaining enterprise realism:

| Role | Core Responsibilities | System Permissions | Primary UI View |
| :--- | :--- | :--- | :--- |
| **Document Processing User** | Uploads documents, triggers batch jobs, views extraction status, downloads structured exports. | Read/Write own uploaded documents; Execute extraction jobs; Export CSV/JSON. | Ingestion Dashboard & Batch Status |
| **Reviewer / Validator** | Inspects low-confidence fields, resolves validation errors, resolves multi-location value conflicts, manually overrides fields. | Read/Write assigned documents; Update field values; Approve/Reject documents. | Side-by-Side Review & Verification Canvas |
| **Schema Configurator / Admin** | Defines new document schemas, specifies required fields, sets validation regex/rules, configures OCR confidence thresholds. | Full Admin control; Create/Edit Schema definitions; System audit log access. | Schema Configuration & Rule Builder |

### End-to-End User Journey Walkthrough
1. **Ingestion:** User uploads a batch of 5 invoices (PDF/PNG) via drag-and-drop.
2. **Automated Processing:** System preprocesses images, runs PaddleOCR, auto-detects document type as "Invoice", extracts fields, and runs validation logic in <10 seconds.
3. **Alerting:** Document 1 passes cleanly (Green). Document 2 has an invalid date format and a conflicting total amount (Red Flag).
4. **Review & Correction:** Reviewer clicks Document 2, sees the original PDF alongside extracted fields. The conflicting "Total Amount" field highlights both candidate locations on the PDF page. The reviewer selects the correct summary total with one click.
5. **Persistence & Export:** The corrected state is persisted with audit metadata (Who, When, Old Value, New Value) and exported as standardized JSON for ERP consumption.

---

## Section C — UI/UX Screen Architecture & Wireframe Specifications

The visual interface follows a sleek **Modern Enterprise Document AI Design** (Dark Slate Header, Clean White/Neutral Grey Content canvas, Emerald/Amber/Rose status badges, smooth SVG overlays).

### Screen 1: Dashboard & Batch Upload Interface
- **Header:** Brand title "DocuSense AI", Role Selector (User/Reviewer/Admin), Processing Status summary pills (Total Processed, Pending Review, Clean Approvals).
- **Upload Zone:** Prominent drag-and-drop zone supporting `.pdf`, `.png`, `.jpeg`, `.tiff` (Max 20MB per file). Multi-file batch selector.
- **Recent Jobs Table:** Lists filename, document type badge, upload time, status progress bar, and action buttons (`View Results`, `Re-process`).

### Screen 2: Document Type Selection & Auto-Detection Confirmation
- Displays auto-detected document type (e.g., "Detected: Invoice — 94% Confidence").
- Provides a clean fallback dropdown menu allowing users to override detected type (Invoice, Academic Certificate, Application Form, Custom Schema).

### Screen 3: Live Batch Processing Status Modal/View
- Visual stepper showing pipeline stages:
  1. `File Preprocessing` (OpenCV deskew & binarization)
  2. `OCR Text Extraction` (PaddleOCR text + bounding box layout)
  3. `Structured Field Parsing` (LLM/Spatial Schema Mapper)
  4. `Validation Engine Execution` (Pydantic format & logic checks)
- Real-time progress percentage bar and log output.

### Screen 4: Extracted Fields & Confidence Score Cards
- Summary grid of extracted key-value pairs.
- Confidence Score Badges:
  - **Green Badge (High Confidence > 85%):** Value accepted automatically.
  - **Yellow Badge (Medium Confidence 60–85%):** Flagged for optional verification.
  - **Red Badge (Low Confidence < 60% / Validation Failed):** Requires mandatory reviewer check.

### Screen 5: Side-by-Side Document & Evidence Viewer (Stretch Differentiator)
- **Left Panel (60% width):** Interactive PDF/Image viewer rendered via PDF.js. Displays SVG bounding box rectangles highlighted over the exact text location in the source document.
- **Right Panel (40% width):** Form fields corresponding to extracted values. Clicking a field on the right auto-scrolls and highlights its bounding box on the PDF canvas on the left.

### Screen 6: Validation Errors, Missing Values & Conflict Resolution Interface
- **Validation Error Callouts:** Red banner detailing rule violations (e.g., `"Invalid ISO Date format: '31/02/2024'"`, `"Missing required field: vendor_tax_id"`).
- **Multi-Location Conflict Resolution Card:** Displays when candidate values exist in multiple document regions:
  - *Location A (Header):* `Total: $1,450.00` [Confidence: 89%]
  - *Location B (Footer line item sum):* `Total: $1,420.00` [Confidence: 74%]
  - *Action:* Radio selection buttons allowing reviewer to pick Location A, Location B, or input a manual value.

### Screen 7: Manual Correction & One-Click Approval Workflow
- Editable input fields with real-time format validation re-evaluation.
- Clear visual indicator for modified fields: `"Edited by Reviewer (Was: 'Inv-O12')"`.
- Action Bar: `Reject Document`, `Save Draft`, `Approve & Persist`.

### Screen 8: Results History, Audit Log & Export Center
- Filterable document archive (Search by vendor, date range, status).
- One-click export modal supporting `JSON` (Structured Pydantic format), `CSV` (Flat matrix format), and `API Push` (Webhook triggers).

---

## Section D — System Architecture & Data Flow

### D.1 Technical Stack & Component Rationale

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND USER INTERFACE                               │
│              React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons         │
│          PDF.js / React-PDF Canvas Rendering (SVG Bounding Box Overlay)         │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ REST API (JSON / Multipart)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FASTAPI BACKEND                                    │
│          Asynchronous REST API Gateway + Pydantic Data Contract Engine          │
└──────────────────┬─────────────────────┬──────────────────┬─────────────────────┘
                   │                     │                  │
                   ▼                     ▼                  ▼
┌──────────────────────┐  ┌──────────────────┐  ┌─────────────────────────────────┐
│   FILE PREPROCESSING │  │    OCR ENGINE    │  │  AI UNDERSTANDING & EXTRACTION  │
│  PyMuPDF (fitz) PDF  │  │   PaddleOCR /    │  │ Configurable Spatial Regex +    │
│  OpenCV Image Fixes  │  │  Tesseract OCR   │  │ External LLM API (Gemini/Groq)  │
└──────────────────────┘  └──────────────────┘  └─────────────────────────────────┘
                   │                     │                  │
                   └─────────────────────┼──────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VALIDATION ENGINE                                  │
│       Python Format Rules (ISO Dates, Tax IDs, Regex) + Cross-Field Math        │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PERSISTENCE & STORAGE LAYER                              │
│       SQLite Database (SQLAlchemy ORM) + Local File Store (/uploads)           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Stack Justification
1. **Frontend (React + TypeScript + Tailwind CSS):** Enables rapid build of interactive side-by-side PDF canvas viewers, dynamic SVG bounding box rendering, and responsive form components.
2. **Backend (FastAPI):** High-performance Python async framework with native OpenAPI schema generation and Pydantic validation integration.
3. **File Preprocessing (PyMuPDF & OpenCV):** PyMuPDF provides high-speed vector PDF text extraction without rendering raster images. OpenCV handles camera-captured images (deskewing, binarization, contrast adjustment).
4. **OCR Engine (PaddleOCR):** Ultra-lightweight, high-accuracy OCR engine optimized for CPU execution on standard laptops. Provides bounding boxes `[x, y, w, h]` and per-word confidence.
5. **AI Extraction Engine:** Hybrid pipeline. Utilizes spatial structural key-value matching coupled with external zero-shot LLM APIs (e.g. Gemini 1.5 Flash / Groq) when internet access is available, fallback to spatial heuristics when offline.
6. **Validation Engine:** Python Pydantic models enforcing regex patterns, date standardizations, currency number parsing, and arithmetic sanity checks (e.g. `Subtotal + Tax == GrandTotal`).
7. **Database (SQLite):** Zero-configuration local relational database ideal for hackathon evaluation, easily upgradable to PostgreSQL for production deployments.

### D.2 Complete Data Flow Pipeline

```
[ Upload Document File ]
          │
          ▼
[ File Validation & Format Check ] ──(Invalid File)──► [ Reject with 400 Error ]
          │
          ▼
[ PyMuPDF Vector Text Extraction / OpenCV Binarization ]
          │
          ▼
[ PaddleOCR Engine ] ──► Extracts Text Blocks + Bounding Box Coordinates + Confidence Scores
          │
          ▼
[ Document Classification ] ──► (Matches Keywords/Structure -> e.g. "Invoice")
          │
          ▼
[ Configurable Field Extraction ] ──► Maps Text Blocks to JSON Schema Fields
          │
          ▼
[ Validation & Cross-Field Rules ] ──► Evaluates Regex, Dates, Math & Conflict Detection
          │
          ▼
┌─────────┴─────────┐
│ Validation Pass?  │
└────┬──────────┬───┘
     │ YES      │ NO / Low Confidence
     ▼          ▼
[ Auto-    [ Flag for Human Review ] ──► [ Side-by-Side Review Canvas ]
 Approve ]      │                              │ (User Overrides Values)
     │          │                              │
     └──────────┴──────────────┬───────────────┘
                               │
                               ▼
               [ Database Persistence (SQLite) ]
                               │
                               ▼
               [ Structured Export (JSON / CSV) ]
```

---

## Section E — AI/ML Strategy, Extraction Schemas & Pipeline Architecture

### E.1 Layered AI/ML Pipeline
1. **Preprocessing & Image Enhancement:** OpenCV contrast binarization (`cv2.adaptiveThreshold`) and orientation deskewing via Hough line transforms.
2. **OCR & Spatial Layout Extraction:** PaddleOCR parses document geometry, generating structured bounding box tokens: `(text, confidence, [x_min, y_min, x_max, y_max])`.
3. **Classification Strategy:** Multi-stage classifier. First checks keyword anchor density (e.g., presence of `"Invoice"`, `"Tax"`, `"Certificate of Completion"`, `"Application Form"`). If ambiguous, passes top-50 token snippet to a lightweight zero-shot prompt.
4. **Configurable Structured Extraction:**
   - **Spatial Key-Value Extraction:** Searches for field key anchors (e.g. `"Total Amount:"`, `"Date:"`) and evaluates bounding box spatial proximity (text to the right or directly below).
   - **Zero-Shot LLM Extraction (When API Available):** System passes OCR tokens + bounding boxes to LLM with strict JSON Schema output constraints.
5. **Confidence Signal Calibration:** Combined confidence formula:
   $$\text{Final Confidence} = 0.50 \times \text{OCR Token Confidence} + 0.30 \times \text{Spatial Match Score} + 0.20 \times \text{Validation Rule Pass Signal}$$

### E.2 Configurable Schema Definitions

#### Schema 1: Vendor Invoice Schema (`invoice_schema.json`)
```json
{
  "document_type": "invoice",
  "display_name": "Vendor Tax Invoice",
  "fields": [
    {
      "field_key": "invoice_number",
      "label": "Invoice Number",
      "data_type": "string",
      "required": true,
      "validation_regex": "^[A-Za-z0-9\\-\\/]{3,30}$"
    },
    {
      "field_key": "invoice_date",
      "label": "Invoice Date",
      "data_type": "date",
      "required": true,
      "expected_format": "YYYY-MM-DD"
    },
    {
      "field_key": "vendor_name",
      "label": "Vendor / Supplier Name",
      "data_type": "string",
      "required": true
    },
    {
      "field_key": "total_amount",
      "label": "Total Amount",
      "data_type": "currency",
      "required": true
    },
    {
      "field_key": "tax_amount",
      "label": "Tax / VAT Amount",
      "data_type": "currency",
      "required": false
    }
  ],
  "cross_field_rules": [
    {
      "rule_type": "sum_check",
      "formula": "subtotal + tax_amount == total_amount",
      "tolerance": 0.05
    }
  ]
}
```

#### Schema 2: Academic / Professional Certificate Schema (`certificate_schema.json`)
```json
{
  "document_type": "certificate",
  "display_name": "Certificate of Completion / Degree",
  "fields": [
    {
      "field_key": "holder_name",
      "label": "Recipient / Holder Name",
      "data_type": "string",
      "required": true
    },
    {
      "field_key": "certificate_name",
      "label": "Title of Certificate / Course",
      "data_type": "string",
      "required": true
    },
    {
      "field_key": "issuing_organization",
      "label": "Issuing Authority / Institution",
      "data_type": "string",
      "required": true
    },
    {
      "field_key": "issue_date",
      "label": "Date of Issuance",
      "data_type": "date",
      "required": true
    },
    {
      "field_key": "certificate_id",
      "label": "Credential ID / Serial No.",
      "data_type": "string",
      "required": false
    }
  ]
}
```

#### Schema 3: Membership / Official Application Form Schema (`application_schema.json`)
```json
{
  "document_type": "application_form",
  "display_name": "Official Application Form",
  "fields": [
    {
      "field_key": "applicant_name",
      "label": "Full Applicant Name",
      "data_type": "string",
      "required": true
    },
    {
      "field_key": "email",
      "label": "Email Address",
      "data_type": "email",
      "required": true,
      "validation_regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    },
    {
      "field_key": "phone",
      "label": "Contact Phone Number",
      "data_type": "phone",
      "required": true,
      "validation_regex": "^\\+?[0-9\\s\\-\\(\\)]{7,15}$"
    },
    {
      "field_key": "application_id",
      "label": "Application Ref Number",
      "data_type": "string",
      "required": true
    }
  ]
}
```

### E.3 Complete Output JSON Structure with Traceability & Validation Metadata
```json
{
  "document_id": "doc_9f8b2c1a",
  "filename": "vendor_invoice_2026_04.pdf",
  "detected_type": "invoice",
  "classification_confidence": 0.96,
  "processing_timestamp": "2026-10-10T12:15:00Z",
  "overall_validation_status": "REQUIRES_REVIEW",
  "extracted_fields": {
    "invoice_number": {
      "value": "INV-2026-8891",
      "confidence": 0.94,
      "validation_status": "VALID",
      "validation_message": null,
      "evidence": {
        "page_number": 1,
        "bbox": [140, 520, 160, 680],
        "raw_ocr_text": "Invoice No: INV-2026-8891"
      }
    },
    "invoice_date": {
      "value": "2026-09-28",
      "confidence": 0.88,
      "validation_status": "VALID",
      "validation_message": "Parsed successfully from '28/09/2026'",
      "evidence": {
        "page_number": 1,
        "bbox": [140, 700, 160, 820],
        "raw_ocr_text": "Date: 28/09/2026"
      }
    },
    "vendor_name": {
      "value": "Acme Cloud Solutions Inc.",
      "confidence": 0.92,
      "validation_status": "VALID",
      "validation_message": null,
      "evidence": {
        "page_number": 1,
        "bbox": [60, 80, 95, 380],
        "raw_ocr_text": "Acme Cloud Solutions Inc."
      }
    },
    "total_amount": {
      "value": 1450.00,
      "confidence": 0.65,
      "validation_status": "CONFLICT_DETECTED",
      "validation_message": "Conflicting values found in document ($1,450.00 vs $1,420.00)",
      "conflicting_candidates": [
        {
          "value": 1450.00,
          "bbox": [680, 500, 700, 620],
          "page_number": 1,
          "context_text": "Grand Total: $1,450.00"
        },
        {
          "value": 1420.00,
          "bbox": [520, 500, 540, 620],
          "page_number": 1,
          "context_text": "Subtotal: $1,420.00"
        }
      ],
      "evidence": {
        "page_number": 1,
        "bbox": [680, 500, 700, 620],
        "raw_ocr_text": "Grand Total: $1,450.00"
      }
    }
  }
}
```

---

## Section F — Edge-Case Handling & Mitigation Matrix

The system features robust safeguards across all document degradation and edge-case scenarios:

| # | Edge Case Scenario | System Detection Method | Automated Pipeline Response | User Experience (UI Feedback) |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Blurry / Low-Res Scan** | OpenCV Laplacian variance score below threshold ($Var < 100.0$). | Applies sharpen kernel & contrast equalization; triggers low-confidence flag. | Displays warning banner: *"Low resolution scan detected. Review confidence scores carefully."* |
| **2** | **Missing Required Field** | Schema validator checks required field dictionary key against extracted keys. | Assigns `validation_status: "MISSING"` and flags document status as `REQUIRES_REVIEW`. | Field input box highlighted in bold red with placeholder *"Missing Required Field — Click to Enter"*. |
| **3** | **Invalid Date / Numeric Format** | Regex parsing or Pydantic `datetime.strptime` failure. | Sets `validation_status: "INVALID_FORMAT"` and retains raw unparsed text string. | Shows inline error pill: *"Unrecognized date format '31-13-2024'. Correct to YYYY-MM-DD"*. |
| **4** | **Conflicting Values Multi-Location** | Spatial extractor finds multiple candidate matches for same key with different values. | Stores primary match AND array of `conflicting_candidates` with bounding box coordinates. | Renders a "Conflict Resolver" modal showing both values side-by-side with clickable highlights. |
| **5** | **Unknown Layout / Category** | Classifier confidence score below minimum cutoff ($< 0.50$). | Assigns generic dynamic extraction schema; flags document type as `"Unclassified"`. | Displays prompt: *"Unknown layout detected. Select matching document type from dropdown."* |
| **6** | **Corrupted / Unsupported File** | PyMuPDF `fitz.open()` or PIL `Image.open()` raises exception. | Catches exception instantly; returns 422 HTTP payload with diagnostic string. | Renders error card: *"File could not be parsed. Please re-upload as a valid PDF, PNG, or JPG."* |
| **7** | **Multi-Page Document** | PyMuPDF page count check ($Pages > 1$). | Iterates OCR extraction per page; aggregates results with page-indexed evidence. | PDF viewer renders multi-page thumbnail sidebar; jumps auto-scroll to exact target page. |
| **8** | **API Timeout / Network Loss** | HTTPX client catches timeout exception on external LLM call ($Timeout > 8s$). | Automatically falls back to offline spatial OCR key-value heuristic extraction engine. | Sub-toast notification: *"LLM connection timed out. Extracted using local spatial OCR engine."* |
| **9** | **Simultaneous Multi-Upload** | Endpoint receives list of `UploadFile` objects in single payload. | Creates separate background `ProcessingJob` entry per file; queues sequential tasks. | Batch Upload table shows individual real-time progress bars for all files concurrently. |

---

## Section G — Stretch Feature: Evidence-Linked Extraction (Source Highlighting)

### G.1 Architectural Design of Evidence Tracking
To eliminate "black-box" AI extraction distrust, DocuSense AI anchors every single extracted field value to its exact physical coordinate in the source document.

#### Coordinate Normalization & Storage Model
PaddleOCR provides absolute pixel bounding box coordinates `[x1, y1, x2, y2]` based on raw image rendering. PyMuPDF provides PDF point coordinates `[x0, y0, x1, y1]`. To ensure cross-resolution compatibility:
- Bounding box coordinates are converted into **normalized percentages** relative to page width ($W$) and height ($H$):
  $$\text{ymin} = \frac{y_1}{H} \times 100, \quad \text{xmin} = \frac{x_1}{W} \times 100, \quad \text{ymax} = \frac{y_2}{H} \times 100, \quad \text{xmax} = \frac{x_2}{W} \times 100$$

### G.2 Interactive Frontend Bounding Box Renderer
```tsx
// Frontend SVG Box Highlight Component (React + TypeScript)
interface EvidenceHighlightProps {
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in %
  status: 'VALID' | 'INVALID_FORMAT' | 'CONFLICT_DETECTED';
  isSelected: boolean;
}

export const EvidenceHighlightOverlay: React.FC<EvidenceHighlightProps> = ({ bbox, status, isSelected }) => {
  const [ymin, xmin, ymax, xmax] = bbox;
  const colorMap = {
    VALID: 'border-emerald-500 bg-emerald-500/20',
    INVALID_FORMAT: 'border-rose-500 bg-rose-500/25',
    CONFLICT_DETECTED: 'border-amber-500 bg-amber-500/25',
  };

  return (
    <div
      className={`absolute border-2 rounded transition-all duration-200 pointer-events-none ${colorMap[status]} ${
        isSelected ? 'ring-4 ring-indigo-500 scale-105 z-30' : 'z-10'
      }`}
      style={{
        top: `${ymin}%`,
        left: `${xmin}%`,
        width: `${xmax - xmin}%`,
        height: `${ymax - ymin}%`,
      }}
    />
  );
};
```

#### Fallback Highlight Mechanism
If precise bounding box coordinates cannot be extracted (e.g., digitized native text PDFs without spatial OCR layout info), the system highlights the raw text string snippet inside a visual text preview box with a badge *"Matched via Text Anchor"*.

---

## Section H — Database Schema & Relational Entity-Relationship (ER) Model

### H.1 Relational Schema Definitions (SQLite / SQLAlchemy)

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────────┐
│     Users       │       │    Documents    │       │    ProcessingJobs    │
├─────────────────┤       ├─────────────────┤       ├──────────────────────┤
│ PK  id          │1     *│ PK  id          │1     *│ PK  id               │
│     email       │◄──────│ FK  user_id     │◄──────│ FK  document_id      │
│     role        │       │     filename    │       │     status           │
│     created_at  │       │     filepath    │       │     progress_pct     │
└─────────────────┘       │     doc_type    │       │     error_log        │
                          │     status      │       └──────────────────────┘
                          └────────┬────────┘
                                   │1
                                   │
                                   │*
                          ┌────────┴────────┐
                          │ ExtractedFields │
                          ├─────────────────┤
                          │ PK  id          │
                          │ FK  document_id │
                          │     field_key   │
                          │     value       │
                          │     confidence  │
                          │     bbox_json   │
                          └────────┬────────┘
                                   │1
                                   ├────────────────────────┐
                                   │*                       │*
                          ┌────────┴────────┐      ┌────────┴────────┐
                          │ ValidationIssues│      │ReviewCorrections│
                          ├─────────────────┤      ├─────────────────┤
                          │ PK  id          │      │ PK  id          │
                          │ FK  field_id    │      │ FK  field_id    │
                          │     issue_type  │      │ FK  user_id     │
                          │     message     │      │     old_value   │
                          └─────────────────┘      │     new_value   │
                                                   └─────────────────┘
```

#### Entity Details
1. **`users`**: User authentication and role management (`user_id`, `email`, `hashed_password`, `role` ['admin', 'reviewer', 'user']).
2. **`documents`**: Document storage records (`id`, `user_id`, `original_filename`, `storage_path`, `mime_type`, `file_size_bytes`, `detected_doc_type`, `processing_status` ['queued', 'processing', 'completed', 'failed', 'requires_review'], `uploaded_at`).
3. **`processing_jobs`**: Job queue tracking (`id`, `document_id`, `current_stage`, `progress_percent`, `started_at`, `completed_at`, `error_message`).
4. **`extraction_schemas`**: Configurable field schemas (`id`, `document_type`, `display_name`, `schema_json`, `is_active`).
5. **`extracted_fields`**: Extracted key-value pairs (`id`, `document_id`, `field_key`, `field_label`, `extracted_value`, `confidence_score`, `validation_status`, `page_number`, `bbox_ymin`, `bbox_xmin`, `bbox_ymax`, `bbox_xmax`, `raw_text`).
6. **`validation_issues`**: Audit rule violations (`id`, `field_id`, `document_id`, `issue_type` ['MISSING', 'INVALID_FORMAT', 'CONFLICT', 'CROSS_FIELD_MATH'], `severity`, `message`).
7. **`review_corrections`**: Audit trail of human overrides (`id`, `field_id`, `document_id`, `reviewed_by_user_id`, `original_value`, `corrected_value`, `correction_reason`, `timestamp`).

---

## Section I — FastAPI REST API Specifications

### Endpoint 1: Upload Document Payload
- **HTTP Method:** `POST /api/documents/upload`
- **Content-Type:** `multipart/form-data`
- **Request Payload:** `file: UploadFile`, `override_type: Optional[str]`
- **Response Payload (202 Accepted):**
```json
{
  "status": "success",
  "message": "Document uploaded and queued for processing",
  "document_id": "doc_9f8b2c1a",
  "job_id": "job_3d2a1b4c",
  "filename": "vendor_invoice_2026_04.pdf",
  "uploaded_at": "2026-10-10T12:15:00Z"
}
```

### Endpoint 2: Get Processing Job Status
- **HTTP Method:** `GET /api/jobs/{job_id}`
- **Response Payload (200 OK):**
```json
{
  "job_id": "job_3d2a1b4c",
  "document_id": "doc_9f8b2c1a",
  "status": "PROCESSING",
  "current_stage": "OCR_TEXT_EXTRACTION",
  "progress_percent": 45,
  "started_at": "2026-10-10T12:15:01Z"
}
```

### Endpoint 3: Fetch Document Extraction Results & Evidence
- **HTTP Method:** `GET /api/documents/{document_id}/results`
- **Response Payload (200 OK):** (Returns complete JSON detailed in Section E.3 with fields, confidence scores, evidence bounding boxes, and validation issues).

### Endpoint 4: Inline Patch Field Correction
- **HTTP Method:** `PATCH /api/documents/{document_id}/fields/{field_id}`
- **Request Body:**
```json
{
  "corrected_value": "1450.00",
  "correction_reason": "Verified against PDF header summary"
}
```
- **Response Payload (200 OK):**
```json
{
  "status": "updated",
  "field_id": "fld_7712",
  "updated_value": "1450.00",
  "validation_status": "VALIDATED_BY_HUMAN",
  "updated_at": "2026-10-10T12:18:22Z"
}
```

### Endpoint 5: Submit Final Review & Approval
- **HTTP Method:** `POST /api/documents/{document_id}/review`
- **Request Body:** `{"action": "APPROVE", "notes": "All conflicts resolved"}`
- **Response Payload (200 OK):** `{"status": "APPROVED", "document_id": "doc_9f8b2c1a"}`

### Endpoint 6: Export Structured Data
- **HTTP Method:** `GET /api/documents/{document_id}/export?format=json` (Optionally `format=csv`)
- **Response Payload:** Structured JSON payload or downloadable `.csv` attachment with header columns: `document_id, doc_type, field_key, field_value, confidence, status, verified_by`.

---

## Section J — Scalability, Privacy & Security Architecture

### J.1 Asynchronous Background Queue & Concurrency
To prevent HTTP gateway request blocking during long-running OCR or LLM operations:
1. File upload writes binary file to disk and immediately registers a job entry in SQLite.
2. Background task (FastAPI `BackgroundTasks` for prototype, upgradable to `Celery + Redis`) processes the job asynchronously.
3. Frontend polls `GET /api/jobs/{job_id}` every 1,500ms until status transitions to `COMPLETED` or `REQUIRES_REVIEW`.

### J.2 Data Privacy & Security Policies
- **PII Protection:** Email addresses, phone numbers, and names are encrypted at rest using AES-256 inside SQLite/PostgreSQL.
- **Zero Third-Party Retention Policy:** When utilizing external LLM APIs for extraction assistance, requests enforce zero-data-retention headers (`"X-Data-Retention": "false"`).
- **Local Fallback Mode:** Operates 100% offline using PaddleOCR + Local Regex spatial parsers without sending data over the public internet when processing sensitive compliance documents.
- **API Key Isolation:** Third-party LLM API keys are managed exclusively via server-side `.env` environment variables and are NEVER exposed to client JS bundles.

### J.3 Prototype vs. Production Upgrade Matrix

| Architectural Subsystem | Hackathon Prototype (18-Hour Build) | Enterprise Production Target |
| :--- | :--- | :--- |
| **Relational Database** | SQLite 3 (SQLAlchemy ORM) | PostgreSQL with Read Replicas |
| **File Object Storage** | Local Disk Storage (`/backend/uploads/`) | AWS S3 / Azure Blob Storage with CDN |
| **Task Queue Engine** | FastAPI `BackgroundTasks` async queue | Redis + Celery distributed worker nodes |
| **OCR Compute Hardware** | CPU multi-threading (PaddleOCR CPU) | NVIDIA CUDA GPU acceleration nodes |
| **User Authentication** | Simple JWT Bearer Token / Role header | OAuth2 / SAML 2.0 Enterprise SSO |

---

## Section K — Testing, Quality Assurance & Evaluation Framework

### K.1 Ground-Truth Evaluation Methodology
System performance will be evaluated against a curated ground-truth test corpus of 30 documents (10 Invoices, 10 Certificates, 10 Application Forms):

$$\text{Field Accuracy} = \frac{\text{Number of Correctly Extracted Fields}}{\text{Total Ground-Truth Fields}} \times 100$$

$$\text{Validation Precision} = \frac{\text{True Validation Flags Raised}}{\text{True Flags Raised} + \text{False Alarms}} \times 100$$

### K.2 Comprehensive Edge-Case Test Matrix

| Test Suite ID | Document Variant | Input Description | Expected System Output | Acceptance Criteria |
| :-: | :--- | :--- | :--- | :--- |
| **TC-01** | Clean Tax Invoice | High DPI PDF invoice with standard layout. | 100% field extraction; `Status: APPROVED`. | Zero validation errors; confidence > 90%. |
| **TC-02** | Missing Required Field | Invoice missing `invoice_number`. | Flags `invoice_number` as `MISSING`. | Document status moves to `REQUIRES_REVIEW`. |
| **TC-03** | Date Format Anomaly | Certificate with date written as `28th Oct 2026`. | Standardizes date value to `2026-10-28`. | Validation engine successfully normalizes ISO date. |
| **TC-04** | Value Conflict | Application form with phone number in header vs body. | Flags `phone` as `CONFLICT_DETECTED`. | UI renders conflict selection cards with bboxes. |
| **TC-05** | Low DPI Blurry Scan | 100 DPI camera image of an invoice. | Triggers blur warning banner. | System retains extracted text & prompts user review. |
| **TC-06** | Corrupted File Payload | Renamed `.txt` file with `.pdf` extension. | Rejects upload instantly with HTTP 422. | Displays graceful error message without server crash. |

---

## Section L — 18-Hour Implementation Plan & Team Role Division

### L.1 Team Member Role Breakdown (4-Person Team)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         CACHE CODE — TEAM RESPONSIBILITIES                     │
├───────────────────┬───────────────────┬───────────────────┬────────────────────┤
│ MEMBER 1 (AI/OCR) │ MEMBER 2 (BACKEND)│ MEMBER 3 (FRONTEND│ MEMBER 4 (INTEGR)  │
├───────────────────┼───────────────────┼───────────────────┼────────────────────┤
│ • PyMuPDF &       │ • FastAPI REST API│ • React + Vite UI │ • End-to-End Flow  │
│   OpenCV Pipeline │   Gateway Setup   │   Layout & Theme  │   Integration      │
│ • PaddleOCR       │ • SQLite Data     │ • Drag & Drop File│ • Edge-Case Test   │
│   Engine setup    │   Models & DB     │   Upload Component│   Corpus Creation  │
│ • Key-Value & LLM │ • Validation Rules│ • Side-by-Side PDF│ • Structured Export│
│   Extraction Logic│   & Math Checks   │   SVG Viewer      │   JSON/CSV Formatting│
│ • Bounding Box    │ • Background Job  │ • Review & Edit   │ • Demo Scripting & │
│   Normalization   │   Queue Engine    │   Form Cards      │   Final Pitch Deck │
└───────────────────┴───────────────────┴───────────────────┴────────────────────┘
```

### L.2 18-Hour Milestone Execution Schedule

```
Hours 0-1   [ Setup, Data Contracts & API Schema Agreement ]
            └─ Set up Git repository, FastAPI scaffold, React Vite project, OpenAPI spec.

Hours 1-5   [ Parallel Core Component Development ]
            ├─ M1: Build PyMuPDF + PaddleOCR extraction module.
            ├─ M2: Implement FastAPI endpoints + SQLite ORM schema + validation engine.
            ├─ M3: Build React Dashboard, Upload UI & Side-by-side SVG overlay canvas.
            └─ M4: Prepare test document dataset (Clean, Blurry, Invalid, Conflicting).

Hours 5-9   [ First Pipeline Integration (Upload -> OCR -> Extracted Fields) ]
            └─ Connect Frontend Upload to FastAPI, execute OCR, render fields on UI.

Hours 9-13  [ Validation Logic, Conflict Detection & Review Workflow ]
            └─ Wire format validators, multi-location conflict flagger, and inline review form.

Hours 13-15 [ High-Value Differentiator & Evidence Bounding Box Highlighting ]
            └─ Fine-tune SVG bounding box hover/click auto-scroll synchronization on PDF canvas.

Hours 15-17 [ End-to-End System Testing, Edge-Case Verification & Export Engine ]
            └─ Run full test matrix, fix UI glitches, verify JSON/CSV export reliability.

Hours 17-18 [ Code Freeze, Demo Rehearsal & Submission Finalization ]
            └─ Lock code baseline, rehearse 3-minute live pitch demo, package final artifacts.
```

---

## Section M — Live Hackathon Demo Scenario & Walkthrough Script

### 3-Minute Demo Pitch Sequence
1. **0:00 – 0:35 | The Problem & Live Upload:**
   - *Presenter:* "Manual document entry is slow and breaks on varying layouts. Here is DocuSense AI."
   - *Action:* Drag and drop 3 documents simultaneously (1 Clean Invoice, 1 Certificate with missing date, 1 Invoice with conflicting totals). Show live progress queue.
2. **0:35 – 1:15 | Automated Extraction & Validation Flagging:**
   - *Presenter:* "Within 8 seconds, DocuSense AI auto-classifies the documents and runs strict format validation."
   - *Action:* Show Dashboard summary. Document 1 is green. Document 2 shows amber missing date alert. Document 3 shows red conflict flag.
3. **1:15 – 2:05 | Side-by-Side Evidence Highlighting & Conflict Resolution:**
   - *Presenter:* "Notice how we eliminate black-box AI errors using evidence-linked extraction."
   - *Action:* Click Document 3. Click the conflicting "Total Amount" field. Show the PDF canvas automatically scroll and highlight two bounding boxes on the document page ($1,450.00 vs $1,420.00). Click the correct $1,450.00 value to resolve the conflict instantly.
4. **2:05 – 2:40 | Manual Correction & Audit Log Persistence:**
   - *Action:* Correct Document 2's missing date via the inline editor. Click "Approve & Persist". Show SQLite database updating with full reviewer audit metadata.
5. **2:40 – 3:00 | Structured Export & UVP Summary:**
   - *Action:* Download structured JSON and CSV files. Show clean schema output ready for ERP integration. Conclude pitch.

---

## Section N — Unique Value Proposition (UVP) & Competitive Matrix

### Why DocuSense AI Outperforms Standard OCR Tools

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPETITIVE DIFFERENTIATION                           │
├──────────────────────┬──────────────────────┬───────────────────────────────────┤
│ Feature Category     │ Traditional OCR      │ DocuSense AI Platform             │
├──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Layout Adaptation    │ Rigid Template Rules │ Flexible AI Spatial Extraction    │
│ Error Detection      │ Silent Failures      │ Automated Format & Business Math  │
│ Traceability         │ Raw Plain Text       │ Interactive SVG Source Highlighting│
│ Conflict Handling    │ Overwrites Silently  │ Multi-Location Candidate Resolution│
│ Hardware Requirement │ Requires Cloud GPUs  │ Optimized for Laptop CPU Runtime  │
└──────────────────────┴──────────────────────┴───────────────────────────────────┘
```

---

## Section O — Risk Analysis & Future Production Roadmap

### O.1 Technical & Operational Risks with Mitigations
1. **Risk: Complex Multi-Column Table Layout Errors**
   - *Mitigation:* PyMuPDF structural block analysis groups table cells by horizontal coordinate alignment before passing to extraction engine.
2. **Risk: Offline Environment Without External LLM API Access**
   - *Mitigation:* Native spatial keyword-proximity regex engine acts as a 100% offline fallback, requiring zero cloud API connectivity.
3. **Risk: Heavy PDF Memory Consumption on Laptop Hardware**
   - *Mitigation:* PyMuPDF streams pages lazily and downsamples high-res raster images to 200 DPI before running PaddleOCR.

### O.2 Future Enterprise Expansion Roadmap
- **Phase 1 (Post-Hackathon):** Multilingual handwriting OCR support using fine-tuned TrOCR models.
- **Phase 2 (Cloud Scale):** Deployment on Kubernetes clusters with Redis task distribution and PostgreSQL storage.
- **Phase 3 (Enterprise Integration):** Pre-built SAP, Salesforce, and Workday ERP connector webhooks for zero-code enterprise data ingestion.

---
*End of Design Document — CACHE CODE (CBC 2.0 Hackathon)*
