import re

with open('src/i18n.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# The ru_addon is currently placed at the bottom where it broke the syntax.
# I will find the `ru_addon` and move it properly into the `ru: { ... }` block.
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

# Let's remove it from where it is right now.
text = text.replace(ru_addon, '')

# Let's add it properly.
ru_start = text.find('ru: {')
ru_end = text.find('  }', ru_start) # Find the closing brace of the `ru` object

if ru_end != -1:
    text = text[:ru_end] + ru_addon + text[ru_end:]

with open('src/i18n.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("i18n.tsx ru fixed!")
