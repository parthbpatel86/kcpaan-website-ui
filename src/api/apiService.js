/**
 * KC Paan - Customer API Service (src/api/apiService.js)
 *
 * All calls go through named endpoints from constants.js.
 * No raw INSERT/SELECT/table_name calls — every endpoint calls a
 * dedicated Flask route which delegates to a stored procedure.
 */
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: auto-refresh on 401 ─────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refresh) {
          const res = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`,
            { refresh_token: refresh },
          );
          const newToken = res.data?.data?.access_token;
          if (newToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
            orig.headers.Authorization = `Bearer ${newToken}`;
            return api(orig);
          }
        }
      } catch {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
      }
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────
const apiService = {
  // ── HEALTH ───────────────────────────────────────────────
  checkHealth: () => api.get(API_ENDPOINTS.HEALTH),

  // ── AUTH ─────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
    if (res.success && res.data) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        res.data.access_token,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        res.data.refresh_token,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(res.data.user),
      );
    }
    return res;
  },

  register: (userData) =>
    api.post(API_ENDPOINTS.AUTH_REGISTER, {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
    }),

  logout: async () => {
    const refresh = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT, { refresh_token: refresh });
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    }
  },

  getCurrentUser: () => api.get(API_ENDPOINTS.AUTH_ME),

  verifyEmail: (token) => api.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token }),
  forgotPassword: (email) =>
    api.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email }),
  resetPassword: (token, pwd) =>
    api.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, new_password: pwd }),

  // ── PRODUCTS ─────────────────────────────────────────────
  getProducts: (params = {}) => api.get(API_ENDPOINTS.PRODUCTS, { params }),

  getFeaturedProducts: (limit = 8) =>
    api.get(API_ENDPOINTS.PRODUCTS_FEATURED, { params: { limit } }),

  searchProducts: (q, limit = 20) =>
    api.get(API_ENDPOINTS.PRODUCTS_SEARCH, { params: { q, limit } }),

  getProductById: (id) => api.get(API_ENDPOINTS.PRODUCT_BY_ID(id)),

  // ── CATEGORIES ───────────────────────────────────────────
  getCategories: () => api.get(API_ENDPOINTS.CATEGORIES),

  getCategoryProducts: (categoryId, page = 1, limit = 20) =>
    api.get(API_ENDPOINTS.CATEGORY_PRODUCTS(categoryId), {
      params: { page, limit },
    }),

  // ── REVIEWS ──────────────────────────────────────────────
  getReviews: (params = {}) => api.get(API_ENDPOINTS.REVIEWS, { params }),

  getGoogleReviews: (limit = 10) =>
    api.get(API_ENDPOINTS.REVIEWS_GOOGLE, { params: { limit } }),

  getFeaturedReviews: (limit = 6) =>
    api.get(API_ENDPOINTS.REVIEWS_FEATURED, { params: { limit } }),

  getProductReviews: (productId, limit = 10) =>
    api.get(API_ENDPOINTS.PRODUCT_REVIEWS(productId), { params: { limit } }),

  submitReview: (reviewData) =>
    api.post(API_ENDPOINTS.REVIEW_SUBMIT, {
      product_id: reviewData.productId,
      author_name: reviewData.name,
      author_email: reviewData.email,
      rating: reviewData.rating,
      review_text: reviewData.text,
      is_verified_purchase: reviewData.isVerified ? 1 : 0,
    }),

  // ── EVENTS ───────────────────────────────────────────────
  getEvents: (status = null) =>
    api.get(API_ENDPOINTS.EVENTS, { params: status ? { status } : {} }),

  getUpcomingEvents: (limit = 5) =>
    api.get(API_ENDPOINTS.EVENTS_UPCOMING, { params: { limit } }),

  getPastEvents: (limit = 10, offset = 0) =>
    api.get(API_ENDPOINTS.EVENTS_PAST, { params: { limit, offset } }),

  getFeaturedEvents: () => api.get(API_ENDPOINTS.EVENTS_FEATURED),

  bookEvent: (bookingData) =>
    api.post(API_ENDPOINTS.EVENT_BOOK, {
      event_id: bookingData.eventId,
      event_name: bookingData.eventName,
      first_name: bookingData.firstName,
      last_name: bookingData.lastName,
      email: bookingData.email,
      phone: bookingData.phone,
      guest_count: bookingData.guestCount,
      message: bookingData.message,
    }),

  // ── MENU ─────────────────────────────────────────────────
  getMenu: () => api.get(API_ENDPOINTS.MENU),
  getFeaturedMenu: (limit = 6) =>
    api.get(API_ENDPOINTS.MENU_FEATURED, { params: { limit } }),

  // ── CART ─────────────────────────────────────────────────
  getCart: (sessionId) =>
    api.get(API_ENDPOINTS.CART, { params: { session_id: sessionId } }),

  addToCart: (sessionId, productId, variantId = null, quantity = 1) =>
    api.post(API_ENDPOINTS.CART_ADD, {
      session_id: sessionId,
      product_id: productId,
      variant_id: variantId,
      quantity,
    }),

  updateCartItem: (cartItemId, quantity) =>
    api.put(API_ENDPOINTS.CART_UPDATE, { cart_item_id: cartItemId, quantity }),

  removeCartItem: (cartItemId) =>
    api.delete(API_ENDPOINTS.CART_REMOVE, {
      params: { cart_item_id: cartItemId },
    }),

  clearCart: (sessionId) =>
    api.delete(API_ENDPOINTS.CART_CLEAR, { params: { session_id: sessionId } }),

  // ── ORDERS ───────────────────────────────────────────────
  createOrder: (orderData) => api.post(API_ENDPOINTS.ORDERS, orderData),

  getOrderById: (id) => api.get(API_ENDPOINTS.ORDER_BY_ID(id)),

  getCustomerOrders: (customerId, page = 1, limit = 10) =>
    api.get(API_ENDPOINTS.CUSTOMER_ORDERS(customerId), {
      params: { page, limit },
    }),

  // ── CUSTOMERS ────────────────────────────────────────────
  getCustomerProfile: (customerId) =>
    api.get(API_ENDPOINTS.CUSTOMER_PROFILE(customerId)),

  updateCustomerProfile: (customerId, data) =>
    api.put(API_ENDPOINTS.CUSTOMER_PROFILE(customerId), data),

  getCustomerOrderHistory: (customerId, page = 1) =>
    api.get(API_ENDPOINTS.CUSTOMER_PROFILE_ORDERS(customerId), {
      params: { page },
    }),

  // ── CONTACT ──────────────────────────────────────────────
  submitContactForm: (formData) =>
    api.post(API_ENDPOINTS.CONTACT, {
      type: formData.type || "general",
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
    }),

  submitCateringInquiry: (formData) =>
    api.post(API_ENDPOINTS.CONTACT_CATERING, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || "Catering Inquiry",
      message: formData.message,
    }),

  // ── GENERIC CRUD (common.py /api/v1) ─────────────────────
  // Use these only for one-off queries; prefer named endpoints above.
  selectRecords: (
    tableName,
    condition = null,
    columns = "*",
    orderBy = null,
    limit = null,
  ) =>
    api.post(API_ENDPOINTS.V1_SELECT, {
      table_name: tableName,
      condition,
      columns,
      order_by: orderBy,
      limit,
    }),

  insertRecord: (tableName, columns, values) =>
    api.post(API_ENDPOINTS.V1_INSERT, {
      table_name: tableName,
      columns,
      values,
    }),

  updateRecord: (tableName, setClause, condition) =>
    api.post(API_ENDPOINTS.V1_UPDATE, {
      table_name: tableName,
      set_clause: setClause,
      condition,
    }),

  deleteRecord: (tableName, condition) =>
    api.post(API_ENDPOINTS.V1_DELETE, { table_name: tableName, condition }),

  executeQuery: (query, params = null) =>
    api.post(API_ENDPOINTS.V1_QUERY, { query, params }),

  executeStoredProcedure: (procName, params = []) =>
    api.post(API_ENDPOINTS.V1_PROC, { proc_name: procName, params }),
};

export default apiService;

// ── Screen-compatibility aliases ──────────────────────────────
// Some screens use these older names — keep them pointing to the
// correct new methods so no screen code needs to change.
apiService.getAllCategories = apiService.getCategories;
apiService.getAllProducts = () => apiService.getProducts();
apiService.getProductsByCategory = (id, page, limit) =>
  apiService.getCategoryProducts(id, page, limit);
