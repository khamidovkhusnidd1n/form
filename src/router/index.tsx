import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ParticipantLoginPage from '../pages/public/auth/LoginPage';
import ParticipantRegisterPage from '../pages/public/auth/RegisterPage';
import CertificateCheckPage from '../pages/public/CertificateCheckPage';
import UserCabinet from '../pages/cabinet/UserCabinet';
import AdminLayout from '../components/layout/AdminLayout';
import ErrorElement from '../components/ui/ErrorElement';
import HomePage from '../pages/public/HomePage';
import EventsPage from '../pages/public/EventsPage';
import EventDetailPage from '../pages/public/EventDetailPage';
import ApplicationFormPage from '../pages/public/ApplicationFormPage';
import TrackApplicationPage from '../pages/public/TrackApplicationPage';
import FAQPage from '../pages/public/FAQPage';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ApplicationsPage from '../pages/admin/ApplicationsPage';
import EventsAdminPage from '../pages/admin/EventsAdminPage';
import FAQAdminPage from '../pages/admin/FAQAdminPage';
import AdministratorsPage from '../pages/admin/AdministratorsPage';
import SettingsAdminPage from '../pages/admin/SettingsAdminPage';
import UpdatesPage from '../pages/admin/UpdatesPage';
import CheckInPage from '../pages/admin/CheckInPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'apply', element: <ApplicationFormPage /> },
      { path: 'track', element: <TrackApplicationPage /> },
      { path: 'login', element: <ParticipantLoginPage /> },
      { path: 'register', element: <ParticipantRegisterPage /> },
      { path: 'certificate-check', element: <CertificateCheckPage /> },
      { path: 'certificate/verify/:token', element: <CertificateCheckPage /> },
      { path: 'cabinet', element: <UserCabinet /> },
      { path: 'faq', element: <FAQPage /> },
    ],
  },
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <Navigate to="/admin" replace /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'events', element: <EventsAdminPage /> },
      { path: 'faq', element: <FAQAdminPage /> },
      { path: 'administrators', element: <AdministratorsPage /> },
      { path: 'settings', element: <SettingsAdminPage /> },
      { path: 'updates', element: <UpdatesPage /> },
      { path: 'check-in/:id', element: <CheckInPage /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
