import os
import requests

base_url = os.environ.get('API_BASE_URL', 'https://form.uzbamalaka.uz/api/v1')
password = os.environ.get('API_PASSWORD', '')
if not password:
    print("API_PASSWORD muhit o'zgaruvchisi o'rnatilmagan.")
    exit(1)

resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": password})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

# Create a 2MB dummy file
large_file = b'0' * (2 * 1024 * 1024)

files = {
    'banner': ('large.png', large_file, 'image/png')
}
resp2 = requests.patch(f"{base_url}/events/admin/7/", files=files, headers=headers)
print("Status:", resp2.status_code)
print("Response:", resp2.text[:500])
