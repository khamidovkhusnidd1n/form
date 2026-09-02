import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, HelpCircle, Users, LogOut, GraduationCap, ChevronRight, Settings, Sparkles } from 'lucide-react';
import { cn, getRoleLabel } from '../../lib/utils';
import { useAuth } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import logoImage from '../../assets/logo_v2.png';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/admin/applications', icon: FileText, key: 'nav.applications' },
  { to: '/admin/events', icon: Calendar, key: 'nav.events' },
  { to: '/admin/faq', icon: HelpCircle, key: 'nav.faq' },
  { to: '/admin/administrators', icon: Users, key: 'nav.administrators' },
  { to: '/admin/settings', icon: Settings, key: 'nav.settings' },
  { to: '/admin/updates', icon: Sparkles, key: 'nav.updates' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">CENTR FORM</div>
            <div className="text-[10px] text-slate-400">{t('footer.admin')}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-[#1a56db] text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t(key)}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center text-white text-sm font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.fullName.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400">{getRoleLabel(user.role, language)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </aside>
  );
}
