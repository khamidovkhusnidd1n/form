import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("value={https://form.uzbamalaka.uz/admin/check-in/}", "value={`https://form.uzbamalaka.uz/admin/check-in/${result.id}`}")

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/admin/CheckInPage.tsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace("api.post(/applications/admin//check-in/)", "api.post(`/applications/admin/${id}/check-in/`)")

with open('src/pages/admin/CheckInPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content2)

print("done")
