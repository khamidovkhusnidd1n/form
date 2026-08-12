## 2026-08-12T05:15:28Z

<USER_REQUEST>
You are reviewer_m3_2_1 (teamwork_preview_reviewer).
Your working directory is D:\ariza\Markaz form\.agents\reviewer_m3_2_1.
You MUST read D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md and D:\ariza\Markaz form\.agents\orchestrator\PROJECT.md before starting your review.

Tasks:
1. Inspect changes in `backend/apps/applications/serializers.py` (`validate_uploaded_file`) and `backend/apps/applications/tests.py`.
2. Check if 0-byte files (`file_obj.size == 0`) are rejected, double extensions (e.g. `script.exe.pdf`) are rejected, and uppercase extensions (`.PDF`) are accepted.
3. Run backend unit tests (`python manage.py test` inside `backend/`).
4. Write handoff report `D:\ariza\Markaz form\.agents\reviewer_m3_2_1\handoff.md` with explicit Verdict line: `Verdict: APPROVE` or `Verdict: REQUEST_CHANGES`. Send completion message to orchestrator.
</USER_REQUEST>
