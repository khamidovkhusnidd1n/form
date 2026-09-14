import requests
import json

url = 'https://form.uzbamalaka.uz/api/v1/applications/submit/'
data = {
    'event': 7,
    'attendance_type': 'offline',
    'full_name': 'Test User.Name',
    'date_of_birth': '1990-01-01',
    'gender': 'male',
    'phone': '+998901234567',
    'email': 'test@test.com',
    'organization': 'Test Org',
    'position': 'Tester',
    'country': 'Uzbekistan',
    'region': 'Tashkent',
    'district': 'Mirzo Ulugbek'
}
files = {
    'document': ('test.pdf', b'%PDF-1.4 mock file', 'application/pdf'),
    'passport': ('passport.jpg', b'mock image', 'image/jpeg')
}

print("Submitting test application...")
r = requests.post(url, data=data, files=files, timeout=10)
print(r.status_code)
print(r.text)
