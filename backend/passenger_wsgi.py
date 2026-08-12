import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
