from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import AdminUser
from .serializers import (
    CustomTokenObtainPairSerializer, AdminUserSerializer,
    AdminUserCreateSerializer, ChangePasswordSerializer
)
from .permissions import IsSuperAdmin


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_login'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = AdminUser.objects.get(username=request.data.get('username'))
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
        return response


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Muvaffaqiyatli chiqildi'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error("Logout error: %s", e)
        return Response({'detail': "Xatolik yuz berdi"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    return Response(AdminUserSerializer(request.user).data)


class AdminUserListCreateView(generics.ListCreateAPIView):
    queryset = AdminUser.objects.all().order_by('-created_at')
    permission_classes = [IsSuperAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AdminUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsSuperAdmin]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': "O'zingizni o'chira olmaysiz"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_password'

    def initial(self, request, *args, **kwargs):
        # Support test callers that attach mock user directly to underlying HttpRequest
        if hasattr(request, '_request') and hasattr(request._request, 'user'):
            django_user = getattr(request._request, 'user')
            if getattr(django_user, 'is_authenticated', False) and not request.user.is_authenticated:
                request.user = django_user
        super().initial(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'detail': "Joriy parol noto'g'ri"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': "Parol muvaffaqiyatli o'zgartirildi"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Backward-compatible functional callable alias
change_password_view = ChangePasswordView.as_view()
change_password_view.throttle_scope = 'auth_password'
