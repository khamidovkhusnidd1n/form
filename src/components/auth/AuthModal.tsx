import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { apiClient as api } from '../../api/client';
import { useAuth } from '../../store/authStore';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/accounts/login/', { username: email, password });
      login(res.data.user || null, res.data.access, res.data.refresh);
      onClose();
    } catch (err: any) {
      setMessage("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/accounts/register/', { email, full_name: fullName, password });
      login(res.data.user || null, res.data.access, res.data.refresh);
      onClose();
    } catch (err: any) {
      setMessage(err.response?.data?.email?.[0] || err.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={tab === 'login' ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'} size="sm">
      <div className="px-1 pb-2">
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button onClick={() => { setTab('login'); setMessage(''); }} className={'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ' + (tab === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900')}>Kirish</button>
          <button onClick={() => { setTab('register'); setMessage(''); }} className={'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ' + (tab === 'register' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900')}>Ro'yxatdan o'tish</button>
        </div>

        {message && <div className="mb-5 text-center text-sm font-medium text-red-600 bg-red-50 py-2.5 px-3 rounded-lg border border-red-100">{message}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email yoki Login</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input type="text" placeholder="Kiriting..." value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-11 pr-11 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 transition-all shadow-sm">
              Kirish
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ism-sharifingiz</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input type="text" placeholder="Masalan: Aliyev Vali" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Elektron pochta</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol o'ylab toping</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input type={showPass ? 'text' : 'password'} placeholder="Kamida 8 ta belgi" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full pl-11 pr-11 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full mt-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 transition-all shadow-sm">
              Ro'yxatdan o'tish
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
