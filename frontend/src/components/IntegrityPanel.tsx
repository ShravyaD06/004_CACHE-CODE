import React from 'react';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { DocumentItem } from '../types';

interface IntegrityPanelProps {
  documents: DocumentItem[];
}

export const IntegrityPanel: React.FC<IntegrityPanelProps> = ({ documents }) => {
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const reviewCount = documents.filter(d => d.status === 'REQUIRES_REVIEW' || d.status === 'NEEDS_REVIEW').length;
  const failedCount = documents.filter(d => d.status === 'FAILED' || d.status === 'REJECTED').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Document Integrity Intelligence Panel
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Batch-level validation metrics, field consistency alerts, and human reviewer decision summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Documents</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{documents.length}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Clean Approvals</span>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">{approvedCount}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Flagged For Review</span>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 font-mono">{reviewCount}</p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Rejected / Errors</span>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1 font-mono">{failedCount}</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Active Integrity Rules & Safeguards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Multi-Location Conflict Resolution</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Detects competing extracted values across headers and item tables instead of silent overwrites.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Invoice Cross-Sum Sanity Check</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Automatically verifies subtotal + tax = total_amount before accepting invoice results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
