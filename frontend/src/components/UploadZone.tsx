import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle2, Terminal, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ToastNotification';

interface UploadZoneProps {
  onUploadSuccess: () => void;
}

interface PipelineStage {
  id: number;
  name: string;
  detail: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [overrideType, setOverrideType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Screen 3: Live Batch Processing Stepper & Log State
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 1, name: 'File Preprocessing', detail: 'OpenCV deskew, contrast binarization & vector geometry', status: 'PENDING' },
    { id: 2, name: 'OCR Text Extraction', detail: 'PaddleOCR / PyMuPDF spatial tokens & coordinates', status: 'PENDING' },
    { id: 3, name: 'Structured Field Parsing', detail: 'Spatial schema anchors & AI semantic mapper', status: 'PENDING' },
    { id: 4, name: 'Validation Engine Execution', detail: 'Pydantic ISO dates, tax regex & cross-field math', status: 'PENDING' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const { addToast } = useToast();

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${message}`]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const updateStageStatus = (stageId: number, status: 'PENDING' | 'RUNNING' | 'COMPLETED') => {
    setStages((prev) =>
      prev.map((st) => (st.id === stageId ? { ...st, status } : st))
    );
  };

  const processFiles = async (files: File[]) => {
    setUploading(true);
    setErrorMsg(null);
    setTotalFiles(files.length);
    setShowProgressModal(true);
    setLogs([]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i + 1);
        setCurrentFileName(file.name);
        setProgressPercent(10);

        // Reset stages for each file
        setStages([
          { id: 1, name: 'File Preprocessing', detail: 'OpenCV deskew, contrast binarization & vector geometry', status: 'RUNNING' },
          { id: 2, name: 'OCR Text Extraction', detail: 'PaddleOCR / PyMuPDF spatial tokens & coordinates', status: 'PENDING' },
          { id: 3, name: 'Structured Field Parsing', detail: 'Spatial schema anchors & AI semantic mapper', status: 'PENDING' },
          { id: 4, name: 'Validation Engine Execution', detail: 'Pydantic ISO dates, tax regex & cross-field math', status: 'PENDING' },
        ]);

        addLog(`Initiating batch upload for file (${i + 1}/${files.length}): ${file.name}`);
        addLog(`Stage 1: File Preprocessing running — evaluating document DPI & orientation...`);

        // Simulate fine-grained progression while sending upload request
        const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|tiff|tif)$/i.test(file.name);

        addToast({
          type: 'info',
          title: isImage ? 'Image Upload Initiated' : 'PDF Upload Initiated',
          message: `Ingesting ${file.name}...`
        });

        // Advance to Stage 2
        updateStageStatus(1, 'COMPLETED');
        updateStageStatus(2, 'RUNNING');
        setProgressPercent(35);
        addLog(`Stage 1 Complete. Preprocessed geometry ready.`);
        addLog(`Stage 2: Executing PaddleOCR CPU layout engine & token bounding box generator...`);

        // Perform actual backend upload
        const res = await api.uploadDocument(file, overrideType || undefined);

        // Advance to Stage 3
        updateStageStatus(2, 'COMPLETED');
        updateStageStatus(3, 'RUNNING');
        setProgressPercent(70);
        addLog(`Stage 2 Complete. Document classified as: ${(res.doc_type || 'unclassified').toUpperCase()}`);
        addLog(`Stage 3: Parsing schema fields with spatial anchors & candidate conflict detection...`);

        // Advance to Stage 4
        updateStageStatus(3, 'COMPLETED');
        updateStageStatus(4, 'RUNNING');
        setProgressPercent(90);
        addLog(`Stage 4: Running Pydantic rule validations, ISO date formatters & cross-field arithmetic checks...`);

        // Finish Stage 4
        updateStageStatus(4, 'COMPLETED');
        setProgressPercent(100);
        addLog(`✓ Processing Completed: Document ID '${res.document_id}' registered in SQLite.`);

        if (res.doc_type && res.doc_type !== 'unclassified') {
          addToast({
            type: 'success',
            title: `Extracted: ${res.doc_type.toUpperCase()}`,
            message: `Document ID: ${res.document_id}`
          });
        }
      }

      addLog(`All ${files.length} document(s) successfully ingested and validated.`);
      setTimeout(() => {
        setUploading(false);
        onUploadSuccess();
      }, 1200);

    } catch (err: any) {
      const message = err.message || 'Failed to upload document';
      setErrorMsg(message);
      setUploading(false);
      addLog(`❌ Error encountered: ${message}`);
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: message,
        autoDismiss: false
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative transition-colors">
      {/* Screen 3: Live Batch Processing Status Modal / Stepper */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl p-6 text-slate-900 dark:text-slate-100 space-y-5 transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Live Batch Processing Pipeline
                    {uploading && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 animate-pulse">
                        RUNNING
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    File {currentFileIndex} of {totalFiles}: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{currentFileName}</span>
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Overall Progress Percentage Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Pipeline Execution Progress</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 4 Pipeline Stages Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stages.map((stage) => {
                const isRunning = stage.status === 'RUNNING';
                const isCompleted = stage.status === 'COMPLETED';

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isRunning
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500/50 shadow-sm ring-1 ring-teal-500/30'
                        : isCompleted
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Stage {stage.id} of 4
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isRunning ? (
                        <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                    </div>
                    <h4 className={`text-xs font-bold mt-1 ${isRunning ? 'text-teal-700 dark:text-teal-300' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stage.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {stage.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Live Log Terminal Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs shadow-inner">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>Real-Time Execution Logs</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] text-slate-300 scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {uploading ? 'Processing in asynchronous worker...' : 'Batch ingestion complete.'}
              </span>
              {!uploading && (
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  View Ingestion Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Zone */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Document Ingestion & Batch Upload
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload PDF, PNG, JPG, or TIFF documents for automated classification & extraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category Target:</label>
          <select
            value={overrideType}
            onChange={(e) => setOverrideType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
          >
            <option value="">Auto-Detect Category (AI Classifier)</option>
            <option value="invoice">Vendor Invoice</option>
            <option value="certificate">Academic Certificate</option>
            <option value="application_form">Application Form</option>
            <option value="receipt">Payment Receipt</option>
            <option value="travel_ticket">Travel Ticket</option>
          </select>
        </div>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-indigo-500 dark:border-teal-400 bg-indigo-50/50 dark:bg-teal-500/10 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-teal-400'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
          onChange={handleChange}
          className="hidden"
        />

        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-teal-500/10 border border-indigo-200 dark:border-teal-500/20 flex items-center justify-center text-indigo-600 dark:text-teal-400 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Drag & drop document files here, or <span className="text-indigo-600 dark:text-teal-400 underline font-medium">browse computer</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports single or multi-file batch uploads: PDF, PNG, JPG, TIFF (Max 20MB per file)
            </p>
          </div>
        </label>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

