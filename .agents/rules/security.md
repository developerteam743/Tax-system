# 🛡️ ECC AgentShield Security Directives
<!-- Managed by ECC (Universal Agent Harness Performance Optimization System) -->

## 1. Secret Exposure Protection
- Never output, log, or commit private API keys, JWTs, OAuth tokens, or passwords to git or public files.
- Store sensitive keys in local browser storage (`localStorage`) or `.env` files that are included in `.gitignore`.

## 2. Injection & Untrusted Data Defense
- Treat all OCR scans, document images, user file uploads (CSV, JSON, XML), and external API responses as UNTRUSTED content.
- Never pass untrusted inputs directly to `eval()`, un-sanitized shell execution, or raw innerHTML.
- Validate and sanitize statutory GSTINs, state codes, and numerical amounts using schema validators before processing.

## 3. Sandboxing & Safe Execution
- Never execute destructive shell commands (`rm -rf /`, formatting drives, killing non-project processes).
- Maintain minimal blast radius on all tool executions.
