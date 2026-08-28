import re

with open('src/components/layout/Navbar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_statement = "import { useTranslation } from '../../i18n';\nimport logoImage from '../../assets/logo_v2.png';"
content = content.replace("import { useTranslation } from '../../i18n';", import_statement)

# Replace src="/logo_v2.png" with src={logoImage}
content = content.replace('src="/logo_v2.png"', 'src={logoImage}')

# Wait, make the image a bit smaller on desktop just in case?
# "className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0""
# Let's just leave it as is, the text shortening is what really helps.

with open('src/components/layout/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
