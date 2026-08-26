import os
import django
import sys

# Append the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')
django.setup()

from apps.accounts.models import AdminUser

try:
    user = AdminUser.objects.get(username='xamidov')
    user.set_password('xamidov12345')
    user.save()
    print('Password successfully reset to xamidov12345')
except AdminUser.DoesNotExist:
    print('User xamidov does not exist.')
