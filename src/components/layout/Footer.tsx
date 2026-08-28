import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../i18n';
import logoImage from '../../assets/logo_v2.png';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4 max-w-[80%]">
              <img src={logoImage} alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-300 leading-tight whitespace-pre-wrap">{t('brand.subtitle')}</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('home.description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5 text-sm">
              {([
                ['/', 'nav.home'],
                ['/events', 'nav.events'],
                ['/apply', 'nav.apply'],
                ['/track', 'nav.track'],
                ['/faq', 'nav.faq'],
              ] as [string, string][]).map(([to, key]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{t(key)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#0ea5e9] mt-0.5 shrink-0" />
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#0ea5e9] mt-0.5 shrink-0" />
                <span>{t('footer.email')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0ea5e9] mt-0.5 shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
