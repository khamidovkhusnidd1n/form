# Milestone 2 (Codebase Audit & Cleanup) — Detailed Analysis Report

**Explorer**: Explorer for Milestone 2 (Codebase Audit & Cleanup)  
**Working Directory**: `D:\ariza\Markaz form\.agents\explorer_m2_1`  
**Date**: 2026-08-12  
**Target Milestone**: M2 (Codebase Audit & Cleanup)  

---

## Executive Summary

This report presents an itemized, line-by-line implementation strategy for Milestone 2 of the CENTR FORM project. A thorough audit was conducted across frontend (React 19, Vite 8, TypeScript 5.7, Tailwind CSS v4) and backend (Django 5.0, DRF) target files to verify exact lines, syntax errors, missing properties, and dead code.

Implementing these exact changes will resolve:
- 1 dead component deletion.
- 5 backend files with unused imports.
- 1 broken Vite module import (`site.json`).
- 1 backend settings SQLite/MySQL import coupling issue.
- 1 backend unit test stub failure (`EventStub.is_registration_open`).
- 13 TypeScript compilation errors across 4 frontend files.

---

## 1. Dead Code File Deletion

### File: `src/components/ui/Skeleton.tsx`
- **Path**: `D:\ariza\Markaz form\src\components\ui\Skeleton.tsx`
- **Total Lines**: 20
- **Audit Findings**: Codebase-wide search confirmed `Skeleton` and `CardSkeleton` are not imported or referenced anywhere in `src/` or `backend/`.
- **Action**: Delete file `src/components/ui/Skeleton.tsx`.

---

## 2. Backend Unused Imports Cleanup

### 2.1 `backend/centr_form/views.py`
- **Path**: `D:\ariza\Markaz form\backend\centr_form\views.py`
- **Current Content (Lines 1–5)**:
  ```python
  import os
  from django.conf import settings
  from django.http import HttpResponse, Http404
  from django.views.static import serve

  def react_app_view(request):
  ```
- **Analysis**:
  - Line 3 imports `Http404`, which is never referenced in `views.py`.
  - Line 4 imports `serve`, which is never referenced in `views.py`.
- **Implementation Strategy**:
  - Change line 3 to: `from django.http import HttpResponse`
  - Remove line 4: `from django.views.static import serve`

### 2.2 `backend/apps/applications/views.py`
- **Path**: `D:\ariza\Markaz form\backend\apps\applications\views.py`
- **Current Content (Line 17)**:
  ```python
  from apps.accounts.permissions import IsAdminOrAbove, IsModeratorOrAbove
  from .tasks import send_status_notification
  from .services import ApplicationService
  ```
- **Analysis**: `send_status_notification` is imported on line 17 but never called anywhere within `views.py`.
- **Implementation Strategy**: Remove line 17 (`from .tasks import send_status_notification`).

### 2.3 `backend/apps/common/services.py`
- **Path**: `D:\ariza\Markaz form\backend\apps\common\services.py`
- **Current Content (Lines 1–5)**:
  ```python
  import os
  from pathlib import Path
  from django.conf import settings
  from django.core.files.storage import default_storage
  ```
- **Analysis**: Line 1 imports `os`, but the service exclusively uses `pathlib.Path` and `django.conf.settings`. `os` is never used.
- **Implementation Strategy**: Remove line 1 (`import os`).

### 2.4 `backend/apps/dashboard/views.py`
- **Path**: `D:\ariza\Markaz form\backend\apps\dashboard\views.py`
- **Current Content (Lines 1–5)**:
  ```python
  from rest_framework.decorators import api_view, permission_classes
  from rest_framework.permissions import IsAuthenticated
  from rest_framework.response import Response
  from apps.reports.services import ReportService
  from apps.accounts.permissions import IsModeratorOrAbove
  ```
- **Analysis**: Line 2 imports `IsAuthenticated`, but the view at line 9 uses `@permission_classes([IsModeratorOrAbove])`. `IsAuthenticated` is unused.
- **Implementation Strategy**: Remove line 2 (`from rest_framework.permissions import IsAuthenticated`).

### 2.5 `backend/apps/qr/services.py`
- **Path**: `D:\ariza\Markaz form\backend\apps\qr\services.py`
- **Current Content (Lines 1–4)**:
  ```python
  import hashlib
  import hmac
  import secrets
  from typing import Any
  ```
