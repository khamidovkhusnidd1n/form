from django.db import models
from apps.common.models import BaseTimestampedModel


class QRCodeModel(BaseTimestampedModel):
    qr_type = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField()
    token = models.CharField(max_length=255, unique=True)
    hash_value = models.CharField(max_length=64)
    image = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'qr_codes'
        verbose_name = 'QR kod'
        verbose_name_plural = 'QR kodlar'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.qr_type}-{self.object_id}"
