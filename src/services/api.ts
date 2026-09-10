import type { Party, SalesInvoice, PurchaseInvoice, StockItem } from '../types/tax';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000/api';
async function apiJson<T>(path: string, options?: RequestInit): Promise<T> { const res = await fetch(`${API_BASE_URL}${path}`, options); if (!res.ok) throw new Error(`API request failed (${res.status})`); return res.json() as Promise<T>; }
export async function fetchPartiesFromApi(): Promise<Party[]> { return apiJson<Party[]>('/parties'); }
export async function fetchStockFromApi(): Promise<StockItem[]> { return apiJson<StockItem[]>('/stock'); }
export async function fetchSalesInvoicesFromApi(): Promise<SalesInvoice[]> { return apiJson<SalesInvoice[]>('/salesinvoices'); }
export async function fetchPurchaseInvoicesFromApi(): Promise<PurchaseInvoice[]> { return apiJson<PurchaseInvoice[]>('/purchaseinvoices'); }
export async function createSalesInvoiceApi(invoice: SalesInvoice): Promise<SalesInvoice> { return apiJson<SalesInvoice>('/salesinvoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoice) }); }
export async function postPurchaseToLedgerApi(id: string): Promise<boolean> { const res = await fetch(`${API_BASE_URL}/purchaseinvoices/${id}/post`, { method: 'POST' }); return res.ok; }

export interface TallyConnectionResult { connected: boolean; message: string; companyName?: string; rawResponse?: string; }
export interface TallySyncResult { success: boolean; message: string; requested: number; imported: number; rawResponse?: string; }
export interface TallyMasterMatch { taxFlowName: string; tallyName: string; matchType: string; score: number; gstin?: string; }
export interface TallyMastersPreview { ledgers: unknown[]; stockItems: unknown[]; partyMatches: TallyMasterMatch[]; stockMatches: TallyMasterMatch[]; rawResponse: string; }
export interface TallyReconciliationRow { key: string; status: 'Matched' | 'AmountMismatch' | 'MissingInTaxFlow' | 'MissingInTally'; taxFlowNumber?: string; tallyNumber?: string; taxFlowAmount?: number; tallyAmount?: number; difference?: number; partyName?: string; voucherType: string; date?: string; }
export interface TallyReconciliationPreview { matched: number; amountMismatch: number; missingInTaxFlow: number; missingInTally: number; rows: TallyReconciliationRow[]; rawResponse: string; }
const postTally = <T>(path: string, body: unknown) => apiJson<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export function testTallyConnection(baseUrl: string, companyName?: string): Promise<TallyConnectionResult> { return postTally('/tally/test-connection', { baseUrl, companyName: companyName || null }); }
export function fetchTallyCompanies(baseUrl: string): Promise<TallyConnectionResult> { return postTally('/tally/companies', { baseUrl }); }
export function syncTally(baseUrl: string, companyName: string, data: 'all' | 'masters' | 'sales' | 'purchases'): Promise<{ success: boolean; results: TallySyncResult[] }> { return postTally('/tally/sync', { baseUrl, companyName, direction: 'push', data }); }
export function pullTallyDaybook(baseUrl: string, companyName: string, from: string, to: string): Promise<{ result: TallyConnectionResult; from: string; to: string; note: string }> { return postTally('/tally/pull', { baseUrl, companyName, from, to }); }
export function previewTallyMasters(baseUrl: string, companyName: string): Promise<TallyMastersPreview> { return postTally('/tally/masters-preview', { baseUrl, companyName }); }
export function reconcileTally(baseUrl: string, companyName: string, from: string, to: string): Promise<TallyReconciliationPreview> { return postTally('/tally/reconcile', { baseUrl, companyName, from, to }); }
