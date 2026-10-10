import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# Output directory for images
output_dir = r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI"
os.makedirs(output_dir, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -------------------------------------------------------------
# 1. SYSTEM ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Colors
    bg_dark = '#0F172A' # Navy background
    card_bg = '#1E293B'
    accent_blue = '#38BDF8'
    accent_green = '#34D399'
    accent_purple = '#A78BFA'
    accent_amber = '#FBBF24'
    text_white = '#F8FAFC'
    text_muted = '#94A3B8'

    fig.patch.set_facecolor(bg_dark)

    # Title
    ax.text(7, 7.5, "DocuSense AI — System Architecture & Data Pipeline", 
            color=text_white, fontsize=18, fontweight='bold', ha='center', va='center')
    ax.text(7, 7.1, "CBC 2.0 Hackathon Design Submission | Team CACHE CODE", 
            color=accent_blue, fontsize=11, ha='center', va='center')

    # Layer 1: Frontend
    box_fe = patches.FancyBboxPatch((0.5, 5.0), 3.5, 1.6, boxstyle="round,pad=0.1", 
                                    ec=accent_blue, fc=card_bg, lw=2)
    ax.add_patch(box_fe)
    ax.text(2.25, 6.2, "User Interface (React + TS)", color=accent_blue, fontsize=12, fontweight='bold', ha='center')
    ax.text(2.25, 5.7, "• Tailwind CSS / Lucide Icons\n• PDF.js Side-by-Side Canvas\n• Interactive SVG Highlighting\n• Multi-File Batch Upload", 
            color=text_white, fontsize=9, ha='center', va='center')

    # Layer 2: API Gateway & Backend
    box_be = patches.FancyBboxPatch((5.0, 5.0), 4.0, 1.6, boxstyle="round,pad=0.1", 
                                    ec=accent_green, fc=card_bg, lw=2)
    ax.add_patch(box_be)
    ax.text(7.0, 6.2, "Backend Gateway (FastAPI)", color=accent_green, fontsize=12, fontweight='bold', ha='center')
    ax.text(7.0, 5.7, "• Async Endpoints (REST / Multipart)\n• Pydantic Schema Contracts\n• Background Task Execution Queue\n• Auth & Role Access Control", 
            color=text_white, fontsize=9, ha='center', va='center')

    # Layer 3: Core AI Processing Modules
    box_ai = patches.FancyBboxPatch((0.5, 2.2), 12.5, 2.2, boxstyle="round,pad=0.1", 
                                    ec=accent_purple, fc='#111827', lw=2)
    ax.add_patch(box_ai)
    ax.text(6.75, 4.0, "Core Processing & AI Extraction Engine", color=accent_purple, fontsize=13, fontweight='bold', ha='center')

    # Sub-modules
    sub_modules = [
        ("File Preprocessing\n(PyMuPDF / OpenCV)", 1.8, "Deskew, Binarize,\nVector Parsing"),
        ("OCR Engine\n(PaddleOCR)", 4.8, "Text Blocks,\nBounding Box [x,y,w,h]"),
        ("AI Extraction & Mapping\n(Spatial Key-Value / LLM)", 7.8, "Schema Mapping,\nConfidence Scoring"),
        ("Validation Engine\n(Python Format Rules)", 10.8, "ISO Dates, Regex, Math,\nConflict Detector")
    ]

    for title, x_pos, desc in sub_modules:
        sbox = patches.FancyBboxPatch((x_pos - 1.25, 2.5), 2.5, 1.2, boxstyle="round,pad=0.05", 
                                      ec=text_muted, fc=card_bg, lw=1)
        ax.add_patch(sbox)
        ax.text(x_pos, 3.4, title, color=text_white, fontsize=9, fontweight='bold', ha='center')
        ax.text(x_pos, 2.8, desc, color=text_muted, fontsize=8, ha='center')

    # Layer 4: Storage
    box_db = patches.FancyBboxPatch((5.0, 0.3), 4.0, 1.3, boxstyle="round,pad=0.1", 
                                    ec=accent_amber, fc=card_bg, lw=2)
    ax.add_patch(box_db)
    ax.text(7.0, 1.3, "Persistence Layer (SQLite / File Store)", color=accent_amber, fontsize=11, fontweight='bold', ha='center')
    ax.text(7.0, 0.7, "• Documents & Processing Jobs\n• Extracted Bounding Box Fields\n• Validation Issues & Review Audit Log", 
            color=text_white, fontsize=8.5, ha='center', va='center')

    # Connections (Arrows)
    ax.annotate('', xy=(5.0, 5.8), xytext=(4.0, 5.8),
                arrowprops=dict(arrowstyle="->", color=accent_blue, lw=2))
    ax.annotate('', xy=(7.0, 4.4), xytext=(7.0, 5.0),
                arrowprops=dict(arrowstyle="->", color=accent_green, lw=2))
    ax.annotate('', xy=(7.0, 1.6), xytext=(7.0, 2.2),
                arrowprops=dict(arrowstyle="->", color=accent_purple, lw=2))
    ax.annotate('', xy=(4.0, 5.2), xytext=(5.0, 5.2),
                arrowprops=dict(arrowstyle="<-", color=accent_amber, lw=2))

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "system_architecture.png"), dpi=300, facecolor=bg_dark)
    plt.close()
    print("Saved system_architecture.png")

