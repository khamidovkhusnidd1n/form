# Milestone 3 (Security & Bug Remediation) — Technical Analysis & Implementation Strategy

**Author**: Explorer for Milestone 3  
**Target Directory**: `D:\ariza\Markaz form`  
**Date**: 2026-08-12  

---

## Executive Summary

This report formulates a comprehensive, itemized implementation strategy for **Milestone 3 (Security & Bug Remediation)** of the `CENTR FORM` application.
The investigation examined security vulnerabilities, authorization flaws, input validation omissions, CORS/secrets configuration weaknesses, and client-side unauthenticated handling across both backend (Django 5 + DRF) and frontend (React 19 + TypeScript + Axios).

All 5 scope items have been fully investigated, with exact code locations, vulnerability mechanics, proposed fixes (with before/after code blocks), test cases, and verification procedures detailed below.

---

## Scope & Itemized Implementation Strategy

---

### Item 1: Fix `IsModeratorOrAbove` Permission Bypass in `backend/apps/accounts/permissions.py`

#### 1. Target File & Location
- **File**: `backend/apps/accounts/permissions.py`
- **Lines**: 20–22

#### 2. Current Implementation (Vulnerability Analysis)
```python
class IsModeratorOrAbove(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
```
- **Vulnerability**: `IsModeratorOrAbove` only checks if `request.user.is_authenticated` is `True`.
- **Impact**: Any authenticated user account—regardless of assigned role string or disabled privileges—passes this permission check. Endpoints protected by `IsModeratorOrAbove` (such as application list/detail views, bulk status updates, and bulk application deletion) are accessible to any logged-in user.

#### 3. Proposed Fix
Update `IsModeratorOrAbove` to check that `request.user` is authenticated AND that either:
- `request.user.is_superuser` or `request.user.is_staff` is `True`, OR
- `request.user.role` is in `('super_admin', 'administrator', 'moderator', 'admin')`.

```python
class IsModeratorOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False):
            return True
        user_role = getattr(request.user, 'role', None)
        return user_role in ('super_admin', 'administrator', 'moderator', 'admin')
```

---

### Item 2: Add File Extension & Size Validation to `ApplicationSubmitSerializer` & Unit Test Coverage

#### 1. Target Files & Locations
- **Serializer**: `backend/apps/applications/serializers.py` (Lines 6–28)
- **Unit Tests**: `backend/apps/applications/tests.py` (Lines 1–18)

#### 2. Current Implementation (Vulnerability Analysis)
```python
class ApplicationSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'application_id', 'event', 'full_name', 'date_of_birth', 'gender', 'phone', 'email',
            'organization', 'position', 'country', 'region', 'district',
            'presentation_title', 'abstract', 'document', 'passport', 'photo',
        ]
        read_only_fields = ['application_id']
```
- **Vulnerability**: DRF standard `FileField` and `ImageField` in `ApplicationSubmitSerializer` do not enforce file extension whitelisting or file size caps.
- **Impact**: Applicants can upload arbitrary file formats (e.g. `.exe`, `.py`, `.php`, `.sh`, `.html`) or massive files (>100MB). When served via media endpoints, executable/script files pose Remote Code Execution (RCE) or Stored Cross-Site Scripting (XSS) risks, and oversized files pose Denial of Service (DoS) / storage exhaustion risks.

#### 3. Proposed Fix in `serializers.py`
Add file validation helper `validate_uploaded_file()` enforcing allowed extensions (`.pdf`, `.jpg`, `.jpeg`, `.png`) and max size limit (10MB = 10,485,760 bytes). Implement `validate_document`, `validate_passport`, and `validate_photo` in `ApplicationSubmitSerializer`:

