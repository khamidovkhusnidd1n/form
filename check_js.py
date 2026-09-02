import requests
import re

base_url = 'https://form.uzbamalaka.uz'
resp = requests.get(f"{base_url}/admin/events")
html = resp.text
js_url = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
if js_url:
    js_url = base_url + js_url.group(1)
    print("JS URL:", js_url)
    js_resp = requests.get(js_url)
    js = js_resp.text
    # Find toast.error calls related to events
    matches = re.findall(r'toast\.error\([^)]+\)', js)
    for m in set(matches):
        print(m[:100])
else:
    print("JS not found")
