import re

with open('src/pages/admin/AdministratorsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useAuth import
if "import { useAuth }" not in content:
    content = content.replace("import { useTranslation } from '../../i18n';", "import { useTranslation } from '../../i18n';\nimport { useAuth } from '../../store/authStore';")

# Add useAuth inside component
if "const { user: authUser } = useAuth();" not in content:
    content = content.replace("export default function AdministratorsPage() {", "export default function AdministratorsPage() {\n  const { user: authUser } = useAuth();")

# Replace deletion condition
# Look for {user.role !== 'super_admin' && (
old_delete = "{user.role !== 'super_admin' && ("
new_delete = "{user.id !== authUser?.id && ("
content = content.replace(old_delete, new_delete)

with open('src/pages/admin/AdministratorsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdministratorsPage.tsx")
