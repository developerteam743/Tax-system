import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as babel from '@babel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const srcDir = path.join(ROOT_DIR, 'src');
const distDir = path.join(ROOT_DIR, 'dist');
const distAssets = path.join(distDir, 'assets');

if (!fs.existsSync(distAssets)) fs.mkdirSync(distAssets, { recursive: true });

// Read Production CJS runtimes
const reactCjs = fs.readFileSync(path.join(ROOT_DIR, 'node_modules', 'react', 'cjs', 'react.production.js'), 'utf-8');
const reactDomCjs = fs.readFileSync(path.join(ROOT_DIR, 'node_modules', 'react-dom', 'cjs', 'react-dom.production.js'), 'utf-8');
const schedulerCjs = fs.readFileSync(path.join(ROOT_DIR, 'node_modules', 'scheduler', 'cjs', 'scheduler.production.js'), 'utf-8');

let reactDomClientCjs = '';
const clientPath = path.join(ROOT_DIR, 'node_modules', 'react-dom', 'cjs', 'react-dom-client.production.js');
if (fs.existsSync(clientPath)) {
  reactDomClientCjs = fs.readFileSync(clientPath, 'utf-8');
} else {
  reactDomClientCjs = reactDomCjs;
}

const filesToBundle = [
  'types/tax.ts',
  'utils/gst.ts',
  'utils/ocrEngine.ts',
  'utils/bankMatcher.ts',
  'utils/gstr1Exporter.ts',
  'utils/tallyExporter.ts',
  'data/initialData.ts',
  'services/api.ts',
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
  'components/Toast.tsx',
  'App.tsx',
  'main.tsx'
];

let modules = {};

for (const rel of filesToBundle) {
  const full = path.join(srcDir, rel);
  if (fs.existsSync(full)) {
    const code = fs.readFileSync(full, 'utf-8');
    const res = babel.transformSync(code, {
      filename: rel,
      presets: [
        ['@babel/preset-react', { runtime: 'classic' }],
        '@babel/preset-typescript'
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    });

    const key1 = './' + rel;
    const key2 = './' + rel.replace(/\.(tsx|ts)$/, '');
    modules[key1] = res.code;
    modules[key2] = res.code;
  }
}

let bundle = `
(function() {
  var process = { env: { NODE_ENV: 'production' } };
  var windowGlobal = typeof window !== 'undefined' ? window : globalThis;
  
  if (!windowGlobal.performance) {
    windowGlobal.performance = { now: function() { return Date.now(); } };
  } else if (!windowGlobal.performance.now) {
    windowGlobal.performance.now = function() { return Date.now(); };
  }

  var modules = {};
  var cache = {};

  function normalizePath(currentModulePath, id) {
    if (!id.startsWith('.')) return id;
    var fromDir = currentModulePath.substring(0, currentModulePath.lastIndexOf('/'));
    if (!fromDir) fromDir = '.';
    var parts = (fromDir + '/' + id).split('/');
    var resolved = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === '' || p === '.') continue;
      if (p === '..') {
        resolved.pop();
      } else {
        resolved.push(p);
      }
    }
    return './' + resolved.join('/');
  }

  function createLucideIcon(name) {
    return function IconComp(props) {
      var cls = (props && props.className) || "w-4 h-4";
      return React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: cls
      }, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "m12 8 4 4-4 4" }), React.createElement("path", { d: "M8 12h8" }));
    };
  }

  var lucideProxy = new Proxy({}, {
    get: function(t, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return lucideProxy;
      return createLucideIcon(prop);
    }
  });

  function makeRequire(currentModulePath) {
    return function scopedRequire(id) {
      if (id === 'react') return React;
      if (id === 'scheduler' || id === 'scheduler/tracing') return Scheduler;
      if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') return jsxRuntimeProxy;
      if (id === 'react-dom') return ReactDOM;
      if (id === 'react-dom/client') return ReactDOMClient || ReactDOM;
      if (id === 'lucide-react') return lucideProxy;
      if (id === 'canvas-confetti') return window.confetti || function(){};
      if (id === 'xlsx') return window.XLSX || {};

      var resolvedId = normalizePath(currentModulePath, id);
      if (cache[resolvedId]) return cache[resolvedId].exports;

      var targetCode = modules[resolvedId] || modules[resolvedId + '.tsx'] || modules[resolvedId + '.ts'] || modules[resolvedId + '.js'];
      if (!targetCode) {
        console.warn('Module not found:', id, 'Resolved as:', resolvedId);
        return {};
      }

      var mod = { exports: {} };
      cache[resolvedId] = mod;
      targetCode(makeRequire(resolvedId), mod.exports, mod);
      return mod.exports;
    };
  }

  function runCjsModule(fn) {
    var mod = { exports: {} };
    fn(mod.exports, mod, makeRequire('.'));
    return mod.exports;
  }

  var Scheduler = runCjsModule(function(exports, module, require) {
    ${schedulerCjs}
  });

  var React = runCjsModule(function(exports, module, require) {
    ${reactCjs}
  });

  var ReactDOM = runCjsModule(function(exports, module, require) {
    windowGlobal.React = React;
    ${reactDomCjs}
  });

  var ReactDOMClient = runCjsModule(function(exports, module, require) {
    windowGlobal.React = React;
    windowGlobal.ReactDOM = ReactDOM;
    ${reactDomClientCjs}
  });

  windowGlobal.React = React;
  windowGlobal.ReactDOM = ReactDOM;
  windowGlobal.ReactDOMClient = ReactDOMClient;
  windowGlobal.Scheduler = Scheduler;

  var jsxRuntimeProxy = {
    jsx: function(type, props, key) { return React.createElement(type, props); },
    jsxs: function(type, props, key) { return React.createElement(type, props); },
    jsxDEV: function(type, props, key, isStatic, opts) { return React.createElement(type, props); },
    Fragment: React.Fragment
  };

  function define(id, fn) { modules[id] = fn; }

`;

for (const [id, code] of Object.entries(modules)) {
  bundle += `define('${id}', function(require, exports, module) {\n${code}\n});\n`;
}

bundle += `
  function startApp() {
    try {
      makeRequire('.')('./main');
      console.log('TaxFlow AI Production App loaded successfully!');
    } catch (err) {
      console.error('App init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }
})();
`;

fs.writeFileSync(path.join(distAssets, 'app.js'), bundle);
console.log('Production build completed cleanly at dist/assets/app.js!');
