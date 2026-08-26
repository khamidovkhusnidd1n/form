import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Search, Award, Globe, FileText, Users, Calendar, ChevronRight, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { EventStatusBadge, EventTypeBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { events, applications } = useData();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/track?id=${trackId.trim()}`);
  };

  const activeEvents = events
    .filter(e => e.status === 'ongoing' || e.status === 'planned')
    .slice(0, 3)
    .map(e => getTranslatedContent(e, language));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f2560] to-[#1a56db] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=800&fit=crop&auto=format')] opacity-25 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/30 via-[#0f2560]/20 to-[#1a56db]/20" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#1a56db]/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >


            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('home.titleLine1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#38bdf8]">
                {t('home.titleLine2')}
              </span>{' '}
              {t('home.titleLine3')}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mb-10 leading-relaxed">
              {t('home.description')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/apply">
                <Button size="lg" className="bg-white text-[#1a56db] hover:bg-white/90 shadow-xl">
                  {t('home.apply')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {t('home.track')}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/10"
          >
            {[
              { icon: FileText, label: t('home.totalApplications'), value: applications.length, suffix: "" },
              { icon: Calendar, label: t('home.activeEvents'), value: events.filter(e => e.status !== 'completed').length, suffix: "" },
              { icon: Globe, label: t('home.countries'), value: 0, suffix: "" },
              { icon: Award, label: t('home.approved'), value: applications.length > 0 ? Math.round(applications.filter(a => a.status === 'approved').length / applications.length * 100) : 0, suffix: "%" },
            ].map(({ icon: Icon, label, value, suffix }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-[#60a5fa] mx-auto mb-2" />
                <div className="text-3xl font-bold"><AnimatedCounter target={value} suffix={suffix} /></div>
                <div className="text-sm text-white/60 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Track */}
      <section className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
            <p className="text-slate-600 text-sm font-medium shrink-0">{t('home.trackTitle')}</p>
            <form onSubmit={handleTrack} className="flex gap-2 w-full">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder={t('home.trackPlaceholder')}
                className="flex-1 rounded-[10px] border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] font-mono"
              />
              <Button type="submit" icon={<Search className="w-4 h-4" />}>{t('home.trackButton')}</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Active Events */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="flex-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{t('home.activeEventsTitle')}</h2>
              <p className="text-slate-500 text-sm sm:text-base">{t('home.activeEventsSubtitle')}</p>
            </div>
            <Link to="/events" className="flex items-center gap-1 text-[#1a56db] text-sm font-medium hover:gap-2 transition-all whitespace-nowrap">
              {t('home.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="overflow-hidden p-0">
                  <div className="relative h-44 bg-slate-200 overflow-hidden">
                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-3">
                      <EventStatusBadge status={event.status} />
                      <EventTypeBadge type={event.type} />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{event.shortDescription}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(event.startDate, language)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.applicationsCount} {t('events.applications')}</span>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="secondary" size="sm" className="w-full justify-center">
                        {t('home.viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">{t('home.howItWorks')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{t('home.howItWorksSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Calendar, title: t('home.step1Title'), desc: t('home.step1Desc') },
              { step: "02", icon: FileText, title: t('home.step2Title'), desc: t('home.step2Desc') },
              { step: "03", icon: Award, title: t('home.step3Title'), desc: t('home.step3Desc') },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < 2 && <div className="hidden md:block absolute top-10 left-[55%] right-[-5%] h-px bg-gradient-to-r from-[#1a56db]/30 to-transparent" />}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
                  <Icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-3 -right-3 text-3xl font-bold text-slate-100 font-mono opacity-50">{step}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1a56db] to-[#0ea5e9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">{t('home.ctaDescription')}</p>
          <Link to="/apply">
            <Button size="lg" className="bg-white text-[#1a56db] hover:bg-white/90 shadow-xl">
              {t('home.ctaButton')} <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
