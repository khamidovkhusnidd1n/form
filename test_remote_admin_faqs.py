import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'
resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": "Markaz2026!"})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

resp2 = requests.get(f"{base_url}/faqs/admin/", headers=headers)
print("Admin FAQs status:", resp2.status_code)
if resp2.status_code == 200:
    print("Admin FAQs count:", len(resp2.json()))
else:
    print("Error:", resp2.text[:200])
