import React, { useMemo } from 'react';
import type { DocumentItem } from '../types';
import { BarChart3, X, TrendingUp, AlertTriangle, CheckCircle2, Download, Zap, PieChart } from 'lucide-react';

interface BatchAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export const BatchAnalyticsModal: React.FC<BatchAnalyticsModalProps> = ({
  isOpen,
  onClose,
  documents,
}) => {
  const stats = useMemo(() => {
    const total = documents.length;
    if (total === 0) return null;

    const approved = documents.filter((d) => d.status === 'APPROVED').length;
    const reviewNeeded = documents.filter((d) => d.status === 'NEEDS_REVIEW' || d.status === 'READY_FOR_REVIEW').length;
    const rejected = documents.filter((d) => d.status === 'REJECTED').length;

    // Type distribution
    const typeCounts: Record<string, number> = {};
    documents.forEach((d) => {
      typeCounts[d.doc_type] = (typeCounts[d.doc_type] || 0) + 1;
    });

    // Average image quality score
    const avgQuality = Math.round(
      documents.reduce((acc, d) => acc + (d.image_quality_score || 90), 0) / total
    );

    // Simulated average confidence & anomalies
    const avgConfidence = 94.6;
    const highConfidenceCount = Math.round(total * 0.82);
    const flaggedAnomalies = Math.round(total * 0.18);

    const fieldErrorFrequency = [
      { field: 'total_amount', count: Math.max(1, Math.round(total * 0.28)), label: 'Arithmetic Subtotal Discrepancy' },
      { field: 'tax_id / gst_in', count: Math.max(1, Math.round(total * 0.21)), label: 'Tax Identification Regex Mismatch' },
      { field: 'invoice_date', count: Math.max(0, Math.round(total * 0.12)), label: 'Date Format Non-Standard (ISO-8601)' },
      { field: 'line_items.unit_price', count: Math.max(0, Math.round(total * 0.08)), label: 'Line Item Arithmetic Variance' },
      { field: 'vendor_address', count: Math.max(0, Math.round(total * 0.05)), label: 'Missing Postal Code' },
    ];

    return {
      total,
      approved,
      reviewNeeded,
      rejected,
      typeCounts,
      avgQuality,
      avgConfidence,
      highConfidenceCount,
      flaggedAnomalies,
      fieldErrorFrequency,
    };
  }, [documents]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Processed', stats.total],
      ['Approved Documents', stats.approved],
      ['Pending Review', stats.reviewNeeded],
      ['Rejected Documents', stats.rejected],
      ['Average Quality Score', `${stats.avgQuality}%`],
      ['Average Extraction Confidence', `${stats.avgConfidence}%`],
      ...Object.entries(stats.typeCounts).map(([t, count]) => [`Category: ${t}`, count]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `docusense_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Executive Batch Analytics & Anomaly Intelligence
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                  Macro Trends
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pipeline-wide accuracy distribution, error heatmap, and throughput telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {stats ? (
            <>
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Average Accuracy</span>
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                    {stats.avgConfidence}%
                  </p>
                  <p className="text-[10px] text-slate-500">Across all schema tokens</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Scan Quality Index</span>
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {stats.avgQuality}%
                  </p>
                  <p className="text-[10px] text-slate-500">DPI & binarization rating</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Auto-Approved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {stats.approved}
                  </p>
                  <p className="text-[10px] text-slate-500">Straight-through validated</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Human Audit Rate</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {stats.reviewNeeded}
                  </p>
                  <p className="text-[10px] text-slate-500">Flagged for verification</p>
                </div>
              </div>

              {/* Anomaly Heatmap Section */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Field Validation Error Frequency (Anomaly Heatmap)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Top 5 friction points</span>
                </div>

                <div className="space-y-2.5">
                  {stats.fieldErrorFrequency.map((item, idx) => {
                    const pct = Math.min(100, Math.round((item.count / stats.total) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-sans">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.label} <code className="text-[11px] font-mono text-teal-600 dark:text-teal-400">({item.field})</code>
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            {item.count} docs ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct > 30 ? 'bg-rose-500' : pct > 15 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Document Type Category Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Category Throughput Distribution</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(stats.typeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono">
                        {type}
                      </span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          {count}
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                          {Math.round((count / stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No documents available for telemetry computation.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
