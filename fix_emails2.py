import re

with open('backend/apps/notifications/services.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's just recreate the entire send_status_email function to avoid regex mess
new_func = '''    @staticmethod
    def send_status_email(application, status: str) -> bool:
        base_url = "https://form.uzbamalaka.uz"
        templates = {
            'submitted': (
                'Arizangiz qabul qilindi | Ваш запрос принят | Application received', 
                f"Hurmatli {application.full_name},\\n\\nSizning arizangiz tizimga muvaffaqiyatli qabul qilindi.\\n\\n"
                f"Уважаемый(ая) {application.full_name},\\nВаша заявка успешно принята в систему.\\n\\n"
                f"Dear {application.full_name},\\nYour application has been successfully received.\\n\\n"
                f"Tekshirish kodingiz (ID) / Ваш ID / Your ID: {application.application_id}\\n\\n"
                f"Arizangiz holatini quyidagi havola orqali kuzatib borishingiz mumkin / Вы можете отслеживать статус вашей заявки по следующей ссылке / You can track your application status via the following link:\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'under_review': (
                'Arizangiz ko\'rib chiqilmoqda | Ваша заявка рассматривается | Application under review',
                f"Hurmatli {application.full_name},\\n\\nSizning arizangiz ma'muriyat tomonidan ko'rib chiqilmoqda. Tez orada yakuniy qaror qabul qilinadi.\\n\\n"
                f"Уважаемый(ая) {application.full_name},\\nВаша заявка рассматривается администрацией. Окончательное решение будет принято в ближайшее время.\\n\\n"
                f"Dear {application.full_name},\\nYour application is being reviewed by the administration. A final decision will be made soon.\\n\\n"
                f"Holatni kuzatish / Отследить статус / Track status:\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'info_required': (
                'Arizangiz bo\'yicha qo\'shimcha ma\'lumot kerak | Требуется дополнительная информация | Additional information required',
                f"Hurmatli {application.full_name},\\n\\nSizning arizangiz bo'yicha ma'muriyat qo'shimcha ma'lumot talab qilmoqda.\\n\\n"
                f"Уважаемый(ая) {application.full_name},\\nАдминистрация запрашивает дополнительную информацию по вашей заявке.\\n\\n"
                f"Dear {application.full_name},\\nThe administration requires additional information regarding your application.\\n\\n"
                f"Izoh / Комментарий / Comment:\\n{application.admin_comment}\\n\\n"
                f"Iltimos, havolaga o'tib ma'lumotni to'ldiring / Пожалуйста, перейдите по ссылке и заполните информацию / Please follow the link to provide the information:\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'approved': (
                'Tabriklaymiz! Arizangiz tasdiqlandi | Поздравляем! Ваша заявка одобрена | Congratulations! Application approved', 
                f"Hurmatli {application.full_name},\\n\\nArizangiz ma'muriyat tomonidan tasdiqlandi.\\n\\n"
                f"Уважаемый(ая) {application.full_name},\\nВаша заявка одобрена администрацией.\\n\\n"
                f"Dear {application.full_name},\\nYour application has been approved by the administration.\\n\\n"
                f"Tadbirga kirish uchun sizning shaxsiy QR-Kod ruxsatnomangiz yaratildi.\\n"
                f"Iltimos, ushbu havolaga kirib QR-kodni saqlab oling:\\n\\n"
                f"Был сгенерирован ваш личный QR-код для входа на мероприятие.\\n"
                f"Пожалуйста, перейдите по этой ссылке, чтобы сохранить QR-код:\\n\\n"
                f"Your personal QR Code pass has been generated for event entry.\\n"
                f"Please visit this link to save your QR code:\\n\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"O'zbekiston Badiiy akademiyasi"
            ),
            'rejected': (
                'Ariza holati bo\'yicha ma\'lumot | Информация о статусе заявки | Application status information', 
                f"Hurmatli {application.full_name},\\n\\nAfsuski, sizning arizangiz rad etildi.\\n\\n"
                f"Уважаемый(ая) {application.full_name},\\nК сожалению, ваша заявка была отклонена.\\n\\n"
                f"Dear {application.full_name},\\nUnfortunately, your application has been rejected.\\n\\n"
                f"Izoh / Комментарий / Comment:\\n{application.admin_comment}\\n\\n"
                f"Batafsil ma'lumot / Подробнее / More info:\\n{base_url}/track?id={application.application_id}\\n\\n"
                f"O'zbekiston Badiiy akademiyasi"
            ),
        }
        if status not in templates:
            return False
            
        subject, body = templates[status]
        return NotificationService.send_email(subject, body, application.email)
'''

idx = content.find('    @staticmethod\\n    def send_status_email')
if idx != -1:
    content = content[:idx] + new_func
else:
    # Just to be safe, replace everything after the first method
    idx = content.find('    @staticmethod', 100)
    content = content[:idx] + new_func

with open('backend/apps/notifications/services.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
