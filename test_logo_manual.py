import requests

r3 = requests.get('https://form.uzbamalaka.uz/assets/logo.png')
print("/assets/logo.png length:", r3.headers.get('content-length'))
print("/assets/logo.png text:", r3.text[:200])
