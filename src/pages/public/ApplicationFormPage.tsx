import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User, Building, FileText, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { getLocalizedRegions, generateApplicationId } from '../../lib/utils';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';
import type { Application } from '../../types';
import { Country, State, City } from 'country-state-city';

export default function ApplicationFormPage() {
  const [searchParams] = useSearchParams();
  const { t, language } = useTranslation();
  const { events, addApplication } = useData();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [files, setFiles] = useState<{ document?: File; passport?: File; photo?: File }>({});
  const [attendanceType, setAttendanceType] = useState<'online' | 'offline'>('offline');

  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const localizedRegions = useMemo(() => getLocalizedRegions(language), [language]);

  const schema = useMemo(() => z.object({
    fullName: z.string().min(3, t('val.fullName')),
    dateOfBirth: z.string().min(1, t('val.dob')),
    gender: z.enum(['male', 'female']),
    phone: z.string().min(9, t('val.phone')),
    email: z.string().email(t('val.email')),
    organization: z.string().min(2, t('val.organization')),
    position: z.string().min(2, t('val.position')),
    country: z.string().min(2, t('val.country') || 'Mamlakat nomi kamida 2 ta harfdan iborat bo\'lishi kerak'),
    regionId: z.string().min(1, t('val.region')),
    districtId: z.string().min(1, t('val.district')),
    eventId: z.string().min(1, t('val.event')),
    presentationTitle: z.string().min(5, t('val.presentationTitle')),
    abstract: z.string().min(50, t('val.abstract')),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const STEPS = [
    { id: 1, title: t('apply.step1Title'), icon: User },
    { id: 2, title: t('apply.step2Title'), icon: Building },
    { id: 3, title: t('apply.step3Title'), icon: FileText },
    { id: 4, title: t('apply.step4Title'), icon: Upload },
  ];

  const { register, handleSubmit, formState: { errors }, trigger, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { eventId: searchParams.get('event') || '', country: "O'zbekiston" },
  });

  const regionId = watch('regionId');
  const watchCountry = watch('country');
  const watchRegion = watch('regionId');

  useEffect(() => {
    setSelectedRegionId(regionId);
    // Don't auto-clear district if it's a free-text typing change, only clear if they select a localized region ID
    if (!isNaN(Number(regionId)) && Number(regionId) > 0) {
      setValue('districtId', '');
    }
  }, [regionId, setValue]);

  const selectedRegion = localizedRegions.find(r => r.id.toString() === selectedRegionId);

  // Country state city derived data
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const selectedCscCountry = useMemo(() => allCountries.find(c => c.name.toLowerCase() === watchCountry?.toLowerCase()), [watchCountry, allCountries]);
  const cscStates = useMemo(() => selectedCscCountry ? State.getStatesOfCountry(selectedCscCountry.isoCode) : [], [selectedCscCountry]);
  const selectedCscState = useMemo(() => cscStates.find(s => s.name === watchRegion) || cscStates.find(s => s.isoCode === watchRegion), [cscStates, watchRegion]);
  const cscCities = useMemo(() => selectedCscCountry && selectedCscState ? City.getCitiesOfState(selectedCscCountry.isoCode, selectedCscState.isoCode) : [], [selectedCscCountry, selectedCscState]);

  const isUzbekistan = watchCountry?.toLowerCase() === "o'zbekiston" || watchCountry?.toLowerCase() === "uzbekistan" || watchCountry?.toLowerCase() === "узбекистан";

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ['fullName', 'dateOfBirth', 'gender', 'phone', 'email'],
    2: ['organization', 'position', 'country', 'regionId', 'districtId'],
    3: ['eventId', 'presentationTitle', 'abstract'],
    4: [],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => Math.min(s + 1, 4));
  };

  const onSubmit = async (data: FormData) => {
    if (parseInt(captchaInput) !== (captchaNum1 + captchaNum2)) {
      setCaptchaError(true);
      toast.error(t('apply.captchaError') || "Xavfsizlik savoliga noto'g'ri javob berdingiz.");
      return;
    }
    setCaptchaError(false);

    if (!files.document) {
      toast.error(t('apply.fileRequired') || "Tezis (Abstract) yuklanishi shart (PDF, DOCX)");
      return;
    }
    setSubmitting(true);
    const id = generateApplicationId();

    const selectedEvt = events.find(e => e.id.toString() === data.eventId);
    const translatedEvt = selectedEvt ? getTranslatedContent(selectedEvt, language) : null;
    const selectedReg = localizedRegions.find(r => r.id.toString() === data.regionId);
    const selectedDist = selectedReg?.districts[Number(data.districtId)] || '';

    const newApp: Application = {
      id: Date.now(),
      applicationId: id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      organization: data.organization,
      position: data.position,
      country: data.country,
      regionId: Number(data.regionId) || 0,
      regionName: selectedReg?.name || data.regionId,
      districtId: Number(data.districtId) || 0,
      districtName: selectedDist || data.districtId,
      eventId: Number(data.eventId),
      eventTitle: translatedEvt?.title || selectedEvt?.title || '',
      attendanceType: attendanceType,
      presentationTitle: data.presentationTitle,
      abstract: data.abstract,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentFile: files.document,
      passportFile: files.passport,
      photoFile: files.photo,
    };

    try {
      const realId = await addApplication(newApp);
      setSuccessId((realId as unknown as string) || id);
      toast.success(t('common.success'));
    } catch (e: any) {
      // Show detailed backend error if available
      const data = e?.response?.data;
      if (data) {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        toast.error(messages || t('common.error') || 'Xatolik yuz berdi', { duration: 6000 });
      } else {
        toast.error(t('common.error') || 'Xatolik yuz berdi');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">{t('apply.successTitle')}</h2>
          <p className="text-slate-500 mb-6">{t('apply.successMessage')}</p>
          <div className="bg-[#e8f0fe] rounded-2xl p-5 mb-6">
            <p className="text-sm text-slate-500 mb-1">{t('track.idLabel')}</p>
            <p className="text-2xl font-bold font-mono text-[#1a56db]">{successId}</p>
            <p className="text-xs text-slate-400 mt-1">{t('apply.idNotice')}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={`/track?id=${successId}`}>
              <Button className="w-full justify-center">{t('apply.trackBtn')}</Button>
            </a>
            <Button variant="ghost" onClick={() => { setSuccessId(null); setStep(1); }} className="w-full justify-center">
              {t('apply.newAppBtn')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-[#1a56db] text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-2">{t('apply.title')}</h1>
          <p className="text-white/70">{t('apply.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'text-[#1a56db]' : 'text-slate-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step > s.id ? 'bg-[#1a56db] border-[#1a56db] text-white' :
                  step === s.id ? 'border-[#1a56db] bg-white text-[#1a56db]' :
                  'border-slate-200 bg-white text-slate-400'
                }`}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="hidden sm:block text-xs font-medium">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${step > s.id ? 'bg-[#1a56db]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <h2 className="font-bold text-slate-800 text-lg mb-5">{t('apply.step1Title')}</h2>
                  <Input label={t('apply.fullName')} {...register('fullName')} error={errors.fullName?.message} placeholder={t('apply.fullNamePlaceholder')} required />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label={t('apply.dob')} type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} required />
                    <Select
                      label={t('apply.gender')}
                      {...register('gender')}
                      error={errors.gender?.message}
                      placeholder={t('apply.genderPlaceholder')}
                      options={[
                        { value: 'male', label: t('apply.male') },
                        { value: 'female', label: t('apply.female') },
                      ]}
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label={t('apply.phone')} type="tel" {...register('phone')} error={errors.phone?.message} placeholder={t('apply.phonePlaceholder')} required />
                    <Input label={t('apply.email')} type="email" {...register('email')} error={errors.email?.message} placeholder={t('apply.emailPlaceholder')} required />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <h2 className="font-bold text-slate-800 text-lg mb-5">{t('apply.step2Title')}</h2>
                  <Input label={t('apply.organization')} {...register('organization')} error={errors.organization?.message} placeholder={t('apply.organizationPlaceholder')} required />
                  <Input label={t('apply.position')} {...register('position')} error={errors.position?.message} placeholder={t('apply.positionPlaceholder')} required />
                  <Input label={t('apply.country') || 'Mamlakat'} list="csc-countries" {...register('country')} error={errors.country?.message} placeholder={t('apply.countryPlaceholder') || 'Mamlakat nomini kiriting'} required />
                  <datalist id="csc-countries">
                    {allCountries.map(c => <option key={c.isoCode} value={c.name} />)}
                  </datalist>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {isUzbekistan ? (
                      <>
                        <Select
                          label={t('apply.region')}
                          {...register('regionId')}
                          error={errors.regionId?.message}
                          placeholder={t('apply.regionPlaceholder')}
                          options={localizedRegions.map(r => ({ value: r.id.toString(), label: r.name }))}
                          required
                        />
                        <Select
                          label={t('apply.district')}
                          {...register('districtId')}
                          error={errors.districtId?.message}
                          placeholder={t('apply.districtPlaceholder')}
                          options={(selectedRegion?.districts || []).map((d, i) => ({ value: i.toString(), label: d }))}
                          disabled={!selectedRegionId}
                          required
                        />
                      </>
                    ) : (
                      <>
                        <div>
                          <Input label={t('apply.region')} list="csc-states" {...register('regionId')} error={errors.regionId?.message} placeholder={t('apply.regionPlaceholder')} required />
                          <datalist id="csc-states">
                            {cscStates.map(s => <option key={s.isoCode} value={s.name} />)}
                          </datalist>
                        </div>
                        <div>
                          <Input label={t('apply.district')} list="csc-cities" {...register('districtId')} error={errors.districtId?.message} placeholder={t('apply.districtPlaceholder')} required />
                          <datalist id="csc-cities">
                            {cscCities.map(c => <option key={c.name} value={c.name} />)}
                          </datalist>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <h2 className="font-bold text-slate-800 text-lg mb-5">{t('apply.step3Title')}</h2>
                  <Select
                    label={t('apply.event')}
                    {...register('eventId')}
                    error={errors.eventId?.message}
                    placeholder={t('apply.eventPlaceholder')}
                    options={events
                      .filter(e => e.registrationEnabled)
                      .map(e => {
                        const translated = getTranslatedContent(e, language);
                        return { value: e.id.toString(), label: translated.title };
                      })
                    }
                    required
                  />

                  {/* Attendance Type - Show only for hybrid events; auto-set for online/offline only */}
                  {(() => {
                    const selectedEvtId = watch('eventId');
                    const selectedEvt = events.find(e => e.id.toString() === selectedEvtId);
                    if (!selectedEvt) return null;

                    // Auto-set attendanceType for non-hybrid events
                    if (selectedEvt.format !== 'hybrid' && attendanceType !== selectedEvt.format) {
                      setAttendanceType(selectedEvt.format as 'online' | 'offline');
                    }

                    if (selectedEvt.format === 'hybrid') {
                      return (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Ishtirok etish usuli *</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'offline' as const, label: 'Offline (Jismoniy)', icon: '🏢', desc: 'Joyiga kelib qatnashish' },
                              { value: 'online' as const, label: 'Online', icon: '💻', desc: 'Masofaviy qatnashish' },
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAttendanceType(opt.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                  attendanceType === opt.value
                                    ? 'border-[#1a56db] bg-[#e8f0fe]/40 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                              >
                                <span className="text-2xl">{opt.icon}</span>
                                <span className={`text-sm font-semibold ${attendanceType === opt.value ? 'text-[#1a56db]' : 'text-slate-700'}`}>{opt.label}</span>
                                <span className="text-xs text-slate-400">{opt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // For online-only or offline-only events, show info badge (attendanceType already auto-set above)
                    return (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-lg">{selectedEvt.format === 'online' ? '💻' : '🏢'}</span>
                        <span className="text-sm text-slate-600">
                          Bu tadbir faqat <strong>{selectedEvt.format === 'online' ? 'Online' : 'Offline'}</strong> formatda o'tkaziladi
                        </span>
                      </div>
                    );
                  })()}

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
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-5">{t('apply.documents')}</h2>
                  {[
                    { key: 'document' as const, label: t('apply.docThesis'), hint: t('apply.docThesisHint'), required: true, accept: ".pdf,.docx,.doc" },
                    { key: 'passport' as const, label: t('apply.docPassport'), hint: t('apply.docPassportHint'), required: false, accept: ".jpg,.jpeg,.png,.pdf" },
                    { key: 'photo' as const, label: t('apply.docPhoto'), hint: t('apply.docPhotoHint'), required: false, accept: ".jpg,.jpeg,.png" },
                  ].map(({ key, label, hint, required, accept }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${files[key] ? 'border-[#1a56db] bg-[#e8f0fe]/30' : 'border-slate-200 hover:border-slate-300'}`}>
                        {files[key] ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-[#1a56db]">
                            <CheckCircle className="w-4 h-4" />
                            {files[key]!.name}
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setFiles(f => ({ ...f, [key]: undefined })); }}
                              className="text-red-400 hover:text-red-600 ml-2"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 mb-1">{t('apply.uploadClick')}</p>
                            <p className="text-xs text-slate-400">{hint}</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept={accept}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFiles(f => ({ ...f, [key]: file }));
                          }}
                        />
                      </label>
                    </div>
                  ))}
                  <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-100">
                    {t('apply.attentionNotice')}
                  </div>
                  
                  {/* Math Captcha */}
                  <div className={`p-4 rounded-xl border ${captchaError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Spamdan himoya: {captchaNum1} + {captchaNum2} = ?
                    </label>
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        setCaptchaError(false);
                      }}
                      className={`w-full max-w-[200px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${captchaError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-[#1a56db] focus:ring-[#1a56db]/30'}`}
                      placeholder="Javobni kiriting"
                      required
                    />
                    {captchaError && <p className="text-xs text-red-500 mt-1">Javob noto'g'ri!</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(s => Math.max(s - 1, 1))}
                disabled={step === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                {t('apply.back')}
              </Button>
              <div className="text-sm text-slate-400 font-mono">{step} / {STEPS.length}</div>
              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  {t('apply.next')} <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" loading={submitting} icon={<CheckCircle className="w-4 h-4" />}>
                  {t('apply.submit')}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
