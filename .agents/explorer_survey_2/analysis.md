# Codebase Structure & Dead Code Analysis Report

**Explorer 2: Codebase Structure & Dead Code Analyst**  
**Date**: 2026-08-12  
**Target Project**: CENTR FORM (`D:\ariza\Markaz form`)  
**Scope**: Full repository audit of Backend (Django/Python) and Frontend (React/Vite/Tailwind).

---

## Executive Summary

A comprehensive, read-only investigation was conducted across both the Backend (Django 5.0 REST Framework) and Frontend (React 19, Vite, Tailwind CSS v4) codebases. The project implements a public application/event submission portal accompanied by a **custom React Admin Panel**.

### Key Findings
1. **Default Django Admin Contamination**:
   - `django.contrib.admin` is still enabled in `INSTALLED_APPS` (`centr_form/settings.py`).
   - The route `/superadmin/` is mounted to `admin.site.urls` in `centr_form/urls.py`.
   - **11 active `admin.py` files** contain Django Admin model registrations across backend apps (`accounts`, `applications`, `certificates`, `common`, `events`, `faqs`, `invitations`, `notifications`, `qr`, `reports`, `settings_app`).
2. **Unused Code & Dead Components**:
   - **Frontend Component**: `src/components/ui/Skeleton.tsx` is completely unused.
   - **Unused Backend Imports**: Unused imports in `centr_form/views.py` (`Http404`, `serve`), `apps/applications/views.py` (`send_status_notification`), `apps/common/services.py` (`os`), `apps/dashboard/views.py` (`IsAuthenticated`), `apps/qr/services.py` (`secrets`).
   - **Unhooked Backend Modules**: `apps/notifications` (no `urls.py`), `apps/certificates`, `apps/invitations`, and `apps/reports` have models or services but no exposed REST API endpoints.
3. **Build & Config Errors**:
   - **Vite Build Error**: `vite.config.ts` line 6 imports a missing file `./.figma/make/site.json`, causing strict Vite builds to fail.
   - **PyMySQL Top-level Import Error**: `centr_form/settings.py` unconditionally imports `pymysql` at top-level (line 75) before checking `USE_SQLITE`. Running `python manage.py test` fails if `pymysql` is not installed in the Python environment, even when running against SQLite.
   - **Frontend TypeScript Errors**: `tsc --noEmit` revealed duplicate object keys in `src/i18n.tsx`, an undefined variable `watchRegion` in `ApplicationFormPage.tsx`, missing `country` fields in `mockData.ts`, and an invalid `icon` prop on `Input` in `SettingsAdminPage.tsx`.

---

## 1. Full Directory Structure & File Inventory

### Repository Root Layout
```
D:\ariza\Markaz form\
├── .agents/                    # Agent metadata, briefings, and handoffs
├── .env.production             # Frontend production environment file
├── .gitattributes & .gitignore # Git configuration
├── .mise.toml                  # Toolchain configuration (Node, pnpm)
├── AGENTS.md                   # User agent instructions & rules
├── index.html                  # Single Page Application HTML shell
├── package.json                # Frontend dependencies & scripts
├── pnpm-lock.yaml / lock.json  # Package lock files
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite + Tailwind v4 configuration
├── dist/                       # Vite production build output
├── backend/                    # Django backend application root
└── src/                        # React frontend application root
```

### Backend Directory Inventory (`backend/`)
- **Root Files**: `manage.py`, `requirements.txt`, `db.sqlite3`, `.env`, `passenger_wsgi.py`.
- **Core Package (`centr_form/`)**:
  - `__init__.py`, `settings.py`, `urls.py`, `views.py`, `wsgi.py`, `asgi.py`.
