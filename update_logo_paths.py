import re
import os

files_to_update = {
    'index.html': ('logo_v2.png', 'logo.png'),
    'src/components/layout/Navbar.tsx': ('logo_v2.png', 'logo.png'),
    'src/components/layout/AdminSidebar.tsx': ('logo_v2.png', 'logo.png'),
    'src/pages/admin/LoginPage.tsx': ('logo_v2.png', 'logo.png'),
}

for file_path, (old, new) in files_to_update.items():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")
