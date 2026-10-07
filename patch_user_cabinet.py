import re

with open('src/pages/cabinet/UserCabinet.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = [
    ('toast.success("Ariza muvaffaqiyatli tahrirlandi!");', 'toast.success(t("cabinet.editSuccess"));'),
    ('toast.error("Tahrirlashda xatolik yuz berdi");', 'toast.error(t("cabinet.editError"));'),
    ('>Tahrirlash<', '>{t("cabinet.edit")}<'),
    ('Sertifikatni yuklab olish', '{t("cabinet.downloadCert")}'),
    ('title="Arizani tahrirlash"', 'title={t("cabinet.editTitle")}'),
    ('<strong>Ogohlantirish:</strong>', '<strong>{t("cabinet.warning")}:</strong>'),
    ('Bu ariza tasdiqlangan va sertifikat berilgan. Agar siz uni tahrirlasangiz, u qaytadan "Kutilmoqda" holatiga o\'tadi va mavjud sertifikat bekor qilinadi.', '{t("cabinet.warningApproved")}'),
    ('Faqat o\'zgartirish kerak bo\'lgan maydonlarni to\'ldiring. Fayllarni yangilash uchun yangi fayl yuklang.', '{t("cabinet.editNote")}'),
    ('label="F.I.SH (Ism familiya)"', 'label={t("apply.fullName")}'),
    ('label="Tug\'ilgan sana"', 'label={t("apply.dob")}'),
    ('label="Telefon raqami"', 'label={t("apply.phone")}'),
    ('label="Email"', 'label={t("apply.email")}'),
    ('label="Tashkilot"', 'label={t("apply.organization")}'),
    ('label="Lavozim"', 'label={t("apply.position")}'),
    ('label="Davlat"', 'label={t("apply.country")}'),
    ('label="Viloyat"', 'label={t("apply.region")}'),
    ('label="Tuman/Shahar"', 'label={t("apply.district")}'),
    ('label="Maqola mavzusi"', 'label={t("apply.presentationTitle")}'),
    ('label="Annotatsiya (Abstract)"', 'label={t("apply.abstract")}'),
    ('>Jinsi<', '>{t("apply.gender")}<'),
    ('>Erkak<', '>{t("apply.male")}<'),
    ('>Ayol<', '>{t("apply.female")}<'),
    ('>Ishtirok etish shakli<', '>{t("cabinet.attendanceType")}<'),
    ('Maqola fayli (Doc/Docx)', '{t("cabinet.docLabel")}'),
    ('Pasport nusxasi (PDF/Rasm)', '{t("cabinet.passportLabel")}'),
    ('>Bekor qilish<', '>{t("cabinet.cancel")}<'),
    ('>Saqlash va Yuborish<', '>{t("cabinet.saveAndSubmit")}<'),
    ('title="Ogohlantirish"', 'title={t("cabinet.warning")}'),
    ('Hali sertifikatlar kiritilmadi, iltimos kuting.', '{t("cabinet.noCertMsg")}'),
    ('>Tushundim<', '>{t("cabinet.understood")}<'),
]

for old, new in replacements:
    text = text.replace(old, new)

with open('src/pages/cabinet/UserCabinet.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UserCabinet patched!")
