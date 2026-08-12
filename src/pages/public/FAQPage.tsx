import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(1);
  const { t, language } = useTranslation();
  const { faqs } = useData();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    import('../../api/client').then(({ apiClient }) => {
      apiClient.get('/settings/organization/').then(res => setSettings(res.data)).catch(console.error);
    });
  }, []);

  const translatedFaqs = faqs.map(f => getTranslatedContent(f, language));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-[#1a56db] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">{t('faq.title')}</h1>
          <p className="text-white/70">{t('faq.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="font-bold text-slate-800 text-xl mb-6">{t('faq.qaTitle')}</h2>
            <div className="space-y-3">
              {translatedFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openId === faq.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">{t('faq.contactTitle')}</h3>
              <ul className="space-y-4 text-sm">
                {[
                  { icon: Phone, label: t('faq.phoneLabel'), value: settings?.contact_phone || t('footer.phone'), href: settings?.contact_phone ? `tel:${settings.contact_phone}` : "tel:+998773633836" },
                  { icon: Mail, label: t('faq.emailLabel'), value: settings?.contact_email || t('footer.email'), href: settings?.contact_email ? `mailto:${settings.contact_email}` : "mailto:uzbamarkaz@umail.uz" },
                  { icon: MapPin, label: t('faq.addressLabel'), value: settings?.footer_text || t('footer.address'), href: undefined },
                  { icon: Clock, label: t('faq.workingHoursLabel'), value: t('faq.workingHours'), href: undefined },
                ].map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#1a56db]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      {href ? (
                        <a href={href} className="font-medium text-[#1a56db] hover:underline">{value}</a>
                      ) : (
                        <p className="font-medium text-slate-700">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="aspect-video bg-slate-200 flex items-center justify-center relative">
                  {(() => {
                    const raw = (settings?.map_url || "").trim();
                    let parsedUrl = raw;
                    if (raw.toLowerCase().includes('<iframe')) {
                      const match = raw.match(/src=["']([^"']+)["']/i);
                      if (match) parsedUrl = match[1];
                    }
                    
                    if (!parsedUrl) {
                      parsedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11988.397637841168!2d69.1825986!3d41.2791371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae895563fd58cd%3A0x2cf0b7618d787b0f!2sO%CA%BBzBA%20huzuridagi%20Markaz!5e0!3m2!1suz!2suz!4v1716382181234!5m2!1suz!2suz";
                    }

                    if (parsedUrl.includes('embed') || parsedUrl.includes('output=embed')) {
                      return (
                        <iframe
                          src={parsedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Location Map"
                        />
                      );
                    } else {
                      return (
                        <div className="text-center p-4">
                          <MapPin className="w-12 h-12 text-[#1a56db] mx-auto mb-2" />
                          <p className="text-sm text-slate-600 mb-4">Xarita o'rniga oddiy havola kiritilgan.</p>
                          <a href={parsedUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1a56db] text-white px-4 py-2 rounded-lg text-sm">
                            Xaritada ochish
                          </a>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="p-4 text-xs text-slate-500 text-center">{settings?.footer_text || t('footer.address')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
