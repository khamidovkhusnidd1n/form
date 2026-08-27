import re

with open('src/pages/public/ApplicationFormPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update schema
content = re.sub(
    r"presentationTitle: z\.string\(\)\.min\(5, t\('val\.presentationTitle'\)\),\s*abstract: z\.string\(\)\.min\(50, t\('val\.abstract'\)\),",
    "presentationTitle: z.string().optional(),\n      abstract: z.string().optional(),",
    content
)

# 2. Update nextStep
next_step_old = '''  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => Math.min(s + 1, 4));
  };'''

next_step_new = '''  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    
    if (step === 3 && valid) {
      const selectedEvtId = watch('eventId');
      const currentEvt = events.find(e => e.id.toString() === selectedEvtId);
      const requiresDocument = ['conference', 'symposium', 'article_call'].includes(currentEvt?.type || '');
      
      if (requiresDocument) {
        const pTitle = watch('presentationTitle');
        const abst = watch('abstract');
        if (!pTitle || pTitle.length < 5 || !abst || abst.length < 50) {
          toast.error(t('val.presentationTitle') || 'Iltimos, ma\\'ruza mavzusi va qisqacha mazmunini to\\'liq kiriting.');
          return;
        }
      }
    }
    
    if (valid) setStep(s => Math.min(s + 1, 4));
  };'''

content = content.replace(next_step_old, next_step_new)

# 3. Update onSubmit file check
file_check_old = '''    if (!files.document) {
      toast.error(t('apply.fileRequired') || "Tezis (Abstract) yuklanishi shart (PDF, DOCX)");
      return;
    }'''

file_check_new = '''    const selectedEvtId = data.eventId;
    const currentEvt = events.find(e => e.id.toString() === selectedEvtId);
    const requiresDocument = ['conference', 'symposium', 'article_call'].includes(currentEvt?.type || '');

    if (requiresDocument && !files.document) {
      toast.error(t('apply.fileRequired') || "Tezis (Abstract) yuklanishi shart (PDF, DOCX)");
      return;
    }'''

content = content.replace(file_check_old, file_check_new)

# 4. Conditionally render Step 3 fields
step3_old = '''                  <Input label={t('apply.presentationTitle')} {...register('presentationTitle')} error={errors.presentationTitle?.message} placeholder={t('apply.presentationTitlePlaceholder')} required />
                  <Textarea
                    label={t('apply.abstract')}
                    {...register('abstract')}
                    error={errors.abstract?.message}
                    rows={6}
                    placeholder={t('apply.abstractPlaceholder')}
                    hint={t('apply.abstractHint')}
                    required
                  />'''

step3_new = '''                  {(() => {
                    const selectedEvtId = watch('eventId');
                    const selectedEvt = events.find(e => e.id.toString() === selectedEvtId);
                    const requiresDocument = ['conference', 'symposium', 'article_call'].includes(selectedEvt?.type || '');
                    
                    if (!requiresDocument) return null;
                    
                    return (
                      <>
                        <Input label={t('apply.presentationTitle')} {...register('presentationTitle')} error={errors.presentationTitle?.message} placeholder={t('apply.presentationTitlePlaceholder')} required />
                        <Textarea
                          label={t('apply.abstract')}
                          {...register('abstract')}
                          error={errors.abstract?.message}
                          rows={6}
                          placeholder={t('apply.abstractPlaceholder')}
                          hint={t('apply.abstractHint')}
                          required
                        />
                      </>
                    );
                  })()}'''

content = content.replace(step3_old, step3_new)

# 5. Conditionally render Step 4 document upload
step4_old = '''                    {[
                      { key: 'document' as const, label: t('apply.docThesis'), hint: t('apply.docThesisHint'), required: true, accept: ".pdf,.docx,.doc" },
                      { key: 'passport' as const, label: t('apply.docPassport'), hint: t('apply.docPassportHint'), required: false, accept: ".jpg,.jpeg,.png,.pdf" },
                      { key: 'photo' as const, label: t('apply.docPhoto'), hint: t('apply.docPhotoHint'), required: false, accept: ".jpg,.jpeg,.png" },
                    ].map(({ key, label, hint, required, accept }) => ('''

step4_new = '''                    {(() => {
                      const selectedEvtId = watch('eventId');
                      const selectedEvt = events.find(e => e.id.toString() === selectedEvtId);
                      const requiresDocument = ['conference', 'symposium', 'article_call'].includes(selectedEvt?.type || '');
                      
                      const docs = [
                        { key: 'document' as const, label: t('apply.docThesis'), hint: t('apply.docThesisHint'), required: true, accept: ".pdf,.docx,.doc" },
                        { key: 'passport' as const, label: t('apply.docPassport'), hint: t('apply.docPassportHint'), required: false, accept: ".jpg,.jpeg,.png,.pdf" },
                        { key: 'photo' as const, label: t('apply.docPhoto'), hint: t('apply.docPhotoHint'), required: false, accept: ".jpg,.jpeg,.png" },
                      ];
                      
                      return docs.filter(d => d.key !== 'document' || requiresDocument).map(({ key, label, hint, required, accept }) => ('''

content = content.replace(step4_old, step4_new)

# Fix the closing tag of the map in step 4
step4_close_old = '''                      </div>
                    ))}
                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-100">'''

step4_close_new = '''                      </div>
                    )))}
                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-100">'''

content = content.replace(step4_close_old, step4_close_new)


with open('src/pages/public/ApplicationFormPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
