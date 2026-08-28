import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { GraduationCap, Eye, EyeOff, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { useAuth } from '../../store/authStore';
import { apiClient } from '../../api/client';
import type { AdminUser } from '../../types';
import ToastProvider from '../../components/ui/Toast';
import { useTranslation } from '../../i18n';
import logoImage from '../../assets/logo_v2.png';

const schema = z.object({
  username: z.string().min(1, "Foydalanuvchi nomini kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiClient.post('/auth/login/', {
        username: data.username,
        password: data.password,
      });

      const rawUser = res.data.user;
      const mappedUser: AdminUser = {
        id: rawUser.id,
        username: rawUser.username,
        fullName: rawUser.full_name || rawUser.fullName || '',
        email: rawUser.email || '',
        role: rawUser.role,
        isActive: rawUser.is_active ?? rawUser.isActive ?? true,
        createdAt: rawUser.created_at || rawUser.createdAt || '',
        lastLogin: rawUser.last_login || rawUser.lastLogin,
      };

      login(mappedUser, res.data.access, res.data.refresh);
      toast.success(t('login.welcomeToast'));
      navigate('/admin');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.message ||
        t('login.errorToast');
      toast.error(typeof errorMsg === 'string' ? errorMsg : t('login.errorToast'));
    }
  };

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f2560] to-[#1a56db] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-xl shadow-[#1a56db]/20 relative z-10 p-2">
              <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('login.title')}</h1>
            <p className="text-white/60 text-sm">CENTR FORM — {t('brand.subtitle')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">{t('login.usernameLabel')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    {...register('username')}
                    placeholder="admin"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  />
                </div>
                {errors.username && <p className="text-red-300 text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">{t('login.passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full justify-center bg-white text-[#1a56db] hover:bg-white/90 mt-2" size="lg">
                {t('login.submitBtn')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