- **Analysis**: Line 3 imports `secrets`, but hashing operations use `hashlib` and `hmac`. `secrets` is unused.
- **Implementation Strategy**: Remove line 3 (`import secrets`).

---

## 3. Vite Build Configuration Fix (`vite.config.ts`)

- **Path**: `D:\ariza\Markaz form\vite.config.ts`
- **Current Content (Line 6 & Line 22)**:
  ```ts
  6: import siteConfiguration from './.figma/make/site.json'
  ...
  22: figmaSiteConfiguration(siteConfiguration),
  ```
- **Analysis**: The file `./.figma/make/site.json` does not exist in the repository. Running `npm run build` or `vite build` causes TypeScript and Vite to fail with `Cannot find module './.figma/make/site.json'`.
- **Implementation Strategy**:
  - Replace line 6 (`import siteConfiguration from './.figma/make/site.json'`) with:
    ```ts
    const siteConfiguration: FigmaSiteConfiguration = {}
    ```
  - This preserves the `figmaSiteConfiguration(siteConfiguration)` plugin call while allowing `figmaSiteConfiguration` to utilize its built-in fallback defaults (`title: "Figma Make App"`, `language: "en"`).

---

## 4. Conditional `pymysql` Import Fix (`backend/centr_form/settings.py`)

- **Path**: `D:\ariza\Markaz form\backend\centr_form\settings.py`
- **Current Content (Lines 74–88)**:
  ```python
  try:
      import pymysql
      pymysql.install_as_MySQLdb()
  except ImportError:
      pass

  USE_SQLITE = config('USE_SQLITE', default=False, cast=bool)
  if USE_SQLITE:
      DATABASES = {
          'default': {
              'ENGINE': 'django.db.backends.sqlite3',
              'NAME': BASE_DIR / 'db.sqlite3',
          }
      }
  else:
      DATABASES = { ... }
  ```
- **Analysis**: `pymysql` is imported unconditionally before checking `USE_SQLITE`. When running backend tests or running in SQLite mode (`USE_SQLITE=True`), initializing MySQL driver hooks is unnecessary and can cause failures in environments without `pymysql`.
- **Implementation Strategy**:
  - Move the `pymysql` import block inside the `else:` branch of `if USE_SQLITE:`.
  - Replacement block for lines 74–95:
    ```python
    USE_SQLITE = config('USE_SQLITE', default=False, cast=bool)
    if USE_SQLITE:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    else:
        try:
            import pymysql
            pymysql.install_as_MySQLdb()
        except ImportError:
            pass

        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.mysql',
                'NAME': config('DB_NAME', default='centr_form'),
                'USER': config('DB_USER', default='root'),
                'PASSWORD': config('DB_PASSWORD', default=''),
                'HOST': config('DB_HOST', default='localhost'),
                'PORT': config('DB_PORT', default='3306'),
                'OPTIONS': {
                    'charset': 'utf8mb4',
                },
            }
        }
    ```

---

## 5. Backend Test Stub Property Fix (`backend/apps/applications/tests.py`)

- **Path**: `D:\ariza\Markaz form\backend\apps\applications\tests.py`
- **Current Content (Lines 6–14)**:
  ```python
  class ApplicationServiceTests(unittest.TestCase):
      def test_validate_submission_rejects_closed_event(self):
          class EventStub:
              registration_enabled = False
              participant_limit = None

          with self.assertRaises(ValueError):
              ApplicationService.validate_submission(EventStub(), {})
  ```
- **Analysis**: `ApplicationService.validate_submission` (line 8 of `services.py`) accesses `event.is_registration_open`. Because `EventStub` only defines `registration_enabled`, running `python manage.py test` throws `AttributeError: 'EventStub' object has no attribute 'is_registration_open'` and fails with exit code 1.
- **Implementation Strategy**:
  - Add `@property def is_registration_open(self): return self.registration_enabled` to `EventStub`.
  - Replacement for lines 8–10:
    ```python
        class EventStub:
            registration_enabled = False
            participant_limit = None

            @property
            def is_registration_open(self):
                return self.registration_enabled
    ```

---

## 6. Frontend TypeScript Errors Cleanup

Running `npx tsc --noEmit` identified 13 TypeScript errors across 4 frontend files.

### 6.1 `src/pages/public/ApplicationFormPage.tsx`
- **Path**: `D:\ariza\Markaz form\src\pages\public\ApplicationFormPage.tsx`
- **Errors**:
  - `Line 80`: `error TS2304: Cannot find name 'watchRegion'.`
  - `Line 140`: `error TS2352: Conversion of type 'void' to type 'string' may be a mistake...`
