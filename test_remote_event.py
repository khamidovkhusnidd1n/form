import requests
import json

base_url = 'https://form.uzbamalaka.uz/api/v1'

resp = requests.post(f"{base_url}/auth/login/", data={
    "username": "admin",
    "password": "Markaz2026!"
})
token = resp.json().get('access')
if not token:
    print("Login failed:", resp.text)
    exit(1)

headers = {
    "Authorization": f"Bearer {token}"
}
data = {
    'title': 'Test Event',
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
resp2 = requests.post(f"{base_url}/events/admin/", data=data, headers=headers)
print("Status:", resp2.status_code)
print("Response:", resp2.text[:500])
