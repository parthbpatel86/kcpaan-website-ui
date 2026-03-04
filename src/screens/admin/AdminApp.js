// src/screens/admin/AdminApp.js
// Main admin shell: sidebar navigation + screen content
import React, { useState } from 'react';
import {
  View, StyleSheet, Dimensions, Platform,
  TouchableOpacity, Text, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING } from '../../utils/adminConstants';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import {
  AdminCategories,
  AdminMenu,
  AdminEvents,
  AdminCatering,
  AdminShipping,
  AdminContent,
  AdminMedia,
  AdminCustomers,
  AdminReviews,
  AdminSettings,
} from './AdminMiscScreens';

const { width: SCREEN_W } = Dimensions.get('window');
const IS_TABLET = SCREEN_W >= 768;
const SIDEBAR_W = 220;

const SCREEN_MAP = {
  Dashboard: AdminDashboard,
  Orders:    AdminOrders,
  Products:  AdminProducts,
  Categories: AdminCategories,
  Menu:      AdminMenu,
  Events:    AdminEvents,
  Catering:  AdminCatering,
  Shipping:  AdminShipping,
  Content:   AdminContent,
  Media:     AdminMedia,
  Customers: AdminCustomers,
  Reviews:   AdminReviews,
  Settings:  AdminSettings,
};

const AdminApp = () => {
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(IS_TABLET);
  const [navParams, setNavParams]       = useState({});
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  const navigate = (screen, params = {}) => {
    setActiveScreen(screen);
    setNavParams(params);
    if (!IS_TABLET) {
      closeSidebar();
    }
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const closeSidebar = () => {
    Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (!IS_TABLET) setSidebarOpen(false);
    });
  };

  const ActiveScreen = SCREEN_MAP[activeScreen] || AdminDashboard;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.shell}>
        {/* Sidebar — always visible on tablet, drawer on mobile */}
        {(IS_TABLET || sidebarOpen) && (
          <View style={[styles.sidebarWrap, !IS_TABLET && styles.sidebarDrawer]}>
            <AdminSidebar activeScreen={activeScreen} onNavigate={navigate} />
          </View>
        )}

        {/* Overlay for mobile drawer */}
        {!IS_TABLET && sidebarOpen && (
          <Animated.View
            style={[styles.overlay, { opacity: overlayAnim }]}
            pointerEvents="auto"
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSidebar} />
          </Animated.View>
        )}

        {/* Main content area */}
        <View style={styles.main}>
          {/* Top bar (mobile only) */}
          {!IS_TABLET && (
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
                <Ionicons name="menu-outline" size={24} color={ADMIN_COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>{activeScreen}</Text>
              <View style={{ width: 40 }} />
            </View>
          )}

          {/* Screen */}
          <View style={styles.screenWrap}>
            <ActiveScreen onNavigate={navigate} params={navParams} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  shell: { flex: 1, flexDirection: 'row' },

  sidebarWrap: { width: SIDEBAR_W },
  sidebarDrawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    zIndex: 100, width: SIDEBAR_W,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 99,
  },

  main: { flex: 1, backgroundColor: ADMIN_COLORS.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: ADMIN_COLORS.header,
    borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
    paddingHorizontal: ADMIN_SPACING.md, paddingVertical: ADMIN_SPACING.sm,
    height: 50,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },

  screenWrap: { flex: 1 },
});

export default AdminApp;
