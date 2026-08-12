# Handoff Report — Explorer M1 (Django Admin Removal Strategy)

## 1. Observation

Direct code observations from inspection of `backend/`:

1. **`backend/centr_form/settings.py` (lines 11–18)**:
```python
11: DJANGO_APPS = [
12:     'django.contrib.admin',
13:     'django.contrib.auth',
14:     'django.contrib.contenttypes',
15:     'django.contrib.sessions',
16:     'django.contrib.messages',
17:     'django.contrib.staticfiles',
18: ]
```

2. **`backend/centr_form/urls.py` (lines 1, 7, 25, 28–30)**:
```python
1: from django.contrib import admin
...
7:     path('superadmin/', admin.site.urls),
...
25:     re_path(r'^(?!api/|superadmin/|media/|static/).*$', react_app_view),
...
28: admin.site.site_header = "CENTR FORM — Admin"
29: admin.site.site_title = "CENTR FORM"
30: admin.site.index_title = "O‘zBA huzuridagi Markaz"
```

3. **11 `admin.py` Files in `backend/apps/*`**:
   - `backend/apps/accounts/admin.py` (24 lines): imports `django.contrib.admin`, `UserAdmin`, `@admin.register(AdminUser)`
   - `backend/apps/applications/admin.py` (21 lines): `@admin.register(Application)`
   - `backend/apps/certificates/admin.py` (14 lines): `@admin.register(CertificateTemplate)`, `@admin.register(Certificate)`
   - `backend/apps/common/admin.py` (9 lines): `@admin.register(AuditLog)`
   - `backend/apps/events/admin.py` (17 lines): `EventGalleryInline`, `@admin.register(Event)`
   - `backend/apps/faqs/admin.py` (12 lines): `@admin.register(FAQ)`
   - `backend/apps/invitations/admin.py` (9 lines): `@admin.register(Invitation)`
   - `backend/apps/notifications/admin.py` (8 lines): `@admin.register(NotificationTemplate)`
   - `backend/apps/qr/admin.py` (9 lines): `@admin.register(QRCodeModel)`
   - `backend/apps/reports/admin.py` (6 lines): `ReportAdminSite(admin.AdminSite)`
   - `backend/apps/settings_app/admin.py` (8 lines): `@admin.register(OrganizationSettings)`
   *(Note: `backend/apps/dashboard/` has no `admin.py` file).*

---

## 2. Logic Chain

1. **`settings.py` modification**: Removing `'django.contrib.admin'` from `DJANGO_APPS` in `settings.py` (line 12) removes `django.contrib.admin` from Django's app registry. `django.contrib.auth` remains installed, preserving `AUTH_USER_MODEL = 'accounts.AdminUser'` and SimpleJWT functionality. (Based on Observation 1).
2. **`urls.py` modification**: When `django.contrib.admin` is no longer installed, referencing `admin.site` in `urls.py` results in `AttributeError`. Removing `from django.contrib import admin`, `path('superadmin/', admin.site.urls)`, and `admin.site.*` titles cleanly unhooks routing. Removing `superadmin/` from `re_path(r'^(?!api/|media/|static/).*$', react_app_view)` routes all non-API paths to the React SPA index view. (Based on Observation 2).
3. **`admin.py` stubbing**: All 11 `admin.py` files contain `@admin.register` decorators or subclasses of `admin.ModelAdmin` / `admin.AdminSite`. Replacing the content of each file with a single comment line (`# Django admin disabled - custom React admin panel used.`) strips out all Django admin code while maintaining valid Python package modules, preventing `ModuleNotFoundError` during implicit imports. (Based on Observation 3).

---

## 3. Caveats

No caveats. All target files and lines have been directly verified in the codebase.

---

## 4. Conclusion

The implementation strategy for Milestone 1 (Django Admin Removal) is complete and fully documented in `analysis.md`. The strategy requires:
1. Deleting line 12 (`'django.contrib.admin',`) in `backend/centr_form/settings.py`.
2. Updating `backend/centr_form/urls.py` to remove admin imports, paths, regex exclusion, and site titles.
3. Replacing the contents of all 11 `admin.py` files with clean stub comments (`# Django admin disabled - custom React admin panel used.`).

---

## 5. Verification Method

1. **File Inspection**: Verify that `backend/centr_form/settings.py`, `backend/centr_form/urls.py`, and the 11 `admin.py` files match the proposed code in `analysis.md`.
2. **Django System Check**: Run the following command in `backend/`:
   ```bash
   python manage.py check
   ```
   *Expected result*: `System check identified no issues (0 silenced).`
