import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the query input to add onKeyDown
old_query_input = """<input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ariza ID (CF-2026-...)"
                className="flex-1 bg-white rounded-xl border-0 px-5 py-3.5 text-slate-800 font-mono text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />"""

new_query_input = """<input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Ariza ID (CF-2026-...)"
                className="flex-1 bg-white rounded-xl border-0 px-5 py-3.5 text-slate-800 font-mono text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />"""

text = text.replace(old_query_input, new_query_input)

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added onKeyDown")
