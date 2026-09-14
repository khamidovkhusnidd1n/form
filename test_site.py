import requests

# Test main page
r = requests.get('https://form.uzbamalaka.uz/', timeout=10)
print("Main page:", r.status_code)

# Test API
r2 = requests.get('https://form.uzbamalaka.uz/api/v1/events/', timeout=10)
print("Events API:", r2.status_code, r2.text[:300])

# Test application submit endpoint
r3 = requests.options('https://form.uzbamalaka.uz/api/v1/applications/submit/', timeout=10)
print("Submit OPTIONS:", r3.status_code)
print("CORS headers:", {k:v for k,v in r3.headers.items() if 'cors' in k.lower() or 'access' in k.lower()})
