import { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { EventStatusBadge, EventTypeBadge } from '../../components/ui/Badge';
import { formatDate, EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '../../lib/utils';
import type { Event, EventType, EventFormat, EventStatus } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation, LANGUAGE_LABELS, type Language } from '../../i18n';
import { useData } from '../../store/dataStore';
import { translateContentToAllLanguages, getTranslatedContent } from '../../lib/translationService';

const EVENT_FORMAT_LABELS: Record<string, Record<string, string>> = {
  uz: { online: 'Online', offline: 'Offline', hybrid: 'Gibrid (Online/Offline)' },
  ru: { online: 'Онлайн', offline: 'Офлайн', hybrid: 'Гибрид (Онлайн/Офлайн)' },
  en: { online: 'Online', offline: 'Offline', hybrid: 'Hybrid (Online/Offline)' },
};

const EMPTY_EVENT: Partial<Event> = {
  title: '',
  type: 'conference',
  format: 'offline',
  status: 'planned',
  shortDescription: '',
  fullDescription: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  venue: '',
  registrationEnabled: true,
};

export default function EventsAdminPage() {
  const { t, language } = useTranslation();
  const { events, addEvent, updateEvent, deleteEvent } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Event>>(EMPTY_EVENT);
  const [activeTabLang, setActiveTabLang] = useState<Language>('uz');
  const [isNew, setIsNew] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [autoTranslating, setAutoTranslating] = useState(false);

  const openCreate = () => {
    setEditing(EMPTY_EVENT);
    setActiveTabLang('uz');
    setIsNew(true);
    setModalOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditing({ ...e });
    setActiveTabLang('uz');
    setIsNew(false);
    setModalOpen(true);
  };

  const handleAutoTranslate = async () => {
    if (!editing.title && !editing.shortDescription && !editing.fullDescription) {
      toast.error(t('common.error') || 'Xatolik');
      return;
    }

    setAutoTranslating(true);
    try {
      const sourceContent = {
        title: editing.title || '',
        shortDescription: editing.shortDescription || '',
        fullDescription: editing.fullDescription || '',
        venue: editing.venue || '',
      };

      const result = await translateContentToAllLanguages(sourceContent, 'uz');
      setEditing((ed) => ({
        ...ed,
        translations: result.translations,
      }));
      toast.success(t('common.autoTranslatedSuccess'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setAutoTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!editing.title || !editing.startDate) {
      toast.error(t('common.error') || 'Xatolik');
      return;
    }

    // Ensure translations exist for all languages automatically
    let translationsObj = editing.translations;
    if (!translationsObj || !translationsObj.ru || !translationsObj.en) {
      const sourceContent = {
        title: editing.title || '',
        shortDescription: editing.shortDescription || '',
        fullDescription: editing.fullDescription || '',
        venue: editing.venue || '',
      };
      const autoRes = await translateContentToAllLanguages(sourceContent, 'uz');
      translationsObj = autoRes.translations;
    }

    if (isNew) {
      const newEvt: Event = {
        ...editing,
        id: Date.now(),
        applicationsCount: 0,
        gallery: [],
        createdAt: new Date().toISOString(),
        bannerUrl: editing.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=500&fit=crop&auto=format',
        translations: translationsObj,
      } as Event;
      addEvent(newEvt);
      toast.success(t('common.success'));
    } else {
      const updatedEvt: Event = {
        ...editing,
        translations: translationsObj,
      } as Event;
      updateEvent(updatedEvt);
      toast.success(t('common.success'));
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    deleteEvent(id);
    setDeleteId(null);
    toast.success(t('common.success'));
  };

  const getFieldValue = (key: 'title' | 'shortDescription' | 'fullDescription' | 'venue') => {
    if (activeTabLang === 'uz') {
      return (editing[key] as string) || '';
    }
    return (editing.translations?.[activeTabLang]?.[key] as string) || '';
  };

  const setFieldValue = (key: 'title' | 'shortDescription' | 'fullDescription' | 'venue', val: string) => {
    if (activeTabLang === 'uz') {
      setEditing((ed) => ({ ...ed, [key]: val }));
    } else {
      setEditing((ed) => ({
        ...ed,
        translations: {
          ...ed.translations,
          [activeTabLang]: {
            ...ed.translations?.[activeTabLang],
            [key]: val,
          },
        },
      }));
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('eventsAdmin.title')}</h1>
          <p className="text-slate-500 text-sm">{events.length} {t('eventsAdmin.countSuffix')}</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{t('eventsAdmin.addBtn')}</Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {[
                t('eventsAdmin.colTitle'),
                t('eventsAdmin.colType'),
                t('eventsAdmin.colStatus'),
                t('eventsAdmin.colStart'),
                t('eventsAdmin.colDeadline'),
                t('eventsAdmin.colApps'),
                t('eventsAdmin.colActions'),
              ].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {events.map((rawEvent) => {
              const event = getTranslatedContent(rawEvent, language);
              return (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-800 max-w-xs line-clamp-2">{event.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{event.venue}</div>
                  </td>
                  <td className="px-4 py-4"><EventTypeBadge type={event.type} /></td>
                  <td className="px-4 py-4"><EventStatusBadge status={event.status} /></td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{formatDate(event.startDate, language)}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{formatDate(event.registrationDeadline, language)}</td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-700">{event.applicationsCount}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(rawEvent)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(event.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? t('eventsAdmin.modalCreateTitle') : t('eventsAdmin.modalEditTitle')} size="xl">
        <div className="space-y-4 text-sm">

          {/* Language Tabs & Auto-translate Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex gap-1">
              {(['uz', 'ru', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTabLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTabLang === lang
                      ? 'bg-[#1a56db] text-white shadow'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 inline mr-1" />
                  {LANGUAGE_LABELS[lang]}
                  {lang !== 'uz' && editing.translations?.[lang]?.title && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  )}
                </button>
              ))}
            </div>

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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('eventsAdmin.titleLabel')} ({LANGUAGE_LABELS[activeTabLang]})
              </label>
              <input
                value={getFieldValue('title')}
                onChange={(e) => setFieldValue('title', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.typeLabel')}</label>
              <select
                value={(editing.type as string) || 'conference'}
                onChange={(e) => setEditing(ed => ({ ...ed, type: e.target.value as EventType }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              >
                {Object.entries(EVENT_TYPE_LABELS[language] || EVENT_TYPE_LABELS.uz).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.statusLabel')}</label>
              <select
                value={(editing.status as string) || 'planned'}
                onChange={(e) => setEditing(ed => ({ ...ed, status: e.target.value as EventStatus }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              >
                {Object.entries(EVENT_STATUS_LABELS[language] || EVENT_STATUS_LABELS.uz).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
              <select
                value={(editing.format as string) || 'offline'}
                onChange={(e) => setEditing(ed => ({ ...ed, format: e.target.value as EventFormat }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              >
                {Object.entries(EVENT_FORMAT_LABELS[language] || EVENT_FORMAT_LABELS.uz).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.startLabel')}</label>
              <input
                type="date"
                value={editing.startDate || ''}
                onChange={(e) => setEditing(ed => ({ ...ed, startDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.endLabel')}</label>
              <input
                type="date"
                value={editing.endDate || ''}
                onChange={(e) => setEditing(ed => ({ ...ed, endDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.deadlineLabel')}</label>
              <input
                type="date"
                value={editing.registrationDeadline || ''}
                onChange={(e) => setEditing(ed => ({ ...ed, registrationDeadline: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.limitLabel')}</label>
              <input
                type="number"
                value={editing.participantLimit || ''}
                onChange={(e) => setEditing(ed => ({ ...ed, participantLimit: Number(e.target.value) || undefined }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('eventsAdmin.venueLabel')} ({LANGUAGE_LABELS[activeTabLang]})
              </label>
              <input
                value={getFieldValue('venue')}
                onChange={(e) => setFieldValue('venue', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('eventsAdmin.shortDescLabel')} ({LANGUAGE_LABELS[activeTabLang]})
              </label>
              <textarea
                value={getFieldValue('shortDescription')}
                onChange={(e) => setFieldValue('shortDescription', e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('eventsAdmin.fullDescLabel')} ({LANGUAGE_LABELS[activeTabLang]})
              </label>
              <textarea
                value={getFieldValue('fullDescription')}
                onChange={(e) => setFieldValue('fullDescription', e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('eventsAdmin.bannerLabel') || 'Rasm (Banner)'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditing(ed => ({ ...ed, bannerFile: e.target.files![0] }));
                  }
                }}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="regEnabled"
                checked={!!editing.registrationEnabled}
                onChange={(e) => setEditing(ed => ({ ...ed, registrationEnabled: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-[#1a56db]"
              />
              <label htmlFor="regEnabled" className="text-sm font-medium text-slate-700">{t('eventsAdmin.regOpenLabel')}</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button onClick={handleSave} className="flex-1 justify-center">{t('common.save')}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 justify-center">{t('common.cancel')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title={t('faqAdmin.deleteTitle')} size="sm">
        <p className="text-slate-600 mb-6">{t('common.confirmDelete')}</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => handleDelete(deleteId!)} className="flex-1 justify-center">{t('common.delete')}</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1 justify-center">{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  );
}
