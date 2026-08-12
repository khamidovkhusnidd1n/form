from django.urls import path
from .views import PublicOrganizationSettingsView, AdminOrganizationSettingsView

urlpatterns = [
    path('organization/', PublicOrganizationSettingsView.as_view(), name='public-organization-settings'),
    path('admin/organization/', AdminOrganizationSettingsView.as_view(), name='admin-organization-settings'),
]
