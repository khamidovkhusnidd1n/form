from django.db import models
from apps.common.models import BaseTimestampedModel


class OrganizationSettings(BaseTimestampedModel):
    organization_name = models.CharField(max_length=255, default='CENTR FORM')
    logo = models.ImageField(upload_to='settings/logo/', blank=True, null=True)
    favicon = models.ImageField(upload_to='settings/favicon/', blank=True, null=True)
    footer_text = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    social_links = models.TextField(blank=True)
    map_url = models.TextField(blank=True, verbose_name="Google Maps URL")
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    sms_api_provider = models.CharField(max_length=50, blank=True)
    sms_api_key = models.CharField(max_length=255, blank=True)
    certificate_template = models.TextField(blank=True)
    invitation_template = models.TextField(blank=True)

    class Meta:
        db_table = 'organization_settings'
        verbose_name = 'Organization setting'
        verbose_name_plural = 'Organization settings'

    def __str__(self):
        return self.organization_name
