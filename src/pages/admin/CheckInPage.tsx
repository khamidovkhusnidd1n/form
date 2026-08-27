import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import Button from '../../components/ui/Button';

export default function CheckInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    
    apiClient.post(`/applications/admin/${id}/check-in/`)
      .then((res) => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Check-in failed');
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-[#1a56db] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Tekshirilmoqda...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Muvaffaqiyatli!</h2>
            <p className="text-slate-500 mb-8">Ishtirokchi tadbirga kelganligi tasdiqlandi.</p>
            <Button onClick={() => navigate('/admin/applications')} className="w-full">
              Arizalar ro'yxatiga qaytish
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Xatolik!</h2>
            <p className="text-slate-500 mb-8">{message}</p>
            <Button onClick={() => navigate('/admin/applications')} className="w-full" variant="outline">
              Arizalar ro'yxatiga qaytish
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
