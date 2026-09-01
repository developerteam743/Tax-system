---
name: tdd-workflow
description: ECC Test-Driven Development Runbook. Guides the creation of failing unit/integration tests before writing implementation code.
---

# 🧪 ECC Test-Driven Development (TDD) Runbook

Use this skill when implementing new business logic, tax calculation rules, or parsing engines.

## 🔄 TDD Workflow Steps:
1. **Define Test Scenarios:** Outline normal cases, edge cases, zero-values, and invalid inputs.
2. **Write Failing Tests First:** Create or append test assertions in `TaxFlow.Backend.Tests/` or `scripts/frontendTests.js`.
3. **Execute Test Runner:** Verify that tests fail for the right reason.
4. **Implement Minimal Code:** Write the simplest implementation that satisfies the test cases.
5. **Re-run & Refactor:** Ensure 100% green tests, then clean up code structure without altering behavior.
