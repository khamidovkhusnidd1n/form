import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient as api } from '../../../api/client';
import { useAuth } from '../../../store/authStore';
import Button from '../../../components/ui/Button';

const schema = z.object({
  email: z.string().email("To'g'ri email manzilini kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ 
    resolver: zodResolver(schema) 
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/accounts/login/', { 
        username: data.email, 
        password: data.password 
      });
      
      const user = res.data.user || { email: data.email, role: 'user' };
      login(user, res.data.access, res.data.refresh);
      
      toast.success("Tizimga muvaffaqiyatli kirdingiz");
      navigate('/cabinet');
    } catch (err: any) {
      toast.error("Kirishda xatolik: Email yoki parol noto'g'ri");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 shadow-lg rounded-2xl border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Tizimga kirish</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email manzil</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="mail@example.com"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            loading={isSubmitting} 
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-2"
          >
            Kirish
          </Button>
          
          <p className="mt-6 text-sm text-center text-slate-600">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
