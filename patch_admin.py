import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = [
    ('title="Ogohlantirish"', 'title={t("cabinet.warning")}'),
    ('Hali sertifikatlar kiritilmadi, iltimos kuting.', '{t("cabinet.noCertMsg")}'),
    ('>Tushundim<', '>{t("cabinet.understood")}<'),
    ('Excel ga yuklab olish', '{t("admin.exportExcel", "Export to Excel")}'), # fallback translation just in case
    ("Statusni o'zgartirish", "{t('admin.changeStatus', 'Change Status')}"),
    ('title="Sertifikatni yuklash"', 'title={t("cabinet.downloadCert")}'),
]

for old, new in replacements:
    text = text.replace(old, new)

with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("ApplicationsPage patched!")
