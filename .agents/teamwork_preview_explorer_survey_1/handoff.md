# Backend Security Code Review (OWASP Top 10 Audit)

**Target**: `backend/` (Django REST Framework)  
**Auditor**: Explorer 1 (Security Specialist)  
**Date**: 2026-09-04  
**Status**: Comprehensive Audit Complete  

---

## 1. Observation

A complete static code analysis of the `backend/` application revealed 17 security vulnerabilities across 6 OWASP Top 10 categories. The observations below quote exact files, line numbers, and verbatim code.

### 1.1 CRITICAL: Hardcoded Superadmin Password Reset Backdoor
- **File**: `backend/apps/common/views.py` (lines 240–259)
- **File**: `backend/apps/common/urls.py` (line 20)
- **Code**:
  ```python
  # backend/apps/common/views.py:240-259
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
      except Exception as e:
          return Response({
              "status": "ERROR",
              "error_message": str(e)
          })
  ```
  ```python
  # backend/apps/common/urls.py:20
  path('reset-admin/', views.reset_admin_view, name='reset-admin'),
  ```
- **Finding**: An unauthenticated public GET endpoint `/api/v1/common/reset-admin/` directly resets the superuser password to `Markaz2026!` and returns credentials in plain text.

---

### 1.2 CRITICAL: Broken Access Control & Privilege Escalation in `IsSuperAdmin`
- **File**: `backend/apps/accounts/permissions.py` (lines 4–12)
- **File**: `backend/apps/accounts/models.py` (line 33)
- **Code**:
  ```python
  # backend/apps/accounts/permissions.py:4-12
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
  ```python
  # backend/apps/accounts/models.py:31-33
  role = models.CharField(max_length=20, choices=Role.choices, default=Role.MODERATOR)
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=True)
  ```
- **Finding**: `IsSuperAdmin` permits access if `request.user.is_staff` is `True`. However, in `AdminUser`, `is_staff` defaults to `True` for every user. Consequently, every user with role `moderator` or `administrator` automatically satisfies `IsSuperAdmin`.
- **Affected Views**:
  - `AdminUserListCreateView` (`backend/apps/accounts/views.py:47-56`)
  - `AdminUserDetailView` (`backend/apps/accounts/views.py:57-67`)
  This allows any low-level moderator to view, create, edit, or delete any superadmin.

---

### 1.3 CRITICAL: Broken Cryptographic Integrity in QR Code Verification (Unkeyed Hash)
- **File**: `backend/apps/qr/services.py` (lines 7–25)
- **File**: `backend/apps/qr/views.py` (lines 5–10)
- **Code**:
  ```python
  # backend/apps/qr/services.py:7-25
  @staticmethod
  def generate_secure_hash(value: str) -> str:
      return hashlib.sha256(value.encode("utf-8")).hexdigest()

  @staticmethod
  def verify_hash(value: str, expected_hash: str) -> bool:
      return hmac.compare_digest(QRService.generate_secure_hash(value), expected_hash)
  ```
  ```python
  # backend/apps/qr/views.py:5-10
  def verify_qr(request, qr_type, object_id):
      token = request.GET.get('token', '')
      expected_hash = request.GET.get('hash', '')
      payload = QRService.build_verification_payload(qr_type, object_id, token)
      is_valid = QRService.verify_hash(token, expected_hash) and payload['hash'] == expected_hash
      return JsonResponse({'valid': is_valid, 'type': qr_type, 'object_id': object_id})
  ```
- **Finding**: `generate_secure_hash` calculates plain `hashlib.sha256(value)` without a secret key or HMAC. Anyone can compute the hash for any arbitrary `token` or `object_id`. Furthermore, `verify_qr` does not verify whether the certificate/invitation actually exists in the database.

---

### 1.4 HIGH: Unauthenticated Remote Database Management Endpoints
- **File**: `backend/apps/common/views.py` (lines 152–191)
- **File**: `backend/apps/common/urls.py` (lines 17–18)
- **Code**:
  ```python
  # backend/apps/common/views.py:152-191
  @require_http_methods(["GET"])
  def run_migrations_view(request):
      try:
          from django.core.management import call_command
          import io
          out = io.StringIO()
          call_command('migrate', interactive=False, stdout=out)
          return JsonResponse({'status': 'success', 'output': out.getvalue()}, status=200)
      except Exception as e:
          import traceback
          return JsonResponse({'status': 'error', 'error': str(e), 'traceback': traceback.format_exc()}, status=500)
  ```
- **Finding**: Endpoints `GET /api/v1/common/migrate/` and `GET /api/v1/common/makemigrations/` run schema migrations without any authentication or permission check, and leak stack traces on failure.

---

### 1.5 HIGH: Plaintext Secrets in Settings Response & Insecure Permission
- **File**: `backend/apps/settings_app/serializers.py` (lines 12–15)
- **File**: `backend/apps/settings_app/views.py` (lines 13–20)
- **Code**:
  ```python
  # backend/apps/settings_app/serializers.py:12-15
  class AdminOrganizationSettingsSerializer(serializers.ModelSerializer):
      class Meta:
          model = OrganizationSettings
          fields = '__all__'
  ```
  ```python
  # backend/apps/settings_app/views.py:13-16
  class AdminOrganizationSettingsView(generics.RetrieveUpdateAPIView):
      serializer_class = AdminOrganizationSettingsSerializer
      permission_classes = [permissions.IsAdminUser]
  ```
- **Finding**: `AdminOrganizationSettingsSerializer` exposes `smtp_password` and `sms_api_key` in plaintext in JSON responses. `AdminOrganizationSettingsView` uses `IsAdminUser` which checks `is_staff` (which is `True` for all admin users, including moderators).

---

### 1.6 HIGH: Public Unrestricted Media Serving of Passports and PII
- **File**: `backend/centr_form/urls.py` (lines 21–25)
- **Code**:
  ```python
  urlpatterns += [
      re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
      re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, '..', 'assets')}),
      re_path(r'^(?P<path>.*\.(png|jpg|jpeg|gif|ico|svg|webp|js|css|woff|woff2|ttf|eot))$', serve, {'document_root': os.path.join(settings.BASE_DIR, '..')}),
      re_path(r'^(?!api/|media/|static/).*$', react_app_view),
  ]
  ```
- **Finding**: Uploaded user files, including sensitive passport scans (`applications/passports/`), documents, and certificates, are served without authentication checks. Line 24 serves files directly out of the project root directory.

---

### 1.7 HIGH: IDOR & Mass PII Enumeration in Application Tracking
- **File**: `backend/apps/applications/views.py` (lines 58–66)
- **File**: `backend/apps/applications/serializers.py` (lines 77–89)
- **Code**:
  ```python
  # backend/apps/applications/views.py:58-66
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
  ```python
  # backend/apps/applications/serializers.py:77-89
  class ApplicationStatusSerializer(serializers.ModelSerializer):
      ...
      fields = [
          'application_id', 'full_name', 'email', 'organization', 'position',
          'country', 'region', 'district', 'event_title', 'attendance_type', 'presentation_title', 'abstract',
          'status', 'admin_comment', 'attended', 'translations', 'submitted_at', 'updated_at',
          'invitation_pdf', 'certificate_pdf',
      ]
  ```
