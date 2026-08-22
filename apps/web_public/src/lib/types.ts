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
  staffId: string;
  staffName: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
}

export interface BookingRequest {
  providerId: string;
  serviceId: string;
  staffId: string;
  slotId: string;
  addons: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  idempotencyKey: string;
}

export interface BookingResponse {
  id: string;
  code: string;
  status: string;
  totalAmount: number;
  depositAmount: number;
  paymentUrl: string | null;
  createdAt: string;
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
