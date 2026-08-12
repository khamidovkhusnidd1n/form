import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, MapPin, Phone, Mail, Link as LinkIcon, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../i18n';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { apiClient } from '../../api/client';

export default function SettingsAdminPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_phone: '',
    contact_email: '',
    footer_text: '',
    map_url: '',
    social_links: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/settings/admin/organization/');
      setFormData({
        organization_name: res.data.organization_name || '',
        contact_phone: res.data.contact_phone || '',
        contact_email: res.data.contact_email || '',
        footer_text: res.data.footer_text || '',
        map_url: res.data.map_url || '',
        social_links: res.data.social_links || ''
      });
    } catch (error) {
      toast.error(t('settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/settings/admin/organization/', formData);
      toast.success(t('settings.saveSuccess'));
    } catch (error) {
      toast.error(t('settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('settings.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label={t('settings.orgName')} 
              name="organization_name" 
              value={formData.organization_name} 
              onChange={handleChange} 
              icon={<Building className="w-5 h-5 text-slate-400" />} 
            />
            <Input 
              label={t('settings.phone')} 
              name="contact_phone" 
              value={formData.contact_phone} 
              onChange={handleChange} 
              icon={<Phone className="w-5 h-5 text-slate-400" />} 
            />
            <Input 
              label={t('settings.email')} 
              name="contact_email" 
              value={formData.contact_email} 
              onChange={handleChange} 
              icon={<Mail className="w-5 h-5 text-slate-400" />} 
            />
            <Input 
              label={t('settings.socialLinks')} 
              name="social_links" 
              value={formData.social_links} 
              onChange={handleChange} 
              icon={<LinkIcon className="w-5 h-5 text-slate-400" />} 
            />
          </div>
          <Textarea 
            label={t('settings.mapUrlLabel')} 
            name="map_url" 
            value={formData.map_url} 
            onChange={handleChange} 
            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
            hint={t('settings.mapUrlHint')}
            rows={3} 
          />
          <Textarea 
            label={t('settings.footerText')} 
            name="footer_text" 
            value={formData.footer_text} 
            onChange={handleChange} 
            rows={3} 
          />
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
            {t('settings.save')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
