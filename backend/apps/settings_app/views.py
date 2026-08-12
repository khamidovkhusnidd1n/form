from rest_framework import generics, permissions
from .models import OrganizationSettings
from .serializers import PublicOrganizationSettingsSerializer, AdminOrganizationSettingsSerializer

class PublicOrganizationSettingsView(generics.RetrieveAPIView):
    serializer_class = PublicOrganizationSettingsSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        obj, created = OrganizationSettings.objects.get_or_create(id=1)
        return obj

class AdminOrganizationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminOrganizationSettingsSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        obj, created = OrganizationSettings.objects.get_or_create(id=1)
        return obj
