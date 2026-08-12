# Milestone 3 Reviewer 2 Handoff Report

## 1. Observation
- **Files Inspected**:
  - `backend/apps/accounts/permissions.py`: Lines 20–28 (`IsModeratorOrAbove` checking `is_superuser`, `is_staff`, and `role in ('super_admin', 'administrator', 'moderator', 'admin')`).
  - `backend/apps/events/views.py`: Line 72 (`@permission_classes([IsModeratorOrAbove])` on `dashboard_stats`).
  - `backend/centr_form/settings.py`: Lines 8–14 (`SECRET_KEY` setup) and Lines 165–174 (`CORS_ALLOWED_ORIGINS` setup).
  - `backend/apps/applications/serializers.py`: Lines 10–20 (`validate_uploaded_file`).
  - `backend/apps/applications/tests.py`: Lines 22–50 (`FileValidationTests`).
  - `backend/apps/accounts/tests.py`: Lines 6–39 (`IsModeratorOrAboveTests`).

- **Test Execution Commands & Results**:
  1. Django unit test suite execution command:
     `$env:USE_SQLITE="True"; python backend/manage.py test apps --settings=centr_form.settings`
     Output: `Ran 10 tests in 0.009s OK`
  2. Edge case verification script execution command:
     `$env:USE_SQLITE="True"; $env:DJANGO_SETTINGS_MODULE="centr_form.settings"; python -c "..."`
     Output:
     - `Uppercase (.PDF)`: `DOCUMENT.PDF` -> PASSED
     - `Empty file (size=0)`: PASSED, returned `empty.pdf` (0 bytes accepted without error)
     - `Double ext (.exe.pdf)`: PASSED, returned `script.exe.pdf` (double extension accepted without error)

## 2. Logic Chain
- **Requirement 1 (DRF API Permissions)**: Verified. `IsModeratorOrAbove` properly guards endpoints that were previously open to any authenticated user or unauthenticated users (`/api/v1/events/stats/`). User roles are validated.
- **Requirement 3 (CORS & Secret Key Security)**: Verified. Wildcard CORS origins with credentials were eliminated, replaced with explicit allowed origin lists. Secret key is dynamic in development and strictly enforced in production (`DEBUG=False`).
- **Requirement 2 (File Upload Validation Edge Cases)**: **FAILED**.
  - Observations show `validate_uploaded_file` in `backend/apps/applications/serializers.py` relies on `if not file_obj:` (which is false for 0-byte `UploadedFile` objects) and `os.path.splitext(file_obj.name)[1].lower()` (which extracts only the final extension after the last dot).
  - Consequently, 0-byte empty files (`size == 0`) and files with double extensions (`script.exe.pdf` or `shell.php.jpg`) pass validation without raising a `ValidationError`.
  - Furthermore, `backend/apps/applications/tests.py` does not include test cases for 0-byte empty files, double extensions, or uppercase extensions.

## 3. Caveats
- No caveats. The edge case failures in `validate_uploaded_file` were directly reproduced using Django's uploaded file primitives (`SimpleUploadedFile`).

## 4. Conclusion
**Verdict**: **REQUEST_CHANGES**

Rejection Rationale:
File upload validation does not handle empty files (`size == 0`) or double extensions (`script.exe.pdf`), violating Requirement 2 of Milestone 3. Additionally, unit tests for file upload edge cases are missing from `backend/apps/applications/tests.py`.

Required Fixes for Worker:
1. Update `validate_uploaded_file` in `backend/apps/applications/serializers.py` to reject 0-byte files (`file_obj.size == 0`) and files with multiple extensions (`len(file_obj.name.split('.')) > 2`).
2. Add unit tests for 0-byte files, double extensions, and uppercase extensions in `backend/apps/applications/tests.py`.

## 5. Verification Method
1. Execute Python edge case test script:
   ```powershell
   $env:USE_SQLITE="True"; $env:DJANGO_SETTINGS_MODULE="centr_form.settings"; python -c "
   import django
   django.setup()
   from django.core.files.uploadedfile import SimpleUploadedFile
   from apps.applications.serializers import validate_uploaded_file
   from rest_framework.exceptions import ValidationError

   f_empty = SimpleUploadedFile('empty.pdf', b'', content_type='application/pdf')
   try:
       validate_uploaded_file(f_empty)
       print('EMPTY FILE ACCEPTED - FAIL')
   except ValidationError:
       print('EMPTY FILE REJECTED - PASS')

   f_double = SimpleUploadedFile('script.exe.pdf', b'content', content_type='application/pdf')
   try:
       validate_uploaded_file(f_double)
       print('DOUBLE EXT ACCEPTED - FAIL')
   except ValidationError:
       print('DOUBLE EXT REJECTED - PASS')
   "
   ```
   *Expected Result*: Both empty files and double extension files must be REJECTED with `ValidationError`.

2. Run backend test suite:
   ```powershell
   $env:USE_SQLITE="True"; python backend/manage.py test apps --settings=centr_form.settings
   ```
   *Expected Result*: All tests pass (including new edge case tests).
