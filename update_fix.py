import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'Y\\'oq'", '"Yo\'q"')
content = content.replace("'Y'oq'", '"Yo\'q"')

with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'Y\\'oq'", '"Yo\'q"')
content = content.replace("'Y'oq'", '"Yo\'q"')

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
