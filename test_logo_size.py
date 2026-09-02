import requests

r1 = requests.head('https://form.uzbamalaka.uz/assets/logo-Ddpv0FA9.png')
print("logo-Ddpv0FA9.png length:", r1.headers.get('content-length'))

r2 = requests.head('https://form.uzbamalaka.uz/assets/logo_v2-Ddpv0FA9.png')
print("logo_v2-Ddpv0FA9.png length:", r2.headers.get('content-length'))

