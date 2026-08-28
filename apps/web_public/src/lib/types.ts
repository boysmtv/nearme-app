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

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  serviceCount: number;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: OperatingHour[];
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface OperatingHour {
  dayOfWeek: number;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  priceType: 'FIXED' | 'STARTING_FROM' | 'HOURLY' | 'QUOTE_REQUIRED';
  depositAmount: number;
  category: string;
  addons: Addon[];
  imageUrl: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Staff {
  id: string;
  providerId: string;
  name: string;
  avatarUrl: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  title?: string;
  body?: string;
  serviceName: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  body: string;
}

export interface CustomerProfile {
  exists: boolean;
  id?: string;
  nickname?: string;
  name?: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
  totalBookings?: number;
  totalSpent?: number;
}

export interface BookingRequest {
  providerId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  idempotencyKey: string;
}

export interface BookingResponse {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount?: number;
  depositAmount?: number;
  createdAt?: string;
  confirmationPin?: string;
  pinVerified?: boolean;
}

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  date: string;
  sort: string;
  page: number;
  limit: number;
}

export interface SearchResult {
  providers: Provider[];
  pagination: Pagination;
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

export interface NotificationSettings {
  emailBookingConfirmation: boolean;
  emailBookingReminder: boolean;
  smsBookingReminder: boolean;
  reminderHoursBefore: number;
}
