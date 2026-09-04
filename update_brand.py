import re
import os

def replace_in_file(filepath, old, new):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_in_file('src/components/layout/AdminSidebar.tsx', 'CENTR FORM', 'CENTRE FORM')
replace_in_file('src/pages/admin/LoginPage.tsx', 'CENTR FORM', 'CENTRE FORM')
replace_in_file('index.html', 'CENTR FORM', 'CENTRE FORM')
print("Replaced CENTR FORM with CENTRE FORM")
