import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'
resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": "Markaz2026!"})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

resp2 = requests.get(f"{base_url}/faqs/", headers=headers)
print("FAQs status:", resp2.status_code)
print("FAQs count:", len(resp2.json()))