- **Applications Package (`apps/`)** (12 modular apps):
  1. `accounts/`: `models.py` (`AdminUser`), `serializers.py`, `views.py`, `permissions.py`, `urls.py`, `admin.py`, `migrations/`
  2. `applications/`: `models.py` (`Application`), `serializers.py`, `views.py`, `services.py`, `tasks.py`, `tests.py`, `urls.py`, `admin.py`, `migrations/`
  3. `certificates/`: `apps.py`, `models.py` (`Certificate`, `CertificateTemplate`), `admin.py`, `migrations/` *(No REST endpoints)*
  4. `common/`: `apps.py`, `models.py` (`AuditLog`, `Translation`), `serializers.py`, `views.py`, `services.py`, `translation_service.py`, `urls.py`, `admin.py`
  5. `dashboard/`: `apps.py`, `views.py` (`dashboard_summary`), `urls.py` *(No models/admin)*
  6. `events/`: `models.py` (`Event`, `EventGallery`), `serializers.py`, `views.py`, `urls.py`, `admin.py`, `migrations/`
  7. `faqs/`: `models.py` (`FAQ`), `serializers.py`, `views.py`, `urls.py`, `admin.py`, `migrations/`
  8. `invitations/`: `apps.py`, `models.py` (`Invitation`), `admin.py`, `migrations/` *(No REST endpoints)*
  9. `notifications/`: `apps.py`, `models.py` (`NotificationTemplate`), `services.py`, `admin.py`, `migrations/` *(No REST endpoints / urls.py)*
  10. `qr/`: `apps.py`, `models.py` (`QRCodeModel`), `services.py`, `views.py`, `urls.py`, `tests.py`, `admin.py`, `migrations/`
  11. `reports/`: `apps.py`, `services.py`, `admin.py` *(No models/views/urls)*
  12. `settings_app/`: `apps.py`, `models.py` (`OrganizationSettings`), `serializers.py`, `views.py`, `urls.py`, `admin.py`, `migrations/`
- **Media Files (`media/`)**: User upload storage for documents, passports, photos, and event banners.

### Frontend Directory Inventory (`src/`)
- **Root Files**: `main.tsx`, `App.tsx`, `index.css` (Tailwind CSS v4 entrypoint), `i18n.tsx`, `vite-env.d.ts`.
- **API (`src/api/`)**: `client.ts` (Axios API client for auth, applications, events, faqs, dashboard, settings).
- **Components (`src/components/`)**:
  - `layout/`: `AdminLayout.tsx`, `AdminSidebar.tsx`, `Footer.tsx`, `Navbar.tsx`, `PublicLayout.tsx`.
  - `ui/`: `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`, `Select.tsx`, `Skeleton.tsx` *(Dead code)*, `Textarea.tsx`, `Toast.tsx`.
- **Lib (`src/lib/`)**: `mockData.ts` (Mock data fallback), `translationService.ts` (Auto-translation handler), `utils.ts` (Classname utilities).
- **Pages (`src/pages/`)**:
  - `admin/`: `AdministratorsPage.tsx`, `ApplicationsPage.tsx`, `DashboardPage.tsx`, `EventsAdminPage.tsx`, `FAQAdminPage.tsx`, `LoginPage.tsx`, `SettingsAdminPage.tsx`.
  - `public/`: `ApplicationFormPage.tsx`, `EventDetailPage.tsx`, `EventsPage.tsx`, `FAQPage.tsx`, `HomePage.tsx`, `TrackApplicationPage.tsx`.
- **Router (`src/router/`)**: `index.tsx` (React Router DOM configuration).
- **Store (`src/store/`)**: `authStore.ts` (JWT session management), `dataStore.tsx` (Application state Context provider).
- **Types (`src/types/`)**: `index.ts` (Shared TypeScript definitions).

---

## 2. Unused Imports, Dead Code, & Boilerplate Audit

### A. Default Django Admin Dependencies & Files to Clean Up
To fulfill requirement R1 (Complete removal of Django Admin), the following references must be purged:
1. `backend/centr_form/settings.py`:
   - Line 12: `'django.contrib.admin'` in `DJANGO_APPS`.
2. `backend/centr_form/urls.py`:
   - Line 1: `from django.contrib import admin`
   - Line 7: `path('superadmin/', admin.site.urls),`
   - Line 25: `re_path(r'^(?!api/|superadmin/|media/|static/).*$', react_app_view),` (remove `superadmin/` from regex negative lookahead).
   - Lines 28-30: Header/title configurations (`admin.site.site_header`, etc.).
3. **11 `admin.py` Boilerplate Files**:
   - `backend/apps/accounts/admin.py`
   - `backend/apps/applications/admin.py`
   - `backend/apps/certificates/admin.py`
   - `backend/apps/common/admin.py`
   - `backend/apps/events/admin.py`
   - `backend/apps/faqs/admin.py`
   - `backend/apps/invitations/admin.py`
   - `backend/apps/notifications/admin.py`
   - `backend/apps/qr/admin.py`
   - `backend/apps/reports/admin.py`
   - `backend/apps/settings_app/admin.py`

### B. Dead Code & Unused Imports
1. **Frontend Component**:
   - `src/components/ui/Skeleton.tsx`: Unused anywhere in `src/`.
