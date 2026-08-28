import re

with open('src/pages/public/ApplicationFormPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import { PhoneInput } from 'react-international-phone';\nimport 'react-international-phone/style.css';\n"
content = content.replace("import type { Application } from '../../types';", import_str + "import type { Application } from '../../types';")

# Find the register('phone') input
old_phone = "<Input label={t('apply.phone')} type=\"tel\" {...register('phone')} error={errors.phone?.message} placeholder={t('apply.phonePlaceholder')} required />"
new_phone = '''<div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">{t('apply.phone')}</label>
                        <PhoneInput
                          defaultCountry="uz"
                          value={watch('phone')}
                          onChange={(phone) => setValue('phone', phone, { shouldValidate: true })}
                          inputClassName="!w-full !rounded-xl !border-slate-200 !h-11 !text-slate-800"
                          countrySelectorStyleProps={{ buttonClassName: '!h-11 !rounded-l-xl !border-slate-200 !bg-slate-50' }}
                        />
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                      </div>'''

content = content.replace(old_phone, new_phone)

# Improve success screen
old_success = '''          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">{t('apply.successTitle')}</h2>
          <p className="text-slate-500 mb-6">{t('apply.successMessage')}</p>
          <div className="bg-[#e8f0fe] rounded-2xl p-5 mb-6">
            <p className="text-sm text-slate-500 mb-1">{t('track.idLabel')}</p>
            <p className="text-2xl font-bold font-mono text-[#1a56db]">{successId}</p>
            <p className="text-xs text-slate-400 mt-1">{t('apply.idNotice')}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={/track?id=}>
              <Button className="w-full justify-center">{t('apply.trackBtn')}</Button>
            </a>
            <Button variant="ghost" onClick={() => { setSuccessId(null); setStep(1); }} className="w-full justify-center">
              {t('apply.newAppBtn')}
            </Button>
          </div>'''

new_success = '''          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">{t('apply.successTitle')}</h2>
          <p className="text-slate-500 mb-6">{t('apply.successMessage')}</p>
          <div className="bg-[#e8f0fe] border border-blue-100 rounded-2xl p-5 mb-6 relative group">
            <p className="text-sm text-blue-600 font-medium mb-1">{t('track.idLabel')}</p>
            <p className="text-3xl font-bold font-mono text-slate-800 tracking-wider mb-2">{successId}</p>
            <button 
              onClick={() => { navigator.clipboard.writeText(successId); toast.success('Nusxa olindi!'); }}
              className="absolute top-4 right-4 bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
            >
              Nusxa olish
            </button>
            <div className="flex items-start gap-2 text-left bg-white/50 p-3 rounded-xl mt-3">
              <span className="text-lg">📧</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tizim sizning pochtangizga tasdiq xatini (va shu ID raqamni) muvaffaqiyatli jo'natdi. E-mail pochtangizni tekshiring! 
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <a href={/track?id=}>
              <Button className="w-full justify-center">{t('apply.trackBtn')}</Button>
            </a>
            <Button variant="ghost" onClick={() => { setSuccessId(null); setStep(1); }} className="w-full justify-center">
              {t('apply.newAppBtn')}
            </Button>
          </div>'''

content = content.replace(old_success, new_success)

with open('src/pages/public/ApplicationFormPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
