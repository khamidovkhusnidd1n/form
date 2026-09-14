# -*- coding: utf-8 -*-
import os
import sys
import unittest
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ['USE_SQLITE'] = 'True'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')

import django
django.setup()

from django.test import TestCase
from django.urls import resolve, reverse, Resolver404
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status

from apps.accounts.models import AdminUser
from apps.accounts.serializers import AdminUserCreateSerializer, ChangePasswordSerializer
from apps.settings_app.models import OrganizationSettings
from apps.settings_app.serializers import PublicOrganizationSettingsSerializer, AdminOrganizationSettingsSerializer
import apps.common.views as common_views

class AdversarialPasswordValidationTests(TestCase):
    def setUp(self):
        self.superadmin = AdminUser.objects.create_superuser(
            username='challenger_super',
            email='super@challenge.uz',
            full_name='Super Challenger',
            password='InitialStrongPassword2026!'
        )
        self.client = APIClient()

    def test_create_serializer_blocks_short_passwords(self):
        short_passwords = ['', 'a', '123', 'short', '1234567', 'Abc!12']
        for pwd in short_passwords:
            with self.subTest(pwd=pwd):
                data = {
                    'username': f'user_{len(pwd)}',
                    'email': f'user_{len(pwd)}@example.uz',
                    'full_name': 'Test User',
                    'role': 'moderator',
                    'password': pwd
                }
                serializer = AdminUserCreateSerializer(data=data)
                self.assertFalse(
                    serializer.is_valid(),
                    f'AdminUserCreateSerializer unexpectedly accepted short password: {repr(pwd)}'
                )
                self.assertIn('password', serializer.errors)

    def test_create_serializer_blocks_common_passwords(self):
        common_passwords = [
            'password', '12345678', 'qwertyui', 'admin123', 'administrator',
            'welcome1', 'secret12', 'pass1234', 'iloveyou'
        ]
        for pwd in common_passwords:
            with self.subTest(pwd=pwd):
                data = {
                    'username': f'user_c_{pwd[:5]}',
                    'email': f'user_c_{pwd[:5]}@example.uz',
                    'full_name': 'Test User',
                    'role': 'moderator',
                    'password': pwd
                }
                serializer = AdminUserCreateSerializer(data=data)
                self.assertFalse(
                    serializer.is_valid(),
                    f'AdminUserCreateSerializer unexpectedly accepted common password: {repr(pwd)}'
                )
                self.assertIn('password', serializer.errors)
                err_str = str(serializer.errors['password']).lower()
                self.assertTrue(
                    any(term in err_str for term in ['common', 'keng tarqalgan', 'umumiy', 'oddiy', 'too short', 'numeric', 'raqam']),
                    f'Expected common/numeric error message for {pwd}, got: {err_str}'
                )

    def test_create_serializer_blocks_numeric_only_passwords(self):
        numeric_passwords = [
            '12345678', '9876543210', '00000000', '111122223333', '849204820184'
        ]
        for pwd in numeric_passwords:
            with self.subTest(pwd=pwd):
                data = {
                    'username': f'user_num_{pwd[:5]}',
                    'email': f'user_num_{pwd[:5]}@example.uz',
                    'full_name': 'Test User',
                    'role': 'moderator',
                    'password': pwd
                }
                serializer = AdminUserCreateSerializer(data=data)
                self.assertFalse(
                    serializer.is_valid(),
                    f'AdminUserCreateSerializer unexpectedly accepted numeric-only password: {repr(pwd)}'
                )
                self.assertIn('password', serializer.errors)

    def test_create_serializer_user_attribute_similarity_investigation(self):
        username = 'similar_target'
        data = {
            'username': username,
            'email': f'{username}@example.uz',
            'full_name': 'Similar Target',
            'role': 'moderator',
            'password': 'similar_target2026!'
        }
        serializer = AdminUserCreateSerializer(data=data)
        is_val = serializer.is_valid()
        # Document empirical observation: AdminUserCreateSerializer does not pass user instance to validate_password
        print(f'\n[EMPIRICAL OBS] AdminUserCreateSerializer similarity validation result: is_valid={is_val}')

    def test_create_serializer_accepts_valid_strong_passwords(self):
        strong_passwords = [
            'Secure#P@ssw0rd2026!',
            'Correct-Horse-Battery-Staple-2026!',
            'Xursh1dbek#UzB@malaka2026'
        ]
        for pwd in strong_passwords:
            with self.subTest(pwd=pwd):
                username = f'valid_{abs(hash(pwd)) % 100000}'
                data = {
                    'username': username,
                    'email': f'{username}@example.uz',
                    'full_name': 'Valid User',
                    'role': 'moderator',
                    'password': pwd
                }
                serializer = AdminUserCreateSerializer(data=data)
                self.assertTrue(
                    serializer.is_valid(),
                    f'AdminUserCreateSerializer rejected strong password {pwd}: {serializer.errors}'
                )
                user = serializer.save()
                self.assertTrue(user.check_password(pwd), 'User password hash check failed')
                self.assertNotEqual(user.password, pwd, 'Password stored in plaintext!')

    def test_change_password_serializer_blocks_weak_passwords(self):
        factory = APIRequestFactory()
        request = factory.post('/api/v1/auth/change-password/')
        request.user = self.superadmin

        weak_passwords = [
            '123', 'short', 'password', '12345678', 'qwertyui', 'administrator'
        ]
        for pwd in weak_passwords:
            with self.subTest(pwd=pwd):
                data = {
                    'old_password': 'InitialStrongPassword2026!',
                    'new_password': pwd
                }
                serializer = ChangePasswordSerializer(data=data, context={'request': request})
                self.assertFalse(
                    serializer.is_valid(),
                    f'ChangePasswordSerializer accepted weak password: {pwd}'
                )
                self.assertIn('new_password', serializer.errors)

    def test_change_password_user_attribute_similarity(self):
        factory = APIRequestFactory()
        request = factory.post('/api/v1/auth/change-password/')
        request.user = self.superadmin

        # Username is 'challenger_super'
        similar_pwd = 'challenger_super123!'
        data = {
            'old_password': 'InitialStrongPassword2026!',
            'new_password': similar_pwd
        }
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertFalse(
            serializer.is_valid(),
            'ChangePasswordSerializer should reject password too similar to username'
        )
        self.assertIn('new_password', serializer.errors)

    def test_change_password_view_end_to_end(self):
        self.client.force_authenticate(user=self.superadmin)
        url = '/api/v1/auth/change-password/'

        res = self.client.post(url, {
            'old_password': 'InitialStrongPassword2026!',
            'new_password': 'password'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', res.data)

        res = self.client.post(url, {
            'old_password': 'WrongPassword123!',
            'new_password': 'BrandNewValidSecure#Password2026'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', res.data)
        self.assertIn('noto', str(res.data['detail']).lower())

        res = self.client.post(url, {
            'old_password': 'InitialStrongPassword2026!',
            'new_password': 'BrandNewValidSecure#Password2026'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.superadmin.refresh_from_db()
        self.assertTrue(self.superadmin.check_password('BrandNewValidSecure#Password2026'))


class AdversarialRouteDeletionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_view_functions_deleted_from_codebase(self):
        forbidden_functions = [
            'reset_admin_view',
            'run_migrations_view',
            'run_makemigrations_view',
            'test_email_view'
        ]
        for fn_name in forbidden_functions:
            self.assertFalse(
                hasattr(common_views, fn_name),
                f'Forbidden function {fn_name} still exists in apps.common.views!'
            )

    def test_deleted_api_routes_return_404(self):
        targets = [
            '/api/v1/common/reset-admin/',
            '/api/v1/common/reset-admin',
            '/api/v1/common/reset-admin//',
            '/api/v1/common/RESET-ADMIN/',
            '/api/v1/common/migrate/',
            '/api/v1/common/migrate',
            '/api/v1/common/makemigrations/',
            '/api/v1/common/makemigrations',
            '/api/v1/common/test-email/',
            '/api/v1/common/test-email',
            '/api/v1/reset-admin/',
            '/api/v1/migrate/',
            '/api/v1/makemigrations/',
            '/api/v1/test-email/'
        ]
        methods = ['get', 'post', 'put', 'patch', 'delete', 'options']

        for path in targets:
            for method in methods:
                with self.subTest(path=path, method=method):
                    client_method = getattr(self.client, method)
                    response = client_method(path)
                    self.assertIn(
                        response.status_code,
                        [status.HTTP_404_NOT_FOUND, status.HTTP_301_MOVED_PERMANENTLY],
                        f'Path {path} with method {method.upper()} returned unexpected status {response.status_code}'
                    )
                    if response.status_code == status.HTTP_301_MOVED_PERMANENTLY:
                        redirect_target = response.headers.get('Location', '')
                        res2 = client_method(redirect_target)
                        self.assertEqual(
                            res2.status_code,
                            status.HTTP_404_NOT_FOUND,
                            f'Redirected target {redirect_target} returned {res2.status_code}'
                        )

    def test_admin_and_root_backdoor_paths(self):
        root_paths = [
            '/reset-admin/', '/reset-admin',
            '/migrate/', '/migrate',
            '/makemigrations/', '/makemigrations',
            '/admin/', '/admin', '/admin/login/',
            '/superadmin/', '/superadmin'
        ]
        for path in root_paths:
            match = resolve(path)
            self.assertEqual(
                match.func.__name__,
                'react_app_view',
                f'Path {path} resolved to unexpected handler {match.func.__name__} instead of react_app_view'
            )


class AdversarialSettingsSerializerSecrecyTests(TestCase):
    def setUp(self):
        self.plain_smtp = 'TopSecretSMTPPass#2026!'
        self.plain_sms = 'EskizTokenHeader.Payload.SignatureXYZ999'
        self.settings_obj, _ = OrganizationSettings.objects.get_or_create(id=1)
        self.settings_obj.organization_name = 'Test Markaz'
        self.settings_obj.smtp_host = 'smtp.example.uz'
        self.settings_obj.smtp_port = 465
        self.settings_obj.smtp_username = 'info@example.uz'
        self.settings_obj.smtp_password = self.plain_smtp
        self.settings_obj.sms_api_provider = 'eskiz'
        self.settings_obj.sms_api_key = self.plain_sms
        self.settings_obj.save()

        self.superadmin = AdminUser.objects.create_superuser(
            username='settings_admin',
            email='settings_admin@example.uz',
            full_name='Settings Admin',
            password='StrongSettingsPass2026!'
        )
        self.client = APIClient()

    def test_admin_serializer_representation_never_contains_raw_secrets(self):
        serializer = AdminOrganizationSettingsSerializer(self.settings_obj)
        data = serializer.data

        self.assertNotIn('smtp_password', data, 'smtp_password found directly in serialized data!')
        self.assertNotIn('sms_api_key', data, 'sms_api_key found directly in serialized data!')

        self.assertIn('has_smtp_password', data)
        self.assertIn('has_sms_api_key', data)
        self.assertIs(data['has_smtp_password'], True)
        self.assertIs(data['has_sms_api_key'], True)

        serialized_json = json.dumps(data)
        self.assertNotIn(
            self.plain_smtp,
            serialized_json,
            'Raw SMTP password found in serialized JSON representation!'
        )
        self.assertNotIn(
            self.plain_sms,
            serialized_json,
            'Raw SMS API key found in serialized JSON representation!'
        )

    def test_admin_serializer_empty_and_null_secrets_handling(self):
        self.settings_obj.smtp_password = ''
        self.settings_obj.sms_api_key = ''
        self.settings_obj.save()

        serializer = AdminOrganizationSettingsSerializer(self.settings_obj)
        data = serializer.data

        self.assertNotIn('smtp_password', data)
        self.assertNotIn('sms_api_key', data)
        self.assertIs(data['has_smtp_password'], False)
        self.assertIs(data['has_sms_api_key'], False)

    def test_public_serializer_never_exposes_secrets_or_status_flags(self):
        serializer = PublicOrganizationSettingsSerializer(self.settings_obj)
        data = serializer.data

        forbidden_keys = [
            'smtp_password', 'sms_api_key',
            'has_smtp_password', 'has_sms_api_key',
            'smtp_host', 'smtp_port', 'smtp_username',
            'sms_api_provider'
        ]
        for key in forbidden_keys:
            self.assertNotIn(key, data, f'Public serializer leaked forbidden field: {key}')

        serialized_json = json.dumps(data)
        self.assertNotIn(self.plain_smtp, serialized_json)
        self.assertNotIn(self.plain_sms, serialized_json)

    def test_settings_api_endpoints_do_not_leak_secrets(self):
        res_pub = self.client.get('/api/v1/settings/organization/')
        self.assertEqual(res_pub.status_code, status.HTTP_200_OK)
        pub_json = json.dumps(res_pub.data)
        self.assertNotIn('smtp_password', pub_json)
        self.assertNotIn('sms_api_key', pub_json)
        self.assertNotIn(self.plain_smtp, pub_json)
        self.assertNotIn(self.plain_sms, pub_json)

        res_anon = self.client.get('/api/v1/settings/admin/organization/')
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.superadmin)
        res_admin = self.client.get('/api/v1/settings/admin/organization/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        admin_json = json.dumps(res_admin.data)
        self.assertNotIn('smtp_password', res_admin.data)
        self.assertNotIn('sms_api_key', res_admin.data)
        self.assertNotIn('"smtp_password":', admin_json)
        self.assertNotIn('"sms_api_key":', admin_json)
        self.assertNotIn(self.plain_smtp, admin_json)
        self.assertNotIn(self.plain_sms, admin_json)
        self.assertTrue(res_admin.data.get('has_smtp_password'))
        self.assertTrue(res_admin.data.get('has_sms_api_key'))

    def test_settings_update_preserves_password_and_accepts_new_password_securely(self):
        self.client.force_authenticate(user=self.superadmin)
        url = '/api/v1/settings/admin/organization/'

        # Partial update without touching secrets
        patch_res = self.client.patch(url, {'organization_name': 'Brand New Center Name'}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.settings_obj.refresh_from_db()
        self.assertEqual(self.settings_obj.organization_name, 'Brand New Center Name')
        self.assertEqual(self.settings_obj.smtp_password, self.plain_smtp, 'SMTP password was wiped by partial update!')
        self.assertNotIn('smtp_password', patch_res.data)
        self.assertNotIn('"smtp_password":', json.dumps(patch_res.data))

        # Update secrets
        new_smtp = 'UpdatedUltraSecretSMTP#2026'
        new_sms = 'NewSmsSecretToken123456789'
        patch_res2 = self.client.patch(url, {
            'smtp_password': new_smtp,
            'sms_api_key': new_sms
        }, format='json')
        self.assertEqual(patch_res2.status_code, status.HTTP_200_OK)
        self.settings_obj.refresh_from_db()
        self.assertEqual(self.settings_obj.smtp_password, new_smtp)
        self.assertEqual(self.settings_obj.sms_api_key, new_sms)
        
        # Verify response of the patch still does NOT leak the new secrets
        res2_json = json.dumps(patch_res2.data)
        self.assertNotIn('smtp_password', patch_res2.data)
        self.assertNotIn('sms_api_key', patch_res2.data)
        self.assertNotIn('"smtp_password":', res2_json)
        self.assertNotIn('"sms_api_key":', res2_json)
        self.assertNotIn(new_smtp, res2_json)
        self.assertNotIn(new_sms, res2_json)
        self.assertTrue(patch_res2.data.get('has_smtp_password'))
        self.assertTrue(patch_res2.data.get('has_sms_api_key'))

if __name__ == '__main__':
    unittest.main()
