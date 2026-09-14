# Project: CENTRE FORM Defensive Security Hardening

## Architecture
- **Backend**: Django 5.0.4 + Django REST Framework (`backend/`)
- **Frontend**: React 19 + TypeScript + Vite 8 (`src/`)
- **Communication**: REST API over JSON (`/api/v1/...`) with JWT Bearer Authentication

## Feature & Vulnerability Inventory
| # | Feature / Vulnerability Item | Severity | Category | Milestone | Source |
|---|---|---|---|---|---|
| 1 | Remove Superadmin Backdoor (`reset_admin_view`) | Critical | A01: Broken Access Control | M1 | BE Explorer |
| 2 | Fix `IsSuperAdmin` RBAC Privilege Escalation | Critical | A01: Broken Access Control | M1 | BE Explorer |
| 3 | Remove Unauthenticated Database Migration Endpoints | High | A05: Security Misconfiguration | M1 | BE & Config Explorers |
| 4 | Remove Hardcoded Credentials in Scripts | High | A07: Identification & Auth Failures | M1 | BE & Config Explorers |
| 5 | Remove Insecure Static File Directory Serving | High | A01: Broken Access Control | M1 | Config Explorer |
| 6 | Redact Plaintext Secrets in Settings Serializer | High | A02: Cryptographic Failures | M1 | BE Explorer |
| 7 | Fix IDOR and PII Enumeration in Application Tracking | High | A01: Broken Access Control | M1 | BE Explorer |
| 8 | Cryptographic Hardening of QR Verification (HMAC-SHA256) | Critical | A02: Cryptographic Failures | M1 | BE Explorer |
| 9 | Add Rate Limiting & Scoped Throttles | High | A04: Insecure Design | M1 | BE & Config Explorers |
| 10 | Harden Django Settings (DEBUG, Hosts, Cookies, Headers, CORS, CSRF) | High | A05: Security Misconfiguration | M1 | Config Explorer |
| 11 | Add Strong Password Validation in Serializers | High | A07: Identification & Auth Failures | M1 | BE Explorer |
| 12 | Remove Unencrypted PII Database in LocalStorage | Critical | A02: Cryptographic Failures | M2 | FE Explorer |
| 13 | Eliminate Stored XSS via `javascript:` URI in File Links | Critical | A03: Injection | M2 | FE Explorer |
| 14 | Add Role-Based Route Guards & Restrict Admin Views | High | A01: Broken Access Control | M2 | FE Explorer |
| 15 | Sanitize Iframe / Map Embed URL against DOM/Stored XSS | High | A03: Injection | M2 | FE Explorer |
| 16 | Prevent CSV / Excel Formula Injection in Data Export | Medium | A03: Injection | M2 | FE Explorer |
| 17 | Mitigate Third-Party PII Leakage in Translation Service | Medium | A02: Cryptographic Failures | M2 | FE Explorer |
| 18 | Use Cryptographically Secure PRNG for IDs | Medium | A02: Cryptographic Failures | M2 | FE Explorer |
| 19 | Fix Automated State Mutation on Page Mount in CheckIn | Medium | A04: Insecure Design | M2 | FE Explorer |
| 20 | Remove Hardcoded Accounts and Mock Data from Bundles | Medium | A02: Cryptographic Failures | M2 | FE Explorer |
| 21 | Remove Insecure HTTP Fallback URL in API Client | Medium | A05: Security Misconfiguration | M2 | FE Explorer |
| 22 | Add CSP Meta Header and Restrict Vite Binding | Low | A05: Security Misconfiguration | M2 | FE & Config Explorers |
| 23 | Add File Upload Size & Type Validation on Frontend | Low | A04: Insecure Design | M2 | FE Explorer |
| 24 | E2E Frontend Build Verification (`npm run build`) | High | Verification | M3 | Acceptance Criteria |
| 25 | Comprehensive Markdown Security Report Generation | High | Reporting | M3 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Security Hardening | Items 1-11: DRF permissions, settings, rate limiting, endpoints, QR crypto | none | IN_PROGRESS |
| M2 | Frontend Security Hardening | Items 12-23: LocalStorage PII removal, XSS fix, Route Guards, export sanitization | none | PLANNED |
| M3 | Verification & Security Report | Items 24-25: `npm run build` verification and full SECURITY_REPORT.md generation | M1, M2 | PLANNED |

## Code Layout
- Backend Source: `backend/apps/`, `backend/centr_form/`
- Frontend Source: `src/`
- Metadata & Reports: `.agents/`, `SECURITY_REPORT.md`