2. **Backend Unused Imports**:
   - `backend/centr_form/views.py`: `from django.http import Http404` and `from django.views.static import serve` (unused).
   - `backend/apps/applications/views.py`: `from .tasks import send_status_notification` (imported, never called).
   - `backend/apps/common/services.py`: `import os` (unused).
   - `backend/apps/dashboard/views.py`: `from rest_framework.permissions import IsAuthenticated` (unused).
   - `backend/apps/qr/services.py`: `import secrets` (unused).

### C. Unhooked / Redundant Backend Modules
- `apps/notifications`: Lacks `urls.py`; `NotificationTemplate` model and services exist but cannot be reached via REST API.
- `apps/certificates`, `apps/invitations`, `apps/reports`: Models and services exist without exposure via views/urls.

### D. Code Quality & Compilation Errors
- `vite.config.ts`: Imports missing `./.figma/make/site.json`.
- `centr_form/settings.py`: Line 75 `import pymysql` crashes when running tests without `pymysql` installed. Wrapping in `try...except ImportError:` fixes test compatibility.
- `src/pages/public/ApplicationFormPage.tsx`: Line 80 contains undeclared variable `watchRegion`.
- `src/pages/admin/SettingsAdminPage.tsx`: Passes invalid `icon` prop to `Input`.
- `src/i18n.tsx`: Duplicate object keys at lines 295, 593, 878, 886.
- `src/lib/mockData.ts`: Missing `country` property on mock `Application` items.

---

## 3. Build & Test Commands Documentation

### Frontend Commands

| Command | Working Dir | Prerequisites | Description / Status |
|---|---|---|---|
| `npm run dev` / `pnpm dev` | `D:\ariza\Markaz form` | Node.js | Launches Vite dev server on port 8443 with hot reload. |
| `npm run build` / `pnpm build` | `D:\ariza\Markaz form` | Node.js | Builds production assets to `dist/`. Note: Fails if `vite.config.ts` cannot resolve `./.figma/make/site.json`. |
| `npx tsc --noEmit` | `D:\ariza\Markaz form` | Node.js | Runs TypeScript type checker. Reports existing type/syntax errors. |
| `npm run format` | `D:\ariza\Markaz form` | Node.js | Formats code using `oxfmt`. |

### Backend Commands

| Command | Working Dir | Prerequisites | Description / Status |
|---|---|---|---|
| `python manage.py test apps --settings=centr_form.settings` | `D:\ariza\Markaz form\backend` | Python 3.12, Django 5.0 | Runs backend unit tests. **Requires wrapping `import pymysql` in `settings.py` or mocking `pymysql`**. All 7 tests pass OK. |
| `python manage.py runserver` | `D:\ariza\Markaz form\backend` | Python 3.12, Django 5.0 | Starts Django backend API server on port 8000. |
| `python manage.py migrate` | `D:\ariza\Markaz form\backend` | Database (SQLite/MySQL) | Applies database migrations. |
| `python manage.py makemigrations` | `D:\ariza\Markaz form\backend` | Python 3.12, Django 5.0 | Creates database migration files. |

---

## 4. Active Backend API Endpoints & Custom Admin Components

### Active Backend REST API Endpoints (`/api/v1/`)

1. **Authentication (`/api/v1/auth/` & `/api/v1/accounts/`)**:
   - `POST login/` — `LoginView` (AllowAny) — JWT Login.
   - `POST logout/` — `logout_view` (IsAuthenticated) — JWT Logout.
   - `POST token/refresh/` — `TokenRefreshView` (AllowAny) — Refresh token rotation.
   - `GET/PUT/PATCH me/` — `me_view` (IsAuthenticated) — Profile management.
   - `POST change-password/` — `change_password_view` (IsAuthenticated) — Password change.
   - `GET/POST users/` — `AdminUserListCreateView` (IsAdminOrAbove) — Admin list/create.
   - `GET/PUT/PATCH/DELETE users/<id>/` — `AdminUserDetailView` (IsAdminOrAbove) — Admin CRUD.

2. **Events (`/api/v1/events/`)**:
   - `GET /` — `EventListView` (AllowAny) — Public events list.
   - `GET <id>/` — `EventDetailView` (AllowAny) — Public event detail.
   - `GET/POST admin/` — `AdminEventListCreateView` (IsModeratorOrAbove) — Admin event management.
   - `GET/PUT/PATCH/DELETE admin/<id>/` — `AdminEventDetailView` (IsModeratorOrAbove) — Admin event detail/update.
   - `POST admin/<id>/gallery/` — `add_gallery_image` (IsModeratorOrAbove) — Event gallery upload.
   - `GET stats/` — `dashboard_stats` (IsModeratorOrAbove) — Event analytics.

