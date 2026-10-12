import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import ToastProvider from '../ui/Toast';
import { useAuth } from '../../store/authStore';
import { useTranslation, LANGUAGE_LABELS, type Language } from '../../i18n';
import './admin.css';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const closeLabel = { uz: 'Menyuni yopish', ru: 'Закрыть меню', en: 'Close menu' }[language];
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const titleKey = location.pathname.startsWith('/admin/check-in/') ? 'nav.applications'
    : ({ applications: 'nav.applications', events: 'nav.events', faq: 'nav.faq', administrators: 'nav.administrators', settings: 'nav.settings', updates: 'nav.updates' } as Record<string, string>)[location.pathname.split('/')[2]] || 'nav.dashboard';

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLElement>('button, a')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key === 'Tab') {
        const elements = sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keyboard); menuButton.current?.focus(); };
  }, [menuOpen]);
  
  // Faqat tizimga kirgan va ruxsati bor (admin) foydalanuvchilar kira oladi
  const isAdmin = user && ['super_admin', 'administrator', 'moderator'].includes(user.role);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <>
      <ToastProvider />
      <div className="admin-panel min-h-screen bg-[#f3f6fb]">
        {menuOpen && <button aria-label={closeLabel} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}
        <div ref={sidebar} id="admin-navigation" role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen || undefined} aria-label={t('footer.admin')}
          className={`${menuOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-[272px] lg:block`}>
          <AdminSidebar onClose={() => setMenuOpen(false)} />
        </div>
        <div className="min-w-0 lg:pl-[272px]" inert={menuOpen}>
          <header className="admin-header sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button ref={menuButton} type="button" aria-label={t('nav.admin')} aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"><Menu className="h-5 w-5" /></button>
              <div className="min-w-0"><p className="hidden text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400 sm:block">CENTRE FORM</p><p className="truncate text-sm font-semibold text-slate-800 sm:text-base">{t(titleKey)}</p></div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <select aria-label={t('nav.language')} value={language} onChange={e => setLanguage(e.target.value as Language)} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 sm:px-3">
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map(lang => <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>)}
              </select>
              <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><ExternalLink className="h-4 w-4" /><span className="hidden sm:inline">{t('nav.home')}</span><span className="sr-only sm:hidden">{t('nav.home')}</span></Link>
            </div>
          </header>
          <main id="admin-main" className="admin-content min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
