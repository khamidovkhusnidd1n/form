# Dispatch for Remediation Explorer: Milestone 1 Hardening Remediation

## Assigned Scope
- Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix
- Workspace directory: D:\ariza\Markaz form
- Original Request: D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md
- Project Scope: D:\ariza\Markaz form\PROJECT.md
- **Mandatory Audit & Review Reports**:
  - Full Forensic Audit Report: D:\ariza\Markaz form\.agents\teamwork_preview_auditor_m1\handoff.md
  - Reviewer 1 Report: D:\ariza\Markaz form\.agents\teamwork_preview_reviewer_m1_1\handoff.md
  - Reviewer 2 Report: D:\ariza\Markaz form\.agents\teamwork_preview_reviewer_m1_2\handoff.md
  - Challenger 1 Report: D:\ariza\Markaz form\.agents\teamwork_preview_challenger_m1_1\handoff.md
  - Challenger 2 Report: D:\ariza\Markaz form\.agents\teamwork_preview_challenger_m1_2\handoff.md

## Objective
The Forensic Auditor issued an INTEGRITY VIOLATION verdict alongside Reviewer and Challenger failures for Milestone 1.
Read the full evidence reports listed above. Investigate and produce a concrete, robust remediation strategy that resolves all identified defects:
1. **DRF Rate Limiting on FBVs**:
   - In `backend/apps/accounts/views.py` (`change_password_view`) and `backend/apps/applications/views.py` (`track_application`), `@api_view` decoration detached `throttle_scope` so `ScopedRateThrottle` silently allows all requests.
   - Propose the cleanest fix (e.g. converting them to clean DRF `APIView` class-based views with explicit `throttle_classes = [ScopedRateThrottle]` and `throttle_scope = '...'`, or custom scoped throttle classes).
2. **Django Unit Test Suite Failure**:
   - `python backend/manage.py test apps` fails at `apps.accounts.tests.IsModeratorOrAboveTests.test_superuser_or_staff_allowed`. Provide the exact fix for `apps/accounts/tests.py` so the test suite passes with 0 failures while preserving strict RBAC security.
3. **Settings View RBAC Privilege Escalation**:
   - Update `AdminOrganizationSettingsView` in `backend/apps/settings_app/views.py` to use `[IsSuperAdmin]` instead of `[permissions.IsAdminUser]`.
4. **Application Tracking Phone Matching & Edge Cases**:
   - In `backend/apps/applications/views.py`, ensure `len(clean_app_phone) >= 7` before performing suffix matching, and guard `request.data` against non-dict payloads.
5. **QR Code HMAC Cross-Object Binding**:
   - In `backend/apps/qr/services.py`, ensure the HMAC payload always binds `f"{qr_type}:{object_id}:{safe_token}"` so signatures cannot be replayed across different certificates/invitations.
6. **Superadmin Creation Flag**:
   - In `AdminUserCreateSerializer.create`, ensure `is_superuser=True` is assigned when `role in ('super_admin', 'superadmin')`.
7. **Hygiene**:
   - Remove `add_reset_admin.py` from project root.


Write your remediation plan and drop-in code recommendations to `D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix\handoff.md`.
Send a completion message back to parent when done.

## 2026-09-04T10:51:47Z
You are the Remediation Explorer for Milestone 1 Backend Hardening.
Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix
Workspace directory: D:\ariza\Markaz form
Read your instructions in D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix\DISPATCH.md and D:\ariza\Markaz form\.agents\ORIGINAL_REQUEST.md.

Carefully read the Forensic Audit Report at D:\ariza\Markaz form\.agents\teamwork_preview_auditor_m1\handoff.md and Challenger report at D:\ariza\Markaz form\.agents\teamwork_preview_challenger_m1_1\handoff.md.
Investigate the 7 reported issues (throttle scope binding on FBVs, unit test failure in accounts/tests.py, settings RBAC, phone IDOR suffix matching, QR HMAC cross-object replay, superadmin creation flag, add_reset_admin.py cleanup).
Formulate a complete, robust fix strategy with concrete code implementations.
Write your recommendations to D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix\handoff.md.
Send a message to parent when done.
