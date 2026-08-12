from django.db import models
from apps.common.models import BaseTimestampedModel
from apps.applications.models import Application


class Invitation(BaseTimestampedModel):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='invitation')
    invitation_number = models.CharField(max_length=100, unique=True)
    pdf_file = models.FileField(upload_to='invitations/', blank=True, null=True)
    qr_code = models.ImageField(upload_to='invitations/qrcodes/', blank=True, null=True)
    is_print_ready = models.BooleanField(default=False)

    class Meta:
        db_table = 'invitations'
        verbose_name = 'Invitation'
        verbose_name_plural = 'Invitations'

    def __str__(self):
        return self.invitation_number
