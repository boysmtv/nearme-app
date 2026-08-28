import { apiClient } from '@dekat/web-api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Category,
  Provider,
  Service,
  Staff,
  TimeSlot,
  Review,
  BookingRequest,
  BookingResponse,
  SearchFilters,
  SearchResult,
  DashboardStats,
  Booking,
  ProviderService,
  StaffMember,
  StaffSchedule,
  Customer,
  ReportData,
  Settings,
  CustomerProfile,
} from './types';

export const publicApi = {
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }>>('/auth/login', {
        email,
        password,
      }),
    register: (name: string, email: string, phone: string | undefined, password: string) =>
      apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }>>('/auth/register', {
        name,
        email,
        phone,
        password,
      }),
  },

  categories: {
    list: () =>
      apiClient.get<ApiResponse<Category[]>>('/public/categories'),
  },

  providers: {
    search: (filters: SearchFilters) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          const paramKey = key === 'query' ? 'q' : key;
          params.append(paramKey, String(value));
        }
      });
      return apiClient.get<ApiResponse<SearchResult>>(
        `/public/providers?${params.toString()}`,
      );
    },

    getBySlug: (slug: string) =>
      apiClient.get<ApiResponse<Provider>>(`/public/providers/${slug}`),

    getFeatured: () =>
      apiClient.get<ApiResponse<Provider[]>>('/public/providers/featured'),
  },

  services: {
    listByProvider: (providerId: string) =>
      apiClient.get<ApiResponse<Service[]>>(
        `/public/providers/${providerId}/services`,
      ),
  },

  staff: {
    listByProvider: (providerId: string) =>
      apiClient.get<ApiResponse<Staff[]>>(
        `/public/providers/${providerId}/staff`,
      ),
  },

  availability: {
    getSlots: (providerId: string, serviceId: string, staffId: string, date: string) => {
      const params = new URLSearchParams({ serviceId, staffId, date });
      return apiClient.get<ApiResponse<TimeSlot[]>>(
        `/public/providers/${providerId}/availability?${params.toString()}`,
      );
    },
  },

  reviews: {
    listByProvider: (providerId: string, page = 1, limit = 10) => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      return apiClient.get<PaginatedResponse<Review>>(
        `/public/providers/${providerId}/reviews?${params.toString()}`,
      );
    },
    create: (bookingId: string, data: { rating: number; title?: string; body: string }) =>
      apiClient.post<ApiResponse<Review>>(`/bookings/${bookingId}/review`, data),
    report: (reviewId: string) =>
      apiClient.post<ApiResponse<Review>>(`/reviews/${reviewId}/report`, {}),
  },

  blockedDates: {
    listByProvider: (providerId: string) =>
      apiClient.get<ApiResponse<{ date: string; reason?: string }[]>>(`/public/providers/${providerId}/blocked-dates`),
  },

  customer: {
    getProfile: () => apiClient.get<ApiResponse<CustomerProfile>>('/customer/profile'),
    updateProfile: (data: { nickname?: string; name?: string; email?: string; phone?: string }) =>
      apiClient.put<ApiResponse<CustomerProfile>>('/customer/profile', data),
  },

  bookings: {
    create: (data: BookingRequest) =>
      apiClient.post<ApiResponse<BookingResponse>>('/public/bookings', data),
    verifyPin: (bookingId: string, pin: string) =>
      apiClient.post<ApiResponse<{ pinVerified: boolean; status: string }>>(`/bookings/${bookingId}/verify-pin`, { pin }),
    getById: (id: string) =>
      apiClient.get<ApiResponse<BookingResponse>>(`/bookings/${id}`),

    hold: (providerId: string, slotId: string, serviceId: string) =>
      apiClient.post<ApiResponse<{ holdId: string; expiresAt: string }>>(
        `/public/providers/${providerId}/slots/${slotId}/hold`,
        { serviceId },
      ),
  },
};