- **Implementation Strategy**:
  1. Add `const watchRegion = watch('regionId');` after line 64 (`const watchCountry = watch('country');`).
  2. Update line 140 from `setSuccessId(realId as string)` to `setSuccessId((realId as unknown as string) || id);`.

### 6.2 `src/components/ui/Input.tsx`
- **Path**: `D:\ariza\Markaz form\src\components\ui\Input.tsx`
- **Errors**: `SettingsAdminPage.tsx` lines 90, 97, 104, 111 pass `icon={<Building ... />}` to `<Input />`, raising `error TS2322: Property 'icon' does not exist on type InputProps`.
- **Implementation Strategy**:
  1. Update `InputProps` in `src/components/ui/Input.tsx` to include `icon?: React.ReactNode;`.
  2. In `Input` component destructure `icon` and derive `const effectiveLeftIcon = leftIcon || icon;`.
  3. Replace references to `leftIcon` with `effectiveLeftIcon` for rendering icon and padding (`effectiveLeftIcon && "pl-10"`).

### 6.3 `src/i18n.tsx`
- **Path**: `D:\ariza\Markaz form\src\i18n.tsx`
- **Errors**: 4 duplicate key errors (`error TS1117: An object literal cannot have multiple properties with the same name.`):
  - Line 295 (`uz` block): duplicate `'apply.docPhoto'` (already at line 137).
  - Line 593 (`en` block): duplicate `'apply.docPhoto'` (already at line 434).
  - Line 878 (`ru` block): duplicate `'apply.docPhoto'` (already at line 731).
  - Line 875/886 (`ru` block): duplicate `'common.confirmDelete'` (lines 875 and 886).
- **Implementation Strategy**:
  - Delete line 295 (`'apply.docPhoto': 'Rasm 3x4',`).
  - Delete line 593 (`'apply.docPhoto': 'Photo 3x4',`).
  - Delete line 878 (`'apply.docPhoto': 'Фото 3x4',`).
  - Delete line 875 (`'common.confirmDelete': 'Вы действительно хотите удалить?',`) keeping line 886.

### 6.4 `src/lib/mockData.ts`
- **Path**: `D:\ariza\Markaz form\src\lib\mockData.ts`
- **Errors**: 5 error instances of `error TS2741: Property 'country' is missing in type...` on `MOCK_APPLICATIONS` items (id: 1, 2, 3, 4, 5). `Application` type interface requires `country: string`.
- **Implementation Strategy**:
  - Add `country: "O'zbekiston"` to each application object in `MOCK_APPLICATIONS` (items starting at lines 201, 231, 254, 276, 304).

---

## 7. Summary Matrix of Proposed Edits

| Target File | Change Type | Lines Affected | Rationale |
|---|---|---|---|
| `src/components/ui/Skeleton.tsx` | Delete File | Entire file (20 lines) | Dead code, unreferenced in project |
| `backend/centr_form/views.py` | Import Edit | 3–4 | Remove unused `Http404` and `serve` |
| `backend/apps/applications/views.py` | Import Edit | 17 | Remove unused `send_status_notification` |
| `backend/apps/common/services.py` | Import Edit | 1 | Remove unused `os` import |
| `backend/apps/dashboard/views.py` | Import Edit | 2 | Remove unused `IsAuthenticated` import |
| `backend/apps/qr/services.py` | Import Edit | 3 | Remove unused `secrets` import |
| `vite.config.ts` | Config Edit | 6 | Replace missing `./.figma/make/site.json` import with `{}` |
| `backend/centr_form/settings.py` | Settings Edit | 74–95 | Move `pymysql` import inside non-SQLite `else:` branch |
| `backend/apps/applications/tests.py` | Test Stub Edit | 8–10 | Add `@property def is_registration_open` to `EventStub` |
| `src/pages/public/ApplicationFormPage.tsx` | TS Fix | 65, 140 | Declare `watchRegion`, fix `setSuccessId` cast |
| `src/components/ui/Input.tsx` | TS Fix | 4–35 | Add `icon` prop to `InputProps` and render logic |
| `src/i18n.tsx` | TS Fix | 295, 593, 875, 878 | Delete duplicate translation keys |
| `src/lib/mockData.ts` | TS Fix | 201, 231, 254, 276, 304 | Add missing `country` property to mock applications |
