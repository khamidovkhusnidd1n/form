# BRIEFING — 2026-09-04T10:15:00Z

## Mission
Conduct an exhaustive static security review of Django settings, middleware, HTTP security headers, CORS, CSRF, rate limiting, and dependencies in CENTRE FORM application.

## 🔒 My Identity
- Archetype: explorer
- Roles: security_auditor, configuration_reviewer, dependency_analyst
- Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3
- Original parent: 05082631-bf31-4f52-bfed-4a464fa9ad7a
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement fixes in source files directly
- Write only inside working directory D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3
- Must provide exact file paths, line numbers, severity, vulnerability explanation, and defensive fix recommendations with code snippets
- Report via handoff.md and notify parent agent via send_message

## Current Parent
- Conversation ID: 05082631-bf31-4f52-bfed-4a464fa9ad7a
- Updated: 2026-09-04T10:24:00Z

## Investigation State
- **Explored paths**: `backend/centr_form/settings.py`, `backend/centr_form/urls.py`, `backend/centr_form/views.py`, `backend/.env`, `backend/.secret_key`, `backend/requirements.txt`, `package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `backend/apps/*/views.py`, `backend/apps/*/urls.py`, `backend/apps/*/services.py`, `src/api/client.ts`, `src/store/authStore.ts`, git-tracked scripts (`fix_settings*.py`, `test_*.py`, `add_reset_admin.py`).
- **Key findings**:
  1. SEC-01 (CRITICAL): Unauthenticated superadmin backdoor in `backend/apps/common/views.py:240` (`GET /api/v1/common/reset-admin/`).
  2. SEC-02 (HIGH): Unauthenticated remote database migration execution (`/api/v1/common/migrate/`, `/api/v1/common/makemigrations/`).
  3. SEC-03 (HIGH): Live production SMTP and superadmin credentials committed to Git history (`test_smtp.py:6`, `fix_settings.py:19`, `test_remote_login.py:8`).
  4. SEC-04 (HIGH): `DEBUG=True` default and `ALLOWED_HOSTS=*` bypasses all security headers and exposes tracebacks.
  5. SEC-05 (HIGH): `django.views.static.serve` exposes project root in production URLs.
  6. SEC-06 (HIGH): No Content Security Policy (CSP) while JWT tokens are stored in `localStorage`.
  7. SEC-07 (HIGH): DRF anon throttling at 10,000/hr; sensitive endpoints (`login`, `submit`) have no scoped throttling.
  8. SEC-08 (HIGH): Outdated dependencies with known CVEs (`Django==5.0.4`, `xlsx@0.18.5`, `openpyxl==3.1.3`).
  9. SEC-09 (MEDIUM): Missing `CSRF_TRUSTED_ORIGINS` and permissive CORS origins.
  10. SEC-10 (MEDIUM): Missing shared cache (`CACHES`) causing per-process rate-limit bypass under multi-worker WSGI.
  11. SEC-11 (MEDIUM): Missing `SECURE_PROXY_SSL_HEADER` causing potential SSL redirect loops behind cPanel reverse proxy.
  12. SEC-12 (MEDIUM): Unkeyed SHA-256 in QR verification allowing attendance hash forgery.
  13. SEC-13 (MEDIUM): Information disclosure via `/api/v1/common/test-email/`.
  14. SEC-14 (LOW): Misordered `CorsMiddleware` after `WhiteNoiseMiddleware`.
- **Unexplored areas**: None within configuration and dependency review scope. All 14 findings fully identified with remediation code.

## Key Decisions Made
- Fully documented all 14 vulnerabilities in `handoff.md` with CVSS severity, file/line locations, attack impact, and drop-in code fixes.
- Hardened both backend Django settings and frontend security headers (CSP meta tag, JWT exposure controls).
- Survey milestone complete; handoff report delivered.

## Artifact Index
- D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3\DISPATCH.md — Task assignment and parent message updates
- D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3\BRIEFING.md — Situational awareness and working memory
- D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3\progress.md — Liveness heartbeat and progress tracker
- D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3\handoff.md — Final comprehensive handoff report (14 findings with code fixes)
