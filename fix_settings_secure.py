import re

with open('backend/centr_form/settings.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix decouple initialization
old_decouple = '''from pathlib import Path
from decouple import config
from datetime import timedelta
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent'''

new_decouple = '''from pathlib import Path
from decouple import Config, RepositoryEnv, config as default_config
from datetime import timedelta
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent

# Force load .env from BASE_DIR (Fixes cPanel Passenger path issues)
env_path = BASE_DIR / '.env'
if env_path.exists():
    config = Config(RepositoryEnv(str(env_path)))
else:
    config = default_config'''

content = content.replace(old_decouple, new_decouple)

# Revert email settings
old_email = '''EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='mail.umail.uz')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='uzbamalakamarkaz@umail.uz')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='F_meB67mGwVU8T')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='uzbamalakamarkaz@umail.uz')'''

new_email = '''EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='mail.umail.uz')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='uzbamalakamarkaz@umail.uz')'''

content = content.replace(old_email, new_email)

with open('backend/centr_form/settings.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
