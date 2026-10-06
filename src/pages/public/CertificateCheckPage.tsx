import React, { useState } from 'react';
import { apiClient as api } from '../../api/client';

export default function CertificateCheckPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get('/certificates/verify/' + token + '/');
      setResult(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
         setResult({ valid: false, message: "Sertifikat bekor qilingan (Revoked)." });
      } else {
         setResult({ valid: false, message: "Sertifikat topilmadi yoki xato token." });
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h2 className="text-3xl font-bold mb-6">Sertifikatni Tekshirish</h2>
      <form onSubmit={handleCheck} className="flex justify-center mb-8">
        <input 
          className="border p-2 w-2/3 rounded-l" 
          type="text" 
          placeholder="Sertifikat ID yoki Tokenni kiriting" 
          value={token} 
          onChange={e => setToken(e.target.value)} 
          required 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded-r hover:bg-blue-700">Tekshirish</button>
      </form>
      
      {result && (
        <div className={result.valid ? "p-6 border rounded shadow-lg bg-green-50 border-green-200" : "p-6 border rounded shadow-lg bg-red-50 border-red-200"}>
          {result.valid ? (
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-2">✓ Sertifikat Haqiqiy</h3>
              <p className="text-lg"><strong>Ism:</strong> {result.name}</p>
              <p className="text-lg"><strong>Raqam:</strong> {result.id}</p>
              <p className="text-lg"><strong>Sana:</strong> {result.date}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-red-700">✗ Sertifikat topilmadi yoki bekor qilingan</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
