import requests
url = 'https://form.uzbamalaka.uz/api/v1/applications/'
try:
    r = requests.get(url, timeout=10)
    print("Applications list status (no token):", r.status_code)
except Exception as e:
    print("Error:", e)
