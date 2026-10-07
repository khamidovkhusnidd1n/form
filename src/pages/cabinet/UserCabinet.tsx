import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient as api } from '../../api/client';
import toast from 'react-hot-toast';
import { useTranslation } from '../../i18n';
import { MessageCircle, CheckCircle, Clock, XCircle, FileText, Send, User } from 'lucide-react';
import { useAuth } from '../../store/authStore';

export default function UserCabinet() {
  const { t, language } = useTranslation();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const { isAuthenticated, token } = useAuth();
  
  const fetchApps = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    api.get('/applications/me/', {
      headers: { Authorization: 'Bearer ' + token  }
    }).then(res => {
      setApps(res.data.results || res.data);
    })
    .catch(err => {
      console.error(err);
      toast.error("Arizalarni yuklashda xatolik yuz berdi");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchApps();
    } else {
      setLoading(false);
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
      
      {loading ? (
        <div className="bg-white shadow-sm rounded-2xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500">Arizalar yuklanmoqda...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white shadow-sm rounded-2xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Hali arizalar yo'q</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Siz hali hech qanday tadbir yoki imtihon uchun ariza yubormagansiz.</p>
          <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Tadbirlarni ko'rish
          </a>
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

              {(app.admin_comment || (app.translations && app.translations[language]?.adminComment)) && (
                <div className="mt-6 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b pb-3">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    Admindan xabar va Muloqot
                  </div>
                  
                  <div className="space-y-4">
                    {/* Admin Message Bubble */}
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-700" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex-1">
                        <div className="text-xs font-bold text-indigo-600 mb-1">Admin</div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {app.translations?.[language]?.adminComment || app.admin_comment}
                        </p>
                      </div>
                    </div>

                    {/* User Reply Bubble */}
                    {app.user_reply && (
                      <div className="flex gap-3 items-start flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm flex-1">
                          <div className="text-xs font-bold text-emerald-700 mb-1 text-right">Sizning javobingiz</div>
                          <p className="text-emerald-900 text-sm whitespace-pre-wrap text-right">
                            {app.user_reply}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Reply Input Area */}
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <textarea 
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-shadow"
                      rows={1}
                      style={{ minHeight: '50px' }}
                      placeholder="Adminga javob yozish..."
                      value={replyText[app.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [app.id]: e.target.value })}
                    />
                    <button 
                      onClick={() => handleReplySubmit(app.id)}
                      disabled={!replyText[app.id]}
                      className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 shadow-sm"
                      title="Jo'natish"
                    >
                      <Send className="w-5 h-5" />
                    </button>
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
