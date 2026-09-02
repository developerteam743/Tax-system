import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as babel from '@babel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Transpile gst.ts dynamically
const gstTs = fs.readFileSync(path.join(ROOT_DIR, 'src', 'utils', 'gst.ts'), 'utf-8');
const res = babel.transformSync(gstTs, {
  filename: 'gst.ts',
  presets: ['@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-modules-commonjs']
});

const gstModule = { exports: {} };
const fn = new Function('exports', 'module', res.code);
fn(gstModule.exports, gstModule);
const { calculateItemGst, formatCurrency } = gstModule.exports;

console.log('🧪 RUNNING FRONTEND LOGIC & GST ENGINE UNIT TESTS...\n');

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

// Test 1: Gujarat Intra-State (24 to 24)
const intraItem = calculateItemGst(10, 1000, 18, '24', '24');
assertEqual(intraItem.taxableValue, 10000, 'Intra-state Taxable Value calculation');
assertEqual(intraItem.cgstAmount, 900, 'Gujarat CGST 9% calculation');
assertEqual(intraItem.sgstAmount, 900, 'Gujarat SGST 9% calculation');
assertEqual(intraItem.igstAmount, 0, 'Gujarat IGST is 0 for intra-state');
assertEqual(intraItem.totalAmount, 11800, 'Intra-state Total Amount');

// Test 2: Interstate (24 to 27)
const interItem = calculateItemGst(5, 2000, 18, '27', '24');
assertEqual(interItem.taxableValue, 10000, 'Interstate Taxable Value calculation');
assertEqual(interItem.cgstAmount, 0, 'Interstate CGST is 0');
assertEqual(interItem.sgstAmount, 0, 'Interstate SGST is 0');
assertEqual(interItem.igstAmount, 1800, 'Interstate IGST 18% calculation');
assertEqual(interItem.totalAmount, 11800, 'Interstate Total Amount');

console.log('\n====================================================');
console.log(`📊 TEST SUITE SUMMARY: ${passed} Passed | ${failed} Failed`);
console.log('====================================================');

if (failed > 0) process.exit(1);
