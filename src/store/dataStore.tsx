import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Event, FAQ, Application } from '../types';
import { MOCK_EVENTS, MOCK_FAQS, MOCK_APPLICATIONS } from '../lib/mockData';
import { apiClient } from '../api/client';
import { getStoredAuth } from './authStore';
import toast from 'react-hot-toast';

const STORAGE_KEYS = {
  EVENTS: 'centr_form_events_v2',
  FAQS: 'centr_form_faqs_v2',
  APPLICATIONS: 'centr_form_applications_v2',
};

function extractResults<T = any>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export function transformEvent(item: any): Event {
  let gallery: string[] = [];
  if (Array.isArray(item.gallery)) {
    gallery = item.gallery
      .map((g: any) => (g ? (typeof g === 'string' ? g : (g.image_url || g.imageUrl || '')) : ''))
      .filter(Boolean);
  } else if (typeof item.gallery === 'string' && item.gallery.trim() !== '') {
    gallery = [item.gallery];
  } else {
    gallery = [];
  }

  return {
    id: Number(item.id),
    title: item.title || '',
    type: item.type || 'conference',
    status: item.status || 'planned',
    shortDescription: item.short_description ?? item.shortDescription ?? '',
    fullDescription: item.full_description ?? item.fullDescription ?? '',
    startDate: item.start_date ?? item.startDate ?? '',
    endDate: item.end_date ?? item.endDate ?? '',
    registrationDeadline: item.registration_deadline ?? item.registrationDeadline ?? '',
    venue: item.venue || '',
    bannerUrl: item.banner_url ?? item.bannerUrl ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    gallery,
    programPdfUrl: item.program_pdf_url ?? item.programPdfUrl,
    participantLimit: item.participant_limit ?? item.participantLimit,
    registrationEnabled: item.registration_enabled ?? item.registrationEnabled ?? true,
    applicationsCount: item.applications_count ?? item.applicationsCount ?? 0,
    createdAt: item.created_at ?? item.createdAt ?? '',
    targetAudience: item.target_audience ?? item.targetAudience ?? '',
    registrationUrl: item.registration_url ?? item.registrationUrl ?? '',
    isActive: item.is_active ?? item.isActive ?? true,
    translations: item.translations,
  };
}

export function transformFAQ(item: any): FAQ {
  return {
    id: Number(item.id),
    question: item.question || '',
    answer: item.answer || '',
    order: item.order ?? 0,
    isActive: item.is_active ?? item.isActive ?? true,
    createdAt: item.created_at ?? item.createdAt ?? '',
    translations: item.translations,
  };
}

export function transformApplication(item: any): Application {
  const birthDateVal = item.birth_date ?? item.date_of_birth ?? item.birthDate ?? item.dateOfBirth ?? '';
  const workStudyPlaceVal = item.work_study_place ?? item.organization ?? item.workStudyPlace ?? item.organization ?? '';
  const passportSeriesVal = item.passport_series_number ?? item.passportSeriesNumber ?? item.passportUrl ?? item.passport_url ?? '';
  const createdAtVal = item.created_at ?? item.submitted_at ?? item.createdAt ?? item.submittedAt ?? '';

  return {
    id: Number(item.id),
    applicationId: item.application_id ?? item.applicationId ?? `APP-${item.id}`,
    fullName: item.full_name ?? item.fullName ?? '',
    dateOfBirth: birthDateVal,
    birthDate: birthDateVal,
    gender: item.gender || 'male',
    phone: item.phone || '',
    email: item.email || '',
    organization: workStudyPlaceVal,
    workStudyPlace: workStudyPlaceVal,
    position: item.position || '',
    country: item.country ?? 'O\'zbekiston',
    regionId: typeof item.region === 'number' ? item.region : (item.regionId ?? 1),
    regionName: item.region_name ?? item.regionName ?? (typeof item.region === 'string' ? item.region : ''),
    districtId: typeof item.district === 'number' ? item.district : (item.districtId ?? 1),
    districtName: item.district_name ?? item.districtName ?? (typeof item.district === 'string' ? item.district : ''),
    eventId: typeof item.event === 'number' ? item.event : (item.eventId ?? 1),
    eventTitle: item.event_title ?? item.eventTitle ?? '',
    presentationTitle: item.presentation_title ?? item.presentationTitle ?? '',
    abstract: item.abstract || '',
    documentUrl: item.document_url ?? item.documentUrl,
    passportUrl: item.passport_url ?? item.passportUrl,
    passportSeriesNumber: passportSeriesVal,
    photoUrl: item.photo_url ?? item.photoUrl,
    status: item.status || 'submitted',
    adminComment: item.admin_comment ?? item.adminComment,
    invitationPdfUrl: item.invitation_pdf_url ?? item.invitationPdfUrl,
    certificatePdfUrl: item.certificate_pdf_url ?? item.certificatePdfUrl,
    submittedAt: createdAtVal,
    createdAt: createdAtVal,
    updatedAt: item.updated_at ?? item.updatedAt ?? '',
    translations: item.translations,
  };
}