```python
import os
from rest_framework import serializers

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_FILE_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}


def validate_uploaded_file(file_obj, allowed_extensions=ALLOWED_FILE_EXTENSIONS, max_size_bytes=MAX_FILE_SIZE_BYTES):
    if not file_obj:
        return file_obj
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_extensions:
        allowed_str = ', '.join([e.upper().lstrip('.') for e in sorted(allowed_extensions)])
        raise serializers.ValidationError(f"Fayl formati ruxsat etilmagan ({ext}). Ruxsat etilgan formatlar: {allowed_str}.")
    if file_obj.size > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise serializers.ValidationError(f"Fayl hajmi {max_mb}MB dan oshmasligi kerak.")
    return file_obj


class ApplicationSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'application_id', 'event', 'full_name', 'date_of_birth', 'gender', 'phone', 'email',
            'organization', 'position', 'country', 'region', 'district',
            'presentation_title', 'abstract', 'document', 'passport', 'photo',
        ]
        read_only_fields = ['application_id']

    def validate_document(self, value):
        return validate_uploaded_file(value)

    def validate_passport(self, value):
        return validate_uploaded_file(value)

    def validate_photo(self, value):
        return validate_uploaded_file(value)

    def validate_event(self, value):
        if not value.is_registration_open:
            raise serializers.ValidationError("Bu tadbirga ro'yxatdan o'tish yopilgan yoki qabul qilish muddati tugagan")
        return value

    def validate(self, data):
        event = data.get('event')
        try:
            ApplicationService.validate_submission(event, data)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return data
```

#### 4. Unit Test Coverage in `backend/apps/applications/tests.py`
Add test cases in `backend/apps/applications/tests.py` using `SimpleUploadedFile`:
1. `test_serializer_accepts_valid_files`: Valid `.pdf`, `.jpg`, `.png` files under 10MB pass validation.
2. `test_serializer_rejects_disallowed_extension`: File with `.exe` or `.py` extension fails with `ValidationError`.
3. `test_serializer_rejects_oversized_file`: File exceeding 10MB (e.g. 11MB dummy file) fails with `ValidationError`.

---

### Item 3: Refine CORS Configuration & Secure `SECRET_KEY` Fallback in `backend/centr_form/settings.py`

#### 1. Target File & Location
- **File**: `backend/centr_form/settings.py`
- **Lines**: Line 7 (`SECRET_KEY`) & Lines 158–168 (`CORS`)

#### 2. Current Implementation (Vulnerability Analysis)
```python
# Line 7
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# Lines 158–168
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8443',
    'http://127.0.0.1:8443',
    config('FRONTEND_URL', default='http://localhost:8443'),
]
CORS_ALLOW_CREDENTIALS = True

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```
- **Vulnerabilities**:
  - `CORS_ALLOW_ALL_ORIGINS = True` when `DEBUG=True` overrides explicit origin list while `CORS_ALLOW_CREDENTIALS = True` is enabled. In CORS spec, wildcard origins with credentials are unsafe and subject browsers to cross-site credential leaks.
  - `SECRET_KEY` defaults to a fixed public string `'django-insecure-change-this-in-production'`, risking token forgery if deployed without setting `SECRET_KEY`.

#### 3. Proposed Fix
- **SECRET_KEY**: If `SECRET_KEY` environment variable is unset:
  - If `DEBUG=True`, auto-generate a random insecure key prefix using Django's `get_random_secret_key()`.
  - If `DEBUG=False` (production), raise a `ValueError` forcing environment configuration.
- **CORS**: Remove `if DEBUG: CORS_ALLOW_ALL_ORIGINS = True`. Parse `CORS_ALLOWED_ORIGINS` from environment variable or standard dev origins cleanly using `set`.

```python
from django.core.management.utils import get_random_secret_key

# Secure SECRET_KEY configuration
SECRET_KEY = config('SECRET_KEY', default=None)
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-dev-' + get_random_secret_key()
    else:
        raise ValueError("SECRET_KEY environment variable MUST be defined in production!")

# Refined CORS configuration
raw_cors_origins = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://localhost:3000,http://localhost:8443,http://127.0.0.1:8443,http://127.0.0.1:5173'
)
CORS_ALLOWED_ORIGINS = list(set(
    [origin.strip() for origin in raw_cors_origins.split(',') if origin.strip()] +
    [config('FRONTEND_URL', default='http://localhost:8443').strip()]
))
CORS_ALLOW_CREDENTIALS = True
```

