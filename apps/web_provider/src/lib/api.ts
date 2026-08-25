import { apiClient } from '@dekat/web-api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  Booking,
  ProviderService,
  StaffMember,
  StaffSchedule,
  Customer,
  ReportData,
  Settings,
} from './types';

export const providerApi = {
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/login', {
        email,
        password,
      }),
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
    create: (data: { name: string; price: number; duration: number }) =>
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
};
