// src/components/admin/AdminSidebar.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING, ADMIN_NAV } from '../../utils/adminConstants';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminSidebar = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { admin, adminLogout } = useAdminAuth();

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top }]}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>KC</Text>
        </View>
        <View>
          <Text style={styles.brandName}>KC PAAN</Text>
          <Text style={styles.brandSub}>Admin Dashboard</Text>
        </View>
      </View>

      {/* Admin user info */}
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{admin?.first_name?.[0] || 'A'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{admin?.first_name} {admin?.last_name}</Text>
          <Text style={styles.userRole}>{admin?.role?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      {/* Nav */}
      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {ADMIN_NAV.map((item) => {
          const isActive = activeScreen === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? item.icon_active : item.icon}
                size={18}
                color={isActive ? ADMIN_COLORS.white : ADMIN_COLORS.textMuted}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={adminLogout}>
        <Ionicons name="log-out-outline" size={18} color={ADMIN_COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: ADMIN_COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: ADMIN_COLORS.border,
    flex: 1,
  },
  brand: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  brandIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: ADMIN_COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  brandIconText: { color: ADMIN_COLORS.white, fontSize: ADMIN_FONTS.md, fontWeight: '900', letterSpacing: 1 },
  brandName: { fontSize: ADMIN_FONTS.md, fontWeight: '800', color: ADMIN_COLORS.text, letterSpacing: 1 },
  brandSub: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim },
  userInfo: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bg,
    borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: ADMIN_COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { color: ADMIN_COLORS.white, fontSize: ADMIN_FONTS.sm, fontWeight: '700' },
  userName: { fontSize: ADMIN_FONTS.sm, fontWeight: '600', color: ADMIN_COLORS.text },
  userRole: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.secondary, fontWeight: '700' },
  nav: { flex: 1, paddingVertical: ADMIN_SPACING.sm },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    paddingVertical: 10, paddingHorizontal: ADMIN_SPACING.md,
    borderRadius: 6, marginHorizontal: ADMIN_SPACING.sm, marginVertical: 1,
  },
  navItemActive: { backgroundColor: ADMIN_COLORS.primary },
  navLabel: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, fontWeight: '500' },
  navLabelActive: { color: ADMIN_COLORS.white, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md, borderTopWidth: 1, borderTopColor: ADMIN_COLORS.border,
  },
  logoutText: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.error, fontWeight: '600' },
  backToStore: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md,
  },
  backToStoreText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim },
});

export default AdminSidebar;
