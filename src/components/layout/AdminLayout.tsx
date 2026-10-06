import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ToastProvider from '../ui/Toast';
import { useAuth } from '../../store/authStore';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  
  // Faqat tizimga kirgan va ruxsati bor (admin) foydalanuvchilar kira oladi
  const isAdmin = user && ['super_admin', 'administrator', 'moderator'].includes(user.role);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <>
      <ToastProvider />
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
}
