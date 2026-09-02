import requests

r3 = requests.get('https://form.uzbamalaka.uz/assets/logo-Ddpv0FA9.png')
print("/assets/logo-Ddpv0FA9.png length:", len(r3.content))

r4 = requests.get('https://form.uzbamalaka.uz/logo.png')
print("/logo.png length:", len(r4.content))
