"""
Django migration generator script.
Run this on your cPanel server via:
   python backend/manage.py makemigrations
   python backend/manage.py migrate
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Add backend directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, 'backend'))

django.setup()

from django.core.management import call_command

print("=== Creating migrations ===")
call_command('makemigrations', 'events', 'applications')
print("\n=== Applying migrations ===")
call_command('migrate')
print("\n=== Done! ===")
