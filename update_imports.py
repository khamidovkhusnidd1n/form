import re

files_to_update = [
    'src/components/layout/Navbar.tsx',
    'src/components/layout/AdminSidebar.tsx',
    'src/pages/admin/LoginPage.tsx'
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the import
    content = content.replace("import logoImage from '../../assets/logo.png';", "import { logoBase64 as logoImage } from '../../assets/logo';")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")
