import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient as api } from '../../../api/client';
import { useAuth } from '../../../store/authStore';
import Button from '../../../components/ui/Button';

const registerSchema = z.object({
  email: z.string().email("To'g'ri email manzilini kiriting"),
  fullName: z.string().min(3, "Ism-sharifingizni kiriting"),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak"),
});
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { 
    register: registerForm, 
    handleSubmit: handleRegisterSubmit, 
    formState: { errors: registerErrors, isSubmitting: isRegistering } 
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onRegister = async (data: RegisterFormData) => {
    try {
      const res = await api.post('/accounts/register/', { 
        email: data.email, 
        full_name: data.fullName, 
        password: data.password 
      });
      
      // Backend to'g'ridan-to'g'ri user va tokenlarni qaytaradi
      const user = res.data.user || { email: data.email, role: 'user' };
      login(user, res.data.access, res.data.refresh);
      
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/cabinet');
    } catch (err: any) {
      toast.error(err.response?.data?.email?.[0] || err.response?.data?.detail || "Ro'yxatdan o'tishda xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 shadow-lg rounded-2xl border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Ro'yxatdan o'tish
        </h2>
        
        <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email manzil</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...registerForm('email')}
                type="email"
                autoComplete="email"
                placeholder="mail@example.com"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ism-sharifingiz</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...registerForm('fullName')}
                type="text"
                autoComplete="name"
                placeholder="Ism Familiya"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {registerErrors.fullName && <p className="text-red-500 text-xs mt-1">{registerErrors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...registerForm('password')}
                type="password"
                autoComplete="new-password"
                placeholder="Kamida 8 ta belgi"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            loading={isRegistering} 
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-2"
          >
            Ro'yxatdan o'tish
          </Button>
          
          <p className="mt-6 text-sm text-center text-slate-600">
            Allaqachon hisobingiz bormi?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Kirish
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
