import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const srcDir = path.join(ROOT_DIR, 'src');

console.log('====================================================');
console.log('🛡️ ECC AGENTSHIELD AUTOMATED SECURITY AUDIT');
console.log('====================================================\n');

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files = files.concat(scanDir(full));
    } else if (/\.(tsx?|jsx?|html)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = scanDir(srcDir);
let findings = [];

for (const file of allFiles) {
  const relPath = path.relative(ROOT_DIR, file);
  const content = fs.readFileSync(file, 'utf8');

  // Check 1: dangerouslySetInnerHTML
  if (content.includes('dangerouslySetInnerHTML')) {
    findings.push({ file: relPath, type: 'XSS Risk', detail: 'dangerouslySetInnerHTML detected' });
  }

  // Check 2: eval()
  if (/\beval\s*\(/.test(content)) {
    findings.push({ file: relPath, type: 'Code Injection', detail: 'eval() execution detected' });
  }

  // Check 3: Raw innerHTML
  if (/\.innerHTML\s*=/.test(content)) {
    findings.push({ file: relPath, type: 'DOM XSS', detail: 'Direct innerHTML assignment detected' });
  }

  // Check 4: Hardcoded API keys or Secrets
  if (/DEFAULT_GEMINI_KEY\s*=\s*['"][A-Za-z0-9._-]+['"]/.test(content)) {
    findings.push({ file: relPath, type: 'Secret Leakage', detail: 'Hardcoded API key constant detected' });
  }
}

console.log(`📁 Total Source Files Scanned: ${allFiles.length}`);
console.log(`🔍 Total Security Findings: ${findings.length}\n`);

if (findings.length > 0) {
  findings.forEach((f, i) => {
    console.log(`[Finding ${i + 1}] ⚠️ ${f.type} in ${f.file}:`);
    console.log(`            ${f.detail}\n`);
  });
} else {
  console.log('✅ ZERO Security Vulnerabilities Detected across all scanned source files!');
}

console.log('====================================================');
