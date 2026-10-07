import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient as api } from '../../api/client';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CertificateCheckPage() {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(urlToken || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkToken = async (verifyToken: string) => {
    setLoading(true);
    try {
      const res = await api.get('/certificates/verify/' + verifyToken + '/');
      setResult(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
         setResult({ valid: false, message: "Sertifikat bekor qilingan (Revoked)." });
      } else {
         setResult({ valid: false, message: "Sertifikat topilmadi yoki xato token." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlToken) {
      checkToken(urlToken);
    }
  }, [urlToken]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      navigate('/certificate/verify/' + token);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center px-4">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Sertifikatni Tekshirish</h2>
      <form onSubmit={handleCheck} className="flex justify-center mb-8">
        <input 
          className="border p-3 w-2/3 rounded-l-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          type="text" 
          placeholder="Sertifikat ID yoki Tokenni kiriting" 
          value={token} 
          onChange={e => setToken(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white p-3 px-6 rounded-r-xl hover:bg-indigo-700 font-medium transition-colors disabled:opacity-70">
          {loading ? 'Kutmoqda...' : 'Tekshirish'}
        </button>
      </form>
      
      {result && (
        <div className={result.valid ? "p-8 border rounded-2xl shadow-sm bg-emerald-50 border-emerald-100" : "p-8 border rounded-2xl shadow-sm bg-red-50 border-red-100"}>
          {result.valid ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">Sertifikat Haqiqiy</h3>
              <div className="bg-white p-6 rounded-xl w-full text-left space-y-3 shadow-sm border border-emerald-100/50">
                <p className="text-lg text-slate-700"><strong className="text-slate-900">Ism:</strong> {result.name}</p>
                <p className="text-lg text-slate-700"><strong className="text-slate-900">Qayd raqami:</strong> {result.id}</p>
                <p className="text-lg text-slate-700"><strong className="text-slate-900">Sana:</strong> {result.date}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-700">{result.message}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
