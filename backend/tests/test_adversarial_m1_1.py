# -*- coding: utf-8 -*-
import os
import sys
import unittest
import json
import hmac
from datetime import date, timedelta
from unittest.mock import Mock, patch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ['USE_SQLITE'] = 'True'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')

import django
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.permissions import IsAdminUser

from apps.accounts.models import AdminUser
from apps.accounts.permissions import IsSuperAdmin, IsAdminOrAbove, IsModeratorOrAbove
from apps.accounts.serializers import AdminUserCreateSerializer, ChangePasswordSerializer
from apps.accounts.views import LoginView, change_password_view
from apps.applications.models import Application
from apps.applications.views import track_application, SubmitApplicationView
from apps.events.models import Event
from apps.qr.services import QRService
from apps.qr.views import verify_qr
from apps.certificates.models import Certificate, CertificateTemplate
from apps.invitations.models import Invitation
from apps.settings_app.views import AdminOrganizationSettingsView


class TestIsSuperAdminPrivilegeEscalation(TestCase):
    """
    Adversarial testing of IsSuperAdmin RBAC:
    Stress-tests all combinations of is_staff, is_superuser, role, and authentication status.
    """
    def setUp(self):
        self.perm = IsSuperAdmin()

    def test_unauthenticated_request_denied(self):
        req = Mock(user=Mock(is_authenticated=False))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_none_user_denied(self):
        req = Mock(user=None)
        self.assertFalse(self.perm.has_permission(req, None))

    def test_moderator_with_staff_denied(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=False, role='moderator'))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_administrator_with_staff_denied(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=False, role='administrator'))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_super_admin_role_without_superuser_flag_denied(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=False, role='super_admin'))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_superuser_flag_with_moderator_role_denied(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=True, role='moderator'))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_superuser_flag_with_administrator_role_denied(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=True, role='administrator'))
        self.assertFalse(self.perm.has_permission(req, None))

    def test_legitimate_super_admin_allowed(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=True, role='super_admin'))
        self.assertTrue(self.perm.has_permission(req, None))

    def test_superadmin_alias_variant_allowed(self):
        req = Mock(user=Mock(is_authenticated=True, is_staff=True, is_superuser=True, role='superadmin'))
        self.assertTrue(self.perm.has_permission(req, None))

    def test_superadmin_created_via_serializer_locked_out_due_to_missing_superuser_flag(self):
        data = {
            'username': 'new_superadmin_user',
            'email': 'new_super@example.uz',
            'full_name': 'New Super',
            'role': 'super_admin',
            'password': 'StrongPassword2026!'
        }
        serializer = AdminUserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        created_user = serializer.save()
        self.assertEqual(created_user.role, 'super_admin')
        self.assertFalse(created_user.is_superuser)
        # Verify that newly created superadmin fails IsSuperAdmin check
        req = Mock(user=created_user)
        self.assertFalse(self.perm.has_permission(req, None), "New super_admin was expected to fail IsSuperAdmin because is_superuser=False")


