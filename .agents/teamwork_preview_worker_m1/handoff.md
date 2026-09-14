# Milestone 1: Backend Security Hardening Handoff Report

**Agent**: Worker 1 (`teamwork_preview_worker_m1`)  
**Assignment**: Milestone 1 - Backend Security Hardening (Fixes 1–11)  
**Status**: Hard Handoff — Complete  
**Date**: 2026-09-04  

---

## 1. Observation

A full implementation of the 11 backend security hardening fixes was performed across `backend/` and utility scripts. Below are the exact file paths, line numbers, and verbatim before/after code comparisons for each implemented fix:

### 1.1 Fix 1: Remove Superadmin Backdoor (`reset_admin_view`)
- **Files Modified**: `backend/apps/common/views.py`, `backend/apps/common/urls.py`
- **Before** (`backend/apps/common/views.py:240-259`):
  ```python
  @api_view(['GET'])
  @permission_classes([AllowAny])
  def reset_admin_view(request):
      try:
          User = get_user_model()
          user, created = User.objects.get_or_create(username='admin')
          user.set_password('Markaz2026!')
          user.is_staff = True
          user.is_superuser = True
          user.save()
          return Response({
              "status": "SUCCESS",
              "message": "Muvaffaqiyatli! Login: admin, Parol: Markaz2026!"
          })
      ...
  ```
- **Before** (`backend/apps/common/urls.py:20`):
  ```python
  path('reset-admin/', views.reset_admin_view, name='reset-admin'),
  ```
- **After**: The view function `reset_admin_view` and the route `path('reset-admin/', ...)` have been completely deleted from both files.

---

### 1.2 Fix 2: Fix `IsSuperAdmin` RBAC Privilege Escalation
- **File Modified**: `backend/apps/accounts/permissions.py:4-13`
- **Before**:
  ```python
  class IsSuperAdmin(BasePermission):
      def has_permission(self, request, view):
          if not request.user.is_authenticated:
              return False
          return (
              request.user.is_superuser or
              request.user.is_staff or
              getattr(request.user, 'role', None) == 'super_admin'
          )
  ```
- **After**:
  ```python
  class IsSuperAdmin(BasePermission):
      """
      Strictly grant access to users with role super_admin / superadmin AND is_superuser flag.
      Does NOT rely on is_staff (because regular moderators have is_staff=True by default).
      """
      def has_permission(self, request, view):
          if not request.user or not request.user.is_authenticated:
              return False
          user_role = getattr(request.user, 'role', None)
          is_superadmin_role = user_role in ('super_admin', 'superadmin')
          return bool(is_superadmin_role and request.user.is_superuser)
  ```

---

### 1.3 Fix 3: Remove Unauthenticated Migration Endpoints
- **Files Modified**: `backend/apps/common/views.py:152-236`, `backend/apps/common/urls.py:17-19`
- **Before** (`backend/apps/common/views.py:152-191`):
  ```python
  @require_http_methods(["GET"])
  def run_migrations_view(request):
      call_command('migrate', interactive=False, stdout=out)
      ...
  @require_http_methods(["GET"])
  def run_makemigrations_view(request):
      call_command('makemigrations', interactive=False, stdout=out)
      ...
  @api_view(['GET'])
  @permission_classes([AllowAny])
  def test_email_view(request):
      ...
  ```
- **Before** (`backend/apps/common/urls.py:17-19`):
  ```python
  path('migrate/', views.run_migrations_view, name='run-migrations'),
  path('makemigrations/', views.run_makemigrations_view, name='run-makemigrations'),
  path('test-email/', views.test_email_view, name='test_email'),
  ```
- **After**: `run_migrations_view`, `run_makemigrations_view`, `test_email_view` and their corresponding routes have been completely removed. Management commands can now only be executed via the CLI.

---

