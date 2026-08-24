import { apiClient } from '@dekat/web-api-client';
import type {
  ApiResponse, PaginatedResponse, AdminStats, User, Tenant,
  AdminBooking, Payment, SupportCase, FeatureFlag,
} from './types';

export const adminApi = {
  auth: {
    login: (email: string, password: string, mfaCode?: string) =>
      apiClient.post<ApiResponse<{ accessToken: string; requiresMfa: boolean }>>('/auth/login', { email, password, mfaCode }),
  },

  dashboard: {
    getStats: () => apiClient.get<ApiResponse<AdminStats>>('/admin/dashboard/stats'),
  },

  users: {
    list: (params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<PaginatedResponse<User>>(`/admin/users?${q.toString()}`);
    },
    updateStatus: (id: string, status: string) =>
      apiClient.put(`/admin/users/${id}/status`, { status }),
  },

  tenants: {
    list: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<PaginatedResponse<Tenant>>(`/admin/tenants?${q.toString()}`);
    },
    approve: (id: string) => apiClient.put(`/admin/tenants/${id}/approve`, {}),
    reject: (id: string, reason: string) => apiClient.put(`/admin/tenants/${id}/reject`, { reason }),
  },

  bookings: {
    list: (params: { page?: number; limit?: number; status?: string; date?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<PaginatedResponse<AdminBooking>>(`/admin/bookings?${q.toString()}`);
    },
  },

  payments: {
    list: (params: { page?: number; limit?: number; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<PaginatedResponse<Payment>>(`/admin/payments?${q.toString()}`);
    },
  },

  cases: {
    list: (params: { page?: number; limit?: number; severity?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<PaginatedResponse<SupportCase>>(`/admin/cases?${q.toString()}`);
    },
    updateStatus: (id: string, status: string) => apiClient.put(`/admin/cases/${id}/status`, { status }),
  },

  config: {
    getFlags: () => apiClient.get<ApiResponse<FeatureFlag[]>>('/admin/config/flags'),
    toggleFlag: (id: string, enabled: boolean) => apiClient.put(`/admin/config/flags/${id}`, { enabled }),
  },
};
