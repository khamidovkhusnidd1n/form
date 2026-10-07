import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove phone state
text = re.sub(r"const \[phone, setPhone\] = useState\(searchParams\.get\('phone'\) \|\| ''\);\n", "", text)

# 2. Modify handleSearch
text = text.replace("""const handleSearch = async (id: string) => {
    if (!id.trim() || !phone.trim()) return;
    setLoading(true);
    setSearchParams({ id });
    try {
      // Import apiClient at top if not there
      const res = await window.__apiClient.get(`/applications/track/${id.trim()}/?phone=${encodeURIComponent(phone.trim())}`);""",
"""const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchParams({ id });
    try {
      const res = await window.__apiClient.get(`/applications/track/${id.trim()}/`);""")

# 3. Remove phone input
text = re.sub(r"<\s*input\s*value=\{phone\}[^>]*placeholder=\"Telefon raqam\"[^>]*/>", "", text)

# 4. Modify Button
text = text.replace("disabled={!query.trim() || !phone.trim() || loading}", "disabled={!query.trim() || loading}")

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("frontend patched")
