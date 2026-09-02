import requests

url = 'https://form.uzbamalaka.uz/assets/logo-Ddpv0FA9.png'
r = requests.get(url)
print("logo-Ddpv0FA9.png:", r.status_code)

url2 = 'https://form.uzbamalaka.uz/assets/logo.png'
r2 = requests.get(url2)
print("logo.png:", r2.status_code)

url3 = 'https://form.uzbamalaka.uz/logo.png'
r3 = requests.get(url3)
print("/logo.png:", r3.status_code)

