from django.db import models
from apps.common.models import BaseTimestampedModel
from apps.applications.models import Application


class CertificateTemplate(BaseTimestampedModel):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'certificate_templates'
        verbose_name = 'Certificate template'
        verbose_name_plural = 'Certificate templates'

    def __str__(self):
        return self.name


class Certificate(BaseTimestampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        ISSUED = 'issued', 'Berildi'
        REVOKED = 'revoked', 'Bekor qilindi'

    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='certificate')
    certificate_number = models.CharField(max_length=100, unique=True)
    template = models.ForeignKey(CertificateTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    pdf_file = models.FileField(upload_to='certificates/', blank=True, null=True)
    qr_code = models.ImageField(upload_to='certificates/qrcodes/', blank=True, null=True)
    signature = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'certificates'
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'

    def __str__(self):
        return self.certificate_number
