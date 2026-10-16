// Centralized Configuration for DocuSense AI Frontend

const isLocalVite =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  window.location.port === '5173';

// Dynamically resolve backend base URL:
// 1. Explicit VITE_API_URL environment variable if set (for separate frontend/backend deployments)
// 2. http://localhost:8000 when running Vite dev server locally
// 3. window.location.origin for unified deployment (FastAPI serving built frontend)
export const BACKEND_URL = (
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : isLocalVite
      ? 'http://localhost:8000'
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000'
).replace(/\/$/, '');

export const API_BASE_URL = `${BACKEND_URL}/api`;