### 1.4 Fix 4: Remove Hardcoded Plaintext Credentials in Scripts
- **Files Modified**:
  - `backend/create_admin.py`
  - `backend/reset_pass.py`
  - `test_smtp.py`
  - `test_remote_login.py`
  - `test_remote_large.py`
  - `fix_settings.py`
  - `fix_settings_secure.py`
  - `add_reset_admin.py`
  - All test scripts (`create_faqs.py`, `recreate_faqs.py`, `test_dashboard.py`, `test_remote_*.py`, `test_flow.py`, `test_django_mail.py`, `test_send_user.py`)
- **Before** (`backend/create_admin.py:12`):
  ```python
  user = AdminUser.objects.create_superuser(username='xusniddin', email='admin@xusniddin.uz', password='xusniddin123', full_name='Xusniddin Xamidov')
  ```
- **After** (`backend/create_admin.py`):
  ```python
  username = os.environ.get('ADMIN_USERNAME', 'admin')
  email = os.environ.get('ADMIN_EMAIL', 'admin@uzbamalaka.uz')
  full_name = os.environ.get('ADMIN_FULL_NAME', 'Administrator')
  password = os.environ.get('ADMIN_PASSWORD') or secrets.token_urlsafe(16)
  ```
- **Before** (`backend/reset_pass.py:14`):
  ```python
  user.set_password('xamidov12345')
  ```
- **After** (`backend/reset_pass.py`):
  ```python
  username = os.environ.get('RESET_USERNAME', 'admin')
  password = os.environ.get('RESET_PASSWORD') or secrets.token_urlsafe(16)
  user.set_password(password)
  ```
- **Before** (`test_smtp.py:6`):
  ```python
  password = "F_meB67mGwVU8T"
  ```
- **After** (`test_smtp.py`):
  ```python
  password = os.environ.get("EMAIL_HOST_PASSWORD", "")
  ```
- **Before** (`test_remote_login.py:8`):
  ```python
  "password": "Markaz2026!"
  ```
- **After** (`test_remote_login.py`):
  ```python
  password = os.environ.get('API_PASSWORD', '')
  ```
- **Result**: `git grep -E "(xusniddin123|xamidov12345|F_meB67mGwVU8T|Markaz2026!)"` returns 0 matches across the repository.

---

### 1.5 Fix 5: Remove Insecure Static Directory Serving
- **File Modified**: `backend/centr_form/urls.py:15-26`
- **Before**:
  ```python
  from django.views.static import serve

  urlpatterns += [
      re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
      re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, '..', 'assets')}),
      re_path(r'^(?P<path>.*\.(png|jpg|jpeg|gif|ico|svg|webp|js|css|woff|woff2|ttf|eot))$', serve, {'document_root': os.path.join(settings.BASE_DIR, '..')}),
      re_path(r'^(?!api/|media/|static/).*$', react_app_view),
  ]
  ```
- **After**:
  ```python
  if settings.DEBUG:
      urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
      urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

  from .views import react_app_view

  urlpatterns += [
      re_path(r'^(?!api/|media/|static/).*$', react_app_view),
  ]
  ```

---

### 1.6 Fix 6: Redact Sensitive Secrets in Settings Serializer
- **File Modified**: `backend/apps/settings_app/serializers.py:12-25`
- **Before**:
  ```python
  class AdminOrganizationSettingsSerializer(serializers.ModelSerializer):
      class Meta:
          model = OrganizationSettings
          fields = '__all__'
  ```
- **After**:
  ```python
  class AdminOrganizationSettingsSerializer(serializers.ModelSerializer):
      smtp_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
      sms_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

      class Meta:
          model = OrganizationSettings
          fields = '__all__'

      def to_representation(self, instance):
          ret = super().to_representation(instance)
          ret['has_smtp_password'] = bool(instance.smtp_password)
          ret['has_sms_api_key'] = bool(instance.sms_api_key)
          return ret
  ```

---

