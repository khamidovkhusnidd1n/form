import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'centr_form.settings')
django.setup()

from apps.events.serializers import EventCreateUpdateSerializer

data = {
    'title': 'Test',
    'type': 'conference',
    'format': 'offline',
    'status': 'planned',
    'short_description': 'Test',
    'full_description': 'Test',
    'start_date': '2026-11-12',
    'end_date': '2026-11-12',
    'registration_deadline': '2026-10-05',
    'venue': 'Test Venue',
    'registration_enabled': True,
}

serializer = EventCreateUpdateSerializer(data=data)
if serializer.is_valid():
    try:
        serializer.save()
        print("Success!")
    except Exception as e:
        print("Save Error:", e)
else:
    print("Validation Error:", serializer.errors)
