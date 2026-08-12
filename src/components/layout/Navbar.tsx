import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n';
import { LANGUAGE_LABELS, type Language } from '../../i18n';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/events', key: 'nav.events' },
  { to: '/apply', key: 'nav.apply' },
  { to: '/track', key: 'nav.track' },
  { to: '/faq', key: 'nav.faq' },
] as const;

const LANGUAGES: Language[] = ['uz', 'ru', 'en'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useTranslation();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0 mr-2 lg:mr-4">
            <img src="/logo_v2.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />
            <div className="hidden sm:block min-w-0">
              <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-semibold text-[#1a3b8b] leading-tight line-clamp-3">{t('brand.subtitle')}</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  location.pathname === link.to
                    ? "bg-[#e8f0fe] text-[#1a56db]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {LANGUAGE_LABELS[language]}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-lg bg-white border border-slate-200 shadow-lg z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors",
                        language === lang
                          ? "bg-[#e8f0fe] text-[#1a56db] font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium",
                location.pathname === link.to ? "bg-[#e8f0fe] text-[#1a56db]" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Til</p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setLanguage(lang);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium",
                  language === lang
                    ? "bg-[#e8f0fe] text-[#1a56db]"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
