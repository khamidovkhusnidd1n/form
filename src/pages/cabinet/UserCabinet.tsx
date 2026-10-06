import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient as api } from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/authStore';

export default function UserCabinet() {
  const [apps, setApps] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const { isAuthenticated, token } = useAuth();
  
  const fetchApps = () => {
    if (!token) return;
    
    api.get('/applications/me/', {
      headers: { Authorization: 'Bearer ' + token  }
    }).then(res => setApps(res.data.results || res.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated, token]);

  const handleReplySubmit = async (appId: number) => {
    try {
      await api.patch(`/applications/me/${appId}/reply/`, {
        user_reply: replyText[appId]
      }, {
        headers: { Authorization: 'Bearer ' + token  }
      });
      toast.success("Javob yuborildi");
      fetchApps();
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    }
  };

  // Auth Guard
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Mening Kabinetim</h1>
      
      {apps.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-slate-500">
          Hali arizalar yo'q.
        </div>
      ) : (
        <div className="space-y-6">
          {apps.map((app: any) => (
            <div key={app.id} className="bg-white shadow rounded-xl p-6 border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">ID: {app.application_id}</div>
                  <h3 className="text-xl font-bold text-slate-800">{app.event_title}</h3>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {app.status === 'approved' ? 'Tasdiqlangan' : app.status === 'rejected' ? 'Bekor qilingan' : 'Kutilmoqda'}
                  </span>
                </div>
              </div>
              
              {app.status === 'approved' && app.certificate_pdf && (
                <div className="mb-4">
                  <a href={app.certificate_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    Sertifikatni yuklab olish
                  </a>
                </div>
              )}

              {app.admin_comment && (
                <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Admindan xabar:</h4>
                  <p className="text-slate-700 mb-4 whitespace-pre-wrap">{app.admin_comment}</p>
                  
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Javob yozish:</h4>
                    {app.user_reply && (
                      <div className="bg-blue-50 p-3 rounded-lg text-blue-900 mb-3 whitespace-pre-wrap">
                        {app.user_reply}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <textarea 
                        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                        placeholder="Adminga javobingizni shu yerga yozing..."
                        value={replyText[app.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [app.id]: e.target.value })}
                      />
                      <button 
                        onClick={() => handleReplySubmit(app.id)}
                        disabled={!replyText[app.id]}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap self-end"
                      >
                        Yuborish
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
