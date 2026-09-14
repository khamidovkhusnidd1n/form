# Dispatch for Milestone 1 Worker: Backend Security Hardening

## Assigned Scope
- Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1
- Workspace directory: D:\ariza\Markaz form
- Original Request: D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md
- Project Scope: D:\ariza\Markaz form\PROJECT.md
- Survey Findings to read:
  - D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_1\handoff.md
  - D:\ariza\Markaz form\.agents\teamwork_preview_explorer_survey_3\handoff.md

## Write Ownership (Files you exclusively own)
- `backend/centr_form/settings.py`
- `backend/centr_form/urls.py`
- `backend/apps/common/views.py`
- `backend/apps/common/urls.py`
- `backend/apps/accounts/permissions.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/views.py`
- `backend/apps/settings_app/serializers.py`
- `backend/apps/applications/views.py`
- `backend/apps/qr/services.py`
- `backend/apps/qr/views.py`
- Scripts: `create_admin.py`, `reset_pass.py`, `test_smtp.py`, `test_remote_login.py` (redact or remove hardcoded plaintext passwords)

## Required Hardening Implementation (M1 Items 1-11)
1. **Remove Superadmin Backdoor**:
   - Completely delete `reset_admin_view` from `backend/apps/common/views.py` and its route from `backend/apps/common/urls.py`.
2. **Fix `IsSuperAdmin` Permission**:
   - In `backend/apps/accounts/permissions.py`, fix `IsSuperAdmin` so it strictly checks `request.user.role == 'superadmin' and request.user.is_superuser` (do NOT rely on `is_staff`, because regular moderators have `is_staff=True` by default!).
3. **Remove / Restrict Unauthenticated Migration Endpoints**:
   - In `backend/apps/common/views.py` and `backend/apps/common/urls.py`, remove public endpoints `run_migrations` / `run_makemigrations` or strictly protect them with `[IsSuperAdmin]`.
4. **Remove Hardcoded Plaintext Credentials in Scripts**:
   - Check `create_admin.py`, `reset_pass.py`, `test_smtp.py`, `test_remote_login.py`. Redact/sanitize plaintext credentials or use environment variables.
5. **Remove Insecure Static Directory Serving**:
   - In `backend/centr_form/urls.py`, remove the dangerous `django.views.static.serve` pattern exposing `BASE_DIR` or root directories.
6. **Redact Sensitive Secrets in Settings Serializer**:
   - In `backend/apps/settings_app/serializers.py`, mark `smtp_password` and `sms_api_key` as `write_only=True` so they are never returned in plain text in GET API responses.
7. **Fix IDOR and PII Enumeration in Application Tracking**:
   - In `backend/apps/applications/views.py:58-66`, require both `application_id` AND `phone` to query application status to prevent sequential ID guessing. Restrict returned fields so sensitive internal comments or passport data are not leaked to unauthenticated users.
8. **Cryptographic Hardening of QR Verification**:
   - In `backend/apps/qr/services.py`, replace simple unkeyed `hashlib.sha256` with `hmac.new(settings.SECRET_KEY.encode(), ...)` using HMAC-SHA256 with timing-safe comparison (`hmac.compare_digest`).
9. **Add Rate Limiting / Scoped Throttles**:
   - In `backend/centr_form/settings.py` and views: Configure DRF throttles (`AnonRateThrottle`, `UserRateThrottle`, `ScopedRateThrottle`).
   - Add scoped throttling on sensitive endpoints: `LoginView` (e.g. 5/min), `change_password_view` (e.g. 5/min), application submission (e.g. 10/min).
10. **Harden Django Settings**:
    - `DEBUG = config('DEBUG', default=False, cast=bool)` (secure production default).
    - `ALLOWED_HOSTS`: sanitize and avoid open `*` in production.
    - Secure Cookies: `SESSION_COOKIE_HTTPONLY = True`, `SESSION_COOKIE_SECURE = True`, `SESSION_COOKIE_SAMESITE = 'Lax'`, `CSRF_COOKIE_HTTPONLY = False` (or appropriate for frontend token read), `CSRF_COOKIE_SECURE = True`, `CSRF_COOKIE_SAMESITE = 'Lax'`.
    - Security Headers: `X_FRAME_OPTIONS = 'DENY'`, `SECURE_CONTENT_TYPE_NOSNIFF = True`, `SECURE_BROWSER_XSS_FILTER = True`, `SECURE_HSTS_SECONDS = 31536000`, `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`, `SECURE_HSTS_PRELOAD = True`.
    - `CORS_ALLOW_ALL_ORIGINS = False`, configure `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
    - Correct middleware order: `CorsMiddleware` right after `SecurityMiddleware` and before `CommonMiddleware`/`WhiteNoiseMiddleware`.
11. **Enforce Password Validation in Serializers**:
    - In `backend/apps/accounts/serializers.py`, validate passwords using `django.contrib.auth.password_validation.validate_password` in `UserCreateSerializer` and `ChangePasswordSerializer`.

## Verification Instructions
- Run Python syntax checks and Django checks (`python manage.py check`) if available.
- Ensure no regressions in views or models.
- Document all modified files, line numbers, and changes in `D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-04T10:26:27Z
You are Worker 1 assigned to Milestone 1: Backend Security Hardening.
Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1
Workspace directory: D:\ariza\Markaz form
Read your instructions in D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1\DISPATCH.md, D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md, and D:\ariza\Markaz form\PROJECT.md.

Implement all 11 backend security hardening fixes described in DISPATCH.md across backend/ and scripts.
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verify your changes using python syntax checks or manage.py check.
Document all modified files, line numbers, and changes with before/after comparisons in D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1\handoff.md.
Send a message to parent when complete.
