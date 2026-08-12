# Milestone 3 Security & Bug Remediation — Code Review and Adversarial Analysis

## Executive Summary

**Verdict**: **REQUEST_CHANGES**

Reviewer 2 performed an independent security review and adversarial stress-testing of Milestone 3 (Security & Bug Remediation) changes implemented by `worker_m3_1`.

While DRF API permissions (Requirement 1) and Django CORS/SECRET_KEY security settings (Requirement 3) conform to Django security best practices, the file upload validation (Requirement 2) **fails to handle critical edge cases**:
1. **Empty Files**: Files with `size == 0` (e.g. 0-byte uploaded files) bypass validation and are accepted.
2. **Double Extensions**: Files with hidden executable/script extensions before a valid extension (e.g., `script.exe.pdf`, `shell.php.jpg`) bypass validation because `os.path.splitext()` only checks the final extension after the last dot.
3. **Missing Unit Test Coverage**: `backend/apps/applications/tests.py` lacks unit tests for empty files, double extensions, and uppercase extensions.

---

## Detailed Findings

### 1. File Upload Edge Case Vulnerabilities [MAJOR]

- **Location**: `backend/apps/applications/serializers.py`, lines 10–20 (`validate_uploaded_file`)
- **Issue**:
  - **Empty Files**: `if not file_obj:` checks if the object is None/empty falsy, but `UploadedFile` objects in Django are truthy even when `file_obj.size == 0`. `validate_uploaded_file` does not check `file_obj.size == 0`, allowing 0-byte file submissions.
  - **Double Extensions**: `ext = os.path.splitext(file_obj.name)[1].lower()` extracts only the last extension `.pdf` or `.jpg`. A file named `script.exe.pdf` or `shell.php.jpg` passes validation completely.
- **Evidence**:
  Running Python test script against `validate_uploaded_file`:
  ```
  Uppercase (.PDF): DOCUMENT.PDF -> PASSED
  Empty file (size=0): PASSED, returned empty.pdf (VULNERABILITY)
  Double ext (.exe.pdf): PASSED, returned script.exe.pdf (VULNERABILITY)
  ```
- **Suggested Remediation**:
  Modify `validate_uploaded_file` in `backend/apps/applications/serializers.py`:
  ```python
  def validate_uploaded_file(file_obj, allowed_extensions=ALLOWED_FILE_EXTENSIONS, max_size_bytes=MAX_FILE_SIZE_BYTES):
      if not file_obj:
          return file_obj

      if file_obj.size == 0:
          raise serializers.ValidationError("Fayl bo'sh bo'lishi mumkin emas.")

      name_parts = file_obj.name.split('.')
      if len(name_parts) > 2:
          raise serializers.ValidationError("Bir nechta kengaytmali (double extension) fayllarni yuklash taqiqlangan.")

      ext = os.path.splitext(file_obj.name)[1].lower()
      if ext not in allowed_extensions:
          allowed_str = ', '.join([e.upper().lstrip('.') for e in sorted(allowed_extensions)])
          raise serializers.ValidationError(f"Fayl formati ruxsat etilmagan ({ext}). Ruxsat etilgan formatlar: {allowed_str}.")

      if file_obj.size > max_size_bytes:
          max_mb = max_size_bytes // (1024 * 1024)
          raise serializers.ValidationError(f"Fayl hajmi {max_mb}MB dan oshmasligi kerak.")

      return file_obj
  ```

---

### 2. Missing Edge Case Test Cases in Unit Tests [MINOR]

- **Location**: `backend/apps/applications/tests.py` (`FileValidationTests`)
- **Issue**: The existing test suite in `applications/tests.py` only tests basic valid `.pdf`/`.jpg`/`.png`, invalid `.exe`/`.py`, and oversized files (>10MB). It does not test 0-byte empty files, double extensions (`.exe.pdf`), or uppercase extensions (`.PDF`).
- **Suggested Remediation**: Add explicit test cases for empty files, double extensions, and uppercase extensions to `FileValidationTests`.

