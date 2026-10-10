import os
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
API_URL = "http://localhost:8000/api"

def upload_sample(filename, override_type=None):
    filepath = os.path.join(r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI\sample_docs", filename)
    print(f"\n---> Uploading {filename}...")
    with open(filepath, "rb") as f:
        files = {"file": (filename, f, "application/pdf")}
        data = {}
        if override_type:
            data["override_type"] = override_type

        res = requests.post(f"{API_URL}/documents/upload", files=files, data=data)
        assert res.status_code == 200, f"Upload failed: {res.text}"
        res_json = res.json()
        doc_id = res_json["document_id"]
        job_id = res_json["job_id"]
        print(f"  ✓ Uploaded! Document ID: {doc_id}, Job ID: {job_id}")

        # Fetch results
        results_res = requests.get(f"{API_URL}/documents/{doc_id}/results")
        assert results_res.status_code == 200
        results_data = results_res.json()

        print(f"  ✓ Category Detected: {results_data['doc_type'].upper()}")
        print(f"  ✓ Validation Status: {results_data['status']}")
        print(f"  ✓ Extracted {len(results_data['extracted_fields'])} Fields:")

        for field in results_data['extracted_fields']:
            val = field['extracted_value'] or "[MISSING]"
            status = field['validation_status']
            conf = field['confidence_level']
            print(f"     - {field['field_label']}: '{val}' (Status: {status}, Confidence: {conf})")

        if results_data['validation_issues']:
            print(f"  ⚠️ Validation Issues Found ({len(results_data['validation_issues'])}):")
            for issue in results_data['validation_issues']:
                print(f"     • [{issue['severity']}] {issue['issue_type']}: {issue['message']}")

        # Test Copilot Endpoint
        copilot_res = requests.post(f"{API_URL}/documents/{doc_id}/copilot", json={"action": "explain_classification"})
        assert copilot_res.status_code == 200, f"Copilot request failed: {copilot_res.text}"
        c_json = copilot_res.json()
        print(f"  ✓ Copilot Action '{c_json['action']}' succeeded. Title: '{c_json['title']}'")

        return doc_id

if __name__ == "__main__":
    doc1 = upload_sample("sample_invoice.pdf")
    doc2 = upload_sample("sample_invoice_conflict.pdf")
    doc3 = upload_sample("sample_certificate.pdf")
    doc4 = upload_sample("sample_application.pdf")
    print("\n---> Uploading duplicate file to test duplicate detection...")
    doc5 = upload_sample("sample_invoice.pdf")
    print("\n✅ Live end-to-end ingestion & Copilot test passed 100%!")
