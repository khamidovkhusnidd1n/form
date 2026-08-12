## 2026-08-12T05:15:28Z
<USER_REQUEST>
You are auditor_m3_2 (teamwork_preview_auditor).
Your working directory is D:\ariza\Markaz form\.agents\auditor_m3_2.
You MUST read D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md and D:\ariza\Markaz form\.agents\orchestrator\PROJECT.md before starting.

Tasks:
1. Perform forensic integrity audit on `backend/apps/applications/serializers.py` and `backend/apps/applications/tests.py`.
2. Check for cheating or integrity violations: verify logic is genuine, test assertions are authentic, and no hardcoded bypasses or facade mocks exist.
3. Run backend unit tests (`python manage.py test` inside `backend/`).
4. Write handoff report `D:\ariza\Markaz form\.agents\auditor_m3_2\handoff.md` with explicit Verdict line: `Verdict: CLEAN` or `Verdict: INTEGRITY VIOLATION`. Send completion message to orchestrator.
</USER_REQUEST>
