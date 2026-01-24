export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Business {
  id: string;
  ownerId: string;
  businessName: string;
  bio: string;
  serviceCategory: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface Booking {
  id: string;
  customerId: string;
  businessId: string;
  serviceId: string;
  bookingDate: Date;
  status: string;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}
export type Role = 'CUSTOMER' | 'BUSINESS_OWNER';
export type ServiceCategory =
  | 'CLEANING'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'DECORATION'
  | 'PEST_CONTROL'
  | 'CAR_DETAILING';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';
export interface CreateProfileInput {
  fullName: string;
  role: Role;
}
export interface CreateBusinessInput {
  businessName: string;
  bio: string;
  serviceCategory: ServiceCategory;
}
export interface CreateServiceInput {
  businessId: string;
  name: string;
  description: string;
  price: number;
}
export interface CreateBookingInput {
  serviceId: string;
  bookingDate: Date;
  totalCost: number;
}
export interface ProfileWithBusiness extends Profile {
  business: Business | null;
}
export interface BusinessWithServices extends Business {
  services: Service[];
  owner: {
    fullName: string;
  };
}
export interface BookingWithDetails extends Booking {
  customer: {
    fullName: string;
  };
  business: {
    businessName: string;
  };
  service: {
    name: string;
    description: string;
    price?: number;
  };
}
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
export interface BaseResponse {
  success: boolean;
  message?: string;
}
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