class TestQRHMACVerificationAndForgery(TestCase):
    """
    Adversarial challenge of QR verification:
    HMAC tampering, token forgery, and cross-object signature replay.
    """
    def setUp(self):
        self.event = Event.objects.create(
            title="Adversarial Test Event",
            type=Event.EventType.CONFERENCE,
            format=Event.Format.OFFLINE,
            status=Event.Status.PLANNED,
            short_description="Short",
            full_description="Full",
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=12),
            registration_deadline=date.today() + timedelta(days=5),
            venue="Tashkent",
            registration_enabled=True
        )
        self.app1 = Application.objects.create(
            event=self.event,
            full_name="Target Applicant 1",
            date_of_birth="1995-01-01",
            gender="male",
            phone="+998901111111",
            email="app1@test.uz",
            organization="Org 1",
            position="Pos 1",
            region="Toshkent"
        )
        self.app2 = Application.objects.create(
            event=self.event,
            full_name="Target Applicant 2",
            date_of_birth="1996-02-02",
            gender="female",
            phone="+998902222222",
            email="app2@test.uz",
            organization="Org 2",
            position="Pos 2",
            region="Samarqand"
        )
        self.cert1 = Certificate.objects.create(
            application=self.app1,
            certificate_number="CERT-0001",
            status=Certificate.Status.ISSUED
        )
        self.cert2 = Certificate.objects.create(
            application=self.app2,
            certificate_number="CERT-0002",
            status=Certificate.Status.ISSUED
        )
        self.client = APIClient()

    def test_forged_hash_rejected(self):
        payload = QRService.build_verification_payload("certificate", self.cert1.id)
        forged_hash = "a" * 64
        response = self.client.get(f"/api/v1/qr/verify/certificate/{self.cert1.id}/?token={payload['token']}&hash={forged_hash}")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data["valid"])

    def test_missing_token_or_hash_rejected(self):
        resp1 = self.client.get(f"/api/v1/qr/verify/certificate/{self.cert1.id}/")
        self.assertEqual(resp1.status_code, 400)
        resp2 = self.client.get(f"/api/v1/qr/verify/certificate/{self.cert1.id}/?token=cf-certificate-{self.cert1.id}")
        self.assertEqual(resp2.status_code, 400)

    def test_valid_token_and_hash_passes(self):
        payload = QRService.build_verification_payload("certificate", self.cert1.id)
        response = self.client.get(f"/api/v1/qr/verify/certificate/{self.cert1.id}/?token={payload['token']}&hash={payload['hash']}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["valid"])

    def test_cross_object_token_replay_vulnerability(self):
        """
        VULNERABILITY PROOF:
        An attacker takes token and hash generated for cert1 (e.g. from public QR code)
        and sends it with cert2's ID.
        Because safe_token uses 	oken or ..., it computes hash over token, NOT binding to cert2!
        """
        payload1 = QRService.build_verification_payload("certificate", self.cert1.id)
        response = self.client.get(
            f"/api/v1/qr/verify/certificate/{self.cert2.id}/?token={payload1['token']}&hash={payload1['hash']}"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Demonstrates that cross-object replay works due to unbound token parameter
        self.assertTrue(data["valid"], "Vulnerability reproduced: Token from Cert 1 validated Cert 2!")


class TestTrackingIDORAndPII(TestCase):
    """
    Adversarial testing of application tracking endpoint:
    Checks phone matching logic, IDOR resistance, and empty-phone bypass.
    """
    def setUp(self):
        self.event = Event.objects.create(
            title="Tracking Test Event",
            type=Event.EventType.CONFERENCE,
            format=Event.Format.OFFLINE,
            status=Event.Status.PLANNED,
            short_description="Short",
            full_description="Full",
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=12),
            registration_deadline=date.today() + timedelta(days=5),
            venue="Tashkent",
            registration_enabled=True
        )
        self.app_valid = Application.objects.create(
            event=self.event,
            full_name="Valid Applicant",
            date_of_birth="1990-05-15",
            gender="male",
            phone="+998901234567",
            email="valid@example.uz",
            organization="Enterprise A",
            position="Manager",
            region="Toshkent",
            district="Yunusobod",
            admin_comment="CONFIDENTIAL_ADMIN_NOTE_12345"
        )
        self.app_no_phone = Application.objects.create(
            event=self.event,
            full_name="No Phone Applicant",
            date_of_birth="1992-08-20",
            gender="female",
            phone="N/A",
            email="nophone@example.uz",
            organization="Enterprise B",
            position="Lead",
            region="Samarqand",
            district="Pastdarg'om"
        )
        self.client = APIClient()

    def test_missing_phone_rejected_400(self):
        response = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/")
        self.assertEqual(response.status_code, 400)

    def test_short_phone_rejected_400(self):
        response = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/?phone=123456")
        self.assertEqual(response.status_code, 400)

    def test_mismatched_phone_rejected_404(self):
        response = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/?phone=998907654321")
        self.assertEqual(response.status_code, 404)

    def test_exact_phone_and_suffix_phone_accepted_200(self):
        resp_full = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/?phone=+998 90 123 45 67")
        self.assertEqual(resp_full.status_code, 200)
        self.assertEqual(resp_full.json()['full_name'], "Valid Applicant")

        resp_suffix = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/?phone=1234567")
        self.assertEqual(resp_suffix.status_code, 200)

    def test_pii_fields_not_leaked(self):
        resp = self.client.get(f"/api/v1/applications/track/{self.app_valid.application_id}/?phone=998901234567")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertNotIn('admin_comment', data)
        self.assertNotIn('CONFIDENTIAL_ADMIN_NOTE_12345', json.dumps(data))
        self.assertNotIn('email', data)
        self.assertNotIn('passport', data)
        self.assertNotIn('document', data)

    def test_empty_or_non_digit_phone_idor_bypass_vulnerability(self):
        """
        VULNERABILITY PROOF:
        When DB application has phone='N/A' (0 digits), clean_req_phone.endswith('') evaluates to True!
        An attacker with any 7-digit phone number accesses the record.
        """
        resp = self.client.get(f"/api/v1/applications/track/{self.app_no_phone.application_id}/?phone=998990001122")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['full_name'], "No Phone Applicant")


