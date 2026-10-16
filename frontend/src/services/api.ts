import type { DocumentItem, DocumentResults, ExtractionSchema } from '../types';
import { API_BASE_URL } from '../config';

export const api = {
  async healthCheck(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  async getSchemas(): Promise<ExtractionSchema[]> {
    const res = await fetch(`${API_BASE_URL}/schemas`);
    return res.json();
  },

  async listDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE_URL}/documents`);
    return res.json();
  },

  async uploadDocument(file: File, overrideType?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (overrideType) {
      formData.append('override_type', overrideType);
    }
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async getJobStatus(jobId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/jobs/${jobId}`);
    return res.json();
  },

  async getDocumentResults(documentId: string): Promise<DocumentResults> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/results`);
    if (!res.ok) {
      throw new Error('Failed to fetch document results');
    }
    return res.json();
  },

  async correctField(documentId: string, fieldId: string, correctedValue: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/fields/${fieldId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corrected_value: correctedValue, reason }),
    });
    return res.json();
  },

  async submitReview(documentId: string, action: 'APPROVE' | 'REJECT', notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Review submission failed');
    }
    return res.json();
  },

  async reclassifyDocument(documentId: string, newDocType: string): Promise<DocumentResults> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/reclassify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_doc_type: newDocType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Reclassification failed');
    }
    return res.json();
  },

  async getCopilotInsights(documentId: string, action: string, prompt?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, prompt }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Copilot assistant request failed');
    }
    return res.json();
  },

  getExportUrl(documentId: string, format: 'json' | 'csv'): string {
    return `${API_BASE_URL}/documents/${documentId}/export?format=${format}`;
  },

  async pushWebhook(documentId: string, webhookUrl?: string, destinationSystem?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl, destination_system: destinationSystem }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Webhook push failed');
    }
    return res.json();
  },

  async saveSchema(schema: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/schemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to save schema');
    }
    return res.json();
  }
};
