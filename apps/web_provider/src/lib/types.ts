export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: { pagination: Pagination; data: T[] };
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
  avgRating: number;
  occupancyRate: number;
  pendingBookings: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  time: string;
  startsAt?: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
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
  currency?: string;
  imageUrl?: string;
  active: boolean;
}

export interface StaffMember {
  id: string;
  displayName: string;
  title?: string;
  email?: string;
  isActive: boolean;
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
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  avgRating: number;
  currency: string;
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
