from django.conf import settings
from django.core.mail import send_mail


class NotificationService:
    @staticmethod
    def send_email(subject: str, body: str, recipient: str) -> bool:
        if not settings.EMAIL_HOST_USER:
            return False
        # umail.uz strict sender policy fix: ALWAYS send from EMAIL_HOST_USER
        from_email = settings.EMAIL_HOST_USER
        try:
            send_mail(subject=subject, message=body, from_email=from_email, recipient_list=[recipient], fail_silently=False)
            return True
        except Exception as e:
            import logging
            logging.error(f"Mail failed: {e}")
            return False

    @staticmethod
    def send_status_email(application, status: str) -> bool:
        base_url = "https://form.uzbamalaka.uz"
                templates = {
            'submitted': (
                'Arizangiz qabul qilindi | Ваш запрос принят | Application received', 
                f"Hurmatli {application.full_name},

Sizning arizangiz tizimga muvaffaqiyatli qabul qilindi.

"
                f"Уважаемый(ая) {application.full_name},
Ваша заявка успешно принята в систему.

"
                f"Dear {application.full_name},
Your application has been successfully received.

"
                f"Tekshirish kodingiz (ID) / Ваш ID / Your ID: {application.application_id}

"
                f"Arizangiz holatini quyidagi havola orqali kuzatib borishingiz mumkin / Вы можете отслеживать статус вашей заявки по следующей ссылке / You can track your application status via the following link:
"
                f"{base_url}/track?id={application.application_id}

"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'under_review': (
                'Arizangiz ko'rib chiqilmoqda | Ваша заявка рассматривается | Application under review',
                f"Hurmatli {application.full_name},

Sizning arizangiz ma'muriyat tomonidan ko'rib chiqilmoqda. Tez orada yakuniy qaror qabul qilinadi.

"
                f"Уважаемый(ая) {application.full_name},
Ваша заявка рассматривается администрацией. Окончательное решение будет принято в ближайшее время.

"
                f"Dear {application.full_name},
Your application is being reviewed by the administration. A final decision will be made soon.

"
                f"Holatni kuzatish / Отследить статус / Track status:
"
                f"{base_url}/track?id={application.application_id}

"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'info_required': (
                'Arizangiz bo'yicha qo'shimcha ma'lumot kerak | Требуется дополнительная информация | Additional information required',
                f"Hurmatli {application.full_name},

Sizning arizangiz bo'yicha ma'muriyat qo'shimcha ma'lumot talab qilmoqda.

"
                f"Уважаемый(ая) {application.full_name},
Администрация запрашивает дополнительную информацию по вашей заявке.

"
                f"Dear {application.full_name},
The administration requires additional information regarding your application.

"
                f"Izoh / Комментарий / Comment:
{application.admin_comment}

"
                f"Iltimos, havolaga o'tib ma'lumotni to'ldiring / Пожалуйста, перейдите по ссылке и заполните информацию / Please follow the link to provide the information:
"
                f"{base_url}/track?id={application.application_id}

"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'approved': (
                'Tabriklaymiz! Arizangiz tasdiqlandi | Поздравляем! Ваша заявка одобрена | Congratulations! Application approved', 
                f"Hurmatli {application.full_name},

Arizangiz ma'muriyat tomonidan tasdiqlandi.

"
                f"Уважаемый(ая) {application.full_name},
Ваша заявка одобрена администрацией.

"
                f"Dear {application.full_name},
Your application has been approved by the administration.

"
                f"Tadbirga kirish uchun sizning shaxsiy QR-Kod ruxsatnomangiz yaratildi.
"
                f"Iltimos, ushbu havolaga kirib QR-kodni saqlab oling:

"
                f"Был сгенерирован ваш личный QR-код для входа на мероприятие.
"
                f"Пожалуйста, перейдите по этой ссылке, чтобы сохранить QR-код:

"
                f"Your personal QR Code pass has been generated for event entry.
"
                f"Please visit this link to save your QR code:

"
                f"{base_url}/track?id={application.application_id}

"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'rejected': (
                'Ariza holati bo'yicha ma'lumot | Информация о статусе заявки | Application status information', 
                f"Hurmatli {application.full_name},

Afsuski, sizning arizangiz rad etildi.

"
                f"Уважаемый(ая) {application.full_name},
К сожалению, ваша заявка была отклонена.

"
                f"Dear {application.full_name},
Unfortunately, your application has been rejected.

"
                f"Izoh / Комментарий / Comment:
{application.admin_comment}

"
                f"Batafsil ma'lumot / Подробнее / More info:
{base_url}/track?id={application.application_id}

"
                f"O'zbekiston Badiiy akademiyasi"
            ),
        }
        if status not in templates:
            return False
            
        subject, body = templates[status]
        return NotificationService.send_email(subject, body, application.email)
