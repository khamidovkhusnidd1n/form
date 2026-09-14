# Milestone 1 Challenger 1 Report: Adversarial Verification & Stress Testing

**Agent**: Challenger 1 (`teamwork_preview_challenger_m1_1`)  
**Assignment**: Adversarially challenge Milestone 1 Backend Hardening implementations (IsSuperAdmin, QR HMAC, Tracking IDOR, Rate Limiting)  
**Date**: 2026-09-04  
**Verdict**: **REJECT**  

---

## 1. Observation

Direct observations obtained through executing empirical tests, inspection of source code, and reproduction harnesses:

### 1.1 Observation 1: Total Rate Limiting Bypass on Sensitive Function-Based Views (`track_application`, `change_password_view`)
- **File Paths**: `backend/apps/applications/views.py:61-112`, `backend/apps/accounts/views.py:72-88`
- **Code in `backend/apps/applications/views.py`**:
  ```python
  @api_view(['GET', 'POST'])
  @permission_classes([permissions.AllowAny])
  @throttle_classes([ScopedRateThrottle])
  def track_application(request, application_id):
      ...
  track_application.throttle_scope = 'application_track'
  ```
- **Code in `backend/apps/accounts/views.py`**:
  ```python
  @api_view(['POST'])
  @permission_classes([permissions.IsAuthenticated])
  @throttle_classes([ScopedRateThrottle])
  def change_password_view(request):
      ...
  change_password_view.throttle_scope = 'auth_password'
  ```
- **Empirical Execution & Log**:
  ```powershell
  .venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIRequestFactory; from apps.applications.views import track_application; factory = APIRequestFactory(); 
  for i in range(150):
      req = factory.get('/api/v1/applications/track/TEST/?phone=998901234567', REMOTE_ADDR='1.2.3.4')
      resp = track_application(req, 'TEST')
      if resp.status_code == 429: break
  else: print('ALL 150 requests ALLOWED without any throttling!')"
  ```
  **Result**:
  `ALL 150 requests ALLOWED without any throttling!`
  Executing 150 requests to `change_password_view` similarly allowed all 150 requests with 0 throttled.
- **Diagnostic Inspection**:
  ```powershell
  .venv\Scripts\python.exe -c "... from apps.applications.views import track_application; print('track_application.throttle_scope:', getattr(track_application, 'throttle_scope', None)); print('view_class instance throttle_scope:', getattr(track_application.view_class(), 'throttle_scope', None))"
  ```
  **Output**:
  `track_application.throttle_scope: application_track`  
  `view_class instance throttle_scope: None`  
  DRF `@api_view` creates an inner class `WrappedAPIView` and builds the view closure. Assigning `func.throttle_scope = ...` after the decorator leaves `view_class.throttle_scope` as `None`. Inside `ScopedRateThrottle.allow_request(request, view)`, `getattr(view, 'throttle_scope', None)` returns `None`, causing `ScopedRateThrottle` to return `True` without checking or recording hits. Because `@throttle_classes([ScopedRateThrottle])` overrides the default throttle classes, **all rate limiting is removed entirely**.

---

### 1.2 Observation 2: Cryptographic Signature Binding Flaw in QR Verification (Cross-Object Replay)
- **File Paths**: `backend/apps/qr/services.py:20-30`, `backend/apps/qr/views.py:8-29`
- **Code in `backend/apps/qr/services.py`**:
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
- **Code in `backend/apps/qr/views.py`**:
  ```python
  def verify_qr(request, qr_type, object_id):
      token = request.GET.get('token', '')
      expected_hash = request.GET.get('hash', '')
      ...
      payload = QRService.build_verification_payload(qr_type, object_id, token)
      is_valid_hash = QRService.verify_hash(token, expected_hash) and hmac.compare_digest(payload['hash'], expected_hash)
      ...
      if qr_type == 'certificate':
          exists = Certificate.objects.filter(id=object_id).exists()
      return JsonResponse({'valid': exists, 'type': qr_type, 'object_id': object_id})
  ```
