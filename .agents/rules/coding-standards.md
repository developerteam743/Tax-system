# 📐 ECC Coding Standards & Architecture Rules
<!-- Managed by ECC (Universal Agent Harness Performance Optimization System) -->

## 1. Surgical, Non-Destructive Modifications
- Use targeted, minimal code block replacements (`replace_file_content`) to prevent regressions or accidental deletion of working features.
- Never perform full-file rewrites unless specifically creating a new module from scratch.

## 2. Research & Plan Before Implementation
- Always analyze existing project files and dependencies before proposing changes.
- Explain the implementation plan and highlight key design decisions to the user before editing code.

## 3. Mandatory Quality Verification Pipeline
- Every task must be verified with:
  1. `node scripts/build.js`
  2. `node scripts/smokeTest.js`
  3. `node scripts/runReactCompilerDiagnostics.js`
  4. Live HTTP health check