3. **Applications (`/api/v1/applications/`)**:
   - `POST submit/` — `SubmitApplicationView` (AllowAny) — Submit application (with files).
   - `GET track/<application_id>/` — `track_application` (AllowAny) — Track application status.
   - `GET admin/` — `AdminApplicationListView` (IsModeratorOrAbove) — Admin applications list & search.
   - `GET admin/export/excel/` — `export_applications_excel` (IsAdminOrAbove) — Export applications to `.xlsx`.
   - `DELETE admin/bulk-delete/` — `bulk_delete_applications` (IsModeratorOrAbove) — Bulk delete applications.
   - `GET/DELETE admin/<id>/` — `AdminApplicationDetailView` (IsModeratorOrAbove) — Application detail/delete.
   - `PATCH admin/<id>/status/` — `update_application_status` (IsModeratorOrAbove) — Update status & comment.

4. **FAQs (`/api/v1/faqs/`)**:
   - `GET /` — `FAQListView` (AllowAny) — Public FAQs.
   - `GET/POST admin/` — `AdminFAQListCreateView` (IsModeratorOrAbove) — Admin FAQ CRUD.
   - `GET/PUT/PATCH/DELETE admin/<id>/` — `AdminFAQDetailView` (IsModeratorOrAbove) — Admin FAQ detail/delete.

5. **Dashboard (`/api/v1/dashboard/`)**:
   - `GET /` — `dashboard_summary` (IsModeratorOrAbove) — Aggregated statistics for admin dashboard.

6. **QR Verification (`/api/v1/qr/`)**:
   - `GET verify/<qr_type>/<object_id>/` — `verify_qr` (AllowAny) — Public QR verification.

7. **Organization Settings (`/api/v1/settings/`)**:
   - `GET organization/` — `PublicOrganizationSettingsView` (AllowAny) — Public org details.
   - `GET/PUT/PATCH admin/organization/` — `AdminOrganizationSettingsView` (IsAdminOrAbove) — Admin org settings.

8. **Common & Translations (`/api/v1/common/`)**:
   - `POST translate/content/` — `translate_content_view` (IsModeratorOrAbove) — Auto-translation API.
   - `GET/POST/PUT/DELETE /` — `TranslationViewSet` (IsModeratorOrAbove) — Translation model CRUD.

---

### Custom React Admin Components & Pages

- **Layout & Shell**:
  - `AdminLayout.tsx`: Shell component providing header navigation, profile menu, language selector, and main content outlet.
  - `AdminSidebar.tsx`: Sidebar navigation menu with role-based badges and active route indicators.
- **Admin Pages**:
  - `LoginPage.tsx`: Authentication screen for admin users.
  - `DashboardPage.tsx`: Admin dashboard with analytics cards, recent submissions table, and charts.
  - `ApplicationsPage.tsx`: Full application management interface with filters, search, modal details, status updates, and Excel export.
  - `EventsAdminPage.tsx`: Event CRUD interface with registration toggle, limits, and banner uploads.
  - `FAQAdminPage.tsx`: Interactive FAQ editor and order management.
  - `AdministratorsPage.tsx`: Admin user management table for Super Admins.
  - `SettingsAdminPage.tsx`: System settings and organization configuration portal.

---

## Recommended Cleanup Action Plan

1. **Purge Django Admin Dependencies (R1)**:
   - Remove `'django.contrib.admin'` from `DJANGO_APPS` in `centr_form/settings.py`.
   - Remove `path('superadmin/', admin.site.urls)` and admin imports from `centr_form/urls.py`.
   - Delete or blank out all 11 `admin.py` files in `apps/*/admin.py`.
2. **Clean Up Dead & Unused Code (R2)**:
   - Delete unused component `src/components/ui/Skeleton.tsx`.
   - Remove unused imports across backend (`centr_form/views.py`, `apps/applications/views.py`, `apps/common/services.py`, `apps/dashboard/views.py`, `apps/qr/services.py`).
   - Fix `vite.config.ts` import for site configuration to prevent build errors.
3. **Fix Backend Settings & Frontend Bugs (R3)**:
   - Wrap `import pymysql` in `centr_form/settings.py` with `try...except ImportError: pass`.
   - Fix `watchRegion` undefined variable in `ApplicationFormPage.tsx`.
   - Fix `Input` `icon` prop in `SettingsAdminPage.tsx`.
   - Fix duplicate translation keys in `i18n.tsx`.
   - Add missing `country` field in `mockData.ts`.

