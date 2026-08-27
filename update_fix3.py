import re

with open('src/pages/admin/CheckInPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { api } from '../../api/client';", "import { apiClient } from '../../api/client';")
content = content.replace("api.post(`/applications/admin/${id}/check-in/`)", "apiClient.post(`/applications/admin/${id}/check-in/`)")

with open('src/pages/admin/CheckInPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
