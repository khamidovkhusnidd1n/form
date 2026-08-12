import unittest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError
from apps.applications.services import ApplicationService
from apps.applications.serializers import validate_uploaded_file


class ApplicationServiceTests(unittest.TestCase):
    def test_validate_submission_rejects_closed_event(self):
        class EventStub:
            registration_enabled = False
            participant_limit = None

            @property
            def is_registration_open(self):
                return self.registration_enabled

        with self.assertRaises(ValueError):
            ApplicationService.validate_submission(EventStub(), {})


class FileValidationTests(unittest.TestCase):
    def test_serializer_accepts_valid_files(self):
        valid_pdf = SimpleUploadedFile("doc.pdf", b"pdf content", content_type="application/pdf")
        valid_jpg = SimpleUploadedFile("photo.jpg", b"jpeg content", content_type="image/jpeg")
        valid_png = SimpleUploadedFile("image.png", b"png content", content_type="image/png")

        self.assertEqual(validate_uploaded_file(valid_pdf), valid_pdf)
        self.assertEqual(validate_uploaded_file(valid_jpg), valid_jpg)
        self.assertEqual(validate_uploaded_file(valid_png), valid_png)

    def test_serializer_rejects_disallowed_extension(self):
        invalid_exe = SimpleUploadedFile("malware.exe", b"binary content", content_type="application/x-msdownload")
        invalid_py = SimpleUploadedFile("script.py", b"print(1)", content_type="text/x-python")

        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(invalid_exe)
        self.assertIn("Fayl formati ruxsat etilmagan", str(ctx.exception))

        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(invalid_py)
        self.assertIn("Fayl formati ruxsat etilmagan", str(ctx.exception))

    def test_serializer_rejects_oversized_file(self):
        oversized = SimpleUploadedFile("big.pdf", b"0" * (11 * 1024 * 1024), content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(oversized)
        self.assertIn("Fayl hajmi 10MB dan oshmasligi kerak", str(ctx.exception))

    def test_serializer_rejects_zero_byte_file(self):
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(empty_file)
        self.assertIn("Fayl bo'sh bo'lishi mumkin emas", str(ctx.exception))

    def test_serializer_rejects_double_extension(self):
        double_ext_exe = SimpleUploadedFile("script.exe.pdf", b"fake pdf content", content_type="application/pdf")
        double_ext_php = SimpleUploadedFile("shell.php.jpg", b"fake image content", content_type="image/jpeg")

        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(double_ext_exe)
        self.assertIn("Qo'shaloq fayl kengaytmasidan foydalanish taqiqlangan", str(ctx.exception))

        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(double_ext_php)
        self.assertIn("Qo'shaloq fayl kengaytmasidan foydalanish taqiqlangan", str(ctx.exception))

    def test_serializer_accepts_uppercase_extension(self):
        uppercase_pdf = SimpleUploadedFile("DOCUMENT.PDF", b"pdf content", content_type="application/pdf")
        uppercase_jpg = SimpleUploadedFile("PHOTO.JPG", b"jpeg content", content_type="image/jpeg")

        self.assertEqual(validate_uploaded_file(uppercase_pdf), uppercase_pdf)
        self.assertEqual(validate_uploaded_file(uppercase_jpg), uppercase_jpg)


