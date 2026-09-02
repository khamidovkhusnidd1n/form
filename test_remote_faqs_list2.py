import requests

base_url = 'https://form.uzbamalaka.uz/api/v1'
resp = requests.post(f"{base_url}/auth/login/", data={"username": "admin", "password": "Markaz2026!"})
token = resp.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

resp2 = requests.get(f"{base_url}/faqs/", headers=headers)
data = resp2.json()
print("Type:", type(data))
if isinstance(data, dict):
    print("Keys:", data.keys())
    if 'results' in data:
        print("Results length:", len(data['results']))
        for item in data['results']:
            print(f"ID: {item.get('id')} - {item.get('question')}")
elif isinstance(data, list):
    for item in data:
        print(f"ID: {item.get('id')} - {item.get('question')}")
