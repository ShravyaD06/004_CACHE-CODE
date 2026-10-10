import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Download, Search, CheckCircle, AlertTriangle, XCircle, Clock, Image, FileCode, HelpCircle, Share2, X, Send, Copy, Calendar } from 'lucide-react';
import type { DocumentItem } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastNotification';

interface DocumentListProps {
  documents: DocumentItem[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');

  // Screen 8: Export Center Modal State
  const [exportDoc, setExportDoc] = useState<DocumentItem | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'webhook'>('json');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState('https://erp.enterprise-internal.net/api/v1/inbound-docs');
  const [destinationSystem, setDestinationSystem] = useState('SAP S/4HANA ERP');
  const [pushingWebhook, setPushingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.doc_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.actual_file_type && doc.actual_file_type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const docDate = new Date(doc.created_at);
      const now = new Date();
      if (dateFilter === 'TODAY') {
        matchesDate = docDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'WEEK') {
        const diffTime = Math.abs(now.getTime() - docDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchesDate = diffDays <= 7;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const openExportModal = async (doc: DocumentItem) => {
    setExportDoc(doc);
    setExportFormat('json');
    setWebhookResult(null);
    setLoadingPreview(true);

    try {
      const res = await fetch(api.getExportUrl(doc.id, 'json'));
      const json = await res.json();
      setPreviewContent(JSON.stringify(json, null, 2));
    } catch {
      setPreviewContent('{}');
    } finally {
      setLoadingPreview(false);
    }
  };

  const switchExportFormat = async (fmt: 'json' | 'csv' | 'webhook') => {
    setExportFormat(fmt);
    if (!exportDoc || fmt === 'webhook') return;

    setLoadingPreview(true);
    try {
      const res = await fetch(api.getExportUrl(exportDoc.id, fmt));
      if (fmt === 'json') {
        const json = await res.json();
        setPreviewContent(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setPreviewContent(text);
      }
    } catch {
      setPreviewContent('Error loading preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePushWebhook = async () => {
    if (!exportDoc) return;
    setPushingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await api.pushWebhook(exportDoc.id, webhookUrl, destinationSystem);
      setWebhookResult(res);
      addToast({
        type: 'success',
        title: 'Webhook Delivered (200 OK)',
        message: `Pushed ${exportDoc.filename} to ${destinationSystem}.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Push Failed',
        message: err.message || 'Could not push webhook to destination ERP.'
      });
    } finally {
      setPushingWebhook(false);
    }
  };

  const getStatusBadge = (doc: DocumentItem) => {
    const { status, rejection_reason } = doc;
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer"
            title={rejection_reason ? `Rejection reason: ${rejection_reason}` : 'Rejected during reviewer inspection'}
          >
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'NEEDS_CLASSIFICATION_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <HelpCircle className="w-3.5 h-3.5" /> Needs Category Review
          </span>
        );
      case 'NEEDS_REVIEW':
      case 'REQUIRES_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Review
          </span>
        );
      case 'READY_FOR_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Ready for Review
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-teal-400 border border-indigo-200 dark:border-teal-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" /> {status.replace('_', ' ')}
          </span>
        );
    }
  };

  const getFileTypeBadge = (actualType?: string, filename?: string) => {
    const fileType = (actualType || filename?.split('.').pop() || 'PDF').toUpperCase();
    const isImg = ['PNG', 'JPG', 'JPEG', 'TIFF', 'GIF'].includes(fileType);

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {isImg ? <Image className="w-3 h-3 text-teal-600 dark:text-teal-400" /> : <FileCode className="w-3 h-3 text-indigo-600 dark:text-teal-400" />}
        {fileType}
      </span>
    );
  };

  const getCategoryBadge = (doc: DocumentItem) => {
    const { doc_type, doc_type_label } = doc;
    const isUnknown = doc_type.toLowerCase() === 'unclassified' || doc_type.toLowerCase() === 'unknown';

    return (
      <span
        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
          isUnknown
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        }`}
      >
        {doc_type_label || (isUnknown ? 'Unknown Document' : doc_type.toUpperCase())}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      {/* Screen 8: Results History & Export Center Modal */}
      {exportDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-teal-500/10 text-indigo-600 dark:text-teal-400 border border-indigo-200 dark:border-teal-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Center & Webhook Integration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    File: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{exportDoc.filename}</strong> ({exportDoc.doc_type.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format Selection Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchExportFormat('json')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  exportFormat === 'json'
                    ? 'bg-indigo-600 dark:bg-teal-600 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Structured JSON (Pydantic)
              </button>
              <button
                onClick={() => switchExportFormat('csv')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  exportFormat === 'csv'
                    ? 'bg-indigo-600 dark:bg-teal-600 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Flat Matrix CSV
              </button>
              <button
                onClick={() => switchExportFormat('webhook')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  exportFormat === 'webhook'
                    ? 'bg-indigo-600 dark:bg-teal-600 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                API Push / Webhook
              </button>
            </div>

            {/* Preview or Webhook Configuration */}
            {exportFormat !== 'webhook' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Payload Preview ({exportFormat.toUpperCase()})</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewContent);
                      addToast({ type: 'success', title: 'Copied', message: 'Payload copied to clipboard.' });
                    }}
                    className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-teal-400 hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto overflow-x-auto shadow-inner">
                  {loadingPreview ? 'Generating export payload...' : previewContent}
                </pre>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Direct Enterprise System Push
                </h4>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Target ERP System:</label>
                  <select
                    value={destinationSystem}
                    onChange={(e) => setDestinationSystem(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                  >
                    <option value="SAP S/4HANA ERP">SAP S/4HANA (Accounts Payable)</option>
                    <option value="Workday HR & Finance">Workday (HR & Finance Ingestion)</option>
                    <option value="Salesforce CRM">Salesforce (Document Vault)</option>
                    <option value="Custom Enterprise Webhook">Custom Enterprise Webhook Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Webhook Target URL:</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                  />
                </div>

                {webhookResult && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Webhook Delivered Successfully (Status: 200 OK)
                    </p>
                    <p className="text-[11px] font-mono">
                      Timestamp: {webhookResult.delivered_at} | Delivered {webhookResult.payload_bytes} bytes
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setExportDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>

              {exportFormat === 'webhook' ? (
                <button
                  onClick={handlePushWebhook}
                  disabled={pushingWebhook}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 dark:bg-teal-600 text-white hover:bg-indigo-700 dark:hover:bg-teal-500 text-xs font-bold shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> {pushingWebhook ? 'Delivering...' : 'Trigger Webhook Push'}
                </button>
              ) : (
                <a
                  href={api.getExportUrl(exportDoc.id, exportFormat)}
                  download
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 dark:bg-teal-600 text-white hover:bg-indigo-700 dark:hover:bg-teal-500 text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download {exportFormat.toUpperCase()} File
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Filter & Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Ingested Documents Archive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredDocs.length} of {documents.length} ingested documents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400 placeholder-slate-400"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none pr-1 cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
              <option value="WEEK">Last 7 Days</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY_FOR_REVIEW">Ready for Review</option>
            <option value="NEEDS_CLASSIFICATION_REVIEW">Needs Category Review</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Document Filename</th>
              <th className="py-3 px-4">File Format</th>
              <th className="py-3 px-4">Detected Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No matching documents found. Drop a PDF or image file above to ingest.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-teal-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{doc.filename}</p>
                      <p className="text-[10px] text-slate-400">{new Date(doc.created_at).toLocaleString()}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getFileTypeBadge(doc.actual_file_type, doc.filename)}</td>

                  <td className="py-3.5 px-4">{getCategoryBadge(doc)}</td>

                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {(doc.file_size_bytes / 1024).toFixed(1)} KB
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(doc)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/review/${doc.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-800/50 transition-all text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect & Review
                      </button>

                      <button
                        onClick={() => openExportModal(doc)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-teal-400 hover:border-indigo-300 dark:hover:border-teal-500/50 transition-all"
                        title="Open Export Center (JSON, CSV, Webhook)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
