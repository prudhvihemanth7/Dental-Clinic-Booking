import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, Service } from '../../types';
import { format, parseISO } from 'date-fns';
import { Calendar, Check, X, Clock, Loader2, Edit2 } from 'lucide-react';

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        { data: apps },
        { data: srvs }
      ] = await Promise.all([
        supabase.from('appointments').select('*').order('appointment_date', { ascending: false }).order('start_time', { ascending: false }),
        supabase.from('services').select('*')
      ]);
      
      if (apps) setAppointments(apps);
      if (srvs) {
        const srvMap: Record<string, Service> = {};
        srvs.forEach(s => srvMap[s.id] = s);
        setServices(srvMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id: string, newStatus: Appointment['status']) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      if (!error) {
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) {
    return <div className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading appointments...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length > 0 ? filteredApps.map(app => {
          const service = services[app.service_id];
          return (
            <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{app.full_name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wider ${
                    app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'completed' ? 'bg-teal-100 text-teal-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(parseISO(app.appointment_date), 'MMM do, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Service:</span>
                    {service?.name || 'Unknown Service'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Phone:</span>
                    {app.phone}
                  </div>
                </div>

                {app.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm italic text-slate-600">
                    "{app.notes}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 md:flex-col lg:flex-row md:w-auto shrink-0">
                {app.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(app.id, 'confirmed')}
                      disabled={updatingId === app.id}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" /> Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'cancelled')}
                      disabled={updatingId === app.id}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
                {app.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => updateStatus(app.id, 'completed')}
                      disabled={updatingId === app.id}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" /> Mark Complete
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'cancelled')}
                      disabled={updatingId === app.id}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
            <p className="text-slate-500">There are no {filter !== 'all' ? filter : ''} appointments to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
