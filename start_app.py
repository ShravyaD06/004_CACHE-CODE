import os
import sys
import subprocess
import time
import urllib.request
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

def start_services():
    print("=" * 70)
    print("  DocuSense AI — Full-Stack Application Launcher")
    print("=" * 70)

    # Step 1: Initialize DB tables and sample PDFs
    print("\n[1/3] Initializing Database & Synthetic Test Documents...")
    try:
        from backend.app.database import engine, Base
        Base.metadata.create_all(bind=engine)
        print("  ✓ SQLite Database initialized successfully.")

        sample_script = os.path.join(BASE_DIR, "sample_docs", "generate_sample_docs.py")
        subprocess.run([sys.executable, sample_script], check=True)
        print("  ✓ Sample synthetic documents ready in /sample_docs.")
    except Exception as e:
        print(f"  ❌ DB initialization warning: {e}")

    # Step 2: Launch FastAPI Backend
    print("\n[2/3] Starting FastAPI Backend Gateway (http://localhost:8000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=BASE_DIR
    )

    # Wait for backend health endpoint to respond
    time.sleep(2)
    backend_healthy = False
    for attempt in range(5):
        try:
            with urllib.request.urlopen("http://localhost:8000/api/health", timeout=2) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    print(f"  ✓ Backend API is HEALTHY! Response: {data}")
                    backend_healthy = True
                    break
        except Exception:
            time.sleep(1)

    if not backend_healthy:
        print("  ⚠️ Backend health check pending...")

    # Step 3: Launch Vite React Frontend
    frontend_dir = os.path.join(BASE_DIR, "frontend")
    print(f"\n[3/3] Starting React Frontend Dev Server (http://localhost:5173)...")
    frontend_proc = subprocess.Popen(
        ["npm.cmd", "run", "dev", "--", "--host"],
        cwd=frontend_dir
    )

    print("\n" + "=" * 70)
    print("  🚀 DocuSense AI Application is live and operational!")
    print("  • Frontend URL:  http://localhost:5173")
    print("  • Backend API:   http://localhost:8000")
    print("  • OpenAPI Docs:  http://localhost:8000/docs")
    print("=" * 70)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    start_services()