---

### Item 4: Secure `/api/v1/events/stats/` Endpoint Permission in `backend/apps/events/views.py`

#### 1. Target File & Location
- **File**: `backend/apps/events/views.py`
- **Lines**: 12 (Imports) & Lines 71–73 (`dashboard_stats`)

#### 2. Current Implementation (Vulnerability Analysis)
```python
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def dashboard_stats(request):
```
- **Vulnerability**: `/api/v1/events/stats/` is configured with `[permissions.AllowAny]`.
- **Impact**: Any unauthenticated public user or crawler can view sensitive aggregated system statistics (total applications, approved count, rejected count, pending count, today's submission total).

#### 3. Proposed Fix
Import `IsModeratorOrAbove` from `apps.accounts.permissions` and change the `@permission_classes` decorator on `dashboard_stats` to `[IsModeratorOrAbove]`:

```python
# backend/apps/events/views.py

from apps.accounts.permissions import IsAdminOrAbove, IsModeratorOrAbove

@api_view(['GET'])
@permission_classes([IsModeratorOrAbove])
def dashboard_stats(request):
    from apps.applications.models import Application
    from django.utils import timezone
    ...
```

---

### Item 5: Add 401 Unauthorized Handling & Redirect in `src/api/client.ts`

#### 1. Target File & Location
- **File**: `src/api/client.ts`
- **Lines**: 15–21

#### 2. Current Implementation (Vulnerability / UX Bug Analysis)
```typescript
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) clearStoredAuth();
    return Promise.reject(err);
  }
);
```
- **Issue**: When an API call returns `401 Unauthorized` (e.g. expired JWT token), `clearStoredAuth()` is called, but the browser is NOT redirected to `/admin/login`. The user remains stuck on an admin page with broken/failed state requests.

#### 3. Proposed Fix
Enhance the response interceptor to call `clearStoredAuth()` and immediately redirect the user to `/admin/login` if they are not already on the login page:

```typescript
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);
```

---

## Verification & Independent Test Matrix

| Item # | Verification Command / Step | Expected Outcome |
|---|---|---|
| **1** | Run `python manage.py test apps.accounts` or invoke permission test | `IsModeratorOrAbove` rejects unauthenticated users & users without moderator/admin role; allows users with `moderator`/`administrator`/`super_admin` role or `is_staff`/`is_superuser`. |
| **2** | Run `python manage.py test apps.applications` | New unit tests for `ApplicationSubmitSerializer` pass, confirming rejection of `.exe` files and files > 10MB, while accepting valid `.pdf`/`.png`/`.jpg` files < 10MB. |
| **3** | Inspect settings with `DEBUG=True` and `DEBUG=False` | `CORS_ALLOW_ALL_ORIGINS` is never set to `True`. `SECRET_KEY` falls back to `django-insecure-dev-...` in dev mode, and raises `ValueError` if unset in production. |
| **4** | Send unauthenticated `GET /api/v1/events/stats/` request | API returns `HTTP 401 Unauthorized`. Authenticated request with moderator token returns HTTP 200 with stats JSON. |
| **5** | Run `npm run build` and simulate 401 response in browser | App compiles cleanly (`npm run build` passes with code 0). 401 response clears `localStorage` auth token and redirects browser window to `/admin/login`. |

---

## Summary of File Modifications for Implementer

1. `backend/apps/accounts/permissions.py` — Update `IsModeratorOrAbove` logic.
2. `backend/apps/applications/serializers.py` — Add file extension & size validation helpers.
3. `backend/apps/applications/tests.py` — Add serializer unit tests.
4. `backend/centr_form/settings.py` — Refine `SECRET_KEY` and CORS settings.
5. `backend/apps/events/views.py` — Change `@permission_classes` on `dashboard_stats`.
6. `src/api/client.ts` — Add window redirect on HTTP 401.
