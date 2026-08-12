from django.db import models
from apps.common.models import BaseTimestampedModel


class NotificationTemplate(BaseTimestampedModel):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    event_type = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Notification template'
        verbose_name_plural = 'Notification templates'

    def __str__(self):
        return self.name
