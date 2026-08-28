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
        base_url = "https://form.uzbamalaka.uz"
        templates = {
            'submitted': (
                'Arizangiz qabul qilindi — O\'zbekiston Badiiy akademiyasi', 
                f"Hurmatli {application.full_name},\n\nSizning arizangiz tizimga muvaffaqiyatli qabul qilindi.\n\n"
                f"Sizning tekshirish kodingiz (ID): {application.application_id}\n\n"
                f"Arizangiz holatini quyidagi havola orqali istalgan vaqtda kuzatib borishingiz mumkin:\n"
                f"{base_url}/track?id={application.application_id}\n\n"
                f"Hurmat bilan,\nO\'zbekiston Badiiy akademiyasi"
            ),
            'approved': (
                'Tabriklaymiz! Arizangiz tasdiqlandi', 
                f"Hurmatli {application.full_name},\n\nArizangiz ma'muriyat tomonidan tasdiqlandi.\n\n"
                f"Tadbirga kirish uchun sizning shaxsiy QR-Kod ruxsatnomangiz yaratildi.\n"
                f"Iltimos, ushbu havolaga kirib QR-kodni telefoningizga saqlab oling:\n"
                f"{base_url}/track?id={application.application_id}\n\n"
                f"Hurmat bilan,\nO\'zbekiston Badiiy akademiyasi"
            ),
            'rejected': (
                'Ariza holati bo\'yicha ma\'lumot', 
                f"Hurmatli {application.full_name},\n\nAfsuski, sizning arizangiz rad etildi.\n\n"
                f"Batafsil ma'lumot:\n{base_url}/track?id={application.application_id}\n\n"
                f"Hurmat bilan,\nO\'zbekiston Badiiy akademiyasi"
            ),
        }
        if status not in templates:
            return False
            
        subject, body = templates[status]
        return NotificationService.send_email(subject, body, application.email)
