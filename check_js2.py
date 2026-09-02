import requests
import re

js_url = 'https://form.uzbamalaka.uz/assets/index-CXl_gZg7.js'
js = requests.get(js_url).text

# Find where it catches the error and formats it
import textwrap
idx = js.find('Tadbirni yangilashda xatolik yuz berdi')
if idx != -1:
    print(js[max(0, idx-100):idx+500])
else:
    print("Not found")
