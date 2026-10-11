import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from './UploadZone';
import { DocumentList } from './DocumentList';
import { ModelInfoPanel } from './ModelInfoPanel';
import { CopilotDrawer } from './CopilotDrawer';
import { CameraScannerModal } from './CameraScannerModal';
import { DocumentCompareModal } from './DocumentCompareModal';
import { BatchAnalyticsModal } from './BatchAnalyticsModal';
import { EnterpriseExportModal } from './EnterpriseExportModal';
import { SectorInnovationsHub } from './SectorInnovationsHub';
import { api } from '../services/api';
import type { DocumentItem } from '../types';
import { Upload, Cpu, CheckCircle2, FileCheck, ArrowRight, Bot, Volume2, Camera, GitCompare, BarChart3, Layers, Share2 } from 'lucide-react';

interface WorkspaceDashboardProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({ documents, onRefresh }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'queue' | 'models' | 'sectors'>('queue');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotDocId, setCopilotDocId] = useState<string>(documents[0]?.id || '');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleCameraCapture = async (file: File) => {
    try {
      await api.uploadDocument(file);
      onRefresh();
    } catch (err) {
      console.error('Failed to upload camera capture:', err);
    }
  };

  // Compute actual backend record statistics
  const totalCount = documents.length;
  const readyCount = documents.filter((d) => d.status === 'READY_FOR_REVIEW').length;
  const reviewCount = documents.filter((d) => d.status === 'NEEDS_REVIEW').length;
  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;
  const rejectedCount = documents.filter((d) => d.status === 'REJECTED').length;

  const nextPendingDoc = documents.find(
    (d) => d.status === 'NEEDS_REVIEW' || d.status === 'READY_FOR_REVIEW'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 4 Primary Workflow Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div
          onClick={() => setActiveTab('upload')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 border-indigo-500/60 dark:border-teal-500/50 shadow-md ring-1 ring-indigo-500/30 dark:ring-teal-500/30'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-teal-500/10 text-indigo-600 dark:text-teal-400 border border-indigo-200 dark:border-teal-500/20 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 1</span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors">1. Upload Document</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">PDF or scanned image ingestion with SHA-256 hash check.</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-teal-400">
            <span>Drag or select file</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => setActiveTab('models')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'models'
              ? 'bg-white dark:bg-slate-900 border-teal-500/60 dark:border-emerald-500/50 shadow-md ring-1 ring-teal-500/30 dark:ring-emerald-500/30'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-emerald-500/10 text-teal-600 dark:text-emerald-400 border border-teal-200 dark:border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 2</span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-emerald-300 transition-colors">2. Extract Information</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Multi-schema parser (Invoice, Form, Certificate, Ticket).</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-emerald-400">
            <span>View pipeline architecture</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => setActiveTab('queue')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'queue'
              ? 'bg-white dark:bg-slate-900 border-indigo-500/60 dark:border-cyan-500/50 shadow-md ring-1 ring-indigo-500/30 dark:ring-cyan-500/30'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 3</span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">3. Validate Results</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Arithmetic verifier & date/identifier checks.</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-cyan-400">
            <span>{reviewCount + readyCount} documents evaluated</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Step 4 */}
        <div
          onClick={() => {
            if (nextPendingDoc) {
              navigate(`/review/${nextPendingDoc.id}`);
            } else {
              setActiveTab('queue');
            }
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 4</span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">4. Review & Approve</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Side-by-side evidence viewer with manual edits.</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-emerald-400">
            <span>{nextPendingDoc ? 'Open Next Document' : 'Select From Queue'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Backend Live Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800/60 space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Documents</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{totalCount}</p>
        </div>
        <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800/60 space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ready for Review</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{readyCount}</p>
        </div>
        <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800/60 space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Needs Review</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">{reviewCount}</p>
        </div>
        <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800/60 space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Approved</p>
          <p className="text-xl font-bold text-teal-600 dark:text-teal-300 font-mono">{approvedCount}</p>
        </div>
        <div className="px-3 py-2 space-y-0.5 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rejected</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">{rejectedCount}</p>
        </div>
      </div>

      {/* Upload Dropzone Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-indigo-600 dark:bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Document Queue ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 dark:bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Upload New File
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'models'
                  ? 'bg-indigo-600 dark:bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              AI Pipeline Info
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sectors'
                  ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-indigo-500/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sector Innovations</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-semibold">4 Hubs</span>
            </button>

            {/* Camera Scan Quick Action */}
            <button
              onClick={() => setIsCameraOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-teal-500/10 to-indigo-500/10 hover:from-teal-500/20 hover:to-indigo-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-xs"
              title="Capture & scan document using device camera"
            >
              <Camera className="w-3.5 h-3.5 text-teal-500" />
              <span>Camera Scan</span>
            </button>

            {/* Compare Documents Quick Action */}
            {documents.length >= 2 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs"
                title="Cross-document reconciliation & schema diff"
              >
                <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Compare Docs</span>
              </button>
            )}

            {/* Executive Batch Analytics Quick Action */}
            {documents.length > 0 && (
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs"
                title="Executive batch accuracy & anomaly heatmap"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                <span>Batch Analytics</span>
              </button>
            )}

            {/* Enterprise Multi-ERP & Webhook Broadcast Action */}
            {documents.length > 0 && (
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-xs"
                title="Dispatch batch to SAP S/4HANA, Salesforce, Workday, QuickBooks or Webhooks"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>ERP Webhooks</span>
              </button>
            )}

            {documents.length > 0 && (
              <button
                onClick={() => {
                  setCopilotDocId(copilotDocId || documents[0]?.id || '');
                  setIsCopilotOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-teal-500/10 to-indigo-500/10 hover:from-teal-500/20 hover:to-indigo-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 text-teal-500" />
                <span>Voice Copilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'upload' && <UploadZone onUploadSuccess={onRefresh} />}
        {activeTab === 'models' && <ModelInfoPanel />}
        {activeTab === 'queue' && <DocumentList documents={documents} />}
        {activeTab === 'sectors' && <SectorInnovationsHub documents={documents} />}
      </div>

      {/* Floating AI Voice Copilot Action Pill */}
      {documents.length > 0 && (
        <button
          onClick={() => {
            setCopilotDocId(copilotDocId || documents[0]?.id || '');
            setIsCopilotOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-600 via-indigo-600 to-teal-500 text-white font-bold text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-teal-300/30"
          title="Open Voice AI Agent"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <span>AI Voice Copilot</span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
            <Volume2 className="w-3 h-3 text-teal-200" />
            Voice ON
          </span>
        </button>
      )}

      {/* Live Device Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Cross-Document Reconciliation Diff Modal */}
      <DocumentCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        documents={documents}
      />

      {/* Executive Batch Analytics & Anomaly Heatmap Modal */}
      <BatchAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        documents={documents}
      />

      {/* Enterprise Multi-ERP Webhook Broadcast Modal */}
      <EnterpriseExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documents={documents}
      />

      {/* Copilot Drawer with Voice replies */}
      {documents.length > 0 && (
        <CopilotDrawer
          documentId={copilotDocId || documents[0]?.id || ''}
          documents={documents}
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          onSelectDocument={(id) => setCopilotDocId(id)}
        />
      )}
    </div>
  );
};
