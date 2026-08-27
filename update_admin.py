import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For the export function:
content = content.replace(
    "[t('apply.presentationTitle')]: app.presentationTitle,",
    "[t('apply.presentationTitle')]: app.presentationTitle || 'Y\'oq',"
)

# For the details view:
content = content.replace(
    "[t('apply.presentationTitle'), selected.presentationTitle],",
    "[t('apply.presentationTitle'), selected.presentationTitle || 'Y\\'oq'],"
)

# For abstract:
old_abstract = '''              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">{t('apply.abstract')}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selected.abstract}</p>
              </div>'''

new_abstract = '''              {selected.abstract && selected.abstract !== 'undefined' && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">{t('apply.abstract')}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selected.abstract}</p>
                </div>
              )}'''

content = content.replace(old_abstract, new_abstract)

with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