- **Empirical Execution & Log**:
  ```powershell
  .venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.qr.services import QRService; p1 = QRService.build_verification_payload('certificate', 1); p2 = QRService.build_verification_payload('certificate', 999, token=p1['token']); print('Hashes equal:', p1['hash'] == p2['hash']); print('Payload 2 hash == expected_hash:', QRService.verify_hash(p1['token'], p1['hash']) and p2['hash'] == p1['hash'])"
  ```
  **Output**:
  `Hashes equal: True`  
  `Payload 2 hash == expected_hash: True`  
  When `token` is supplied by the caller in `request.GET.get('token')`, `build_verification_payload` sets `safe_token = token` and computes `hash = HMAC(token)`. It completely ignores `object_id` and `qr_type` in the HMAC generation. Therefore, an attacker possessing ANY valid certificate or invitation QR code (token + hash) can verify ANY other certificate or invitation in the entire database simply by changing `object_id` in the URL.

---

### 1.3 Observation 3: IDOR Bypass via Empty or Malformed Database Phone Numbers
- **File Path**: `backend/apps/applications/views.py:87-93`
- **Code in `backend/apps/applications/views.py`**:
  ```python
  clean_app_phone = ''.join(c for c in application.phone if c.isdigit())
  if not (clean_req_phone == clean_app_phone or clean_app_phone.endswith(clean_req_phone) or clean_req_phone.endswith(clean_app_phone)):
      return Response(
          {'detail': "Ariza topilmadi yoki telefon raqami mos kelmadi."},
          status=status.HTTP_404_NOT_FOUND
      )
  ```
- **Empirical Execution & Log**:
  ```powershell
  .venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.applications.views import track_application; from rest_framework.test import APIRequestFactory; from unittest.mock import Mock, patch; from apps.applications.models import Application; factory = APIRequestFactory(); 
  mock_app = Mock(spec=Application, application_id='CF-2026-999999', phone='N/A', full_name='Secret Victim', attendance_type='offline', status='approved', submitted_at='2026-01-01', updated_at='2026-01-01', invitation_pdf=None, certificate_pdf=None, event=Mock(title='Secret Event')); 
  with patch('apps.applications.models.Application.objects.select_related') as mock_sr:
      mock_sr.return_value.get.return_value = mock_app
      req = factory.get('/api/v1/applications/track/CF-2026-999999/?phone=1234567')
      resp = track_application(req, 'CF-2026-999999')
      print('Status:', resp.status_code)
      print('Data:', resp.data)
  "
  ```
  **Output**:
  `Status: 200`  
  `Data: {'application_id': 'CF-2026-999999', 'full_name': 'Secret Victim', 'event_title': 'Secret Event', 'attendance_type': 'offline', 'status': 'approved', 'submitted_at': '2026-01-01', 'updated_at': '2026-01-01', 'invitation_pdf': None, 'certificate_pdf': None}`  
  When an applicant record in the database has non-digit text in the `phone` field (e.g., `"N/A"`, `"-"`, `"yo'q"`, or empty), `clean_app_phone` is `""`. In Python, `"1234567".endswith("")` evaluates to `True`. Because the view does not check `len(clean_app_phone) >= 7` before testing `endswith`, ANY arbitrary 7-digit number bypasses the check and returns the applicant's record. Combined with the total lack of rate limiting (Observation 1), enumeration is unconstrained.

---

### 1.4 Observation 4: Existing Django Test Suite Regression
- **File Path**: `backend/apps/accounts/tests.py:15-23`
- **Command Executed**:
  ```powershell
  backend\.venv\Scripts\python.exe backend\manage.py test
  ```
