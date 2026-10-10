from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from backend.app.services.extractor import SCHEMAS

router = APIRouter(prefix="/api/schemas", tags=["Schemas"])

class SchemaFieldModel(BaseModel):
    key: str
    label: str
    type: str = "string"
    required: bool = False
    validation_regex: Optional[str] = None
    expected_format: Optional[str] = None

class SchemaModel(BaseModel):
    document_type: str
    display_name: str
    fields: List[Dict[str, Any]]
    cross_field_rules: Optional[List[Dict[str, Any]]] = []

@router.get("")
def get_extraction_schemas():
    return list(SCHEMAS.values())

@router.post("")
def create_or_update_schema(schema: SchemaModel):
    SCHEMAS[schema.document_type] = {
        "document_type": schema.document_type,
        "display_name": schema.display_name,
        "fields": schema.fields,
        "cross_field_rules": schema.cross_field_rules or []
    }
    return {
        "status": "success",
        "message": f"Schema '{schema.display_name}' configured successfully.",
        "schema": SCHEMAS[schema.document_type]
    }

