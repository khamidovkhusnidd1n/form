import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Globe, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import type { FAQ } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation, LANGUAGE_LABELS, type Language } from '../../i18n';
import { useData } from '../../store/dataStore';
import { translateContentToAllLanguages, getTranslatedContent } from '../../lib/translationService';

export default function FAQAdminPage() {
  const { t, language } = useTranslation();
  const { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FAQ>>({});
  const [activeTabLang, setActiveTabLang] = useState<Language>('uz');
  const [isNew, setIsNew] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [autoTranslating, setAutoTranslating] = useState(false);

  const openCreate = () => {
    setEditing({ question: '', answer: '', order: faqs.length + 1 });
    setActiveTabLang('uz');
    setIsNew(true);
    setModalOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing({ ...f });
    setActiveTabLang('uz');
    setIsNew(false);
    setModalOpen(true);
  };

  const handleAutoTranslate = async () => {
    if (!editing.question && !editing.answer) {
      toast.error(t('common.error') || 'Xatolik');
      return;
    }

    setAutoTranslating(true);
    try {
      const sourceContent = {
        question: editing.question || '',
        answer: editing.answer || '',
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
    if (!editing.question || !editing.answer) {
      toast.error(t('common.error') || 'Xatolik');
      return;
    }

    let translationsObj = editing.translations;
    if (!translationsObj || !translationsObj.ru || !translationsObj.en) {
      const sourceContent = {
        question: editing.question || '',
        answer: editing.answer || '',
      };
      const autoRes = await translateContentToAllLanguages(sourceContent, 'uz');
      translationsObj = autoRes.translations;
    }

    if (isNew) {
      const newFaq: FAQ = {
        ...editing,
        id: Date.now(),
        order: faqs.length + 1,
        translations: translationsObj,
      } as FAQ;
      addFaq(newFaq);
      toast.success(t('common.success'));
    } else {
      const updatedFaqItem: FAQ = {
        ...editing,
        translations: translationsObj,
      } as FAQ;
      updateFaq(updatedFaqItem);
      toast.success(t('common.success'));
    }
    setModalOpen(false);
  };

  const move = (id: number, dir: -1 | 1) => {
    const idx = faqs.findIndex(f => f.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= faqs.length) return;
    const next = [...faqs];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    reorderFaqs(next.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handleDelete = (id: number) => {
    deleteFaq(id);
    setDeleteId(null);
    toast.success(t('common.success'));
  };

  const getFieldValue = (key: 'question' | 'answer') => {
    if (activeTabLang === 'uz') {
      return (editing[key] as string) || '';
    }
    return (editing.translations?.[activeTabLang]?.[key] as string) || '';
  };

  const setFieldValue = (key: 'question' | 'answer', val: string) => {
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
          <h1 className="text-2xl font-bold text-slate-800">{t('faqAdmin.title')}</h1>
          <p className="text-slate-500 text-sm">{faqs.length} {t('faqAdmin.countSuffix')}</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{t('faqAdmin.addBtn')}</Button>
      </div>

      <div className="space-y-3">
        {faqs.map((rawFaq, i) => {
          const faq = getTranslatedContent(rawFaq, language);
          return (
            <Card key={faq.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 shrink-0 mt-1">
                  <button onClick={() => move(faq.id, -1)} disabled={i === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </button>
                  <button onClick={() => move(faq.id, 1)} disabled={i === faqs.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 mb-1">{faq.question}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(rawFaq)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(faq.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? t('faqAdmin.createTitle') : t('faqAdmin.editTitle')} size="md">
        <div className="space-y-4">

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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('faqAdmin.questionLabel')} ({LANGUAGE_LABELS[activeTabLang]})
            </label>
            <input
              value={getFieldValue('question')}
              onChange={(e) => setFieldValue('question', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
              placeholder="Savol matnini kiriting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('faqAdmin.answerLabel')} ({LANGUAGE_LABELS[activeTabLang]})
            </label>
            <textarea
              value={getFieldValue('answer')}
              onChange={(e) => setFieldValue('answer', e.target.value)}
              rows={5}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 resize-none"
              placeholder="Javob matnini kiriting"
            />
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button onClick={handleSave} className="flex-1 justify-center">{t('common.save')}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 justify-center">{t('common.cancel')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title={t('faqAdmin.deleteTitle')} size="sm">
        <p className="text-slate-600 mb-6">{t('faqAdmin.deleteText')}</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => handleDelete(deleteId!)} className="flex-1 justify-center">{t('common.delete')}</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1 justify-center">{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  );
}
