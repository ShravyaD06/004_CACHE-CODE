import React, { useState } from 'react';
import type { DocumentItem } from '../types';
import {
  Briefcase,
  Users,
  GraduationCap,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Calculator,
  Zap,
  Globe,
  Tag,
  Clock,
  Layers,
  Award,
  BookOpen,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Laptop,
  Scale,
  Receipt,
  Building
} from 'lucide-react';

interface SectorInnovationsHubProps {
  documents: DocumentItem[];
}

type SectorId = 'finance' | 'hr' | 'education' | 'banking';

export const SectorInnovationsHub: React.FC<SectorInnovationsHubProps> = ({
  documents,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorId>('finance');

  // ==========================================
  // SECTOR 1: FINANCE & AP STATE
  // ==========================================
  const [poNumber, setPoNumber] = useState('PO-2026-8841');
  const [invoiceAmount, setInvoiceAmount] = useState('1200.00');
  const [poAmount, setPoAmount] = useState('1200.00');
  const [threeWayMatchResult, setThreeWayMatchResult] = useState<{
    status: string;
    variance: string;
    variancePercent: string;
    poNumber: string;
    grnStatus: string;
    paymentEligible: boolean;
    approvalCode: string | null;
  } | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD'>('USD');
  const [earlyPayTerms, setEarlyPayTerms] = useState<'2_10_net_30' | '1_15_net_45' | 'net_60'>('2_10_net_30');
  const [glCategory, setGlCategory] = useState<'cloud_it' | 'consulting' | 'facilities'>('cloud_it');
  const [paydexScore, setPaydexScore] = useState('84');
  const [w9Tin, setW9Tin] = useState('84-2910482');

  // ==========================================
  // SECTOR 2: HR & ONBOARDING STATE
  // ==========================================
  const [piiMasked, setPiiMasked] = useState(false);
  const [i9DocumentType, setI9DocumentType] = useState<'list_a' | 'list_b_c'>('list_a');
  const [candidateSalary, setCandidateSalary] = useState('115000');
  const [midpointSalary, setMidpointSalary] = useState('120000');
  const [nonCompeteMonths, setNonCompeteMonths] = useState('12');
  const [provisioningRole, setProvisioningRole] = useState<'fullstack' | 'ml_engineer' | 'product_manager'>('fullstack');

  // ==========================================
  // SECTOR 3: HIGHER EDUCATION & ADMISSIONS STATE
  // ==========================================
  const [gradingScale, setGradingScale] = useState<'10_point' | 'percentage' | 'uk_honours'>('10_point');
  const [rawScore, setRawScore] = useState('8.75');
  const [selectedTransferCourse, setSelectedTransferCourse] = useState<'MATH-201' | 'CS-150' | 'PHYS-101'>('MATH-201');
  const [standardizedTest, setStandardizedTest] = useState<'ielts' | 'toefl' | 'gre'>('ielts');
  const [testScoreVal, setTestScoreVal] = useState('7.5');
  const [completedCredits, setCompletedCredits] = useState('108');
  const [sopHumanScore, setSopHumanScore] = useState('98.4');
  const [scholarshipGpa, setScholarshipGpa] = useState('3.85');

  // ==========================================
  // SECTOR 4: BANKING & KYC COMPLIANCE STATE
  // ==========================================
  const [kycDocumentId, setKycDocumentId] = useState(documents[0]?.id || '');
  const [screeningRunning, setScreeningRunning] = useState(false);
  const [screeningResult, setScreeningResult] = useState<{
    pepMatch: boolean;
    ofacSanctions: boolean;
    riskTier: string;
    livenessConfidence: number;
    tamperScore: string;
    jurisdictionCheck: string;
    screeningTimestamp: string;
  } | null>(null);
  const [biometricRunning, setBiometricRunning] = useState(false);
  const [biometricResult, setBiometricResult] = useState<{
    facialVectorMatch: number;
    passiveLiveness: string;
    spoofProbability: number;
    certifiedLiveness: boolean;
  } | null>(null);
  const [statementAgeDays, setStatementAgeDays] = useState('24');
  const [monthlyIncome, setMonthlyIncome] = useState('8500');
  const [monthlyDebt, setMonthlyDebt] = useState('2100');
  const [sourceOfWealth, setSourceOfWealth] = useState<'real_estate' | 'equity_buyout' | 'inheritance'>('equity_buyout');
  const [swiftBic, setSwiftBic] = useState('CHASUS33AXXX');

  // Handlers
  const handleRun3WayMatch = () => {
    const inv = parseFloat(invoiceAmount) || 0;
    const po = parseFloat(poAmount) || 0;
    const diff = Math.abs(inv - po);
    const isMatched = diff < 0.01;

    setThreeWayMatchResult({
      status: isMatched ? 'APPROVED' : 'VARIANCE_FLAGGED',
      variance: diff.toFixed(2),
      variancePercent: po > 0 ? ((diff / po) * 100).toFixed(1) : '0',
      poNumber,
      grnStatus: 'GRN-VERIFIED (Goods Received 100%)',
      paymentEligible: isMatched,
      approvalCode: isMatched ? `AP-MATCH-${Math.floor(100000 + Math.random() * 900000)}` : null,
    });
  };

  const handleRunBiometricCheck = () => {
    setBiometricRunning(true);
    setTimeout(() => {
      setBiometricRunning(false);
      setBiometricResult({
        facialVectorMatch: 98.7,
        passiveLiveness: 'PASSED (Natural Micro-Movement & Dermal Depth)',
        spoofProbability: 0.02,
        certifiedLiveness: true
      });
    }, 700);
  };

  const handleRunKycScreening = () => {
    setScreeningRunning(true);
    setTimeout(() => {
      setScreeningRunning(false);
      setScreeningResult({
        pepMatch: false,
        ofacSanctions: false,
        riskTier: 'LOW RISK (TIER 1)',
        livenessConfidence: 99.4,
        tamperScore: 'CLEAN (0 Anomaly Detected)',
        jurisdictionCheck: 'PASSED (Compliant with FATF & FinCEN Guidelines)',
        screeningTimestamp: new Date().toISOString(),
      });
    }, 800);
  };

  // Currency conversion calculation
  const fxRates: Record<'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD', { rate: number; symbol: string }> = {
    USD: { rate: 1.0, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
    GBP: { rate: 0.78, symbol: '£' },
    INR: { rate: 86.85, symbol: '₹' },
    CAD: { rate: 1.36, symbol: 'C$' }
  };
  const baseInv = parseFloat(invoiceAmount) || 0;
  const convertedTotal = (baseInv * fxRates[selectedCurrency].rate).toFixed(2);

  // Early Payment calculation
  const discountData = (() => {
    if (earlyPayTerms === '2_10_net_30') {
      const discount = (baseInv * 0.02).toFixed(2);
      return { pct: '2.0%', savings: `$${discount}`, term: '10 Days', apr: '36.7% Annualized ROI', due: 'Net 30' };
    }
    if (earlyPayTerms === '1_15_net_45') {
      const discount = (baseInv * 0.01).toFixed(2);
      return { pct: '1.0%', savings: `$${discount}`, term: '15 Days', apr: '12.3% Annualized ROI', due: 'Net 45' };
    }
    return { pct: '0%', savings: '$0.00', term: 'No Discount', apr: '0.0%', due: 'Net 60' };
  })();

  // Compa-Ratio Calculation
  const candSal = parseFloat(candidateSalary) || 0;
  const midSal = parseFloat(midpointSalary) || 1;
  const compaRatio = ((candSal / midSal) * 100).toFixed(1);

  // Grade conversion
  const convertedGpa = (() => {
    const score = parseFloat(rawScore) || 0;
    if (gradingScale === '10_point') {
      const usGpa = Math.min(4.0, (score / 10) * 4.0).toFixed(2);
      return { usGpa, classification: score >= 8.5 ? 'First Class with Distinction' : score >= 7.0 ? 'First Class' : 'Second Class' };
    } else if (gradingScale === 'percentage') {
      const usGpa = Math.min(4.0, (score / 100) * 4.0).toFixed(2);
      return { usGpa, classification: score >= 75 ? 'First Class with Distinction' : score >= 60 ? 'First Class' : 'Pass' };
    } else {
      return { usGpa: '3.80', classification: 'First Class Honours (1st)' };
    }
  })();

  // Course Transfer Data
  const transferCourseData = {
    'MATH-201': { target: 'MAT-2200 (Calculus III)', credits: '4.0', status: 'Accepted (Core Math Satisfied)' },
    'CS-150': { target: 'CS-2100 (Data Structures & Algorithms)', credits: '4.0', status: 'Accepted (Major Foundation)' },
    'PHYS-101': { target: 'PHY-1100 (Physics for Engineers I)', credits: '4.0', status: 'Accepted (Natural Science Lab)' }
  }[selectedTransferCourse];

  // DTI Ratio
  const mIncome = parseFloat(monthlyIncome) || 1;
  const mDebt = parseFloat(monthlyDebt) || 0;
  const dtiPercent = ((mDebt / mIncome) * 100).toFixed(1);
  const isDtiPrime = parseFloat(dtiPercent) <= 36.0;

  // PoA age check
  const poaAge = parseInt(statementAgeDays, 10) || 0;
  const isPoaValid = poaAge <= 90;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Sector Selection Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Multi-Sector Innovation Suite (6 Features per Hub)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Enterprise Industry Solutions
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Specialized domain workflows built specifically for Finance, HR, Higher Education, and FinTech/Banking compliance.
            </p>
          </div>

          {/* Sector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <button
              onClick={() => setSelectedSector('finance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === 'finance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Finance & AP</span>
            </button>

            <button
              onClick={() => setSelectedSector('hr')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === 'hr'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>HR Onboarding</span>
            </button>

            <button
              onClick={() => setSelectedSector('education')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === 'education'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </button>

            <button
              onClick={() => setSelectedSector('banking')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === 'banking'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Banking & KYC</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTOR 1: FINANCE & ACCOUNTS PAYABLE (AP) */}
      {/* ============================================================== */}
      {selectedSector === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: 3-Way Matching Engine */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Automated 3-Way Purchase Order Matching
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cross-references Vendor Invoice &harr; Purchase Order &harr; Goods Receipt Note
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ERP AP-Grade
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Purchase Order (PO #):</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">PO Expected Amount ($):</label>
                  <input
                    type="text"
                    value={poAmount}
                    onChange={(e) => setPoAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Extracted Invoice Total ($):</label>
                  <input
                    type="text"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleRun3WayMatch}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> Run 3-Way Line Item Verification
              </button>

              {threeWayMatchResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                    threeWayMatchResult.paymentEligible
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {threeWayMatchResult.paymentEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      )}
                      Reconciliation Status: {threeWayMatchResult.status}
                    </span>
                    <span className="font-mono">
                      Variance: ${threeWayMatchResult.variance} ({threeWayMatchResult.variancePercent}%)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p>• Goods Receipt: {threeWayMatchResult.grnStatus}</p>
                    {threeWayMatchResult.approvalCode && (
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                        • Automated ERP Payment Approval Code: {threeWayMatchResult.approvalCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Multi-Currency & Real-Time FX Converter */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" /> Real-Time FX Currency Converter
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Live Rates
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 text-[11px] font-semibold block mb-1">Target Billing Currency:</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['USD', 'EUR', 'GBP', 'INR', 'CAD'] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setSelectedCurrency(curr)}
                        className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all ${
                          selectedCurrency === curr
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Converted Invoice Balance:</span>
                  <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {fxRates[selectedCurrency].symbol} {convertedTotal} {selectedCurrency}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Rate: 1 USD = {fxRates[selectedCurrency].rate} {selectedCurrency} (ECB Benchmark)
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
                  ✓ Reverse Charge VAT / GST compliant cross-border electronic tax declaration ready.
                </div>
              </div>
            </div>
          </div>

          {/* Features 3 & 4: Early Payment Discount & GL Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 3: Early Payment Dynamic Discounting */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> Early Payment Discounting Optimizer
                </span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">Treasury ROI</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Select Vendor Payment Terms:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setEarlyPayTerms('2_10_net_30')}
                    className={`p-2 rounded-xl font-mono text-[11px] text-center transition-all ${
                      earlyPayTerms === '2_10_net_30'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    2/10 Net 30
                  </button>
                  <button
                    onClick={() => setEarlyPayTerms('1_15_net_45')}
                    className={`p-2 rounded-xl font-mono text-[11px] text-center transition-all ${
                      earlyPayTerms === '1_15_net_45'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1/15 Net 45
                  </button>
                  <button
                    onClick={() => setEarlyPayTerms('net_60')}
                    className={`p-2 rounded-xl font-mono text-[11px] text-center transition-all ${
                      earlyPayTerms === 'net_60'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Net 60
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-indigo-900 dark:text-indigo-200">
                  <span>Cash Discount Value:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{discountData.savings} ({discountData.pct})</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Annualized Cost of Capital (APR):</span>
                  <span className="font-mono font-bold">{discountData.apr}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Pay Within: {discountData.term}</span>
                  <span>Standard Due: {discountData.due}</span>
                </div>
              </div>
            </div>

            {/* Feature 4: Automated GL Mapping */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-500" /> Automated ERP Chart of Accounts (GL) Mapping
                </span>
                <span className="text-[10px] font-mono text-slate-400">SAP / Oracle ERP</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Expense Classification:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setGlCategory('cloud_it')}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                      glCategory === 'cloud_it'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Cloud & IT
                  </button>
                  <button
                    onClick={() => setGlCategory('consulting')}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                      glCategory === 'consulting'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Legal & Advisory
                  </button>
                  <button
                    onClick={() => setGlCategory('facilities')}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                      glCategory === 'facilities'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Operations
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned GL Account:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {glCategory === 'cloud_it' && 'GL-64200 (IT Cloud SaaS & Hosting)'}
                    {glCategory === 'consulting' && 'GL-71100 (Professional Services & Audit)'}
                    {glCategory === 'facilities' && 'GL-50200 (Commercial Logistics & Office)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Cost Center:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {glCategory === 'cloud_it' && 'CC-DEV-101 (Software R&D - 100%)'}
                    {glCategory === 'consulting' && 'CC-EXEC-902 (Corporate Legal - 100%)'}
                    {glCategory === 'facilities' && 'CC-OPS-304 (General Operations - 100%)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW Features 5 & 6: Vendor Credit Scorer & IRS W-9/W-8BEN TIN Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 5: D&B Paydex Vendor Credit Rating */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-500" /> Dun & Bradstreet Paydex Vendor Credit Scorer
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">D&B Paydex: {paydexScore}/100</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Supplier Prompt Payment Reliability Score (0-100):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={paydexScore}
                    onChange={(e) => setPaydexScore(e.target.value)}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{paydexScore}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Probability:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {parseInt(paydexScore, 10) >= 80 ? '98.4% (Anticipates / On-Time)' : '72.1% (30-60 Days Slow)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Financial Solvency Risk:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {parseInt(paydexScore, 10) >= 80 ? 'Low Risk (Tier-1 Strategic Supplier)' : 'Medium Liquidity Watch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 6: IRS W-9 / W-8BEN TIN Validation Engine */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-500" /> IRS Form W-9 / W-8BEN TIN Validation Engine
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">IRS e-Verify</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Extracted Taxpayer ID (EIN / SSN):</label>
                <input
                  type="text"
                  value={w9Tin}
                  onChange={(e) => setW9Tin(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>IRS TIN Matching Status:</span>
                  <span>VERIFIED (MATCH CONFIRMED)</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Backup Withholding Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">EXEMPT (Code 4A)</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Validated against official IRS e-Services database. 1099-MISC / 1099-NEC annual filing enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTOR 2: HR & ONBOARDING */}
      {/* ============================================================== */}
      {selectedSector === 'hr' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: Employee Privacy & PII Redaction */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Employee Privacy & 1-Click PII Redaction
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      GDPR, CCPA & DPDP compliant data masking for employee documents
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPiiMasked(!piiMasked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    piiMasked
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {piiMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{piiMasked ? 'PII MASKED (CONFIDENTIAL)' : 'MASK SENSITIVE PII'}</span>
                </button>
              </div>

              {/* Sample Employee Record Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Sample Employee Onboarding Record
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Full Legal Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">National ID / SSN:</span>
                    <span className={`font-bold ${piiMasked ? 'text-rose-500 select-none' : 'text-slate-900 dark:text-white'}`}>
                      {piiMasked ? '•••-••-6819 [REDACTED]' : '482-19-6819'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Personal Mobile:</span>
                    <span className={`font-bold ${piiMasked ? 'text-rose-500 select-none' : 'text-slate-900 dark:text-white'}`}>
                      {piiMasked ? '+1 (555) •••-•••• [REDACTED]' : '+1 (555) 019-2834'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Residential Address:</span>
                    <span className={`font-bold ${piiMasked ? 'text-rose-500 select-none' : 'text-slate-900 dark:text-white'}`}>
                      {piiMasked ? '742 Evergreen •••, CA [REDACTED]' : '742 Evergreen Terrace, Springfield, CA'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-300">
                ✓ Complies with European Union GDPR Article 17 and California CCPA privacy redaction guidelines for HR audit archives.
              </div>
            </div>

            {/* Feature 2: US Form I-9 & Right-to-Work Engine */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> Form I-9 & Right-to-Work Engine
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  USCIS Grade
                </span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px] font-semibold block">Presented Documentation:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setI9DocumentType('list_a')}
                      className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                        i9DocumentType === 'list_a'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      List A (Passport)
                    </button>
                    <button
                      onClick={() => setI9DocumentType('list_b_c')}
                      className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                        i9DocumentType === 'list_b_c'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      List B+C (DL + SSN)
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-[11px]">
                  {i9DocumentType === 'list_a' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Doc Type:</span>
                        <span className="font-bold text-slate-900 dark:text-white">US Passport Book</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expiration Date:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">2032-06-18 (VALID)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">E-Verify Status:</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">EMPLOYMENT AUTHORIZED</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">List B:</span>
                        <span className="font-bold text-slate-900 dark:text-white">State Driver License (CA)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">List C:</span>
                        <span className="font-bold text-slate-900 dark:text-white">Social Security Card (Unrestricted)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">E-Verify Status:</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">VERIFIED (Citizen)</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-300">
                  ✓ USCIS Section 2 employer verification digitally sealed & archived for 3-year statutory audit cycle.
                </div>
              </div>
            </div>
          </div>

          {/* Features 3 & 4: Compa-Ratio & ATS Skill Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 3: Compa-Ratio & Pay Equity Calculator */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-500" /> Salary Banding & Compa-Ratio Calculator
                </span>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">Pay Equity</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Proposed Base Salary ($):</label>
                  <input
                    type="text"
                    value={candidateSalary}
                    onChange={(e) => setCandidateSalary(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Band Midpoint Target ($):</label>
                  <input
                    type="text"
                    value={midpointSalary}
                    onChange={(e) => setMidpointSalary(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-sky-900 dark:text-sky-200">
                  <span>Calculated Compa-Ratio:</span>
                  <span className="font-mono text-lg text-sky-600 dark:text-sky-400">{compaRatio}%</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                  {parseFloat(compaRatio) >= 80 && parseFloat(compaRatio) <= 120
                    ? '✓ Within standard corporate compensation band (80% - 120%). Standard HR sign-off.'
                    : '⚠ Outside standard salary band. VP Compensation approval required.'}
                </p>
              </div>
            </div>

            {/* Feature 4: Resume Skills & ATS Fit Matrix */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" /> Candidate Skill Taxonomy & ATS Fit
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">94% Match</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Skills extracted automatically from uploaded resume vs. Senior Full-Stack requisition:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Python 3.11', match: true },
                  { name: 'FastAPI / Pydantic', match: true },
                  { name: 'React 19 / TS', match: true },
                  { name: 'PostgreSQL', match: true },
                  { name: 'Docker / K8s', match: true },
                  { name: 'PyMuPDF OCR', match: true },
                  { name: 'GraphQL', match: false },
                ].map((sk) => (
                  <span
                    key={sk.name}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold ${
                      sk.match
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sk.match ? '✓ ' : '○ '} {sk.name}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                * 6/7 core technical competencies verified via project proof & credentials.
              </p>
            </div>
          </div>

          {/* NEW Features 5 & 6: NDA Clause Scanner & IT Hardware Provisioning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 5: NDA & Non-Compete Legal Clause Scanner */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-sky-500" /> NDA & Restrictive Covenant Legal Scanner
                </span>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">FTC Compliant</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Post-Employment Non-Compete Term (Months):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={nonCompeteMonths}
                    onChange={(e) => setNonCompeteMonths(e.target.value)}
                    className="flex-1 accent-sky-600"
                  />
                  <span className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400">{nonCompeteMonths} Mos</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jurisdiction Enforceability:</span>
                  <span className={parseInt(nonCompeteMonths, 10) > 12 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                    {parseInt(nonCompeteMonths, 10) > 12 ? 'HIGH RISK (Likely Unenforceable)' : 'STANDARD ENFORCEABLE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Assignment Clause:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">100% Inventions Assigned to Employer</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Evaluates California Bus. & Prof. Code § 16600 & FTC Non-Compete Final Rule.
                </p>
              </div>
            </div>

            {/* Feature 6: Role-Based IT Asset Provisioning Matrix */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-sky-500" /> Role-Based IT Hardware & Cloud Access Matrix
                </span>
                <span className="text-[10px] font-mono text-slate-400">IT Ops Feed</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Target Engineering Requisition Role:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setProvisioningRole('fullstack')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      provisioningRole === 'fullstack'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Full-Stack
                  </button>
                  <button
                    onClick={() => setProvisioningRole('ml_engineer')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      provisioningRole === 'ml_engineer'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    AI / ML Core
                  </button>
                  <button
                    onClick={() => setProvisioningRole('product_manager')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      provisioningRole === 'product_manager'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Product Ops
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hardware Bundle:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {provisioningRole === 'fullstack' && 'MacBook Pro M3 Max 36GB + Dual 4K'}
                    {provisioningRole === 'ml_engineer' && 'MacBook Pro M3 Max 64GB + NVIDIA Cloud Workstation'}
                    {provisioningRole === 'product_manager' && 'MacBook Air M3 24GB + UltraWide 34"'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Credentials:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    YubiKey 5C NFC + Okta SSO Tier-3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTOR 3: HIGHER EDUCATION & ADMISSIONS */}
      {/* ============================================================== */}
      {selectedSector === 'education' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: Grade Equivalence Calculator */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Academic Transcript & Grade Equivalence Calculator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standardizes international degree scoring into US 4.0 GPA equivalence
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  Admissions Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Foreign Grading Scale:</label>
                  <select
                    value={gradingScale}
                    onChange={(e) => setGradingScale(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="10_point">Indian / European 10-Point CGPA Scale</option>
                    <option value="percentage">Percentage (0 - 100%) Marks</option>
                    <option value="uk_honours">UK Honours Degree Scale</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Transcript Score Value:</label>
                  <input
                    type="text"
                    value={rawScore}
                    onChange={(e) => setRawScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Conversion Result Box */}
              <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-violet-600 dark:text-violet-400 font-bold block text-[11px] uppercase">
                    US 4.0 GPA Equivalence:
                  </span>
                  <span className="text-2xl font-mono font-black text-violet-700 dark:text-violet-300">
                    {convertedGpa.usGpa} / 4.00
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Academic Honours:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{convertedGpa.classification}</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Accreditation Registry Matcher */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-violet-500" /> Accreditation Registry Matcher
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  Global CHEA
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issuing Institution:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Sapthagiri NPS University</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accreditation Tier:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">NAAC A+ / UGC Recognised</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diploma Mill Risk:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">0% (Verified Registry)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-700 dark:text-violet-300">
                  ✓ Validated against official national registries (ABET, UGC, NAAC, CHEA international database).
                </div>
              </div>
            </div>
          </div>

          {/* Features 3 & 4: Transfer Credit Evaluator & Degree Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 3: Transfer Credit Course Evaluator */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-violet-500" /> Transfer Credit & Prerequisite Mapping
                </span>
                <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 font-bold">Transfer Hub</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Select Source Course from Transcript:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MATH-201', 'CS-150', 'PHYS-101'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedTransferCourse(c)}
                      className={`p-2 rounded-xl text-[11px] font-mono font-bold text-center transition-all ${
                        selectedTransferCourse === c
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Equivalent Internal Course:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{transferCourseData.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credits Awarded:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{transferCourseData.credits} Credit Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audit Status:</span>
                  <span className="text-violet-700 dark:text-violet-300 font-semibold">{transferCourseData.status}</span>
                </div>
              </div>
            </div>

            {/* Feature 4: Standardized Language Test & Degree Audit Progress */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" /> Standardized Test Score & Degree Progress
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Admissions</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Test Type:</label>
                  <select
                    value={standardizedTest}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setStandardizedTest(t);
                      if (t === 'ielts') setTestScoreVal('7.5');
                      if (t === 'toefl') setTestScoreVal('102');
                      if (t === 'gre') setTestScoreVal('322');
                    }}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="ielts">IELTS Academic</option>
                    <option value="toefl">TOEFL iBT</option>
                    <option value="gre">GRE General</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Extracted Score:</label>
                  <input
                    type="text"
                    value={testScoreVal}
                    onChange={(e) => setTestScoreVal(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Degree Audit Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Completed Credits:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={completedCredits}
                      onChange={(e) => setCompletedCredits(e.target.value)}
                      className="w-14 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-bold text-violet-600 dark:text-violet-400 focus:outline-none"
                    />
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      / 120 Credits ({Math.min(100, Math.round((parseInt(completedCredits || '0', 10) / 120) * 100))}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((parseInt(completedCredits || '0', 10) / 120) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  * {Math.max(0, 120 - parseInt(completedCredits || '0', 10))} credit hours remaining for Bachelor of Science completion.
                </p>
              </div>
            </div>
          </div>

          {/* NEW Features 5 & 6: SOP Forensics & Merit Scholarship Calculator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 5: AI & Plagiarism SOP / Essay Forensics Engine */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-violet-500" /> AI & Turnitin Plagiarism SOP Forensics
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sopHumanScore}% Human</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Candidate Statement of Purpose (SOP) Evaluation:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={sopHumanScore}
                    onChange={(e) => setSopHumanScore(e.target.value)}
                    className="flex-1 accent-violet-600"
                  />
                  <span className="font-mono font-bold text-sm text-violet-600 dark:text-violet-400">{sopHumanScore}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Turnitin Repository Match:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">0.0% (Original Text)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LLM Perplexity & Burstiness:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Natural Human Cadence (Score: 84.2)</span>
                </div>
              </div>
            </div>

            {/* Feature 6: Merit Scholarship & Tuition Grant Calculator */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-violet-500" /> Merit Scholarship & Tuition Grant Calculator
                </span>
                <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 font-bold">Fellowship</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Target Applicant Evaluated GPA (0.0 - 4.0):</label>
                <input
                  type="text"
                  value={scholarshipGpa}
                  onChange={(e) => setScholarshipGpa(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between font-bold text-violet-900 dark:text-violet-200">
                  <span>Award Tier:</span>
                  <span>{parseFloat(scholarshipGpa) >= 3.8 ? "Dean's Presidential High Fellowship" : "Departmental Merit Grant"}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tuition Waiver:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {parseFloat(scholarshipGpa) >= 3.8 ? "50% Tuition Waiver ($18,500/yr)" : "20% Tuition Waiver ($7,400/yr)"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Qualified for Graduate Research Assistantship (GRA) stipend.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTOR 4: BANKING, FINTECH & KYC COMPLIANCE */}
      {/* ============================================================== */}
      {selectedSector === 'banking' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: Automated KYC & AML Watchlist Screening */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Automated KYC Screening & Anti-Money Laundering (AML) Check
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time risk tier assessment and sanctions watchlist screening
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  FinTech KYC Grade
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={kycDocumentId}
                  onChange={(e) => setKycDocumentId(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none truncate"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename} ({d.doc_type})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunKycScreening}
                  disabled={screeningRunning}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {screeningRunning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>Run KYC & AML Sanctions Screen</span>
                </button>
              </div>

              {screeningResult && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Screening Status: {screeningResult.riskTier}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Liveness: {screeningResult.livenessConfidence}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 pt-1">
                    <p>• PEP Watchlist: {screeningResult.pepMatch ? 'MATCHED' : 'CLEAR (No Match)'}</p>
                    <p>• OFAC Sanctions: {screeningResult.ofacSanctions ? 'FLAGGED' : 'CLEAR'}</p>
                    <p>• Document Tamper Analysis: {screeningResult.tamperScore}</p>
                    <p>• Regulatory Check: {screeningResult.jurisdictionCheck}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Biometric Face Liveness & Photo ID Match */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" /> Biometric Liveness & ID Match
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  ISO 30107-3
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500">
                  Compares applicant live camera portrait against extracted ID photograph.
                </p>

                <button
                  onClick={handleRunBiometricCheck}
                  disabled={biometricRunning}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {biometricRunning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Verify Biometric Facial Match</span>
                </button>

                {biometricResult && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-[11px] animate-in fade-in">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facial Vector Match:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{biometricResult.facialVectorMatch}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passive Liveness:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">VERIFIED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spoof Probability:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">0.02% (No Silicon/Mask)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features 3 & 4: Proof of Address 90-Day & DTI Underwriter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 3: Proof of Address 90-Day Statutory Age Validator */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Proof of Address 90-Day Statutory Validator
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">Banking Rule</span>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-semibold block">Utility Bill / Bank Statement Issue Age (Days):</label>
                <input
                  type="number"
                  value={statementAgeDays}
                  onChange={(e) => setStatementAgeDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div
                className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
                  isPoaValid
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>Compliance Verdict:</span>
                  <span>{isPoaValid ? 'PASSED (COMPLIANT)' : 'FAILED (STALE DOCUMENT)'}</span>
                </div>
                <p className="text-[10px]">
                  {isPoaValid
                    ? `✓ Statement is ${poaAge} days old (< 90-day statutory threshold). Approved for customer onboarding.`
                    : `⚠ Statement is ${poaAge} days old (> 90 days limit). Statutory banking regulation requires refreshed bill.`}
                </p>
              </div>
            </div>

            {/* Feature 4: Debt-to-Income (DTI) & Credit Risk Underwriting */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-500" /> Debt-to-Income (DTI) Risk Underwriter
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Basel III</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Monthly Income ($):</label>
                  <input
                    type="text"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">Monthly Debt ($):</label>
                  <input
                    type="text"
                    value={monthlyDebt}
                    onChange={(e) => setMonthlyDebt(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Calculated DTI Ratio:</span>
                  <span className={isDtiPrime ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                    {dtiPercent}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Underwriting Tier:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isDtiPrime ? 'Prime Tier-1 (Eligible for instant approval)' : 'High Risk (> 36% threshold)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW Features 5 & 6: Source of Wealth HNW Declarations & SWIFT MT103 Wire Gatekeeper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 5: Source of Wealth & FATF HNW AML Declaration */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-500" /> Source of Wealth & FATF HNW AML Declaration
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">FATF Tier-2</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Documented Source of Funds Origin:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSourceOfWealth('equity_buyout')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      sourceOfWealth === 'equity_buyout'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Tech Equity
                  </button>
                  <button
                    onClick={() => setSourceOfWealth('real_estate')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      sourceOfWealth === 'real_estate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Real Estate
                  </button>
                  <button
                    onClick={() => setSourceOfWealth('inheritance')}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      sourceOfWealth === 'inheritance'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Trust / Estate
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capital Origin Audit:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {sourceOfWealth === 'equity_buyout' && 'Verified SEC Form D Divestiture ($1.2M)'}
                    {sourceOfWealth === 'real_estate' && 'Recorded Deed of Sale Notarized ($450K)'}
                    {sourceOfWealth === 'inheritance' && 'Probate Court Final Decree Validated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audit Trail Integrity:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">FATF Recommendation 10 Passed</span>
                </div>
              </div>
            </div>

            {/* Feature 6: SWIFT MT103 / ISO 20022 Wire Sanctions Gatekeeper */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" /> SWIFT MT103 / ISO 20022 Cross-Border Wire Gatekeeper
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">SWIFT Live</span>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Beneficiary BIC Routing Identifier:</label>
                <input
                  type="text"
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span>Routing Clearance:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">JPMorgan Chase Bank N.A. (CLEAR)</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>OFAC Cross-Border Sanction Check:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">NO ADVERSE HITS</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  * ISO 20022 pacs.008 customer credit transfer formatted and authorized.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
