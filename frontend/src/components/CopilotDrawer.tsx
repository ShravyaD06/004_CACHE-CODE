import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type { CopilotResponse } from '../types';
import { Bot, X, Send, RotateCcw, AlertTriangle, FileText, CornerDownRight } from 'lucide-react';

interface CopilotDrawerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
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

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ documentId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastFailedAction, setLastFailedAction] = useState<{ action: string; prompt?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleQuickAction = async (action: string, promptText?: string) => {
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
      const res: CopilotResponse = await api.getCopilotInsights(documentId, action, promptText);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || loading) return;
    const prompt = customPrompt.trim();
    setCustomPrompt('');
    handleQuickAction('custom_prompt', prompt);
  };

  const resetConversation = () => {
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-md transition-opacity animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-800 text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
                DocuSense Copilot
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Local Rule-Based Assistance
                </span>
              </h2>
              <span className="text-[11px] text-slate-400">Contextual document intelligence assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={resetConversation}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Welcome State */}
          {messages.length === 0 && (
            <div className="space-y-4 my-2">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <FileText className="w-4 h-4" /> Welcome to Document Assistant
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  I can analyze the active document to explain classification logic, detail validation warnings, audit missing fields, or summarize extracted values.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Quick Action Prompts</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('summarize_extracted_information')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Summarize document</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_validation_errors')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>⚠️</span>
                    <span>Explain warnings</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('find_missing_fields')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>❓</span>
                    <span>Find missing fields</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_classification')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Explain classification</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_conflicting_values')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>⚔️</span>
                    <span>Check conflicts</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain_corrections')}
                    className="text-left text-xs p-3 bg-slate-950/40 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-xl text-slate-200 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>✍️</span>
                    <span>Audit corrections</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Thread */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                <span>{msg.role === 'user' ? 'You' : 'DocuSense Assistant'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] rounded-2xl p-3.5 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-rose-950/50 border border-rose-800/80 text-rose-200 rounded-tl-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-xs'
                }`}
              >
                {msg.title && (
                  <div className="text-xs font-bold text-emerald-400 pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                    <span>{msg.title}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      Rule-Based
                    </span>
                  </div>
                )}

                {renderContentBlocks(msg)}

                {/* Suggestions Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 mt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                      Suggested Follow-ups
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction('custom_prompt', sug)}
                          className="text-[11px] bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-slate-950 border border-slate-800 p-3 rounded-2xl w-fit animate-pulse">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing document context & extraction results...</span>
            </div>
          )}

          {/* Retry Action if API Failed */}
          {lastFailedAction && !loading && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
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

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleCustomSubmit} className="flex space-x-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask Copilot about fields, values, errors..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
