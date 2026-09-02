import requests
import json
import io

base_url = 'https://form.uzbamalaka.uz/api/v1'

resp = requests.post(f"{base_url}/auth/login/", data={
    "username": "admin",
    "password": "Markaz2026!"
})
token = resp.json().get('access')

headers = {
    "Authorization": f"Bearer {token}"
}
data = {
    'title': 'Test Event Image',
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
files = {
    'banner': ('test.png', b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB\x82', 'image/png')
}
resp2 = requests.post(f"{base_url}/events/admin/", data=data, files=files, headers=headers)
print("Status:", resp2.status_code)
print("Response:", resp2.text[:500])