### 1.7 Fix 7: Fix IDOR & PII Enumeration in Application Tracking
- **File Modified**: `backend/apps/applications/views.py:58-112`
- **Before**:
  ```python
  @api_view(['GET'])
  @permission_classes([permissions.AllowAny])
  def track_application(request, application_id):
      try:
          application = Application.objects.get(application_id=application_id.upper())
          serializer = ApplicationStatusSerializer(application)
          return Response(serializer.data)
      except Application.DoesNotExist:
          return Response({'detail': "Ariza topilmadi"}, status=status.HTTP_404_NOT_FOUND)
  ```
- **After**:
  ```python
  @api_view(['GET', 'POST'])
  @permission_classes([permissions.AllowAny])
  @throttle_classes([ScopedRateThrottle])
  def track_application(request, application_id):
      phone = request.query_params.get('phone') or (request.data.get('phone') if hasattr(request, 'data') else None)
      if not phone or not str(phone).strip():
          return Response(
              {'detail': "Ariza holatini ko'rish uchun telefon raqami kiritilishi shart."},
              status=status.HTTP_400_BAD_REQUEST
          )

      clean_req_phone = ''.join(c for c in str(phone) if c.isdigit())
      if len(clean_req_phone) < 7:
          return Response(
              {'detail': "Telefon raqami noto'g'ri formatda."},
              status=status.HTTP_400_BAD_REQUEST
          )

      try:
          application = Application.objects.select_related('event').get(application_id=application_id.strip().upper())
      except Application.DoesNotExist:
          return Response(
              {'detail': "Ariza topilmadi yoki telefon raqami mos kelmadi."},
              status=status.HTTP_404_NOT_FOUND
          )

      clean_app_phone = ''.join(c for c in application.phone if c.isdigit())
      if not (clean_req_phone == clean_app_phone or clean_app_phone.endswith(clean_req_phone) or clean_req_phone.endswith(clean_app_phone)):
          return Response(
              {'detail': "Ariza topilmadi yoki telefon raqami mos kelmadi."},
              status=status.HTTP_404_NOT_FOUND
          )

      # Return only restricted, safe fields to protect applicant PII and avoid leaking admin comments/passports
      invitation_url = request.build_absolute_uri(application.invitation_pdf.url) if application.invitation_pdf else None
      certificate_url = request.build_absolute_uri(application.certificate_pdf.url) if application.certificate_pdf else None

      return Response({
          'application_id': application.application_id,
          'full_name': application.full_name,
          'event_title': application.event.title if application.event else None,
          'attendance_type': application.attendance_type,
          'status': application.status,
          'submitted_at': application.submitted_at,
          'updated_at': application.updated_at,
          'invitation_pdf': invitation_url,
          'certificate_pdf': certificate_url,
      })

  track_application.throttle_scope = 'application_track'
  ```

---

### 1.8 Fix 8: Cryptographic Hardening of QR Verification (HMAC-SHA256)
- **Files Modified**: `backend/apps/qr/services.py:1-18`, `backend/apps/qr/views.py:1-26`
- **Before** (`backend/apps/qr/services.py:7-13`):
  ```python
  @staticmethod
  def generate_secure_hash(value: str) -> str:
      return hashlib.sha256(value.encode("utf-8")).hexdigest()

  @staticmethod
  def verify_hash(value: str, expected_hash: str) -> bool:
      return hmac.compare_digest(QRService.generate_secure_hash(value), expected_hash)
  ```
- **After** (`backend/apps/qr/services.py`):
  ```python
  import hmac
  import hashlib
  from django.conf import settings

  class QRService:
      @staticmethod
      def generate_secure_hash(value: str) -> str:
          key = settings.SECRET_KEY.encode('utf-8')
          return hmac.new(key, value.encode('utf-8'), hashlib.sha256).hexdigest()

      @staticmethod
      def verify_hash(value: str, expected_hash: str) -> bool:
          if not value or not expected_hash:
              return False
          return hmac.compare_digest(QRService.generate_secure_hash(value), expected_hash)
  ```
