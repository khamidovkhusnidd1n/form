# Reviewer 1 Handoff Report: Milestone 1 Backend Hardening Review

**Agent**: Reviewer 1 (`teamwork_preview_reviewer_m1_1`)  
**Roles**: Reviewer, Critic  
**Working Directory**: `D:\ariza\Markaz form\.agents\teamwork_preview_reviewer_m1_1`  
**Date**: 2026-09-04  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

Direct observations, executed verification commands, verbatim outputs, and file line references:

### 1.1 Django System & Deployment Checks
- **Command**: `backend\.venv\Scripts\python.exe backend\manage.py check`
  - **Result**: Exit code `0`.
  - **Output**: `System check identified no issues (0 silenced).`
- **Command**: `.\.venv\Scripts\python.exe -c "import os, django; os.environ['DEBUG']='False'; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from django.core.management import call_command; call_command('check', deploy=True)"` (run in `backend/`)
  - **Result**: Exit code `0`.
  - **Output**: `System check identified no issues (0 silenced).`

### 1.2 Django Unit Test Suite Failure (CRITICAL FINDING)
- **Command**: `.\.venv\Scripts\python.exe manage.py test apps` (run in `backend/`)
  - **Result**: Exit code `1` (FAILED).
  - **Verbatim Error Output**:
    ```text
    Found 13 test(s).
    System check identified no issues (0 silenced).
    .F...........
    ======================================================================
    FAIL: test_superuser_or_staff_allowed (apps.accounts.tests.IsModeratorOrAboveTests.test_superuser_or_staff_allowed)
    ----------------------------------------------------------------------
    Traceback (most recent call last):
      File "D:\ariza\Markaz form\backend\apps\accounts\tests.py", line 22, in test_superuser_or_staff_allowed
        self.assertTrue(self.permission.has_permission(self.request, None))
    AssertionError: False is not true

    ----------------------------------------------------------------------
    Ran 13 tests in 0.006s

    FAILED (failures=1)
    ```
- **Code Inspection** (`backend/apps/accounts/tests.py:15-23`):
  ```python
  def test_superuser_or_staff_allowed(self):
      self.request.user.is_authenticated = True
      self.request.user.is_superuser = True
      self.assertTrue(self.permission.has_permission(self.request, None))

      self.request.user.is_superuser = False
      self.request.user.is_staff = True
      self.assertTrue(self.permission.has_permission(self.request, None))  # Line 22: Fails here!
  ```
- **Root Cause**: In `backend/apps/accounts/permissions.py:27-34`, Worker 1 hardened `IsModeratorOrAbove` by removing `getattr(request.user, 'is_staff', False)`:
  ```python
  class IsModeratorOrAbove(BasePermission):
      def has_permission(self, request, view):
          if not request.user or not request.user.is_authenticated:
              return False
          if request.user.is_superuser:
              return True
          user_role = getattr(request.user, 'role', None)
          return user_role in ('super_admin', 'superadmin', 'administrator', 'moderator', 'admin')
  ```
  While removing the generic `is_staff` check was a sound security measure to prevent staff privilege escalation, Worker 1 did not update the corresponding unit test (`apps/accounts/tests.py:20-23`) to assert that `is_staff=True` without a valid role is now DENIED. Worker 1 also did not run `manage.py test apps` prior to submitting handoff.

### 1.3 Residual Backdoor Injection Script in Repository Root
- **File**: `D:\ariza\Markaz form\add_reset_admin.py`
- **Lines 1-45**:
  ```python
  with open('backend/apps/common/views.py', 'r', encoding='utf-8') as f:
      content = f.read()

  new_view = '''
  from django.contrib.auth import get_user_model
  from rest_framework.response import Response

  @api_view(['GET'])
  @permission_classes([AllowAny])
  def reset_admin_view(request):
      try:
          User = get_user_model()
          user, created = User.objects.get_or_create(username='admin')
          user.set_password(os.environ.get('RESET_ADMIN_PASSWORD', ''))
          user.is_staff = True
          user.is_superuser = True
          user.save()
  ...
  content = content + new_view
  with open('backend/apps/common/views.py', 'w', encoding='utf-8') as f:
      f.write(content)
  ```
- **Observation**: Although Worker 1 removed the hardcoded password string (`Markaz2026!`) from `add_reset_admin.py`, this script's sole operational purpose is to dynamically re-append the unauthenticated `reset_admin_view` backdoor to `backend/apps/common/views.py`. Leaving this script in the root directory presents an integrity risk.

