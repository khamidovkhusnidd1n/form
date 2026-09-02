import requests

r3 = requests.get('https://form.uzbamalaka.uz/logo.png')
print("/logo.png length:", r3.headers.get('content-length'))
print("/logo.png text:", r3.text[:200])
