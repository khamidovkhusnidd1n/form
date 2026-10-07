import re

with open('src/i18n.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add to uz
uz_addon = """
    // Cabinet additions
    'cabinet.edit': 'Tahrirlash',
    'cabinet.editTitle': 'Arizani tahrirlash',
    'cabinet.editSuccess': 'Ariza muvaffaqiyatli tahrirlandi!',
    'cabinet.editError': 'Tahrirlashda xatolik yuz berdi',
    'cabinet.downloadCert': 'Sertifikatni yuklab olish',
    'cabinet.warning': 'Ogohlantirish',
    'cabinet.warningApproved': 'Bu ariza tasdiqlangan va sertifikat berilgan. Agar siz uni tahrirlasangiz, u qaytadan "Kutilmoqda" holatiga o\\'tadi va mavjud sertifikat bekor qilinadi.',
    'cabinet.editNote': 'Faqat o\\'zgartirish kerak bo\\'lgan maydonlarni to\\'ldiring. Fayllarni yangilash uchun yangi fayl yuklang.',
    'cabinet.attendanceType': 'Ishtirok etish shakli',
    'cabinet.docLabel': 'Maqola fayli (Doc/Docx)',
    'cabinet.passportLabel': 'Pasport nusxasi (PDF/Rasm)',
    'cabinet.cancel': 'Bekor qilish',
    'cabinet.saveAndSubmit': 'Saqlash va Yuborish',
    'cabinet.noCertMsg': 'Hali sertifikatlar kiritilmadi, iltimos kuting.',
    'cabinet.understood': 'Tushundim',
"""

# Add to en
en_addon = """
    // Cabinet additions
    'cabinet.edit': 'Edit',
    'cabinet.editTitle': 'Edit Application',
    'cabinet.editSuccess': 'Application successfully edited!',
    'cabinet.editError': 'Error occurred while editing',
    'cabinet.downloadCert': 'Download Certificate',
    'cabinet.warning': 'Warning',
    'cabinet.warningApproved': 'This application is approved and a certificate is issued. If you edit it, it will return to "Pending" status and the current certificate will be canceled.',
    'cabinet.editNote': 'Only fill out the fields you want to change. Upload a new file to replace the existing one.',
    'cabinet.attendanceType': 'Attendance Type',
    'cabinet.docLabel': 'Article file (Doc/Docx)',
    'cabinet.passportLabel': 'Passport copy (PDF/Image)',
    'cabinet.cancel': 'Cancel',
    'cabinet.saveAndSubmit': 'Save and Submit',
    'cabinet.noCertMsg': 'Certificates are not added yet, please wait.',
    'cabinet.understood': 'Understood',
"""

# Add to ru
ru_addon = """
    // Cabinet additions
    'cabinet.edit': 'Редактировать',
    'cabinet.editTitle': 'Редактировать заявку',
    'cabinet.editSuccess': 'Заявка успешно изменена!',
    'cabinet.editError': 'Ошибка при редактировании',
    'cabinet.downloadCert': 'Скачать сертификат',
    'cabinet.warning': 'Предупреждение',
    'cabinet.warningApproved': 'Эта заявка одобрена и сертификат выдан. Если вы ее измените, она вернется в статус «В ожидании», а текущий сертификат будет аннулирован.',
    'cabinet.editNote': 'Заполните только те поля, которые нужно изменить. Загрузите новый файл для обновления.',
    'cabinet.attendanceType': 'Форма участия',
    'cabinet.docLabel': 'Файл статьи (Doc/Docx)',
    'cabinet.passportLabel': 'Копия паспорта (PDF/Изображение)',
    'cabinet.cancel': 'Отмена',
    'cabinet.saveAndSubmit': 'Сохранить и отправить',
    'cabinet.noCertMsg': 'Сертификаты еще не добавлены, пожалуйста подождите.',
    'cabinet.understood': 'Понятно',
"""

def insert_addon(lang_text, addon, start_key, end_key):
    start = text.find(start_key)
    end = text.find(end_key, start)
    return text[:end] + addon + text[end:]

text = insert_addon(text, uz_addon, 'uz: {', 'en: {')
text = insert_addon(text, en_addon, 'en: {', 'ru: {')
# For RU, find the end of the ru block which is "}" right before `export const APPLICATION_STATUS_LABELS` or something.
# Wait, finding end of ru block safely:
ru_start = text.find('ru: {')
ru_end = text.find('};', ru_start)
text = text[:ru_end] + ru_addon + text[ru_end:]

with open('src/i18n.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("i18n.tsx patched!")