- **Finding**: The 6-digit application IDs (`CF-2026-XXXXXX`) can be trivially brute-forced without rate limits or authentication, exposing full applicant names, emails, organizations, presentations, comments, and private documents.

---

### 1.8 HIGH: Complete Absence of Endpoint-Specific Throttling
- **File**: `backend/centr_form/settings.py` (lines 161–166)
- **File**: `backend/apps/accounts/views.py` (lines 15–25, 69–80)
- **File**: `backend/apps/applications/views.py` (lines 34–56, 58–66)
- **Code**:
  ```python
  # backend/centr_form/settings.py:165
  'DEFAULT_THROTTLE_RATES': {'anon': '10000/hour', 'user': '1000/hour'},
  ```
- **Finding**: The global anonymous rate of 10,000 requests/hour is practically unthrottled (~3 req/sec). No throttles exist on:
  - `POST /api/v1/auth/login/` (Brute-force / credential stuffing)
  - `POST /api/v1/auth/change-password/` (Password guessing)
  - `POST /api/v1/applications/submit/` (Spam & storage exhaustion)
  - `GET /api/v1/applications/track/<id>/` (Enumeration)

---

### 1.9 HIGH: Missing Password Strength Validation
- **File**: `backend/apps/accounts/serializers.py` (lines 28–46)
- **Code**:
  ```python
  class AdminUserCreateSerializer(serializers.ModelSerializer):
      password = serializers.CharField(write_only=True, min_length=8)
      ...
  class ChangePasswordSerializer(serializers.Serializer):
      old_password = serializers.CharField(required=True)
      new_password = serializers.CharField(required=True, min_length=8)
  ```
