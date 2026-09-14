from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Strictly grant access to users with role super_admin / superadmin AND is_superuser flag.
    Does NOT rely on is_staff (because regular moderators have is_staff=True by default).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = getattr(request.user, 'role', None)
        is_superadmin_role = user_role in ('super_admin', 'superadmin')
        return bool(is_superadmin_role and request.user.is_superuser)


class IsAdminOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        user_role = getattr(request.user, 'role', None)
        return user_role in ('super_admin', 'superadmin', 'administrator', 'admin')


class IsModeratorOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        user_role = getattr(request.user, 'role', None)
        return user_role in ('super_admin', 'superadmin', 'administrator', 'moderator', 'admin')

