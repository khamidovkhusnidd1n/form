import re

with open('src/components/layout/AdminSidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace GraduationCap import and usage
if "import logoImage from '../../assets/logo_v2.png';" not in content:
    content = content.replace("import { useTranslation } from '../../i18n';", "import { useTranslation } from '../../i18n';\nimport logoImage from '../../assets/logo_v2.png';")

# Find the GraduationCap div and replace it
old_div = '''            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>'''
new_div = '''            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
            </div>'''
content = content.replace(old_div, new_div)

with open('src/components/layout/AdminSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminSidebar.tsx")
