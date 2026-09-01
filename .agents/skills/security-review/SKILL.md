---
name: security-review
description: ECC AgentShield Security Review Checklist. Scans the codebase for hardcoded secrets, injection vectors, and unsanitized data paths.
---

# 🛡️ ECC AgentShield Security Review Skill

Use this skill to audit pull requests, new API endpoints, and file upload handlers.

## 📋 Security Checklist:
1. **Secret & Key Leakage:**
   - Verify no private API keys, JWTs, or credentials exist in source files.
   - Ensure keys are sourced from `localStorage` or environment variables.
2. **Untrusted Input Boundaries:**
   - Verify OCR text, CSV uploads, and URL parameters are sanitized before rendering or parsing.
3. **Cross-Site Scripting (XSS):**
   - Check that no dynamic user content is rendered via raw HTML without sanitization.
4. **Data Privacy:**
   - Ensure customer GSTINs, phone numbers, and financial balances are transmitted over secure channels.
