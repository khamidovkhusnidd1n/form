import re

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    for old, new in replacements:
        if isinstance(old, re.Pattern):
            text = old.sub(new, text)
        else:
            text = text.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

# 1. Patch i18n.tsx
i18n_replacements = [
    # UZ
    ("'apply.abstract': 'Tezis (Abstract)'", "'apply.abstract': 'Maqola (Article)'"),
    ("'apply.abstractPlaceholder': 'Taqdimotingizning qisqacha mazmuni (300-500 so\\'z)...'", "'apply.abstractPlaceholder': 'Maqolangizning qisqacha mazmuni...'"),
    ("'apply.docThesis': 'Tezis hujjati'", "'apply.docThesis': 'Maqola hujjati'"),
    ("'val.abstract': 'Tezis kamida 50 ta belgi bo\\'lishi kerak'", "'val.abstract': 'Maqola kamida 50 ta belgi bo\\'lishi kerak'"),
    ("'apply.docAbstract': 'Tezis / Maqola'", "'apply.docAbstract': 'Maqola'"),

    # EN
    ("'apply.abstract': 'Abstract'", "'apply.abstract': 'Article'"),
    ("'apply.abstractPlaceholder': 'Short summary of your presentation (300-500 words)...'", "'apply.abstractPlaceholder': 'Short summary of your article...'"),
    ("'apply.docThesis': 'Abstract document'", "'apply.docThesis': 'Article document'"),
    ("'val.abstract': 'Abstract must be at least 50 characters'", "'val.abstract': 'Article must be at least 50 characters'"),
    ("'apply.docAbstract': 'Abstract / Article'", "'apply.docAbstract': 'Article'"),

    # RU
    ("'apply.abstract': ' ()'", "'apply.abstract': 'Статья (Article)'"), # These were mojibake, replacing with proper Russian
    ("'apply.abstractPlaceholder': '⪮ ᮤঠ  (300-500 ᫮)...'", "'apply.abstractPlaceholder': 'Краткое содержание вашей статьи...'"),
    ("'apply.docThesis': '㬥 ⥧'", "'apply.docThesis': 'Документ статьи'"),
    ("'val.abstract': '     50 ᨬ'", "'val.abstract': 'Статья должна содержать не менее 50 символов'"),
    ("'apply.docAbstract': ' / '", "'apply.docAbstract': 'Статья'"),
]
patch_file('src/i18n.tsx', i18n_replacements)

# 2. Patch ApplicationFormPage.tsx to remove passport and photo inputs
app_form_replacements = [
    (
        "{ key: 'passport' as const, label: t('apply.docPassport'), hint: t('apply.docPassportHint'), required: false, accept: \".jpg,.jpeg,.png,.pdf\" },",
        ""
    ),
    (
        "{ key: 'photo' as const, label: t('apply.docPhoto'), hint: t('apply.docPhotoHint'), required: false, accept: \".jpg,.jpeg,.png\" },",
        ""
    )
]
patch_file('src/pages/public/ApplicationFormPage.tsx', app_form_replacements)

# 3. Patch UserCabinet.tsx to remove passport input
user_cabinet_replacements = [
    (re.compile(r'<div className="space-y-3 pt-2">\s*<label className="block text-sm font-medium text-slate-700">\{t\("cabinet\.passportLabel"\)\}</label>.*?</div>', re.DOTALL), '')
]
patch_file('src/pages/cabinet/UserCabinet.tsx', user_cabinet_replacements)

print("Patching completed.")
