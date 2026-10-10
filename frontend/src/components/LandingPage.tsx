import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, ArrowRight, Eye, FileText, CheckCircle2, Search, FileSpreadsheet, UserCheck } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { animate, random, createScope, createTimeline, stagger } from '../utils/animator';

interface LandingPageProps {
  user?: { name: string; email: string; provider: string } | null;
  onLoginSuccess?: (user: { name: string; email: string; provider: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    animate('.shape', {
      x: random(-40, 40),
      y: random(-40, 40),
      rotate: random(-90, 90),
      duration: random(800, 1400),
      composition: 'blend',
    });

    createScope({
      mediaQueries: {
        portrait: '(orientation: portrait)',
      }
    }).add(({ matches }) => {
      const isPortrait = matches.portrait;
      createTimeline().add('.circle', {
        y: isPortrait ? 0 : [-30, 30, -30],
        x: isPortrait ? [-30, 30, -30] : 0,
      }, stagger(120));
    });
  }, []);

  const handleOpenWorkspace = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      navigate('/workspace');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0D1117] text-[#E6EDF3] font-sans selection:bg-[#246B57]/30 selection:text-white overflow-hidden">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#246B57]/15 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#161B22]/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors">
              Capabilities
            </button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('schemas')} className="hover:text-white transition-colors">
              Supported Schemas
            </button>
            <button onClick={() => scrollToSection('privacy')} className="hover:text-white transition-colors">
              Security & Privacy
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/workspace')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition-all"
              >
                Sign In <UserCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Evidence-Based AI Document Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Turn documents into <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">verified, structured data.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
              Extract, validate, and trace fields across vendor invoices, academic certificates, application forms, and travel tickets with real bounding-box evidence and zero hallucinations.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleOpenWorkspace}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-xl shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Open Workspace <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('workflow')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold transition-all"
              >
                See How It Works
              </button>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <p className="text-xl font-bold text-white">Multi-Schema</p>
                <p className="text-xs text-slate-400">Invoices, Forms & Tickets</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-400">100% Traceable</p>
                <p className="text-xs text-slate-400">Real Bounding Box Highlights</p>
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-400">Strict Validation</p>
                <p className="text-xs text-slate-400">Cross-field arithmetic verifier</p>
              </div>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <FileText className="w-4 h-4 text-emerald-400" /> sample_invoice.pdf
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  VERIFIED 100%
                </span>
              </div>

              {/* Verified Field Extract Snippets */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Invoice Number</span>
                  <span className="text-emerald-400 font-bold">INV-2026-8891</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Subtotal + Tax</span>
                  <span className="text-slate-300">$1,200.00 + $250.00</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                  <span className="text-emerald-300 font-semibold">Grand Total</span>
                  <span className="text-teal-300 font-bold text-sm">$1,450.00</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bounding-Box Evidence Linked
                </div>
                <p>Coordinates: Page 1 [X: 420, Y: 680, W: 110, H: 24]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 px-6 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Built for Enterprise Document Workflows</h2>
            <p className="text-sm text-slate-400">
              Replace manual data entry with automated extraction, cross-field validation checks, and verifiable source location references.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Native Text & OCR Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts text directly from digital PDFs before falling back to high-resolution Tesseract OCR for scanned documents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Category Schemas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supports vendor invoices, payment receipts, academic certificates, application forms, and travel tickets with custom field definitions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Source Highlighting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any extracted field to navigate directly to its exact page location and render its bounding box overlay on the document canvas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          if (onLoginSuccess) onLoginSuccess(u);
          navigate('/workspace');
        }}
      />
    </div>
  );
};
