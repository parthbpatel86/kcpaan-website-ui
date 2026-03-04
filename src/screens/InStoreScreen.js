// src/screens/InStoreScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES, STORE_INFO } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import {
  LoadingSpinner,
  SectionHeader,
  StarRating,
} from "../components/shared/index";

const InStoreScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuRes, reviewsRes] = await Promise.allSettled([
        apiService.getMenu(),
        apiService.getReviews("google"),
      ]);
      if (menuRes.status === "fulfilled")
        setMenuItems(menuRes.value?.data || []);
      if (reviewsRes.status === "fulfilled")
        setReviews(reviewsRes.value?.data?.slice(0, 5) || []);
    } catch (e) {
      console.error("InStore error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    const address = encodeURIComponent(STORE_INFO.address);
    const url =
      Platform.OS === "ios"
        ? `maps:?address=${address}`
        : `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  if (loading) return <LoadingSpinner message="Loading Menu..." />;

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    const cat = item.category_name || "Paan Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="In-Store" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>EXPERIENCE IN PERSON</Text>
            <Text style={styles.heroTitle}>Our Paan Bar</Text>
            <View style={styles.goldLine} />
            <Text style={styles.heroSubtitle}>
              Watch our experts craft your paan fresh to order with the finest
              ingredients.
            </Text>
          </View>
        </View>

        {/* Location & Hours */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Visit Us</Text>

          <TouchableOpacity style={styles.infoRow} onPress={openMaps}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ADDRESS</Text>
              <Text style={styles.infoValue}>{STORE_INFO.address}</Text>
              <Text style={styles.infoLink}>Open in Maps →</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>STORE HOURS</Text>
              <Text style={styles.infoValue}>{STORE_INFO.hours.weekdays}</Text>
              <Text style={styles.infoValue}>{STORE_INFO.hours.weekends}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${STORE_INFO.phone}`)}
          >
            <View style={styles.infoIcon}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>PHONE</Text>
              <Text style={styles.infoValue}>{STORE_INFO.phone}</Text>
              <Text style={styles.infoLink}>Tap to Call →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Paan Menu */}
        <View style={styles.section}>
          <SectionHeader label="IN-STORE MENU" title="Paan Selection" />
          {Object.keys(menuByCategory).length === 0 ? (
            <View style={styles.menuPlaceholder}>
              {/* Fallback static menu if API doesn't return data */}
              {STATIC_MENU.map((category, i) => (
                <View key={i} style={styles.menuCategory}>
                  <Text style={styles.menuCategoryTitle}>{category.name}</Text>
                  {category.items.map((item, j) => (
                    <TouchableOpacity
                      key={j}
                      style={styles.menuItem}
                      onPress={() =>
                        setExpandedItem(
                          expandedItem === `${i}-${j}` ? null : `${i}-${j}`,
                        )
                      }
                    >
                      <View style={styles.menuItemHeader}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <View style={styles.menuItemRight}>
                          <Text style={styles.menuItemPrice}>{item.price}</Text>
                          <Ionicons
                            name={
                              expandedItem === `${i}-${j}`
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={16}
                            color={COLORS.textMuted}
                          />
                        </View>
                      </View>
                      {expandedItem === `${i}-${j}` && (
                        <Text style={styles.menuItemDesc}>
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            Object.entries(menuByCategory).map(([category, items]) => (
              <View key={category} style={styles.menuCategory}>
                <Text style={styles.menuCategoryTitle}>{category}</Text>
                {items.map((item, j) => (
                  <TouchableOpacity
                    key={j}
                    style={styles.menuItem}
                    onPress={() =>
                      setExpandedItem(
                        expandedItem === `${category}-${j}`
                          ? null
                          : `${category}-${j}`,
                      )
                    }
                  >
                    <View style={styles.menuItemHeader}>
                      <Text style={styles.menuItemName}>
                        {item.product_name || item.item_name}
                      </Text>
                      <View style={styles.menuItemRight}>
                        <Text style={styles.menuItemPrice}>
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </Text>
                        <Ionicons
                          name={
                            expandedItem === `${category}-${j}`
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={16}
                          color={COLORS.textMuted}
                        />
                      </View>
                    </View>
                    {expandedItem === `${category}-${j}` && (
                      <Text style={styles.menuItemDesc}>
                        {item.short_description || item.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Google Reviews */}
        {reviews.length > 0 && (
          <View style={[styles.section, styles.reviewsSection]}>
            <SectionHeader label="GOOGLE REVIEWS" title="What Customers Say" />
            {reviews.map((review, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {review.author_photo_url ? (
                    <Image
                      source={{ uri: review.author_photo_url }}
                      style={styles.reviewAvatar}
                    />
                  ) : (
                    <View style={styles.reviewAvatarFallback}>
                      <Text style={styles.reviewAvatarText}>
                        {review.author_name?.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>
                      {review.author_name}
                    </Text>
                    <StarRating rating={review.rating} size={13} />
                  </View>
                  <View style={styles.googleBadge}>
                    <Text style={styles.googleBadgeText}>G</Text>
                  </View>
                </View>
                <Text style={styles.reviewText} numberOfLines={5}>
                  {review.review_text}
                </Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.review_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingButtons />
    </View>
  );
};

// Static fallback menu
const STATIC_MENU = [
  {
    name: "Sweet Paan",
    items: [
      {
        name: "Classic Sweet Paan",
        price: "$3.99",
        description:
          "A traditional meetha paan with gulkand, candied fennel, and coconut flakes wrapped in fresh betel leaf.",
      },
      {
        name: "Chocolate Paan",
        price: "$4.99",
        description:
          "A modern twist with chocolate, nuts, and sweetened rose petals.",
      },
      {
        name: "Rose Paan",
        price: "$4.49",
        description:
          "Fragrant rose gulkand with silver foil, fennel seeds, and fresh coconut.",
      },
      {
        name: "Mango Kulfi Paan",
        price: "$5.49",
        description:
          "Seasonal mango filling with kulfi pieces, sweetened with jaggery.",
      },
    ],
  },
  {
    name: "Special Paan",
    items: [
      {
        name: "Fire Paan",
        price: "$6.99",
        description:
          "Spectacular fire-lit presentation with menthol and citrus layers. A showstopper experience.",
      },
      {
        name: "Gold Paan",
        price: "$8.99",
        description:
          "Premium paan adorned with edible gold leaf, premium dry fruits, and imported gulkand.",
      },
      {
        name: "KC Special Paan",
        price: "$7.49",
        description:
          "Our signature recipe with 12 hand-selected ingredients. A true KC Paan exclusive.",
      },
    ],
  },
  {
    name: "Mukhwas & Digestives",
    items: [
      {
        name: "Hand-Roasted Mukhwas (50g)",
        price: "$5.99",
        description:
          "A blend of roasted seeds, nuts, and spices for a perfect post-meal digestive.",
      },
      {
        name: "Premium Fennel Mix (100g)",
        price: "$9.99",
        description:
          "Sugar-coated fennel and coriander seeds with a touch of cardamom.",
      },
    ],
  },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    // WEB SCROLL FIX: bound height to viewport so ScrollView has a finite
    // container to scroll within (mirrors what the OS does on mobile)
    ...(Platform.OS === "web" && { height: "100vh", overflow: "hidden" }),
  },
  hero: {
    height: 200,
    backgroundColor: COLORS.headerBg,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  heroContent: { padding: SPACING.xl },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },
  section: { padding: SPACING.lg },
  infoCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  infoCardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundDark,
  },
  infoRow: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  infoLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
  },
  menuPlaceholder: {},
  menuCategory: { marginBottom: SPACING.lg },
  menuCategoryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  menuItemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.primary,
  },
  menuItemDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  reviewsSection: { backgroundColor: COLORS.surfaceWarm },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  reviewMeta: { flex: 1 },
  reviewAuthor: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  googleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
  },
  googleBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "800",
  },
  reviewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});

export default InStoreScreen;
