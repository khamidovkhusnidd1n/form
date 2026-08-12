import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, Shield, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import type { AdminUser, UserRole } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from '../../i18n';
import { apiClient } from '../../api/client';
import { Loader2 } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

const ROLE_ICONS: Record<UserRole, typeof ShieldCheck> = {
  super_admin: ShieldCheck,
  administrator: Shield,
  moderator: User,
};

const ROLE_LABELS: Record<string, Record<UserRole, string>> = {
  uz: {
    super_admin: 'Super Admin',
    administrator: 'Administrator',
    moderator: 'Moderator',
  },
  ru: {
    super_admin: 'Супер Админ',
    administrator: 'Администратор',
    moderator: 'Модератор',
  },
  en: {
    super_admin: 'Super Admin',
    administrator: 'Administrator',
    moderator: 'Moderator',
  }
};
const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  administrator: "bg-blue-100 text-blue-700",
  moderator: "bg-slate-100 text-slate-600",
};

const getRoleLabel = (role: UserRole, lang: string): string => {
  return (ROLE_LABELS[lang] || ROLE_LABELS.uz)[role] || role;
};

export default function AdministratorsPage() {
  const { t, language } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminUser & { password: string }>>({});
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/accounts/users/');
      const rawList = Array.isArray(res.data) ? res.data : (res.data.results || []);
      const apiUsers: AdminUser[] = rawList.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at,
        lastLogin: u.last_login
      }));
      setUsers(apiUsers);
    } catch (err) {
      toast.error(t('common.error') || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing({ username: '', fullName: '', email: '', role: 'moderator', isActive: true, password: '' });
    setIsNew(true);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => { setEditing({ ...u }); setIsNew(false); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing.username || !editing.fullName || !editing.email) {
      toast.error(t('common.error') || 'Xatolik');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        username: editing.username,
        email: editing.email,
        full_name: editing.fullName,
        role: editing.role,
        is_active: editing.isActive,
        ...(editing.password ? { password: editing.password } : {})
      };

      if (isNew) {
        await apiClient.post('/accounts/users/', payload);
        toast.success(t('common.success'));
      } else {
        await apiClient.patch(`/accounts/users/${editing.id}/`, payload);
        toast.success(t('common.success'));
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(t('common.error') || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.confirmDelete') || 'Haqiqatan ham o\'chirmoqchimisiz?')) return;
    try {
      await apiClient.delete(`/accounts/users/${id}/`);
      toast.success(t('common.success'));
      fetchUsers();
    } catch (err) {
      toast.error(t('common.error') || 'Xatolik');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('admins.title')}</h1>
          <p className="text-slate-500 text-sm">{users.length} {t('admins.countSuffix')}</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{t('admins.addBtn')}</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const Icon = ROLE_ICONS[user.role];
          return (
            <Card key={user.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center text-white text-xl font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", ROLE_COLORS[user.role])}>
                  <Icon className="w-3.5 h-3.5" />{getRoleLabel(user.role, language)}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 mb-0.5">{user.fullName}</h3>
              <p className="text-sm text-slate-500 mb-1">{user.email}</p>
              <p className="text-xs text-slate-400 mb-4 font-mono">@{user.username}</p>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
                  {user.isActive ? t('admins.active') : t('admins.inactive')}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                  {user.role !== 'super_admin' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? t('admins.createTitle') : t('admins.editTitle')} size="md">
        <div className="space-y-4">
          {[
            { label: t('admins.fullNameLabel'), key: "fullName", placeholder: "To'liq ism", type: "text" },
            { label: t('admins.usernameLabel'), key: "username", placeholder: "username", type: "text" },
            { label: t('admins.emailLabel'), key: "email", placeholder: "email@akademiya.uz", type: "email" },
            ...(isNew ? [{ label: t('admins.passwordLabel'), key: "password", placeholder: "••••••••", type: "password" }] : []),
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                value={(editing as Record<string, string>)[key] || ''}
                onChange={(e) => setEditing(ed => ({ ...ed, [key]: e.target.value }))}
                type={type}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('admins.roleLabel')}</label>
            <select
              value={editing.role || 'moderator'}
              onChange={(e) => setEditing(ed => ({ ...ed, role: e.target.value as UserRole }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30"
            >
              {Object.entries(ROLE_LABELS[language] || ROLE_LABELS.uz).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={!!editing.isActive}
              onChange={(e) => setEditing(ed => ({ ...ed, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">{t('admins.activeStateLabel')}</label>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button onClick={handleSave} loading={saving} className="flex-1 justify-center">{t('common.save')}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1 justify-center">{t('common.cancel')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
