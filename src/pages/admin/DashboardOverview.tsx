import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, Service } from '../../types';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';

export function DashboardOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { data: apps },
          { data: srvs }
        ] = await Promise.all([
          supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
          supabase.from('services').select('*').eq('is_active', true)
        ]);
        
        if (apps) setAppointments(apps);
        if (srvs) setServices(srvs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading stats...</div>;
  }

  const todayApps = appointments.filter(a => isToday(parseISO(a.appointment_date)));
  const pendingApps = appointments.filter(a => a.status === 'pending');
  const upcomingApps = appointments.filter(a => isFuture(parseISO(`${a.appointment_date}T${a.start_time}`)));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Today's Appointments</p>
          <p className="text-3xl font-bold text-slate-900">{todayApps.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-slate-900">{pendingApps.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Total</p>
          <p className="text-3xl font-bold text-slate-900">{upcomingApps.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Active Services</p>
          <p className="text-3xl font-bold text-slate-900">{services.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Pending Requests</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingApps.slice(0, 5).length > 0 ? (
            pendingApps.slice(0, 5).map(app => {
              const service = services.find(s => s.id === app.service_id);
              return (
                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">{app.full_name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>{format(parseISO(app.appointment_date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{app.start_time.substring(0, 5)}</span>
                      <span>•</span>
                      <span className="text-teal-600">{service?.name || 'Unknown Service'}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    Pending
                  </span>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              No pending appointment requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
