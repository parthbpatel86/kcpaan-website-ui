// src/components/Header.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, STORE_INFO } from '../utils/constants';
import { useCart } from '../context/CartContext';
import { SidebarMenu, HamburgerButton } from './SidebarMenu';

const Header = ({ navigation, title, showBack = false, transparent = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const insets = useSafeAreaInsets();
  const cartCount = getCartItemCount();

  return (
    <>
      <View style={[
        styles.header,
        { paddingTop: insets.top + SPACING.sm },
        transparent && styles.headerTransparent,
      ]}>
        <View style={styles.headerContent}>
          {showBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <HamburgerButton isOpen={sidebarOpen} onPress={() => setSidebarOpen(true)} />
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.brandCenter}>
            <Text style={styles.brandName}>KC PAAN</Text>
            {!title && <Text style={styles.brandTagline}>Authentic & Ayurvedic</Text>}
            {title && <Text style={styles.pageTitle}>{title}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconBtn}>
            <Ionicons name="bag-outline" size={24} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
      />
    </>
  );
};

// Floating action buttons - WhatsApp & Call
export const FloatingButtons = () => {
  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/${STORE_INFO.whatsapp}?text=Hi! I'd like to know more about KC Paan.`);
  const handleCall = () => Linking.openURL(`tel:${STORE_INFO.phone}`);

  return (
    <View style={floatStyles.container} pointerEvents="box-none">
      <TouchableOpacity style={[floatStyles.btn, floatStyles.callBtn]} onPress={handleCall}>
        <Ionicons name="call" size={22} color={COLORS.white} />
      </TouchableOpacity>
      <TouchableOpacity style={[floatStyles.btn, floatStyles.whatsappBtn]} onPress={handleWhatsApp}>
        <Ionicons name="logo-whatsapp" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const floatStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: SPACING.md,
    zIndex: 999,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  btn: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
  whatsappBtn: { backgroundColor: '#25D366' },
  callBtn: { backgroundColor: COLORS.primary },
});

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.headerBg,
    paddingBottom: SPACING.md,
    zIndex: 50,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  brandCenter: { alignItems: 'center', flex: 1 },
  brandName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTagline: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginTop: 1,
  },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 9, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
});

export default Header;