# -------------------------------------------------------------
# 2. DATA FLOW FLOWCHART
# -------------------------------------------------------------
def create_data_flow_diagram():
    fig, ax = plt.subplots(figsize=(14, 7), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 7)
    ax.axis('off')

    bg_dark = '#0F172A'
    card_bg = '#1E293B'
    accent_blue = '#38BDF8'
    text_white = '#F8FAFC'
    text_muted = '#94A3B8'
    fig.patch.set_facecolor(bg_dark)

    ax.text(7, 6.5, "DocuSense AI — Complete End-to-End Data Processing Flow", 
            color=text_white, fontsize=16, fontweight='bold', ha='center')

    steps = [
        ("1. Upload", "PDF / PNG File", 1.0, '#3B82F6'),
        ("2. Parse & OCR", "PyMuPDF / Paddle", 3.0, '#8B5CF6'),
        ("3. Classify", "Invoice / Cert / Form", 5.0, '#EC4899'),
        ("4. Extract", "Schema JSON Mapping", 7.0, '#10B981'),
        ("5. Validate", "Regex / Math Check", 9.0, '#F59E0B'),
        ("6. Review", "Human Verification", 11.0, '#EF4444'),
        ("7. Export", "Structured JSON / CSV", 13.0, '#06B6D4'),
    ]

    for title, desc, x, color in steps:
        box = patches.FancyBboxPatch((x - 0.8, 3.5), 1.6, 2.0, boxstyle="round,pad=0.1", 
                                    ec=color, fc=card_bg, lw=2)
        ax.add_patch(box)
        ax.text(x, 4.8, title, color=color, fontsize=11, fontweight='bold', ha='center')
        ax.text(x, 4.1, desc, color=text_white, fontsize=8.5, ha='center', va='center')

    # Connections
    for i in range(len(steps) - 1):
        x1 = steps[i][2] + 0.8
        x2 = steps[i+1][2] - 0.8
        ax.annotate('', xy=(x2, 4.5), xytext=(x1, 4.5),
                    arrowprops=dict(arrowstyle="->", color=accent_blue, lw=2))

    # Condition branch box for validation pass
    ax.annotate('', xy=(9.0, 1.8), xytext=(9.0, 3.5),
                arrowprops=dict(arrowstyle="->", color='#10B981', lw=2))
    ax.text(9.2, 2.6, "Pass (Clean)", color='#10B981', fontsize=9, fontweight='bold')

    pass_box = patches.FancyBboxPatch((7.8, 0.5), 2.4, 1.2, boxstyle="round,pad=0.1", 
                                      ec='#10B981', fc=card_bg, lw=2)
    ax.add_patch(pass_box)
    ax.text(9.0, 1.2, "Auto-Approve &\nDirect Persist", color='#10B981', fontsize=9.5, fontweight='bold', ha='center')

    ax.annotate('', xy=(13.0, 1.2), xytext=(10.2, 1.2),
                arrowprops=dict(arrowstyle="->", color='#10B981', lw=2))

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "data_flow.png"), dpi=300, facecolor=bg_dark)
    plt.close()
    print("Saved data_flow.png")

