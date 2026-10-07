import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to remove the input with value={phone}
# It spans multiple lines
pattern = re.compile(r'<input\s+value=\{phone\}.*?/>', re.DOTALL)
text = pattern.sub('', text)

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed TrackApplicationPage.tsx")
