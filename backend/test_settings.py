import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')
django.setup()
from django.conf import settings
print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
print("CORS_ALLOW_ALL_ORIGINS:", settings.CORS_ALLOW_ALL_ORIGINS)
