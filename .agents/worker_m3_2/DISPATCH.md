## 2026-08-12T10:14:28Z
You are worker_m3_2 (teamwork_preview_worker).
Your working directory is D:\ariza\Markaz form\.agents\worker_m3_2.
You MUST read D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md and D:\ariza\Markaz form\.agents\orchestrator\PROJECT.md before starting work.

Task Instructions:
1. Modify `validate_uploaded_file` in `backend/apps/applications/serializers.py`:
   - Reject 0-byte uploaded files (`file_obj.size == 0`).
   - Reject double extensions (e.g. `script.exe.pdf`, `shell.php.jpg`) by checking extension structure (e.g. checking `len(filename.split('.')) > 2`).
   - Ensure allowed extension checking is robust and handles uppercase extensions (e.g. `.PDF`, `.JPG`) properly.
2. Add unit test cases in `backend/apps/applications/tests.py`:
   - Cover 0-byte files (verify validation error is raised).
   - Cover double extensions (verify validation error is raised).
   - Cover uppercase extensions (verify file validation passes).
3. Run backend unit tests from `backend/` directory (`python manage.py test` or `pytest`) to verify all backend tests pass.
4. DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
5. Update progress.md in your working directory after each step and write a comprehensive `handoff.md` in `D:\ariza\Markaz form\.agents\worker_m3_2\handoff.md` summarizing files changed, test commands run, test outputs, and verification status. Send a message to your orchestrator when done.
