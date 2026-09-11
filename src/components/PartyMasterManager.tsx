import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { Party, PartyType } from '../types/tax';

interface PartyMasterManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = Omit<Party, 'id' | 'currentBalance'>;

const emptyForm: FormState = {
  name: '',
  gstin: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'Gujarat',
  stateCode: '24',
  type: 'CUSTOMER',
  openingBalance: 0,
};

const readParties = (): Party[] => {
  try {
    const raw = localStorage.getItem('taxflow_parties');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const PartyMasterManager: React.FC<PartyMasterManagerProps> = ({ isOpen, onClose }) => {
  const [parties, setParties] = useState<Party[]>(readParties);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | PartyType>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parties.filter((party) => {
      const matchesType = typeFilter === 'ALL' || party.type === typeFilter;
      const matchesQuery = !q || [party.name, party.gstin, party.phone, party.city, party.state].some((value) => value.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [parties, query, typeFilter]);

  if (!isOpen) return null;

  const persist = (next: Party[]) => {
    setParties(next);
    localStorage.setItem('taxflow_parties', JSON.stringify(next));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (party: Party) => {
    setEditingId(party.id);
    setForm({
      name: party.name,
      gstin: party.gstin,
      phone: party.phone,
      email: party.email,
      address: party.address,
      city: party.city,
      state: party.state,
      stateCode: party.stateCode,
      type: party.type,
      openingBalance: party.openingBalance,
    });
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    if (editingId) {
      persist(parties.map((party) => party.id === editingId ? { ...party, ...form, name } : party));
    } else {
      const party: Party = {
        ...form,
        id: `party-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        gstin: form.gstin.trim().toUpperCase(),
        currentBalance: Number(form.openingBalance) || 0,
      };
      persist([party, ...parties]);
    }
    setEditingId(null);
    setForm(emptyForm);
    window.location.reload();
  };

  const remove = (party: Party) => {
    if (!window.confirm(`Delete ${party.name} from Customer & Vendor Master?`)) return;
    persist(parties.filter((item) => item.id !== party.id));
    window.location.reload();
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-2 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto">
      <div className="w-full max-w-6xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Customer & Vendor Master</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Create, edit and delete customer/vendor records</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-5 overflow-y-auto min-h-0">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, GSTIN, phone, city..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'ALL' | PartyType)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white">
              <option value="ALL">All parties</option>
              <option value="CUSTOMER">Customers</option>
              <option value="VENDOR">Vendors</option>
              <option value="BOTH">Customer + Vendor</option>
            </select>
            <button type="button" onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Party
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3"><div className="text-[10px] uppercase font-bold text-blue-600">Customers</div><div className="text-lg font-bold">{parties.filter((p) => p.type === 'CUSTOMER' || p.type === 'BOTH').length}</div></div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3"><div className="text-[10px] uppercase font-bold text-amber-600">Vendors</div><div className="text-lg font-bold">{parties.filter((p) => p.type === 'VENDOR' || p.type === 'BOTH').length}</div></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Total</div><div className="text-lg font-bold">{parties.length}</div></div>
          </div>

          {editingId === null && form.name === '' ? null : (
            <form onSubmit={save} className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/40 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-sm text-slate-900">{editingId ? 'Edit Party' : 'New Party'}</h3><button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-xs font-semibold text-slate-500">Clear</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Party name *" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} placeholder="GSTIN" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase" />
                <select value={form.type} onChange={(e) => setField('type', e.target.value as PartyType)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="CUSTOMER">Customer</option><option value="VENDOR">Vendor</option><option value="BOTH">Customer + Vendor</option></select>
                <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="Phone" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Address" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:col-span-2" />
                <input value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="City" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="State" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input value={form.stateCode} onChange={(e) => setField('stateCode', e.target.value)} placeholder="State code" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="number" step="0.01" value={form.openingBalance} onChange={(e) => setField('openingBalance', Number(e.target.value))} placeholder="Opening balance" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <div className="sm:col-span-2 lg:col-span-2 flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold">{editingId ? 'Update Party' : 'Create Party'}</button>
                  <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button>
                </div>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Party</th><th className="p-3">GSTIN</th><th className="p-3">Type</th><th className="p-3">Location</th><th className="p-3 text-right">Balance</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((party) => (
                  <tr key={party.id} className="hover:bg-slate-50">
                    <td className="p-3"><div className="font-bold text-slate-800">{party.name}</div><div className="text-[10px] text-slate-500">{party.phone || party.email || 'No contact'}</div></td>
                    <td className="p-3 font-mono text-slate-500">{party.gstin || 'UNREGISTERED'}</td>
                    <td className="p-3 font-bold">{party.type}</td>
                    <td className="p-3 text-slate-600">{party.city || '-'}, {party.state || '-'} ({party.stateCode || '-'})</td>
                    <td className="p-3 text-right font-mono font-bold">₹{Number(party.currentBalance || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => startEdit(party)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 px-2.5 py-2 font-bold"><Pencil className="w-3.5 h-3.5" /> Edit</button><button type="button" onClick={() => remove(party)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-700 px-2.5 py-2 font-bold"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No parties match the current filter.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
