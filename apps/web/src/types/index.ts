// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Customer extends User {
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  postcode: string;
}

export interface BusinessPartner extends User {
  business_name: string;
  contact_person: string;
  phone: string;
  business_address: string;
  postcode: string;
  services: string[];
  hourly_rate: number;
  description?: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
}

// Booking Types
export interface BookingRequest {
  id: string;
  customer_id: string;
  business_partner_id: string;
  service_category: string;
  requested_date: string;
  requested_time: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  expires_at: string;
}

// Component Props Types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}
