import React, { useState } from 'react';
import type { StockItem } from '../types/tax';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface InventoryCommandCenterProps {
  stockItems: StockItem[];
  onAddStockItem?: (newItem: StockItem) => void;
}

export const InventoryCommandCenter: React.FC<InventoryCommandCenterProps> = ({
  stockItems,
  onAddStockItem,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'>('ALL');

  // Form State
  const [name, setName] = useState('');
  const [hsn, setHsn] = useState('84716060');
  const [category, setCategory] = useState('Computer Peripherals');
  const [unit, setUnit] = useState('PCS');
  const [currentStock, setCurrentStock] = useState(25);
  const [minStockLevel, setMinStockLevel] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(1200);
  const [sellingPrice, setSellingPrice] = useState(1950);
  const [gstRate, setGstRate] = useState(18);

  // Metrics
  const totalStockValue = stockItems.reduce((acc, st) => acc + st.currentStock * st.purchasePrice, 0);
  const totalProducts = stockItems.length;
  const lowStockItems = stockItems.filter((st) => st.currentStock > 0 && st.currentStock <= st.minStockLevel);
  const outOfStockItems = stockItems.filter((st) => st.currentStock <= 0);
  const fastMovingCount = Math.round(totalProducts * 0.4);

  const getStockStatus = (item: StockItem): 'Healthy' | 'Low' | 'Critical' | 'Out of Stock' => {
    if (item.currentStock <= 0) return 'Out of Stock';
    if (item.currentStock < item.minStockLevel / 2) return 'Critical';
    if (item.currentStock <= item.minStockLevel) return 'Low';
    return 'Healthy';
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onAddStockItem?.({
      id: `st-${Date.now()}`,
      name: name.trim(),
      hsn: hsn.trim() || '84716060',
      category,
      unit,
      currentStock,
      minStockLevel,
      purchasePrice,
      sellingPrice,
      gstRate,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Inventory Command Hub</span>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Stock Register &amp; Valuation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Inventory &amp; Warehouse Stock Master
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time automated inwarding from AI purchase bills and outward deduction from tax invoices
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stock SKU</span>
        </button>
      </div>

      {/* 2. INVENTORY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Stock Value</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(totalStockValue).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">At purchase cost</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Products</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            {totalProducts} SKUs
          </span>
          <span className="text-[10px] text-slate-500 block">Catalogued items</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Low Stock</span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {lowStockItems.length} SKUs
          </span>
          <span className="text-[10px] text-amber-600 block">Below reorder point</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Out of Stock</span>
          <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            {outOfStockItems.length} SKUs
          </span>
          <span className="text-[10px] text-rose-600 block">Zero warehouse units</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Fast Moving</span>
          <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
            {fastMovingCount} SKUs
          </span>
          <span className="text-[10px] text-purple-600 block">High turnover rate</span>
        </div>
      </div>

      {/* 3. PRODUCT TABLE */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU name, HSN, category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
            {(['ALL', 'HEALTHY', 'LOW'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-4">HSN Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-right">Buying Rate</th>
                <th className="py-3 px-4 text-right">Selling Rate</th>
                <th className="py-3 px-4 text-center">GST %</th>
                <th className="py-3 px-4 text-right">Stock Valuation (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {stockItems
                .filter((st) => {
                  const status = getStockStatus(st);
                  if (statusFilter === 'HEALTHY' && status !== 'Healthy') return false;
                  if (statusFilter === 'LOW' && (status !== 'Low' && status !== 'Critical')) return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      st.name.toLowerCase().includes(q) ||
                      st.hsn.toLowerCase().includes(q) ||
                      st.category.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((item) => {
                  const status = getStockStatus(item);
                  const valuation = item.currentStock * item.purchasePrice;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.hsn}</td>
                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-slate-100">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        ₹{item.purchasePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        ₹{item.sellingPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center text-blue-600 dark:text-blue-400">
                        {item.gstRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{valuation.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'Healthy'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : status === 'Low'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : status === 'Critical'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD SKU MODAL */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Register New Inventory SKU Item
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Item / SKU Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 27 Inch 4K IPS Monitor"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">HSN Code *</label>
                  <input
                    type="text"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    placeholder="84716060"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option>Computer Peripherals</option>
                    <option>Displays</option>
                    <option>Accessories</option>
                    <option>Audio</option>
                    <option>Industrial Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option>PCS</option>
                    <option>NOS</option>
                    <option>KGS</option>
                    <option>MTR</option>
                    <option>BOX</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Buying Rate (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">GST Rate %</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value={18}>18% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={5}>5% GST</option>
                    <option value={28}>28% GST</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Save SKU Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
