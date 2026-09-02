import os
import django
from django.conf import settings

settings.configure(
    EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
    EMAIL_HOST='mail.umail.uz',
    EMAIL_PORT=587,
    EMAIL_USE_TLS=True,
    EMAIL_HOST_USER='uzbamalakamarkaz@umail.uz',
    EMAIL_HOST_PASSWORD='F_meB67mGwVU8T',
    DEFAULT_FROM_EMAIL='uzbamalakamarkaz@umail.uz',
    INSTALLED_APPS=[
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'apps.applications',
        'apps.events',
        'apps.accounts'
    ],
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': 'db.sqlite3'}}
)
django.setup()

from apps.applications.models import Application
from apps.notifications.services import NotificationService

# Try to find the app
app = Application.objects.first()
if app:
    app.email = 'khamidovkhusniddin00@gmail.com'
    print("Testing NotificationService.send_status_email...")
    result = NotificationService.send_status_email(app, 'approved')
    print("Result:", result)
else:
    print("No apps found in local DB.")
