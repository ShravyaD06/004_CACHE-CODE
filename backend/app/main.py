import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.database import engine, Base, init_db_migrations
from backend.app.config import UPLOAD_DIR
from backend.app.routes import health, documents, schemas_route, copilot

# Initialize DB Tables & safe column migrations on startup
init_db_migrations()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DocuSense AI — Intelligent Document Extraction & Validation API",
    description="DocuSense AI Enterprise Backend API Gateway",
    version="2.0.0"
)

# CORS Configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve documents to side-by-side frontend canvas
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(schemas_route.router)
app.include_router(copilot.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to DocuSense AI API Gateway",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