export const providerApi = {
  auth: {
    logout: (refreshToken?: string) =>
      apiClient.post(
        `/auth/logout${refreshToken ? `?refreshToken=${encodeURIComponent(refreshToken)}` : ''}`,
        {},
      ),
  },

  dashboard: {
    getStats: () => apiClient.get<ApiResponse<DashboardStats>>('/provider/dashboard/stats'),
    getRecentBookings: () =>
      apiClient.get<ApiResponse<Booking[]>>('/provider/dashboard/recent-bookings'),
  },

  bookings: {
    list: (params: { page?: number; limit?: number; status?: string; date?: string }) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
      return apiClient.get<PaginatedResponse<Booking>>(
        `/provider/bookings?${query.toString()}`,
      );
    },
    getById: (id: string) =>
      apiClient.get<ApiResponse<Booking>>(`/provider/bookings/${id}`),
    updateStatus: (id: string, status: string, reason?: string) =>
      apiClient.put<ApiResponse<Booking>>(`/provider/bookings/${id}/status`, {
        status,
        reason,
      }),
    reschedule: (id: string, newSlotId: string) =>
      apiClient.put<ApiResponse<Booking>>(`/provider/bookings/${id}/reschedule`, {
        newSlotId,
      }),
  },

  calendar: {
    getBookings: (startDate: string, endDate: string) => {
      const query = new URLSearchParams({ startDate, endDate });
      return apiClient.get<ApiResponse<Booking[]>>(
        `/provider/calendar?${query.toString()}`,
      );
    },
  },

  services: {
    list: () => apiClient.get<ApiResponse<ProviderService[]>>('/provider/services'),
    create: (data: { name: string; description: string; price: number; duration: number }) =>
      apiClient.post<ApiResponse<ProviderService>>('/provider/services', data),
    update: (id: string, data: Partial<ProviderService>) =>
      apiClient.put<ApiResponse<ProviderService>>(`/provider/services/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/provider/services/${id}`),
  },

  staff: {
    list: () => apiClient.get<ApiResponse<StaffMember[]>>('/provider/staff'),
    invite: (data: { displayName: string; email: string }) =>
      apiClient.post<ApiResponse<StaffMember>>('/provider/staff', data),
    update: (id: string, data: Partial<StaffMember>) =>
      apiClient.put<ApiResponse<StaffMember>>(`/provider/staff/${id}`, data),
    updateSchedule: (id: string, schedule: StaffSchedule[]) =>
      apiClient.post(`/provider/staff/${id}/schedule`, schedule),
    deactivate: (id: string) =>
      apiClient.delete(`/provider/staff/${id}`),
  },

  customers: {
    list: (params: { page?: number; limit?: number; search?: string }) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
      return apiClient.get<PaginatedResponse<Customer>>(
        `/provider/customers?${query.toString()}`,
      );
    },
  },

  reports: {
    getReport: (params: { startDate: string; endDate: string; staffId?: string }) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
      return apiClient.get<ApiResponse<ReportData>>(
        `/provider/reports?${query.toString()}`,
      );
    },
    exportCsv: (params: { startDate: string; endDate: string }) => {
      const query = new URLSearchParams(params);
      return apiClient.get<ApiResponse<{ downloadUrl: string }>>(
        `/provider/reports/export?${query.toString()}`,
      );
    },
  },

  settings: {
    get: () => apiClient.get<ApiResponse<Settings>>('/provider/settings'),
    update: (data: Partial<Settings>) =>
      apiClient.put<ApiResponse<Settings>>('/provider/settings', data),
  },

  blockedDates: {
    list: () => apiClient.get<ApiResponse<{ date: string; reason?: string }[]>>('/provider/blocked-dates'),
    add: (data: { date: string; reason?: string }) =>
      apiClient.post<ApiResponse<{ date: string }>>('/provider/blocked-dates', data),
    remove: (date: string) =>
      apiClient.delete<ApiResponse<void>>(`/provider/blocked-dates/${date}`),
  },

  bookingsProvider: {
    verifyPin: (bookingId: string, pin: string) =>
      apiClient.post<ApiResponse<{ pinVerified: boolean }>>(`/bookings/${bookingId}/verify-pin`, { pin }),
  },
};
