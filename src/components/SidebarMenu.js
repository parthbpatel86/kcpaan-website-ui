// src/components/SidebarMenu.js
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZES, STORE_INFO } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = 300;

const NAV_LINKS = [
  { label: "Home", icon: "home-outline", route: "Home" },
  {
    label: "Hand-Roasted Mukhwas",
    icon: "leaf-outline",
    route: "Products",
    params: { categorySlug: "paan-products" },
  },
  {
    label: "Ayurvedic Products",
    icon: "medical-outline",
    route: "Products",
    params: { categorySlug: "ayurvedic-products" },
  },
  { label: "Ice Cream & Kulfi", icon: "ice-cream-outline", route: "IceCream" },
  { label: "In-Store Paan", icon: "storefront-outline", route: "InStore" },
  { label: "Events", icon: "calendar-outline", route: "Events" },
  { label: "Our Journey", icon: "heart-outline", route: "About" },
  { label: "FAQ", icon: "help-circle-outline", route: "FAQ" },
  { label: "Contact", icon: "mail-outline", route: "Contact" },
  { label: "Online Store", icon: "bag-outline", route: "OnlineStore" },
];

export const SidebarMenu = ({ isOpen, onClose, navigation }) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [hasOpened, setHasOpened] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();

  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const navigate = (route, params) => {
    onClose();
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.navigate({
          name: route,
          params,
          key: route + (params ? JSON.stringify(params) : ""),
        }),
      );
    }, 150);
  };

  const handleCall = () => Linking.openURL(`tel:${STORE_INFO.phone}`);
  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/${STORE_INFO.whatsapp}`);
  const handleSocial = (url) => Linking.openURL(url);

  if (!hasOpened && !isOpen) return null;

  // On web, absoluteFillObject is relative to the card container and gets
  // clipped + misaligned. Use position:'fixed' so the sidebar overlays
  // the full browser viewport — just like the OS handles it on mobile.
  const containerStyle =
    Platform.OS === "web"
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }
      : StyleSheet.absoluteFillObject;

  return (
    <View style={containerStyle} pointerEvents={isOpen ? "auto" : "none"}>
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <View>
            <Text style={styles.brandName}>KC PAAN</Text>
            <Text style={styles.brandTagline}>Authentic Paan & Ayurvedic</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.backgroundDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User greeting */}
          {isAuthenticated && (
            <View style={styles.userGreeting}>
              <Ionicons
                name="person-circle-outline"
                size={28}
                color={COLORS.secondary}
              />
              <Text style={styles.userName}>Hello, {user?.first_name}!</Text>
            </View>
          )}

          {/* Navigation */}
          <Text style={styles.navSectionLabel}>Navigate</Text>
          {NAV_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route + link.label}
              style={styles.navItem}
              onPress={() => navigate(link.route, link.params)}
              activeOpacity={0.7}
            >
              <Ionicons name={link.icon} size={20} color={COLORS.secondary} />
              <Text style={styles.navLabel}>{link.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}

          {/* Cart link */}
          <TouchableOpacity
            style={[styles.navItem, styles.cartItem]}
            onPress={() => navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.navLabel, { color: COLORS.primary }]}>
              Cart
            </Text>
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Contact Info */}
          <Text style={styles.navSectionLabel}>Contact Us</Text>
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Ionicons name="call-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.contactText}>{STORE_INFO.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.contactText}>WhatsApp Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL(`mailto:${STORE_INFO.email}`)}
          >
            <Ionicons name="mail-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.contactText}>{STORE_INFO.email}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Store Hours */}
          <Text style={styles.navSectionLabel}>Store Hours</Text>
          <View style={styles.hoursBlock}>
            <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
            <View style={styles.hoursText}>
              <Text style={styles.hoursLine}>{STORE_INFO.hours.weekdays}</Text>
              <Text style={styles.hoursLine}>{STORE_INFO.hours.weekends}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Social Media */}
          <Text style={styles.navSectionLabel}>Follow Us</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocial(STORE_INFO.social.facebook)}
            >
              <Ionicons name="logo-facebook" size={22} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocial(STORE_INFO.social.instagram)}
            >
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocial(STORE_INFO.social.youtube)}
            >
              <Ionicons name="logo-youtube" size={22} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>
          </View>

          {/* Auth Actions */}
          <View style={styles.divider} />
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.authBtn}
              onPress={async () => {
                await logout();
                onClose();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              <Text style={[styles.authBtnText, { color: COLORS.error }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.authBtn}
              onPress={() => navigate("Login")}
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.authBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          )}

          {/* Admin panel link (hidden/subtle) */}
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => navigate("Admin")}
          >
            <Ionicons
              name="shield-outline"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
            <Text style={styles.adminLinkText}>Admin Panel</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// Hamburger Button
export const HamburgerButton = ({ isOpen, onPress }) => {
  const line1 = useRef(new Animated.Value(0)).current;
  const line2 = useRef(new Animated.Value(1)).current;
  const line3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(line1, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(line2, {
        toValue: isOpen ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(line3, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const line1Style = {
    transform: [
      {
        translateY: line1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 7],
        }),
      },
      {
        rotate: line1.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };
  const line2Style = { opacity: line2 };
  const line3Style = {
    transform: [
      {
        translateY: line3.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -7],
        }),
      },
      {
        rotate: line3.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-45deg"],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={hamburgerStyles.btn}
      activeOpacity={0.7}
    >
      <Animated.View style={[hamburgerStyles.line, line1Style]} />
      <Animated.View style={[hamburgerStyles.line, line2Style]} />
      <Animated.View style={[hamburgerStyles.line, line3Style]} />
    </TouchableOpacity>
  );
};

const hamburgerStyles = StyleSheet.create({
  btn: { padding: 8, justifyContent: "center", width: 44, height: 44 },
  line: {
    height: 2.5,
    width: 24,
    backgroundColor: COLORS.white,
    borderRadius: 2,
    marginVertical: 2.5,
  },
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,10,0,0.6)",
    zIndex: 100,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: COLORS.headerBg,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 54 : SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,134,10,0.3)",
    backgroundColor: COLORS.primary,
  },
  brandName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 3,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  brandTagline: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: { padding: 8 },
  scrollContent: { flex: 1 },
  userGreeting: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(200,134,10,0.1)",
    gap: SPACING.sm,
  },
  userName: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  navSectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 13,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  navLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  cartItem: { backgroundColor: "rgba(139,26,26,0.2)" },
  cartBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    gap: SPACING.sm,
  },
  contactText: { fontSize: FONT_SIZES.sm, color: "rgba(255,255,255,0.8)" },
  hoursBlock: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    gap: SPACING.sm,
    alignItems: "flex-start",
  },
  hoursText: { flex: 1 },
  hoursLine: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  socialRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  authBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: "600",
  },
  adminLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    marginTop: SPACING.sm,
  },
  adminLinkText: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },
});

export default SidebarMenu;
