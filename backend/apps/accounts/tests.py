import unittest
from unittest.mock import MagicMock
from apps.accounts.permissions import IsModeratorOrAbove


class IsModeratorOrAboveTests(unittest.TestCase):
    def setUp(self):
        self.permission = IsModeratorOrAbove()
        self.request = MagicMock()

    def test_unauthenticated_user_denied(self):
        self.request.user.is_authenticated = False
        self.assertFalse(self.permission.has_permission(self.request, None))

    def test_superuser_or_staff_allowed(self):
        self.request.user.is_authenticated = True
        self.request.user.is_superuser = True
        self.assertTrue(self.permission.has_permission(self.request, None))

        self.request.user.is_superuser = False
        self.request.user.is_staff = True
        self.assertTrue(self.permission.has_permission(self.request, None))

    def test_valid_roles_allowed(self):
        self.request.user.is_authenticated = True
        self.request.user.is_superuser = False
        self.request.user.is_staff = False

        for role in ('super_admin', 'administrator', 'moderator', 'admin'):
            self.request.user.role = role
            self.assertTrue(self.permission.has_permission(self.request, None))

    def test_regular_user_role_denied(self):
        self.request.user.is_authenticated = True
        self.request.user.is_superuser = False
        self.request.user.is_staff = False
        self.request.user.role = 'applicant'
        self.assertFalse(self.permission.has_permission(self.request, None))
