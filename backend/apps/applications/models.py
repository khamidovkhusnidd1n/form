import random
import string
from django.db import models
from apps.events.models import Event


def generate_application_id():
    from django.utils import timezone
    year = timezone.now().year
    num = ''.join(random.choices(string.digits, k=6))
    candidate = f"CF-{year}-{num}"
    while Application.objects.filter(application_id=candidate).exists():
        num = ''.join(random.choices(string.digits, k=6))
        candidate = f"CF-{year}-{num}"
    return candidate


class Application(models.Model):
    class Gender(models.TextChoices):
        MALE = 'male', 'Erkak'
        FEMALE = 'female', 'Ayol'

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Yuborildi'
        UNDER_REVIEW = 'under_review', "Ko'rib chiqilmoqda"
        INFO_REQUIRED = 'info_required', "Qo'shimcha ma'lumot kerak"
        APPROVED = 'approved', 'Tasdiqlandi'
        REJECTED = 'rejected', 'Rad etildi'

    application_id = models.CharField(max_length=20, unique=True, default=generate_application_id, editable=False)
    event = models.ForeignKey(Event, on_delete=models.PROTECT, related_name='applications')

    # Personal info
    full_name = models.CharField(max_length=300)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    # Organization
    organization = models.CharField(max_length=500)
    position = models.CharField(max_length=300)
    country = models.CharField(max_length=255, default='O\'zbekiston', verbose_name='Mamlakat')
    region = models.CharField(max_length=100)
    district = models.CharField(max_length=100)

    # Presentation
    presentation_title = models.CharField(max_length=500)
    abstract = models.TextField()

    # Files
    document = models.FileField(upload_to='applications/documents/', null=True, blank=True)
    passport = models.FileField(upload_to='applications/passports/', null=True, blank=True)
    photo = models.ImageField(upload_to='applications/photos/', null=True, blank=True)

    # Generated files
    invitation_pdf = models.FileField(upload_to='applications/invitations/', null=True, blank=True)
    certificate_pdf = models.FileField(upload_to='applications/certificates/', null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    admin_comment = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    translations = models.JSONField(default=dict, blank=True, null=True)

    class Meta:
        db_table = 'applications'
        ordering = ['-submitted_at']
        verbose_name = "Ariza"
        verbose_name_plural = "Arizalar"

    def __str__(self):
        return f"{self.application_id} — {self.full_name}"