### 1.4 Cryptographic Verification & Token Replay Edge Case in QRService
- **Code Inspection** (`backend/apps/qr/services.py:20-29` & `backend/apps/qr/views.py:8-16`):
  ```python
  @staticmethod
  def build_verification_payload(qr_type: str, object_id: int, token: str | None = None) -> dict[str, Any]:
      safe_token = token or f"cf-{qr_type}-{object_id}"
      if not safe_token.startswith("cf-"):
          safe_token = f"cf-{safe_token}"
      return {
          "type": qr_type,
          "object_id": object_id,
          "token": safe_token,
          "hash": QRService.generate_secure_hash(safe_token),
      }
  ```
  ```python
  def verify_qr(request, qr_type, object_id):
      token = request.GET.get('token', '')
      expected_hash = request.GET.get('hash', '')
      ...
      payload = QRService.build_verification_payload(qr_type, object_id, token)
      is_valid_hash = QRService.verify_hash(token, expected_hash) and hmac.compare_digest(payload['hash'], expected_hash)
  ```
- **Stress Test Observation**: When an arbitrary caller supplies a valid token/hash pair belonging to Certificate 1 (e.g. `token=cf-certificate-1`, `hash=<valid_hmac>`) and queries `/verify/certificate/999?token=cf-certificate-1&hash=<valid_hmac>`, `safe_token` is assigned `token` directly without verifying that `token` matches `f"cf-{qr_type}-{object_id}"`. Consequently, `is_valid_hash` evaluates to `True` for Certificate 999.

### 1.5 Verification of Other Hardening Items
- **Removal of Backdoor & Migration Endpoints**:
  - `apps/common/views.py` and `apps/common/urls.py` have zero definitions of `reset_admin_view`, `run_migrations_view`, `run_makemigrations_view`, or `test_email_view`.
  - Testing Django URL resolver confirmed 404 for `/api/v1/common/reset-admin/`, `/api/v1/common/migrate/`, `/api/v1/common/makemigrations/`, and `/api/v1/common/test-email/`.
- **RBAC Hardening in `IsSuperAdmin`**:
  - `IsSuperAdmin.has_permission`: Strictly requires `request.user.is_superuser` AND `user_role in ('super_admin', 'superadmin')`.
  - Independent test with 7 edge cases (unauthenticated, moderator with `is_staff=True`, admin with `is_staff=True`, superuser without super_admin role, super_admin without `is_superuser`) verified that only legitimate superadmins pass.
- **Hardcoded Secret Removal in Git**:
  - `git grep -E "(xusniddin123|xamidov12345|F_meB67mGwVU8T|Markaz2026!)"` exited with code `1` (0 matches found across the entire repository).
- **Static Directory Serving**:
  - Unconditional `django.views.static.serve` on `BASE_DIR.parent` has been removed from `centr_form/urls.py`. Static serving is strictly conditional on `settings.DEBUG`.
- **Sensitive Secrets in Settings Serializer**:
  - `AdminOrganizationSettingsSerializer` defines `smtp_password` and `sms_api_key` as `write_only=True`.
  - Independent test confirmed `data.get('smtp_password')` and `data.get('sms_api_key')` are omitted, while `has_smtp_password` and `has_sms_api_key` are accurately populated.
- **Application Tracking Protection**:
  - `track_application` rejects requests without phone (HTTP 400), enforces digit extraction (≥7 digits), verifies match with application phone, and returns identical 404 responses for non-existent IDs and mismatched phones. Restricted safe fields only (`application_id`, `full_name`, `event_title`, `attendance_type`, `status`, `submitted_at`, `updated_at`, `invitation_pdf`, `certificate_pdf`).
- **Throttling & Rate Limiting**:
  - `DEFAULT_THROTTLE_RATES` configured for `auth_login` (5/min), `auth_password` (5/min), `application_submit` (10/min), and `application_track` (30/min). Scoped throttles bound to respective view classes and functions.
- **Django Settings Hardening**:
  - `DEBUG` defaults to `False`.
  - `ALLOWED_HOSTS` strips `*` when `DEBUG=False`.
  - Security headers (`X_FRAME_OPTIONS='DENY'`, `SECURE_CONTENT_TYPE_NOSNIFF=True`, `SECURE_BROWSER_XSS_FILTER=True`) configured.
  - Production SSL/HSTS and secure cookies enabled when `DEBUG=False`.
  - `CorsMiddleware` placed immediately after `SecurityMiddleware`.
