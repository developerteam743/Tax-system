import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AIAssistantModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: 'user' | 'assistant';
      text: string;
      time: string;
      chips?: string[];
    }>
  >([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Good day! I am TaxFlow AI, your expert Indian GST, MSME & TallyPrime statutory compliance co-pilot. You can query HSN codes, reverse charge obligations, Section 43B(h) creditor deadlines, or GSTR-1 Table classifications.',
      time: 'Just now',
      chips: [
        'Check Section 43B(h) rules',
        'Find HSN code for LED Monitors',
        'Is GTA freight liable to RCM?',
        'When is E-Way bill required in Gujarat?',
      ],
    },
  ]);

  const handleAsk = (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    let reply = '';
    const lq = q.toLowerCase();

    if (lq.includes('43b') || lq.includes('msme')) {
      reply =
        'Section 43B(h) of the Income Tax Act mandates that payments to Micro and Small enterprises registered under Udyam must be cleared within 15 days (without written agreement) or within a maximum of 45 days (if written agreement exists). If unpaid by the end of the financial year, the entire expense is disallowed and added to taxable net profit.';
    } else if (lq.includes('hsn') || lq.includes('monitor') || lq.includes('computer')) {
      reply =
        'For Computer Monitors (up to 32 inches and beyond), the standard HSN is 85285200 (Computer monitors capable of directly connecting to and designed for use with an automatic data processing machine). GST rate is 18% (9% CGST + 9% SGST intra-state, or 18% IGST inter-state). For businesses with turnover > ₹5 Crores, a minimum 6-digit HSN is statutory.';
    } else if (lq.includes('gta') || lq.includes('rcm') || lq.includes('freight')) {
      reply =
        'Yes, Goods Transport Agency (GTA) services fall under Reverse Charge Mechanism (RCM) under Notification 13/2017-CT(Rate) at 5% GST (2.5% CGST + 2.5% SGST) payable by the recipient on reverse charge basis, provided the GTA has not opted for forward charge under 12% with ITC.';
    } else if (lq.includes('eway') || lq.includes('e-way') || lq.includes('gujarat')) {
      reply =
        'In Gujarat, an E-Way Bill (Form GST EWB-01) is mandatory for intra-state movement when the consignment value exceeds ₹50,000. For specific taxable goods like yarn or electronics, check state circulars. For inter-state supplies across state borders, the threshold is strictly ₹50,000.';
    } else {
      reply = `Regarding "${q}": Under the Central Goods & Services Tax (CGST) Act, ensure all tax invoices contain mandatory particulars: 15-digit GSTIN, serial invoice number, recipient state code, and tax bifurcation between CGST, SGST and IGST. All input tax credit must be backed by appearance in GSTR-2B.`;
    }

    const assistantMsg = {
      id: `a-${Date.now()}`,
      sender: 'assistant' as const,
      text: reply,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setQuery('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Intelligent Copilot</span>
            <span>·</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Gemini Flash AI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            TaxFlow AI GST &amp; Accounting Assistant
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consult on statutory GST acts, HSN/SAC codes, reverse charge triggers and Section 43B(h) compliance
          </p>
        </div>
      </div>

      {/* 2. CHAT / ASSISTANT WORKSPACE */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* MESSAGE LOGS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? 'CA' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl space-y-2 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70">
                  <span className="font-semibold">{m.sender === 'user' ? 'You' : 'TaxFlow AI'}</span>
                  <span>{m.time}</span>
                </div>
                <p>{m.text}</p>

                {m.chips && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAsk(chip)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-purple-700 dark:text-purple-300 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BOX */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about GSTIN rules, Section 43B(h), HSN codes, or reverse charge..."
            className="flex-1 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleAsk()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Consult AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
