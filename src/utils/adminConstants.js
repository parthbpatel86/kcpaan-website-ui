// src/utils/adminConstants.js
// Admin Panel Theme - Dark Professional Dashboard

export const ADMIN_COLORS = {
  bg: '#0F1117',           // Deep dark background
  bgCard: '#1A1D27',       // Card background
  bgCardHover: '#1E2233',  // Card hover
  sidebar: '#13161F',      // Sidebar background
  sidebarActive: '#8B1A1A', // Active sidebar item
  header: '#13161F',       // Top bar
  border: '#252840',       // Borders
  borderLight: '#2D3148',  // Light borders
  
  primary: '#8B1A1A',      // KC Paan red
  primaryLight: '#B5272A',
  secondary: '#C8860A',    // Gold
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  text: '#F1F5F9',         // Primary text
  textMuted: '#94A3B8',    // Muted text
  textDim: '#64748B',      // Dim text
  
  white: '#FFFFFF',
  black: '#000000',
};

export const ADMIN_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const ADMIN_FONTS = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
};

export const ADMIN_NAV = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', icon_active: 'grid' },
  { key: 'Orders', label: 'Orders', icon: 'receipt-outline', icon_active: 'receipt' },
  { key: 'Products', label: 'Products', icon: 'cube-outline', icon_active: 'cube' },
  { key: 'Categories', label: 'Categories', icon: 'folder-outline', icon_active: 'folder' },
  { key: 'Menu', label: 'Menu / Paan', icon: 'restaurant-outline', icon_active: 'restaurant' },
  { key: 'Events', label: 'Events', icon: 'calendar-outline', icon_active: 'calendar' },
  { key: 'Catering', label: 'Catering', icon: 'people-outline', icon_active: 'people' },
  { key: 'Shipping', label: 'Shipping', icon: 'airplane-outline', icon_active: 'airplane' },
  { key: 'Content', label: 'Page Content', icon: 'document-text-outline', icon_active: 'document-text' },
  { key: 'Media', label: 'Images / Media', icon: 'images-outline', icon_active: 'images' },
  { key: 'Customers', label: 'Customers', icon: 'person-outline', icon_active: 'person' },
  { key: 'Reviews', label: 'Reviews', icon: 'star-outline', icon_active: 'star' },
  { key: 'Settings', label: 'Settings', icon: 'settings-outline', icon_active: 'settings' },
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partial'];

export const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  shipped: '#06B6D4',
  delivered: '#22C55E',
  cancelled: '#EF4444',
  refunded: '#94A3B8',
  paid: '#22C55E',
  failed: '#EF4444',
  active: '#22C55E',
  inactive: '#EF4444',
  approved: '#22C55E',
  rejected: '#EF4444',
  new: '#3B82F6',
  upcoming: '#06B6D4',
  completed: '#22C55E',
};
