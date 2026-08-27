import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("value={https://form.uzbamalaka.uz/admin/check-in/}", "value={https://form.uzbamalaka.uz/admin/check-in/}")
# Wait, it actually output alue={https://form.uzbamalaka.uz/admin/check-in/} in the log?
# Let's see what the file actually has