- **Finding**: Despite `AUTH_PASSWORD_VALIDATORS` in `settings.py`, neither serializer calls Django's `validate_password()`. Passwords like `12345678` or `password` are accepted.

---

### 1.10 HIGH: Hardcoded Credentials in Utility Scripts
- **File**: `backend/create_admin.py` (line 12)
- **File**: `backend/reset_pass.py` (line 14)
- **Code**:
  ```python
  # backend/create_admin.py:12
  user = AdminUser.objects.create_superuser(username='xusniddin', email='admin@xusniddin.uz', password='xusniddin123', ...)
  # backend/reset_pass.py:14
  user.set_password('xamidov12345')
  ```
- **Finding**: Superadmin accounts and plaintext passwords committed to the repository.

---

### 1.11 HIGH: Insecure Production Defaults in Settings and `.env`
- **File**: `backend/centr_form/settings.py` (lines 15, 30, 207–216)
- **File**: `backend/.env` (lines 1, 3)
- **Code**:
  ```python
  # backend/centr_form/settings.py:15, 30
  DEBUG = config('DEBUG', default=True, cast=bool)
  ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')
  ```
  ```ini
  # backend/.env
  DEBUG=True
  USE_SQLITE=True
  ALLOWED_HOSTS=*
  ```
- **Finding**: `DEBUG` defaults to `True` and `ALLOWED_HOSTS` to `*`. In `settings.py:207`, security headers (`SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `X_FRAME_OPTIONS`) are only enabled `if not DEBUG:`.

---

### 1.12 HIGH: Unauthenticated Email Relay & Debug Info Leak (`test-email`)
- **File**: `backend/apps/common/views.py` (lines 198–236)
- **File**: `backend/apps/common/urls.py` (line 19)
- **Finding**: `GET /api/v1/common/test-email/` allows anyone to trigger emails and exposes SMTP configuration (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`) and complete tracebacks.

---

### 1.13 HIGH: Extension-Only File Upload Validation (Missing Magic Byte / MIME Verification)
- **File**: `backend/apps/applications/serializers.py` (lines 10–26)
- **Code**:
  ```python
  ext = os.path.splitext(filename)[1].lower()
  if ext not in allowed_normalized:
      raise serializers.ValidationError(...)
  ```
- **Finding**: Only file extension string is inspected. An attacker can upload an executable or script disguised as `.pdf` or `.png`. Also permits `.doc`/`.docx` formats without macro inspection.

---

### 1.14 MEDIUM: Unrestricted File Upload in Event Creation
- **File**: `backend/apps/events/serializers.py` (lines 54–62)
- **Finding**: `banner` and `program_pdf` have no file size or extension validation in `EventCreateUpdateSerializer`.

---

### 1.15 MEDIUM: Permissive Default DRF Permissions
- **File**: `backend/centr_form/settings.py` (lines 150–152)
- **Code**:
  ```python
  'DEFAULT_PERMISSION_CLASSES': [
      'rest_framework.permissions.IsAuthenticatedOrReadOnly',
  ],
  ```
- **Finding**: Any new endpoint inadvertently omitting `permission_classes` permits unauthenticated read access.

---

### 1.16 MEDIUM: Excessive JWT Access Token Lifetime
- **File**: `backend/centr_form/settings.py` (line 169)
- **Code**:
  ```python
  'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
  ```
- **Finding**: 12 hours is excessively long for an administration panel access token.

---

### 1.17 LOW: Missing 404 Exception Handling in `add_gallery_image`
- **File**: `backend/apps/events/views.py` (line 63)
- **Code**:
  ```python
  event = Event.objects.get(pk=pk)
  ```
