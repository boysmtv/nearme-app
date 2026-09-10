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
  Faq,
  Policy,
} from './types';

export const api = {
  get: <T = unknown>(url: string) => apiClient.get<T>(url),
  post: <T = unknown>(url: string, data?: unknown) => apiClient.post<T>(url, data),
  put: <T = unknown>(url: string, data?: unknown) => apiClient.put<T>(url, data),
  delete: <T = unknown>(url: string) => apiClient.delete<T>(url),
};

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
    requestOtp: (email: string, purpose: string = 'LOGIN') =>
      apiClient.post<ApiResponse<void>>('/auth/otp/request', { email, purpose }),
    verifyOtp: (email: string, code: string, purpose: string = 'LOGIN') =>
      apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/otp/verify', { email, code, purpose }),
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
    create: (bookingId: string, data: { rating: number; title?: string; body: string; photoIds?: string[] }) =>
      apiClient.post<ApiResponse<Review>>(`/bookings/${bookingId}/review`, data),
    report: (reviewId: string) =>
      apiClient.post<ApiResponse<Review>>(`/reviews/${reviewId}/report`, {}),
    getPhotos: (reviewId: string) =>
      apiClient.get<ApiResponse<{ id: string; url: string }[]>>(`/reviews/${reviewId}/photos`),
    addPhoto: (reviewId: string, mediaId: string) =>
      apiClient.post<ApiResponse<unknown>>(`/reviews/${reviewId}/photos/${mediaId}`, {}),
  },

  blockedDates: {
    listByProvider: (providerId: string) =>
      apiClient.get<ApiResponse<{ date: string; reason?: string }[]>>(`/public/providers/${providerId}/blocked-dates`),
  },

  media: {
    publicProviderGallery: (providerId: string) =>
      apiClient.get<ApiResponse<{ id: string; url: string; fileName: string; sortOrder: number }[]>>(`/public/providers/${providerId}/media`),
    publicStaffPortfolio: (staffId: string) =>
      apiClient.get<ApiResponse<{ id: string; url: string; fileName: string }[]>>(`/public/staff/${staffId}/media`),
    publicReviewPhotos: (reviewId: string) =>
      apiClient.get<ApiResponse<{ id: string; url: string }[]>>(`/public/reviews/${reviewId}/media`),
  },

  customer: {
    getProfile: () => apiClient.get<ApiResponse<CustomerProfile>>('/customer/profile'),
    updateProfile: (data: { nickname?: string; name?: string; email?: string; phone?: string }) =>
      apiClient.put<ApiResponse<CustomerProfile>>('/customer/profile', data),
  },

  favorites: {
    list: () => apiClient.get<ApiResponse<{ id: string; staffId: string; staffName?: string; title?: string; avatarUrl?: string }[]>>('/customer/favorites'),
    add: (staffId: string) => apiClient.post<ApiResponse<unknown>>(`/customer/favorites/${staffId}`, {}),
    remove: (staffId: string) => apiClient.delete<ApiResponse<void>>(`/customer/favorites/${staffId}`),
  },

  bookings: {
    list: (params?: { status?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString() ? `?${query.toString()}` : '';
      return apiClient.get<ApiResponse<Booking[]>>(`/bookings${qs}`);
    },
    create: (data: BookingRequest) =>
      apiClient.post<ApiResponse<BookingResponse>>('/public/bookings', data),
    verifyPin: (bookingId: string, pin: string) =>
      apiClient.post<ApiResponse<{ pinVerified: boolean; status: string }>>(`/bookings/${bookingId}/verify-pin`, { pin }),
    getById: (id: string) =>
      apiClient.get<ApiResponse<BookingResponse>>(`/bookings/${id}`),
    reschedule: (id: string, data: { newStartsAt: string; newEndsAt: string; expectedVersion: number }) =>
      apiClient.post<ApiResponse<BookingResponse>>(`/bookings/${id}/reschedule`, data),
    cancel: (id: string, reason?: string) => {
      const actor = localStorage.getItem('auth_user') ? (JSON.parse(localStorage.getItem('auth_user') as string).id as string) : '';
      const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      const headers = actor ? { 'X-Actor-Id': actor } : undefined;
      return apiClient.post<ApiResponse<BookingResponse>>(`/bookings/${id}/cancel${qs}`, null, headers);
    },
    ics: (id: string) => apiClient.get<string>(`/bookings/${id}/ics`),
    calendarLink: (id: string) =>
      apiClient.get<ApiResponse<{ googleCalendarUrl: string; icsUrl: string; icsContent: string }>>(`/bookings/${id}/calendar-link`),

    hold: (providerId: string, slotId: string, serviceId: string) =>
      apiClient.post<ApiResponse<{ holdId: string; expiresAt: string }>>(
        `/public/providers/${providerId}/slots/${slotId}/hold`,
        { serviceId },
      ),
    validateCoupon: (code: string, providerId: string, serviceId: string) =>
      apiClient.get<ApiResponse<{ valid: boolean; discountType: string; discountValue: number; discountAmount: number; finalPrice: number; message?: string }>>(
        `/public/bookings/validate-coupon?code=${encodeURIComponent(code)}&providerId=${providerId}&serviceId=${serviceId}`,
      ),
    createPaymentIntent: (bookingId: string, method: string = 'midtrans', data?: { tenantId?: string; amount?: number; currency?: string }) =>
      apiClient.post<ApiResponse<{ paymentUrl: string; redirectUrl: string; orderId: string }>>(
        `/bookings/${bookingId}/payment-intents`,
        {
          tenantId: data?.tenantId,
          amount: data?.amount ?? 0,
          currency: data?.currency ?? 'IDR',
          method,
        },
      ),
    getPaymentStatus: (bookingId: string) =>
      apiClient.get<ApiResponse<{ status: string; paymentMethod?: string; amount?: number }>>(
        `/bookings/${bookingId}/payment-intents`,
      ),
  },

  faqs: {
    listPublic: (tenantId?: string, category?: string) => {
      const params = new URLSearchParams();
      if (tenantId) params.set('tenantId', tenantId);
      if (category) params.set('category', category);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiClient.get<ApiResponse<Faq[]>>(`/public/faqs${qs}`);
    },
    listProvider: () => apiClient.get<ApiResponse<Faq[]>>('/provider/faqs'),
    createProvider: (data: { question: string; answer: string; category?: string; sortOrder?: number }) =>
      apiClient.post<ApiResponse<Faq>>('/provider/faqs', data),
    updateProvider: (id: string, data: Partial<Faq>) =>
      apiClient.put<ApiResponse<Faq>>(`/provider/faqs/${id}`, data),
    deleteProvider: (id: string) => apiClient.delete(`/provider/faqs/${id}`),
    listAdmin: (tenantId?: string) => {
      const qs = tenantId ? `?tenantId=${tenantId}` : '';
      return apiClient.get<ApiResponse<Faq[]>>(`/admin/faqs${qs}`);
    },
    createAdmin: (data: { tenantId?: string | null; question: string; answer: string; category?: string; sortOrder?: number }) =>
      apiClient.post<ApiResponse<Faq>>('/admin/faqs', data),
    updateAdmin: (id: string, data: Partial<Faq>) =>
      apiClient.put<ApiResponse<Faq>>(`/admin/faqs/${id}`, data),
    deleteAdmin: (id: string) => apiClient.delete(`/admin/faqs/${id}`),
  },

  policies: {
    listPublic: (tenantId?: string, type?: string) => {
      const params = new URLSearchParams();
      if (tenantId) params.set('tenantId', tenantId);
      if (type) params.set('type', type);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiClient.get<ApiResponse<Policy[]>>(`/public/policies${qs}`);
    },
    listProvider: () => apiClient.get<ApiResponse<Policy[]>>('/provider/policies'),
    createProvider: (data: { title: string; body: string; type: string; version?: number }) =>
      apiClient.post<ApiResponse<Policy>>('/provider/policies', data),
    updateProvider: (id: string, data: Partial<Policy>) =>
      apiClient.put<ApiResponse<Policy>>(`/provider/policies/${id}`, data),
    deleteProvider: (id: string) => apiClient.delete(`/provider/policies/${id}`),
    listAdmin: (tenantId?: string) => {
      const qs = tenantId ? `?tenantId=${tenantId}` : '';
      return apiClient.get<ApiResponse<Policy[]>>(`/admin/policies${qs}`);
    },
    createAdmin: (data: { tenantId?: string | null; title: string; body: string; type: string; version?: number }) =>
      apiClient.post<ApiResponse<Policy>>('/admin/policies', data),
    updateAdmin: (id: string, data: Partial<Policy>) =>
      apiClient.put<ApiResponse<Policy>>(`/admin/policies/${id}`, data),
    deleteAdmin: (id: string) => apiClient.delete(`/admin/policies/${id}`),
  },

  notifications: {
    list: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString() ? `?${query.toString()}` : '';
      return apiClient.get<ApiResponse<any[]>>(`/notifications${qs}`);
    },
    markRead: (id: string) => apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`, {}),
    markAllRead: () => apiClient.put<ApiResponse<void>>('/notifications/read-all', {}),
  },
};

export const mediaApi = {
  upload: (file: File, ownerType: 'provider' | 'staff' | 'review', ownerId?: string, sortOrder?: number) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('ownerType', ownerType);
    if (ownerId) fd.append('ownerId', ownerId);
    if (sortOrder !== undefined) fd.append('sortOrder', String(sortOrder));
    return apiClient.post<ApiResponse<{ id: string; url: string; fileName: string; sortOrder: number }>>('/media/upload', fd);
  },
  list: (params?: { ownerType?: string; ownerId?: string }) => {
    const q = new URLSearchParams();
    if (params?.ownerType) q.set('ownerType', params.ownerType);
    if (params?.ownerId) q.set('ownerId', params.ownerId);
    const suffix = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<ApiResponse<{ id: string; url: string; fileName: string; sortOrder: number; ownerType: string; ownerId: string }[]>>(`/provider/media${suffix}`);
  },
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/provider/media/${id}`),
  reorder: (orderedIds: string[]) => apiClient.put<ApiResponse<void>>('/provider/media/reorder', { orderedIds }),
  getProviderGallery: (providerId: string) =>
    apiClient.get<ApiResponse<{ id: string; url: string }[]>>(`/public/providers/${providerId}/media`),
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

  tenant: {
    create: (data: { name: string; slug: string; legalName?: string; taxId?: string; phone?: string; email?: string }) =>
      apiClient.post<any>('/provider/tenant', data),
  },

  reviews: {
    list: () => apiClient.get<ApiResponse<any[]>>('/provider/reviews'),
    respond: (reviewId: string, body: string) =>
      apiClient.post<ApiResponse<any>>(`/provider/reviews/${reviewId}/respond`, { body }),
  },

  coupons: {
    list: () => apiClient.get<ApiResponse<any[]>>('/provider/coupons'),
    create: (data: any) => apiClient.post<ApiResponse<any>>('/provider/coupons', data),
    update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/provider/coupons/${id}`, data),
    delete: (id: string) => apiClient.delete(`/provider/coupons/${id}`),
  },

  loyalty: {
    getCustomerHistory: (customerId: string) =>
      apiClient.get<ApiResponse<any>>(`/provider/loyalty/${customerId}`),
    earn: (data: { customerId: string; points: number; description: string }) =>
      apiClient.post<ApiResponse<any>>('/provider/loyalty/earn', data),
  },

  campaigns: {
    list: () => apiClient.get<ApiResponse<any[]>>('/provider/campaigns'),
    create: (data: any) => apiClient.post<ApiResponse<any>>('/provider/campaigns', data),
    activate: (id: string) => apiClient.put<ApiResponse<any>>(`/provider/campaigns/${id}/activate`, {}),
    pause: (id: string) => apiClient.put<ApiResponse<any>>(`/provider/campaigns/${id}/pause`, {}),
  },

  notifications: {
    list: () => apiClient.get<ApiResponse<any[]>>('/notifications'),
    markRead: (id: string) => apiClient.put(`/notifications/${id}/read`, {}),
    markAllRead: () => apiClient.put('/notifications/read-all', {}),
  },

  bookingsProvider: {
    verifyPin: (bookingId: string, pin: string) =>
      apiClient.post<ApiResponse<{ pinVerified: boolean }>>(`/bookings/${bookingId}/verify-pin`, { pin }),
  },
};

export const chatApi = {
  list: () => apiClient.get<ApiResponse<import('./types').Conversation[]>>('/chats'),
  get: (id: string) => apiClient.get<ApiResponse<import('./types').Conversation>>(`/chats/${id}`),
  create: (data: { bookingId?: string; tenantId?: string; providerId?: string; subject?: string }) =>
    apiClient.post<ApiResponse<import('./types').Conversation>>('/chats', data),
  getMessages: (id: string, page = 1, limit = 50) =>
    apiClient.get<ApiResponse<import('./types').ChatMessage[]>>(`/chats/${id}/messages?page=${page}&limit=${limit}`),
  sendMessage: (id: string, data: { body: string; messageType?: string; attachmentUrl?: string }) =>
    apiClient.post<ApiResponse<import('./types').ChatMessage>>(`/chats/${id}/messages`, data),
  getBookingChat: (bookingId: string) =>
    apiClient.get<ApiResponse<import('./types').Conversation & { messages: import('./types').ChatMessage[] }>>(`/bookings/${bookingId}/chat`),
  streamUrl: (id: string) => {
    const base = (apiClient as unknown as { baseUrl?: string })['baseUrl'] || '';
    // SSE endpoint needs Authorization header, but we also support query token for WS
    return `${base}/chats/${id}/events`;
  },
};

export const analyticsApi = {
  getAnalytics: (params: { startDate: string; endDate: string; granularity?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.get<ApiResponse<import('./types').AnalyticsData>>(`/provider/reports/analytics?${q}`);
  },
  exportCsv: (params: { startDate: string; endDate: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.get<string>(`/provider/reports/export?${q}&format=csv`);
  },
};

// ── Admin API ──────────────────────────────────────────
export const adminApi = {
  auth: {
    login: (email: string, password: string, mfaCode?: string) =>
      apiClient.post<ApiResponse<{ accessToken: string; refreshToken?: string; expiresIn?: number; tokenType?: string; requiresMfa?: boolean }>>('/auth/login', { email, password, mfaCode }),
  },
  dashboard: {
    getStats: () => apiClient.get<ApiResponse<import('./types').AdminStats>>('/admin/dashboard/stats'),
    getAnalytics: (days: number = 30) => apiClient.get<ApiResponse<any>>(`/admin/analytics?days=${days}`),
  },
  users: {
    list: (params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<import('./types').PaginatedResponse<import('./types').User>>(`/admin/users?${q.toString()}`);
    },
    updateStatus: (id: string, status: string) =>
      apiClient.put(`/admin/users/${id}/status`, { status }),
  },
  tenants: {
    list: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<import('./types').PaginatedResponse<import('./types').Tenant>>(`/admin/tenants?${q.toString()}`);
    },
    approve: (id: string) => apiClient.put(`/admin/tenants/${id}/approve`, {}),
    reject: (id: string, reason: string) => apiClient.put(`/admin/tenants/${id}/reject`, { reason }),
  },
  bookings: {
    list: (params: { page?: number; limit?: number; status?: string; date?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<import('./types').PaginatedResponse<import('./types').AdminBooking>>(`/admin/bookings?${q.toString()}`);
    },
  },
  payments: {
    list: (params: { page?: number; limit?: number; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<import('./types').PaginatedResponse<import('./types').Payment>>(`/admin/payments?${q.toString()}`);
    },
  },
  cases: {
    list: (params: { page?: number; limit?: number; severity?: string; status?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<import('./types').PaginatedResponse<import('./types').SupportCase>>(`/admin/cases?${q.toString()}`);
    },
    updateStatus: (id: string, status: string) => apiClient.put(`/admin/cases/${id}/status`, { status }),
  },
  auditLogs: {
    list: (params: { action?: string; resourceType?: string; since?: string }) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
      return apiClient.get<ApiResponse<any[]>>(`/admin/audit-logs?${q.toString()}`);
    },
  },
  subscriptions: {
    listPlans: () => apiClient.get<ApiResponse<any[]>>('/admin/subscriptions/plans'),
    list: () => apiClient.get<ApiResponse<any[]>>('/admin/subscriptions'),
    updatePlan: (id: string, data: { status: string }) => apiClient.put(`/admin/subscriptions/plans/${id}`, data),
    cancel: (id: string) => apiClient.put(`/admin/subscriptions/${id}/cancel`, {}),
    reactivate: (id: string) => apiClient.put(`/admin/subscriptions/${id}/reactivate`, {}),
  },
  config: {
    getFlags: () => apiClient.get<ApiResponse<import('./types').FeatureFlag[]>>('/admin/feature-flags'),
    toggleFlag: (id: string, enabled: boolean) => apiClient.put(`/admin/feature-flags/${id}/toggle`, { enabled }),
    createFlag: (data: { name: string; key: string; description: string; enabled: boolean; environment: string }) =>
      apiClient.post('/admin/feature-flags', data),
    deleteFlag: (id: string) => apiClient.delete(`/admin/feature-flags/${id}`),
  },
  export: {
    users: (format: 'csv' | 'json' = 'csv') => apiClient.get<Blob>(`/admin/export/users?format=${format}`, undefined, 'blob'),
    bookings: (format: 'csv' | 'json' = 'csv') => apiClient.get<Blob>(`/admin/export/bookings?format=${format}`, undefined, 'blob'),
  },
};
