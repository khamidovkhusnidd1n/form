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
        valid_pdf = SimpleUploadedFile("doc.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        valid_jpg = SimpleUploadedFile("photo.jpg", b"\xff\xd8\xff content", content_type="image/jpeg")
        valid_png = SimpleUploadedFile("image.png", b"\x89PNG\r\n\x1a\n content", content_type="image/png")

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
        oversized = SimpleUploadedFile("big.pdf", b"0" * (51 * 1024 * 1024), content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(oversized)
        self.assertIn("Fayl hajmi 50MB dan oshmasligi kerak", str(ctx.exception))

    def test_serializer_rejects_zero_byte_file(self):
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_uploaded_file(empty_file)
        self.assertIn("Fayl bo'sh bo'lishi mumkin emas", str(ctx.exception))

    def test_serializer_rejects_content_not_matching_extension(self):
        fake_pdf = SimpleUploadedFile("script.exe.pdf", b"MZ fake executable", content_type="application/pdf")
        fake_jpg = SimpleUploadedFile("shell.php.jpg", b"<?php echo 1;", content_type="image/jpeg")

        for fake in (fake_pdf, fake_jpg):
            with self.assertRaises(ValidationError) as ctx:
                validate_uploaded_file(fake)
            self.assertIn("Fayl mazmuni", str(ctx.exception))

    def test_serializer_accepts_dotted_filename(self):
        dated = SimpleUploadedFile("19. hisobot 30.09.2026.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        self.assertEqual(validate_uploaded_file(dated), dated)

    def test_serializer_accepts_uppercase_extension(self):
        uppercase_pdf = SimpleUploadedFile("DOCUMENT.PDF", b"%PDF-1.4 content", content_type="application/pdf")
        uppercase_jpg = SimpleUploadedFile("PHOTO.JPG", b"\xff\xd8\xff content", content_type="image/jpeg")

        self.assertEqual(validate_uploaded_file(uppercase_pdf), uppercase_pdf)
        self.assertEqual(validate_uploaded_file(uppercase_jpg), uppercase_jpg)


class StatusTransitionTests(unittest.TestCase):
    def test_allowed_and_forbidden_transitions(self):
        can = ApplicationService.can_transition
        self.assertTrue(can('submitted', 'approved'))
        self.assertTrue(can('rejected', 'under_review'))
        self.assertTrue(can('approved', 'approved'))
        self.assertFalse(can('approved', 'submitted'))
        self.assertFalse(can('rejected', 'approved'))
