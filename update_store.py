import re

with open('src/store/dataStore.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "formData.append('presentation_title', app.presentationTitle);",
    "formData.append('presentation_title', app.presentationTitle && app.presentationTitle !== 'undefined' ? app.presentationTitle : '');"
)
content = content.replace(
    "formData.append('abstract', app.abstract);",
    "formData.append('abstract', app.abstract && app.abstract !== 'undefined' ? app.abstract : '');"
)

# Fix existing parsed undefineds in mapping
content = content.replace(
    "presentationTitle: item.presentation_title ?? item.presentationTitle ?? '',",
    "presentationTitle: (item.presentation_title === 'undefined' ? '' : item.presentation_title) ?? (item.presentationTitle === 'undefined' ? '' : item.presentationTitle) ?? '',"
)
content = content.replace(
    "abstract: item.abstract || '',",
    "abstract: (item.abstract === 'undefined' ? '' : item.abstract) || '',"
)

with open('src/store/dataStore.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
