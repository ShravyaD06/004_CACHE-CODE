# DocuSense AI — Production Deployment Guide

DocuSense AI is architected for frictionless deployment on **Render**, **Railway**, or any **Docker/VPS** environment.

---

## Architecture Overview for Production

DocuSense AI can be deployed in two modes:

1. **Dual Service Architecture (Recommended for Render)**:
   - **Backend Web Service**: FastAPI API Gateway running on Uvicorn with auto-scaling.
   - **Frontend Static Site**: React Vite SPA hosted on Render's global CDN.
2. **Unified Container Architecture (Recommended for Railway & Docker)**:
   - Single multi-stage container where Node builds the React SPA and FastAPI serves both the REST API (`/api`) and the frontend bundle on a single port.

---

## 1. Deploying to Render (Recommended)

### Method A: 1-Click Render Blueprint (Fastest)

The repository includes a ready-to-use [`render.yaml`](./render.yaml).

1. Push your repository to **GitHub** (or **GitLab**).
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository: `bhatshreemata-arch/codebreaker-hackathon` (or your fork).
5. Render will automatically read `render.yaml` and configure:
   - **`docusense-api`** (FastAPI Web Service)
   - **`docusense-web`** (React Static Site with automatic routing and backend linkage)
6. Add your secret environment variable in Render:
   - `GEMINI_API_KEY`: Your Google Gemini API Key (optional for LLM extraction).
7. Click **Apply**. Both services will build and deploy automatically!

---

### Method B: Manual Service Setup on Render

#### 1. Backend Service:
- **Type**: Web Service
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.11.9`
  - `GEMINI_API_KEY`: *(your key)*
  - `GEMINI_MODEL_ID`: `gemini-2.5-flash`

#### 2. Frontend Static Site:
- **Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `./frontend/dist`
- **Rewrite Rule**: `/*` -> `/index.html`
- **Environment Variables**:
  - `VITE_API_URL`: URL of your deployed backend service (e.g., `https://docusense-api.onrender.com`)

---

## 2. Deploying to Railway

Railway detects either the [`Dockerfile`](./Dockerfile) or [`railway.json`](./railway.json) automatically.

1. Log in to [Railway](https://railway.app/).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically build the unified multi-stage container (Stage 1 builds React, Stage 2 packages FastAPI).
5. In the **Variables** tab on Railway, set:
   - `GEMINI_API_KEY`: *(your key)*
   - `GEMINI_MODEL_ID`: `gemini-2.5-flash`
   - `PORT`: (Managed by Railway automatically)
6. Under **Settings** > **Networking**, click **Generate Domain** to get your public HTTPS URL.
7. Both your frontend UI and backend API will be live on that domain!

---

## 3. Containerized Deployment (Docker / VPS / Cloud Run)

### Using Docker Compose
Run locally or on any cloud virtual machine (AWS EC2, DigitalOcean, Azure VM):

```bash
# 1. Clone repository
git clone https://github.com/bhatshreemata-arch/codebreaker-hackathon.git
cd codebreaker-hackathon

# 2. Configure environment (optional)
cp .env.example .env

# 3. Start production container
docker compose up -d --build
```

Access the application at `http://<your-server-ip>:8000`.

### Building Standalone Docker Image
```bash
docker build -t docusense-ai:latest .
docker run -p 8000:8000 -e GEMINI_API_KEY="your_key" docusense-ai:latest
```

---

## Environment Variables Reference

| Variable | Required? | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Auto on Cloud | `8000` | Port listened to by FastAPI / Uvicorn |
| `VITE_API_URL` | For split deploy | Auto-detected | Base URL of backend API for React client |
| `DATABASE_URL` | Optional | SQLite local file | Connection string (supports PostgreSQL or SQLite) |
| `GEMINI_API_KEY` | Optional | None | Multi-modal vision and Copilot extraction key |
| `GEMINI_MODEL_ID` | Optional | `gemini-2.5-flash` | Gemini model variant |
| `ENVIRONMENT` | Optional | `production` | Environment tier indicator |
