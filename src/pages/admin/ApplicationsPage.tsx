import { useState, useMemo } from 'react';
import { Search, Eye, Download, ChevronLeft, ChevronRight, MessageSquare, CheckCircle, Globe, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatDate, getApplicationStatusLabel, APPLICATION_STATUS_LABELS } from '../../lib/utils';
import type { Application, ApplicationStatus } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation, LANGUAGE_LABELS, type Language } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent, translateText, translateContentToAllLanguages } from '../../lib/translationService';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 8;

export default function ApplicationsPage() {
  const { t, language } = useTranslation();
  const { applications, updateApplication, deleteApplication, deleteMultipleApplications } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Application | null>(null);
  const [statusModal, setStatusModal] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('submitted');
  const [commentTranslations, setCommentTranslations] = useState<Record<Language, string>>({ uz: '', ru: '', en: '' });
  const [activeTabLang, setActiveTabLang] = useState<Language>('uz');
  const [autoTranslating, setAutoTranslating] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{type: 'single'|'multiple', id?: number} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const translatedApplications = useMemo(
    () => applications.map(a => getTranslatedContent(a, language)),
    [applications, language]
  );

  const filtered = useMemo(() => translatedApplications.filter(a => {
    const matchesSearch = !search
      || a.applicationId.toLowerCase().includes(search.toLowerCase())
      || a.fullName.toLowerCase().includes(search.toLowerCase())
      || a.organization.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [translatedApplications, search, statusFilter]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAutoTranslate = async () => {
    if (!commentTranslations.uz.trim()) {
      toast.error(t('common.error') || 'Matn kiriting');
      return;
    }
    setAutoTranslating(true);
    try {
      const translated = await translateContentToAllLanguages({ text: commentTranslations.uz }, 'uz');
      setCommentTranslations({
        uz: commentTranslations.uz,
        ru: translated.ru?.text || '',
        en: translated.en?.text || '',
      });
      toast.success(t('eventsAdmin.autoTranslateBtn') + ' ' + t('common.success'));
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setAutoTranslating(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    setSavingStatus(true);

    let finalTranslations = { ...statusModal.translations };
    let uzText = commentTranslations.uz.trim();
    let ruText = commentTranslations.ru.trim();
    let enText = commentTranslations.en.trim();

    if (uzText || ruText || enText) {
      if (uzText && (!ruText || !enText)) {
        try {
          const translated = await translateContentToAllLanguages({ text: uzText }, 'uz');
          if (!ruText) ruText = translated.ru?.text || '';
          if (!enText) enText = translated.en?.text || '';
        } catch (e) {
          console.error("Auto-translation failed on save", e);
        }
      }

      finalTranslations = {
        ...finalTranslations,
        uz: { ...finalTranslations.uz, adminComment: uzText },
        ru: { ...finalTranslations.ru, adminComment: ruText },
        en: { ...finalTranslations.en, adminComment: enText },
      };
    }

    const updated: Application = {
      ...statusModal,
      status: newStatus,
      adminComment: commentTranslations.uz || statusModal.adminComment,
      updatedAt: new Date().toISOString(),
      translations: finalTranslations,
    };

    updateApplication(updated);
    toast.success(t('common.success'));
    setStatusModal(null);
    setCommentTranslations({ uz: '', ru: '', en: '' });
    setSavingStatus(false);
  };

  const handleExportExcel = () => {
    const exportData = filtered.map(app => ({
      'ID': app.applicationId,
      [t('apply.fullName')]: app.fullName,
      [t('apply.organization')]: app.organization,
      [t('apply.position')]: app.position,
      [t('apply.email')]: app.email,
      [t('apply.phone')]: app.phone,
      [t('apply.country') || 'Mamlakat']: app.country,
      [t('apply.region')]: app.regionName,
      [t('apply.district')]: app.districtName,
      [t('apply.event')]: app.eventTitle,
      [t('apply.presentationTitle')]: app.presentationTitle,
      [t('appsAdmin.colStatus')]: getApplicationStatusLabel(app.status, language),
      [t('track.submittedDate')]: formatDate(app.submittedAt, language),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Arizalar');
    XLSX.writeFile(workbook, `Arizalar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal) return;
    setIsDeleting(true);
    
    try {
      if (deleteConfirmModal.type === 'single' && deleteConfirmModal.id && deleteApplication) {
        await deleteApplication(deleteConfirmModal.id);
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(deleteConfirmModal.id!);
          return next;
        });
        toast.success(t('common.success') || 'Muvaffaqiyatli o\'chirildi');
      } else if (deleteConfirmModal.type === 'multiple' && deleteMultipleApplications) {
        await deleteMultipleApplications(Array.from(selectedIds));
        setSelectedIds(new Set());
        toast.success(t('common.success') || 'Muvaffaqiyatli o\'chirildi');
      }
      setDeleteConfirmModal(null);
    } catch (err) {
      toast.error(t('common.error') || 'O\'chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('appsAdmin.title')}</h1>
          <p className="text-slate-500 text-sm">{filtered.length} {t('appsAdmin.foundSuffix')}</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <Button
              variant="secondary"
              className="!bg-red-50 !text-red-600 hover:!bg-red-100 border-none"
              onClick={() => setDeleteConfirmModal({ type: 'multiple' })}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.deleteSelected') || 'Tanlanganlarni o\'chirish'} ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" className="hidden sm:flex bg-white" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            {t('appsAdmin.export')}
          </Button>
        </div>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('appsAdmin.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db]"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {(['all', 'submitted', 'under_review', 'info_required', 'approved', 'rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#1a56db] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s === 'all' ? t('appsAdmin.allFilter') : getApplicationStatusLabel(s, language)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#1a56db] focus:ring-[#1a56db]"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(paginated.map(app => app.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                {[
                  t('appsAdmin.colId'),
                  t('appsAdmin.colName'),
                  t('appsAdmin.colOrg'),
                  t('appsAdmin.colEvent'),
                  t('appsAdmin.colSubmitted'),
                  t('appsAdmin.colStatus'),
                  t('appsAdmin.colActions'),
                ].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((app) => (
                <tr key={app.id} className={`transition-colors ${selectedIds.has(app.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-[#1a56db] focus:ring-[#1a56db]"
                      checked={selectedIds.has(app.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedIds);
                        if (e.target.checked) newSet.add(app.id);
                        else newSet.delete(app.id);
                        setSelectedIds(newSet);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#1a56db] font-semibold">{app.applicationId}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800">{app.fullName}</div>
                    <div className="text-xs text-slate-400">{app.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{app.organization}</td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{app.eventTitle}</td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(app.submittedAt, language)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(app)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title={t('common.view')}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { 
                          setStatusModal(app); 
                          setNewStatus(app.status); 
                          setCommentTranslations({
                            uz: app.translations?.uz?.adminComment || app.adminComment || '',
                            ru: app.translations?.ru?.adminComment || '',
                            en: app.translations?.en?.adminComment || '',
                          });
                          setActiveTabLang('uz');
                        }}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                        title={t('appsAdmin.changeStatusTitle')}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmModal({ type: 'single', id: app.id })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" 
                        title={t('common.delete') || 'O\'chirish'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginated.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>{t('appsAdmin.notFound')}</p>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${page === p ? 'bg-[#1a56db] text-white' : 'hover:bg-white text-slate-600'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.applicationId} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3"><StatusBadge status={selected.status} /></div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {([
                [t('apply.fullName'), selected.fullName],
                [t('apply.email'), selected.email],
                [t('apply.phone'), selected.phone],
                [t('apply.organization'), selected.organization],
                [t('apply.position'), selected.position],
                [t('apply.country') || 'Mamlakat', selected.country],
                [t('apply.region'), selected.regionName],
                [t('apply.district'), selected.districtName],
                [t('apply.event'), selected.eventTitle],
                ['Qatnashish turi', selected.attendanceType === 'online' ? 'Online' : 'Offline'],
                [t('apply.presentationTitle'), selected.presentationTitle],
                [t('track.submittedDate'), formatDate(selected.submittedAt, language)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <dt className="text-xs text-slate-400 mb-0.5">{k}</dt>
                  <dd className="font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{t('apply.abstract')}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selected.abstract}</p>
            </div>
            {(selected.documentUrl || selected.passportUrl || selected.photoUrl) && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">{t('apply.docTitle')}</p>
                <div className="flex gap-4 flex-wrap">
                  {selected.documentUrl && (
                    <a href={selected.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
                      <Download className="w-4 h-4" /> {t('apply.docAbstract')}
                    </a>
                  )}
                  {selected.passportUrl && (
                    <a href={selected.passportUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
                      <Download className="w-4 h-4" /> {t('apply.docPassport')}
                    </a>
                  )}
                  {selected.photoUrl && (
                    <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
                      <Download className="w-4 h-4" /> {t('apply.docPhoto')}
                    </a>
                  )}
                </div>
              </div>
            )}
            {selected.adminComment && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-xs text-amber-600 font-medium mb-1">{t('appsAdmin.commentLabel')}</p>
                <p className="text-sm text-amber-800">{selected.adminComment}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title={t('appsAdmin.changeStatusTitle')} size="sm">
        {statusModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{statusModal.applicationId} — {statusModal.fullName}</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('appsAdmin.newStatusLabel')}</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              >
                {Object.entries(APPLICATION_STATUS_LABELS[language] || APPLICATION_STATUS_LABELS.uz).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">{t('appsAdmin.commentLabel')}</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={autoTranslating}
                  onClick={handleAutoTranslate}
                  icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                >
                  {t('eventsAdmin.autoTranslateBtn')}
                </Button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-3">
                {(['uz', 'ru', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTabLang(lang)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTabLang === lang
                        ? 'bg-white text-[#1a56db] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    {LANGUAGE_LABELS[lang]}
                    {lang !== 'uz' && commentTranslations[lang] && (
                      <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    )}
                  </button>
                ))}
              </div>

              <textarea
                value={commentTranslations[activeTabLang]}
                onChange={(e) => setCommentTranslations({ ...commentTranslations, [activeTabLang]: e.target.value })}
                rows={3}
                placeholder={`${t('appsAdmin.commentLabel')} (${LANGUAGE_LABELS[activeTabLang]})`}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleStatusChange} loading={savingStatus} className="flex-1 justify-center" icon={<CheckCircle className="w-4 h-4" />}>
                {t('common.save')}
              </Button>
              <Button variant="ghost" onClick={() => setStatusModal(null)} className="flex-1 justify-center">{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirmModal} onClose={() => !isDeleting && setDeleteConfirmModal(null)} title={t('common.confirmDelete') || 'O\'chirishni tasdiqlang'} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              {deleteConfirmModal?.type === 'multiple' 
                ? `Haqiqatan ham tanlangan ${selectedIds.size} ta arizani o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`
                : `Haqiqatan ham bu arizani o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDelete}
              loading={isDeleting}
              className="flex-1 justify-center !bg-red-600 hover:!bg-red-700"
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t('common.delete') || 'O\'chirish'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmModal(null)}
              disabled={isDeleting}
              className="flex-1 justify-center"
            >
              {t('common.cancel') || 'Bekor qilish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
