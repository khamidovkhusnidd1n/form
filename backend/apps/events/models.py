from django.db import models


class Event(models.Model):
    class EventType(models.TextChoices):
        CONFERENCE = 'conference', 'Konferensiya'
        FORUM = 'forum', 'Forum'
        EXHIBITION = 'exhibition', "Ko'rgazma"
        SYMPOSIUM = 'symposium', 'Simpozium'
        WORKSHOP = 'workshop', 'Seminar-trening'
        SEMINAR = 'seminar', 'Seminar'
        ARTICLE_CALL = 'article_call', 'Ilmiy jurnal (maqola/tezis qabuli)'

    class Status(models.TextChoices):
        PLANNED = 'planned', 'Rejalashtirilgan'
        ONGOING = 'ongoing', 'Jarayonda'
        COMPLETED = 'completed', 'Yakunlangan'

    title = models.CharField(max_length=500)
    type = models.CharField(max_length=20, choices=EventType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    short_description = models.TextField()
    full_description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField()
    venue = models.CharField(max_length=500)
    banner = models.ImageField(upload_to='events/banners/', null=True, blank=True)
    program_pdf = models.FileField(upload_to='events/programs/', null=True, blank=True)
    participant_limit = models.PositiveIntegerField(null=True, blank=True)
    registration_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    translations = models.JSONField(default=dict, blank=True, null=True)

    class Meta:
        db_table = 'events'
        ordering = ['-start_date']
        verbose_name = "Tadbir"
        verbose_name_plural = "Tadbirlar"

    def __str__(self):
        return self.title

    @property
    def applications_count(self):
        return self.applications.count()

    @property
    def is_registration_open(self):
        from django.utils import timezone
        return self.registration_enabled and self.registration_deadline >= timezone.now().date()


class EventGallery(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='events/gallery/')
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_gallery'
        ordering = ['order', 'created_at']
        verbose_name = "Galereya rasmi"
        verbose_name_plural = "Galereya rasmlari"
