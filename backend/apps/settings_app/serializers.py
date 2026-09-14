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
    smtp_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    sms_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = OrganizationSettings
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['has_smtp_password'] = bool(instance.smtp_password)
        ret['has_sms_api_key'] = bool(instance.sms_api_key)
        return ret