- **After** (`backend/apps/qr/views.py`):
  Added validation requiring token & hash, timing-safe signature comparison, and verification that the `Certificate` or `Invitation` actually exists in the database.

---

### 1.9 Fix 9: Add Rate Limiting / Scoped Throttles
- **Files Modified**:
  - `backend/centr_form/settings.py:161-175`
  - `backend/apps/accounts/views.py:15-18, 70-85`
  - `backend/apps/applications/views.py:35-40, 60-112`
- **Before** (`backend/centr_form/settings.py:161-166`):
  ```python
  'DEFAULT_THROTTLE_CLASSES': [
      'rest_framework.throttling.AnonRateThrottle',
      'rest_framework.throttling.UserRateThrottle',
  ],
  'DEFAULT_THROTTLE_RATES': {'anon': '10000/hour', 'user': '1000/hour'},
  ```
- **After** (`backend/centr_form/settings.py`):
  ```python
  'DEFAULT_THROTTLE_CLASSES': [
      'rest_framework.throttling.AnonRateThrottle',
      'rest_framework.throttling.UserRateThrottle',
      'rest_framework.throttling.ScopedRateThrottle',
  ],
  'DEFAULT_THROTTLE_RATES': {
      'anon': '120/minute',
      'user': '600/minute',
      'auth_login': '5/minute',
      'auth_password': '5/minute',
      'application_submit': '10/minute',
      'application_track': '30/minute',
  },
  ```
- **Views Scoped**:
  - `LoginView`: `throttle_classes = [ScopedRateThrottle]`, `throttle_scope = 'auth_login'`
  - `change_password_view`: `@throttle_classes([ScopedRateThrottle])`, `throttle_scope = 'auth_password'`
  - `SubmitApplicationView`: `throttle_classes = [ScopedRateThrottle]`, `throttle_scope = 'application_submit'`
  - `track_application`: `@throttle_classes([ScopedRateThrottle])`, `throttle_scope = 'application_track'`

---

### 1.10 Fix 10: Harden Django Settings (DEBUG, Hosts, Cookies, Headers, CORS, CSRF, Middleware Order)
- **File Modified**: `backend/centr_form/settings.py`
- **Before**:
  - `DEBUG = config('DEBUG', default=True, cast=bool)`
  - `ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')`
  - `CorsMiddleware` placed AFTER `WhiteNoiseMiddleware`
  - `CORS_ALLOW_CREDENTIALS = True` with open origins
  - Security headers and secure cookie flags were wrapped in `if not DEBUG:` and disabled by default.
- **After**:
  ```python
  DEBUG = config('DEBUG', default=False, cast=bool)

  raw_allowed_hosts = config('ALLOWED_HOSTS', default='form.uzbamalaka.uz,localhost,127.0.0.1')
  ALLOWED_HOSTS = [host.strip() for host in raw_allowed_hosts.split(',') if host.strip()]
  if not DEBUG:
      ALLOWED_HOSTS = [h for h in ALLOWED_HOSTS if h != '*']
      if not ALLOWED_HOSTS:
          ALLOWED_HOSTS = ['form.uzbamalaka.uz', 'localhost', '127.0.0.1']

  MIDDLEWARE = [
      'django.middleware.security.SecurityMiddleware',
      'corsheaders.middleware.CorsMiddleware',
      'whitenoise.middleware.WhiteNoiseMiddleware',
      'django.contrib.sessions.middleware.SessionMiddleware',
      'django.middleware.common.CommonMiddleware',
      'django.middleware.csrf.CsrfViewMiddleware',
      'django.contrib.auth.middleware.AuthenticationMiddleware',
      'django.contrib.messages.middleware.MessageMiddleware',
      'django.middleware.clickjacking.XFrameOptionsMiddleware',
  ]

  CORS_ALLOW_ALL_ORIGINS = False
  CORS_ALLOW_CREDENTIALS = False
  ...
  CSRF_TRUSTED_ORIGINS = [...]

  # Cookie security settings
  SESSION_COOKIE_HTTPONLY = True
  SESSION_COOKIE_SAMESITE = 'Lax'
  CSRF_COOKIE_HTTPONLY = False
  CSRF_COOKIE_SAMESITE = 'Lax'

  # Security headers
  X_FRAME_OPTIONS = 'DENY'
  SECURE_CONTENT_TYPE_NOSNIFF = True
  SECURE_BROWSER_XSS_FILTER = True

  if not DEBUG:
      SESSION_COOKIE_SECURE = True
      CSRF_COOKIE_SECURE = True
      SECURE_HSTS_SECONDS = 31536000
      SECURE_HSTS_INCLUDE_SUBDOMAINS = True
      SECURE_HSTS_PRELOAD = True
      SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
      SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  else:
      SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
      CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=False, cast=bool)
      SECURE_HSTS_SECONDS = 0
  ```

