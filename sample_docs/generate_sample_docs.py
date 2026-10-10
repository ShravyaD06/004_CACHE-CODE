import pymupdf as fitz
import os
import cv2
import numpy as np

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

# 5. Payment / Tuition Fee Receipt PDF
def create_sample_receipt():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    text_instances = [
        ("OFFICIAL PAYMENT RECEIPT", 180, 70, 16, True),
        ("Sapthagiri University Institute of Technology", 50, 110, 12, True),
        ("Receipt No: REC-2026-4421", 370, 110, 11, True),
        ("Payment Date: 2026-09-30", 370, 130, 11, False),
        ("Received with thanks from Student Name: David K. Vance", 50, 170, 11, False),
        ("Payer Name: David K. Vance", 50, 200, 11, False),
        ("Payee Organization: Sapthagiri University", 50, 230, 11, False),
        ("Transaction ID: TXN-88492019", 50, 260, 11, True),
        ("Payment Method: Online Bank Transfer", 50, 290, 11, False),
        ("Amount Paid: $3,500.00", 370, 320, 13, True),
        ("Tuition Fee Semester Fall 2026: Paid In Full", 50, 360, 10, False),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_receipt.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 6. Travel Ticket / Boarding Itinerary PDF
def create_sample_travel_ticket():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    text_instances = [
        ("ELECTRONIC FLIGHT TICKET & ITINERARY", 140, 70, 16, True),
        ("Operator Name: Global Skyways Airline", 50, 110, 12, True),
        ("Ticket Number: PNR-SKY-9921", 370, 110, 11, True),
        ("Travel Date: 2026-10-15", 370, 130, 11, False),
        ("Passenger Name: Elena Rostova", 50, 170, 12, True),
        ("Origin: San Francisco (SFO)", 50, 210, 11, False),
        ("Destination: New York (JFK)", 50, 240, 11, False),
        ("Carrier GSTIN / Tax ID: GSTIN-06SKY9942Z1", 50, 270, 10, False),
        ("Total Fare: $680.00", 370, 310, 13, True),
    ]

    for text, x, y, size, bold in text_instances:
        page.insert_text(fitz.Point(x, y), text, fontsize=size, color=(0.1, 0.15, 0.25))

    path = os.path.join(sample_dir, "sample_travel_ticket.pdf")
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 7. Scanned Raster Image (Simulated scan with noise & contrast)
def create_sample_scanned_image():
    # Render receipt PDF page to high-res image and apply mild scan artifact
    receipt_pdf = os.path.join(sample_dir, "sample_receipt.pdf")
    doc = fitz.open(receipt_pdf)
    pix = doc[0].get_pixmap(dpi=150)
    img_path = os.path.join(sample_dir, "sample_scanned_receipt.png")
    pix.save(img_path)
    doc.close()

    # Apply slight scan noise / mild contrast simulation via OpenCV
    img = cv2.imread(img_path)
    if img is not None:
        # Add subtle grain
        noise = np.random.normal(0, 3, img.shape).astype(np.uint8)
        scanned_sim = cv2.add(img, noise)
        cv2.imwrite(img_path, scanned_sim)
    print(f"Created {img_path}")


if __name__ == "__main__":
    create_sample_invoice()
    create_sample_invoice_conflict()
    create_sample_certificate()
    create_sample_application()
    create_sample_receipt()
    create_sample_travel_ticket()
    create_sample_scanned_image()
    print("All sample documents generated successfully!")