- **Verbatim Failure Output**:
  ```
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
- **Cause**: Worker 1 modified `IsModeratorOrAbove` in `backend/apps/accounts/permissions.py` by removing `is_staff` check, but failed to run and update the existing unit tests in `apps/accounts/tests.py`.

---

### 1.5 Observation 5: Privilege Escalation on `AdminOrganizationSettingsView` via `permissions.IsAdminUser`
- **File Path**: `backend/apps/settings_app/views.py:13-16`
- **Code**:
  ```python
  class AdminOrganizationSettingsView(generics.RetrieveUpdateAPIView):
      serializer_class = AdminOrganizationSettingsSerializer
      permission_classes = [permissions.IsAdminUser]
  ```
- **Code in `backend/apps/accounts/models.py:33`**:
  ```python
  is_staff = models.BooleanField(default=True)
  ```
- **Empirical Execution & Log**:
  ```powershell
  .venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.permissions import IsAdminUser; from unittest.mock import Mock; perm = IsAdminUser(); mod_user = Mock(is_authenticated=True, is_staff=True, role='moderator'); req = Mock(user=mod_user); print('IsAdminUser allows moderator with is_staff=True:', perm.has_permission(req, None))"
  ```
  **Output**:
  `IsAdminUser allows moderator with is_staff=True: True`  
  DRF's `IsAdminUser` only checks `bool(request.user and request.user.is_staff)`. Since all `AdminUser` accounts default to `is_staff=True`, regular moderators can access `/api/v1/settings/admin/` and overwrite organization-level configurations including SMTP credentials (`smtp_password`) and SMS API keys (`sms_api_key`).

---

### 1.6 Observation 6: Super Admin Lockout on Accounts Created via Admin API
- **File Path**: `backend/apps/accounts/serializers.py:44-49`, `backend/apps/accounts/permissions.py:12-14`
- **Code in `backend/apps/accounts/serializers.py`**:
  ```python
  def create(self, validated_data):
      password = validated_data.pop('password')
      user = AdminUser(**validated_data)
      user.set_password(password)
      user.save()
      return user
  ```
- **Code in `backend/apps/accounts/permissions.py`**:
  ```python
  user_role = getattr(request.user, 'role', None)
  is_superadmin_role = user_role in ('super_admin', 'superadmin')
  return bool(is_superadmin_role and request.user.is_superuser)
  ```
- **Empirical Execution & Log**:
  ```powershell
  .venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.accounts.serializers import AdminUserCreateSerializer; from apps.accounts.permissions import IsSuperAdmin; from unittest.mock import Mock; s = AdminUserCreateSerializer(data={'username': 'super2', 'email': 'super2@test.uz', 'full_name': 'Super 2', 'role': 'super_admin', 'password': 'SuperPassword123!'}); s.is_valid(); val = dict(s.validated_data); val.pop('password'); from apps.accounts.models import AdminUser; u = AdminUser(**val); print('IsSuperAdmin allows u:', IsSuperAdmin().has_permission(Mock(user=u), None))"
  ```
  **Output**:
  `IsSuperAdmin allows u: False`  
  When an existing superadmin creates a new superadmin through the API, `AdminUserCreateSerializer.create` does not set `is_superuser = True`. The new user has `role = 'super_admin'` but `is_superuser = False`, locking them out of user management endpoints.

---

### 1.7 Observation 7: Comprehensive Adversarial Test Suite Execution
- We authored and ran `backend/tests/test_adversarial_m1_1.py` containing 24 automated test cases covering:
  - `IsSuperAdmin` privilege escalation matrix (10 tests)
  - QR HMAC verification, forgery, and replay (4 tests)
  - Tracking IDOR, phone verification, and PII leakage (6 tests)
  - Rate limiting behavior on FBV vs CBV (3 tests)
  - Access control on settings view (1 test)
- **Command Executed**:
  ```powershell
  backend\.venv\Scripts\python.exe backend\manage.py test tests.test_adversarial_m1_1
  ```
- **Output**:
  ```
  Ran 24 tests in 1.647s
  OK
  ```
  All 24 test cases pass, confirming both the valid hardening boundaries and reproducing the critical security gaps.

---

## 2. Logic Chain

1. **Broken Throttling**:
   - Observation 1 demonstrates that DRF's `ScopedRateThrottle` on `@api_view` fails to resolve `throttle_scope` because setting `func.throttle_scope` on the closure does not attach it to `WrappedAPIView`.
   - Because `view.throttle_scope` is `None`, `ScopedRateThrottle.allow_request` unconditionally returns `True`.
   - Because `@throttle_classes([ScopedRateThrottle])` overrides the default throttle classes, `AnonRateThrottle` and `UserRateThrottle` are bypassed as well.
   - Consequently, both `track_application` and `change_password_view` have zero rate limiting, allowing unlimited brute force and password stuffing attacks.

2. **Cryptographic Signature Forgery / Cross-Object Replay**:
   - Observation 2 demonstrates that `QRService.build_verification_payload` sets `safe_token = token` whenever `token` is supplied in the request.
   - The HMAC-SHA256 signature is calculated solely on `safe_token`.
   - Because `verify_qr` passes `request.GET.get('token')` to `build_verification_payload`, the signature does not bind `object_id` or `qr_type`.
   - Any valid QR code for any certificate/invitation can be replayed to validate any other certificate/invitation in the database.

3. **IDOR & Data Leakage**:
   - Observation 3 shows that `clean_req_phone.endswith(clean_app_phone)` evaluates `"1234567".endswith("")` to `True` when an application has no digits stored in `application.phone`.
   - This allows unauthenticated users to retrieve applicant personal data (full name, event title, attendance type, and generated PDFs) using any 7-digit number.
   - Combined with unthrottled requests (Logic Step 1), attackers can systematically enumerate and scrape applications.

4. **Broken Test Suite**:
   - Observation 4 shows that running `manage.py test` fails with 1 failure in `apps.accounts.tests.IsModeratorOrAboveTests`.
   - A core software engineering and CI/CD acceptance criterion is that existing unit tests must pass.

5. **Privilege Escalation & Account Lockout**:
   - Observation 5 shows `AdminOrganizationSettingsView` permits `Role.MODERATOR` users to read/update organization settings due to DRF `IsAdminUser` relying on default `is_staff=True`.
   - Observation 6 shows `AdminUserCreateSerializer` fails to set `is_superuser=True` for users with `role='super_admin'`, locking newly created superadmins out of user management.

---

## 3. Caveats

1. **CBV Rate Limiting**: Class-based views (`LoginView` at 5/min, `SubmitApplicationView` at 10/min) were verified to throttle properly. The rate limiting failure is specific to function-based views decorated with `@api_view`.
2. **Settings Serializer Write-Only Fields**: Worker 1 correctly marked `smtp_password` and `sms_api_key` as `write_only=True` in `AdminOrganizationSettingsSerializer`. The remaining issue on that endpoint is authorization (`IsAdminUser` vs `IsAdminOrAbove` or `IsSuperAdmin`).
3. **Frontend Scope**: Frontend issues (LocalStorage PII, XSS in link/iframe rendering, CSV injection) are scoped to Milestone 2 and were not evaluated in this backend review.

---

## 4. Conclusion

**Verdict: REJECT**

Milestone 1 Backend Hardening cannot be approved due to critical security defects and an active test suite regression:
1. **Critical Vulnerability**: Total rate limiting failure on `track_application` and `change_password_view` (0 requests throttled out of 150).
2. **Critical Vulnerability**: Cross-object HMAC replay on QR verification allowing arbitrary certificate/invitation validation.
3. **High Vulnerability**: IDOR bypass on `track_application` for database records with empty or non-digit phone numbers.
4. **High Vulnerability**: Test suite regression (`apps.accounts.tests` failing).
5. **Medium Vulnerability**: Privilege escalation on `AdminOrganizationSettingsView` allowing moderators to overwrite organization secrets.
6. **Medium Defect**: Lockout of superadmin accounts created through `AdminUserCreateSerializer`.

The worker must resolve these findings before Milestone 1 can be accepted.

---

## 5. Verification Method

To independently reproduce and verify all findings:

1. **Run Full Project Test Suite (Demonstrates Existing Test Failure)**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py test
   ```
   *Result*: `FAILED (failures=1)` on `apps.accounts.tests.IsModeratorOrAboveTests.test_superuser_or_staff_allowed`.

2. **Run Challenger Adversarial Test Suite (Demonstrates All 24 Vulnerability Proofs & Boundaries)**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py test tests.test_adversarial_m1_1
   ```
   *Result*: `Ran 24 tests ... OK` (verifies tests reproducing QR token replay, tracking IDOR bypass, FBV throttling failures, and permission matrix).

3. **Verify Function-Based View Rate Limiting Failure Directly**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from rest_framework.test import APIRequestFactory; from apps.applications.views import track_application; factory = APIRequestFactory(); print([track_application(factory.get('/api/v1/applications/track/T/?phone=998901234567'), 'T').status_code for _ in range(40)].count(429))"
   ```
   *Expected if hardened*: > 0 (should return 429 after 30 requests).  
   *Actual observed*: `0` (zero 429 responses, all requests allowed).

4. **Verify QR Token Replay Across Distinct Objects**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.qr.services import QRService; p1 = QRService.build_verification_payload('certificate', 1); p2 = QRService.build_verification_payload('certificate', 999, token=p1['token']); print('Exploitable replay:', p1['hash'] == p2['hash'])"
   ```
   *Expected if hardened*: `False`.  
   *Actual observed*: `True`.
