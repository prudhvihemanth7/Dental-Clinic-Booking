import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, Sparkles, UserRoundCheck } from 'lucide-react';

export function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
      .then(({ data }) => {
        if (data) setServices(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center bg-slate-900">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2070" 
            alt="Modern dental clinic" 
            className="w-full h-full object-cover opacity-40 select-none"
            draggable="false"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Premium Dental Care
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
              A brighter smile, <br className="hidden md:block" /> a healthier you.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
              Experience modern dentistry with a focus on your comfort. We combine advanced technology with compassionate care.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/book" className="bg-teal-500 text-white px-8 py-3.5 rounded-full font-medium hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/25 flex items-center gap-2">
                Book Appointment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#services" className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-8 py-3.5 rounded-full font-medium hover:bg-white/20 transition-colors">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <UserRoundCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Expert Team</h3>
              <p className="text-sm text-slate-500 max-w-sm">Highly qualified dental professionals dedicated to your health.</p>
            </div>
            <div className="flex flex-col items-center p-4 pt-8 md:pt-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Modern Technology</h3>
              <p className="text-sm text-slate-500 max-w-sm">Advanced equipment for precise, painless, and effective treatments.</p>
            </div>
            <div className="flex flex-col items-center p-4 pt-8 md:pt-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Efficient Care</h3>
              <p className="text-sm text-slate-500 max-w-sm">Respecting your time with punctual appointments and smooth processes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 tracking-tight">Our Services</h2>
            <p className="text-slate-500 text-lg">Comprehensive dental care tailored to your unique needs. We provide a full range of treatments to keep your smile healthy and beautiful.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-48 bg-slate-100 overflow-hidden relative">
                    <img 
                      src={`https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800&sig=${service.id}`} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-slate-900">{service.name}</h3>
                      <span className="bg-teal-50 text-teal-700 text-sm font-semibold px-2.5 py-1 rounded-lg shrink-0">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                      {service.description || "Professional dental treatment tailored to your needs."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-sm text-slate-400 gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration_minutes} mins</span>
                      </div>
                      <Link 
                        to={`/book?service=${service.id}`} 
                        className="text-teal-600 font-medium text-sm hover:text-teal-700 flex items-center gap-1 group/link transition-colors"
                      >
                        Book now
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500">No active services available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* About / Philosophy section */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000" 
                  alt="Friendly dentist" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-50 rounded-full z-0 blur-3xl"></div>
              <div className="absolute -top-8 -left-8 w-48 h-48 bg-blue-50 rounded-full z-0 blur-3xl"></div>
            </div>
            
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase mb-6">
                Our Philosophy
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 tracking-tight leading-tight">
                Dental care that feels less like a clinic, and more like a retreat.
              </h2>
              <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                We believe that visiting the dentist shouldn't be stressful. We've designed every aspect of our practice to provide a calming, supportive environment where your health comes first.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "State-of-the-art diagnostic equipment",
                  "Stress-free environment and comfort amenities",
                  "Transparent pricing with no hidden fees",
                  "Comprehensive preventative care strategies"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/book" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium hover:bg-slate-50 transition-colors">
                Schedule your visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
