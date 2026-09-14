# BRIEFING — 2026-09-04T10:57:00Z

## Mission
Investigate 7 Milestone 1 defects from Forensic Audit and Challenger reports, formulate robust fix strategy with concrete code implementations, and produce handoff report.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigation, synthesis
- Working directory: D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix
- Original parent: 05082631-bf31-4f52-bfed-4a464fa9ad7a
- Milestone: Milestone 1 Backend Hardening Remediation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze problems, synthesize findings, produce structured reports
- Write only to your folder (D:\ariza\Markaz form\.agents\teamwork_preview_explorer_m1_fix)
- Read any folder

## Current Parent
- Conversation ID: 05082631-bf31-4f52-bfed-4a464fa9ad7a
- Updated: 2026-09-04T10:57:00Z

## Investigation State
- **Explored paths**:
  - `backend/apps/accounts/views.py`, `urls.py`, `tests.py`, `serializers.py`, `permissions.py`, `models.py`
  - `backend/apps/applications/views.py`, `urls.py`, `models.py`, `tests.py`
  - `backend/apps/settings_app/views.py`, `serializers.py`, `models.py`
  - `backend/apps/qr/services.py`, `views.py`, `tests.py`
  - `backend/tests/test_adversarial_m1_1.py`, `test_adversarial_m1_2.py`
  - `add_reset_admin.py`
- **Key findings**:
  1. FBVs bypass DRF `ScopedRateThrottle` because `@api_view` wraps in `WrappedAPIView` where `throttle_scope` is unset (`None`). Converting to `APIView` CBVs with `throttle_scope` and backward-compatible functional aliases completely resolves this.
  2. `apps.accounts.tests` fails at line 22 because `test_superuser_or_staff_allowed` asserts `is_staff=True` without role grants permission, whereas hardened `IsModeratorOrAbove` intentionally rejects `is_staff` alone.
  3. `AdminOrganizationSettingsView` uses `IsAdminUser` which checks `is_staff`, granting moderators access. Updating to `IsSuperAdmin` secures the endpoint.
  4. In `track_application`, missing check `len(clean_app_phone) >= 7` allows bypass on empty phone DB records due to `str.endswith("") == True`, and `request.data.get(...)` crashes if payload is non-dict.
  5. In `QRService`, HMAC hash was calculated on `safe_token` alone, omitting `qr_type` and `object_id`, permitting cross-object replay. Binding `f"{qr_type}:{object_id}:{safe_token}"` prevents replay.
  6. `AdminUserCreateSerializer.create` omits `is_superuser=True` for `super_admin` role, locking out newly created superadmins.
  7. `add_reset_admin.py` in project root is a residual backdoor re-injection script that must be deleted.
- **Unexplored areas**: None. All 7 defects thoroughly investigated and verified.

## Key Decisions Made
- Recommending class-based `APIView` approach with explicit aliases (`change_password_view = ChangePasswordView.as_view()`, `track_application = TrackApplicationView.as_view()`) to ensure complete compatibility with both DRF routing and direct functional test calls.
- Designing exact drop-in code snippets and unified diff patches for each affected file.

## Artifact Index
- handoff.md — Complete remediation strategy and drop-in code recommendations
- progress.md — Liveness heartbeat
- BRIEFING.md — Working memory index
