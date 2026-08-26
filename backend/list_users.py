import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')
django.setup()

from apps.accounts.models import AdminUser

users = AdminUser.objects.all()
for u in users:
    print(u.username, u.email)
