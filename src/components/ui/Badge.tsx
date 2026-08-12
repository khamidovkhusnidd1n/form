import { cn, APPLICATION_STATUS_COLORS, getApplicationStatusLabel, getEventStatusLabel, getEventTypeLabel } from '../../lib/utils';
import type { ApplicationStatus, EventStatus, EventType } from '../../types';
import { useTranslation } from '../../i18n';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { language } = useTranslation();
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", APPLICATION_STATUS_COLORS[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", {
        'bg-blue-500': status === 'submitted',
        'bg-amber-500': status === 'under_review',
        'bg-orange-500': status === 'info_required',
        'bg-emerald-500': status === 'approved',
        'bg-red-500': status === 'rejected',
      })} />
      {getApplicationStatusLabel(status, language)}
    </span>
  );
}

const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  planned: "bg-sky-100 text-sky-700 border-sky-200",
  ongoing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { language } = useTranslation();
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", EVENT_STATUS_STYLES[status])}>
      {getEventStatusLabel(status, language)}
    </span>
  );
}

const EVENT_TYPE_STYLES: Record<string, string> = {
  conference: "bg-purple-100 text-purple-700 border-purple-200",
  forum: "bg-indigo-100 text-indigo-700 border-indigo-200",
  exhibition: "bg-pink-100 text-pink-700 border-pink-200",
  symposium: "bg-teal-100 text-teal-700 border-teal-200",
  workshop: "bg-orange-100 text-orange-700 border-orange-200",
  seminar: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export function EventTypeBadge({ type }: { type: EventType }) {
  const { language } = useTranslation();
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", EVENT_TYPE_STYLES[type] || "bg-gray-100 text-gray-600 border-gray-200")}>
      {getEventTypeLabel(type, language)}
    </span>
  );
}
