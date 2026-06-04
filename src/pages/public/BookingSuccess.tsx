import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function BookingSuccess() {
  const location = useLocation();
  const state = location.state as { date: Date; service: any } | null;

  // If someone navigates here directly without booking, send them home
  if (!state || !state.date || !state.service) {
    return <Navigate to="/" replace />;
  }

  const { date, service } = state;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-20">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 text-center">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-2">Request Received!</h1>
        <p className="text-slate-500 mb-8">
          Thank you for choosing us. We have received your appointment request and will review it shortly.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 border border-slate-100">
          <h3 className="font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">Appointment Details</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Service</p>
              <p className="font-medium text-slate-900">{service.name}</p>
            </div>
            
            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Date</p>
                <p className="font-medium text-slate-900">{format(date, 'MMM do, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</p>
                <p className="font-medium text-slate-900">{format(date, 'h:mm a')}</p>
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          Return to Home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
