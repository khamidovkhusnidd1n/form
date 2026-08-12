# Comprehensive Backend & React Admin Security, Configuration, and Code Quality Audit

**Date**: 2026-08-12  
**Auditor**: Explorer 3 (Security & Bug Auditor)  
**Target Project**: `D:\ariza\Markaz form`  

---

## Executive Summary

An initial security, configuration, and architectural audit was performed on the `CENTR FORM` application (`backend/` Django REST service and `src/` React admin panel). 
The project demonstrates good foundation (using JWT, custom user models, role-based DRF permissions, and Zod/TypeScript validation on the frontend). However, **critical security vulnerabilities**, **sensitive data leak risks**, and **logical bugs** were identified across settings, authorization logic, input validation, and frontend state handling.

---

## Section 1: Django Settings & Infrastructure Audit

### 1.1 `DEBUG` & Secrets Management
- **File Location**: `backend/centr_form/settings.py` (Line 7-8)
- **Observation**:
  - `SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')`
  - `DEBUG = config('DEBUG', default=True, cast=bool)`
- **Risk / Vulnerability**: 
  - **High Risk**: Standard fallback secret key is hardcoded. If `.env` is absent or `SECRET_KEY` is not defined in production environment variables, sessions/JWTs could be forged.
  - **High Risk**: `DEBUG` defaults to `True`. Detailed tracebacks will expose secret keys, environment variables, database structure, and full stack traces if unhandled errors occur in production.

### 1.2 `ALLOWED_HOSTS` & Wildcard Exposure
- **File Location**: `backend/centr_form/settings.py` (Line 9)
- **Observation**: `ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')`
- **Risk / Vulnerability**:
  - **Medium Risk**: Defaulting to `*` allows Host Header Injection attacks if not properly restricted in production.

### 1.3 CORS Configuration & Dynamic Relaxation
- **File Location**: `backend/centr_form/settings.py` (Lines 155–166)
- **Observation**:
  ```python
  CORS_ALLOWED_ORIGINS = [ ... ]
  if DEBUG:
      CORS_ALLOW_ALL_ORIGINS = True
  ```
- **Risk / Vulnerability**:
  - **High Risk**: When `DEBUG=True` (which is default), `CORS_ALLOW_ALL_ORIGINS = True` overrides `CORS_ALLOWED_ORIGINS` and `CORS_ALLOW_CREDENTIALS = True`. Any malicious site visited by an authenticated admin can make cross-origin requests to the API with credentials.

### 1.4 Database Credentials & Connection Configuration
- **File Location**: `backend/centr_form/settings.py` (Lines 78–96)
- **Observation**:
  - Hardcoded default database user (`uzbamala_wp118`) and database name (`uzbamala_ariza`).
  - Empty default password `config('DATABASE_PASSWORD', default='')`.
- **Risk / Vulnerability**:
  - **Medium Risk**: Exposure of legacy/internal production schema and user names in source code.

