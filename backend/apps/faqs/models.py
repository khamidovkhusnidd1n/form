from django.db import models


class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    translations = models.JSONField(default=dict, blank=True, null=True)

    class Meta:
        db_table = 'faqs'
        ordering = ['order', 'created_at']
        verbose_name = "Savol"
        verbose_name_plural = "Ko'p so'raladigan savollar"

    def __str__(self):
        return self.question[:80]
