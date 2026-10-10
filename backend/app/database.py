from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db_migrations():
    """Auto-migrate missing columns for existing SQLite tables safely."""
    try:
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(documents);"))
            columns = [row[1] for row in res.fetchall()]
            if not columns:
                return

            migrations = [
                ("actual_file_type", "VARCHAR DEFAULT 'PDF'"),
                ("file_hash", "VARCHAR"),
                ("doc_subtype", "VARCHAR"),
                ("doc_type_label", "VARCHAR DEFAULT 'Unknown Document'"),
                ("classification_reason", "TEXT"),
                ("classification_confidence", "FLOAT DEFAULT 0.0"),
                ("alternatives_json", "TEXT"),
                ("image_quality_score", "FLOAT DEFAULT 90.0"),
                ("quality_label", "VARCHAR DEFAULT 'High Quality Scan'"),
                ("rejection_reason", "TEXT"),
                ("reviewed_by", "VARCHAR"),
                ("reviewed_at", "DATETIME")
            ]

            for col_name, col_def in migrations:
                if col_name not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE documents ADD COLUMN {col_name} {col_def};"))
                        conn.commit()
                    except Exception:
                        pass
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
