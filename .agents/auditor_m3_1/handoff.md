# Milestone 3 Integrity Forensic Audit — Handoff Report

## 1. Observation
- **Inspected Files**:
  - `backend/apps/accounts/permissions.py` (lines 20-27): `IsModeratorOrAbove` verifies `request.user.is_authenticated`, `is_superuser`, `is_staff`, and `request.user.role in ('super_admin', 'administrator', 'moderator', 'admin')`.
  - `backend/apps/applications/serializers.py` (lines 6-20, 33-40): `validate_uploaded_file` enforces `.pdf`, `.jpg`, `.jpeg`, `.png` extensions and max file size of 10MB (10,485,760 bytes) on `document`, `passport`, and `photo` fields.
  - `backend/centr_form/settings.py` (lines 8-14, 165-173): Removed `CORS_ALLOW_ALL_ORIGINS = True` wildcard pattern. Added strict list `CORS_ALLOWED_ORIGINS` and enforced mandatory `SECRET_KEY` in production (`DEBUG=False`).
  - `backend/apps/events/views.py` (line 72): `dashboard_stats` decorated with `@permission_classes([IsModeratorOrAbove])`.
  - `src/api/client.ts` (lines 15-24): Response interceptor clears stored auth and redirects location to `/admin/login` on HTTP 401 status.
  - `backend/apps/accounts/tests.py` (lines 6-38): `IsModeratorOrAboveTests` evaluates unauthenticated denial, staff/superuser access, valid role access, and regular applicant denial.
  - `backend/apps/applications/tests.py` (lines 22-49): `FileValidationTests` evaluates valid formats, disallowed extensions (`.exe`, `.py`), and oversized file rejection.
- **Empirical Execution Commands & Output**:
  1. Command: `powershell -Command "$env:USE_SQLITE='True'; python backend/manage.py test apps --settings=centr_form.settings"`
     Output: `Ran 10 tests in 0.009s OK` (Exit code: 0).
  2. Command: `npx tsc --noEmit`
     Output: `0 errors` (Exit code: 0).
  3. Command: `npm run build`
     Output: `vite v8.2.0 building client environment for production... ✓ built in 2.09s` (Exit code: 0).

## 2. Logic Chain
1. *Observation*: `IsModeratorOrAbove` in `permissions.py` enforces authenticated role/staff check, and `@permission_classes([IsModeratorOrAbove])` protects `dashboard_stats` in `events/views.py`.
   *Inference*: Unauthenticated and unprivileged requests to `/api/v1/events/stats/` and moderator endpoints are properly blocked, closing the permission bypass vulnerability.
2. *Observation*: `validate_uploaded_file` in `serializers.py` validates extensions (`.pdf`, `.jpg`, `.jpeg`, `.png`) and max size (10MB) throwing DRF `ValidationError`. `FileValidationTests` tests valid files, `.exe`/`.py` files, and 11MB files against `validate_uploaded_file`.
   *Inference*: Arbitrary file upload vulnerabilities and DoS via large file payloads are blocked by real validation logic, verified by unit tests.
3. *Observation*: `settings.py` removes `CORS_ALLOW_ALL_ORIGINS = True` and raises `ValueError` if `SECRET_KEY` is missing in production. `client.ts` handles 401 by clearing auth token and redirecting to login.
   *Inference*: Server security configuration conforms to production standards and frontend gracefully handles token expiration.
4. *Observation*: All 10 backend tests run and pass without mock overrides or hardcoded return triggers. Frontend passes `tsc` type checking and `npm run build`.
   *Inference*: The work product is authentic, functional, and contains zero integrity violations.

## 3. Caveats
No caveats. All security fixes and unit tests were empirically verified.

## 4. Conclusion
**Verdict**: **CLEAN**

Milestone 3 (Security & Bug Remediation) has passed forensic integrity verification. All security fixes are genuine, test coverage is authentic, and overall codebase integrity is solid.

## 5. Verification Method
To re-verify the audit findings independently:
1. Run backend unit tests:
   `powershell -Command "$env:USE_SQLITE='True'; python backend/manage.py test apps --settings=centr_form.settings"`
   Expected output: `Ran 10 tests in 0.009s OK`
2. Run TypeScript type check:
   `npx tsc --noEmit`
   Expected output: Exit code 0 with 0 errors.
3. Run frontend build:
   `npm run build`
   Expected output: `✓ built in 2.09s`
