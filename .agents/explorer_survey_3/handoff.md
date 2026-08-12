# Handoff Report — Explorer 3 (Security & Bug Auditor)

## 1. Observation
- **Django Settings**:
  - `backend/centr_form/settings.py:7-8`: `SECRET_KEY` falls back to `'django-insecure-change-this-in-production'`, `DEBUG` defaults to `True`.
  - `backend/centr_form/settings.py:164-166`: When `DEBUG=True`, `CORS_ALLOW_ALL_ORIGINS = True` is automatically set alongside `CORS_ALLOW_CREDENTIALS = True`.
  - `backend/centr_form/settings.py:90-95`: Hardcoded database default credentials (`uzbamala_wp118`, `uzbamala_ariza`).
- **Permissions & Authorization**:
  - `backend/apps/accounts/permissions.py:20-22`: `IsModeratorOrAbove` contains `return request.user.is_authenticated`, failing to check `request.user.role`.
  - `backend/apps/applications/views.py:103-105`: `bulk_delete_applications` uses `IsModeratorOrAbove`, allowing any authenticated user to delete records in bulk.
  - `backend/apps/events/views.py:71-73`: `dashboard_stats` uses `permission_classes = [permissions.AllowAny]`, exposing internal metrics publicly.
- **Input & File Upload Validation**:
  - `backend/apps/applications/serializers.py:6-13`: `ApplicationSubmitSerializer` handles file fields without invoking `FileManagementService.validate_file()`, permitting arbitrary file extensions.
- **Frontend Auth & Integration**:
  - `src/api/client.ts:15-21`: `apiClient` only attaches single access token from `localStorage` without JWT refresh handler.
  - `src/router/index.tsx`: Admin routes rely only on `isAuthenticated` check in `AdminLayout.tsx`, lacking role-based route protection.

## 2. Logic Chain
1. **Settings / CORS Vulnerability**: Hardcoding fallback secret keys and enabling `CORS_ALLOW_ALL_ORIGINS` whenever `DEBUG=True` creates a major risk of credential leakage via cross-origin requests.
2. **Permission Bypass**: `IsModeratorOrAbove` checks `is_authenticated` without role filtering. Consequently, any authenticated account gains moderator access across multiple critical endpoints (such as bulk application deletion).
3. **File Upload Risk**: Unvalidated file uploads in public application submission allow arbitrary file types to be stored in the media directory, leading to potential execution or stored XSS vulnerabilities.
4. **Auth Expiration Risk**: The React client stores access tokens in `localStorage` without handling token refresh calls, causing abrupt session drops every 60 minutes for logged-in administrators.

## 3. Caveats
- Production deployment environment variables (`.env`) were not inspected as they are excluded or populated at runtime.
- Real database execution and server runtime logs were not evaluated; code inspection was used for static analysis.

## 4. Conclusion
The backend contains critical authorization flaws (most notably in `IsModeratorOrAbove`), file upload validation omissions, and development configuration defaults (`CORS_ALLOW_ALL_ORIGINS`, hardcoded fallback `SECRET_KEY`). Immediate remediation is required to secure authorization boundaries and input validation.

## 5. Verification Method
- Inspection of `backend/apps/accounts/permissions.py` line 20-22 using `view_file`.
- Inspection of `backend/centr_form/settings.py` line 164-166 using `view_file`.
- Inspection of `backend/apps/applications/serializers.py` line 6-27 using `view_file`.
- Full audit report stored at `D:\ariza\Markaz form\.agents\explorer_survey_3\analysis.md`.
