import re

with open('src/pages/cabinet/UserCabinet.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports
if 'APPLICATION_STATUS_COLORS' not in text:
    text = text.replace("import Textarea from '../../components/ui/Textarea';", 
                        "import Textarea from '../../components/ui/Textarea';\nimport { getApplicationStatusLabel, APPLICATION_STATUS_COLORS } from '../../lib/utils';")

# Replace date formatting
old_date = "<span className=\"text-sm text-slate-500\">{new Date(app.submitted_at).toLocaleDateString('uz-UZ')}</span>"
new_date = """<span className="text-sm text-slate-500">{new Date(app.submitted_at).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</span>"""
text = text.replace(old_date, new_date)

# Replace status badge
old_badge = """<span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {app.status === 'approved' ? 'Tasdiqlangan' : app.status === 'rejected' ? 'Bekor qilingan' : 'Kutilmoqda'}
                  </span>"""

new_badge = """<span className={`px-3 py-1 rounded-full text-sm font-medium ${APPLICATION_STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-700'}`}>
                    {getApplicationStatusLabel(app.status, language)}
                  </span>"""
text = text.replace(old_badge, new_badge)

with open('src/pages/cabinet/UserCabinet.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch applied to UserCabinet.tsx")
