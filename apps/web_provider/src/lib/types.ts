export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  todayBookings: number;
  weekRevenue: number;
  totalCustomers: number;
  averageRating: number;
  occupancyRate: number;
  pendingBookings: number;
}

export interface Booking {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalAmount: number;
  depositPaid: number;
  notes: string;
  createdAt: string;
}

export type BookingStatus =
  | 'HELD'
  | 'PENDING_PAYMENT'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'EN_ROUTE'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export interface ProviderService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  priceType: string;
  depositAmount: number;
  category: string;
  isActive: boolean;
  addons: ServiceAddon[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  specialties: string[];
  status: 'ACTIVE' | 'INACTIVE';
  schedule: StaffSchedule[];
}

export interface StaffSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBookingAt: string;
  totalSpent: number;
}

export interface ReportData {
  bookingsOverTime: { date: string; count: number }[];
  revenueOverTime: { date: string; amount: number }[];
  staffUtilization: { staffId: string; name: string; utilization: number }[];
  topServices: { name: string; count: number; revenue: number }[];
}

export interface Settings {
  businessName: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  operatingHours: OperatingHour[];
  bookingPolicy: string;
  cancellationPolicy: string;
  autoConfirm: boolean;
  depositRequired: boolean;
  depositPercentage: number;
  notifications: NotificationSettings;
}

export interface OperatingHour {
  dayOfWeek: number;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface NotificationSettings {
  emailBookingConfirmation: boolean;
  emailBookingReminder: boolean;
  smsBookingReminder: boolean;
  reminderHoursBefore: number;
}
