import pymupdf as fitz
import os

sample_dir = r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI\sample_docs"
os.makedirs(sample_dir, exist_ok=True)

# 1. Clean Vendor Tax Invoice PDF
def create_sample_invoice():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 size

    text_instances = [
        ("TAX INVOICE", 220, 60, 16, True),
        ("Acme Cloud Solutions Inc.", 50, 100, 12, True),
        ("100 Tech Park Way, Suite 400, San Jose CA", 50, 120, 10, False),
        ("Invoice No: INV-2026-8891", 380, 100, 11, True),
        ("Date: 2026-09-28", 380, 120, 11, False),
        ("Bill To: Enterprise Operations Dept", 50, 160, 11, True),

        ("Item Description", 50, 220, 11, True),
        ("Qty", 350, 220, 11, True),
        ("Amount", 450, 220, 11, True),

        ("Cloud Hosting Infrastructure (Monthly)", 50, 250, 10, False),
        ("1", 350, 250, 10, False),
        ("$1,200.00", 450, 250, 10, False),

        ("Managed Security Addon", 50, 280, 10, False),
        ("1", 350, 280, 10, False),
        ("$250.00", 450, 280, 10, False),

        ("Subtotal: $1,200.00", 350, 360, 11, False),
        ("Tax Amount: $250.00", 350, 385, 11, False),
        ("Grand Total: $1,450.00", 350, 415, 13, True),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_invoice.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 2. Conflicting Total Invoice PDF
def create_sample_invoice_conflict():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    text_instances = [
        ("TAX INVOICE", 220, 60, 16, True),
        ("Acme Cloud Solutions Inc.", 50, 100, 12, True),
        ("Invoice No: INV-2026-9902", 380, 100, 11, True),
        ("Date: 2026-09-29", 380, 120, 11, False),
        
        ("Subtotal: $1,420.00", 350, 320, 11, False),
        ("Grand Total: $1,450.00", 350, 380, 13, True),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_invoice_conflict.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 3. Academic Certificate PDF
def create_sample_certificate():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    text_instances = [
        ("CERTIFICATE OF COMPLETION", 140, 120, 18, True),
        ("This is to certify that", 220, 180, 12, False),
        ("Alex M. Mercer", 210, 220, 20, True),
        ("has successfully completed the advanced course in", 140, 260, 12, False),
        ("Advanced Artificial Intelligence & Machine Learning", 110, 300, 15, True),
        ("Issued by: Sapthagiri NPS University", 160, 380, 12, True),
        ("Issue Date: 2026-09-15", 220, 410, 11, False),
        ("Credential ID: CERT-AI-2026-7712", 180, 440, 11, False),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_certificate.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 4. Official Application Form PDF
def create_sample_application():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    text_instances = [
        ("OFFICIAL MEMBERSHIP APPLICATION FORM", 110, 80, 16, True),
        ("Application Ref No: APP-2026-5541", 350, 120, 11, True),
        ("Applicant Name: Sarah Jenkins", 50, 170, 12, False),
        ("Email Address: sarah.jenkins@techcorp.io", 50, 210, 12, False),
        ("Contact Phone: +1 555-019-2834", 50, 250, 12, False),
        ("Department: Data Analytics & Intelligence", 50, 290, 12, False),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_application.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

if __name__ == "__main__":
    create_sample_invoice()
    create_sample_invoice_conflict()
    create_sample_certificate()
    create_sample_application()
    print("All synthetic sample documents generated successfully!")
