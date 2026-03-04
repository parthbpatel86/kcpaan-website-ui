// src/utils/constants.js — KC Paan Configuration
// ─────────────────────────────────────────────────────────────
// API base URL — change for your environment:
//   Local dev (iOS sim / web):  http://127.0.0.1:5000/api
//   Android emulator:           http://10.0.2.2:5000/api
//   Physical device / LAN:      http://YOUR_MACHINE_IP:5000/api
// ─────────────────────────────────────────────────────────────
export const API_BASE_URL = "https://kc-api-iyf2.onrender.com/api";

// ── Typed API Endpoints ─────────────────────────────────────
export const API_ENDPOINTS = {
  // Health
  HEALTH: "/health",

  // Products
  PRODUCTS: "/products",
  PRODUCTS_FEATURED: "/products/featured",
  PRODUCTS_SEARCH: "/products/search",
  PRODUCT_BY_ID: (id) => `/products/${id}`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_PRODUCTS: (id) => `/categories/${id}/products`,

  // Reviews
  REVIEWS: "/reviews",
  REVIEWS_GOOGLE: "/reviews/google",
  REVIEWS_FEATURED: "/reviews/featured",
  REVIEW_SUBMIT: "/reviews/submit",
  PRODUCT_REVIEWS: (id) => `/reviews/product/${id}`,

  // Events
  EVENTS: "/events",
  EVENTS_UPCOMING: "/events/upcoming",
  EVENTS_PAST: "/events/past",
  EVENTS_FEATURED: "/events/featured",
  EVENT_BOOK: "/events/book",

  // Menu
  MENU: "/menu",
  MENU_FEATURED: "/menu/featured",

  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_ME: "/auth/me",
  AUTH_VERIFY_EMAIL: "/auth/verify-email",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // Cart
  CART: "/cart",
  CART_ADD: "/cart/add",
  CART_UPDATE: "/cart/update",
  CART_REMOVE: "/cart/remove",
  CART_CLEAR: "/cart/clear",

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id) => `/orders/${id}`,
  CUSTOMER_ORDERS: (id) => `/orders/customer/${id}`,

  // Customers
  CUSTOMER_PROFILE: (id) => `/customers/${id}/profile`,
  CUSTOMER_PROFILE_ORDERS: (id) => `/customers/${id}/orders`,

  // Contact
  CONTACT: "/contact",
  CONTACT_CATERING: "/contact/catering",

  // Generic CRUD (via common.py at /api/v1)
  V1_SELECT: "/select",
  V1_INSERT: "/insert",
  V1_UPDATE: "/update",
  V1_DELETE: "/delete",
  V1_QUERY: "/query",
  V1_PROC: "/stored-procedure",
  V1_SCHEMA: (table) => `/schema/${table}`,
};

// ── Brand Colors ─────────────────────────────────────────────
export const COLORS = {
  primary: "#8B1A1A", // Deep burgundy/maroon
  primaryLight: "#B5272A",
  secondary: "#C8860A", // Gold/amber
  secondaryLight: "#E8A020",
  accent: "#2D5016", // Forest green
  background: "#FDF6ED", // Warm cream
  backgroundDark: "#F5E8D5",
  surface: "#FFFFFF",
  surfaceWarm: "#FFF9F0",
  text: "#1A0A00",
  textMedium: "#4A2C0A",
  textLight: "#8B6340",
  textMuted: "#A08060",
  white: "#FFFFFF",
  black: "#000000",
  success: "#2D6A2D",
  error: "#B5272A",
  warning: "#C8860A",
  border: "#E8D5B7",
  borderLight: "#F0E5D0",
  gold: "#C8860A",
  headerBg: "#1A0A00",
  overlay: "rgba(26,10,0,0.85)",
};

// ── Spacing ────────────────────────────────────────────────
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

// ── Font Sizes ─────────────────────────────────────────────
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

// ── Fonts ──────────────────────────────────────────────────
export const FONTS = { heading: "serif", body: "System" };

// ── Storage Keys ───────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@kcpaan_auth_token",
  REFRESH_TOKEN: "@kcpaan_refresh_token",
  USER_DATA: "@kcpaan_user_data",
  CART: "@kcpaan_cart",
};

// ── Store Info ─────────────────────────────────────────────
export const STORE_INFO = {
  name: "KC Paan",
  tagline: "Authentic Paan & Ayurvedic Products",
  phone: "+1 (502) 403-4389",
  whatsapp: "15024034389",
  email: "info@kcpaan.com",
  address: "18630 Pioneer Blvd, Artesia, CA 90701",
  hours: {
    weekdays: "Tue–Fri: 10am – 10pm",
    weekends: "Sat–Sun: 10am – 10pm",
  },
  social: {
    facebook: "https://facebook.com/kcpaan",
    instagram: "https://instagram.com/kcpaan",
    youtube: "https://youtube.com/kcpaan",
  },
};
