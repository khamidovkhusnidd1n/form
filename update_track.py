import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "[t('apply.presentationTitle'), result.presentationTitle],",
    "[t('apply.presentationTitle'), result.presentationTitle || 'Y\\'oq'],"
)

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
