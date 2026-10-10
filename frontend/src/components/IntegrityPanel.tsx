import React from 'react';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { DocumentItem } from '../types';

interface IntegrityPanelProps {
  documents: DocumentItem[];
}

export const IntegrityPanel: React.FC<IntegrityPanelProps> = ({ documents }) => {
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const reviewCount = documents.filter(d => d.status === 'REQUIRES_REVIEW').length;
  const failedCount = documents.filter(d => d.status === 'FAILED' || d.status === 'REJECTED').length;

  return (
    <div className="bg-white border border-[#E4E7E1] rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-bold text-[#202622] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#246B57]" /> Document Integrity Intelligence Panel
        </h2>
        <p className="text-xs text-[#69716B] mt-0.5">
          Batch-level validation metrics, field consistency alerts, and human reviewer decision summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-4">
          <span className="text-xs font-semibold text-[#69716B]">Total Documents</span>
          <p className="text-2xl font-bold text-[#202622] mt-1">{documents.length}</p>
        </div>

        <div className="bg-[#E6F4EA] border border-[#CEEAD6] rounded-xl p-4">
          <span className="text-xs font-semibold text-[#137333]">Clean Approvals</span>
          <p className="text-2xl font-bold text-[#137333] mt-1">{approvedCount}</p>
        </div>

        <div className="bg-[#FEF7E0] border border-[#FCE8E6] rounded-xl p-4">
          <span className="text-xs font-semibold text-[#B06000]">Flagged For Review</span>
          <p className="text-2xl font-bold text-[#B06000] mt-1">{reviewCount}</p>
        </div>

        <div className="bg-[#FCE8E6] border border-[#FAD2CF] rounded-xl p-4">
          <span className="text-xs font-semibold text-[#C5221F]">Rejected / Errors</span>
          <p className="text-2xl font-bold text-[#C5221F] mt-1">{failedCount}</p>
        </div>
      </div>

      <div className="bg-[#F7F7F4] border border-[#E4E7E1] rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#202622] uppercase tracking-wider">
          Active Integrity Rules & Safeguards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#202622]">
          <div className="p-3 rounded-lg bg-white border border-[#E4E7E1] flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#B06000] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202622]">Multi-Location Conflict Resolution</p>
              <p className="text-[#69716B] text-[11px] mt-0.5">
                Detects competing extracted values across headers and item tables instead of silent overwrites.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-[#E4E7E1] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202622]">Invoice Cross-Sum Sanity Check</p>
              <p className="text-[#69716B] text-[11px] mt-0.5">
                Automatically verifies subtotal + tax = total_amount before accepting invoice results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
