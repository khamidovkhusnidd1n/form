import os
﻿import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'
resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": os.environ.get('API_PASSWORD', '')})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

requests.delete(f"{base_url}/events/admin/8/", headers=headers)
requests.delete(f"{base_url}/events/admin/9/", headers=headers)
print("Deleted test events")
