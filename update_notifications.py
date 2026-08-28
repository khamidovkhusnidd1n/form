import re

with open('backend/apps/notifications/services.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_templates = '''    @staticmethod
    def send_status_email(application, status: str) -> bool:
        templates = {
            'submitted': ('Arizangiz qabul qilindi — CENTR FORM', f"Hurmatli {application.full_name},\\n\\nArizangiz muvaffaqiyatli qabul qilindi.\\nAriza ID: {application.application_id}\\n"),
            'approved': ('Arizangiz tasdiqlandi — CENTR FORM', f"Hurmatli {application.full_name},\\n\\nArizangiz tasdiqlandi.\\n"),
            'rejected': ('Arizangiz rad etildi — CENTR FORM', f"Hurmatli {application.full_name},\\n\\nArizangiz rad etildi.\\n"),
            'invitation_ready': ('Taklifnoma tayyor — CENTR FORM', f"Hurmatli {application.full_name},\\n\\nTaklifnomangiz tayyor.\\n"),
            'certificate_ready': ('Sertifikat tayyor — CENTR FORM', f"Hurmatli {application.full_name},\\n\\nSertifikatingiz tayyor.\\n"),
        }
        subject, body = templates.get(status, ('CENTR FORM', ''))
        return NotificationService.send_email(subject, body, application.email)'''

new_templates = '''    @staticmethod
    def send_status_email(application, status: str) -> bool:
        base_url = "https://form.uzbamalaka.uz"
        templates = {
            'submitted': (
                'Arizangiz qabul qilindi — O\\'zbekiston Badiiy akademiyasi', 
                f"Hurmatli {application.full_name},\\n\\nSizning arizangiz tizimga muvaffaqiyatli qabul qilindi.\\n\\n"
                f"Sizning tekshirish kodingiz (ID): {application.application_id}\\n\\n"
                f"Arizangiz holatini quyidagi havola orqali istalgan vaqtda kuzatib borishingiz mumkin:\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"Hurmat bilan,\\nO\\'zbekiston Badiiy akademiyasi"
            ),
            'approved': (
                'Tabriklaymiz! Arizangiz tasdiqlandi', 
                f"Hurmatli {application.full_name},\\n\\nArizangiz ma'muriyat tomonidan tasdiqlandi.\\n\\n"
                f"Tadbirga kirish uchun sizning shaxsiy QR-Kod ruxsatnomangiz yaratildi.\\n"
                f"Iltimos, ushbu havolaga kirib QR-kodni telefoningizga saqlab oling:\\n"
                f"{base_url}/track?id={application.application_id}\\n\\n"
                f"Hurmat bilan,\\nO\\'zbekiston Badiiy akademiyasi"
            ),
            'rejected': (
                'Ariza holati bo\\'yicha ma\\'lumot', 
                f"Hurmatli {application.full_name},\\n\\nAfsuski, sizning arizangiz rad etildi.\\n\\n"
                f"Batafsil ma'lumot:\\n{base_url}/track?id={application.application_id}\\n\\n"
                f"Hurmat bilan,\\nO\\'zbekiston Badiiy akademiyasi"
            ),
        }
        if status not in templates:
            return False
            
        subject, body = templates[status]
        return NotificationService.send_email(subject, body, application.email)'''

content = content.replace(old_templates, new_templates)

with open('backend/apps/notifications/services.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