### 1.5 Security Headers & CSRF
- **File Location**: `backend/centr_form/settings.py` (Lines 185–194)
- **Observation**: Security headers (`SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `X_FRAME_OPTIONS`) are conditional on `not DEBUG`.
- **Risk / Vulnerability**:
  - **Low / Medium Risk**: In local dev or staging mode where `DEBUG=True`, security headers are disabled. Ensure production deployment guarantees `DEBUG=False`.

---

## Section 2: API Endpoints, Authorization, & Input Validation Audit

### 2.1 Permission Bypass & Role Verification Defect in `IsModeratorOrAbove`
- **File Location**: `backend/apps/accounts/permissions.py` (Lines 20–22)
- **Observation**:
  ```python
  class IsModeratorOrAbove(BasePermission):
      def has_permission(self, request, view):
          return request.user.is_authenticated
  ```
- **Risk / Vulnerability**:
  - **CRITICAL SECURITY VULNERABILITY**: `IsModeratorOrAbove` simply checks `request.user.is_authenticated`. Any authenticated user account — regardless of their role string or disabled privileges — passes this check. If future user roles (e.g. standard applicants or restricted external users) are added, they gain full access to moderator endpoints (viewing all submitted applications, updating status, bulk deleting applications, viewing dashboard stats, etc.).

### 2.2 Unauthenticated Public Endpoint Exposing System Metrics
- **File Location**: `backend/apps/events/views.py` (Lines 71–88) & `backend/apps/events/urls.py` (Line 10)
- **Observation**:
  ```python
  @api_view(['GET'])
  @permission_classes([permissions.AllowAny])
  def dashboard_stats(request):
  ```
- **Risk / Vulnerability**:
  - **MEDIUM SECURITY ISSUE**: The `/api/v1/events/stats/` endpoint is marked `AllowAny`. Any unauthenticated user or automated scanner can query detailed application statistics (total applications, approved count, rejected count, pending count, today's applications). This leaks internal analytics.

### 2.3 File Upload Validation Defect & Arbitrary Execution Risk
- **File Location**: `backend/apps/applications/serializers.py` (Lines 6–13) & `backend/apps/common/services.py` (Lines 14–21)
- **Observation**:
  - `ApplicationSubmitSerializer` handles `document`, `passport`, `photo` file uploads directly via DRF standard fields without enforcing `FileManagementService.validate_uploaded_file()`.
  - `FileManagementService` has defined file extension sets (`ALLOWED_EXTENSIONS`), but neither `ApplicationSubmitSerializer` nor `SubmitApplicationView` calls this validation!
- **Risk / Vulnerability**:
  - **HIGH VULNERABILITY**: An applicant can upload executable scripts (`.py`, `.php`, `.exe`, `.html`) in `document` or `passport` fields. Since WhiteNoise or media serving hosts uploaded media files, malicious scripts or stored XSS HTML payloads could be uploaded and served from `/media/`.

### 2.4 Unrestricted Bulk Deletion Endpoint
- **File Location**: `backend/apps/applications/views.py` (Lines 103–112)
- **Observation**:
  ```python
  @api_view(['DELETE'])
  @permission_classes([IsModeratorOrAbove])
  def bulk_delete_applications(request):
      ids = request.data.get('ids', [])
      ...
      deleted_count, _ = Application.objects.filter(id__in=ids).delete()
  ```
- **Risk / Vulnerability**:
  - **HIGH RISK**: Because `IsModeratorOrAbove` allows any authenticated user, any user can send a list of IDs (or iterate across all integers) to bulk-delete applications from the database permanently without secondary confirmation or role limitation (should require `IsAdminOrAbove`).

### 2.5 Dynamic Filter Injection / SQL & Query Param Exposure in Excel Export
- **File Location**: `backend/apps/applications/views.py` (Lines 114–120)
- **Observation**:
  ```python
  apps = Application.objects.select_related('event').filter(
      **{k: v for k, v in request.query_params.items() if k in ['status', 'event_id']}
  ).order_by('-submitted_at')
  ```
- **Risk / Vulnerability**:
  - **LOW / MEDIUM RISK**: While limited to specific keys `['status', 'event_id']`, passing raw string values directly to `filter()` without serializer field casting/validation could lead to 500 server errors (e.g. passing invalid non-integer string to `event_id`).

### 2.6 Unauthenticated Translation API Abuse
- **File Location**: `backend/apps/common/views.py` (Lines 14–64, 123–151)
- **Observation**: `TranslationViewSet` and `translate_content_view` are marked `AllowAny` / unauthenticated.
- **Risk / Vulnerability**:
  - **LOW RISK / DOS RISK**: Public endpoint accepts arbitrary content JSON and translates via backend logic. Rate limiting (`100/hour` for anon) is applied globally, but unauthenticated endpoints handling complex payloads can be abused for Denial of Service if heavy translation backends are integrated.

---

## Section 3: Custom React Admin Integration & Auth Flow Audit

### 3.1 Hardcoded Local Storage Auth Key & Insecure Storage
- **File Location**: `src/store/authStore.ts` (Lines 4–21)
- **Observation**:
  - User object (including email, full name, role) and raw JWT token are stored directly in `localStorage` under `centr-form-auth`.
- **Risk / Vulnerability**:
  - **MEDIUM RISK**: `localStorage` is accessible by any script executing in the same origin. If XSS occurs anywhere on the domain, JWT tokens and user metadata can be read instantly. (Note: Using `HttpOnly` cookies for JWT refresh tokens is recommended for production security).

### 3.2 Frontend Single Token Storage & Missing Refresh Logic
- **File Location**: `src/api/client.ts` (Lines 15–21) & `src/pages/admin/LoginPage.tsx` (Lines 47)
- **Observation**:
  - Frontend only stores `res.data.access` token.
  - No automatic token refresh mechanism implemented in `apiClient` response interceptor when receiving `401`. Upon 401, it simply executes `clearStoredAuth()` and logs out the admin.
- **Risk / Vulnerability**:
  - **LOGICAL / UX BUG**: Admin sessions expire abruptly after 60 minutes (`ACCESS_TOKEN_LIFETIME_MINUTES = 60`), discarding unsaved administrative work without background refresh using `refresh_token`.

### 3.3 Lack of Password Change UI Verification
- **File Location**: `backend/apps/accounts/views.py` (Lines 69–80)
- **Observation**: `change_password_view` requires `old_password` and `new_password`. However, password complexity check is minimal (`min_length=8`), and Django's `AUTH_PASSWORD_VALIDATORS` are not run against `new_password` in `ChangePasswordSerializer`!

### 3.4 Missing Role-Based Route Guards on Frontend
- **File Location**: `src/router/index.tsx` (Lines 33–45) & `src/components/layout/AdminLayout.tsx` (Lines 6–8)
- **Observation**:
  - `AdminLayout` only checks `if (!isAuthenticated) return <Navigate to="/admin/login" replace />`.
  - There are no role checks for restricted admin pages such as `/admin/administrators` or `/admin/settings`. A logged-in `Moderator` can navigate directly to `/admin/administrators` in the browser UI. (Though backend endpoints reject unauthorized requests, UI does not gracefully restrict or hide these views).

---

## Section 4: Summary Table of Audit Findings

| # | Vulnerability / Bug | File Location | Severity | Category |
|---|---|---|---|---|
| 1 | Hardcoded fallback `SECRET_KEY` & `DEBUG=True` default | `backend/centr_form/settings.py:7-8` | High | Configuration |
| 2 | `CORS_ALLOW_ALL_ORIGINS = True` when `DEBUG=True` | `backend/centr_form/settings.py:164-166` | High | Security / CORS |
| 3 | `IsModeratorOrAbove` permission bypass (allows any authenticated user) | `backend/apps/accounts/permissions.py:20-22` | Critical | Authentication / AuthZ |
| 4 | File upload lacks extension & MIME validation | `backend/apps/applications/serializers.py` & `common/services.py` | High | File Upload Security |
| 5 | Public unauthenticated access to system stats | `backend/apps/events/views.py:71-73` | Medium | Information Disclosure |
| 6 | Bulk delete endpoint accessible to any authenticated user | `backend/apps/applications/views.py:103-105` | High | Authorization |
| 7 | Legacy DB credentials & names hardcoded in settings | `backend/centr_form/settings.py:90-95` | Medium | Security |
| 8 | Lack of JWT token refresh logic on React frontend | `src/api/client.ts:15-21` | Low/Bug | Auth Flow / UX |
| 9 | Missing role-based route protection on React Router | `src/router/index.tsx` & `AdminLayout.tsx` | Low/Bug | Frontend Auth |
| 10 | Password change does not enforce Django password validators | `backend/apps/accounts/serializers.py:43-45` | Low | Password Security |

---

## Section 5: Recommendations for Next Steps

1. **Fix `IsModeratorOrAbove` Permission**: Update permission class to strictly verify `request.user.role in ('super_admin', 'administrator', 'moderator')`.
2. **Implement Strict File Upload Validation**: Add validator functions in `ApplicationSubmitSerializer` checking file extension and MIME type against allowed image/document formats.
3. **Restrict `/api/v1/events/stats/`**: Require `IsModeratorOrAbove` or specific authenticated permission.
4. **Harden Environment Configurations**: Ensure `SECRET_KEY` is required from env, remove `CORS_ALLOW_ALL_ORIGINS = True` in debug mode unless strictly needed for specific origins, and set strict `ALLOWED_HOSTS`.
5. **Enhance React JWT Flow**: Store refresh tokens securely and implement silent refresh handling on HTTP 401 responses.
