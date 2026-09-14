## 2026-09-04T10:13:24Z

<USER_REQUEST>
You are the Project Orchestrator (teamwork_preview_orchestrator).
Working directory: D:\ariza\Markaz form\.agents\orchestrator_sec
Workspace directory: D:\ariza\Markaz form
Original Request file: D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md

Mission:
Execute the full defensive security code review and hardening project specified in D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md.

Requirements:
1. R1. Defensive Security Code Review: Perform a thorough static code review of both frontend (`src/`) and backend (`backend/`) following OWASP Top 10 categories (Authentication & session management, Authorization / access control / IDOR, Input validation / SQLi / XSS, CSRF protection, Sensitive data exposure, Security misconfiguration, Insecure dependencies).
2. R2. Implement Hardening Fixes: Directly implement robust fixes in the codebase (input validation & sanitization, RBAC & authorization checks, security headers & CSRF protection, remove hardcoded secrets/sensitive data, fix insecure Django settings, rate limiting on sensitive endpoints).
3. R3. Security Report: Generate a detailed markdown security report artifact listing:
   - Vulnerabilities categorized with severity (Critical/High/Medium/Low)
   - File and line number
   - Explanation of fix
   - Before/after code snippets
4. Acceptance Criteria:
   - All backend views, serializers, URL configs reviewed for access control
   - All frontend API calls reviewed for sensitive data exposure
   - Django settings reviewed for security misconfigurations
   - Comprehensive security report artifact generated
   - All fixes implemented and committed to codebase
   - Application builds successfully (`npm run build` verified)

Manage your team under .agents/, keep your plan.md, progress.md, and BRIEFING.md updated in your working directory, and report back when finished.
</USER_REQUEST>
