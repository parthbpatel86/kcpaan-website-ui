// src/api/adminApiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const ADMIN_TOKEN_KEY = '@kcpaan_admin_token';
const ADMIN_REFRESH_KEY = '@kcpaan_admin_refresh';
const ADMIN_USER_KEY = '@kcpaan_admin_user';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token
adminApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// Handle 401 with refresh
adminApi.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = await AsyncStorage.getItem(ADMIN_REFRESH_KEY);
        if (refresh) {
          const res = await axios.post(`${API_BASE_URL}/admin/auth/refresh`, { refresh_token: refresh });
          await AsyncStorage.setItem(ADMIN_TOKEN_KEY, res.data.data.access_token);
          orig.headers.Authorization = `Bearer ${res.data.data.access_token}`;
          return adminApi(orig);
        }
      } catch {
        await adminApi.clearAdminAuth();
      }
    }
    return Promise.reject(error);
  }
);

const adminApiService = {

  // ── Stored token helpers ──────────────────────────────
  clearAdminAuth: async () => {
    await AsyncStorage.multiRemove([ADMIN_TOKEN_KEY, ADMIN_REFRESH_KEY, ADMIN_USER_KEY]);
  },

  getStoredAdminUser: async () => {
    const data = await AsyncStorage.getItem(ADMIN_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  getStoredAdminToken: async () => AsyncStorage.getItem(ADMIN_TOKEN_KEY),

  // ── AUTH ──────────────────────────────────────────────
  adminLogin: async (username, password) => {
    const res = await adminApi.post('/admin/auth/login', { username, password });
    if (res.success) {
      await AsyncStorage.setItem(ADMIN_TOKEN_KEY, res.data.access_token);
      if (res.data.refresh_token) await AsyncStorage.setItem(ADMIN_REFRESH_KEY, res.data.refresh_token);
      await AsyncStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.data.admin));
    }
    return res;
  },

  adminLogout: async () => {
    try { await adminApi.post('/admin/auth/logout'); } catch {}
    await adminApiService.clearAdminAuth();
  },

  // ── DASHBOARD ─────────────────────────────────────────
  getDashboardStats: () => adminApi.get('/admin/dashboard/stats'),
  getDashboardCharts: () => adminApi.get('/admin/dashboard/charts'),

  // ── ORDERS ───────────────────────────────────────────
  getOrders: (page = 1, filters = {}) => adminApi.get('/admin/orders', { params: { page, ...filters } }),
  getOrderById: (id) => adminApi.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, trackingNumber = null) =>
    adminApi.put(`/admin/orders/${id}/status`, { status, tracking_number: trackingNumber }),
  updatePaymentStatus: (id, status) =>
    adminApi.put(`/admin/orders/${id}/payment`, { payment_status: status }),
  addOrderNote: (id, note) => adminApi.post(`/admin/orders/${id}/notes`, { note }),
  cancelOrder: (id, reason) => adminApi.post(`/admin/orders/${id}/cancel`, { reason }),

  // ── PRODUCTS ─────────────────────────────────────────
  getProducts: (page = 1, filters = {}) => adminApi.get('/admin/products', { params: { page, ...filters } }),
  getProductById: (id) => adminApi.get(`/admin/products/${id}`),
  createProduct: (data) => adminApi.post('/admin/products', data),
  updateProduct: (id, data) => adminApi.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => adminApi.delete(`/admin/products/${id}`),
  toggleProductActive: (id, isActive) =>
    adminApi.patch(`/admin/products/${id}/toggle`, { is_active: isActive }),
  updateProductInventory: (id, quantity) =>
    adminApi.patch(`/admin/products/${id}/inventory`, { quantity }),
  bulkUpdateProducts: (ids, updates) =>
    adminApi.put('/admin/products/bulk', { ids, updates }),

  // Variants
  getProductVariants: (productId) => adminApi.get(`/admin/products/${productId}/variants`),
  createVariant: (productId, data) => adminApi.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) =>
    adminApi.put(`/admin/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) =>
    adminApi.delete(`/admin/products/${productId}/variants/${variantId}`),

  // ── CATEGORIES ───────────────────────────────────────
  getCategories: () => adminApi.get('/admin/categories'),
  createCategory: (data) => adminApi.post('/admin/categories', data),
  updateCategory: (id, data) => adminApi.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => adminApi.delete(`/admin/categories/${id}`),
  reorderCategories: (orders) => adminApi.put('/admin/categories/reorder', { orders }),

  // ── MENU ─────────────────────────────────────────────
  getMenuItems: () => adminApi.get('/admin/menu'),
  createMenuItem: (data) => adminApi.post('/admin/menu', data),
  updateMenuItem: (id, data) => adminApi.put(`/admin/menu/${id}`, data),
  deleteMenuItem: (id) => adminApi.delete(`/admin/menu/${id}`),

  // ── EVENTS ───────────────────────────────────────────
  getEvents: () => adminApi.get('/admin/events'),
  createEvent: (data) => adminApi.post('/admin/events', data),
  updateEvent: (id, data) => adminApi.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => adminApi.delete(`/admin/events/${id}`),

  // ── CATERING ─────────────────────────────────────────
  getCateringInquiries: (status = null) =>
    adminApi.get('/admin/catering', { params: status ? { status } : {} }),
  updateCateringStatus: (id, status, notes = null) =>
    adminApi.put(`/admin/catering/${id}`, { status, admin_notes: notes }),

  // ── SHIPPING ─────────────────────────────────────────
  getShippingZones: () => adminApi.get('/admin/shipping/zones'),
  createShippingZone: (data) => adminApi.post('/admin/shipping/zones', data),
  updateShippingZone: (id, data) => adminApi.put(`/admin/shipping/zones/${id}`, data),
  deleteShippingZone: (id) => adminApi.delete(`/admin/shipping/zones/${id}`),
  getShippingMethods: (zoneId) => adminApi.get(`/admin/shipping/zones/${zoneId}/methods`),
  createShippingMethod: (zoneId, data) => adminApi.post(`/admin/shipping/zones/${zoneId}/methods`, data),
  updateShippingMethod: (zoneId, methodId, data) =>
    adminApi.put(`/admin/shipping/zones/${zoneId}/methods/${methodId}`, data),
  deleteShippingMethod: (zoneId, methodId) =>
    adminApi.delete(`/admin/shipping/zones/${zoneId}/methods/${methodId}`),

  // ── CONTENT ──────────────────────────────────────────
  getContent: (page = null) =>
    adminApi.get('/admin/content', { params: page ? { page_section: page } : {} }),
  updateContent: (id, data) => adminApi.put(`/admin/content/${id}`, data),
  createContent: (data) => adminApi.post('/admin/content', data),
  deleteContent: (id) => adminApi.delete(`/admin/content/${id}`),

  // ── MEDIA / IMAGES ────────────────────────────────────
  getMedia: (page = 1, type = null) =>
    adminApi.get('/admin/media', { params: { page, type } }),
  uploadMedia: async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
    return axios.post(`${API_BASE_URL}/admin/media/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });
  },
  deleteMedia: (id) => adminApi.delete(`/admin/media/${id}`),
  getProductImages: (productId) => adminApi.get(`/admin/products/${productId}/images`),
  uploadProductImage: async (productId, file, isPrimary = false) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', isPrimary);
    const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
    return axios.post(`${API_BASE_URL}/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });
  },
  deleteProductImage: (productId, imageId) =>
    adminApi.delete(`/admin/products/${productId}/images/${imageId}`),

  // ── CUSTOMERS ─────────────────────────────────────────
  getCustomers: (page = 1, search = null) =>
    adminApi.get('/admin/customers', { params: { page, search } }),
  getCustomerById: (id) => adminApi.get(`/admin/customers/${id}`),
  toggleCustomerActive: (id, isActive) =>
    adminApi.patch(`/admin/customers/${id}/toggle`, { is_active: isActive }),

  // ── REVIEWS ──────────────────────────────────────────
  getReviews: (status = null) =>
    adminApi.get('/admin/reviews', { params: status ? { status } : {} }),
  updateReviewStatus: (id, status) => adminApi.put(`/admin/reviews/${id}`, { status }),
  toggleReviewFeatured: (id, isFeatured) =>
    adminApi.patch(`/admin/reviews/${id}/featured`, { is_featured: isFeatured }),
  deleteReview: (id) => adminApi.delete(`/admin/reviews/${id}`),

  // ── SETTINGS ─────────────────────────────────────────
  getSettings: (category = null) =>
    adminApi.get('/admin/settings', { params: category ? { category } : {} }),
  updateSetting: (key, value) => adminApi.put(`/admin/settings/${key}`, { value }),
  bulkUpdateSettings: (settings) => adminApi.put('/admin/settings/bulk', { settings }),
};

export { ADMIN_TOKEN_KEY, ADMIN_USER_KEY };
export default adminApiService;
