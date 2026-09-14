# Milestone 1: Forensic Integrity Audit Report

**Work Product**: Milestone 1 Backend Hardening (Items 1–11)  
**Auditor**: Forensic Auditor (`teamwork_preview_auditor_m1`)  
**Assignment Reference**: `DISPATCH.md`  
**Integrity Mode**: `development` (per `ORIGINAL_REQUEST.md`)  
**Verdict**: **INTEGRITY VIOLATION**  
**Date**: 2026-09-04  

---

## Forensic Audit Summary

| Check # | Item Audited | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| 1 | Remove Superadmin Backdoor (`reset_admin_view`) | Endpoint removed, returns 404 | 404 Not Found, 0 references in `backend/` | **PASS** |
| 2 | Fix `IsSuperAdmin` RBAC Privilege Escalation | Requires role + is_superuser, rejects is_staff alone | Verified with test matrix: mod denied, super allowed | **PASS** |
| 3 | Remove Unauthenticated Migration Endpoints | Endpoints removed, returns 404 | `migrate/`, `makemigrations/`, `test-email/` return 404 | **PASS** |
| 4 | Plaintext Credential Sanitization | No static passwords in code/scripts | 0 matches in code across workspace outside `.agents/` logs | **PASS** |
| 5 | Remove Insecure Static Directory Serving | Path traversal blocked, no `serve` | `django.views.static.serve` removed, traversal blocked | **PASS** |
| 6 | Settings Serializer Secret Redaction | `smtp_password` & `sms_api_key` write-only | Output excludes secrets, exposes safe booleans | **PASS** |
| 7 | Application Tracking IDOR & PII Protection | Requires phone match, minimizes PII | Reject mismatch/empty phone, strips comments/docs | **PASS** |
| 8 | QR Verification Cryptographic Hardening | HMAC-SHA256 with `SECRET_KEY`, checks DB | 64-hex HMAC validated, plain SHA256 rejected, DB verified | **PASS** |
| 9 | Rate Limiting & Scoped Throttles | Throttles requests across all 4 scoped views | CBVs throttle correctly; **FBVs completely unthrottled** | **FAIL** |
| 10 | Harden Django Settings & Deploy Check | `check --deploy` with `DEBUG=False` has 0 warnings | 0 issues reported by Django system and deploy check | **PASS** |
| 11 | Strong Password Validation in Serializers | Common & short passwords rejected | Common pass rejected with Django validation error | **PASS** |
| 12 | Project Test Suite Execution | `python manage.py test apps` passes | **1 of 13 tests FAILED** (`IsModeratorOrAboveTests`) | **FAIL** |

---

## 1. Observation

### 1.1 Inactive Rate Limiting Wiring on Function-Based Views (Fix 9 Failure)
- **Files**: `backend/apps/accounts/views.py:87`, `backend/apps/applications/views.py:112`
- **Verbatim Code**:
  In `backend/apps/accounts/views.py`:
  ```python
  @api_view(['POST'])
  @permission_classes([permissions.IsAuthenticated])
  @throttle_classes([ScopedRateThrottle])
  def change_password_view(request):
      ...
  change_password_view.throttle_scope = 'auth_password'
  ```
  In `backend/apps/applications/views.py`:
  ```python
  @api_view(['GET', 'POST'])
  @permission_classes([permissions.AllowAny])
  @throttle_classes([ScopedRateThrottle])
  def track_application(request, application_id):
      ...
  track_application.throttle_scope = 'application_track'
  ```
- **Empirical Execution & Result**:
  An independent test was executed sending 35 GET requests to `/api/v1/applications/track/APP123/` (rate limit configured as `30/minute`) and 10 POST requests to `/api/v1/auth/change-password/` (rate limit configured as `5/minute`).
  ```powershell
  backend\.venv\Scripts\python.exe -c "import os, sys, django; sys.path.append('backend'); os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIClient
  client = APIClient()
  for i in range(35):
      res = client.get('/api/v1/applications/track/APP123/?phone=998901234567')
      if res.status_code == 429:
          print(f'Throttled at request {i+1}')
          break
  else:
      print('WARNING: 35 requests went through without 429!')
  "
  ```
  **Raw Output**:
  ```
  WARNING: 35 requests went through without 429!
  ```
  And for `change_password_view`:
  ```powershell
  backend\.venv\Scripts\python.exe -c "import os, sys, django; sys.path.append('backend'); os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIClient; from apps.accounts.models import AdminUser
  client = APIClient()
  user = AdminUser.objects.filter(is_active=True).first()
  client.force_authenticate(user=user)
  for i in range(10):
      res = client.post('/api/v1/auth/change-password/', data={'old_password': 'wrong', 'new_password': 'wrong'})
      if res.status_code == 429:
          print(f'Throttled at request {i+1}')
          break
  else:
      print('WARNING: 10 change password requests went through without 429!')
  "
  ```
  **Raw Output**:
  ```
  WARNING: 10 change password requests went through without 429!
  ```
