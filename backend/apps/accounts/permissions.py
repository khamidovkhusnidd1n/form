from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or
            request.user.is_staff or
            getattr(request.user, 'role', None) == 'super_admin'
        )


class IsAdminOrAbove(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('super_admin', 'administrator')


class IsModeratorOrAbove(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False):
            return True
        user_role = getattr(request.user, 'role', None)
        return user_role in ('super_admin', 'administrator', 'moderator', 'admin')

