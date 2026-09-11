import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const bundlePath = path.join(ROOT_DIR, 'dist', 'assets', 'app.js');

console.log('🧪 RUNNING AUTOMATED PRE-FLIGHT SMOKE TEST (JSDOM Environment)...\n');

const html = `<!doctype html><html><head></head><body><div id="root"></div></body></html>`;

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:5174/',
});

const errors = [];

dom.window.console.error = (...args) => {
  errors.push(args.join(' '));
};

dom.window.addEventListener('error', (event) => {
  errors.push(event.error ? event.error.stack : event.message);
});

let code = fs.readFileSync(bundlePath, 'utf-8');

// The production bundle is intentionally executable in a browser module context,
// but this smoke test evaluates it as a classic script. Replace Vite's compile-time
// import.meta.env reference so JSDOM can exercise the rendered application without
// requiring module evaluation.
code = code.replace(/import\.meta\.env/g, '({})');

try {
  dom.window.eval(code);

  setTimeout(() => {
    const rootEl = dom.window.document.getElementById('root');
    const renderedHtml = rootEl ? rootEl.innerHTML : '';

    console.log('====================================================');
    if (errors.length > 0) {
      console.error('❌ PRE-FLIGHT TEST FAILED! Captured Browser Runtime Errors:');
      errors.forEach((e, idx) => console.error(`   [Error ${idx + 1}] ${e}`));
      process.exit(1);
    } else if (!renderedHtml || renderedHtml.trim().length === 0) {
      console.error('❌ PRE-FLIGHT TEST FAILED! <div id="root"> is empty (no DOM nodes rendered).');
      process.exit(1);
    } else {
      console.log('✅ PRE-FLIGHT SMOKE TEST PASSED 100%!');
      console.log(`   Rendered Root HTML Size: ${renderedHtml.length} characters.`);
      console.log('   Zero uncaught JavaScript runtime errors detected!');
      console.log('====================================================');
      process.exit(0);
    }
  }, 200);
} catch (err) {
  console.error('❌ SYNTAX / EVALUATION ERROR:', err.stack);
  process.exit(1);
}
