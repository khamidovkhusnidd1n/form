from django.db import models


class BaseTimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditLog(BaseTimestampedModel):
    actor = models.CharField(max_length=255, blank=True)
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit log'
        verbose_name_plural = 'Audit logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} by {self.actor or 'system'}"