---

## Evaluation of Requirements

| Requirement | Description | Status | Rationale |
|-------------|-------------|--------|-----------|
| **Req 1** | DRF API Endpoints Permissions | **PASS** | `IsModeratorOrAbove` properly verifies superuser/staff/role privileges. `/api/v1/events/stats/` is restricted to `IsModeratorOrAbove`. Admin views are secured. |
| **Req 2** | File Upload Edge Cases | **FAIL** | Empty files (`size == 0`) and double extension files (`.exe.pdf`, `.php.jpg`) pass validation without error. |
| **Req 3** | CORS & SECRET_KEY Security | **PASS** | `CORS_ALLOW_ALL_ORIGINS = True` removed. Explicit `CORS_ALLOWED_ORIGINS` configured. `SECRET_KEY` uses dynamic dev key in DEBUG mode and enforces env var in production (`DEBUG=False`). |

---

## Verified Claims Matrix

| Claim | Source File | Verification Method | Result |
|-------|-------------|---------------------|--------|
| `IsModeratorOrAbove` checks user role and staff/superuser flags | `backend/apps/accounts/permissions.py:20-27` | Verified via code inspection & Django unit test suite (`apps.accounts.tests`) | PASS |
| Wildcard CORS origin removed | `backend/centr_form/settings.py:165-174` | Checked `CORS_ALLOWED_ORIGINS` & `CORS_ALLOW_CREDENTIALS` settings | PASS |
| `SECRET_KEY` enforced in production | `backend/centr_form/settings.py:8-14` | Code inspection of fallback logic for `DEBUG=False` | PASS |
| `/api/v1/events/stats/` restricted | `backend/apps/events/views.py:72` | Verified `@permission_classes([IsModeratorOrAbove])` decorator | PASS |
| Uppercase extensions handled | `backend/apps/applications/serializers.py:13` | Verified `.lower()` handles `.PDF` / `.JPG` | PASS |
| Empty file validation | `backend/apps/applications/serializers.py:10` | Python test script execution with 0-byte `SimpleUploadedFile` | **FAIL** |
| Double extension validation | `backend/apps/applications/serializers.py:13` | Python test script execution with `script.exe.pdf` | **FAIL** |

---

## Adversarial Challenge & Stress Tests

1. **Attack Scenario: Upload 0-byte file (`empty.pdf`)**
   - *Expectation*: Rejected with `ValidationError`.
   - *Actual*: Validation passed; 0-byte file accepted into serializer.
   - *Status*: **FAIL**

2. **Attack Scenario: Upload double extension payload (`malware.php.jpg` or `script.exe.pdf`)**
   - *Expectation*: Rejected due to dangerous intermediate extension or multi-dot filename.
   - *Actual*: `os.path.splitext()` returned `.pdf`/`.jpg` and validation passed.
   - *Status*: **FAIL**

3. **Attack Scenario: Upload uppercase extension (`DOC.PDF`)**
   - *Expectation*: Accepted as valid PDF.
   - *Actual*: `.lower()` normalized `.PDF` to `.pdf` and validation passed.
   - *Status*: **PASS**

4. **Attack Scenario: Unauthenticated GET request to `/api/v1/events/stats/`**
   - *Expectation*: HTTP 401 Unauthenticated.
   - *Actual*: `@permission_classes([IsModeratorOrAbove])` rejects unauthenticated request with 401.
   - *Status*: **PASS**

5. **Attack Scenario: Non-moderator role (e.g. `role='applicant'`) accessing `/api/v1/applications/admin/`**
   - *Expectation*: HTTP 403 Forbidden.
   - *Actual*: `IsModeratorOrAbove` returns `False` and rejects request.
   - *Status*: **PASS**

---

## Conclusion & Next Steps

Milestone 3 cannot be approved until file upload validation in `backend/apps/applications/serializers.py` is updated to handle 0-byte empty files and double extensions, and corresponding unit test coverage is added to `backend/apps/applications/tests.py`.
