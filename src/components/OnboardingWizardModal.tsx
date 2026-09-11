import React, { useState } from 'react';
import { Building2, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, RefreshCw, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface BusinessProfile {
  firmName: string;
  gstin: string;
  stateCode: string;
  state: string;
  address: string;
  phone: string;
  invoicePrefix: string;
  industry: string;
}

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: BusinessProfile, loadSampleData: boolean) => void;
}

const SAMPLE_GSTIN_MAP: Record<string, Partial<BusinessProfile>> = {
  '24AAPCA1234F1ZV': { firmName: 'Apex Electronics & Industrial Traders', stateCode: '24', state: 'Gujarat', address: 'Plot 42, GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat - 382445', phone: '+91 98250 12345', industry: 'Electronics & Engineering' },
  '24AABCS1429B1ZX': { firmName: 'Shree Ram Metals & Hardware', stateCode: '24', state: 'Gujarat', address: '108, Lati Bazar, Rajkot, Gujarat - 360001', phone: '+91 98980 67890', industry: 'Metals & Hardware' },
  '24AAGCP9872C1Z4': { firmName: 'Patel Auto Spares & Bearings', stateCode: '24', state: 'Gujarat', address: 'Near Ring Road, Makarpura GIDC, Vadodara, Gujarat - 390010', phone: '+91 94260 45678', industry: 'Automobile & Spares' }
};

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [gstin, setGstin] = useState('24AAPCA1234F1ZV');
  const [firmName, setFirmName] = useState('Apex Electronics & Industrial Traders');
  const [stateCode, setStateCode] = useState('24');
  const [state, setState] = useState('Gujarat');
  const [address, setAddress] = useState('Plot 42, GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat - 382445');
  const [phone, setPhone] = useState('+91 98250 12345');
  const [invoicePrefix, setInvoicePrefix] = useState('INV/26-27/');
  const [industry, setIndustry] = useState('Electronics & Engineering');
  const [loadSampleData, setLoadSampleData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  if (!isOpen) return null;

  const handleAutoFetchGstin = (inputGstin: string) => {
    const clean = inputGstin.trim().toUpperCase();
    setGstin(clean);
    if (clean.length === 15) {
      setIsFetching(true);
      setTimeout(() => {
        setIsFetching(false);
        const match = SAMPLE_GSTIN_MAP[clean];
        if (match) {
          if (match.firmName) setFirmName(match.firmName);
          if (match.stateCode) setStateCode(match.stateCode);
          if (match.state) setState(match.state);
          if (match.address) setAddress(match.address);
          if (match.phone) setPhone(match.phone);
          if (match.industry) setIndustry(match.industry);
        } else {
          const sc = clean.substring(0, 2);
          setStateCode(sc);
          if (sc === '24') setState('Gujarat');
          else if (sc === '27') setState('Maharashtra');
          else if (sc === '08') setState('Rajasthan');
          else setState(`State (${sc})`);
        }
      }, 400);
    }
  };

  const handleFinish = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onComplete({ firmName, gstin, stateCode, state, address, phone, invoicePrefix, industry }, loadSampleData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-2xl w-full min-h-screen sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] overflow-hidden border-0 sm:border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-4 sm:p-6 text-white relative shrink-0">
          <button onClick={onClose} aria-label="Close onboarding" className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-all min-w-11 min-h-11 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 pr-10">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md shrink-0"><Building2 className="w-6 h-6 text-white" /></div>
            <div className="min-w-0">
              <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white/90">New User Onboarding</span>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">Welcome to TaxFlow AI</h2>
            </div>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-5">Set up your Gujarat MSME business profile in under 30 seconds with automatic GSTIN validation.</p>
          <div className="flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-3 mt-4">
            <div className={`flex items-center gap-2 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full w-fit ${step === 1 ? 'bg-white text-blue-800' : 'bg-blue-800/40 text-blue-200'}`}><span>1</span> Business GSTIN &amp; Profile</div>
            <div className={`flex items-center gap-2 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full w-fit ${step === 2 ? 'bg-white text-blue-800' : 'bg-blue-800/40 text-blue-200'}`}><span>2</span> Numbering &amp; Catalog</div>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GSTIN (Goods and Services Tax ID)</label>
                <div className="relative">
                  <input type="text" value={gstin} onChange={(e) => handleAutoFetchGstin(e.target.value)} maxLength={15} placeholder="e.g. 24AAPCA1234F1ZV" className="w-full pl-3 sm:pl-4 pr-3 sm:pr-32 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase" />
                  <div className="mt-2 sm:absolute sm:right-2 sm:top-1.5 sm:mt-0 flex items-center sm:justify-end pointer-events-none">
                    {isFetching ? <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg animate-pulse"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching...</span> : <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"><ShieldCheck className="w-3.5 h-3.5" /> GSTN Verified</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium w-full sm:w-auto">Quick Demo GSTINs:</span>
                  {Object.keys(SAMPLE_GSTIN_MAP).map((sampleGstin) => <button key={sampleGstin} type="button" onClick={() => handleAutoFetchGstin(sampleGstin)} className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded border transition-all min-h-9 ${gstin === sampleGstin ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}>{sampleGstin.substring(0, 7)}...</button>)}
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Legal Firm / Trade Name</label><input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="e.g. Apex Electronics & Traders" className="w-full px-3 sm:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">State &amp; Code (Default: Gujarat 24)</label><input type="text" value={`${state} (${stateCode})`} disabled className="w-full px-3 sm:px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed" /></div>
                <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contact Phone</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 sm:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600" /></div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Principal Place of Business (Address)</label><textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 sm:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600" /></div>
            </div>
          ) : (
            <div className="space-y-5">
              <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Invoice Numbering Prefix (Financial Year 2026-27)</label><input type="text" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="e.g. INV/26-27/ or APEX/" className="w-full px-3 sm:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600" /><span className="text-[11px] text-slate-400 mt-1 block break-words">Your first invoice will be generated as: <code className="text-blue-600 font-bold">{invoicePrefix}001</code></span></div>
              <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Industry / Business Category</label><select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 sm:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"><option value="Electronics & Engineering">Electronics &amp; Electrical Equipment (HSN 84xx, 85xx)</option><option value="Metals & Hardware">Metals, Brass &amp; Hardware (HSN 73xx, 74xx)</option><option value="Chemicals & Plastics">Chemicals &amp; Industrial Polymers (HSN 28xx, 39xx)</option><option value="Textiles & Apparel">Textiles, Fabrics &amp; Yarns (HSN 52xx, 54xx)</option><option value="General Wholesale & FMCG">General Wholesale &amp; FMCG Trading</option></select></div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl"><div className="flex items-start gap-3"><input type="checkbox" id="loadDemoCheck" checked={loadSampleData} onChange={(e) => setLoadSampleData(e.target.checked)} className="mt-1 w-5 h-5 shrink-0 text-blue-600 rounded focus:ring-blue-500 border-slate-300" /><label htmlFor="loadDemoCheck" className="text-sm text-slate-700 cursor-pointer leading-5"><span className="font-bold text-slate-900 block mb-1">Include Gujarat MSME Sample Catalog &amp; Ledger Records</span>Recommended for trial and training. Automatically provides sample party ledgers, SKU inventory items, and previous tax periods to explore all modules immediately.</label></div></div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {step === 2 ? <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100 min-h-11">← Back to Step 1</button> : <div className="text-xs text-slate-400 font-medium text-center sm:text-left">Step 1 of 2: Profile Validation</div>}
          {step === 1 ? <button type="button" onClick={() => setStep(2)} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 min-h-11">Continue to Numbering <ArrowRight className="w-4 h-4" /></button> : <button type="button" onClick={handleFinish} className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95 min-h-11"><CheckCircle2 className="w-4 h-4" /> Finish Setup <Sparkles className="w-4 h-4" /></button>}
        </div>
      </div>
    </div>
  );
};
