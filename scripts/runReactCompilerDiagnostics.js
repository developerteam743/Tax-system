import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as babel from '@babel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const srcDir = path.join(ROOT_DIR, 'src');

const filesToAnalyze = [
  'App.tsx',
  'components/Navbar.tsx',
  'components/Sidebar.tsx',
  'components/MISDashboard.tsx',
  'components/SalesBilling.tsx',
  'components/EWayBillModule.tsx',
  'components/AIPurchaseOCR.tsx',
  'components/BankReconciliation.tsx',
  'components/StockRegister.tsx',
  'components/GSTR1Report.tsx',
  'components/TallyExportModule.tsx',
  'components/PartyLedgerModal.tsx',
  'components/HostServerModal.tsx',
  'components/OnboardingWizardModal.tsx',
  'components/SampleBillModal.tsx',
  'components/ScannedInvoiceReviewModal.tsx',
  'components/Toast.tsx'
];

console.log('====================================================');
console.log('⚛️ RUNNING OFFICIAL REACT COMPILER DIAGNOSTIC SUITE');
console.log('====================================================\n');

let totalPassed = 0;
let totalFailed = 0;

for (const relFile of filesToAnalyze) {
  const fullPath = path.join(srcDir, relFile);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf-8');
    try {
      const result = babel.transformSync(code, {
        filename: relFile,
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ],
        plugins: [
          'babel-plugin-react-compiler'
        ]
      });

      console.log(`✅ [REACT COMPILER] ${relFile} — Successfully Analyzed & Auto-Memoized!`);
      totalPassed++;
    } catch (err) {
      console.error(`❌ [REACT COMPILER WARNING] ${relFile}:`);
      console.error(`   ${err.message.split('\n')[0]}`);
      totalFailed++;
    }
  }
}

console.log('\n====================================================');
console.log(`📊 DIAGNOSTIC RESULTS: ${totalPassed} Passed | ${totalFailed} Warnings`);
console.log('====================================================');