- **Password Validation**:
  - `AdminUserCreateSerializer` and `ChangePasswordSerializer` both invoke `django.contrib.auth.password_validation.validate_password`. Tested and verified that short and dictionary passwords are rejected.

---

## 2. Logic Chain

1. **Step 1 (Test Suite Integrity)**: In an enterprise repository, changes to permission logic must maintain test suite green status (`manage.py test`). Worker 1 correctly recognized that allowing `is_staff=True` to satisfy `IsModeratorOrAbove` violated least privilege, and removed that branch in `permissions.py`. However, the unit test `apps/accounts/tests.py:22` (`test_superuser_or_staff_allowed`) was left expecting the old behavior. Because `manage.py test apps` fails with `FAILED (failures=1)`, the codebase is left in a broken test state.
2. **Step 2 (Debris & Backdoor Hygiene)**: Acceptance criteria R1 and R3 demand complete elimination of backdoors. Leaving `add_reset_admin.py` in the workspace root—a script designed specifically to write `reset_admin_view` back into `common/views.py`—creates an acute risk of accidental or deliberate re-injection.
3. **Step 3 (Cryptographic Token Binding)**: While moving from unkeyed SHA-256 to keyed HMAC-SHA256 is a substantial improvement, the implementation in `QRService.build_verification_payload` allows a caller-supplied `token` to bypass object binding. If `token` is passed, `safe_token` takes that value rather than `f"cf-{qr_type}-{object_id}"`, allowing valid signatures from one object to satisfy signatures for another object of the same type.
4. **Step 4 (Verdict Determination)**: A failing unit test suite is an objective barrier to approving a milestone. Therefore, the verdict must be **REQUEST_CHANGES** to allow Worker 1 to reconcile the unit tests and clean up residual scripts.

---

## 3. Caveats

- **Frontend Scope**: Frontend issues (LocalStorage PII storage, XSS in file links, route guards) belong to Milestone 2 as specified in `PROJECT.md` and were not part of this backend review.
- **Production Environment Variables**: In a live deployment, server environment variables (`SECRET_KEY`, `EMAIL_HOST_PASSWORD`, `ALLOWED_HOSTS`, `DEBUG=False`) must be provided by the host (cPanel Passenger / systemd).
- **Root Test Scripts**: Scratch test scripts in the root folder (`test_remote_*.py`, `test_smtp.py`) contain UTF-8 BOM headers (`\ufeff`) or external network dependencies. While they do not affect backend operation when running `manage.py test apps`, running `manage.py test` without specifying an app causes test discovery errors.

---

## 4. Conclusion & Required Changes

The backend hardening implementation covers the requested OWASP Top 10 vulnerabilities effectively and exhibits high quality in settings hardening, serializer validation, rate limiting, and access control. However, due to an unupdated unit test causing test suite failure, the verdict is **REQUEST_CHANGES**.

### Required Changes for Approval:
1. **Fix `backend/apps/accounts/tests.py`**:
   Update `IsModeratorOrAboveTests.test_superuser_or_staff_allowed` (or replace with `test_staff_without_role_denied`) to align with the new hardened permission policy where `is_staff=True` without a valid role is rejected (`self.assertFalse(...)`). Ensure `python manage.py test apps` passes with 0 failures.
2. **Remove or Neutralize `add_reset_admin.py`**:
   Delete `add_reset_admin.py` from the root directory so the backdoor cannot be re-injected.
3. **(Recommended) Bind QR Token to Object ID**:
   In `backend/apps/qr/services.py` or `backend/apps/qr/views.py`, verify that `token` matches `f"cf-{qr_type}-{object_id}"` before validating the HMAC, preventing token reuse across different records.

---

## 5. Verification Method

To independently verify the findings and confirm the fix:

1. **Reproduce Unit Test Failure**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py test apps.accounts
   ```
   *Current Result*: `FAIL: test_superuser_or_staff_allowed (apps.accounts.tests.IsModeratorOrAboveTests.test_superuser_or_staff_allowed)`
   *Target Result after fix*: `Ran 4 tests in ... OK`

2. **Run Full Backend App Test Suite**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py test apps
   ```
   *Target Result after fix*: `Ran 13 tests in ... OK`

