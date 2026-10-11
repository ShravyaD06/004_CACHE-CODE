import React, { useState, useMemo } from 'react';
import type { DocumentItem, ExtractedField } from '../types';
import { api } from '../services/api';
import { GitCompare, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DocumentCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export const DocumentCompareModal: React.FC<DocumentCompareModalProps> = ({
  isOpen,
  onClose,
  documents,
}) => {
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || documents[0]?.id || '');

  const [docAData, setDocAData] = useState<any | null>(null);
  const [docBData, setDocBData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch full details of Doc A and Doc B when selection changes
  React.useEffect(() => {
    if (!isOpen || !docAId || !docBId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getDocumentResults(docAId).catch(() => null),
      api.getDocumentResults(docBId).catch(() => null),
    ])
      .then(([a, b]) => {
        if (!isMounted) return;
        setDocAData(a);
        setDocBData(b);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, docAId, docBId]);

  // Compute field comparison matrix
  const comparisonResults = useMemo(() => {
    if (!docAData?.extracted_fields || !docBData?.extracted_fields) return null;

    const fieldsA: ExtractedField[] = docAData.extracted_fields;
    const fieldsB: ExtractedField[] = docBData.extracted_fields;

    const mapA = new Map(fieldsA.map((f) => [f.field_key.toLowerCase(), f]));
    const mapB = new Map(fieldsB.map((f) => [f.field_key.toLowerCase(), f]));

    const allKeys = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    let matchingCount = 0;
    let mismatchedCount = 0;
    let singleSidedCount = 0;

    const rows = allKeys.map((key) => {
      const fieldA = mapA.get(key);
      const fieldB = mapB.get(key);

      const valA = fieldA?.extracted_value || '';
      const valB = fieldB?.extracted_value || '';

      const label = fieldA?.field_label || fieldB?.field_label || key;

      let status: 'MATCH' | 'MISMATCH' | 'ONLY_A' | 'ONLY_B';

      if (fieldA && fieldB) {
        if (valA.trim().toLowerCase() === valB.trim().toLowerCase()) {
          status = 'MATCH';
          matchingCount++;
        } else {
          status = 'MISMATCH';
          mismatchedCount++;
        }
      } else if (fieldA) {
        status = 'ONLY_A';
        singleSidedCount++;
      } else {
        status = 'ONLY_B';
        singleSidedCount++;
      }

      return {
        key,
        label,
        valA,
        valB,
        confA: fieldA ? Math.round((fieldA.confidence_score || 0) * 100) : null,
        confB: fieldB ? Math.round((fieldB.confidence_score || 0) * 100) : null,
        status,
      };
    });

    const totalEvaluated = matchingCount + mismatchedCount;
    const matchPercentage = totalEvaluated > 0 ? Math.round((matchingCount / totalEvaluated) * 100) : 100;

    return {
      rows,
      matchingCount,
      mismatchedCount,
      singleSidedCount,
      matchPercentage,
    };
  }, [docAData, docBData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-teal-500/10 text-indigo-600 dark:text-teal-400 border border-indigo-200 dark:border-teal-500/20 shadow-xs">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Cross-Document Reconciliation & Diff Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Dual-Audit
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare extracted fields across two documents to detect variance, discrepancies, or revisions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Selectors Banner */}
        <div className="p-4 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doc A Selector */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-teal-400 block">
              Document A (Primary Source)
            </span>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} • {d.doc_type} ({d.status})
                </option>
              ))}
            </select>
          </div>

          {/* Doc B Selector */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
              Document B (Comparison Target / PO / Revision)
            </span>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} • {d.doc_type} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Summary Bar */}
        {comparisonResults && !loading && (
          <div className="px-6 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-slate-400">Match Score:</span>
                <span
                  className={`text-sm font-mono font-black ${
                    comparisonResults.matchPercentage >= 90
                      ? 'text-teal-600 dark:text-teal-400'
                      : comparisonResults.matchPercentage >= 70
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {comparisonResults.matchPercentage}%
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {comparisonResults.matchingCount} Matching
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ {comparisonResults.mismatchedCount} Mismatched
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                • {comparisonResults.singleSidedCount} Unique Fields
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 text-[11px] font-mono font-bold">
                {comparisonResults.mismatchedCount === 0 ? 'RECONCILED' : 'DISCREPANCIES DETECTED'}
              </span>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono">Fetching document schemas & executing cross-field alignment...</p>
            </div>
          ) : !comparisonResults ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Select two documents above to calculate cross-document diff.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Doc A Value</th>
                    <th className="p-3 text-center">Reconciliation Status</th>
                    <th className="p-3">Doc B Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                  {comparisonResults.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        row.status === 'MATCH'
                          ? 'bg-teal-500/5 hover:bg-teal-500/10'
                          : row.status === 'MISMATCH'
                          ? 'bg-rose-500/5 hover:bg-rose-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {row.label}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {row.valA ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold">{row.valA}</span>
                            {row.confA !== null && (
                              <span className="text-[10px] text-slate-400 font-sans">{row.confA}%</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not in Doc A</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-sans">
                        {row.status === 'MATCH' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Match
                          </span>
                        )}
                        {row.status === 'MISMATCH' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy
                          </span>
                        )}
                        {row.status === 'ONLY_A' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px]">
                            Doc A Only
                          </span>
                        )}
                        {row.status === 'ONLY_B' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[10px]">
                            Doc B Only
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {row.valB ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold">{row.valB}</span>
                            {row.confB !== null && (
                              <span className="text-[10px] text-slate-400 font-sans">{row.confB}%</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not in Doc B</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Dual-vector semantic alignment powered by DocuSense Reconciliation Core
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs transition-colors"
          >
            Close Diff View
          </button>
        </div>

      </div>
    </div>
  );
};
