import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  FileSpreadsheet,
  Layers,
  Cpu,
  ExternalLink,
  ChevronRight,
  Bot
} from 'lucide-react';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  user?: { name: string; email: string; provider: string } | null;
  onLoginSuccess?: (user: { name: string; email: string; provider: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/workspace');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-white transition-colors duration-200">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 transition-colors duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
              Capabilities
            </button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('schemas')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
              Supported Schemas
            </button>
            <button onClick={() => scrollToSection('architecture')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
              AI Architecture
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <span className="hidden sm:inline-block text-xs font-medium text-slate-500 dark:text-slate-400">
                {user.name}
              </span>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:inline-flex text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 sm:pt-20 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Evidence-Based Intelligent Document Processing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Documents, <span className="text-indigo-600 dark:text-indigo-400">understood.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              Extract information, validate results and review source evidence with intelligent document processing.
              Trace every extracted field back to exact bounding-box coordinates with arithmetic math verification.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('workflow')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold shadow-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">5 Schemas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Invoices, Receipts, Forms, Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Source BBox Traceability</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Deterministic</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cross-Field Arithmetic Math</p>
              </div>
            </div>
          </div>

          {/* Hero Visual: Split-Pane Document Intelligence Preview */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                    sample_invoice.pdf
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  Ready for Review
                </span>
              </div>

              {/* Split-pane Preview Graphic */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Left Mini Document */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-2 font-mono">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
                    <span>TAX INVOICE</span>
                    <span className="text-teal-600 dark:text-teal-400">98% OCR</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300">
                      INV-2026-8891
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">Date: 2026-09-28</div>
                    <div className="text-slate-600 dark:text-slate-400">Subtotal: $1,200.00</div>
                    <div className="text-slate-600 dark:text-slate-400">Tax: $250.00</div>
                    <div className="p-1 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-300 font-semibold">
                      Total: $1,450.00
                    </div>
                  </div>
                </div>

                {/* Right Mini Field Results */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-800">
                    Validated Fields
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice No</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">INV-2026-8891</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">$1,200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax Amount</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">$250.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Grand Total</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">$1,450.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Math Check Verification Bar */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-[11px] text-teal-800 dark:text-teal-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Arithmetic Validation Passed
                </span>
                <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400">1200 + 250 = 1450</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-mono font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            Core Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for enterprise document integrity
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A complete pipeline engineered to extract structured data, eliminate hallucinations, and keep human reviewers in control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Source-Anchored Bounding Boxes</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every extracted value is mapped to precise PyMuPDF vector geometry. Click any field to jump directly to its visual source on the document.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Math Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated invoice arithmetic checks verify subtotal plus tax equals the grand total, instantly flagging mismatches for human review.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ML Document Classifier</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trained Scikit-Learn TF-IDF + MultinomialNB classifier categorizes documents into schemas with measured held-out accuracy and keyword fallback.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit Copilot Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In-app copilot inspects genuine database records to explain classification rationale, missing schema fields, and past human reviewer edits.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Side-by-Side Review Canvas</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive reviewer interface allows inline editing, multi-candidate conflict resolution, approval stamps, and full audit persistence.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Export & Integration Hub</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export validated fields to normalized JSON or CSV, or dispatch webhook payloads directly to downstream enterprise ERP systems.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="relative z-10 px-6 py-20 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-mono font-semibold tracking-wider text-teal-600 dark:text-teal-400 uppercase">
            Four-Stage Processing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            How DocuSense AI works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From raw document ingestion to downstream ERP export in a single reliable workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">01 / Ingest</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload & Inspect</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Files are checked for SHA-256 duplicate hashes, format verification, and OpenCV image blur and contrast quality scoring.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">02 / Classify</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">ML Category Routing</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TF-IDF classifier assigns the document schema with provenance tracking, routing low-confidence files for manual classification.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">03 / Extract</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Semantic Field Extraction</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts fields with PyMuPDF block coordinates, date/currency normalization, and cross-field arithmetic math verification.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">04 / Review</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Human Review & Export</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reviewers inspect highlighted text bounding boxes, perform inline corrections, approve records, and export to CSV or JSON.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Schemas Section */}
      <section id="schemas" className="relative z-10 px-6 py-20 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-mono font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            Document Types
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pre-configured document schemas
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Out-of-the-box support for the most common document categories across accounting, education, travel, and operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Schema 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              invoice
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Vendor Tax Invoices</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Extracts invoice number, date, vendor, buyer, GSTIN/Tax ID, subtotal, tax amount, and total with arithmetic validation.
            </p>
          </div>

          {/* Schema 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              receipt
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment & Fee Receipts</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Captures receipt reference number, payment date, payer student/customer name, payee institution, amount, and transaction ID.
            </p>
          </div>

          {/* Schema 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              certificate
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Certificates</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Identifies recipient full name, course/degree title, issuing university/board, credential ID, and issue date.
            </p>
          </div>

          {/* Schema 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              application_form
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Application Forms</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Extracts applicant name, tracking ID, verified email address, phone number, address, and submission date.
            </p>
          </div>

          {/* Schema 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              travel_ticket
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Travel Tickets & Itineraries</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Extracts PNR booking reference, passenger name, airline/operator, origin, destination, travel date, and fare.
            </p>
          </div>

          {/* Schema 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              custom
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Schema Editor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Add new document schemas with custom field definitions, required flags, and data types via the visual Schema Editor.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Transparency Banner */}
      <section id="architecture" className="relative z-10 px-6 py-16 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Architecture Transparency</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Truthful disclosure of models and inference engines currently executing in DocuSense AI.
              </p>
            </div>
            <button
              onClick={() => navigate('/schemas')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Inspect Schema Definitions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Classification Model</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Scikit-Learn TF-IDF + MultinomialNB</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">100% held-out test accuracy</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Text Geometry Engine</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">PyMuPDF 1.28.2 (Native Vector Text)</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">Zero coordinate hallucination</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Image Preprocessing</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">OpenCV CLAHE & Blur Variance</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">Automatic deskewing & quality scoring</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Semantic Extraction</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Gemini Flash (SDK) / Rule Fallback</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">Structured Pydantic schemas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
              Intelligent Document Information Extraction Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/workspace')} className="hover:text-indigo-600 dark:hover:text-white cursor-pointer">
              Workspace
            </button>
            <button onClick={() => navigate('/integrity')} className="hover:text-indigo-600 dark:hover:text-white cursor-pointer">
              Integrity
            </button>
            <button onClick={() => navigate('/schemas')} className="hover:text-indigo-600 dark:hover:text-white cursor-pointer">
              Schemas
            </button>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            DocuSense AI &copy; 2026
          </div>
        </div>
      </footer>

      {/* Auth Modal for optional user login */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          if (onLoginSuccess) onLoginSuccess(u);
          setIsAuthOpen(false);
          navigate('/workspace');
        }}
      />
    </div>
  );
};
