import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'

resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": "Markaz2026!"})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

resp2 = requests.patch(f"{base_url}/events/admin/7/", data={'translations': '{"invalid json'}, headers=headers)
print("Status:", resp2.status_code)
print("Response:", resp2.text[:500])