---

### 1.11 Fix 11: Enforce Password Validation in Serializers
- **File Modified**: `backend/apps/accounts/serializers.py:28-55`
- **Before**: No password validation routines; passwords under 8 characters or common dictionaries were accepted if lengths matched.
- **After**:
  ```python
  from django.contrib.auth.password_validation import validate_password
  from django.core.exceptions import ValidationError as DjangoValidationError

  class AdminUserCreateSerializer(serializers.ModelSerializer):
      ...
      def validate_password(self, value):
          try:
              validate_password(value)
          except DjangoValidationError as exc:
              raise serializers.ValidationError(list(exc.messages))
          return value

  class ChangePasswordSerializer(serializers.Serializer):
      ...
      def validate_new_password(self, value):
          user = self.context.get('request').user if self.context.get('request') else None
          try:
              validate_password(value, user=user)
          except DjangoValidationError as exc:
              raise serializers.ValidationError(list(exc.messages))
          return value
  ```

---

## 2. Logic Chain

1. **Premise 1**: `reset_admin_view` allowed anyone on the public web to reset superadmin credentials to known static credentials (`admin` / `Markaz2026!`).
   - Removing the function and its URL pattern ensures no remote unauthenticated caller can alter superuser accounts via HTTP.
2. **Premise 2**: `IsSuperAdmin` allowed access to any user where `is_staff=True`. `AdminUser` defaults `is_staff=True` for all accounts (including `Role.MODERATOR`).
   - Requiring `is_superuser=True` and `role in ('super_admin', 'superadmin')` strictly enforces least-privilege RBAC.
3. **Premise 3**: `run_migrations_view` and `run_makemigrations_view` invoked management commands over unauthenticated GET requests.
   - Deleting these views prevents schema alteration and arbitrary command execution over the web.
4. **Premise 4**: Committing plaintext passwords into git repository enables credential theft.
   - Replacing hardcoded passwords with environment variable lookups and `secrets.token_urlsafe` guarantees no static secrets exist in version control.
5. **Premise 5**: Insecure static serving via `django.views.static.serve` pointed to `BASE_DIR.parent` allowed file traversal and arbitrary file reads.
   - Removing the custom root `serve` rules completely prevents directory traversal.
6. **Premise 6**: Exposing `smtp_password` and `sms_api_key` in `AdminOrganizationSettingsSerializer` leaks credentials in API responses.
   - Marking them `write_only=True` prevents leakage while returning `has_smtp_password` preserves UI status indicators.
7. **Premise 7**: `track_application` only required 6-digit application ID, allowing brute-force PII harvesting.
   - Requiring matching phone digits prevents IDOR enumeration, while returning restricted fields prevents leaking internal `admin_comment` or passport files.
8. **Premise 8**: Plain SHA-256 for QR verification allowed anyone to forge valid QR codes.
   - Keyed HMAC-SHA256 with `settings.SECRET_KEY` and database existence verification prevents forgery.