# -------------------------------------------------------------
# 3. ENTITY RELATIONSHIP (ER) DIAGRAM
# -------------------------------------------------------------
def create_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    bg_dark = '#0F172A'
    card_bg = '#1E293B'
    accent_blue = '#38BDF8'
    text_white = '#F8FAFC'
    text_muted = '#94A3B8'
    fig.patch.set_facecolor(bg_dark)

    ax.text(7, 7.5, "DocuSense AI — Relational Database ER Diagram (SQLite / SQLAlchemy)", 
            color=text_white, fontsize=16, fontweight='bold', ha='center')

    tables = [
        ("Users", 1.5, 5.0, ["PK  id (UUID)", "email (VARCHAR)", "role (ENUM)", "created_at"]),
        ("Documents", 5.0, 5.0, ["PK  id (UUID)", "FK  user_id", "filename", "doc_type", "status"]),
        ("ProcessingJobs", 8.5, 5.0, ["PK  id (UUID)", "FK  document_id", "status", "progress_pct"]),
        ("ExtractionSchemas", 12.0, 5.0, ["PK  id (UUID)", "doc_type", "schema_json", "is_active"]),
        ("ExtractedFields", 3.0, 1.5, ["PK  id (UUID)", "FK  document_id", "field_key", "value", "confidence", "bbox_json"]),
        ("ValidationIssues", 7.0, 1.5, ["PK  id (UUID)", "FK  field_id", "issue_type", "severity", "message"]),
        ("ReviewCorrections", 11.0, 1.5, ["PK  id (UUID)", "FK  field_id", "FK  user_id", "old_val", "new_val", "timestamp"])
    ]

    for name, x, y, cols in tables:
        box = patches.FancyBboxPatch((x - 1.2, y - 1.2), 2.4, 2.2, boxstyle="round,pad=0.1", 
                                    ec=accent_blue, fc=card_bg, lw=1.5)
        ax.add_patch(box)
        ax.text(x, y + 0.7, name, color=accent_blue, fontsize=11, fontweight='bold', ha='center')
        col_text = "\n".join(cols)
        ax.text(x, y - 0.3, col_text, color=text_white, fontsize=8, ha='center', va='center')

    # Relationships Lines
    ax.plot([2.7, 3.8], [5.0, 5.0], color=text_muted, lw=1.5, ls='--') # Users -> Documents
    ax.plot([6.2, 7.3], [5.0, 5.0], color=text_muted, lw=1.5, ls='--') # Documents -> ProcessingJobs
    ax.plot([5.0, 3.0], [3.8, 2.7], color=text_muted, lw=1.5, ls='--') # Documents -> ExtractedFields
    ax.plot([4.2, 5.8], [1.5, 1.5], color=text_muted, lw=1.5, ls='--') # ExtractedFields -> ValidationIssues
    ax.plot([4.2, 9.8], [1.2, 1.2], color=text_muted, lw=1.5, ls='--') # ExtractedFields -> ReviewCorrections

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "er_diagram.png"), dpi=300, facecolor=bg_dark)
    plt.close()
    print("Saved er_diagram.png")

