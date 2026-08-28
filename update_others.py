import re

with open('src/components/layout/Footer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import { useTranslation } from '../../i18n';\nimport logoImage from '../../assets/logo_v2.png';"
content = content.replace("import { useTranslation } from '../../i18n';", import_statement)
content = content.replace('src="/logo_v2.png"', 'src={logoImage}')

with open('src/components/layout/Footer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/admin/LoginPage.tsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

import_statement2 = "import { useTranslation } from '../../i18n';\nimport logoImage from '../../assets/logo_v2.png';"
content2 = content2.replace("import { useTranslation } from '../../i18n';", import_statement2)
content2 = content2.replace('src="/logo_v2.png"', 'src={logoImage}')

with open('src/pages/admin/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content2)

print("done")