9. **Premise 9**: Unthrottled login and forms enabled brute-force credential stuffing and DoS.
   - Adding `ScopedRateThrottle` on `auth_login` (5/min), `auth_password` (5/min), `application_submit` (10/min), and `application_track` (30/min) mitigates automated attacks.
10. **Premise 10**: Permissive settings (`DEBUG=True`, `ALLOWED_HOSTS=*`, missing headers, misplaced CORS) caused deploy security failures.
    - Setting secure defaults, sanitizing hosts, placing `CorsMiddleware` right after `SecurityMiddleware`, and configuring HSTS/cookies resolves all security deploy warnings.
11. **Premise 11**: Missing password validator checks allowed trivial passwords.
    - Adding `validate_password` calls invokes Django's configured password strength policies.

---

## 3. Caveats

1. **Deployment Environment Configuration**: In production, `DEBUG` must remain `False` in the server's `.env`, and `SECRET_KEY`, `EMAIL_HOST_PASSWORD`, and `ALLOWED_HOSTS` should be provided through the host environment or cPanel Passenger environment configuration.
2. **Database Migrations**: The pending migration for `attendance_type` on `Application` was generated and applied (`0004_application_attendance_type_application_attended_and_more.py`).
3. **Frontend Scope**: Frontend fixes (such as localStorage PII encryption and UI route guards) are assigned to Milestone 2.
4. **No Other Caveats**: All 11 assigned backend security hardening fixes are complete and verified.

---

## 4. Conclusion

All 11 backend security hardening fixes assigned in Milestone 1 have been implemented. The backend codebase is hardened against OWASP Top 10 vulnerabilities including Broken Access Control (A01), Cryptographic Failures (A02), Injection & Input Validation (A03), Insecure Design (A04), Security Misconfiguration (A05), and Identification & Authentication Failures (A07).

System check via `python backend/manage.py check` reports 0 issues. Full deployment check (`check --deploy`) with `DEBUG=False` completes with 0 warnings.

---

## 5. Verification Method

To independently verify all 11 fixes:

1. **Run Django System Check**:
   ```powershell
   backend\.venv\Scripts\python.exe backend\manage.py check
   ```
   *Expected Output*: `System check identified no issues (0 silenced).`

2. **Run Django Deployment Security Check**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ['DEBUG']='False'; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from django.core.management import call_command; call_command('check', deploy=True)"
   ```
   *Expected Output*: `System check identified no issues (0 silenced).`

3. **Verify Removal of Hardcoded Credentials in Git**:
   ```powershell
   git grep -E "(xusniddin123|xamidov12345|F_meB67mGwVU8T|Markaz2026!)"
   ```
   *Expected Output*: Exit code 1 (no matches found).

4. **Verify IsSuperAdmin Role Check**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.accounts.permissions import IsSuperAdmin; from unittest.mock import Mock; perm = IsSuperAdmin(); print('Mod allowed:', perm.has_permission(Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=False, role='moderator')), None)); print('Super allowed:', perm.has_permission(Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=True, role='super_admin')), None))"
   ```
   *Expected Output*: `Mod allowed: False`, `Super allowed: True`.

5. **Verify QR Code HMAC**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.qr.services import QRService; p = QRService.build_verification_payload('certificate', 1); print('HMAC Valid:', QRService.verify_hash(p['token'], p['hash'])); print('Plain SHA256 Valid:', QRService.verify_hash(p['token'], 'plainhash'))"
   ```
   *Expected Output*: `HMAC Valid: True`, `Plain SHA256 Valid: False`.

6. **Verify Password Validation in Serializers**:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings'); django.setup(); from apps.accounts.serializers import AdminUserCreateSerializer; s = AdminUserCreateSerializer(data={'username': 'testu', 'email': 'test@test.uz', 'full_name': 'Test', 'role': 'moderator', 'password': 'password'}); print('Common pass valid:', s.is_valid())"
   ```
   *Expected Output*: `Common pass valid: False`.