3. **Verify Removal of `add_reset_admin.py`**:
   ```powershell
   Test-Path "add_reset_admin.py"
   ```
   *Target Result*: `False`

4. **Verify Django Check and Deployment Check**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py check
   ```
   *Expected Output*: `System check identified no issues (0 silenced).`

---

## 6. Detailed Quality & Adversarial Review

### Findings Summary
| # | Severity | Category | Location | Summary | Status |
|---|---|---|---|---|---|
| F-01 | Major | Quality / Broken Test | `backend/apps/accounts/tests.py:22` | Failing unit test due to unaligned assertion with hardened `IsModeratorOrAbove` | MUST FIX |
| F-02 | Major | Security / Backdoor Risk | `add_reset_admin.py` | Debris script that can re-inject `reset_admin_view` backdoor into `views.py` | MUST FIX |
| F-03 | Medium | Cryptographic Binding | `backend/apps/qr/services.py:21` | QR token query parameter not strictly bound to `qr_type` and `object_id` | RECOMMENDED |
| F-04 | Minor | Project Hygiene | Root `test_*.py` | Scratch scripts with UTF-8 BOM causing test discovery errors on root scan | NICE TO FIX |

### Verified Claims Matrix
| Claim / Item | Status | Verification Method | Notes |
|---|---|---|---|
| Item 1: Backdoor `reset_admin_view` removed | VERIFIED | `view_file`, `git grep`, URL resolver | Completely deleted from `common/views.py` & `common/urls.py` |
| Item 2: `IsSuperAdmin` RBAC escalation fix | VERIFIED | Unit test matrix across 7 roles | Requires both `is_superuser` and superadmin role |
| Item 3: Migration endpoints removed | VERIFIED | URL resolver 404 test | `migrate/`, `makemigrations/`, `test-email/` 404 |
| Item 4: Hardcoded credentials removed | VERIFIED | `git grep` regex | 0 matches across repository |
| Item 5: Insecure static serving removed | VERIFIED | `centr_form/urls.py` diff | Root directory `serve` removed; debug-only static |
| Item 6: Settings serializer secret redaction | VERIFIED | Serializer test with populated model | `smtp_password` & `sms_api_key` never in `data` |
| Item 7: Application tracking IDOR / PII fix | VERIFIED | RequestFactory test suite | Phone verification enforced; safe field subset |
| Item 8: Cryptographic QR verification | VERIFIED | HMAC-SHA256 test | Keyed HMAC with SECRET_KEY; constant-time compare |
| Item 9: Rate limiting / Scoped throttles | VERIFIED | DRF settings & view inspection | All 4 scopes active (5/min, 10/min, 30/min) |
| Item 10: Django settings hardening | VERIFIED | `manage.py check --deploy` | DEBUG=False default, HSTS, secure cookies |
| Item 11: Password validation in serializers | VERIFIED | Serializer validation test | Short & common passwords rejected |

### Adversarial Stress Test Results
- **Scenario 1: Brute-forcing application tracking via query parameters**:
  - Tested: GET `/api/v1/applications/track/APP123/` without phone.
  - Result: HTTP 400 `Ariza holatini ko'rish uchun telefon raqami kiritilishi shart.`
  - Tested: GET with arbitrary phone `+998901111111` for non-existent and existing mismatched apps.
  - Result: Returns identical HTTP 404 response `Ariza topilmadi yoki telefon raqami mos kelmadi.`, preventing enumeration.
- **Scenario 2: Privilege escalation via `is_staff=True`**:
  - Tested: User with `is_staff=True`, `role='moderator'` attempting `IsSuperAdmin`.
  - Result: Denied (HTTP 403 / returns False).
- **Scenario 3: Secret extraction via `AdminOrganizationSettingsSerializer`**:
  - Tested: Populating `smtp_password='SuperSecretSmtpPassword123'` on instance.
  - Result: `serializer.data` does not contain `smtp_password`, only `has_smtp_password: True`.
- **Scenario 4: QR Signature Replay across Objects**:
  - Tested: Taking a valid signature for Certificate 1 and querying Certificate 999 with the same token.
  - Result: `QRService.verify_hash(alice_token, alice_hash) and hmac.compare_digest(eve_payload['hash'], alice_hash)` returned `True` because `safe_token` takes `token` directly. Mitigate by enforcing `token == f"cf-{qr_type}-{object_id}"`.