- **Finding**: Throws unhandled `Event.DoesNotExist` resulting in 500 error instead of 404.

---

## 2. Logic Chain

### 2.1 Logic: Backdoor Exploitation to Full System Compromise
1. Observation 1.1 shows `GET /api/v1/common/reset-admin/` has `permission_classes=[AllowAny]`.
2. When called, the view sets `user.is_superuser = True` and `user.set_password('Markaz2026!')`.
3. Observation 1.1 shows the response outputs the credentials directly in JSON.
4. With credentials `admin` / `Markaz2026!`, an attacker logs in via `POST /api/v1/auth/login/` (Observation 1.8 shows no throttling).
5. The attacker obtains a 12-hour valid JWT token (Observation 1.16).
6. Result: Full system compromise with zero prerequisites.

### 2.2 Logic: Privilege Escalation from Moderator to Super Admin
1. Observation 1.2 shows `IsSuperAdmin.has_permission` checks `request.user.is_staff`.
2. In `AdminUser`, `is_staff` defaults to `True` for all accounts, including `Role.MODERATOR`.
3. Observation 1.2 shows `AdminUserListCreateView` and `AdminUserDetailView` are guarded only by `IsSuperAdmin`.
4. A moderator account makes a request to `/api/v1/accounts/users/` or `/api/v1/accounts/users/<id>/`.
5. The permission check evaluates `request.user.is_staff == True` and passes.
6. The moderator can create a new superadmin or change their own role to `super_admin`.
7. Result: Complete role boundary collapse between Moderator and Super Admin.

### 2.3 Logic: QR Code Forgery
1. Observation 1.3 shows `QRService.generate_secure_hash` is `hashlib.sha256(value.encode()).hexdigest()`.
2. No secret key or salt is involved.
3. The expected token format is deterministic: `cf-{qr_type}-{object_id}`.
4. Observation 1.3 shows `verify_qr` verifies `sha256(token) == expected_hash` and checks nothing in the database.
5. Anyone can forge a certificate pass for ID `999` by computing `sha256("cf-certificate-999")`.
6. Result: Complete forgery of certificates and attendance badges.

### 2.4 Logic: Data Harvesting via IDOR & Missing Throttling
1. Observation 1.7 shows `GET /api/v1/applications/track/<id>/` is `AllowAny`.
2. `application_id` format is `CF-YYYY-NNNNNN` with 6 random digits.
3. Observation 1.8 shows anonymous throttle rate is 10,000/hour with no endpoint throttle.
4. An automated script enumerates 000000 to 999999.
5. Observation 1.7 shows the endpoint returns full name, email, phone, organization, position, comments, and links to invitation/certificate PDFs.
6. Result: Mass leak of private user PII.

---

## 3. Caveats
- The review was performed strictly via static code analysis without executing active attacks or intrusive payloads against live infrastructure.
- Third-party package vulnerabilities (e.g. within Django 5.0.4 or Pillow 10.3.0) should be continuously verified via `pip-audit`.
- Database storage (MySQL vs. SQLite) configuration depends on the runtime deployment environment (`.env`).
- No other caveats.

---

## 4. Conclusion & Vulnerability Summary

The backend codebase contains **3 Critical**, **7 High**, **4 Medium**, and **3 Low** vulnerabilities. The most urgent threats are the `reset-admin` backdoor and the `IsSuperAdmin` staff check flaw, both of which permit immediate total system takeover.

### Summary Table

