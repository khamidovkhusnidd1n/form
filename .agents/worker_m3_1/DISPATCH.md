## 2026-08-12T05:06:13Z
Execute all security & bug remediation edits specified in D:\ariza\Markaz form\.agents\explorer_m3_1\analysis.md:

1. `backend/apps/accounts/permissions.py`: Update `IsModeratorOrAbove` to verify user role (`role in ('super_admin', 'administrator', 'moderator', 'admin')` or `is_staff`/`is_superuser`).
2. `backend/apps/applications/serializers.py`: Add file extension (.pdf, .jpg, .jpeg, .png) and size validation (max 10MB) to `ApplicationSubmitSerializer` upload fields, and update `backend/apps/applications/tests.py` with test cases verifying file upload validation.
3. `backend/centr_form/settings.py`: Refine CORS settings to avoid `CORS_ALLOW_ALL_ORIGINS = True` with credentials, and add secure fallback for `SECRET_KEY`.
4. `backend/apps/events/views.py`: Update `permission_classes` on `dashboard_stats` (`/api/v1/events/stats/`) from `[AllowAny]` to `[IsModeratorOrAbove]`.
5. `src/api/client.ts`: Update 401 response interceptor to handle token expiration redirect cleanly.
6. Run verification commands:
   - `python backend/manage.py test apps --settings=centr_form.settings` (or `set USE_SQLITE=True&& python backend/manage.py test apps --settings=centr_form.settings`).
   - `npx tsc --noEmit`.
   - `npm run build`.
