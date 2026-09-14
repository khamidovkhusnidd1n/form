import requests
import os

url = 'https://form.uzbamalaka.uz/api/v1/applications/submit/'
data = {
    'event': 7,
    'attendance_type': 'offline',
    'full_name': 'Large File Tester',
    'date_of_birth': '1990-01-01',
    'gender': 'male',
    'phone': '+998901234567',
    'email': 'testlarge@test.com',
    'organization': 'Test Org',
    'position': 'Tester',
    'country': 'Uzbekistan',
    'region': 'Tashkent',
    'district': 'Mirzo Ulugbek'
}

# Create a 3MB dummy PDF
dummy_content = b'%PDF-1.4\n' + b'A' * 3 * 1024 * 1024
with open('large.pdf', 'wb') as f:
    f.write(dummy_content)

files = {
    'document': ('large.pdf', dummy_content, 'application/pdf'),
    'passport': ('passport.jpg', b'mock image', 'image/jpeg')
}

print("Submitting large file application...")
r = requests.post(url, data=data, files=files, timeout=30)
print(r.status_code)
print(r.text)
