# Handoff Report — worker_m3_2

## 1. Observation
- File modified: `backend/apps/applications/serializers.py`
  - Function: `validate_uploaded_file`
  - Added 0-byte size check (`if file_obj.size == 0:` raises `serializers.ValidationError("Fayl bo'sh bo'lishi mumkin emas.")`).
  - Added double extension check (`if len(filename.split('.')) > 2:` raises `serializers.ValidationError("Qo'shaloq fayl kengaytmasidan foydalanish taqiqlangan.")`).
  - Enhanced extension check to normalize allowed extensions and lower-case extracted extension for uppercase files (e.g., `DOCUMENT.PDF`, `photo.JPG`).
- File modified: `backend/apps/applications/tests.py`
  - Class: `FileValidationTests`
  - Added test case `test_serializer_rejects_zero_byte_file` verifying 0-byte upload raises `ValidationError`.
  - Added test case `test_serializer_rejects_double_extension` verifying double extensions (`script.exe.pdf`, `shell.php.jpg`) raise `ValidationError`.
  - Added test case `test_serializer_accepts_uppercase_extension` verifying valid files with uppercase extensions (`DOCUMENT.PDF`, `PHOTO.JPG`) pass validation.
- Test Output:
  - Command: `python manage.py test` (executed inside `backend/` directory)
  - Result: `Ran 13 tests in 0.009s -- OK`

## 2. Logic Chain
- 0-Byte files: Files with `file_obj.size == 0` are empty uploads that do not contain valid data and can cause unexpected processing errors or consume database entries unnecessarily. Adding a check for `file_obj.size == 0` rejects empty files upfront.
- Double extensions: Attackers often attempt extension spoofing (e.g. `script.exe.pdf` or `shell.php.jpg`) to bypass simple single-extension filters or deceive downstream web servers. Splitting the filename on `.` and requiring `len(parts) <= 2` rejects any filename with multiple extension dots.
- Uppercase extensions: Valid user files often use uppercase extensions like `.PDF` or `.JPG`. Normalizing both the allowed extension set and the file extension to lowercase ensures valid files are accepted regardless of case.

## 3. Caveats
- Filenames containing dots as part of their basename without being double extensions (e.g., `report.v1.pdf`) are treated as multi-dot filenames and rejected under the strict `len(filename.split('.')) > 2` rule as requested by the specification.
- No caveats regarding test execution; all 13 test cases run cleanly without external dependencies.

## 4. Conclusion
`validate_uploaded_file` in `backend/apps/applications/serializers.py` now enforces 0-byte file rejection, double extension rejection, and uppercase extension normalization. All 3 new test cases pass alongside all 10 pre-existing backend tests.

## 5. Verification Method
1. Open terminal and navigate to `D:\ariza\Markaz form\backend`.
2. Run command: `python manage.py test`
3. Observe output: 13 tests pass with OK status.
