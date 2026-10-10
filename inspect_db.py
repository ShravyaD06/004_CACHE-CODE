"""
DocuSense AI - Live Database Inspector for Hackathon Demonstrations
Run this script in your terminal to inspect live SQLite records:
    python inspect_db.py
"""

import os
import sys
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "backend", "docusense.db")

def print_separator(char="=", length=75):
    print(char * length)

def inspect_database():
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print_separator("=")
    print("       DOCUSENSE AI - LIVE SQLITE DATABASE INSPECTOR")
    print(f"       Database File: {DB_PATH}")
    print_separator("=")

    # 1. Table Summary & Row Counts
    tables = [
        "documents",
        "processing_jobs",
        "extracted_fields",
        "validation_issues",
        "review_corrections",
        "extraction_schemas"
    ]
    print("\n[1] TABLE SUMMARY & ROW COUNTS:")
    for tbl in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
            count = cursor.fetchone()[0]
            print(f"  • {tbl.ljust(22)} : {count} records")
        except Exception:
            print(f"  • {tbl.ljust(22)} : (not found)")

    # 2. Ingested Documents
    print("\n" + "-" * 75)
    print("[2] RECENT DOCUMENTS (Table: 'documents'):")
    cursor.execute("""
        SELECT id, filename, doc_type, doc_type_label, status, classification_confidence, actual_file_type, created_at
        FROM documents
        ORDER BY created_at DESC
        LIMIT 5
    """)
    docs = cursor.fetchall()
    if not docs:
        print("  (No documents uploaded yet)")
    else:
        for idx, d in enumerate(docs, 1):
            conf = int((d["classification_confidence"] or 0.0) * 100)
            print(f"  [{idx}] ID: {d['id']}")
            print(f"      File: {d['filename']} ({d['actual_file_type']})")
            print(f"      Category: {d['doc_type_label']} (Confidence: {conf}%)")
            print(f"      Status: {d['status']} | Ingested: {d['created_at']}")

    # 3. Extracted Fields Sample
    print("\n" + "-" * 75)
    print("[3] EXTRACTED SCHEMA FIELDS (Table: 'extracted_fields'):")
    cursor.execute("""
        SELECT document_id, field_key, field_label, extracted_value, confidence_score, validation_status, bbox_json, is_human_corrected
        FROM extracted_fields
        LIMIT 8
    """)
    fields = cursor.fetchall()
    if not fields:
        print("  (No fields extracted yet)")
    else:
        for f in fields:
            conf = int((f["confidence_score"] or 0.0) * 100)
            corr = " [HUMAN CORRECTED]" if f["is_human_corrected"] else ""
            print(f"  • {f['field_label'].ljust(20)}: '{f['extracted_value']}'{corr}")
            print(f"    Status: {f['validation_status']} | Confidence: {conf}% | BBox: {f['bbox_json']}")

    # 4. Human Review & Audit Trail Corrections
    print("\n" + "-" * 75)
    print("[4] AUDIT TRAIL LOG (Table: 'review_corrections'):")
    cursor.execute("""
        SELECT id, document_id, field_id, previous_value, corrected_value, reviewer_id, reason, created_at
        FROM review_corrections
        ORDER BY created_at DESC
        LIMIT 5
    """)
    corrs = cursor.fetchall()
    if not corrs:
        print("  (No manual review corrections logged yet)")
    else:
        for c in corrs:
            print(f"  • Document: {c['document_id']}")
            print(f"    Value: '{c['previous_value']}' -> '{c['corrected_value']}'")
            print(f"    Reviewer: {c['reviewer_id']} | Reason: {c['reason']} | Date: {c['created_at']}")

    # 5. Validation Issues
    print("\n" + "-" * 75)
    print("[5] VALIDATION & AUTHENTICITY ISSUES (Table: 'validation_issues'):")
    cursor.execute("""
        SELECT document_id, issue_type, severity, message
        FROM validation_issues
        LIMIT 5
    """)
    issues = cursor.fetchall()
    if not issues:
        print("  (No validation issues logged)")
    else:
        for i in issues:
            print(f"  • [{i['severity']}] {i['issue_type']}: {i['message']}")

    print_separator("=")
    print("  Inspection completed. SQLite database is active and operational.")
    print_separator("=")
    conn.close()

if __name__ == "__main__":
    inspect_database()
