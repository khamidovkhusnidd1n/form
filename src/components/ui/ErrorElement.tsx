import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorElement() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Kutilmagan xatolik yuz berdi
        </h1>
        <p className="text-slate-500 mb-6">
          Agar siz brauzerning avtomatik tarjimonidan foydalanayotgan bo'lsangiz (Google Translate), iltimos uni o'chirib qo'ying va sahifani yangilang.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-500 mb-6 overflow-auto max-h-32">
          {error?.message || error?.statusText || "Noma'lum xatolik"}
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sahifani yangilash
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Bosh sahifa
          </Button>
        </div>
      </div>
    </div>
  );
}
