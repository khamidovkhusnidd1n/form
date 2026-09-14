# Master Security Hardening Plan

## Objectives
Execute full defensive security code review and hardening project specified in `ORIGINAL_REQUEST.md`:
1. R1: Defensive static code review across frontend (`src/`) and backend (`backend/`) against OWASP Top 10.
2. R2: Implement robust code fixes for identified vulnerabilities:
   - Input validation & sanitization
   - RBAC & authorization checks (IDOR, privilege escalation)
   - Security headers, CSRF protection, secure cookie settings
   - Remove hardcoded secrets/sensitive data
   - Insecure Django settings (DEBUG, ALLOWED_HOSTS, CORS, SECRET_KEY)
   - Rate limiting on sensitive endpoints
3. R3: Detailed Security Report markdown artifact with severity, file:line, explanation, before/after snippets.
4. Acceptance:
   - All backend views, serializers, URLs checked
   - Frontend API calls audited
   - Django settings hardened
   - npm run build verified passing
   - Clean forensic audit

## Phases
- **Phase 0: Survey & Code Review Audit**
  - Explorer 1: Backend Static Code Review (`backend/` views, urls, serializers, models, authentication, permissions, rate limiting)
  - Explorer 2: Frontend Static Code Review (`src/` API calls, auth storage, state management, sensitive data leakage, input handling)
  - Explorer 3: Settings, Secrets, Dependencies & Infra Review (`settings.py`, CORS, CSRF, security headers, env vars, package.json, requirements.txt)
- **Phase 1: Project Architecture & Vulnerability Decomposition**
  - Formulate `PROJECT.md` with Feature/Vulnerability Inventory
  - Define Interface Contracts and Milestones
- **Phase 2: Milestone 1 - Backend Hardening Implementation**
  - Worker: Implement backend security fixes, DRF permissions, rate limiting, sanitization, Django settings
  - Reviewers: Validate backend security fixes
  - Challenger: Adversarial tests on backend endpoints / permission boundaries
  - Forensic Auditor: Integrity check
- **Phase 3: Milestone 2 - Frontend Hardening Implementation**
  - Worker: Implement frontend security fixes, sanitize API requests, remove hardcoded sensitive data/defaults
  - Reviewers: Validate frontend security fixes
  - Challenger: Adversarial tests on frontend security posture
  - Forensic Auditor: Integrity check
- **Phase 4: Milestone 3 - Security Report & Build Verification**
  - Worker: Run `npm run build`, assemble comprehensive security markdown report artifact
  - Reviewers & Challenger: Verify report accuracy & build integrity
  - Forensic Auditor: Final integrity check
