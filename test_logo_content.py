import requests

r1 = requests.get('https://form.uzbamalaka.uz/assets/logo-Ddpv0FA9.png')
print("logo-Ddpv0FA9.png content:")
print(r1.text)

r2 = requests.get('https://form.uzbamalaka.uz/assets/logo_v2-Ddpv0FA9.png')
print("\nlogo_v2-Ddpv0FA9.png content:")
print(r2.text)

