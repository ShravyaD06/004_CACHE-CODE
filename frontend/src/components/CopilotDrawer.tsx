import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import type { CopilotResponse, DocumentItem } from '../types';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  AlertTriangle,
  FileText,
  CornerDownRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Sliders,
  Zap,
  Radio
} from 'lucide-react';

interface CopilotDrawerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  documents?: DocumentItem[];
  onSelectDocument?: (docId: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  title?: string;
  content: string;
  structured_data?: any;
  suggestions?: string[];
  isError?: boolean;
}

const HUMAN_PRESENTATION_MAP: Record<string, string> = {
  CONFLICT_DETECTED: 'Conflicting values detected',
  NEEDS_REVIEW: 'Needs review',
  NEEDS_CLASSIFICATION_REVIEW: 'Requires category review',
  READY_FOR_REVIEW: 'Ready for review',
  VALID: 'Valid',
  MISSING: 'Missing required information',
  VALIDATED_BY_HUMAN: 'Human verified',
  INVALID_FORMAT: 'Invalid format',
  ARITHMETIC_MISMATCH: 'Arithmetic discrepancy',
  DUPLICATE_UPLOAD_WARNING: 'Probable duplicate upload',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FAILED: 'Processing failed',
};

const mapHumanLabel = (text: string): string => {
  let result = text;
  Object.entries(HUMAN_PRESENTATION_MAP).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  documentId,
  isOpen,
  onClose,
  documents = [],
  onSelectDocument,
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(documentId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastFailedAction, setLastFailedAction] = useState<{ action: string; prompt?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Interaction State
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('docusense_voice_enabled');
    return saved !== null ? saved === 'true' : true; // Default voice ON for conversational agent
  });
  const [isSpeaking, setIsCurrentlySpeaking] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceRate, setVoiceRate] = useState<number>(1.05);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  // Sync activeDocId with prop changes
  useEffect(() => {
    if (documentId) {
      setActiveDocId(documentId);
    }
  }, [documentId]);

  // Load available speech voices
  useEffect(() => {
    const voices = voiceService.getAvailableVoices();
    setAvailableVoices(voices);
    const active = voiceService.getSelectedVoice();
    if (active) setSelectedVoiceName(active.name);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Cleanup speech synthesis on unmount or drawer close
  useEffect(() => {
    if (!isOpen) {
      voiceService.stop();
      voiceService.stopListening();
      setIsCurrentlySpeaking(false);
      setSpeakingMsgId(null);
      setIsListening(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleVoiceMode = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem('docusense_voice_enabled', String(next));
    if (!next) {
      voiceService.stop();
      setIsCurrentlySpeaking(false);
      setSpeakingMsgId(null);
    }
  };

  const handleSelectVoice = (name: string) => {
    setSelectedVoiceName(name);
    voiceService.setVoiceByName(name);
  };

  const handleSpeakMessage = (msgId: string, textToSpeak: string) => {
    if (isSpeaking && speakingMsgId === msgId) {
      // Toggle off / pause
      voiceService.stop();
      setIsCurrentlySpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    voiceService.stop();
    setSpeakingMsgId(msgId);
    setIsCurrentlySpeaking(true);

    voiceService.speak(textToSpeak, {
      rate: voiceRate,
      voiceName: selectedVoiceName || undefined,
      onStart: () => {
        setIsCurrentlySpeaking(true);
        setSpeakingMsgId(msgId);
      },
      onEnd: () => {
        setIsCurrentlySpeaking(false);
        setSpeakingMsgId(null);
      },
      onError: () => {
        setIsCurrentlySpeaking(false);
        setSpeakingMsgId(null);
      },
    });
  };

  const handleStopAllSpeech = () => {
    voiceService.stop();
    setIsCurrentlySpeaking(false);
    setSpeakingMsgId(null);
  };

  const handleToggleMic = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    if (!voiceService.isRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    setIsListening(true);
    voiceService.startListening(
      (transcript, isFinal) => {
        setCustomPrompt(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      }
    );
  };

  const constructSpeechText = (title?: string, markdown?: string, structured?: any): string => {
    let output = '';
    if (title) output += `${title}. `;
    if (markdown) {
      output += markdown;
    } else if (structured?.fields && structured.fields.length > 0) {
      const totalFields = structured.fields.length;
      const invalidCount = structured.fields.filter(
        (f: any) => !f.extracted_value || f.validation_status !== 'VALID'
      ).length;
      output += `Document audit completed. Found ${totalFields} fields, with ${invalidCount} requiring reviewer attention.`;
    }
    return output;
  };

  const handleQuickAction = async (action: string, promptText?: string) => {
    const targetId = activeDocId || documentId;
    if (!targetId) return;

    const userLabel = promptText || action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userLabel,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setLastFailedAction(null);

    try {
      const res: CopilotResponse = await api.getCopilotInsights(targetId, action, promptText);
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: res.title,
        content: res.markdown_content,
        structured_data: res.structured_data,
        suggestions: res.suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak the response in voice format if voice mode is enabled
      if (voiceEnabled) {
        const textToSpeak = constructSpeechText(res.title, res.markdown_content, res.structured_data);
        handleSpeakMessage(assistantMsg.id, textToSpeak);
      }
    } catch (err: any) {
      setLastFailedAction({ action, prompt: promptText });
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Assistant Request Failed',
        content: err.message || 'Could not fetch copilot insights. Please check network connection.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (voiceEnabled) {
        handleSpeakMessage(errorMsg.id, 'I encountered an error retrieving insights. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || loading) return;
    const prompt = customPrompt.trim();
    setCustomPrompt('');
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    }
    handleQuickAction('custom_prompt', prompt);
  };

  const resetConversation = () => {
    voiceService.stop();
    setIsCurrentlySpeaking(false);
    setSpeakingMsgId(null);
    setMessages([]);
    setLastFailedAction(null);
  };

  const renderContentBlocks = (msg: ChatMessage) => {
    const cleanContent = mapHumanLabel(msg.content);

    // If structured fields exist, render structured HTML Field Cards
    if (msg.structured_data?.fields && msg.structured_data.fields.length > 0) {
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 font-medium">Here is the extracted field audit for this document:</p>
          <div className="grid grid-cols-1 gap-2">
            {msg.structured_data.fields.map((f: any, idx: number) => {
              const isMissing = !f.extracted_value;
              const isConflict = f.validation_status === 'CONFLICT_DETECTED';
              const confPct = Math.round((f.confidence_score || 0) * 100);

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-all ${
                    isMissing
                      ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                      : isConflict
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      : 'bg-slate-900 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{f.field_label}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isMissing
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isConflict
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {f.validation_status_label || mapHumanLabel(f.validation_status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="truncate max-w-[200px] text-emerald-300 font-bold">
                      {f.extracted_value || <span className="text-rose-400 italic">Missing required information</span>}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Confidence: {confPct}% • Page {f.page_number}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Standard markdown line renderer with raw table filtering
    const lines = cleanContent.split('\n');
    const filteredLines = lines.filter((line) => !line.trim().startsWith('|'));

    return (
      <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
        {filteredLines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm font-bold text-emerald-400 mt-2 mb-1">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('#### ')) {
            return <h4 key={idx} className="text-xs font-semibold text-cyan-300 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-emerald-500 bg-emerald-950/40 text-emerald-300 text-[11px] p-2 rounded-r my-1.5 italic">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 my-0.5 ml-1">
                <CornerDownRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>{renderInlineText(line.replace(/^[\-\*]\s*/, ''))}</span>
              </div>
            );
          }
          if (line.match(/^\d+\.\s*/)) {
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 my-0.5 ml-1">
                <span className="text-emerald-400 font-mono font-bold">{line.match(/^\d+\./)?.[0]}</span>
                <span>{renderInlineText(line.replace(/^\d+\.\s*/, ''))}</span>
              </div>
            );
          }
          if (!line.trim()) return null;
          return <p key={idx} className="my-1">{renderInlineText(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-800 text-cyan-300 font-mono text-[11px] px-1 py-0.5 rounded border border-slate-700">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 p-0.5 flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-teal-400" />
                </div>
              </div>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  DocuSense AI Agent
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-300 border border-indigo-200 dark:border-teal-500/20 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-teal-400" />
                  Voice Enabled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Auditory Document Extraction & Reasoning Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice Reply Toggle */}
            <button
              onClick={toggleVoiceMode}
              title={voiceEnabled ? 'Voice Mode Active: AI speaks replies aloud (click to mute)' : 'Voice Mode Muted: Click to enable voice replies'}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                voiceEnabled
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                  <span className="text-[10px]">Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Muted</span>
                </>
              )}
            </button>

            {/* Voice Settings Popover Toggle */}
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Voice Speed & Engine Settings"
              className={`p-1.5 rounded-lg border transition-colors ${
                showVoiceSettings
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {messages.length > 0 && (
              <button
                onClick={resetConversation}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Settings Dropdown Bar */}
        {showVoiceSettings && (
          <div className="p-3 bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Speech Rate:</span>
              <div className="flex gap-1">
                {[0.85, 1.05, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setVoiceRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                      voiceRate === rate
                        ? 'bg-teal-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {rate === 1.05 ? 'Normal (1.0x)' : `${rate}x`}
                  </button>
                ))}
              </div>
            </div>

            {availableVoices.length > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Synthesizer Voice:</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => handleSelectVoice(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] truncate max-w-[240px] focus:outline-none"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Document Switcher (when documents provided) */}
        {documents.length > 0 && (
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Active Document:</span>
            <select
              value={activeDocId}
              onChange={(e) => {
                setActiveDocId(e.target.value);
                if (onSelectDocument) onSelectDocument(e.target.value);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none max-w-[260px] truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.doc_type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Global Live Speaking Waveform Status Banner */}
        {isSpeaking && (
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-900/40 via-teal-900/40 to-slate-900/60 border-b border-teal-500/30 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-4 bg-teal-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
              </div>
              <span className="text-xs font-semibold text-teal-300 flex items-center gap-1">
                AI Voice Agent is speaking...
              </span>
            </div>
            <button
              onClick={handleStopAllSpeech}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors shadow-xs"
            >
              <Square className="w-3 h-3 fill-rose-300" />
              Stop Voice
            </button>
          </div>
        )}

        {/* Conversation Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          
          {/* Welcome State */}
          {messages.length === 0 && (
            <div className="space-y-4 my-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-teal-400">
                  <FileText className="w-4 h-4" /> Welcome to DocuSense Voice Copilot
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  I can analyze the active document and answer your questions in conversational voice format. Ask me to explain validation warnings, detail schema fields, audit authenticity, or summarize the document.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Voice Replies are active. Click any prompt below or speak via the microphone!</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Quick Voice Prompts</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('summarize_extracted_information')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-teal-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Summarize document</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_validation_errors')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>⚠️</span>
                    <span>Explain warnings</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('find_missing_fields')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>❓</span>
                    <span>Find missing fields</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_classification')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Explain classification</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_conflicting_values')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>⚔️</span>
                    <span>Check conflicts</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_authenticity')}
                    className="text-left text-xs p-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 rounded-xl text-slate-800 dark:text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>🛡️</span>
                    <span>Verify AI Authenticity</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Thread */}
          {messages.map((msg) => {
            const isMsgSpeaking = isSpeaking && speakingMsgId === msg.id;
            const messageSpeechText = constructSpeechText(msg.title, msg.content, msg.structured_data);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 px-1">
                  <span>{msg.role === 'user' ? 'You' : 'DocuSense AI Agent'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-tr-xs'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 rounded-tl-xs'
                      : isMsgSpeaking
                      ? 'bg-slate-50 dark:bg-slate-950 border-2 border-teal-500/80 ring-2 ring-teal-500/20 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-lg'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Assistant Title & Per-Message Voice Listen Button */}
                  {msg.role === 'assistant' && (
                    <div className="text-xs font-bold text-indigo-600 dark:text-teal-400 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>{msg.title || 'Assistant Response'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Listen Aloud Button */}
                        <button
                          onClick={() => handleSpeakMessage(msg.id, messageSpeechText)}
                          title={isMsgSpeaking ? 'Stop voice playback' : 'Read aloud in voice format'}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                            isMsgSpeaking
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                              : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-400 border border-slate-300 dark:border-slate-700 hover:border-teal-500/50'
                          }`}
                        >
                          {isMsgSpeaking ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {renderContentBlocks(msg)}

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 mt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                        Suggested Follow-ups
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction('custom_prompt', sug)}
                            className="text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-teal-400 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-teal-300 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl w-fit animate-pulse shadow-xs">
              <div className="w-4 h-4 border-2 border-indigo-600 dark:border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing document context and synthesizing voice response...</span>
            </div>
          )}

          {/* Retry Action if API Failed */}
          {lastFailedAction && !loading && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Assistant request encountered an error.</span>
              </div>
              <button
                onClick={() => handleQuickAction(lastFailedAction.action, lastFailedAction.prompt)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-colors"
              >
                Retry Request
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer with Microphone (STT) and Send */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          {/* Active Listening Indicator */}
          {isListening && (
            <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-semibold">Microphone active: Speak your question now...</span>
              </div>
              <button
                onClick={handleToggleMic}
                className="text-[10px] font-bold text-rose-400 hover:underline"
              >
                Done
              </button>
            </div>
          )}

          <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={isListening ? 'Listening to voice...' : 'Ask DocuSense in voice or text...'}
              disabled={loading}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 focus:outline-none disabled:opacity-50"
            />

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              title={isListening ? 'Stop listening' : 'Speak your question (Voice Input)'}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center border shadow-xs ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-teal-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 transition-all flex items-center justify-center shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
