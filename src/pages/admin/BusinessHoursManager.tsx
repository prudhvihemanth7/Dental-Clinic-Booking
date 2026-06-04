import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BusinessHours } from '../../types';
import { Loader2, Save } from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BusinessHoursManager() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadHours();
  }, []);

  async function loadHours() {
    setLoading(true);
    const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
    
    if (data && data.length > 0) {
      setHours(data);
    } else {
      // Seed default hours if none exist
      const defaultHours: Omit<BusinessHours, 'id'>[] = WEEKDAYS.map((_, index) => ({
        weekday: index,
        is_open: index > 0 && index < 6, // Mon-Fri open
        start_time: '09:00',
        end_time: '17:00'
      }));
      setHours(defaultHours as any); // Display default, need to save to persist
    }
    setLoading(false);
  }

  const handleUpdate = (index: number, field: keyof BusinessHours, value: any) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
      for (const hour of hours) {
        if (hour.id) {
          await supabase.from('business_hours').update({
            is_open: hour.is_open,
            start_time: hour.start_time,
            end_time: hour.end_time
          }).eq('id', hour.id);
        } else {
          await supabase.from('business_hours').insert({
            weekday: hour.weekday,
            is_open: hour.is_open,
            start_time: hour.start_time,
            end_time: hour.end_time
          });
        }
      }
      
      await loadHours(); // Reload to get real IDs if they were just created
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && hours.length === 0) {
    return <div className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading business hours...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Hours</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your weekly operating schedule</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {success && (
        <div className="mb-6 px-4 py-3 bg-teal-50 text-teal-800 border border-teal-100 rounded-xl text-sm font-medium">
          Business hours updated successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {hours.map((hour, index) => (
            <div key={hour.weekday} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 w-[200px]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={hour.is_open}
                      onChange={(e) => handleUpdate(index, 'is_open', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </div>
                  <span className={`font-semibold ${hour.is_open ? 'text-slate-900' : 'text-slate-400'}`}>
                    {WEEKDAYS[hour.weekday]}
                  </span>
                </label>
              </div>

              {hour.is_open ? (
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-slate-700 bg-white"
                    value={hour.start_time}
                    onChange={(e) => handleUpdate(index, 'start_time', e.target.value)}
                  />
                  <span className="text-slate-400 font-medium pb-1">-</span>
                  <input
                    type="time"
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-slate-700 bg-white"
                    value={hour.end_time}
                    onChange={(e) => handleUpdate(index, 'end_time', e.target.value)}
                  />
                </div>
              ) : (
                <div className="text-slate-400 text-sm font-medium italic sm:w-[220px] sm:text-center">
                  Closed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
