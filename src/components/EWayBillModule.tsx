import React from 'react';
import { SalesInvoice } from '../types/tax';
import { Truck, Download, ShieldCheck, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/gst';

interface EWayBillModuleProps {
  salesInvoices: SalesInvoice[];
}

export const EWayBillModule: React.FC<EWayBillModuleProps> = ({ salesInvoices }) => {
  const ewayInvoices = salesInvoices.filter((i) => i.ewayBillRequired);

  const downloadEwayJson = (inv: SalesInvoice) => {
    const payload = {
      version: '1.0.0421',
      billDetails: {
        userGstin: '24AAPCA1234F1ZV',
        supplyType: 'O',
        subSupplyType: '1',
        docType: 'INV',
        docNo: inv.invoiceNumber,
        docDate: inv.date.split('-').reverse().join('/'),
        fromGstin: '24AAPCA1234F1ZV',
        fromTrdName: 'Apex Electronics & Traders',
        fromAddr1: 'Sector 28 GIDC Complex',
        fromPlace: 'Ahmedabad',
        fromPincode: 380028,
        fromStateCode: 24,
        toGstin: inv.partyGstin,
        toTrdName: inv.partyName,
        toAddr1: 'Commercial Market',
        toPlace: inv.placeOfSupply,
        toPincode: 380001,
        toStateCode: Number(inv.partyStateCode),
        totalValue: inv.subtotal,
        cgstValue: inv.cgstTotal,
        sgstValue: inv.sgstTotal,
        igstValue: inv.igstTotal,
        totInvValue: inv.grandTotal,
        transMode: '1',
        transDistance: inv.distanceKm || 150,
        transporterName: inv.transporterName || 'VRL Logistics Ltd',
        transporterId: inv.transporterId || '24AAACV1234A1Z0',
        vehicleNo: inv.vehicleNumber || 'GJ-01-AB-9921',
        vehicleType: 'R',
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EWayBill_${inv.invoiceNumber.replace(/\//g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            E-Way Bill Compliance Hub (Part-A &amp; Part-B)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Required for goods movement over ₹50,000. Export JSON for official portal upload at ewaybillgst.gov.in.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Active E-Way Bills:</span>
          <span className="block text-xl font-extrabold text-amber-400">{ewayInvoices.length}</span>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 text-xs font-semibold text-slate-300">
          <span>Invoices Threshold Trigger (&gt; ₹50,000)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3">E-Way Bill #</th>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Destination / Receiver</th>
                <th className="p-3">Distance (Km)</th>
                <th className="p-3">Transporter / Vehicle</th>
                <th className="p-3">Invoice Value</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ewayInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {inv.ewayBillNumber || '141098273645'}
                  </td>
                  <td className="p-3 font-mono text-blue-400">{inv.invoiceNumber}</td>
                  <td className="p-3">
                    <div className="font-medium text-white">{inv.partyName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {inv.placeOfSupply}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{inv.distanceKm || 150} KM</td>
                  <td className="p-3">
                    <div className="text-slate-200 font-medium">{inv.transporterName || 'VRL Logistics Ltd'}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.vehicleNumber || 'GJ-01-AB-9921'}</div>
                  </td>
                  <td className="p-3 font-extrabold text-white">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => downloadEwayJson(inv)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Portal JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
