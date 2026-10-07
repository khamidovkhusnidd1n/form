import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient as api } from '../../api/client';
import toast from 'react-hot-toast';
import { useTranslation } from '../../i18n';
import { MessageCircle, CheckCircle, Clock, XCircle, FileText, Send, User, Edit2, UploadCloud } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

export default function UserCabinet() {
  const { t, language } = useTranslation();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
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

  const handleEditSubmit = async () => {
    if (!editingApp) return;
    const formData = new FormData();
    Object.keys(editData).forEach(key => {
      if (editData[key] !== undefined && editData[key] !== null) {
        formData.append(key, editData[key]);
      }
    });
    
    try {
      await api.patch(`/applications/me/${editingApp.id}/`, formData, {
        headers: { 
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Ariza muvaffaqiyatli tahrirlandi!");
      setEditingApp(null);
      fetchApps();
    } catch (e) {
      toast.error("Tahrirlashda xatolik yuz berdi");
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
              
              <div className="flex flex-wrap gap-3 mt-4">
                <button 
                  onClick={() => {
                    setEditingApp(app);
                    setEditData({});
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </button>
              
                {app.status === 'approved' && app.certificate_pdf && (
                  <a href={app.certificate_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Sertifikatni yuklab olish
                  </a>
                )}
              </div>

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

      <Modal isOpen={!!editingApp} onClose={() => setEditingApp(null)} title="Arizani tahrirlash">
        {editingApp && (
          <div className="space-y-4 pt-4">
            {editingApp.status === 'approved' && (
              <div className="text-sm text-amber-700 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <strong>Ogohlantirish:</strong> Bu ariza tasdiqlangan va sertifikat berilgan. Agar siz uni tahrirlasangiz, u qaytadan "Kutilmoqda" holatiga o'tadi va mavjud sertifikat bekor qilinadi.
              </div>
            )}
            <div className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              Faqat o'zgartirish kerak bo'lgan maydonlarni to'ldiring. Fayllarni yangilash uchun yangi fayl yuklang.
            </div>
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="F.I.SH (Ism familiya)" 
                defaultValue={editingApp.fullName}
                onChange={(e) => setEditData({...editData, full_name: e.target.value})} 
              />
              <Input 
                label="Tug'ilgan sana" 
                type="date"
                defaultValue={editingApp.dateOfBirth}
                onChange={(e) => setEditData({...editData, date_of_birth: e.target.value})} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Jinsi</label>
                <select 
                  defaultValue={editingApp.gender}
                  onChange={(e) => setEditData({...editData, gender: e.target.value})}
                  className="w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm border-slate-200 outline-none focus:border-[#1a56db]"
                >
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
              </div>
              <Input 
                label="Telefon raqami" 
                defaultValue={editingApp.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})} 
              />
              <Input 
                label="Email" 
                type="email"
                defaultValue={editingApp.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})} 
              />
              <Input 
                label="Tashkilot" 
                defaultValue={editingApp.organization}
                onChange={(e) => setEditData({...editData, organization: e.target.value})} 
              />
              <Input 
                label="Lavozim" 
                defaultValue={editingApp.position}
                onChange={(e) => setEditData({...editData, position: e.target.value})} 
              />
              <Input 
                label="Davlat" 
                defaultValue={editingApp.country}
                onChange={(e) => setEditData({...editData, country: e.target.value})} 
              />
              <Input 
                label="Viloyat" 
                defaultValue={editingApp.regionName}
                onChange={(e) => setEditData({...editData, region: e.target.value})} 
              />
              <Input 
                label="Tuman/Shahar" 
                defaultValue={editingApp.districtName}
                onChange={(e) => setEditData({...editData, district: e.target.value})} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Ishtirok etish shakli</label>
                <select 
                  defaultValue={editingApp.attendance_type || editingApp.attendanceType}
                  onChange={(e) => setEditData({...editData, attendance_type: e.target.value})}
                  className="w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm border-slate-200 outline-none focus:border-[#1a56db]"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Input 
                  label="Maqola mavzusi" 
                  defaultValue={editingApp.presentation_title || editingApp.presentationTitle}
                  onChange={(e) => setEditData({...editData, presentation_title: e.target.value})} 
                />
              </div>
              <div className="md:col-span-2">
                <Textarea 
                  label="Annotatsiya (Abstract)" 
                  defaultValue={editingApp.abstract}
                  onChange={(e) => setEditData({...editData, abstract: e.target.value})} 
                  rows={4}
                />
              </div>
            </div>
<div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-slate-700">Maqola fayli (Doc/Docx)</label>
              <input 
                type="file" 
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditData({...editData, document: e.target.files[0]});
                  }
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-slate-700">Pasport nusxasi (PDF/Rasm)</label>
              <input 
                type="file" 
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditData({...editData, passport: e.target.files[0]});
                  }
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
              >
                Saqlash va Yuborish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
