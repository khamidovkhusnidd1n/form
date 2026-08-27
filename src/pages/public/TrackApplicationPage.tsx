import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, XCircle, FileText, Download, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, getApplicationStatusLabel } from '../../lib/utils';
import type { Application, ApplicationStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';

export default function TrackApplicationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useTranslation();
  const { applications } = useData();

  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<Application | null | 'not_found'>(null);
  const [loading, setLoading] = useState(false);

  const STATUS_STEPS: { status: ApplicationStatus; labelKey: string; icon: typeof CheckCircle }[] = [
    { status: 'submitted', labelKey: 'track.stepSubmitted', icon: FileText },
    { status: 'under_review', labelKey: 'track.stepReview', icon: Clock },
    { status: 'approved', labelKey: 'track.stepApproved', icon: CheckCircle },
  ];

  const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchParams({ id });
    const rawFound = applications.find(a => a.applicationId.toLowerCase() === id.trim().toLowerCase());
    setResult(rawFound ? getTranslatedContent(rawFound, language) : 'not_found');
    setLoading(false);
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setQuery(id); handleSearch(id); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const getStepIndex = (status: ApplicationStatus) => {
    if (status === 'rejected') return -1;
    if (status === 'info_required') return 1;
    const order: ApplicationStatus[] = ['submitted', 'under_review', 'approved'];
    return order.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-[#1a56db] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">{t('track.title')}</h1>
          <p className="text-white/70 mb-8">{t('track.subtitle')}</p>
          <div className="flex gap-3 max-w-lg mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder={t('track.placeholder')}
              className="flex-1 bg-white rounded-xl border-0 px-5 py-3.5 text-slate-800 font-mono text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <Button size="lg" loading={loading} onClick={() => handleSearch(query)} icon={<Search className="w-5 h-5" />} className="shrink-0">
              {t('track.button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {result === 'not_found' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">{t('track.notFoundTitle')}</h2>
            <p className="text-slate-400">"{query}" {t('track.notFoundText')}</p>
          </motion.div>
        )}

        {result && result !== 'not_found' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className={`rounded-2xl p-6 ${
              result.status === 'approved' ? 'bg-emerald-50 border border-emerald-200' :
              result.status === 'rejected' ? 'bg-red-50 border border-red-200' :
              result.status === 'info_required' ? 'bg-orange-50 border border-orange-200' :
              'bg-[#e8f0fe] border border-blue-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{t('track.idLabel')}</p>
                  <p className="text-2xl font-bold font-mono text-slate-800">{result.applicationId}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>
            </div>

            {result.status !== 'rejected' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-6">{t('track.processTitle')}</h3>
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((s, i) => {
                    const current = getStepIndex(result.status);
                    const done = current > i;
                    const active = current === i;
                    return (
                      <div key={s.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done ? 'bg-emerald-500 border-emerald-500 text-white' :
                            active ? 'border-[#1a56db] bg-white text-[#1a56db]' :
                            'border-slate-200 bg-white text-slate-300'
                          }`}>
                            <s.icon className="w-4 h-4" />
                          </div>
                          <p className={`text-xs mt-2 font-medium text-center max-w-[90px] ${active ? 'text-[#1a56db]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {t(s.labelKey)}
                          </p>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {result.status === 'approved' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2">Sizning QR-kod ruxsatnomangiz</h3>
                <p className="text-sm text-slate-500 mb-6">Ushbu QR-kodni telefoningizga saqlab oling yoki skrinshot qiling. Tadbirga kelganingizda uni mas'ul xodimga ko'rsating.</p>
                <div className="inline-block p-4 border-2 border-[#1a56db] rounded-2xl bg-white shadow-md">
                  <QRCodeSVG 
                    value={`https://form.uzbamalaka.uz/admin/check-in/${result.id}`} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#1a56db"
                  />
                </div>
                <p className="mt-4 text-xs font-mono text-slate-400">{result.applicationId}</p>
              </div>
            )}

            {result.adminComment && (
              <div className={`rounded-2xl border p-5 flex gap-3 ${
                result.status === 'info_required' ? 'bg-orange-50 border-orange-200' :
                result.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <MessageSquare className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 text-sm mb-1">{t('track.adminCommentTitle')}</p>
                  <p className="text-slate-600 text-sm">{result.adminComment}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">{t('track.detailsTitle')}</h3>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {([
                  [t('apply.fullName'), result.fullName],
                  [t('apply.email'), result.email],
                  [t('apply.organization'), result.organization],
                  [t('apply.position'), result.position],
                  [t('apply.event'), result.eventTitle],
                  [t('apply.presentationTitle'), result.presentationTitle],
                  [t('track.submittedDate'), formatDate(result.submittedAt, language)],
                  [t('track.updatedDate'), formatDate(result.updatedAt, language)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-400 mb-0.5">{k}</dt>
                    <dd className="font-medium text-slate-700 truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {(result.invitationPdfUrl || result.certificatePdfUrl) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-wrap gap-3">
                {result.invitationPdfUrl && (
                  <Button variant="secondary" icon={<Download className="w-4 h-4" />}>{t('track.downloadInvitation')}</Button>
                )}
                {result.certificatePdfUrl && (
                  <Button variant="secondary" icon={<Download className="w-4 h-4" />}>{t('track.downloadCertificate')}</Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