# -------------------------------------------------------------
# 4. SIDE-BY-SIDE UI REVIEW WIREFRAME
# -------------------------------------------------------------
def create_ui_wireframe():
    fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    bg_dark = '#0F172A'
    panel_bg = '#1E293B'
    accent_blue = '#38BDF8'
    text_white = '#F8FAFC'
    text_muted = '#94A3B8'
    fig.patch.set_facecolor(bg_dark)

    # Header Bar
    ax.add_patch(patches.Rectangle((0, 7.2), 14, 0.8, fc='#0284C7'))
    ax.text(0.5, 7.55, "DocuSense AI", color=text_white, fontsize=14, fontweight='bold', va='center')
    ax.text(3.0, 7.55, "|  Review & Evidence Highlight Canvas — Vendor Invoice #INV-2026-8891", color='#E0F2FE', fontsize=10, va='center')
    ax.text(12.5, 7.55, "User: Reviewer", color=text_white, fontsize=9, va='center')

    # Left Panel: PDF Document Canvas
    ax.add_patch(patches.FancyBboxPatch((0.4, 0.4), 7.8, 6.5, boxstyle="square,pad=0", fc='#FFFFFF', ec='#475569', lw=2))
    ax.text(4.3, 6.5, "TAX INVOICE", color='#0F172A', fontsize=14, fontweight='bold', ha='center')
    ax.text(1.0, 6.0, "Acme Cloud Solutions Inc.\n100 Tech Park, Suite 400", color='#334155', fontsize=8)
    ax.text(6.0, 6.0, "Invoice No: INV-2026-8891\nDate: 28/09/2026", color='#334155', fontsize=8)

    # Draw table in PDF
    ax.plot([1.0, 7.5], [5.0, 5.0], color='#94A3B8', lw=1)
    ax.text(1.2, 5.1, "Item Description", color='#0F172A', fontsize=8, fontweight='bold')
    ax.text(5.5, 5.1, "Qty", color='#0F172A', fontsize=8, fontweight='bold')
    ax.text(6.8, 5.1, "Amount", color='#0F172A', fontsize=8, fontweight='bold')

    ax.text(1.2, 4.6, "Cloud Hosting Server (Monthly)", color='#334155', fontsize=8)
    ax.text(5.5, 4.6, "1", color='#334155', fontsize=8)
    ax.text(6.8, 4.6, "$1,200.00", color='#334155', fontsize=8)

    ax.text(1.2, 4.2, "Managed Security Addon", color='#334155', fontsize=8)
    ax.text(5.5, 4.2, "1", color='#334155', fontsize=8)
    ax.text(6.8, 4.2, "$220.00", color='#334155', fontsize=8)

    # Highlight Bounding Boxes on PDF
    # Green Box: Invoice Number
    ax.add_patch(patches.Rectangle((5.8, 5.9), 1.9, 0.4, fill=True, fc='#10B981', alpha=0.3, ec='#10B981', lw=2))
    ax.text(7.8, 6.1, "89%", color='#10B981', fontsize=7, fontweight='bold')

    # Amber/Red Box: Conflicting Total
    ax.add_patch(patches.Rectangle((5.8, 2.5), 1.6, 0.4, fill=True, fc='#EF4444', alpha=0.35, ec='#EF4444', lw=2))
    ax.text(5.8, 2.6, "Subtotal: $1,420.00", color='#0F172A', fontsize=8, fontweight='bold')

    ax.add_patch(patches.Rectangle((5.8, 2.0), 1.6, 0.4, fill=True, fc='#F59E0B', alpha=0.35, ec='#F59E0B', lw=2))
    ax.text(5.8, 2.1, "Grand Total: $1,450.00", color='#0F172A', fontsize=8, fontweight='bold')
    ax.text(7.5, 2.1, "CONFLICT", color='#EF4444', fontsize=7, fontweight='bold')

    # Right Panel: Extracted Fields Form
    ax.add_patch(patches.FancyBboxPatch((8.5, 0.4), 5.1, 6.5, boxstyle="round,pad=0.1", fc=panel_bg, ec='#475569', lw=1.5))
    ax.text(11.05, 6.5, "Extracted Fields & Validation", color=accent_blue, fontsize=12, fontweight='bold', ha='center')

    fields_data = [
        ("Invoice Number", "INV-2026-8891", "HIGH (94%)", '#10B981'),
        ("Invoice Date", "2026-09-28", "HIGH (88%)", '#10B981'),
        ("Vendor Name", "Acme Cloud Solutions Inc.", "HIGH (92%)", '#10B981'),
        ("Total Amount", "$1,450.00", "CONFLICT FLAG", '#EF4444'),
    ]

    y_pos = 5.6
    for label, val, status_str, status_color in fields_data:
        ax.text(8.8, y_pos, label, color=text_white, fontsize=9, fontweight='bold')
        ax.add_patch(patches.FancyBboxPatch((8.8, y_pos - 0.45), 3.2, 0.35, fc='#0F172A', ec='#334155', lw=1))
        ax.text(9.0, y_pos - 0.28, val, color='#F8FAFC', fontsize=9)
        
        # Status Pill
        ax.add_patch(patches.FancyBboxPatch((12.1, y_pos - 0.45), 1.3, 0.35, fc=status_color, ec=status_color, lw=1))
        ax.text(12.75, y_pos - 0.28, status_str, color='#FFFFFF', fontsize=7.5, fontweight='bold', ha='center')
        y_pos -= 0.95

    # Conflict Resolution Modal Banner in Right Panel
    ax.add_patch(patches.FancyBboxPatch((8.7, 0.6), 4.7, 1.6, boxstyle="round,pad=0.05", fc='#7F1D1D', ec='#EF4444', lw=1.5))
    ax.text(11.05, 1.9, "⚠️ Conflict Resolution Required", color='#FCA5A5', fontsize=9, fontweight='bold', ha='center')
    ax.text(8.9, 1.5, "Candidate A: $1,450.00 (Grand Total Header)", color=text_white, fontsize=8)
    ax.text(8.9, 1.2, "Candidate B: $1,420.00 (Line Item Subtotal)", color=text_white, fontsize=8)
    ax.text(11.05, 0.8, "[ Select Candidate A ]   [ Select Candidate B ]", color=accent_blue, fontsize=8.5, fontweight='bold', ha='center')

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "ui_wireframe_review.png"), dpi=300, facecolor=bg_dark)
    plt.close()
    print("Saved ui_wireframe_review.png")

if __name__ == "__main__":
    create_architecture_diagram()
    create_data_flow_diagram()
    create_er_diagram()
    create_ui_wireframe()
    print("All diagrams generated successfully!")
