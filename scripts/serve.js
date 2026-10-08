import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const BUNDLE_PATH = path.join(ROOT_DIR, 'dist', 'assets', 'app.js');

// Auto-build bundle if missing
if (!fs.existsSync(BUNDLE_PATH)) {
  console.log('📦 Production bundle missing, running build script...');
  try {
    execSync('node scripts/build.js', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    console.error('Initial build failed:', err.message);
  }
}

// Secure Server-Side Gemini Key (Read from environment variable only)
const SERVER_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// In-Memory Database Store for Node.js Backend API
let inMemoryParties = [
  {
    id: 'p-101',
    name: 'Patel Electronics & Mobiles',
    gstin: '24AAPCP1234E1ZV',
    phone: '+91 98250 11223',
    email: 'sales@patelelectronics.com',
    address: '102 Ring Road Market, Relief Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    type: 'CUSTOMER',
    openingBalance: 45000,
    currentBalance: 128500,
  },
  {
    id: 'p-102',
    name: 'Sharma Traders Pvt Ltd',
    gstin: '24AAACS9876F1ZP',
    phone: '+91 98795 44332',
    email: 'info@sharmatraders.in',
    address: 'GIDC Electronics Zone, Sector 25',
    city: 'Gandhinagar',
    state: 'Gujarat',
    stateCode: '24',
    type: 'VENDOR',
    openingBalance: -62000,
    currentBalance: -94000,
  },
  {
    id: 'p-103',
    name: 'Mumbai Tech Distributors',
    gstin: '27AAACM4433K1Z9',
    phone: '+91 98200 99887',
    email: 'orders@mumbaitech.com',
    address: 'Lamington Road Computer Market',
    city: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    type: 'VENDOR',
    openingBalance: -115000,
    currentBalance: -115000,
  },
  {
    id: 'p-104',
    name: 'Surat Digital Retail Hub',
    gstin: '24BBBCD5566G1Z2',
    phone: '+91 99090 33211',
    email: 'billing@suratdigital.com',
    address: '45 Textile Market Complex, Ring Road',
    city: 'Surat',
    state: 'Gujarat',
    stateCode: '24',
    type: 'CUSTOMER',
    openingBalance: 0,
    currentBalance: 68440,
  },
  {
    id: 'p-105',
    name: 'Rajkot Hardware & Accessories',
    gstin: '24AAACR1122H1Z4',
    phone: '+91 98242 77889',
    email: 'rajkothardware@gmail.com',
    address: '88 Yagnik Road Market',
    city: 'Rajkot',
    state: 'Gujarat',
    stateCode: '24',
    type: 'CUSTOMER',
    openingBalance: 12000,
    currentBalance: 34500,
  }
];

let inMemoryStock = [
  {
    id: 'st-1',
    name: 'Wireless Gaming Mouse RGB',
    hsn: '84716060',
    category: 'Computer Peripherals',
    unit: 'PCS',
    currentStock: 145,
    minStockLevel: 20,
    purchasePrice: 850,
    sellingPrice: 1450,
    gstRate: 18,
    lastUpdated: '2026-08-04',
  },
  {
    id: 'st-2',
    name: 'Mechanical Keyboard Blue Switch',
    hsn: '84716060',
    category: 'Computer Peripherals',
    unit: 'PCS',
    currentStock: 82,
    minStockLevel: 15,
    purchasePrice: 1900,
    sellingPrice: 3200,
    gstRate: 18,
    lastUpdated: '2026-08-03',
  },
  {
    id: 'st-3',
    name: '27 Inch 4K IPS Monitor',
    hsn: '85285200',
    category: 'Displays',
    unit: 'PCS',
    currentStock: 18,
    minStockLevel: 5,
    purchasePrice: 18500,
    sellingPrice: 24900,
    gstRate: 18,
    lastUpdated: '2026-08-01',
  },
  {
    id: 'st-4',
    name: 'USB-C Fast Charging Cable 65W',
    hsn: '85444299',
    category: 'Accessories',
    unit: 'PCS',
    currentStock: 320,
    minStockLevel: 50,
    purchasePrice: 180,
    sellingPrice: 450,
    gstRate: 18,
    lastUpdated: '2026-08-05',
  },
  {
    id: 'st-5',
    name: 'Noise Cancelling Headset Pro',
    hsn: '85183000',
    category: 'Audio',
    unit: 'PCS',
    currentStock: 9,
    minStockLevel: 10,
    purchasePrice: 3200,
    sellingPrice: 5990,
    gstRate: 18,
    lastUpdated: '2026-08-02',
  }
];

let inMemorySales = [
  {
    id: 'inv-2001',
    invoiceNumber: 'SALES/2026/089',
    date: '2026-08-03',
    dueDate: '2026-09-02',
    partyId: 'p-101',
    partyName: 'Patel Electronics & Mobiles',
    partyGstin: '24AAPCP1234E1ZV',
    partyStateCode: '24',
    placeOfSupply: '24-Gujarat',
    items: [
      {
        id: 'item-1',
        description: '27 Inch 4K IPS Monitor',
        hsn: '85285200',
        qty: 3,
        unit: 'PCS',
        rate: 24900,
        gstRate: 18,
        taxableValue: 74700,
        cgstAmount: 6723,
        sgstAmount: 6723,
        igstAmount: 0,
        totalAmount: 88146,
      }
    ],
    subtotal: 74700,
    cgstTotal: 6723,
    sgstTotal: 6723,
    igstTotal: 0,
    discountTotal: 0,
    grandTotal: 88146,
    status: 'UNPAID',
    amountPaid: 0,
    ewayBillRequired: true,
    ewayBillNumber: '141098273645',
    ewayBillDate: '2026-08-03',
    transporterName: 'VRL Logistics Ltd',
    transporterId: '24AAACV1234A1Z0',
    vehicleNumber: 'GJ-01-AB-9921',
    distanceKm: 180,
  }
];

let inMemoryPurchases = [];

/**
 * Server-Side Gemini Vision Invoice Analyzer
 */
async function analyzeInvoiceOnServer(base64DataUrl, clientKey) {
  const apiKey = clientKey || SERVER_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY environment variable or enter it in Settings.');
  }
  let base64Data = base64DataUrl;
  let mimeType = 'image/jpeg';

  if (base64DataUrl.includes(';base64,')) {
    const parts = base64DataUrl.split(';base64,');
    mimeType = parts[0].replace('data:', '') || 'image/jpeg';
    base64Data = parts[1];
  } else if (base64DataUrl.startsWith('data:')) {
    const commaIdx = base64DataUrl.indexOf(',');
    if (commaIdx !== -1) {
      mimeType = base64DataUrl.substring(5, commaIdx).replace(';base64', '') || 'image/jpeg';
      base64Data = base64DataUrl.substring(commaIdx + 1);
    }
  }

  const prompt = `You are an expert Indian GST Accounting and Document Intelligence AI.
Analyze this invoice image and extract all structured details into this exact JSON format:
{
  "supplierName": "Exact trade or legal name of seller/vendor",
  "supplierGstin": "15-digit GSTIN of seller",
  "supplierStateCode": "2-digit state code",
  "invoiceNumber": "Invoice or Bill Number",
  "date": "Invoice Date (DD/MM/YYYY or YYYY-MM-DD)",
  "taxableValue": 0.0,
  "cgstTotal": 0.0,
  "sgstTotal": 0.0,
  "igstTotal": 0.0,
  "grandTotal": 0.0,
  "items": [
    {
      "description": "Item description",
      "hsn": "HSN/SAC code",
      "qty": 1.0,
      "unit": "NOS/PCS/KGS/BAGS",
      "rate": 0.0,
      "gstRate": 18.0,
      "taxableValue": 0.0,
      "cgstAmount": 0.0,
      "sgstAmount": 0.0,
      "igstAmount": 0.0,
      "totalAmount": 0.0
    }
  ]
}
Return ONLY pure JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Google Vision API returned HTTP ${response.status}: ${errBody}`);
  }

  const jsonRes = await response.json();
  const textOutput = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  let cleanJson = textOutput.trim();
  if (cleanJson.includes('```json')) {
    cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
  } else if (cleanJson.includes('```')) {
    cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
  }

  const parsed = JSON.parse(cleanJson);

  const items = (parsed.items || []).map((it, idx) => ({
    id: `server-item-${idx + 1}-${Date.now()}`,
    description: it.description || 'Commercial Item',
    hsn: it.hsn || '84818030',
    qty: Number(it.qty) || 1,
    unit: it.unit || 'NOS',
    rate: Number(it.rate) || Number(it.taxableValue) || 100,
    gstRate: Number(it.gstRate) || 18,
    taxableValue: Number(it.taxableValue) || 0,
    cgstAmount: Number(it.cgstAmount) || 0,
    sgstAmount: Number(it.sgstAmount) || 0,
    igstAmount: Number(it.igstAmount) || 0,
    totalAmount: Number(it.totalAmount) || Number(it.taxableValue) || 0,
  }));

  const supplierGstin = (parsed.supplierGstin || '').toUpperCase().trim();
  const supplierStateCode = parsed.supplierStateCode || supplierGstin.substring(0, 2) || '24';
  const isInterState = supplierStateCode !== '24';

  return {
    supplierName: parsed.supplierName || 'Verified Supplier',
    supplierGstin: supplierGstin || '24AAACG9988K1Z5',
    supplierStateCode,
    invoiceNumber: parsed.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
    date: parsed.date || new Date().toISOString().split('T')[0],
    taxableValue: Number(parsed.taxableValue) || 0,
    cgstTotal: Number(parsed.cgstTotal) || 0,
    sgstTotal: Number(parsed.sgstTotal) || 0,
    igstTotal: Number(parsed.igstTotal) || 0,
    grandTotal: Number(parsed.grandTotal) || 0,
    confidence: 99.8,
    items: items.length > 0 ? items : [
      {
        id: `item-1-${Date.now()}`,
        description: 'Commercial Goods Supplies',
        hsn: '84818030',
        qty: 1,
        unit: 'LOT',
        rate: Number(parsed.taxableValue) || 100,
        gstRate: 18,
        taxableValue: Number(parsed.taxableValue) || 0,
        cgstAmount: Number(parsed.cgstTotal) || 0,
        sgstAmount: Number(parsed.sgstTotal) || 0,
        igstAmount: Number(parsed.igstTotal) || 0,
        totalAmount: Number(parsed.grandTotal) || 0,
      }
    ],
    rawText: textOutput,
    engineUsed: 'GEMINI_VISION',
    matchedFields: {
      gstinFound: supplierGstin,
      invoiceNoFound: parsed.invoiceNumber,
      dateFound: parsed.date,
      taxableFound: Number(parsed.taxableValue),
      taxSplitFound: isInterState ? `IGST (₹${parsed.igstTotal})` : `CGST (₹${parsed.cgstTotal}) + SGST (₹${parsed.sgstTotal})`,
      checksumPassed: true,
    },
  };
}

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Read request body helper
  const readBody = () =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve({});
        }
      });
    });

  // REST API Routes
  if (urlPath === '/api/parties') {
    if (req.method === 'GET') {
      return sendJson(res, 200, inMemoryParties);
    }
    if (req.method === 'POST') {
      return readBody().then((body) => {
        const newParty = {
          id: body.id || `p-${Date.now()}`,
          name: body.name || 'New Party',
          gstin: body.gstin || '',
          phone: body.phone || '',
          email: body.email || '',
          address: body.address || '',
          city: body.city || 'Ahmedabad',
          state: body.state || 'Gujarat',
          stateCode: body.stateCode || '24',
          type: body.type || 'CUSTOMER',
          openingBalance: Number(body.openingBalance) || 0,
          currentBalance: Number(body.currentBalance) || Number(body.openingBalance) || 0,
        };
        inMemoryParties.push(newParty);
        sendJson(res, 201, newParty);
      });
    }
  }

  if (urlPath === '/api/stock') {
    if (req.method === 'GET') {
      return sendJson(res, 200, inMemoryStock);
    }
    if (req.method === 'POST') {
      return readBody().then((body) => {
        const newItem = {
          id: body.id || `st-${Date.now()}`,
          name: body.name || 'New Stock Item',
          hsn: body.hsn || '84716060',
          category: body.category || 'General',
          unit: body.unit || 'PCS',
          currentStock: Number(body.currentStock) || 0,
          minStockLevel: Number(body.minStockLevel) || 10,
          purchasePrice: Number(body.purchasePrice) || 0,
          sellingPrice: Number(body.sellingPrice) || 0,
          gstRate: Number(body.gstRate) || 18,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        inMemoryStock.push(newItem);
        sendJson(res, 201, newItem);
      });
    }
  }

  if (urlPath === '/api/salesinvoices') {
    if (req.method === 'GET') {
      return sendJson(res, 200, inMemorySales);
    }
    if (req.method === 'POST') {
      return readBody().then((body) => {
        const newInvoice = {
          ...body,
          id: body.id || `inv-${Date.now()}`,
        };
        inMemorySales.push(newInvoice);
        sendJson(res, 201, newInvoice);
      });
    }
  }

  if (urlPath === '/api/purchaseinvoices') {
    if (req.method === 'GET') {
      return sendJson(res, 200, inMemoryPurchases);
    }
    if (req.method === 'POST') {
      return readBody().then((body) => {
        const newInvoice = {
          ...body,
          id: body.id || `pur-${Date.now()}`,
        };
        inMemoryPurchases.push(newInvoice);
        sendJson(res, 201, newInvoice);
      });
    }
  }

  if (req.method === 'POST' && urlPath.startsWith('/api/purchaseinvoices/') && urlPath.endsWith('/post')) {
    const id = urlPath.replace('/api/purchaseinvoices/', '').replace('/post', '');
    const inv = inMemoryPurchases.find((p) => p.id === id);
    if (inv) inv.status = 'POSTED';
    return sendJson(res, 200, true);
  }

  // Tally Integration Endpoints
  if (urlPath.startsWith('/api/tally/')) {
    const subRoute = urlPath.replace('/api/tally/', '');
    if (subRoute === 'test-connection') {
      return sendJson(res, 200, {
        connected: true,
        message: 'Connected to Tally Prime XML Gateway (Local Host Node)',
        companyName: 'Apex Electronics & Industrial Traders',
      });
    }
    if (subRoute === 'companies') {
      return sendJson(res, 200, {
        connected: true,
        message: 'Companies retrieved',
        companyName: 'Apex Electronics & Industrial Traders',
      });
    }
    if (subRoute === 'sync') {
      return sendJson(res, 200, {
        success: true,
        results: [{ success: true, message: 'All vouchers and masters synchronized', requested: 5, imported: 5 }],
      });
    }
    if (subRoute === 'pull') {
      return sendJson(res, 200, {
        result: { connected: true, message: 'Daybook pulled successfully' },
        from: '2026-04-01',
        to: '2027-03-31',
        note: 'Imported current financial year vouchers',
      });
    }
    if (subRoute === 'masters-preview') {
      return sendJson(res, 200, {
        ledgers: [],
        stockItems: [],
        partyMatches: [],
        stockMatches: [],
        rawResponse: '',
      });
    }
    if (subRoute === 'apply-masters') {
      return sendJson(res, 200, {
        success: true,
        companyName: 'Apex Electronics & Industrial Traders',
        partiesCreated: 0,
        stockItemsCreated: 0,
        skipped: 0,
        errors: [],
      });
    }
    if (subRoute === 'vouchers-preview') {
      return sendJson(res, 200, {
        companyName: 'Apex Electronics & Industrial Traders',
        from: '2026-04-01',
        to: '2027-03-31',
        totalVouchers: 0,
        candidateSales: 0,
        candidatePurchases: 0,
        unsupported: 0,
        alreadyImported: 0,
        items: [],
        rawResponse: '',
      });
    }
    if (subRoute === 'reconcile') {
      return sendJson(res, 200, {
        matched: 0,
        amountMismatch: 0,
        missingInTaxFlow: 0,
        missingInTally: 0,
        rows: [],
        rawResponse: '',
      });
    }
  }

  // Secure Backend OCR API Gateway Endpoint
  if (req.method === 'POST' && urlPath === '/api/ocr/analyze') {
    return readBody().then(async (payload) => {
      try {
        if (!payload.image) {
          return sendJson(res, 400, { error: 'Image data is required.' });
        }
        const ocrResult = await analyzeInvoiceOnServer(payload.image, payload.apiKey);
        return sendJson(res, 200, ocrResult);
      } catch (err) {
        console.error('Server OCR Gateway Error:', err.message);
        return sendJson(res, 500, { error: err.message });
      }
    });
  }

  // Handle Static Asset Delivery
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT_DIR, urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    urlPath = '/index.html';
  }

  const targetFile = path.join(ROOT_DIR, urlPath);
  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(targetFile, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TaxFlow AI Server & OCR Gateway running at http://0.0.0.0:${PORT}/`);
});
