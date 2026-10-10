# DocuSense AI — Working Prototype Documentation & Execution Guide
**CBC 2.0 Hackathon Implementation Round**
**Domain:** AI & ML | **Problem Statement #3:** AI-Based Document Information Extractor  
**Team Name:** CACHE CODE | **Team ID:** 004  
**College:** Sapthagiri NPS University  

---

## 1. Executive Summary & Implementation Status

DocuSense AI is a fully functional, end-to-end intelligent document extraction, format validation, and human-in-the-loop review platform built specifically for laptop CPU execution without requiring high-cost cloud GPUs.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           IMPLEMENTATION STATUS: 100% WORKING                   │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Core Capability      │ Runtime Status & Implementation Detail                   │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Multi-Format Upload  │ Functional (PDF, PNG, JPG, TIFF multi-file batch upload) │
│ Classification       │ Functional (Invoice, Certificate, Application Form)      │
│ Schema Extraction    │ Functional (Schema-driven spatial anchor key-value maps) │
│ Validation Engine    │ Functional (ISO dates, regex, cross-field sum math check)│
│ Conflict Detection   │ Functional (Flags competing values across doc locations) │
│ Side-by-Side Canvas  │ Functional (Interactive SVG bounding box overlay canvas) │
│ Human Review & Patch │ Functional (Inline field editing, audit log, approve/rej)│
│ Persistence & Export │ Functional (SQLite relational DB, JSON & CSV downloads)  │
└──────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture & Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS (`/frontend/`)
- **Backend:** Python + FastAPI + Pydantic + SQLAlchemy (`/backend/`)
- **Parsing & Preprocessing:** PyMuPDF (`fitz`) for PDF text & page geometry; OpenCV (`cv2`) for scan deskewing and blur evaluation.
- **Database:** SQLite relational database (`docusense.db`) storing Documents, Jobs, Fields, Issues, and Audit Corrections.

---

## 3. How to Run the Application

### Option A: Using Launcher Script (Recommended)
```bash
python start_app.py
```
This automatically initializes SQLite tables, generates synthetic test PDFs in `/sample_docs`, launches the FastAPI backend on `http://localhost:8000`, and launches the React frontend on `http://localhost:5173`.

### Option B: Manual Service Launch

#### 1. Backend Server
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger OpenAPI Docs:** `http://localhost:8000/docs`

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- **Frontend URL:** `http://localhost:5173`

---

## 4. Environment Variables (`.env.example`)

```env
# DocuSense AI Environment Configuration
DATABASE_URL=sqlite:///./docusense.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
```

---

## 5. Automated Test Results

### Automated PyTest Backend Suite (`tests/test_backend.py`)
```bash
python -m pytest tests/test_backend.py -v
```
**Results:** `3 passed in 1.16s`
- `test_health_check` PASSED
- `test_get_schemas` PASSED
- `test_document_upload_and_extraction_workflow` PASSED

### Live End-to-End Ingestion Suite (`test_live_ingestion.py`)
```bash
python test_live_ingestion.py
```
**Results:**
- `sample_invoice.pdf`: Auto-classified as `INVOICE`. Subtotal `$1,200.00`, Tax `$250.00`, Total `$1,200.00`. Raised `ARITHMETIC_MISMATCH` warning: `Subtotal ($1200.00) + Tax ($250.00) = $1450.00, but Total Amount is $1200.00`.
- `sample_invoice_conflict.pdf`: Auto-classified as `INVOICE`. Detected multi-candidate conflict on `Total Amount`.
- `sample_certificate.pdf`: Auto-classified as `CERTIFICATE`. Recipient `Alex M`, Date `2026-09-15`, ID `CERT-AI-2026-7712`.
- `sample_application.pdf`: Auto-classified as `APPLICATION_FORM`. Applicant `Sarah Jenkins`, Email `sarah.jenkins@techcorp.io`, Phone `+1 555-019-2834`. Status: `APPROVED`.

---

## 6. Files Created / Modified

- `backend/app/main.py` — Main FastAPI application entry point.
- `backend/app/config.py` — Upload directory, file limits, DB URL configuration.
- `backend/app/database.py` — SQLAlchemy engine and session management.
- `backend/app/models.py` — Relational models (`Document`, `ProcessingJob`, `ExtractionSchema`, `ExtractedField`, `ValidationIssue`, `ReviewCorrection`).
- `backend/app/schemas.py` — Pydantic request/response schemas.
- `backend/app/services/ocr_engine.py` — PyMuPDF geometry extraction & OpenCV quality evaluation.
- `backend/app/services/classifier.py` — Document category classifier.
- `backend/app/services/extractor.py` — Schema field extraction & multi-candidate conflict finder.
- `backend/app/services/validator.py` — Validation engine for format checks, ISO dates, email/phone regex, and invoice math logic.
- `backend/app/services/export_service.py` — JSON and CSV export formatter.
- `backend/app/routes/documents.py` — REST endpoints for upload, job tracking, results, field patching, review, and export.
- `backend/app/routes/health.py` — Health check endpoint (`GET /api/health`).
- `backend/app/routes/schemas_route.py` — Schema endpoint (`GET /api/schemas`).
- `frontend/src/App.tsx` — Main React application.
- `frontend/src/components/Header.tsx` — Header component with branding and view navigation tabs.
- `frontend/src/components/UploadZone.tsx` — Multi-file drag-and-drop upload component.
- `frontend/src/components/DocumentList.tsx` — Document repository list table with filter and search.
- `frontend/src/components/SideBySideReviewCanvas.tsx` — Evidence review canvas with SVG coordinate overlays and conflict resolution.
- `frontend/src/components/IntegrityPanel.tsx` — Integrity metrics panel.
- `frontend/src/components/SchemaViewer.tsx` — Configurable schema viewer.
- `sample_docs/generate_sample_docs.py` — Synthetic PDF test generator.
- `tests/test_backend.py` — Pytest test suite.
- `test_live_ingestion.py` — End-to-end ingestion verification script.
- `start_app.py` — Full-stack application launcher.

---
*DocuSense AI — CACHE CODE (Team ID 004)*
