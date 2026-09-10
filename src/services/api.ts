import type { Party, SalesInvoice, PurchaseInvoice, StockItem } from '../types/tax';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000/api';

async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function fetchPartiesFromApi(): Promise<Party[]> {
  try { return await apiJson<Party[]>('/parties'); }
  catch (err) { console.warn('Backend API offline or CORS, using fallback data:', err); throw err; }
}

export async function fetchStockFromApi(): Promise<StockItem[]> {
  try { return await apiJson<StockItem[]>('/stock'); }
  catch (err) { console.warn('Backend API offline, using fallback stock:', err); throw err; }
}

export async function fetchSalesInvoicesFromApi(): Promise<SalesInvoice[]> {
  try { return await apiJson<SalesInvoice[]>('/salesinvoices'); }
  catch (err) { console.warn('Backend API offline, using fallback sales:', err); throw err; }
}

export async function fetchPurchaseInvoicesFromApi(): Promise<PurchaseInvoice[]> {
  try { return await apiJson<PurchaseInvoice[]>('/purchaseinvoices'); }
  catch (err) { console.warn('Backend API offline, using fallback purchases:', err); throw err; }
}

export async function createSalesInvoiceApi(invoice: SalesInvoice): Promise<SalesInvoice> {
  try {
    return await apiJson<SalesInvoice>('/salesinvoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
  } catch (err) {
    console.warn('Backend write failed, saving locally in React state:', err);
    return invoice;
  }
}

export async function postPurchaseToLedgerApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/purchaseinvoices/${id}/post`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.warn('Backend post purchase failed:', err);
    return false;
  }
}

export interface TallyConnectionResult {
  connected: boolean;
  message: string;
  companyName?: string;
  rawResponse?: string;
}

export interface TallySyncResult {
  success: boolean;
  message: string;
  requested: number;
  imported: number;
  rawResponse?: string;
}

export async function testTallyConnection(baseUrl: string, companyName?: string): Promise<TallyConnectionResult> {
  return apiJson<TallyConnectionResult>('/tally/test-connection', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, companyName: companyName || null }),
  });
}

export async function fetchTallyCompanies(baseUrl: string): Promise<TallyConnectionResult> {
  return apiJson<TallyConnectionResult>('/tally/companies', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl }),
  });
}

export async function syncTally(baseUrl: string, companyName: string, data: 'all' | 'masters' | 'sales' | 'purchases'): Promise<{ success: boolean; results: TallySyncResult[] }> {
  return apiJson('/tally/sync', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, companyName, direction: 'push', data }),
  });
}

export async function pullTallyDaybook(baseUrl: string, companyName: string, from: string, to: string): Promise<{ result: TallyConnectionResult; from: string; to: string; note: string }> {
  return apiJson('/tally/pull', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, companyName, from, to }),
  });
}
