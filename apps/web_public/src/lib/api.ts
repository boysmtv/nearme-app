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
          params.append(key, String(value));
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
  },

  bookings: {
    create: (data: BookingRequest) =>
      apiClient.post<ApiResponse<BookingResponse>>('/public/bookings', data),

    hold: (providerId: string, slotId: string, serviceId: string) =>
      apiClient.post<ApiResponse<{ holdId: string; expiresAt: string }>>(
        `/public/providers/${providerId}/slots/${slotId}/hold`,
        { serviceId },
      ),
  },
};
