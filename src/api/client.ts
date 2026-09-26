import {
  Category,
  Design,
  Order,
  Customer,
  WebsiteContent,
  AdminAnalytics,
} from '../types/index.ts';

const TOKEN_KEY = 'sb_admin_token';
const USER_KEY = 'sb_admin_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const data = await res.json();
      errMessage = data.error || data.message || errMessage;
    } catch {
      errMessage = `HTTP error ${res.status}`;
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Public
  getCategories: () => request<Category[]>('/api/categories'),
  getDesigns: (params?: { category?: string; search?: string; sort?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.featured) query.append('featured', 'true');
    const qs = query.toString();
    return request<Design[]>(`/api/designs${qs ? `?${qs}` : ''}`);
  },
  getDesign: (slugOrId: string | number) => request<Design>(`/api/designs/${slugOrId}`),
  createOrder: (data: any) =>
    request<{ success: boolean; order: Order; message: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  trackOrder: (orderNumber: string, phone: string) =>
    request<Order>(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`),
  submitPaymentProof: (data: { orderNumber: string; phone: string; paymentScreenshotUrl: string; paymentTransactionId?: string }) =>
    request<Order>('/api/orders/payment-proof', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getContent: () => request<WebsiteContent>('/api/content'),
  uploadImage: (imageBase64: string, filename?: string) =>
    request<{ url: string; filename: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename }),
    }),

  // Admin Auth
  login: async (email: string, password: string) => {
    const res = await request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },
  setAuthSession: (token: string, user: any) => {
    authStorage.setToken(token);
    authStorage.setUser(user);
  },
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    authStorage.clearToken();
  },
  getMe: () => request<{ user: any }>('/api/auth/me'),

  // Admin Categories
  getAdminCategories: () => request<Category[]>('/api/admin/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: number, data: Partial<Category>) =>
    request<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    request<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  // Admin Designs
  getAdminDesigns: () => request<Design[]>('/api/admin/designs'),
  createDesign: (data: any) =>
    request<Design>('/api/admin/designs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDesign: (id: number, data: any) =>
    request<Design>(`/api/admin/designs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDesign: (id: number) =>
    request<{ success: boolean }>(`/api/admin/designs/${id}`, {
      method: 'DELETE',
    }),

  // Admin Orders
  getAdminOrders: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<Order[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
  },
  exportOrdersCsv: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    const token = authStorage.getToken();
    const res = await fetch(`/api/admin/orders/export/csv${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let err = 'Failed to export orders CSV';
      try {
        const data = await res.json();
        err = data.error || err;
      } catch {
        // ignore
      }
      throw new Error(err);
    }
    return res.blob();
  },
  getAdminOrderDetail: (id: number) => request<Order>(`/api/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: string, note?: string, expectedCompletionDate?: string) =>
    request<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note, expectedCompletionDate }),
    }),
  updateOrderDetails: (id: number, data: Partial<Order>) =>
    request<Order>(`/api/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  verifyOrderPayment: (id: number, data?: { notes?: string }) =>
    request<Order>(`/api/admin/orders/${id}/verify-payment`, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    }),
  rejectOrderPayment: (id: number, data: { reason: string }) =>
    request<Order>(`/api/admin/orders/${id}/reject-payment`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Customers
  getAdminCustomers: () => request<Customer[]>('/api/admin/customers'),
  getAdminCustomerDetail: (id: number) => request<Customer>(`/api/admin/customers/${id}`),

  // Admin Website Content
  updateContent: (updates: Partial<WebsiteContent>) =>
    request<{ success: boolean; message: string }>('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Admin Analytics
  getAnalytics: () => request<AdminAnalytics>('/api/admin/analytics'),

  // Admin Security / Change Username & Password
  getSecuritySettings: () =>
    request<{
      currentUsername: string;
      isCustomized: boolean;
      updatedAt: string | null;
    }>('/api/admin/security/credentials'),

  updateCredentials: (data: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      user: { email: string; name: string; role: string };
    }>('/api/admin/security/credentials', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetCredentialsToDefault: (currentPassword: string) =>
    request<{
      success: boolean;
      message: string;
      user: { email: string; name: string; role: string };
    }>('/api/admin/security/credentials/reset', {
      method: 'POST',
      body: JSON.stringify({ currentPassword }),
    }),
};
