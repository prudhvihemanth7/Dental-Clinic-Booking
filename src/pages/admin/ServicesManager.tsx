import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Plus, Edit2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  }

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setCurrentService({ name: '', description: '', duration_minutes: 30, price: 0, is_active: true });
    setIsEditing(true);
  };

  const handleToggleActive = async (service: Service) => {
    const { error } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
    if (!error) {
      setServices(srvs => srvs.map(s => s.id === service.id ? { ...s, is_active: !service.is_active } : s));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;
    setSubmitting(true);
    
    try {
      if (currentService.id) {
        // Update
        const { error } = await supabase.from('services').update({
          name: currentService.name,
          description: currentService.description,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active
        }).eq('id', currentService.id);
        
        if (!error) await loadServices();
      } else {
        // Create
        const { error } = await supabase.from('services').insert({
          name: currentService.name,
          description: currentService.description,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active
        });
        
        if (!error) await loadServices();
      }
      setIsEditing(false);
      setCurrentService(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && services.length === 0) {
    return <div className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading services...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-500 text-sm mt-1">Manage treatments and procedures</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {isEditing && currentService ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {currentService.id ? 'Edit Service' : 'Add New Service'}
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Name *</label>
                <input
                  required
                  type="text"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={currentService.name || ''}
                  onChange={e => setCurrentService({...currentService, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={currentService.price || 0}
                  onChange={e => setCurrentService({...currentService, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none resize-none"
                value={currentService.description || ''}
                onChange={e => setCurrentService({...currentService, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (minutes) *</label>
                <select
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  value={currentService.duration_minutes || 30}
                  onChange={e => setCurrentService({...currentService, duration_minutes: parseInt(e.target.value)})}
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                    checked={currentService.is_active !== false}
                    onChange={e => setCurrentService({...currentService, is_active: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-slate-700">Active (Visible on booking page)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-70 transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Service'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{service.name}</div>
                    <div className="text-slate-500 truncate max-w-[200px]">{service.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{service.duration_minutes} mins</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">${service.price}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                        service.is_active ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {service.is_active ? <><CheckCircle2 className="w-3.5 h-3.5" /> Active</> : <><XCircle className="w-3.5 h-3.5" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No services configured yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
