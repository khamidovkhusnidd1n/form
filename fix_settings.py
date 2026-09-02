import re

with open('backend/centr_form/settings.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_email_settings = '''EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='CENTR FORM <noreply@akademiya.uz>')'''

new_email_settings = '''EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='mail.umail.uz')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='uzbamalakamarkaz@umail.uz')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='F_meB67mGwVU8T')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='uzbamalakamarkaz@umail.uz')'''

content = content.replace(old_email_settings, new_email_settings)

with open('backend/centr_form/settings.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