| ID | Vulnerability | Severity | OWASP Category | Target File & Lines |
|---|---|---|---|---|
| 1 | Admin Password Reset Backdoor | **Critical** | A01: Broken Access Control | `apps/common/views.py:240-259` |
| 2 | Privilege Escalation in `IsSuperAdmin` | **Critical** | A01: Broken Access Control | `apps/accounts/permissions.py:4-12` |
| 3 | QR Code Forgery (Unkeyed Hash) | **Critical** | A02: Cryptographic Failures | `apps/qr/services.py:7-25` |
| 4 | Unauthenticated DB Migrations | **High** | A01: Broken Access Control | `apps/common/views.py:152-191` |
| 5 | Plaintext Secrets in Settings Response | **High** | A02: Cryptographic Failures | `apps/settings_app/serializers.py:12-15` |
| 6 | Public Media Serving of Passports | **High** | A01: Broken Access Control | `centr_form/urls.py:21-25` |
| 7 | IDOR & Mass PII Enumeration | **High** | A01: Broken Access Control | `apps/applications/views.py:58-66` |
| 8 | Missing Throttling on Auth & Forms | **High** | A04: Insecure Design | `apps/accounts/views.py:15-25, 69-80` |
| 9 | Weak Password Policy Enforcement | **High** | A07: Identification & Auth | `apps/accounts/serializers.py:28-46` |
| 10 | Hardcoded Admin Credentials in Scripts | **High** | A07: Identification & Auth | `create_admin.py:12`, `reset_pass.py:14` |
| 11 | Insecure `DEBUG` & `ALLOWED_HOSTS` | **High** | A05: Security Misconfiguration | `centr_form/settings.py:15, 30` |
| 12 | Unauthenticated Email Relay & Leak | **High** | A05: Security Misconfiguration | `apps/common/views.py:198-236` |
| 13 | Extension-Only File Upload Check | **High** | A03: Injection / Validation | `apps/applications/serializers.py:10-26` |
| 14 | Unvalidated Uploads in Events | **Medium** | A03: Injection / Validation | `apps/events/serializers.py:54-62` |
| 15 | Overly Permissive Default Permissions | **Medium** | A01: Broken Access Control | `centr_form/settings.py:150-152` |
| 16 | 12-Hour JWT Token Lifetime | **Medium** | A07: Identification & Auth | `centr_form/settings.py:169` |
| 17 | Missing 404 Guard in `add_gallery_image`| **Low** | A05: Security Misconfiguration | `apps/events/views.py:63` |

---

## 5. Recommended Defensive Remediations with Code Snippets

### Fix 1: Eliminate Backdoors and Management Endpoints
**Action**: Delete lines 152–259 in `backend/apps/common/views.py` and lines 16–20 in `backend/apps/common/urls.py`.
```python
# In backend/apps/common/urls.py:
urlpatterns = [
    path('translate/content/', views.translate_content_view, name='translate-content'),
    path('', include(router.urls)),
]
```

### Fix 2: Repair `IsSuperAdmin` and Role-Based Permissions
**File**: `backend/apps/accounts/permissions.py`
```python
from rest_framework.permissions import BasePermission
from .models import AdminUser

class IsSuperAdmin(BasePermission):
    """Strictly grant access to users with role super_admin or is_superuser flag."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or
            getattr(request.user, 'role', None) == AdminUser.Role.SUPER_ADMIN
        )

class IsAdminOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return getattr(request.user, 'role', None) in (
            AdminUser.Role.SUPER_ADMIN,
            AdminUser.Role.ADMINISTRATOR
        )

class IsModeratorOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return getattr(request.user, 'role', None) in (
            AdminUser.Role.SUPER_ADMIN,
            AdminUser.Role.ADMINISTRATOR,
            AdminUser.Role.MODERATOR
        )
```
Also update `AdminUser` in `backend/apps/accounts/models.py`:
```python
is_staff = models.BooleanField(default=False)
```

### Fix 3: Cryptographically Secure QR Verification with HMAC-SHA256
**File**: `backend/apps/qr/services.py` and `backend/apps/qr/views.py`
```python
# backend/apps/qr/services.py
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
        expected = QRService.generate_secure_hash(value)
        return hmac.compare_digest(expected, expected_hash)
```
In `backend/apps/qr/views.py`, also verify the existence of the entity:
```python
from apps.certificates.models import Certificate
from apps.invitations.models import Invitation

def verify_qr(request, qr_type, object_id):
    token = request.GET.get('token', '')
    expected_hash = request.GET.get('hash', '')
    if not QRService.verify_hash(token, expected_hash):
        return JsonResponse({'valid': False, 'detail': 'Invalid signature'}, status=400)
    
    # Verify entity existence
    if qr_type == 'certificate':
        exists = Certificate.objects.filter(id=object_id, status='issued').exists()
    elif qr_type == 'invitation':
        exists = Invitation.objects.filter(id=object_id).exists()
    else:
        exists = False
        
    return JsonResponse({'valid': exists, 'type': qr_type, 'object_id': object_id})
```