interface DataContextType {
  events: Event[];
  faqs: FAQ[];
  applications: Application[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: number) => void;
  addFaq: (faq: FAQ) => void;
  updateFaq: (faq: FAQ) => void;
  deleteFaq: (id: number) => void;
  reorderFaqs: (faqs: FAQ[]) => void;
  addApplication: (app: Application) => Promise<void> | void;
  updateApplication: (app: Application) => Promise<void> | void;
  updateApplicationStatus?: (appId: number | string, status: string, adminComment?: string, customTranslations?: Record<string, any>) => Promise<void> | void;
  deleteApplication?: (id: number) => Promise<void>;
  deleteMultipleApplications?: (ids: number[]) => Promise<void>;
  fetchEvents?: () => Promise<void>;
  fetchFaqs?: () => Promise<void>;
  fetchApplications?: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function getInitialData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(() => getInitialData(STORAGE_KEYS.EVENTS, MOCK_EVENTS));
  const [faqs, setFaqs] = useState<FAQ[]>(() => getInitialData(STORAGE_KEYS.FAQS, MOCK_FAQS));
  const [applications, setApplications] = useState<Application[]>(() =>
    getInitialData(STORAGE_KEYS.APPLICATIONS, MOCK_APPLICATIONS)
  );

  const fetchEvents = useCallback(async () => {
    try {
      const res = await apiClient.get('/events/');
      const rawList = extractResults(res.data);
      setEvents(rawList.map(transformEvent));
    } catch (err) {
      console.warn('Failed to fetch events from API, using fallback data:', err);
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await apiClient.get('/faqs/');
      const rawList = extractResults(res.data);
      setFaqs(rawList.map(transformFAQ));
    } catch (err) {
      console.warn('Failed to fetch FAQs from API, using fallback data:', err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    const { token } = getStoredAuth();
    if (!token) return;
    try {
      const res = await apiClient.get('/applications/admin/');
      const rawList = extractResults(res.data);
      setApplications(rawList.map(transformApplication));
    } catch (err) {
      console.warn('Failed to fetch applications from API, using fallback data:', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchFaqs();
    fetchApplications();
  }, [fetchEvents, fetchFaqs, fetchApplications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch {
      // quota exception
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    } catch {
      // quota exception
    }
  }, [faqs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch {
      // quota exception
    }
  }, [applications]);

  const addEvent = async (e: Event) => {
    setEvents((prev) => [e, ...prev]);
    try {
      const formData = new FormData();
      formData.append('title', e.title);
      formData.append('type', e.type);
      formData.append('status', e.status);
      formData.append('short_description', e.shortDescription);
      formData.append('full_description', e.fullDescription);
      formData.append('start_date', e.startDate);
      formData.append('end_date', e.endDate);
      formData.append('registration_deadline', e.registrationDeadline);
      formData.append('venue', e.venue);
      formData.append('registration_enabled', String(e.registrationEnabled));
        if (e.translations) formData.append('translations', JSON.stringify(e.translations));
      if (e.participantLimit) formData.append('participant_limit', String(e.participantLimit));
      if (e.bannerFile) formData.append('banner', e.bannerFile);

      await apiClient.post('/events/admin/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchEvents();
    } catch (err) {
      console.warn('Failed to create event on API', err);
    }
  };

  const updateEvent = async (e: Event) => {
    setEvents((prev) => prev.map((item) => (item.id === e.id ? e : item)));
    try {
      const formData = new FormData();
      formData.append('title', e.title);
      formData.append('type', e.type);
      formData.append('status', e.status);
      formData.append('short_description', e.shortDescription);
      formData.append('full_description', e.fullDescription);
      formData.append('start_date', e.startDate);
      formData.append('end_date', e.endDate);
      formData.append('registration_deadline', e.registrationDeadline);
      formData.append('venue', e.venue);
      formData.append('registration_enabled', String(e.registrationEnabled));
        if (e.translations) formData.append('translations', JSON.stringify(e.translations));
      if (e.participantLimit) formData.append('participant_limit', String(e.participantLimit));
      if (e.bannerFile) formData.append('banner', e.bannerFile);

      await apiClient.patch(`/events/admin/${e.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.warn('Failed to update event on API', err);
    }
  };

  const deleteEvent = async (id: number) => {
    const previousEvents = [...events];
    setEvents((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiClient.delete(`/events/admin/${id}/`);
    } catch (err: any) {
      console.warn('Failed to delete event on API', err);
      setEvents(previousEvents);
      if (err?.response?.status === 500 || err?.response?.data?.detail?.includes('ProtectedError')) {
        toast.error('Tadbirni o\'chirish imkonsiz! Unga biriktirilgan arizalar mavjud.');
      } else {
        toast.error('Tadbirni o\'chirishda xatolik yuz berdi.');
      }
    }
  };

  const addFaq = async (f: FAQ) => {
    setFaqs((prev) => [...prev, f]);
    try {
      await apiClient.post('/faqs/admin/', {
        question: f.question,
        answer: f.answer,
        order: f.order,
        is_active: f.isActive,
          translations: f.translations || {},
      });
      fetchFaqs();
    } catch (err) {
      console.warn('Failed to create faq on API', err);
    }
  };

  const updateFaq = async (f: FAQ) => {
    setFaqs((prev) => prev.map((item) => (item.id === f.id ? f : item)));
    try {
      await apiClient.patch(`/faqs/admin/${f.id}/`, {
        question: f.question,
        answer: f.answer,
        order: f.order,
        is_active: f.isActive,
          translations: f.translations || {},
      });
    } catch (err) {
      console.warn('Failed to update faq on API', err);
    }
  };

  const deleteFaq = async (id: number) => {
    setFaqs((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiClient.delete(`/faqs/admin/${id}/`);
    } catch (err) {
      console.warn('Failed to delete faq on API', err);
    }
  };

  const reorderFaqs = (newFaqs: FAQ[]) => setFaqs(newFaqs);

  const addApplication = async (app: Application) => {
    setApplications((prev) => [app, ...prev]);

    const formData = new FormData();
    formData.append('event', String(app.eventId));
    formData.append('full_name', app.fullName);
    formData.append('date_of_birth', app.dateOfBirth);
    formData.append('gender', app.gender);
    formData.append('phone', app.phone);
    formData.append('email', app.email);
    formData.append('organization', app.organization);
    formData.append('position', app.position);
    formData.append('country', app.country);
    formData.append('region', app.regionName || String(app.regionId));
    formData.append('district', app.districtName || String(app.districtId));
    formData.append('presentation_title', app.presentationTitle);
    formData.append('abstract', app.abstract);

    if (app.documentFile) formData.append('document', app.documentFile);
    if (app.passportFile) formData.append('passport', app.passportFile);
    if (app.photoFile) formData.append('photo', app.photoFile);

    try {
      const res = await apiClient.post('/applications/submit/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchApplications();
      return res.data.application_id;
    } catch (err) {
      console.warn('Failed to submit application to backend API:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (appId: number | string, status: string, adminComment?: string, customTranslations?: Record<string, any>) => {
    let translationsToSave = customTranslations;

    setApplications((prev) =>
      prev.map((item) =>
        item.id === Number(appId) || item.applicationId === String(appId)
          ? {
              ...item,
              status: status as any,
              adminComment: adminComment ?? item.adminComment,
              translations: translationsToSave ? { ...item.translations, ...translationsToSave } : item.translations,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    try {
      await apiClient.patch(`/applications/${appId}/status/`, {
        status,
        admin_comment: adminComment,
        translations: translationsToSave,
      });
    } catch (err) {
      try {
        await apiClient.patch(`/applications/admin/${appId}/status/`, {
          status,
          admin_comment: adminComment,
          translations: translationsToSave,
        });
      } catch (fallbackErr) {
        console.warn('Failed to update status on both endpoints', fallbackErr);
        throw fallbackErr;
      }
    }
  };

  const deleteApplication = async (id: number) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiClient.delete(`/applications/admin/${id}/`);
    } catch (err) {
      console.error('Failed to delete application', err);
      throw err;
    }
  };

  const deleteMultipleApplications = async (ids: number[]) => {
    setApplications((prev) => prev.filter((item) => !ids.includes(item.id)));
    try {
      await apiClient.delete(`/applications/admin/bulk-delete/`, { data: { ids } });
    } catch (err) {
      console.error('Failed to bulk delete applications', err);
      throw err;
    }
  };

  const updateApplication = async (app: Application) => {
    setApplications((prev) => prev.map((item) => (item.id === app.id ? app : item)));

    try {
      await apiClient.patch(`/applications/${app.id}/status/`, {
        status: app.status,
        admin_comment: app.adminComment,
        translations: app.translations,
      });
    } catch (err) {
      try {
        await apiClient.patch(`/applications/admin/${app.id}/status/`, {
          status: app.status,
          admin_comment: app.adminComment,
          translations: app.translations,
        });
      } catch (fallbackErr) {
        console.warn('Failed to update application on backend API, using local state:', err, fallbackErr);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        events,
        faqs,
        applications,
        addEvent,
        updateEvent,
        deleteEvent,
        addFaq,
        updateFaq,
        deleteFaq,
        reorderFaqs,
        addApplication,
        updateApplication,
        updateApplicationStatus,
        deleteApplication,
        deleteMultipleApplications,
        fetchEvents,
        fetchFaqs,
        fetchApplications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
