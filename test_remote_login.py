import requests
import json

base_url = 'https://form.uzbamalaka.uz/api/v1'

resp = requests.post(f"{base_url}/auth/token/", data={
    "username": "admin",
    "password": "Markaz2026!"
})
print("Login status:", resp.status_code)
print("Login response:", resp.text[:500])
