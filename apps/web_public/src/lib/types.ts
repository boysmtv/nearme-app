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
  avatar?: string;
  title?: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  portfolio?: { id: string; url: string; fileName: string; sortOrder: number }[];
  portfolioCount?: number;
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
  verifiedBooking?: boolean;
  photos?: { id: string; url: string; fileName?: string }[];
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
  depositRequired?: boolean;
  cancelDeadline?: string;
  rescheduleCount?: number;
  maxReschedule?: number;
  cancelPolicy?: string;
  createdAt?: string;
  startsAt?: string;
  endsAt?: string;
  confirmationPin?: string;
  pinVerified?: boolean;
}

export interface Faq {
  id: string;
  tenantId?: string | null;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Policy {
  id: string;
  tenantId?: string | null;
  title: string;
  body: string;
  type: string;
  version?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  date?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  providers: Provider[];
  pagination: Pagination;
}

export interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  weekBookings: number;
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
  slotTime?: string;
  startsAt?: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
  totalAmount?: number;
  depositPaid: number;
  depositAmount?: number;
  confirmationPin?: string;
  notes: string;
  createdAt: string;
}

export type BookingStatus =
  | 'HELD'
  | 'PENDING_PAYMENT'
  | 'PENDING_APPROVAL'
  | 'IN_PROGRESS'
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

export interface Conversation {
  id: string;
  bookingId?: string | null;
  tenantId: string;
  customerId: string;
  providerId: string;
  subject?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: { body: string; createdAt: string; senderRole: string } | null;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  body: string;
  messageType: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

export interface AnalyticsData {
  revenueByDay: { date: string; revenue: number; count: number }[];
  bookingsByStatus: Record<string, number>;
  retention: { totalCustomers: number; returningCustomers: number; newCustomers: number; retentionRate: number; retentionPercent: number };
  funnel: Record<string, number>;
  topServices: { serviceId: string; serviceName: string; bookingCount: number; revenue: number }[];
  staffUtilization: { staffId: string; staffName: string; bookingCount: number }[];
  currency: string;
  startDate: string;
  endDate: string;
  granularity: string;
}

// ── Admin Types ──────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  totalBookings: number;
  totalRevenue: number;
  userGrowth?: { value: number; isPositive: boolean };
  tenantGrowth?: { value: number; isPositive: boolean };
  bookingGrowth?: { value: number; isPositive: boolean };
  revenueGrowth?: { value: number; isPositive: boolean };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  status: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface AdminBooking {
  id: string;
  code: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  startTime: string;
  status: string;
  totalAmount: number;
}

export interface Payment {
  id: string;
  bookingCode: string;
  customerName: string;
  providerName: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  subject: string;
  customerName: string;
  severity: string;
  status: string;
  assignee?: string;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key?: string;
  description: string;
  enabled: boolean;
  environment?: string;
  targetEnvironment?: string;
  percentage?: number;
  ownerId?: string;
  expiresAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: { pagination: Pagination; data: T[] };
}
