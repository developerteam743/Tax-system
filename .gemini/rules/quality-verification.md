# Quality Verification Standard Operating Procedure

For every code change made to `src/` or any project component:

1. **Rebuild Standalone Bundle:**
   Run `node scripts/build.js` to compile all TSX/TS files into `dist/assets/app.js`.

2. **Run Automated JSDOM Smoke Test:**
   Run `node scripts/smokeTest.js` to execute the bundle in a simulated virtual browser DOM, ensuring that:
   - `<div id="root">` renders full HTML markup (>10,000 characters).
   - Zero `window.onerror` or `console.error` runtime exceptions occur.

3. **Run React Compiler Diagnostics:**
   Run `node scripts/runReactCompilerDiagnostics.js` to verify that all components adhere strictly to React Compiler rules with 0 warnings.

4. **Verify Live Web Server:**
   Ensure the local server at `http://localhost:5174/` is running and serving `index.html` with HTTP 200.
