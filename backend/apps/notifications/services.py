from django.conf import settings
from django.core.mail import send_mail


class NotificationService:
    @staticmethod
    def send_email(subject: str, body: str, recipient: str) -> bool:
        if not settings.EMAIL_HOST_USER:
            return False
        send_mail(subject=subject, message=body, from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[recipient], fail_silently=True)
        return True

    @staticmethod
    def send_status_email(application, status: str) -> bool:
        templates = {
            'submitted': ('Arizangiz qabul qilindi — CENTR FORM', f"Hurmatli {application.full_name},\n\nArizangiz muvaffaqiyatli qabul qilindi.\nAriza ID: {application.application_id}\n"),
            'approved': ('Arizangiz tasdiqlandi — CENTR FORM', f"Hurmatli {application.full_name},\n\nArizangiz tasdiqlandi.\n"),
            'rejected': ('Arizangiz rad etildi — CENTR FORM', f"Hurmatli {application.full_name},\n\nArizangiz rad etildi.\n"),
            'invitation_ready': ('Taklifnoma tayyor — CENTR FORM', f"Hurmatli {application.full_name},\n\nTaklifnomangiz tayyor.\n"),
            'certificate_ready': ('Sertifikat tayyor — CENTR FORM', f"Hurmatli {application.full_name},\n\nSertifikatingiz tayyor.\n"),
        }
        subject, body = templates.get(status, ('CENTR FORM', ''))
        return NotificationService.send_email(subject, body, application.email)
