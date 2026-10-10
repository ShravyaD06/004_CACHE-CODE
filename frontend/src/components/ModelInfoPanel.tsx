import React from 'react';
import { Cpu, CheckCircle2, Server, FileCode, Shield, Layers } from 'lucide-react';

interface ModelInfoPanelProps {
  className?: string;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900 dark:text-slate-100 transition-colors ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-teal-500/10 text-indigo-600 dark:text-teal-400 border border-indigo-200 dark:border-teal-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">AI Pipeline & System Architecture Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Truthful technical disclosure of models, extraction logic, and processing stages.</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-indigo-50 dark:bg-emerald-500/10 text-indigo-700 dark:text-emerald-400 border border-indigo-200 dark:border-emerald-500/20 self-start sm:self-auto">
          Hybrid AI/ML + OCR Architecture
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1 */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-indigo-600 dark:text-teal-400">
            <span>1. Text & OCR Engine</span>
            <Server className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">PaddleOCR PP-OCRv5 + PyMuPDF</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Retains digital PDF text-block coordinates via PyMuPDF. Scans/images process via PaddleOCR PP-OCRv5 (CPU inference) with OpenCV CLAHE & blur assessment.
          </p>
          <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Exact Geometry (No Coordinate Fabrication)
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-indigo-600 dark:text-teal-400">
            <span>2. Classification</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Scikit-Learn TF-IDF + Naive Bayes</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Classifies into invoice, receipt, certificate, application form, travel ticket, or unclassified using TF-IDF ML model with keyword heuristic fallback.
          </p>
          <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Provenance Labeled (ML vs Heuristic)
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-indigo-600 dark:text-teal-400">
            <span>3. Semantic Field Extraction</span>
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Gemini Flash (SDK) + Pydantic</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Official google-genai SDK structured output schema. Server-side key; absent values are null. Falls back cleanly to local rule extractor when offline.
          </p>
          <div className="pt-1 text-[10px] font-mono text-indigo-600 dark:text-teal-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Configurable Model ID & Fallback
          </div>
        </div>

        {/* Stage 4 */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-indigo-600 dark:text-teal-400">
            <span>4. Validation & Copilot</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Real Document Context Engine</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Arithmetic validation (Subtotal + Tax == Total), format checking, and Copilot audits explaining missing fields, conflicts, and human corrections.
          </p>
          <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero Hardcoded Examples
          </div>
        </div>
      </div>
    </div>
  );
};
