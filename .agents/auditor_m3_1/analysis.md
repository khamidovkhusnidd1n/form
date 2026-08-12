# Forensic Audit Report — Milestone 3 (Security & Bug Remediation)

**Work Product**: Security fixes & unit tests implemented in Milestone 3
**Profile**: General Project (Integrity Mode: development)
**Verdict**: CLEAN

---

## 1. Executive Summary

A comprehensive forensic audit of Milestone 3 was performed to evaluate the security remediations and bug fixes implemented by `worker_m3_1`. All claims made in `worker_m3_1/handoff.md` were independently verified through source code inspection, forensic pattern checks, and empirical command execution.

**Verdict**: **CLEAN** — The security remediations are authentic, robust, properly integrated, and verified by passing unit tests without dummy stubs, hardcoded returns, or mock overrides.

---

## 2. Phase 1: Forensic Source Code Analysis

### 2.1 Hardcoded Output & Facade Detection
Every file modified in Milestone 3 was inspected line by line:

1. **Permission Check (`backend/apps/accounts/permissions.py`)**:
   - `IsModeratorOrAbove`: Verified that lines 20-27 implement real role and attribute checks:
     - Rejects unauthenticated requests (`if not request.user or not request.user.is_authenticated: return False`).
     - Grants access to superusers and staff (`getattr(user, 'is_superuser', False)` or `getattr(user, 'is_staff', False)`).
     - Checks user role against allowed set `('super_admin', 'administrator', 'moderator', 'admin')`.
   - **Check Result**: PASS — Genuine permission check; no constant `True` bypass or dummy return.

2. **File Upload Security (`backend/apps/applications/serializers.py`)**:
   - `validate_uploaded_file`: Verified lines 6-20:
     - Extension validation: Checks file extension against `ALLOWED_FILE_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}` using `os.path.splitext(file_obj.name)[1].lower()`. Raises `serializers.ValidationError` on mismatch.
     - Size validation: Checks `file_obj.size` against `MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024` (10 MB). Raises `serializers.ValidationError` on excess size.
   - Connected to `ApplicationSubmitSerializer` for fields `document`, `passport`, `photo`.
   - **Check Result**: PASS — Real validation logic with configurable extension and size bounds.

3. **Insecure Settings Remediation (`backend/centr_form/settings.py`)**:
   - CORS Configuration: Removed unsafe `if DEBUG: CORS_ALLOW_ALL_ORIGINS = True` wildcard pattern. Explicit list `CORS_ALLOWED_ORIGINS` configured via env / defaults (`http://localhost:5173`, `http://localhost:3000`, `http://localhost:8443`, etc.). `CORS_ALLOW_CREDENTIALS = True` is safe.
   - Secret Key Configuration: Lines 8-14 enforce production secret key safety. In production (`DEBUG=False`), an missing `SECRET_KEY` raises a fatal `ValueError`. In `DEBUG=True`, auto-generates key via `get_random_secret_key()`.
   - **Check Result**: PASS — No insecure fallback or CORS wildcard remain.

4. **Event Stats Endpoint Protection (`backend/apps/events/views.py`)**:
   - Line 72: `@permission_classes([IsModeratorOrAbove])` applied to `dashboard_stats` function view (`/api/v1/events/stats/`).
   - Previously `AllowAny`. Now restricts sensitive event statistics to authenticated moderators and administrators.
   - **Check Result**: PASS — Protected against unauthenticated data disclosure.

5. **Frontend API 401 Interceptor (`src/api/client.ts`)**:
   - Response interceptor checks `err.response?.status === 401`. Calls `clearStoredAuth()` and redirects `window.location.href = '/admin/login'` if not already on the login page.
   - **Check Result**: PASS — Clean authentication failure recovery.

### 2.2 Pre-Populated Artifact Detection
- Scanned repository for pre-existing log files, mock test outputs, or cached attestation artifacts.
- No pre-populated result files were detected.

---

## 3. Phase 2: Unit Test & Behavioral Verification

### 3.1 Unit Test Integrity Check
The backend test suite was audited for mock abuse, skipped assertions, or self-certifying tests:
- `backend/apps/accounts/tests.py`:
  - `IsModeratorOrAboveTests`: Tests 4 distinct scenarios (`unauthenticated_user_denied`, `superuser_or_staff_allowed`, `valid_roles_allowed`, `regular_user_role_denied`). Mocking is strictly limited to setting user properties on `request.user` while executing the actual `has_permission` function logic.
- `backend/apps/applications/tests.py`:
  - `FileValidationTests`: Uses real `SimpleUploadedFile` objects with binary content to test valid files (`.pdf`, `.jpg`, `.png`), disallowed extensions (`.exe`, `.py`), and oversized files (11MB payload). Asserts specific `ValidationError` exceptions and error message contents.
- `backend/apps/qr/tests.py`:
  - Asserts hash payload format, token prefix `cf-`, and SHA-256 hash consistency.

### 3.2 Empirical Command Execution Results

1. **Backend Unit Tests**:
   - Command: `powershell -Command "$env:USE_SQLITE='True'; python backend/manage.py test apps --settings=centr_form.settings"`
   - Output: `Ran 10 tests in 0.009s OK`
   - Exit code: `0`

2. **Frontend Type Check**:
   - Command: `npx tsc --noEmit`
   - Output: 0 errors
   - Exit code: `0`

3. **Frontend Production Build**:
   - Command: `npm run build`
   - Output: `vite v8.2.0 building client environment for production... ✓ built in 2.09s`
   - Exit code: `0`

---

## 4. Adversarial Review & Attack Surface Stress Test

| Challenge Dimension | Attack Scenario | Actual / Observed Behavior | Result |
|---------------------|-----------------|----------------------------|--------|
| **Permission Check** | Unauthenticated request to `/api/v1/events/stats/` | `IsModeratorOrAbove` returns `False`, DRF returns `HTTP 401 Unauthorized`. | PASS |
| **Permission Check** | Regular user (role='applicant') accessing stats | `IsModeratorOrAbove` checks role `'applicant'`, returns `False`, DRF returns `HTTP 403 Forbidden`. | PASS |
| **File Upload** | Uploading `.exe` file named `resume.exe` | `validate_uploaded_file` extracts extension `.exe`, raises `ValidationError("Fayl formati ruxsat etilmagan (.exe)...")`. | PASS |
| **File Upload** | Uploading 11MB PDF file | `validate_uploaded_file` checks file size `11534336 > 10485760`, raises `ValidationError("Fayl hajmi 10MB dan oshmasligi kerak.")`. | PASS |
| **CORS / Credentials** | Cross-origin request with credentials from unauthorized domain | `CORS_ALLOWED_ORIGINS` limits origin matches; `CORS_ALLOW_ALL_ORIGINS` is absent. Browser blocks unlisted origins. | PASS |
| **Secret Key** | Production run with missing `SECRET_KEY` | `settings.py` throws `ValueError("SECRET_KEY environment variable MUST be defined in production!")`, preventing insecure startup. | PASS |

---

## 5. Conclusion & Verdict

**Verdict**: **CLEAN**

All security fixes required for Milestone 3 are authentic, complete, and independently verified. All unit tests pass cleanly without shortcuts or mock overrides. The codebase meets all security integrity standards.
