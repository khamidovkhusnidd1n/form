import re

with open('src/components/layout/AdminSidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-\[#1a56db\] to-\[#0ea5e9\] flex items-center justify-center">\s*<GraduationCap className="w-5 h-5 text-white" />\s*</div>',
    '<div className="w-10 h-10 flex items-center justify-center shrink-0">\n            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />\n          </div>',
    content
)

with open('src/components/layout/AdminSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
