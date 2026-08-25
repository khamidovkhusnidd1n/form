import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, Download, ChevronLeft, Monitor, Building2, Layers } from 'lucide-react';
import Button from '../../components/ui/Button';
import { EventStatusBadge, EventTypeBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';

export default function EventDetailPage() {
  let id = '';
  try {
    id = useParams().id || '';
  } catch (e) {
    id = window.location.pathname.split('/').pop() || '';
  }
  const { t, language } = useTranslation();
  const { events } = useData();

  const rawEvent = events.find(e => e.id === Number(id));
  const event = rawEvent ? getTranslatedContent(rawEvent, language) : null;

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">{t('events.notFound')}</h2>
        <Link to="/events"><Button variant="outline">{t('home.viewAll')}</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-72 md:h-96 bg-slate-800">
        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" />{t('events.title')}
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <EventTypeBadge type={event.type} />
              <EventStatusBadge status={event.status} />
              {event.format && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  event.format === 'online' ? 'bg-emerald-500/20 text-emerald-200' :
                  event.format === 'hybrid' ? 'bg-purple-500/20 text-purple-200' :
                  'bg-blue-500/20 text-blue-200'
                }`}>
                  {event.format === 'online' ? <Monitor className="w-3 h-3" /> : event.format === 'hybrid' ? <Layers className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {event.format === 'online' ? 'Online' : event.format === 'hybrid' ? 'Gibrid' : 'Offline'}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight max-w-3xl">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-4">{t('events.about')}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{event.fullDescription}</p>
            </div>

            {event.gallery && event.gallery.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 text-lg mb-4">{t('events.gallery')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.gallery.map((url, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">{t('events.detailsTitle')}</h3>
              <dl className="space-y-4 text-sm">
                {[
                  { icon: Calendar, label: t('events.startDate'), value: formatDate(event.startDate, language) },
                  { icon: Calendar, label: t('events.endDate'), value: formatDate(event.endDate, language) },
                  { icon: Clock, label: t('events.registrationDeadline'), value: formatDate(event.registrationDeadline, language) },
                  { icon: MapPin, label: t('events.venue'), value: event.venue },
                  { icon: Users, label: t('home.totalApplications'), value: `${event.applicationsCount} ${t('events.applications')}` },
                  ...(event.participantLimit ? [{ icon: Users, label: t('events.participantLimit'), value: `${event.participantLimit}` }] : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <Icon className="w-4 h-4 text-[#1a56db] shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
                      <dd className="font-medium text-slate-700">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-3">
              {event.registrationEnabled ? (
                <Link to={`/apply?event=${event.id}`} className="block">
                  <Button className="w-full justify-center" size="lg">
                    {t('home.apply')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="bg-slate-100 rounded-xl p-4 text-center text-sm text-slate-500">
                  {t('events.regClosed')}
                </div>
              )}
              {event.programPdfUrl && (
                <Button variant="outline" className="w-full justify-center" icon={<Download className="w-4 h-4" />}>
                  {t('events.downloadProgram')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
