import os
import requests

base_url = os.environ.get('API_BASE_URL', 'https://form.uzbamalaka.uz/api/v1')
username = os.environ.get('API_USERNAME', 'admin')
password = os.environ.get('API_PASSWORD', '')

if not password:
    print("API_PASSWORD muhit o'zgaruvchisi o'rnatilmagan.")
    exit(1)

resp = requests.post(f"{base_url}/auth/login/", data={
    "username": username,
    "password": password
})
print("Login status:", resp.status_code)
print("Login response:", resp.text[:500])

