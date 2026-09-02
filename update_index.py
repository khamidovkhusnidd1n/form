import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add favicon
if '<link rel="icon"' not in content:
    content = content.replace('<title>CENTR FORM</title>', '<link rel="icon" type="image/png" href="/logo_v2.png" />\n    <title>CENTR FORM</title>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html")
