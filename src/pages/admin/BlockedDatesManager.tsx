import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react';

export function BlockedDatesManager() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlockedDates();
  }, []);

  async function loadBlockedDates() {
    setLoading(true);
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true });
    if (data) setBlockedDates(data);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setSaving(true);
    
    try {
      const { error } = await supabase.from('blocked_dates').insert({
        blocked_date: newDate,
        reason: newReason || null
      });

      if (!error) {
        await loadBlockedDates();
        setIsAdding(false);
        setNewDate('');
        setNewReason('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (!error) {
      setBlockedDates(dates => dates.filter(d => d.id !== id));
    }
  };

  if (loading && blockedDates.length === 0) {
    return <div className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading blocked dates...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blocked Dates</h1>
          <p className="text-slate-500 text-sm mt-1">Prevent bookings on specific dates (e.g. holidays)</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Blocked Date
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Add Blocked Date</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                <input
                  required
                  type="date"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Christmas Holiday"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-70 transition-colors"
              >
                {saving ? 'Adding...' : 'Add Date'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockedDates.map(date => (
                <tr key={date.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {format(parseISO(date.blocked_date), 'EEEE, MMMM do, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{date.reason || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemove(date.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="Remove blocked date"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {blockedDates.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No blocked dates configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
