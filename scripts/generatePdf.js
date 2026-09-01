const fs = require('fs');
const path = require('path');

const reportPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity-cli\\brain\\a2279dba-c0db-42b8-926c-0b12fa61809c\\taxflow_ai_presentation_report.md';
const outputHtmlPath = 'C:\\Users\\LENOVO\\workspace\\tax-system\\TaxFlow_AI_Presentation_Report.html';

const img1 = 'file:///C:/Users/LENOVO/.gemini/antigravity-cli/brain/a2279dba-c0db-42b8-926c-0b12fa61809c/mis_dashboard_mockup_1785957648886.jpg';
const img2 = 'file:///C:/Users/LENOVO/.gemini/antigravity-cli/brain/a2279dba-c0db-42b8-926c-0b12fa61809c/ai_ocr_purchase_mockup_1785957664364.jpg';
const img3 = 'file:///C:/Users/LENOVO/.gemini/antigravity-cli/brain/a2279dba-c0db-42b8-926c-0b12fa61809c/sales_billing_invoice_mockup_1785957677530.jpg';
const img4 = 'file:///C:/Users/LENOVO/.gemini/antigravity-cli/brain/a2279dba-c0db-42b8-926c-0b12fa61809c/mobile_partner_simulator_mockup_1785957690646.jpg';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TaxFlow AI - Executive Presentation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a, #1e1b4b);
      color: white;
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 30px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }
    .header-banner h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header-banner p { margin: 0; color: #94a3b8; font-size: 14px; }
    
    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    
    h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    th { background: #f1f5f9; color: #334155; font-weight: 600; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
    .img-card { text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .img-card img { width: 100%; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .img-card p { font-size: 12px; font-weight: 600; color: #475569; margin: 8px 0 0 0; }
    
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #e0e7ff; color: #3730a3; }
    
    .btn-print {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    @media print {
      .btn-print { display: none; }
      body { background: white; padding: 0; }
      .card { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <button class="btn-print" onclick="window.print()">🖨️ Save as PDF / Print</button>

  <div class="header-banner">
    <h1>🚀 TaxFlow AI — Product Presentation Report</h1>
    <p>Smart MSME Billing • AI Purchase OCR • Bank Matcher • Tally & GSTR-1 ERP Engine</p>
  </div>

  <div class="card">
    <h2>📌 Executive Summary</h2>
    <p><strong>TaxFlow AI</strong> is an all-in-one Enterprise Resource Planning (ERP) platform designed specifically for small traders, businessmen, co-founders, and tax consultants. It automates sales billing, AI-based purchase invoice scanning, bank statement fuzzy reconciliation, inventory management, ready-to-file GSTR-1 generation, and 1-click Tally Prime XML export.</p>
  </div>

  <div class="card">
    <h2>🎨 Rendered Product Interfaces</h2>
    <div class="grid">
      <div class="img-card">
        <img src="${img1}" alt="Executive MIS Dashboard">
        <p>1. Executive MIS Financial Dashboard</p>
      </div>
      <div class="img-card">
        <img src="${img2}" alt="AI Purchase OCR Scanning HUD">
        <p>2. AI Purchase OCR Visual Scanning HUD</p>
      </div>
      <div class="img-card">
        <img src="${img3}" alt="Sales Tax Invoice Creator">
        <p>3. GST Sales Invoice Creator & PDF Preview</p>
      </div>
      <div class="img-card">
        <img src="${img4}" alt="Executive Mobile Simulator View">
        <p>4. Partner Executive Mobile App View</p>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>📊 Problem-Solution Matrix</h2>
    <table>
      <thead>
        <tr>
          <th>Target Persona</th>
          <th>Key Pain Point</th>
          <th>TaxFlow AI Solution</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Operations Partner</strong></td>
          <td>Slow manual invoicing & missing purchase receipts.</td>
          <td>Fast GST sales bill creator + instant photo OCR scanner for purchase bills.</td>
        </tr>
        <tr>
          <td><strong>Marketing Partner</strong></td>
          <td>No visibility on receivables, payables, or net bank balance.</td>
          <td>Real-time Executive MIS mobile dashboard with aging receivables (0–30, 30–60, 60+ days).</td>
        </tr>
        <tr>
          <td><strong>Tax Consultant / CA</strong></td>
          <td>Time wasted re-entering data or fixing unverified GSTINs.</td>
          <td>1-Click Tally Prime XML export + Ready-to-file GSTR-1 JSON & Excel workbook.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>⚡ Key Technical Specifications</h2>
    <ul>
      <li><strong>Gujarat Default (State Code 24):</strong> Auto-calculates Intra-State (CGST 9% + SGST 9%) vs Inter-State (IGST 18%) based on party state codes.</li>
      <li><strong>Auto E-Way Bill Trigger:</strong> Bills &gt; ₹50,000 auto-generate Part-A & Part-B details and printable slips.</li>
      <li><strong>1-Click Tally Prime XML Export:</strong> Exports vouchers directly into Tally Prime via <code>Import &gt; Vouchers</code>.</li>
      <li><strong>CompuTax Host Node Model:</strong> Encrypted local device hosting allows offline-first functionality with P2P sync.</li>
    </ul>
  </div>

  <div class="card">
    <h2>💰 Cost & Performance Benchmark</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>TaxFlow AI (Local Host Node)</th>
          <th>Traditional Cloud ERP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Fixed Monthly Hosting Cost</td>
          <td><span class="badge">₹0 / $0 per month</span></td>
          <td>₹2,500 – ₹8,000 / mo</td>
        </tr>
        <tr>
          <td>API Response Time</td>
          <td><strong>0ms – 5ms</strong> (Local Disk / SQLite)</td>
          <td>150ms – 400ms</td>
        </tr>
        <tr>
          <td>Offline Capability</td>
          <td><strong>100% Operational</strong></td>
          <td>Unavailable offline</td>
        </tr>
      </tbody>
    </table>
  </div>

</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, htmlContent);
console.log('HTML presentation created successfully at: ' + outputHtmlPath);
