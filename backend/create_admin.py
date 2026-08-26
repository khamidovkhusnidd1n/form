import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')
django.setup()

from apps.accounts.models import AdminUser

try:
    user = AdminUser.objects.create_superuser(username='xusniddin', email='admin@xusniddin.uz', password='xusniddin123', full_name='Xusniddin Xamidov')
    print('Superadmin xusniddin yaratildi!')
except Exception as e:
    print('Xatolik:', e)
    user = AdminUser.objects.get(username='xusniddin')
    user.set_password('xusniddin123')
    user.save()
    print('Superadmin xusniddin paroli tiklandi!')