- **Mechanism**: DRF's `@api_view` wraps the view function in an internal `WrappedAPIView` class (`func.cls`). When handling requests, DRF invokes `ScopedRateThrottle.allow_request(request, view)` where `view` is an instance of `WrappedAPIView`. Setting `func.throttle_scope = '...'` sets the property on the outer wrapper function, NOT on `WrappedAPIView` (`func.cls`). `ScopedRateThrottle` evaluates `getattr(view, 'throttle_scope', None)` which returns `None`, and by DRF design, if `throttle_scope` is `None`, the throttle always allows all requests.
- **Proof of Fix**: Setting `change_password_view.cls.throttle_scope = 'auth_password'` immediately triggers HTTP 429 at request 6:
  ```
  Too Many Requests: /api/v1/auth/change-password/
  Setting .cls.throttle_scope worked! Throttled at request 6!
  ```

---

### 1.2 Test Suite Failure in `apps/accounts/tests.py` (Check 12 Failure)
- **Command**:
  ```powershell
  backend\.venv\Scripts\python.exe backend\manage.py test apps
  ```
- **Raw Tool Output**:
  ```
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
  Ran 13 tests in 0.010s

  FAILED (failures=1)
  ```
- **Mechanism**: In `backend/apps/accounts/permissions.py:27-35`, `IsModeratorOrAbove.has_permission` was modified during RBAC hardening to remove `or getattr(request.user, 'is_staff', False)`. However, the unit test `test_superuser_or_staff_allowed` in `backend/apps/accounts/tests.py:20-22` specifically tests that a user with `is_superuser = False` and `is_staff = True` (without an explicit role) is granted permission. Because the test assertion was not updated or coordinated, the test fails.

---

### 1.3 Observations on Genuinely Implemented Passing Fixes
- **Fix 1 (Superadmin Backdoor Removal)**:
  `git grep -i "reset_admin" backend/` returns exit code 1 (0 matches). `GET /api/v1/common/reset-admin/` returns 404 Not Found.
- **Fix 2 (`IsSuperAdmin` RBAC Enforcement)**:
  Empirically verified with role matrix:
  - Anon: `False`
  - Moderator (`is_staff=True, is_superuser=False, role='moderator'`): `False`
  - Admin (`is_staff=True, is_superuser=False, role='admin'`): `False`
  - Superuser flag without role: `False`
  - Valid Superadmin (`role='super_admin', is_superuser=True`): `True`
- **Fix 3 (Database Migration Endpoints Removal)**:
  `GET /api/v1/common/migrate/` -> 404
  `GET /api/v1/common/makemigrations/` -> 404
  `GET /api/v1/common/test-email/` -> 404
- **Fix 4 (Credential Sanitization)**:
  `git grep --untracked -E "(xusniddin123|xamidov12345|F_meB67mGwVU8T|Markaz2026!)" -- ":!.agents/*"` returns exit code 1 (0 matches in all workspace files outside `.agents/` audit logs).
- **Fix 5 (Static File Directory Serving Removal)**:
  `serve` view removed from `backend/centr_form/urls.py`. Static and media directories are only mounted when `settings.DEBUG == True`. Traversal attempts return 400 Disallowed Host when `DEBUG=False`.
- **Fix 6 (Settings Serializer Secret Redaction)**:
  Testing `AdminOrganizationSettingsSerializer` with real model instance:
  - `smtp_password in data`: `False`
  - `sms_api_key in data`: `False`
  - `has_smtp_password`: `True`
  - `has_sms_api_key`: `True`
- **Fix 7 (Application Tracking IDOR & PII Protection)**:
  - Missing phone: 400 Bad Request
  - Short phone (< 7 digits): 400 Bad Request
  - Non-existent ID: 404 Not Found
  - Phone mismatch: 404 Not Found (same error detail as non-existent to avoid enumeration)
  - Phone match: 200 OK with sanitized safe fields (`application_id`, `attendance_type`, `certificate_pdf`, `event_title`, `full_name`, `invitation_pdf`, `status`, `submitted_at`, `updated_at`). `admin_comment` and `passport_copy` leaked: `False`.
- **Fix 8 (QR Verification Cryptographic Hardening)**:
  - HMAC hash length: 64 characters (HMAC-SHA256).
  - Valid token + hash: `True`.
  - Corrupted token/hash: `False`.
  - Insecure plain SHA-256: `False`.
  - Non-existent DB object: returns `valid: False`.
  - Invalid hash HTTP response: 400 Bad Request with `detail: 'Yaroqsiz imzo'`.
