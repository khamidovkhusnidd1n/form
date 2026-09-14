# Original User Request

## 2026-08-12T04:46:21Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Completely remove the default Django Admin panel from the project and perform a deep codebase audit to clean up unused files, optimize structure, and fix security or logical errors.

Working directory: D:\ariza\Markaz form
Integrity mode: development

## Requirements

### R1. Complete Removal of Django Admin
Remove all dependencies, routing, configurations, and boilerplate files (like `admin.py`) related to `django.contrib.admin`. The project relies entirely on a custom React admin panel, so the default Django admin must be completely unhooked from the backend.

### R2. Deep Codebase Audit and Cleanup
Conduct a full project check. Identify and remove unused code, dead imports, empty files, and bloated folder structures. Optimize the codebase for a clean, minimal architecture while preserving all existing active functionality.

### R3. Security and Bug Check
Identify and fix any security vulnerabilities, misconfigurations, or potential logical bugs in the existing backend code.

## Acceptance Criteria

### Django Admin Removal
- [ ] `django.contrib.admin` is removed from `INSTALLED_APPS` in `settings.py`.
- [ ] No `admin.py` files contain active admin registrations.
- [ ] No `/admin/` or `/superadmin/` routes exist in the main `urls.py`.

### Code Cleanup
- [ ] A programmatic search (e.g., using `flake8`, `eslint`, or `grep`) shows no unused imports or variables in the active backend code.
- [ ] Boilerplate comments and empty files are removed.

### Functional Integrity
- [ ] The custom React admin panel and all API endpoints continue to function without any dependency on the removed Django admin.
</USER_REQUEST>

## 2026-09-04T10:12:12Z

<USER_REQUEST>
Conduct a comprehensive defensive security code review of the "CENTRE FORM" application codebase. Your goal is to identify security weaknesses through static code analysis and implement hardening fixes directly in the code.

Working directory: D:\ariza\Markaz form
Integrity mode: development

This is a Django + React application for event registration. The backend is in `backend/` (Django REST Framework), and the frontend is in `src/` (React + TypeScript + Vite).

## Requirements

### R1. Defensive Security Code Review
Perform a thorough static code review of both frontend and backend code. Identify security weaknesses following OWASP Top 10 categories:
- Authentication and session management flaws
- Authorization/access control issues (IDOR, privilege escalation)
- Input validation gaps (SQL injection, XSS vectors)
- CSRF protection gaps
- Sensitive data exposure (hardcoded secrets, API keys in frontend code)
- Security misconfiguration (DEBUG mode, permissive CORS, missing security headers)
- Insecure dependencies

### R2. Implement Hardening Fixes
For every identified weakness, implement a robust fix directly in the codebase:
- Add proper input validation and sanitization
- Fix authorization checks (ensure role-based access control is enforced consistently)
- Add security headers and CSRF protection where missing
- Remove any hardcoded secrets or sensitive data from frontend code
- Fix any insecure Django settings
- Ensure proper rate limiting on sensitive endpoints (login, password change)

### R3. Security Report
Generate a detailed markdown security report as an artifact listing:
- Each vulnerability found with severity (Critical/High/Medium/Low)
- The file and line number where the issue exists
- What the fix was
- Before/after code snippets showing the change

## Acceptance Criteria

### Code Review Quality
- [ ] All backend views, serializers, and URL configurations have been reviewed for access control issues
- [ ] All frontend API calls have been reviewed for sensitive data exposure
- [ ] Django settings have been reviewed for security misconfigurations
- [ ] A comprehensive security report artifact is generated with categorized findings
- [ ] All identified issues have corresponding fixes committed to the codebase
- [ ] The application still builds successfully after all fixes (run `npm run build` to verify)
</USER_REQUEST>