class TestRateLimitingBypassOnFunctionBasedViews(TestCase):
    """
    Adversarial verification of Rate Limiting:
    Proves that ScopedRateThrottle fails on FBVs because throttle_scope was assigned
    after @api_view decoration, silently disabling rate limits.
    """
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_track_application_fails_to_throttle(self):
        """
        Sends 40 requests with scope application_track (limit 30/min).
        Proves that zero requests are throttled because throttle_scope is None on WrappedAPIView.
        """
        throttled_count = 0
        for _ in range(40):
            req = self.factory.get('/api/v1/applications/track/NONEXISTENT/?phone=998901234567', REMOTE_ADDR='192.168.1.50')
            resp = track_application(req, 'NONEXISTENT')
            if resp.status_code == 429:
                throttled_count += 1
        self.assertEqual(throttled_count, 0, "Proves rate limiting was completely bypassed on track_application")

    def test_change_password_fails_to_throttle(self):
        """
        Sends 15 requests with scope auth_password (limit 5/min).
        Proves that zero requests are throttled on change_password_view.
        """
        throttled_count = 0
        for _ in range(15):
            req = self.factory.post('/api/v1/accounts/change-password/', {'old_password': 'x', 'new_password': 'y'}, format='json', REMOTE_ADDR='192.168.1.60')
            req.user = Mock(is_authenticated=True)
            resp = change_password_view(req)
            if resp.status_code == 429:
                throttled_count += 1
        self.assertEqual(throttled_count, 0, "Proves rate limiting was completely bypassed on change_password_view")

    def test_class_based_views_correctly_throttle(self):
        """
        Verifies that class-based views (LoginView at 5/min) DO throttle properly.
        """
        view = LoginView.as_view()
        throttled = False
        for i in range(10):
            req = self.factory.post('/api/v1/accounts/login/', {'username': 'test', 'password': 'wrong'}, format='json', REMOTE_ADDR='192.168.1.70')
            resp = view(req)
            if resp.status_code == 429:
                throttled = True
                break
        self.assertTrue(throttled, "LoginView correctly enforced throttle on 6th request")


class TestAccessControlOnAdminOrganizationSettings(TestCase):
    """
    Adversarial verification of AdminOrganizationSettingsView:
    Uses permissions.IsAdminUser which relies on is_staff=True, allowing moderators to edit settings.
    """
    def test_is_admin_user_grants_access_to_moderators(self):
        perm = IsAdminUser()
        moderator_user = Mock(is_authenticated=True, is_staff=True, role='moderator')
        req = Mock(user=moderator_user)
        self.assertTrue(
            perm.has_permission(req, None),
            "Demonstrates moderator with is_staff=True passes IsAdminUser on Organization Settings"
        )
