import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Appointment, BlockedDate, BusinessHours, ClinicSettings, Service } from '../../types';
import { generateAvailableSlots, TimeSlot } from '../../lib/booking';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { Calendar, CheckCircle2, ChevronRight, Clock, User, Phone, Mail, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: srvs },
          { data: sets },
          { data: hours },
          { data: blocked }
        ] = await Promise.all([
          supabase.from('services').select('*').eq('is_active', true).order('price'),
          supabase.from('clinic_settings').select('*').single(),
          supabase.from('business_hours').select('*'),
          supabase.from('blocked_dates').select('*')
        ]);

        if (srvs) setServices(srvs);
        if (sets) setSettings(sets);
        if (hours) setBusinessHours(hours);
        if (blocked) setBlockedDates(blocked);

        // Pre-select service from URL
        const serviceId = searchParams.get('service');
        if (serviceId && srvs) {
          const pre = srvs.find(s => s.id === serviceId);
          if (pre) {
            setSelectedService(pre);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchParams]);

  // Load appointments when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', dateStr)
      .then(({ data }) => {
        if (data) setAppointments(data);
      });
  }, [selectedDate]);

  // Recalculate slots
  useEffect(() => {
    if (selectedService && selectedDate && settings && businessHours.length > 0) {
      const slots = generateAvailableSlots({
        date: selectedDate,
        service: selectedService,
        businessHours,
        blockedDates,
        appointments,
        settings
      });
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedService, appointments, businessHours, blockedDates, settings]);

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    if (step === 2 && selectedSlot) setStep(3);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;
    
    setSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase.from('appointments').insert({
        service_id: selectedService.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: format(selectedSlot.start, 'HH:mm:ss'),
        end_time: format(selectedSlot.end, 'HH:mm:ss'),
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || null,
        status: 'pending'
      });

      if (submitError) throw submitError;

      navigate('/book/success', { state: { date: selectedSlot.start, service: selectedService } });
    } catch (err: any) {
      setError(err?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate 14 days of buttons
  const dateOptions = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-2xl mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Book your visit</h1>
          <p className="text-slate-500">Fast, easy, and secure online scheduling.</p>

          <div className="flex items-center justify-center gap-4 mt-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                    step > s ? 'bg-teal-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Select a service</h2>
              <div className="space-y-4">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      selectedService?.id === service.id 
                        ? 'border-teal-600 bg-teal-50' 
                        : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{service.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0 ml-4">${service.price}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {service.duration_minutes} mins
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Time */}
          {step === 2 && (
            <div className="p-8">
              <button onClick={handlePrevStep} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to services
              </button>
              
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Choose Date & Time</h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Available Dates</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {dateOptions.map(date => {
                    const isSelected = isSameDay(selectedDate, date);
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-2xl border-2 snap-start transition-colors ${
                          isSelected 
                            ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                            : 'border-slate-100 text-slate-600 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-medium uppercase opacity-80">{format(date, 'EEE')}</span>
                        <span className="text-xl font-bold mt-1">{format(date, 'd')}</span>
                        <span className="text-xs opacity-80">{format(date, 'MMM')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="flex items-center justify-between text-sm font-medium text-slate-700 mb-3">
                  <span>Available times for {format(selectedDate, 'MMM do')}</span>
                  <span className="text-slate-400 font-normal">{selectedService?.name} ({selectedService?.duration_minutes}m)</span>
                </h3>
                
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.label}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedSlot?.label === slot.label
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-slate-100 text-slate-600 hover:border-teal-200'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No available slots.</p>
                    <p className="text-sm text-slate-500 mt-1">Please select another date.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNextStep}
                  disabled={!selectedSlot}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Details */}
          {step === 3 && (
            <div className="p-8">
              <button onClick={handlePrevStep} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to times
              </button>

              <div className="bg-teal-50 rounded-2xl p-4 mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Appointment Summary</h3>
                  <p className="text-teal-800 font-medium">{selectedService?.name}</p>
                  <p className="text-sm text-teal-700 mt-1">
                    {format(selectedDate, 'EEEE, MMMM do, yyyy')} at {selectedSlot?.label}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      required
                      type="text"
                      className="block w-full pl-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        required
                        type="email"
                        className="block w-full pl-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        required
                        type="tel"
                        className="block w-full pl-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none resize-none"
                    placeholder="Any specific concerns or questions? Let us know."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</>
                    ) : (
                      'Confirm Appointment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
