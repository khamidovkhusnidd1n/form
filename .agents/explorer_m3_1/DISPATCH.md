## 2026-08-12T05:04:19Z
You are Explorer for Milestone 3 (Security & Bug Remediation).
Your working directory is D:\ariza\Markaz form\.agents\explorer_m3_1.
Read D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md, D:\ariza\Markaz form\.agents\orchestrator\PROJECT.md, and D:\ariza\Markaz form\.agents\explorer_survey_3\analysis.md.

Task:
Formulate an exact, itemized implementation strategy for Milestone 3 (Security & Bug Remediation):
1. `backend/apps/accounts/permissions.py`: Fix `IsModeratorOrAbove` class so it checks role (`request.user.role in ['moderator', 'admin']` or `is_staff`/`is_superuser`) instead of just `is_authenticated`.
2. `backend/apps/applications/serializers.py`: Add file extension (PDF, JPG, PNG) and file size limits (e.g. 5MB/10MB max) to file upload fields in `ApplicationSubmitSerializer` and add unit test coverage.
3. `backend/centr_form/settings.py`: Refine CORS configuration to avoid insecure `CORS_ALLOW_ALL_ORIGINS = True` with credentials allowed, and ensure `SECRET_KEY` falls back securely when environment variable is unset.
4. `backend/apps/events/views.py`: Fix `/api/v1/events/stats/` (`EventStatsView`) permission class from `[AllowAny]` to `[IsAuthenticated]` or `[IsModeratorOrAbove]`.
5. `src/api/client.ts`: Add 401 Unauthorized interceptor/error handler to clear stored credentials and redirect to login on token expiration.

Write your analysis report to D:\ariza\Markaz form\.agents\explorer_m3_1\analysis.md and handoff report to D:\ariza\Markaz form\.agents\explorer_m3_1\handoff.md.
