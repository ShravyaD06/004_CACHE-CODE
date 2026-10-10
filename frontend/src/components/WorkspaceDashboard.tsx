import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from './UploadZone';
import { DocumentList } from './DocumentList';
import { ModelInfoPanel } from './ModelInfoPanel';
import type { DocumentItem } from '../types';
import { Upload, Cpu, CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';

interface WorkspaceDashboardProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({ documents, onRefresh }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'queue' | 'models'>('queue');

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
          </div>
        </div>

        {activeTab === 'upload' && <UploadZone onUploadSuccess={onRefresh} />}
        {activeTab === 'models' && <ModelInfoPanel />}
        {activeTab === 'queue' && <DocumentList documents={documents} />}
      </div>
    </div>
  );
};
