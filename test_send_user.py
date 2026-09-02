import os
import django
from django.conf import settings
from django.core.mail import send_mail

settings.configure(
    EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
    EMAIL_HOST='mail.umail.uz',
    EMAIL_PORT=587,
    EMAIL_USE_TLS=True,
    EMAIL_HOST_USER='uzbamalakamarkaz@umail.uz',
    EMAIL_HOST_PASSWORD='F_meB67mGwVU8T',
    DEFAULT_FROM_EMAIL='uzbamalakamarkaz@umail.uz'
)
django.setup()

try:
    print("Sending test mail to khamidovkhusniddin00@gmail.com...")
    send_mail(
        "TEST XATI - UZBA MARKAZ",
        "Bu xat tizimni tekshirish uchun jo'natildi. Tizim 100% ishlayapti!",
        "uzbamalakamarkaz@umail.uz",
        ["khamidovkhusniddin00@gmail.com"],
        fail_silently=False
    )
    print("Success!")
except Exception as e:
    print("Failed:", e)