- **Fix 10 (Settings & Deployment Hardening)**:
  - `backend\.venv\Scripts\python.exe backend\manage.py check` -> `0 issues (0 silenced)`.
  - `check --deploy` with `DEBUG=False` -> `0 issues (0 silenced)`.
- **Fix 11 (Password Validation in Serializers)**:
  - Common password `password`: rejected with `"This password is too common."`.
  - Short password `123`: rejected with `"Ensure this field has at least 8 characters."`.
  - Strong password `X7#k9P@q!zW8$2mN`: accepted (`is_valid() == True`).

---

## 2. Logic Chain

1. **Premise 1 (Mission Directive)**: DISPATCH.md mandates: "2. Verify all 11 backend security fixes are genuinely wired and active in the codebase."
2. **Premise 2 (Fix 9 Inactivity)**: Observation 1.1 proves that `track_application` allowed 35 requests through without throttling, and `change_password_view` allowed 10 requests through without throttling. Because `throttle_scope` was bound to the function wrapper instead of `view_func.cls.throttle_scope`, DRF's `ScopedRateThrottle` reads `None` and completely disables throttling at runtime. This creates a non-functioning facade: the code appears to have throttling configured, but in reality, no rate limiting is enforced.
3. **Premise 3 (Integrity Protocol)**: Under Forensic Verification Procedure (Phase 2, Step 4), "The build must succeed and tests must execute — a project that doesn't build or whose tests don't run is automatically flagged." Observation 1.2 proves that `backend/manage.py test apps` fails with `FAIL: test_superuser_or_staff_allowed`.
4. **Premise 4 (Verdict Requirement)**: The protocol instructs: "If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."
5. **Deductive Conclusion**: Because Fix 9 is inactive on two critical endpoints and the test suite has an active assertion failure, the work product cannot be certified as clean and must be rejected with verdict **INTEGRITY VIOLATION**.

---

## 3. Caveats

1. **No Malicious Intent**: There is no evidence of deliberate cheating, mock test results, or hidden backdoors. The worker wrote genuine implementation code. The rate limiting failure is a subtle DRF framework binding issue where `@api_view` encapsulates views in `cls`.
2. **Class-Based Views Function Correctly**: Both `LoginView` and `SubmitApplicationView` are class-based views and throttle correctly at 5/minute and 10/minute respectively. Only the two function-based views are affected.
3. **Remediation is Minimal**: The fixes required to achieve a CLEAN verdict are small and well-scoped:
   - In `backend/apps/accounts/views.py`: change `change_password_view.throttle_scope = 'auth_password'` to `change_password_view.cls.throttle_scope = 'auth_password'`.
   - In `backend/apps/applications/views.py`: change `track_application.throttle_scope = 'application_track'` to `track_application.cls.throttle_scope = 'application_track'`.
   - In `backend/apps/accounts/tests.py`: update `test_superuser_or_staff_allowed` to reflect that staff status without a valid role or superuser flag no longer grants moderator access.

---

## 4. Conclusion

The Milestone 1 work product contains high-quality implementations for 9 out of 11 items, successfully expunges all hardcoded credentials from the repository, and eliminates major vulnerabilities (the `reset_admin` backdoor, insecure static file serving, IDOR PII leakage, and unkeyed QR hashing).

However, because:
1. Rate limiting on `track_application` and `change_password_view` is **inactive in runtime execution** due to improper attribute binding on DRF `@api_view` wrappers, and
2. The project's unit test suite (`manage.py test apps`) has a **failing test** (`test_superuser_or_staff_allowed`),

the work product fails the empirical verification criteria.

**Verdict**: **INTEGRITY VIOLATION** (Work product rejected pending remediation of Fix 9 and test suite).

---

## 5. Verification Method

To reproduce the findings independently:

1. **Reproduce Inactive Rate Limiting on `track_application`**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, sys, django; sys.path.append('backend'); os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIClient; client = APIClient(); [print(i+1, client.get('/api/v1/applications/track/APP123/?phone=998901234567').status_code) for i in range(35)]"
   ```
   *Expected*: Should return 429 after 30 requests.  
   *Actual*: All 35 requests return 404 (not throttled).

2. **Reproduce Inactive Rate Limiting on `change_password_view`**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, sys, django; sys.path.append('backend'); os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIClient; from apps.accounts.models import AdminUser; client = APIClient(); client.force_authenticate(user=AdminUser.objects.filter(is_active=True).first()); [print(i+1, client.post('/api/v1/auth/change-password/', data={'old_password':'x','new_password':'y'}).status_code) for i in range(10)]"
   ```
   *Expected*: Should return 429 after 5 requests.  
   *Actual*: All 10 requests return 400 (not throttled).

3. **Reproduce Test Suite Failure**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py test apps
   ```
   *Actual*: `FAIL: test_superuser_or_staff_allowed (apps.accounts.tests.IsModeratorOrAboveTests.test_superuser_or_staff_allowed)`.
