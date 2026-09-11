import React from 'react';
import { SalesInvoice } from '../types/tax';
import { Truck, Download, ShieldCheck, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/gst';

interface EWayBillModuleProps { salesInvoices: SalesInvoice[]; }

export const EWayBillModule: React.FC<EWayBillModuleProps> = ({ salesInvoices }) => {
  const ewayInvoices = salesInvoices.filter((i) => i.ewayBillRequired);

  const downloadEwayJson = (inv: SalesInvoice) => {
    const payload = {
      version: '1.0.0421', billDetails: {
        userGstin: '24AAPCA1234F1ZV', supplyType: 'O', subSupplyType: '1', docType: 'INV', docNo: inv.invoiceNumber,
        docDate: inv.date.split('-').reverse().join('/'), fromGstin: '24AAPCA1234F1ZV', fromTrdName: 'Apex Electronics & Traders',
        fromAddr1: 'Sector 28 GIDC Complex', fromPlace: 'Ahmedabad', fromPincode: 380028, fromStateCode: 24,
        toGstin: inv.partyGstin, toTrdName: inv.partyName, toAddr1: 'Commercial Market', toPlace: inv.placeOfSupply,
        toPincode: 380001, toStateCode: Number(inv.partyStateCode), totalValue: inv.subtotal, cgstValue: inv.cgstTotal,
        sgstValue: inv.sgstTotal, igstValue: inv.igstTotal, totInvValue: inv.grandTotal, transMode: '1',
        transDistance: inv.distanceKm || 150, transporterName: inv.transporterName || 'VRL Logistics Ltd',
        transporterId: inv.transporterId || '24AAACV1234A1Z0', vehicleNo: inv.vehicleNumber || 'GJ-01-AB-9921', vehicleType: 'R'
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
    a.download = `EWayBill_${inv.invoiceNumber.replace(/\//g, '_')}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-6 animate-fadeIn">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div className="min-w-0"><h2 className="text-lg sm:text-xl font-bold text-white flex items-start gap-2"><Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" /> <span>E-Way Bill Compliance Hub</span></h2><p className="text-xs text-slate-400 mt-1">Required for goods movement over ₹50,000. Export JSON for portal upload.</p></div>
      <div className="text-left lg:text-right bg-white/5 rounded-xl px-3 py-2"><span className="text-[10px] text-slate-400">Active E-Way Bills</span><span className="block text-xl font-extrabold text-amber-400">{ewayInvoices.length}</span></div>
    </div>

    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800"><span className="text-xs font-semibold text-slate-300">Invoices over ₹50,000</span><p className="text-[10px] text-slate-500 mt-1">Swipe horizontally only when you need the full desktop-style register.</p></div>
      <div className="hidden md:block overflow-x-auto"><table className="w-full text-left text-xs text-slate-300"><thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold"><tr><th className="p-3">E-Way Bill #</th><th className="p-3">Invoice Number</th><th className="p-3">Destination / Receiver</th><th className="p-3">Distance</th><th className="p-3">Transporter / Vehicle</th><th className="p-3">Invoice Value</th><th className="p-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/60">{ewayInvoices.map((inv) => <tr key={inv.id}><td className="p-3 font-mono font-bold text-amber-400">{inv.ewayBillNumber || '141098273645'}</td><td className="p-3 font-mono text-blue-400">{inv.invoiceNumber}</td><td className="p-3"><div className="font-medium text-white">{inv.partyName}</div><div className="text-[10px] text-slate-400">{inv.placeOfSupply}</div></td><td className="p-3">{inv.distanceKm || 150} KM</td><td className="p-3"><div>{inv.transporterName || 'VRL Logistics Ltd'}</div><div className="text-[10px] font-mono text-slate-400">{inv.vehicleNumber || 'GJ-01-AB-9921'}</div></td><td className="p-3 font-extrabold text-white">{formatCurrency(inv.grandTotal)}</td><td className="p-3 text-right"><button onClick={() => downloadEwayJson(inv)} className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 ml-auto min-h-10"><Download className="w-3.5 h-3.5" /> Download JSON</button></td></tr>)}</tbody></table></div>
      <div className="md:hidden divide-y divide-slate-800">{ewayInvoices.map((inv) => <article key={inv.id} className="p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold"><ShieldCheck className="w-4 h-4 shrink-0" /> <span className="font-mono break-all">{inv.ewayBillNumber || '141098273645'}</span></div><div className="text-[11px] text-blue-400 font-mono mt-1 break-all">Invoice {inv.invoiceNumber}</div></div><span className="shrink-0 text-sm font-black text-white">{formatCurrency(inv.grandTotal)}</span></div><div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-800/70 p-3"><span className="text-[10px] text-slate-500 block uppercase">Receiver</span><span className="font-semibold text-white break-words">{inv.partyName}</span></div><div className="rounded-xl bg-slate-800/70 p-3"><span className="text-[10px] text-slate-500 block uppercase">Distance</span><span className="font-semibold text-slate-200">{inv.distanceKm || 150} KM</span></div><div className="rounded-xl bg-slate-800/70 p-3 col-span-2"><span className="text-[10px] text-slate-500 block uppercase">Destination</span><span className="flex items-center gap-1 text-slate-200 break-words"><MapPin className="w-3 h-3 shrink-0" />{inv.placeOfSupply}</span></div><div className="rounded-xl bg-slate-800/70 p-3 col-span-2"><span className="text-[10px] text-slate-500 block uppercase">Transport</span><span className="font-semibold text-slate-200 break-words">{inv.transporterName || 'VRL Logistics Ltd'} · {inv.vehicleNumber || 'GJ-01-AB-9921'}</span></div></div><button onClick={() => downloadEwayJson(inv)} className="w-full min-h-11 px-3 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5"><Download className="w-4 h-4" /> Download Portal JSON</button></article>)}</div>
    </div>
  </div>;
};