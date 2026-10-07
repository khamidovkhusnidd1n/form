import re

with open('src/pages/cabinet/UserCabinet.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'(\s+)Tahrirlash(\s+)</button>', r'\1{t("cabinet.edit")}\2</button>', text)
text = text.replace('Faylni tanlang yoki shu yerga tashlang', '{t("cabinet.dropFile")}')
text = text.replace('DOC, DOCX, PDF (Maks. 5MB)', '{t("cabinet.fileTypesDoc")}')
# Ensure Saqlash va Yuborish is replaced if it wasn't
text = re.sub(r'(\s+)Saqlash va Yuborish(\s+)</button>', r'\1{t("cabinet.saveAndSubmit")}\2</button>', text)
text = re.sub(r'(\s+)Bekor qilish(\s+)</button>', r'\1{t("cabinet.cancel")}\2</button>', text)

with open('src/pages/cabinet/UserCabinet.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UserCabinet patched again!")
