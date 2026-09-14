import requests

url = 'https://form.uzbamalaka.uz/api/v1/applications/submit/'
headers = {
    'Origin': 'https://form.uzbamalaka.uz',
    'Access-Control-Request-Method': 'POST',
}
print("Sending OPTIONS request...")
r = requests.options(url, headers=headers, timeout=10)
print(r.status_code)
for k, v in r.headers.items():
    if 'access-control' in k.lower():
        print(f"{k}: {v}")
