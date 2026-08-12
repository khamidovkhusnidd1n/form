## 2026-08-12T05:00:15Z
You are Explorer for Milestone 2 (Codebase Audit & Cleanup).
Your working directory is D:\ariza\Markaz form\.agents\explorer_m2_1.
Read D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md, D:\ariza\Markaz form\.agents\orchestrator\PROJECT.md, and D:\ariza\Markaz form\.agents\explorer_survey_2\analysis.md.

Task:
Formulate an exact, itemized implementation strategy for Milestone 2 (Codebase Audit & Cleanup):
1. Identify file to delete: `src/components/ui/Skeleton.tsx`.
2. List exact line numbers and unused imports to remove in:
   - `backend/centr_form/views.py` (`Http404`, `serve`)
   - `backend/apps/applications/views.py` (`send_status_notification`)
   - `backend/apps/common/services.py` (`os`)
   - `backend/apps/dashboard/views.py` (`IsAuthenticated`)
   - `backend/apps/qr/services.py` (`secrets`)
3. Detail edits for `vite.config.ts` to remove the non-existent `./.figma/make/site.json` import.
4. Detail fix in `backend/centr_form/settings.py` for conditional `pymysql` import.
5. Detail fix in `backend/apps/applications/tests.py` for adding `is_registration_open` property to `EventStub`.
6. Detail fixes for TypeScript errors in `src/pages/ApplicationFormPage.tsx`, `src/components/ui/Input.tsx`, `src/i18n.tsx`, `src/mockData.ts`.

Write your analysis report to D:\ariza\Markaz form\.agents\explorer_m2_1\analysis.md and handoff report to D:\ariza\Markaz form\.agents\explorer_m2_1\handoff.md.
