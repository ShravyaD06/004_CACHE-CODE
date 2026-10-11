import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, CheckCircle, FileText, AlertCircle, Contrast, Sliders } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type FilterMode = 'normal' | 'document' | 'high_contrast';

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('document');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly using ref (no state dependency loop!)
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Enumerate physical video devices
  const updateDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Could not enumerate media devices:', e);
    }
  }, [selectedDeviceId]);

  // Start camera stream safely
  const startCamera = useCallback(async (deviceIdOverride?: string) => {
    setIsInitializing(true);
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API (navigator.mediaDevices.getUserMedia) is not supported by this browser.');
      setIsInitializing(false);
      return;
    }

    const targetDeviceId = deviceIdOverride || selectedDeviceId;
    let activeStream: MediaStream | null = null;

    // Strategy 1: Targeted deviceId if specified
    if (targetDeviceId) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: targetDeviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err: any) {
        console.warn('Targeted deviceId stream request failed, falling back:', err);
      }
    }

    // Strategy 2: Ideal environment camera (for mobile / back camera)
    if (!activeStream) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err: any) {
        console.warn('Ideal facingMode stream request failed, falling back:', err);
      }
    }

    // Strategy 3: Standard unconstrained video device
    if (!activeStream) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err: any) {
        console.error('All camera attempts failed:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera permissions in your browser address bar or Windows Privacy settings.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError(
            'No physical webcam or camera detected on this system. You can take a photo with your phone or upload a document photo.'
          );
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError(
            'The camera is currently locked or in use by another application (e.g. Teams, Zoom, or Windows Camera).'
          );
        } else {
          setCameraError(
            `Camera could not be started (${err.message || err.name}). Please use photo upload or demo scan.`
          );
        }
      }
    }

    if (activeStream) {
      streamRef.current = activeStream;

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.srcObject = activeStream;
        
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play caught:', playErr);
        }
      }
      setIsInitializing(false);
      updateDeviceList();
    } else {
      setIsInitializing(false);
    }
  }, [selectedDeviceId, stopCameraStream, updateDeviceList]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCameraStream();
      setCapturedDataUrl(null);
      setCameraError(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen]); // Only run on isOpen change!

  if (!isOpen) return null;

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  const applyFiltersToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (filterMode === 'document' || filterMode === 'high_contrast') {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (filterMode === 'high_contrast') {
          const v = gray > 130 ? 255 : 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        } else {
          const contrast = 1.35;
          const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyFiltersToCanvas(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedDataUrl(dataUrl);
    stopCameraStream();
  };

  // Handle native file or camera upload
  const handleNativeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          applyFiltersToCanvas(ctx, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          setCapturedDataUrl(dataUrl);
          stopCameraStream();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load demo document scan
  const handleLoadDemoDocument = () => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = img.width || 800;
      canvas.height = img.height || 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        applyFiltersToCanvas(ctx, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedDataUrl(dataUrl);
        stopCameraStream();
      }
    };
    img.src = '/sample_scanned_receipt.png';
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  const handleConfirmAndUpload = () => {
    if (!canvasRef.current || !capturedDataUrl) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File(
          [blob],
          `camera_scan_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
          { type: 'image/png' }
        );
        onCapture(file);
        onClose();
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[94vh]">
        
        {/* Hidden Native Camera / File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeFileSelect}
          className="hidden"
        />

        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Document Camera Scanner
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Live View
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Capture invoice, receipt, or certificate directly into DocuSense
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Camera Device Switcher (if multiple cameras available) */}
            {videoDevices.length > 1 && !capturedDataUrl && (
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none max-w-[150px] truncate"
                title="Select Camera Device"
              >
                {videoDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Video Canvas Body */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] overflow-hidden select-none">
          
          {/* Always-mounted video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlaying={() => setIsInitializing(false)}
            className={`w-full h-full object-cover max-h-[56vh] ${capturedDataUrl || cameraError ? 'hidden' : 'block'}`}
          />

          {/* Initializing Spinner Overlay */}
          {isInitializing && !capturedDataUrl && !cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 text-slate-300 z-20">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Connecting to camera sensor...</span>
            </div>
          )}

          {/* Camera Error / Fallback Card */}
          {cameraError && !capturedDataUrl && (
            <div className="p-6 text-center space-y-4 max-w-md z-20 animate-in fade-in">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-1">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Hardware / Permission Status</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {cameraError}
              </p>
              
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={() => startCamera()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Webcam
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Take / Choose Photo
                  </button>
                  <button
                    onClick={handleLoadDemoDocument}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" /> Demo Receipt
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  * "Take / Choose Photo" opens your device's native camera directly.
                </p>
              </div>
            </div>
          )}

          {/* Captured Document Preview */}
          {capturedDataUrl && (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2 z-20">
              <img
                src={capturedDataUrl}
                alt="Captured Document"
                className="max-h-[50vh] sm:max-h-[56vh] object-contain rounded-xl shadow-lg border border-slate-800"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Document Frame Captured</span>
              </div>
            </div>
          )}

          {/* Viewfinder Guides with Scanning Laser Sweep */}
          {!capturedDataUrl && !cameraError && !isInitializing && (
            <div className="absolute inset-5 sm:inset-8 border-2 border-dashed border-teal-400/60 rounded-2xl pointer-events-none flex flex-col justify-between shadow-[0_0_25px_rgba(45,212,191,0.2)] z-10">
              <div className="flex justify-between p-1">
                <span className="w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                <span className="w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
              </div>

              {/* Animated Laser Sweep */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />

              <div className="flex justify-between p-1">
                <span className="w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                <span className="w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
              </div>
            </div>
          )}

          {/* Processing Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Filter & Shutter Controls */}
        <div className="p-4 bg-slate-950/95 border-t border-slate-800 space-y-3">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Document Filter:
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'normal'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setFilterMode('document')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'document'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                OCR Enhanced
              </button>
              <button
                onClick={() => setFilterMode('high_contrast')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'high_contrast'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Contrast className="w-3 h-3 inline mr-1" />
                B&W High Contrast
              </button>
            </div>
          </div>

          {/* Capture Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {capturedDataUrl ? (
              <>
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Retake Photo
                </button>
                <button
                  onClick={handleConfirmAndUpload}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Analyze & Insert Document
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={captureFrame}
                  disabled={isInitializing || !!cameraError}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-400 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-40 cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-slate-950 animate-ping" />
                  <span>CAPTURE DOCUMENT</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Take photo with native camera app or upload from device"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span>Take / Pick Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoDocument}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Load sample receipt document"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Demo Scan</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
