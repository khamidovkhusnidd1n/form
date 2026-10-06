import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { apiClient as api } from '../../api/client';
import { useAuth } from '../../store/authStore';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/accounts/login/', { username: email, password });
      login(res.data.user || null, res.data.access, res.data.refresh);
      onClose();
    } catch (err: any) {
      setMessage("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/accounts/verify-email/', { email, otp });
      login(res.data.user || null, res.data.access, res.data.refresh);
      onClose();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={tab === 'login' ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'} size="sm">
      <div className="p-2">
        <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
          <button onClick={() => { setTab('login'); setMessage(''); setStep(1); }} className={'flex-1 py-2 text-sm font-medium rounded-md transition-colors ' + (tab === 'login' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900')}>Kirish</button>
          <button onClick={() => { setTab('register'); setMessage(''); setStep(1); }} className={'flex-1 py-2 text-sm font-medium rounded-md transition-colors ' + (tab === 'register' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900')}>Ro'yxatdan o'tish</button>
        </div>

        {message && <p className="mb-4 text-center text-sm font-medium text-red-600 bg-red-50 p-2 rounded">{message}</p>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Elektron pochta" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" placeholder="Parol" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors">Kirish</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="Ism-sharifingiz" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" placeholder="Elektron pochta" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" placeholder="Parol (kamida 8 belgi)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-70 transition-colors">Ro'yxatdan o'tish</button>
          </form>
        )}
      </div>
    </Modal>
  );
}
