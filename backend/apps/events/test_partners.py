import io
import tempfile
from types import SimpleNamespace
from PIL import Image
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate
from .models import Event
from .serializers import EventCreateUpdateSerializer
from apps.certificates.layout import render_certificate


def logo():
    buffer = io.BytesIO()
    Image.new('RGB', (100, 60), 'white').save(buffer, format='PNG')
    return SimpleUploadedFile('logo.png', buffer.getvalue(), content_type='image/png')


class EventPartnerTests(TestCase):
    def setUp(self):
        self.media = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media.name)
        self.settings_override.enable()
        self.addCleanup(self.media.cleanup)
        self.addCleanup(self.settings_override.disable)
        self.event = Event.objects.create(title='Tadbir', type='conference',
            start_date='2026-10-12', end_date='2026-10-13', registration_deadline='2026-10-11')

    def serializer(self, event, data, files=None):
        return EventCreateUpdateSerializer(event, data=data, partial=True,
            context={'request': SimpleNamespace(FILES=files or {})})

    def test_partners_are_isolated_and_can_be_reordered_removed(self):
        s = self.serializer(self.event, {'partner_data': [{'name': 'First'}, {'name': 'Second'}]},
            {'partner_logo_0': logo(), 'partner_logo_1': logo()})
        self.assertTrue(s.is_valid(), s.errors)
        s.save()
        first, second = list(self.event.partners.all())
        s = self.serializer(self.event, {'partner_data': [{'id': second.id, 'name': 'Second'}, {'id': first.id, 'name': 'First'}]})
        self.assertTrue(s.is_valid(), s.errors); s.save()
        self.assertEqual(list(self.event.partners.values_list('name', flat=True)), ['Second', 'First'])
        other = Event.objects.create(title='Other', type='forum', start_date='2026-10-12', end_date='2026-10-13', registration_deadline='2026-10-11')
        s = self.serializer(other, {'partner_data': [{'id': first.id, 'name': 'Stolen'}]})
        self.assertFalse(s.is_valid())
        s = self.serializer(self.event, {'title': 'Renamed'})
        self.assertTrue(s.is_valid(), s.errors); s.save()
        self.assertEqual(self.event.partners.count(), 2)
        s = self.serializer(self.event, {'partner_data': []})
        self.assertTrue(s.is_valid(), s.errors); s.save()
        self.assertEqual(self.event.partners.count(), 0)

    def test_invalid_or_missing_logos_rejected_without_changes(self):
        for files in ({}, {'partner_logo_0': SimpleUploadedFile('fake.png', b'not an image')}):
            s = self.serializer(self.event, {'partner_data': [{'name': 'Partner'}]}, files)
            self.assertFalse(s.is_valid())
        self.assertEqual(self.event.partners.count(), 0)

    def test_multipart_admin_upload_and_preview_permissions(self):
        from .views import AdminEventDetailView, certificate_preview
        factory = APIRequestFactory()
        request = factory.patch('/events/admin/1/', {
            'partner_data': '[{"name":"Uploaded partner"}]', 'partner_logo_0': logo(),
        }, format='multipart')
        user = SimpleNamespace(is_authenticated=True, is_superuser=False, role='moderator')
        force_authenticate(request, user=user)
        response = AdminEventDetailView.as_view()(request, pk=self.event.pk)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.event.partners.get().name, 'Uploaded partner')
        request = factory.get('/preview/')
        force_authenticate(request, user=user)
        response = certificate_preview(request, pk=self.event.pk)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b'%PDF-'))
        request = factory.get('/preview/')
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True, is_superuser=False, role='participant'))
        self.assertEqual(certificate_preview(request, pk=self.event.pk).status_code, 403)

    def test_admin_can_add_packaged_partner_logos_once(self):
        from .views import add_default_certificate_partners
        request = APIRequestFactory().post('/defaults/')
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True, is_superuser=False, role='moderator'))
        response = add_default_certificate_partners(request, pk=self.event.pk)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['created'], 5)
        self.assertEqual(self.event.partners.count(), 5)
        response = add_default_certificate_partners(request, pk=self.event.pk)
        self.assertEqual(response.data['created'], 0)

    def test_pdf_handles_zero_one_and_twelve_partners_and_long_text(self):
        for count in [0, 1, 12]:
            pdf = render_certificate(full_name='Uzun ism ' * 30, event_title='Xalqaro tadbir ' * 35,
                date='12.10.2026', number='TEST', verify_url='https://example.com/verify',
                partners=[{'name': 'Partner', 'logo': logo()} for _ in range(count)])
            self.assertTrue(pdf.startswith(b'%PDF-'))
