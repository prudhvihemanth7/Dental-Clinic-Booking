import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PublicLayout } from './components/layouts/PublicLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { Home } from './pages/public/Home';
import { BookingFlow } from './pages/public/BookingFlow';
import { BookingSuccess } from './pages/public/BookingSuccess';
import { Login } from './pages/admin/Login';
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { AppointmentsManager } from './pages/admin/AppointmentsManager';
import { ServicesManager } from './pages/admin/ServicesManager';
import { BusinessHoursManager } from './pages/admin/BusinessHoursManager';
import { BlockedDatesManager } from './pages/admin/BlockedDatesManager';
import { ClinicSettingsManager } from './pages/admin/ClinicSettingsManager';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You are signed in, but you are not authorized as an admin.</p>
          <button
            onClick={() => {
              import('./lib/supabase').then(({ supabase }) => {
                supabase.auth.signOut();
              });
            }}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookingFlow />} />
            <Route path="/book/success" element={<BookingSuccess />} />
          </Route>

          {/* Admin Auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="appointments" element={<AppointmentsManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="hours" element={<BusinessHoursManager />} />
            <Route path="blocked-dates" element={<BlockedDatesManager />} />
            <Route path="settings" element={<ClinicSettingsManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
