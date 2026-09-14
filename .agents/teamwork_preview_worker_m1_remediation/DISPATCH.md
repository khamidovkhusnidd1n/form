# Dispatch for Worker: Milestone 1 Hardening Remediation (Iteration 2)

## Assigned Scope
- Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1_remediation
- Workspace directory: D:\ariza\Markaz form
- Original Request: D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md
- Project Scope: D:\ariza\Markaz form\PROJECT.md
- **Mandatory Remediation Guide to read**:
  - D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix\handoff.md

## Write Ownership (Files you exclusively own)
- `backend/apps/accounts/views.py`
- `backend/apps/accounts/urls.py`
- `backend/apps/accounts/tests.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/applications/views.py`
- `backend/apps/applications/urls.py`
- `backend/apps/settings_app/views.py`
- `backend/apps/qr/services.py`
- `backend/apps/qr/views.py`
- `add_reset_admin.py` (Delete this file)

## Required Remediation Implementation (All 7 Defects)
1. **DRF Rate Limiting on FBVs**:
   - Refactor `change_password_view` to a class-based view `ChangePasswordView(APIView)` with `permission_classes = [permissions.IsAuthenticated]`, `throttle_classes = [ScopedRateThrottle]`, `throttle_scope = 'auth_password'`. Update `apps/accounts/urls.py` with `.as_view()`.
   - Refactor `track_application` to a class-based view `TrackApplicationView(APIView)` with `permission_classes = [permissions.AllowAny]`, `throttle_classes = [ScopedRateThrottle]`, `throttle_scope = 'application_track'`. Update `apps/applications/urls.py` with `.as_view()`.
2. **Django Unit Test Suite**:
   - In `backend/apps/accounts/tests.py`, update `test_superuser_or_staff_allowed` to reflect that `is_staff=True` without a valid moderator/superadmin role is denied (`self.assertFalse(...)`), and verify `python backend/manage.py test apps` passes with 0 failures.
3. **Settings View Privilege Escalation**:
   - In `backend/apps/settings_app/views.py:15`, replace `permissions.IsAdminUser` with `[IsSuperAdmin]` from `apps.accounts.permissions`.
4. **Application Tracking Phone IDOR & Crash**:
   - In `TrackApplicationView`, ensure `len(clean_app_phone) >= 7` before checking `clean_req_phone.endswith(clean_app_phone)`.
   - Safely handle non-dict JSON payloads (`isinstance(request.data, dict)`).
5. **QR Code HMAC Cross-Object Replay**:
   - In `backend/apps/qr/services.py`, ensure `build_verification_payload` always includes `qr_type`, `object_id`, and `safe_token` (`f"{qr_type}:{object_id}:{safe_token}"`).
   - In `backend/apps/qr/views.py`, pass `object_id` into payload verification and check that the object exists in the database.
6. **Superadmin Creation Flag**:
   - In `backend/apps/accounts/serializers.py:44`, in `AdminUserCreateSerializer.create`, add `if validated_data.get('role') in ('super_admin', 'superadmin'): user.is_superuser = True`.
7. **Workspace Hygiene**:
   - Delete `add_reset_admin.py` from the project root.

## Verification
- Run `python backend/manage.py test apps` to verify all unit tests pass with 0 errors/failures.
- Run `python backend/manage.py test tests.test_adversarial_m1_1` and `python backend/manage.py test tests.test_adversarial_m1_2` if test files exist.
- Verify `python backend/manage.py check` returns 0 issues.
- Document all changes and verification outputs in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-04T10:58:24Z
You are Worker 2 assigned to Milestone 1 Backend Hardening Remediation (Iteration 2).
Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1_remediation
Workspace directory: D:\ariza\Markaz form
Read your instructions in D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1_remediation\DISPATCH.md, D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md, and D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix\handoff.md.

Implement all 7 remediation fixes described in DISPATCH.md.
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verify your changes using `python backend/manage.py test apps` and `python backend/manage.py check`. Ensure all tests pass with 0 failures.
Document all modified files, line numbers, and changes in D:\ariza\Markaz form\.agents\teamwork_preview_worker_m1_remediation\handoff.md.
Send a message to parent when complete.
