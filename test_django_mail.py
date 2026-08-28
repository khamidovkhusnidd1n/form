import os
import django
from django.conf import settings
from django.core.mail import send_mail

# Manually configure settings just like centr_form
settings.configure(
    EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
    EMAIL_HOST='mail.umail.uz',
    EMAIL_PORT=587,
    EMAIL_USE_TLS=True,
    EMAIL_HOST_USER='uzbamalakamarkaz@umail.uz',
    EMAIL_HOST_PASSWORD='F_meB67mGwVU8T',
    DEFAULT_FROM_EMAIL='CENTR FORM <noreply@akademiya.uz>'
)
django.setup()

try:
    print("Sending with spoofed FROM...")
    send_mail(
        'Test Subject',
        'Test Body',
        settings.DEFAULT_FROM_EMAIL,
        ['uzbamalakamarkaz@umail.uz'],
        fail_silently=False
    )
    print("Success!")
except Exception as e:
    print("Spoof Failed:", e)

try:
    print("Sending with real FROM...")
    send_mail(
        'Test Subject',
        'Test Body',
        'uzbamalakamarkaz@umail.uz',
        ['uzbamalakamarkaz@umail.uz'],
        fail_silently=False
    )
    print("Real From Success!")
except Exception as e:
    print("Real From Failed:", e)
