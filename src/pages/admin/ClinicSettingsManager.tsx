import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClinicSettings } from '../../types';
import { Loader2, Save } from 'lucide-react';

export function ClinicSettingsManager() {
  const [settings, setSettings] = useState<Partial<ClinicSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from('clinic_settings').select('*').single();
    if (data) {
      setSettings(data);
    } else {
      setSettings({
        clinic_name: 'Premium Dental',
        clinic_email: 'hello@premiumdental.com',
        clinic_phone: '(555) 123-4567',
        clinic_address: '123 Smile Way, Care City, CA 90210',
        slot_interval_minutes: 30,
        booking_notice_hours: 24
      });
    }
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    setSuccess(false);

    try {
      if (settings.id) {
        await supabase.from('clinic_settings').update({
          clinic_name: settings.clinic_name,
          clinic_email: settings.clinic_email,
          clinic_phone: settings.clinic_phone,
          clinic_address: settings.clinic_address,
          slot_interval_minutes: settings.slot_interval_minutes,
          booking_notice_hours: settings.booking_notice_hours
        }).eq('id', settings.id);
      } else {
        const { data } = await supabase.from('clinic_settings').insert({
          clinic_name: settings.clinic_name,
          clinic_email: settings.clinic_email,
          clinic_phone: settings.clinic_phone,
          clinic_address: settings.clinic_address,
          slot_interval_minutes: settings.slot_interval_minutes,
          booking_notice_hours: settings.booking_notice_hours
        }).select().single();
        if (data) setSettings(data);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Clinic Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage global clinic information and booking rules</p>
      </div>

      {success && (
        <div className="mb-6 px-4 py-3 bg-teal-50 text-teal-800 border border-teal-100 rounded-xl text-sm font-medium">
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Public Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinic Name</label>
              <input
                required
                type="text"
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                value={settings.clinic_name || ''}
                onChange={e => setSettings({...settings, clinic_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
                <input
                  required
                  type="email"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={settings.clinic_email || ''}
                  onChange={e => setSettings({...settings, clinic_email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
                <input
                  required
                  type="text"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={settings.clinic_phone || ''}
                  onChange={e => setSettings({...settings, clinic_phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <textarea
                required
                rows={2}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none resize-none"
                value={settings.clinic_address || ''}
                onChange={e => setSettings({...settings, clinic_address: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Booking Rules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Calendar Slot Interval (minutes)</label>
              <p className="text-xs text-slate-500 mb-2 border-b border-transparent">How often a new slot starts (e.g. 10:00, 10:30)</p>
              <select
                required
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none text-slate-700"
                value={settings.slot_interval_minutes || 30}
                onChange={e => setSettings({...settings, slot_interval_minutes: parseInt(e.target.value)})}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimum Booking Notice (hours)</label>
              <p className="text-xs text-slate-500 mb-2 border-b border-transparent">How far in advance clients must book</p>
              <input
                required
                type="number"
                min="0"
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                value={settings.booking_notice_hours || 0}
                onChange={e => setSettings({...settings, booking_notice_hours: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
