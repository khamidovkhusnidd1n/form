# Project Specification: Django Admin Removal, Codebase Audit & Security Remediation

## Architecture
- **Backend**: Django 5 + Django REST Framework (DRF) located in `backend/`.
  - Core settings & URLs: `backend/centr_form/`
  - Domain applications: `backend/apps/` (`accounts`, `applications`, `certificates`, `common`, `dashboard`, `events`, `faqs`, `invitations`, `notifications`, `qr`, `reports`, `settings_app`)
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 located in `src/`.
  - Entry points: `index.html`, `src/main.tsx`, `src/App.tsx`
  - Components & UI: `src/components/`, `src/pages/`, `src/api/`

## Feature Inventory
| # | Feature / Task | Description | Milestone | Source |
|---|----------------|-------------|-----------|--------|
| 1 | Remove `django.contrib.admin` app | Remove from `INSTALLED_APPS` in `backend/centr_form/settings.py` | M1 | Survey |
| 2 | Remove admin routes | Remove `admin.site.urls` and `/superadmin/` route from `backend/centr_form/urls.py` | M1 | Survey |
| 3 | Remove/Clear `admin.py` files | Clean all 11 `admin.py` files in `backend/apps/*` | M1 | Survey |
| 4 | Remove dead/unused code | Delete `src/components/ui/Skeleton.tsx` | M2 | Survey |
| 5 | Clean dead imports | Remove unused imports in `centr_form/views.py`, `apps/applications/views.py`, `apps/common/services.py`, `apps/dashboard/views.py`, `apps/qr/services.py` | M2 | Survey |
| 6 | Fix Vite build import | Remove non-existent `./.figma/make/site.json` import in `vite.config.ts` | M2 | Survey |
| 7 | Fix backend test environment | Make `pymysql` import in `settings.py` conditional to allow running unit tests without `pymysql` | M2 | Survey |
| 8 | Fix backend unit test stub | Add `is_registration_open` property to `EventStub` in `backend/apps/applications/tests.py` | M2 | Survey |
| 9 | Clean TypeScript errors | Fix TS errors in `ApplicationFormPage.tsx`, `Input.tsx` prop usage, `i18n.tsx`, `mockData.ts` | M2 | Survey |
| 10 | Fix permission bypass | Correct `IsModeratorOrAbove` in `backend/apps/accounts/permissions.py` to check role | M3 | Survey |
| 11 | Fix file upload security gap | Add format & size validation to `ApplicationSubmitSerializer` in `backend/apps/applications/serializers.py` | M3 | Survey |
| 12 | Fix insecure settings | Secure CORS/CSRF/SECRET_KEY configurations in `backend/centr_form/settings.py` | M3 | Survey |
| 13 | Secure stats endpoint | Restrict `/api/v1/events/stats/` permission from `AllowAny` to authenticated/moderator | M3 | Survey |
| 14 | API client 401 handling | Implement clean 401 unauthenticated redirect handling in `src/api/client.ts` | M3 | Survey |
| 15 | Verification & Forensic Audit | Run frontend build (`npm run build`), backend unit tests, and verify custom React admin panel functionality | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Django Admin Removal | Remove `django.contrib.admin` from `settings.py`, `urls.py`, and clean all 11 `admin.py` files | None | DONE |
| M2 | Codebase Audit & Cleanup | Remove dead code/files, clean unused imports, fix Vite config & test stubs, fix TS errors | M1 | DONE |
| M3 | Security & Bug Remediation | Fix permission bypasses, file upload validation, settings security, and API permissions | M2 | IN_PROGRESS |
| M4 | Final E2E Verification & Audit | Verify build, backend unit tests, custom React admin panel, and run Forensic Integrity Auditor | M3 | PLANNED |

## Interface Contracts
- **React Custom Admin Panel**: Relies on DRF endpoints under `/api/v1/` (`/api/v1/accounts/`, `/api/v1/applications/`, `/api/v1/events/`, `/api/v1/dashboard/`, etc.). None of these endpoints depend on Django Admin.
- **Auth Tokens**: JWT Bearer tokens passed in `Authorization: Bearer <token>` header.

## Code Layout
- `backend/centr_form/settings.py` - Core Django settings
- `backend/centr_form/urls.py` - Root URL routing
- `backend/apps/*/admin.py` - App admin registrations (cleared)
- `backend/apps/accounts/permissions.py` - Permission classes
- `backend/apps/applications/serializers.py` - Application serializers
- `backend/apps/events/views.py` - Event views & statistics
- `src/` - React frontend SPA
- `vite.config.ts` - Vite build configuration
