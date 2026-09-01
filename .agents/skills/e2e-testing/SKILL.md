---
name: e2e-testing
description: ECC Automated End-to-End Browser Testing Runbook using Puppeteer and Chrome DevTools MCP.
---

# 🌐 ECC End-to-End (E2E) Browser Testing Skill

Use this skill to execute automated browser testing against all user flows in TaxFlow AI.

## 📋 E2E Testing Protocol:
1. **Launch Browser / Attach Session:** Use Puppeteer or Chrome DevTools MCP on `http://localhost:5174/`.
2. **Navigate Flows:** Test all 8 core business flows (MIS, Sales Billing, E-Way Bill, AI Purchase OCR, Bank Recon, Stock Register, GSTR-1, Tally Hub).
3. **Assert Visual & State Changes:**
   - Verify modal opens and form inputs take user input.
   - Assert calculations update (e.g. Subtotal + CGST/SGST = Grand Total).
   - Assert transactions post into ledger tables.
4. **Take Verification Screenshots:** Capture UI state snapshots to confirm pixel-perfect rendering.
