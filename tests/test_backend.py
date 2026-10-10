import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import engine, Base

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "DocuSense" in data["service"]

def test_get_schemas():
    response = client.get("/api/schemas")
    assert response.status_code == 200
    schemas = response.json()
    assert len(schemas) >= 3
    doc_types = [s["document_type"] for s in schemas]
    assert "invoice" in doc_types
    assert "certificate" in doc_types
    assert "application_form" in doc_types

def test_document_upload_and_extraction_workflow():
    sample_invoice_path = r"c:\Users\devar\OneDrive\Desktop\DocuSense - AI\sample_docs\sample_invoice.pdf"
    assert os.path.exists(sample_invoice_path)

    with open(sample_invoice_path, "rb") as f:
        response = client.post(
            "/api/documents/upload",
            files={"file": ("sample_invoice.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    upload_data = response.json()
    doc_id = upload_data["document_id"]
    job_id = upload_data["job_id"]
    assert upload_data["status"] == "success"

    # Verify job status
    job_resp = client.get(f"/api/documents/jobs/{job_id}")
    assert job_resp.status_code == 200

    # Fetch extraction results
    results_resp = client.get(f"/api/documents/{doc_id}/results")
    assert results_resp.status_code == 200
    res_data = results_resp.json()

    assert res_data["document_id"] == doc_id
    assert res_data["doc_type"] == "invoice"
    assert len(res_data["extracted_fields"]) > 0

    # Test Field Correction
    field_to_correct = res_data["extracted_fields"][0]
    patch_resp = client.patch(
        f"/api/documents/{doc_id}/fields/{field_to_correct['id']}",
        json={"corrected_value": "INV-2026-9999", "reason": "Correction in test"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["new_value"] == "INV-2026-9999"

    # Test Document Review Approval
    review_resp = client.post(
        f"/api/documents/{doc_id}/review",
        json={"action": "APPROVE", "notes": "Approved in unit test"}
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "APPROVED"

    # Test Exports
    json_export = client.get(f"/api/documents/{doc_id}/export?format=json")
    assert json_export.status_code == 200
    assert json_export.json()["document_id"] == doc_id

    csv_export = client.get(f"/api/documents/{doc_id}/export?format=csv")
    assert csv_export.status_code == 200
    assert "Document ID" in csv_export.text
