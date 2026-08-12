import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EventStatusBadge, EventTypeBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import type { EventStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { useData } from '../../store/dataStore';
import { getTranslatedContent } from '../../lib/translationService';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventStatus | 'all'>('all');
  const { t, language } = useTranslation();
  const { events } = useData();

  const TABS: { key: EventStatus | 'all'; labelKey: string }[] = [
    { key: 'all', labelKey: 'events.all' },
    { key: 'ongoing', labelKey: 'events.ongoing' },
    { key: 'planned', labelKey: 'events.planned' },
    { key: 'completed', labelKey: 'events.completed' },
  ];

  const filtered = (activeTab === 'all' ? events : events.filter(e => e.status === activeTab))
    .map(e => getTranslatedContent(e, language));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-[#1a56db] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-4xl font-bold mb-3">{t('events.title')}</h1>
          <p className="text-white/70">{t('events.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit flex-wrap">
          {TABS.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === key ? 'bg-[#1a56db] text-white shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t(labelKey)}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20' : 'bg-slate-100'}`}>
                {key === 'all' ? events.length : events.filter(e => e.status === key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card hover className="overflow-hidden p-0 h-full flex flex-col">
                <div className="relative h-48 bg-slate-200 overflow-hidden shrink-0">
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    <EventTypeBadge type={event.type} />
                    <EventStatusBadge status={event.status} />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 leading-snug mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">{event.shortDescription}</p>
                  <div className="space-y-2 mb-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#1a56db]" />
                      {formatDate(event.startDate, language)} — {formatDate(event.endDate, language)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#1a56db]" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {t('events.deadline')}: {formatDate(event.registrationDeadline, language)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {event.applicationsCount} {t('events.applications')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">{t('events.details')}</Button>
                    </Link>
                    {event.registrationEnabled && (
                      <Link to={`/apply?event=${event.id}`} className="flex-1">
                        <Button size="sm" className="w-full justify-center">{t('events.apply')} <ArrowRight className="w-3.5 h-3.5" /></Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
