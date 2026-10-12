import tempfile
from unittest.mock import patch
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from apps.events.models import Event
from apps.applications.models import Application
from .models import Certificate
from .services import generate_certificate
from .views import VerifyCertificateView
from .layout import render_certificate


class CertificateVerificationTests(TestCase):
    def setUp(self):
        self.media = tempfile.TemporaryDirectory()
        override = override_settings(MEDIA_ROOT=self.media.name, FRONTEND_URL='https://form.example/'); override.enable()
        self.addCleanup(self.media.cleanup); self.addCleanup(override.disable)
        event = Event.objects.create(title='Ariza topshirilgan tadbir', type='conference',
            start_date='2026-10-12', end_date='2026-10-13', registration_deadline='2026-10-11')
        self.application = Application.objects.create(event=event, full_name='Haqiqiy Ishtirokchi',
            date_of_birth='1990-01-01', gender='female', phone='123', email='participant@example.com',
            organization='Markaz', position='Pedagog', region='Toshkent', district='Markaz')

    def verify(self, token):
        return VerifyCertificateView.as_view()(APIRequestFactory().get('/verify/'), token=token)

    def test_issued_pdf_and_qr_use_application_identity_and_event(self):
        with patch('apps.certificates.layout.render_certificate', wraps=render_certificate) as render:
            cert = generate_certificate(self.application)
        data = render.call_args.kwargs
        self.assertEqual(data['full_name'], self.application.full_name)
        self.assertEqual(data['event_title'], self.application.event.title)
        self.assertEqual(data['number'], cert.certificate_number)
        self.assertEqual(data['verify_url'], f'https://form.example/certificate/verify/{cert.verification_token}')
        response = self.verify(cert.verification_token)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['name'], self.application.full_name)
        self.assertEqual(response.data['event'], self.application.event.title)
        self.assertEqual(generate_certificate(self.application).pk, cert.pk)

    def test_pending_revoked_missing_and_unpersisted_tokens_are_invalid(self):
        self.assertEqual(self.verify('unknown').status_code, 404)
        cert = Certificate.objects.create(application=self.application, certificate_number='TEST', verification_token='pending')
        self.assertFalse(self.verify('pending').data['valid'])
        cert.status = Certificate.Status.ISSUED; cert.save()
        self.assertFalse(self.verify('pending').data['valid'])
        cert.status = Certificate.Status.REVOKED; cert.revoked_at = timezone.now(); cert.save()
        self.assertFalse(self.verify('pending').data['valid'])

    def test_failed_registration_never_attaches_unverifiable_pdf(self):
        with patch.object(Certificate, 'save', side_effect=RuntimeError('Database failure')):
            with self.assertRaises(RuntimeError):
                generate_certificate(self.application)
        self.application.refresh_from_db()
        self.assertFalse(self.application.certificate_pdf)
