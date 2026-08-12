from rest_framework import serializers
from .models import OrganizationSettings

class PublicOrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = [
            'organization_name', 'logo', 'favicon', 'footer_text',
            'contact_email', 'contact_phone', 'social_links', 'map_url'
        ]

class AdminOrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = '__all__'
