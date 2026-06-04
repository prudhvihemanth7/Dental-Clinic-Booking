import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClinicSettings } from '../../types';
import { Stethoscope } from 'lucide-react';

export function PublicLayout() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    supabase
      .from('clinic_settings')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              {settings?.clinic_name || 'Dental Clinic'}
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#services" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Services</a>
            <a href="/#about" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">About</a>
            <Link to="/book" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              Book Appointment
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  {settings?.clinic_name || 'Dental Clinic'}
                </span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                Premium modern dental care focused on your comfort and long-term oral health.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {settings?.clinic_phone && <li>{settings.clinic_phone}</li>}
                {settings?.clinic_email && <li>{settings.clinic_email}</li>}
                {settings?.clinic_address && <li className="max-w-[200px]">{settings.clinic_address}</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/admin/login" className="hover:text-teal-600 transition-colors">Staff Login</Link></li>
                <li><a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-12 pt-8 text-center md:text-left text-sm text-slate-400 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} {settings?.clinic_name || 'Dental Clinic'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
