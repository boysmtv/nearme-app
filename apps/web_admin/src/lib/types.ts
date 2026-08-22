export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedResponse<T> { success: boolean; data: T[]; pagination: Pagination; }
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  totalBookings: number;
  totalRevenue: number;
  userGrowth: number;
  tenantGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  category: string;
  ownerName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verificationStatus: string;
  totalBookings: number;
  totalRevenue: number;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  code: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingCode: string;
  customerName: string;
  providerName: string;
  amount: number;
  status: 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  method: string;
  createdAt: string;
  paidAt: string | null;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  subject: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignee: string;
  customerName: string;
  createdAt: string;
  slaDeadline: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  createdAt: string;
}
