from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "DocuSense AI Backend Gateway",
        "version": "2.0.0"
    }