### Fix 4: Protect Sensitive Settings & Restrict Permissions
**File**: `backend/apps/settings_app/serializers.py` and `views.py`
```python
# In backend/apps/settings_app/serializers.py:
class AdminOrganizationSettingsSerializer(serializers.ModelSerializer):
    smtp_password = serializers.CharField(write_only=True, required=False)
    sms_api_key = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = OrganizationSettings
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['has_smtp_password'] = bool(instance.smtp_password)
        ret['has_sms_api_key'] = bool(instance.sms_api_key)
        return ret
```
```python
# In backend/apps/settings_app/views.py:
from apps.accounts.permissions import IsSuperAdmin

class AdminOrganizationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminOrganizationSettingsSerializer
    permission_classes = [IsSuperAdmin]
```

### Fix 5: Implement Granular Rate Limiting (Throttling)
**File**: `backend/centr_form/settings.py`
```python
REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '300/hour',
        'user': '1000/hour',
        'auth_attempt': '5/minute',
        'application_submission': '10/hour',
        'application_tracking': '30/minute',
    },
}
```
Apply throttles in `backend/apps/accounts/views.py`:
```python
from rest_framework.throttling import ScopedRateThrottle

class LoginView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_attempt'
```

### Fix 6: Enforce Password Strength Validation
**File**: `backend/apps/accounts/serializers.py`
```python
from django.contrib.auth.password_validation import validate_password

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        user = self.context.get('request').user if self.context.get('request') else None
        validate_password(value, user=user)
        return value
```

### Fix 7: Harden File Upload Validation
**File**: `backend/apps/applications/serializers.py`
```python
import mimetypes
from PIL import Image

SAFE_MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
}

def validate_uploaded_file(file_obj, allowed_extensions={'.pdf', '.jpg', '.jpeg', '.png'}, max_size_bytes=10*1024*1024):
    if not file_obj:
        return file_obj
    if file_obj.size == 0 or file_obj.size > max_size_bytes:
        raise serializers.ValidationError("Fayl hajmi 0 dan 10MB gacha bo'lishi kerak.")
    
    filename = file_obj.name or ""
    if filename.count('.') > 1:
        raise serializers.ValidationError("Qo'shaloq fayl kengaytmasi taqiqlangan.")
        
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_extensions:
        raise serializers.ValidationError(f"Fayl kengaytmasi ruxsat etilmagan: {ext}")
        
    # Verify image integrity if image extension
    if ext in ('.jpg', '.jpeg', '.png'):
        try:
            img = Image.open(file_obj)
            img.verify()
            file_obj.seek(0)
        except Exception:
            raise serializers.ValidationError("Fayl buzilgan yoki haqiqiy rasm emas.")
            
    return file_obj
```

### Fix 8: Remove Hardcoded Scripts and Clean Project Root
**Action**: Delete `backend/create_admin.py`, `backend/reset_pass.py`, `add_reset_admin.py`, and `add_test_email.py`. Ensure superadmins are only created via `python manage.py createsuperuser` with interactive prompts or securely managed environment variables.

---

## 6. Verification Method

To verify the findings and test defensive fixes independently:

1. **Verify Backdoor Removal**:
   ```bash
   curl -I http://localhost:8000/api/v1/common/reset-admin/
   # Expected: 404 Not Found
   ```
2. **Verify Privilege Escalation Fix**:
   - Create a user with `role="moderator"`.
   - Send `GET /api/v1/accounts/users/` with the moderator's JWT Bearer token.
   - Expected: `403 Forbidden` (only accessible by `super_admin`).
3. **Verify QR Code Integrity**:
   - Send `GET /api/v1/qr/verify/certificate/1/?token=cf-certificate-1&hash=<plain_sha256>`
   - Expected: Fails verification because server enforces HMAC-SHA256 with `settings.SECRET_KEY`.
4. **Verify Password Validation**:
   - Attempt to set new password to `12345678` or `password`.
   - Expected: `400 Bad Request` with `ValidationError` ("This password is too common").
5. **Verify Rate Limiting**:
   - Send 10 rapid POST requests to `/api/v1/auth/login/`.
   - Expected: `429 Too Many Requests` triggered after threshold.

