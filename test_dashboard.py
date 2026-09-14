import os
﻿import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'
resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": os.environ.get('API_PASSWORD', '')})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

r = requests.get(f"{base_url}/dashboard/", headers=headers)
print(r.json())
