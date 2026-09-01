---
name: refactor-clean
description: ECC Code Refactoring & Dead Code Elimination Runbook. Safely cleans up unreferenced functions, imports, and unused variables.
---

# 🧹 ECC Refactor & Clean Skill

Use this skill after major feature sprints to remove technical debt and optimize bundle size.

## 📋 Cleanup Checklist:
1. **Unused Imports & Types:** Remove unused Lucide icons, types, and helper imports.
2. **Dead Code & Commented Blocks:** Eliminate obsolete code blocks while preserving documentation.
3. **React Compiler Optimization:** Ensure components avoid unneeded state allocations and follow pure render guidelines.
4. **Automated Verification:** Always run `node scripts/build.js && node scripts/smokeTest.js` after cleanup to assert zero regressions.
