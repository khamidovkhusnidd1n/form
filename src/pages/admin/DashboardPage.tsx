import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { MOCK_STATS } from '../../lib/mockData';
import { useAuth } from '../../store/authStore';
import { apiClient } from '../../api/client';
import type { DashboardStats } from '../../types';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';

const MONTHLY_DATA_KEYS = [
  { month: "Mar", arizalar: 18 }, { month: "Apr", arizalar: 35 }, { month: "May", arizalar: 52 },
  { month: "Iyn", arizalar: 48 }, { month: "Iyl", arizalar: 71 }, { month: "Avg", arizalar: 88 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { events, applications } = useData();

  const [stats, setStats] = useState<DashboardStats>(() => ({
    ...MOCK_STATS,
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status !== 'completed').length,
    totalApplications: applications.length,
  }));
  const [monthlyStats, setMonthlyStats] = useState(MONTHLY_DATA_KEYS);
  const [regionStats, setRegionStats] = useState<{region: string, count: number}[]>([]);
  const [loading, setLoading] = useState(false);  useEffect(() => {
    let isMounted = true;
    apiClient.get('/dashboard/')
      .then(({ data }) => {
        if (!isMounted) return;
        setStats({
          totalEvents: data.events ?? events.length,
          activeEvents: data.active_events ?? events.filter(e => e.status !== 'completed').length,
          totalApplications: data.total_applications ?? applications.length,
          todayApplications: data.today_applications ?? 0,
          approved: data.approved ?? 0,
          rejected: data.rejected ?? 0,
          pending: data.pending ?? 0,
          underReview: data.under_review ?? 0,
          infoRequired: data.info_required ?? 0,
        });
        if (data.monthly_applications && data.monthly_applications.length > 0) {
          setMonthlyStats(data.monthly_applications);
        }
        if (data.by_region) {
          setRegionStats(data.by_region.map((r: any) => ({ region: r.region || 'Boshqa', count: r.count })));
        }
      })
      .catch(() => {
        if (isMounted) {
          setStats({
            ...MOCK_STATS,
            totalEvents: events.length,
            activeEvents: events.filter(e => e.status !== 'completed').length,
            totalApplications: applications.length,
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [events, applications]);

  const PIE_DATA = useMemo(() => [
    { name: t('dash.pending'), value: stats.pending, color: "#3b82f6" },
    { name: t('dash.underReview'), value: stats.underReview, color: "#f59e0b" },
    { name: t('dash.approved'), value: stats.approved, color: "#10b981" },
    { name: t('dash.rejected'), value: stats.rejected, color: "#ef4444" },
    { name: t('dash.infoRequired'), value: stats.infoRequired, color: "#f97316" },
  ], [stats, t]);

  const calcPercent = (val: number) => {
    if (stats.totalApplications === 0) return '0%';
    return ((val / stats.totalApplications) * 100).toFixed(1) + '%';
  };

  const STAT_CARDS = useMemo(() => [
    { label: t('dash.totalEvents'), value: stats.totalEvents, icon: Calendar, color: "bg-blue-50 text-blue-600", change: "" },
    { label: t('dash.activeEvents'), value: stats.activeEvents, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", change: "" },
    { label: t('dash.totalApps'), value: stats.totalApplications, icon: FileText, color: "bg-purple-50 text-purple-600", change: "" },
    { label: t('dash.todayApps'), value: stats.todayApplications, icon: Clock, color: "bg-amber-50 text-amber-600", change: "" },
    { label: t('dash.approved'), value: stats.approved, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", change: calcPercent(stats.approved) },
    { label: t('dash.rejected'), value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-600", change: calcPercent(stats.rejected) },
    { label: t('dash.pending'), value: stats.pending, icon: Clock, color: "bg-blue-50 text-blue-600", change: calcPercent(stats.pending) },
    { label: t('dash.infoRequired'), value: stats.infoRequired, icon: AlertCircle, color: "bg-orange-50 text-orange-600", change: calcPercent(stats.infoRequired) },
  ], [stats, t]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{t('dash.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dash.welcome')}, {user?.fullName.split(' ')[0]}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {change && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">{change}</span>}
            </div>
            <p className="text-2xl font-bold text-slate-800">{loading ? '—' : value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.monthlyChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyStats} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(v) => [v as number, t('nav.applications')]}
              />
              <Bar dataKey="arizalar" fill="#1a56db" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.statusChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v as number, n as string]} contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {PIE_DATA.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-600">{name}</span>
                </div>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-6">Viloyatlar va Davlatlar bo'yicha ishtirokchilar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionStats} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="region" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
