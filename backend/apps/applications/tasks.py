# Celery tasks for async email/SMS notifications
# Requires: celery, redis configured in settings

try:
    from celery import shared_task
    HAS_CELERY = True
except ImportError:
    HAS_CELERY = False

from django.core.mail import send_mail
from django.conf import settings


STATUS_EMAIL_TEMPLATES = {
    'submitted': {
        'subject': "Arizangiz qabul qilindi — CENTR FORM",
        'body': "Hurmatli {full_name},\n\nArizangiz muvaffaqiyatli qabul qilindi.\nAriza ID: {application_id}\n\nHolatni kuzatish: {frontend_url}/track?id={application_id}\n\nHurmat bilan,\nO‘zBA huzuridagi Markaz",
    },
    'under_review': {
        'subject': "Arizangiz ko'rib chiqilmoqda — CENTR FORM",
        'body': "Hurmatli {full_name},\n\nArizangiz ({application_id}) hozir ko'rib chiqilmoqda.\n\nHurmat bilan,\nO‘zBA huzuridagi Markaz",
    },
    'approved': {
        'subject': "Arizangiz tasdiqlandi — CENTR FORM",
        'body': "Hurmatli {full_name},\n\nTabriklaymiz! Arizangiz ({application_id}) tasdiqlandi.\n\nHurmat bilan,\nO‘zBA huzuridagi Markaz",
    },
    'rejected': {
        'subject': "Ariza natijasi — CENTR FORM",
        'body': "Hurmatli {full_name},\n\nAfsuski, arizangiz ({application_id}) rad etildi.\n\nHurmat bilan,\nO‘zBA huzuridagi Markaz",
    },
    'info_required': {
        'subject': "Qo'shimcha ma'lumot kerak — CENTR FORM",
        'body': "Hurmatli {full_name},\n\nArizangiz ({application_id}) bo'yicha qo'shimcha ma'lumot talab qilinadi.\n\nHurmat bilan,\nO‘zBA huzuridagi Markaz",
    },
}


def _send_notification(application_id: int, status: str):
    from .models import Application
    try:
        app = Application.objects.select_related('event').get(id=application_id)
        template = STATUS_EMAIL_TEMPLATES.get(status)
        if not template:
            return
        body = template['body'].format(
            full_name=app.full_name,
            application_id=app.application_id,
            frontend_url=settings.FRONTEND_URL,
        )
        send_mail(
            subject=template['subject'],
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.email],
            fail_silently=True,
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error("Failed to send notification: %s", e)


if HAS_CELERY:
    @shared_task
    def send_status_notification(application_id: int, status: str):
        _send_notification(application_id, status)
else:
    def send_status_notification(application_id: int, status: str):
        _send_notification(application_id, status)
