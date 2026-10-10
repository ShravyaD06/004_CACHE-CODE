import os

def detect_actual_file_type(filepath: str, original_filename: str) -> dict:
    """
    Detects actual file format using magic bytes header inspection,
    with fallback to filename extension.
    """
    ext = os.path.splitext(original_filename)[1].lower()
    
    magic_bytes = b""
    if os.path.exists(filepath):
        try:
            with open(filepath, "rb") as f:
                magic_bytes = f.read(16)
        except Exception:
            pass

    # Inspect magic bytes signatures
    if magic_bytes.startswith(b"%PDF-"):
        return {"file_type": "PDF", "is_image": False, "is_supported": True, "mime": "application/pdf"}
    elif magic_bytes.startswith(b"\xff\xd8\xff"):
        return {"file_type": "JPEG", "is_image": True, "is_supported": True, "mime": "image/jpeg"}
    elif magic_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return {"file_type": "PNG", "is_image": True, "is_supported": True, "mime": "image/png"}
    elif magic_bytes.startswith(b"II*\x00") or magic_bytes.startswith(b"MM\x00*"):
        return {"file_type": "TIFF", "is_image": True, "is_supported": True, "mime": "image/tiff"}

    # Fallback to extension check
    if ext == ".pdf":
        return {"file_type": "PDF", "is_image": False, "is_supported": True, "mime": "application/pdf"}
    elif ext in [".jpg", ".jpeg"]:
        return {"file_type": "JPEG", "is_image": True, "is_supported": True, "mime": "image/jpeg"}
    elif ext == ".png":
        return {"file_type": "PNG", "is_image": True, "is_supported": True, "mime": "image/png"}
    elif ext in [".tif", ".tiff"]:
        return {"file_type": "TIFF", "is_image": True, "is_supported": True, "mime": "image/tiff"}

    return {"file_type": "UNKNOWN", "is_image": False, "is_supported": False, "mime": "application/octet-stream"}
