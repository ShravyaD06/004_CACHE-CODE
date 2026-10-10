import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertTriangle, Edit3, Save, Download, ArrowLeft, AlertCircle, RefreshCw, X, Tag, CornerDownRight, Bot } from 'lucide-react';
import type { DocumentResults } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastNotification';
import { CopilotDrawer } from './CopilotDrawer';

export const SideBySideReviewCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { addToast } = useToast();

  const [data, setData] = useState<DocumentResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingField, setSavingField] = useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reclassifying, setReclassifying] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'VALID' | 'MISSING' | 'CONFLICT'>('ALL');
  const [activeCandidateIndex, setActiveCandidateIndex] = useState<number | null>(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      fetchResults(documentId);
    }
  }, [documentId]);

  const fetchResults = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getDocumentResults(id);
      setData(res);
      setSelectedCategory(res.doc_type);
      if (res.extracted_fields.length > 0) {
        setSelectedFieldId(res.extracted_fields[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSave = async (fieldId: string) => {
    if (!documentId) return;
    setSavingField(true);
    try {
      await api.correctField(documentId, fieldId, editValue, 'User manual review override');
      await fetchResults(documentId);
      setEditingFieldId(null);
      addToast({
        type: 'success',
        title: 'Field value updated',
        message: 'Field correction saved to audit log.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Could not save field correction.'
      });
    } finally {
      setSavingField(false);
    }
  };

  const handleApprove = async () => {
    if (!documentId) return;
    setReviewSubmitting(true);
    try {
      await api.submitReview(documentId, 'APPROVE');
      await fetchResults(documentId);
      addToast({
        type: 'success',
        title: 'Document Approved Successfully',
        message: 'Record status set to APPROVED.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Approval failed',
        message: err.message || 'Could not approve document.'
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!documentId) return;
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is required before rejecting a document.');
      return;
    }
    setRejectError(null);
    setReviewSubmitting(true);
    try {
      await api.submitReview(documentId, 'REJECT', rejectionReason.trim());
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchResults(documentId);
      addToast({
        type: 'warning',
        title: 'Document Rejected',
        message: 'Status set to REJECTED with rejection reason.'
      });
    } catch (err: any) {
      setRejectError(err.message || 'Failed to submit rejection.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReclassify = async () => {
    if (!documentId || !selectedCategory) return;
    setReclassifying(true);
    try {
      const res = await api.reclassifyDocument(documentId, selectedCategory);
      setData(res);
      if (res.extracted_fields.length > 0) {
        setSelectedFieldId(res.extracted_fields[0].id);
      }
      addToast({
        type: 'success',
        title: 'Category Re-classified',
        message: `Extraction pipeline rerun for '${res.doc_type_label}'.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Re-classification failed',
        message: err.message
      });
    } finally {
      setReclassifying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E4E7E1] rounded-2xl p-12 text-center text-[#69716B]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#246B57]" />
        <p className="text-sm font-medium">Loading document evidence & extraction results...</p>
      </div>
    );
  }

  if (!data || !documentId) {
    return (
      <div className="bg-white border border-[#E4E7E1] rounded-2xl p-12 text-center text-[#69716B]">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-[#C5221F]" />
        <p className="text-sm">Document results not found.</p>
        <button onClick={() => navigate('/workspace')} className="mt-4 px-4 py-2 bg-[#246B57] text-white rounded-lg text-xs font-bold">
          Return to Workspace
        </button>
      </div>
    );
  }

  const selectedField = data.extracted_fields.find((f) => f.id === selectedFieldId);
  const pageNum = selectedField?.page_number || 1;
  const documentUrl = `http://localhost:8000/uploads/${documentId}_${data.filename}#page=${pageNum}`;

  const getConfidencePill = (level: string, score: number) => {
    const pct = Math.round(score * 100);
    switch (level) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">HIGH ({pct}%)</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] border border-[#FCE8E6]">MEDIUM ({pct}%)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]">LOW ({pct}%)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
      case 'VALIDATED_BY_HUMAN':
        return <span className="text-[#137333] text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Validated</span>;
      case 'CONFLICT_DETECTED':
        return <span className="text-[#B06000] text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Conflict</span>;
      case 'MISSING':
        return <span className="text-[#C5221F] text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Missing</span>;
      case 'EMPTY':
        return <span className="text-[#69716B] text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Not Provided</span>;
      default:
        return <span className="text-[#C5221F] text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Format Issue</span>;
    }
  };

  return (
    <div className="bg-white border border-[#E4E7E1] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E4E7E1] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E1]">
              <h3 className="text-base font-bold text-[#C5221F] flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Document Rejection Reason
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-[#69716B] hover:text-[#202622]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#69716B]">
              Please specify a clear rejection reason. This explanation will be persisted in the audit log.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Total amount does not match invoice line items, or image quality is too low."
              className="w-full bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-3 text-xs text-[#202622] focus:outline-none focus:border-[#C5221F]"
            />

            {rejectError && <p className="text-xs font-semibold text-[#C5221F]">{rejectError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg bg-[#F7F7F4] border border-[#E4E7E1] text-xs font-semibold text-[#202622]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={reviewSubmitting}
                className="px-4 py-2 rounded-lg bg-[#C5221F] text-white hover:bg-[#A61C19] text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E4E7E1] gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workspace')}
            className="p-2 rounded-xl bg-[#F7F7F4] border border-[#E4E7E1] text-[#69716B] hover:text-[#202622] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#202622] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#246B57]" /> Evidence Verification & Review Canvas
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#69716B] mt-0.5">
              <span>File: <strong className="text-[#202622]">{data.filename}</strong></span>
              <span>• Format: <strong className="font-mono text-[#246B57]">{data.actual_file_type}</strong></span>
              <span>• Quality: <strong className={`font-mono ${(data.image_quality_score || 90) < 65 ? 'text-amber-600 font-bold' : 'text-[#246B57]'}`}>{data.image_quality_score || 90}% ({data.quality_label || 'High Quality'})</strong></span>
              <span>• Status: <strong className="uppercase text-[#246B57]">{data.status}</strong></span>
            </div>
          </div>
        </div>

        {/* Category Override Re-classification & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition-all"
          >
            <Bot className="w-3.5 h-3.5" /> AI Copilot
          </button>

          <div className="flex items-center gap-1.5 bg-[#F7F7F4] border border-[#E4E7E1] p-1 rounded-xl">
            <Tag className="w-3.5 h-3.5 text-[#246B57] ml-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#202622] focus:outline-none pr-1"
            >
              <option value="invoice">Vendor Invoice</option>
              <option value="receipt">Payment / Fee Receipt</option>
              <option value="certificate">Academic Certificate</option>
              <option value="application_form">Application Form</option>
              <option value="unclassified">Unknown / Needs Review</option>
            </select>
            {selectedCategory !== data.doc_type && (
              <button
                onClick={handleReclassify}
                disabled={reclassifying}
                className="px-2 py-1 rounded-lg bg-[#246B57] text-white text-[11px] font-bold hover:bg-[#1B5444]"
              >
                {reclassifying ? 'Reclassifying...' : 'Re-extract Schema'}
              </button>
            )}
          </div>

          <a
            href={api.getExportUrl(documentId, 'json')}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F4] border border-[#E4E7E1] text-[#69716B] hover:text-[#202622] text-xs font-semibold"
            title="Download JSON Payload"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </a>

          <a
            href={api.getExportUrl(documentId, 'csv')}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F4] border border-[#E4E7E1] text-[#69716B] hover:text-[#202622] text-xs font-semibold"
            title="Download CSV Table"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </a>

          <button
            onClick={handleApprove}
            disabled={reviewSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#246B57] text-white hover:bg-[#1B5444] font-bold text-xs shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Accept & Approve
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={reviewSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FCE8E6] text-[#C5221F] hover:bg-[#C5221F] hover:text-white font-bold text-xs border border-[#FAD2CF]"
          >
            Reject Record
          </button>
        </div>
      </div>

      {/* Rejection Reason Banner if Rejected */}
      {data.status === 'REJECTED' && data.rejection_reason && (
        <div className="p-3.5 rounded-xl bg-[#FCE8E6] border border-[#FAD2CF] flex items-start gap-2.5 text-xs text-[#C5221F]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Document Rejected Reason:</span> {data.rejection_reason}
            {data.reviewed_at && (
              <span className="text-[10px] text-[#C5221F]/80 block mt-0.5">
                Reviewed by {data.reviewed_by} on {new Date(data.reviewed_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Side-by-Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left 7 Columns: Source Document & SVG Highlight Canvas */}
        <div className="lg:col-span-7 bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-3 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E7E1] text-xs text-[#69716B]">
            <span className="font-semibold text-[#202622]">Original Document Preview</span>
            {selectedField && (
              <span className="text-[#246B57] text-[11px] font-mono flex items-center gap-1">
                <CornerDownRight className="w-3 h-3" /> Highlighting: {selectedField.field_label}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-white rounded-lg overflow-hidden border border-[#E4E7E1]">
            <iframe
              src={documentUrl}
              className="w-full h-full min-h-[500px] border-0"
              title="Document Evidence Canvas"
            />

            {selectedField && selectedField.bbox && selectedField.bbox.length === 4 && selectedField.extracted_value && (
              <div
                className={`absolute border-2 rounded shadow-md pointer-events-none transition-all duration-300 z-20 ${
                  selectedField.validation_status === 'CONFLICT_DETECTED'
                    ? 'border-amber-500 bg-amber-500/20'
                    : selectedField.validation_status === 'INVALID_FORMAT'
                    ? 'border-rose-500 bg-rose-500/20'
                    : 'border-[#246B57] bg-[#246B57]/20 animate-pulse'
                }`}
                style={{
                  top: `${selectedField.bbox[0]}%`,
                  left: `${selectedField.bbox[1]}%`,
                  width: `${Math.max(selectedField.bbox[3] - selectedField.bbox[1], 4)}%`,
                  height: `${Math.max(selectedField.bbox[2] - selectedField.bbox[0], 2.5)}%`,
                }}
              />
            )}

            {/* Render Multi-Candidate Conflict Bounding Boxes (Section C Screen 6 & Section G) */}
            {selectedField?.validation_status === 'CONFLICT_DETECTED' && selectedField.evidence?.candidates && (
              selectedField.evidence.candidates.map((cand, idx) => (
                cand.bbox && cand.bbox.length === 4 && (
                  <div
                    key={`cand-bbox-${idx}`}
                    className={`absolute border-2 rounded transition-all duration-300 pointer-events-none z-30 ${
                      activeCandidateIndex === idx
                        ? 'border-indigo-600 bg-indigo-500/30 ring-4 ring-indigo-400/60 scale-105'
                        : 'border-amber-500 bg-amber-500/25 border-dashed'
                    }`}
                    style={{
                      top: `${cand.bbox[0]}%`,
                      left: `${cand.bbox[1]}%`,
                      width: `${Math.max(cand.bbox[3] - cand.bbox[1], 4)}%`,
                      height: `${Math.max(cand.bbox[2] - cand.bbox[0], 2.5)}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-600 text-white shadow-xs whitespace-nowrap">
                      Candidate {idx + 1}: {cand.value}
                    </span>
                  </div>
                )
              ))
            )}
          </div>

          {selectedField && (
            <div className="mt-2 text-[11px] text-[#69716B] flex items-center justify-between bg-white p-2 rounded-lg border border-[#E4E7E1]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#202622]">Page {selectedField.page_number} Source</span>
                {selectedField.evidence?.extraction_method === 'gemini' ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]">
                    Gemini Flash
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]">
                    Rule Engine
                  </span>
                )}
              </div>
              {selectedField.raw_text ? (
                <span className="font-mono text-[#202622] truncate max-w-xs">
                  Match: &quot;{selectedField.raw_text}&quot;
                </span>
              ) : (
                <span className="italic text-[#B06000]">No bounding box coordinates for this field</span>
              )}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Extracted Fields & Conflict Resolution Form */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {data.classification_reason && (
            <div className="bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-3 text-xs space-y-1">
              <span className="font-bold text-[#202622]">Classification Evidence:</span>
              <p className="text-[#69716B] text-[11px] leading-relaxed">{data.classification_reason}</p>
            </div>
          )}

          {data.validation_issues.length > 0 && (
            <div className="bg-[#FEF7E0] border border-[#FCE8E6] rounded-xl p-4">
              <h3 className="text-xs font-bold text-[#B06000] flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Validation Alerts ({data.validation_issues.length})
              </h3>
              <ul className="space-y-1.5 text-xs text-[#B06000]">
                {data.validation_issues.map((issue) => (
                  <li key={issue.id} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-4 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-[#E4E7E1] gap-2">
              <h3 className="text-xs font-bold text-[#202622] uppercase tracking-wider">
                Schema Extracted Fields ({data.doc_type_label})
              </h3>
              
              {/* Filter Chips */}
              <div className="flex items-center gap-1 bg-[#E4E7E1]/60 p-1 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setFilterTab('ALL')}
                  className={`px-2 py-0.5 rounded ${filterTab === 'ALL' ? 'bg-[#246B57] text-white shadow-xs' : 'text-[#69716B] hover:text-[#202622]'}`}
                >
                  All ({data.extracted_fields.length})
                </button>
                <button
                  onClick={() => setFilterTab('VALID')}
                  className={`px-2 py-0.5 rounded ${filterTab === 'VALID' ? 'bg-[#246B57] text-white shadow-xs' : 'text-[#69716B] hover:text-[#202622]'}`}
                >
                  Valid ({data.extracted_fields.filter(f => f.validation_status === 'VALID' || f.validation_status === 'VALIDATED_BY_HUMAN').length})
                </button>
                <button
                  onClick={() => setFilterTab('MISSING')}
                  className={`px-2 py-0.5 rounded ${filterTab === 'MISSING' ? 'bg-[#246B57] text-white shadow-xs' : 'text-[#69716B] hover:text-[#202622]'}`}
                >
                  Missing ({data.extracted_fields.filter(f => f.validation_status === 'MISSING').length})
                </button>
                <button
                  onClick={() => setFilterTab('CONFLICT')}
                  className={`px-2 py-0.5 rounded ${filterTab === 'CONFLICT' ? 'bg-[#246B57] text-white shadow-xs' : 'text-[#69716B] hover:text-[#202622]'}`}
                >
                  Conflicts ({data.extracted_fields.filter(f => f.validation_status === 'CONFLICT_DETECTED').length})
                </button>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {data.extracted_fields
                .filter((field) => {
                  if (filterTab === 'VALID') return field.validation_status === 'VALID' || field.validation_status === 'VALIDATED_BY_HUMAN';
                  if (filterTab === 'MISSING') return field.validation_status === 'MISSING';
                  if (filterTab === 'CONFLICT') return field.validation_status === 'CONFLICT_DETECTED';
                  return true;
                })
                .map((field) => {
                const isSelected = field.id === selectedFieldId;
                const isEditing = field.id === editingFieldId;

                return (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#246B57] shadow-sm ring-1 ring-[#246B57]/30'
                        : 'bg-white border-[#E4E7E1] hover:border-[#69716B]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[#202622]">{field.field_label}</span>
                      <div className="flex items-center gap-2">
                        {getConfidencePill(field.confidence_level, field.confidence_score)}
                        {getStatusBadge(field.validation_status)}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-white border border-[#246B57] text-[#202622] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                        <button
                          onClick={() => handleFieldSave(field.id)}
                          disabled={savingField}
                          className="p-1.5 rounded-lg bg-[#246B57] text-white hover:bg-[#1B5444] text-xs font-semibold"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs font-mono font-medium text-[#202622] break-all">
                          {field.extracted_value || <span className="text-[#69716B] italic">Not found / Empty</span>}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFieldId(field.id);
                            setEditValue(field.extracted_value || '');
                          }}
                          className="text-[#69716B] hover:text-[#246B57] transition-colors p-1"
                          title="Edit Field Value"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {field.is_human_corrected && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#137333] bg-[#E6F4EA] px-2 py-0.5 rounded border border-[#CEEAD6]">
                        <CheckCircle className="w-3 h-3 text-[#137333]" /> Edited & Validated by Reviewer
                      </div>
                    )}

                    {field.validation_status === 'CONFLICT_DETECTED' && field.evidence?.candidates && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#FEF7E0] border border-[#FCE8E6] text-[11px]">
                        <p className="font-bold text-[#B06000] mb-1">⚠️ Select Ground-Truth Candidate (Hover to Highlight):</p>
                        <div className="space-y-1">
                          {field.evidence.candidates.map((cand, idx) => (
                            <button
                              key={idx}
                              onMouseEnter={() => setActiveCandidateIndex(idx)}
                              onMouseLeave={() => setActiveCandidateIndex(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditValue(cand.value);
                                handleFieldSave(field.id);
                              }}
                              className={`w-full text-left p-1.5 rounded border text-[#202622] flex items-center justify-between transition-all ${
                                activeCandidateIndex === idx
                                  ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-300'
                                  : 'bg-white border-[#E4E7E1] hover:border-[#246B57]'
                              }`}
                            >
                              <span>Candidate {idx + 1}: <strong className="text-[#246B57]">{cand.value}</strong></span>
                              <span className="text-[10px] text-[#69716B]">Page {cand.page}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot Drawer */}
      <CopilotDrawer
        documentId={documentId}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
