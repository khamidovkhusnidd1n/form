import requests
import sys
sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://form.uzbamalaka.uz/api/v1'

resp = requests.get(f"{base_url}/events/")
print(resp.json())
