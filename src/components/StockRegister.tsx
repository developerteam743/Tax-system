import React, { useState } from 'react';
import type { StockItem } from '../types/tax';
import { formatCurrency } from '../utils/gst';
import { Package, AlertTriangle, Plus, X, CheckCircle2 } from 'lucide-react';

interface StockRegisterProps {
  stockItems: StockItem[];
  onAddStockItem?: (newItem: StockItem) => void;
}

export const StockRegister: React.FC<StockRegisterProps> = ({ stockItems, onAddStockItem }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [hsn, setHsn] = useState('');
  const [category, setCategory] = useState('Computer Peripherals');
  const [currentStock, setCurrentStock] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(1000);
  const [sellingPrice, setSellingPrice] = useState(1500);
  const [gstRate, setGstRate] = useState(18);

  const totalStockValue = stockItems.reduce((acc, st) => acc + st.currentStock * st.purchasePrice, 0);
  const lowStockCount = stockItems.filter((st) => st.currentStock <= st.minStockLevel).length;

  const handleSaveItem = () => {
    if (!name.trim()) return;

    const newItem: StockItem = {
      id: `st-${Date.now()}`,
      name,
      hsn: hsn || '84716060',
      category,
      unit: 'PCS',
      currentStock,
      minStockLevel: 5,
      purchasePrice,
      sellingPrice,
      gstRate,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (onAddStockItem) {
      onAddStockItem(newItem);
    }
    setShowAddModal(false);

    // Reset Form
    setName('');
    setHsn('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            Stock Register &amp; Inventory Master
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auto-inward from AI Purchase OCR &amp; Auto-outward from Sales Invoices. Live FIFO valuation.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Stock Valuation</span>
            <span className="text-lg font-black text-emerald-600">{formatCurrency(totalStockValue)}</span>
          </div>

          {lowStockCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-700 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> {lowStockCount} Low Stock
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md cursor-pointer hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New SKU Item
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Item Master Register ({stockItems.length} SKUs)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Buying Price (₹)</th>
                <th className="p-3">Selling Price (₹)</th>
                <th className="p-3">GST %</th>
                <th className="p-3 text-right">Stock Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockItems.map((st) => {
                const isLow = st.currentStock <= st.minStockLevel;
                const valuation = st.currentStock * st.purchasePrice;

                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {st.name}
                      {isLow && (
                        <span className="ml-2 text-[9px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-bold">
                          LOW STOCK
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{st.hsn}</td>
                    <td className="p-3 text-slate-600">{st.category}</td>
                    <td className={`p-3 font-black text-sm ${isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {st.currentStock} {st.unit}
                    </td>
                    <td className="p-3 text-slate-600">{formatCurrency(st.purchasePrice)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatCurrency(st.sellingPrice)}</td>
                    <td className="p-3 font-mono text-blue-600 font-bold">{st.gstRate}%</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatCurrency(valuation)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New SKU Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 text-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Add New Inventory Item (SKU)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / SKU Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Gaming Mouse RGB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    placeholder="84716060"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Computer Peripherals">Computer Peripherals</option>
                    <option value="Displays">Displays</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Audio">Audio</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Buying Rate (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-right focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-right focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GST Tax Rate %</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value={18}>18% GST (Standard)</option>
                  <option value={12}>12% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Save SKU to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
