export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
};

export type BusinessHours = {
  id: string;
  weekday: number; // 0 for Sunday
  is_open: boolean;
  start_time: string; // 'HH:mm' format
  end_time: string;
};

export type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type ClinicSettings = {
  id: string;
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  created_at: string;
};
