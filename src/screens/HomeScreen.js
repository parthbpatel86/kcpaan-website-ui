// src/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ImageBackground,
  Animated,
  Dimensions,
  Platform,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, FONT_SIZES, STORE_INFO } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import ProductCard from "../components/ProductCard";
import {
  LoadingSpinner,
  StarRating,
  SectionHeader,
} from "../components/shared/index";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HERO_SLIDES = [
  {
    title: "Authentic Paan\n& Ayurvedic",
    subtitle: "Handcrafted with love, rooted in tradition",
    accent: "Experience the Legacy",
    bg: "#1A0A00",
  },
  {
    title: "Hand-Roasted\nMukhwas",
    subtitle: "Flavors that tell a story of generations",
    accent: "Shop Mukhwas",
    bg: "#2D1005",
  },
  {
    title: "Homemade\nKulfi & Ice Cream",
    subtitle: "Seasonal flavors made fresh daily",
    accent: "View Flavors",
    bg: "#0A1A05",
  },
];

const QUICK_LINKS = [
  {
    icon: "leaf-outline",
    label: "Paan\nProducts",
    route: "OnlineStore",
    color: COLORS.accent,
  },
  {
    icon: "medical-outline",
    label: "Ayurvedic",
    route: "OnlineStore",
    color: COLORS.primary,
  },
  {
    icon: "ice-cream-outline",
    label: "Kulfi &\nIce Cream",
    route: "IceCream",
    color: "#2196F3",
  },
  {
    icon: "storefront-outline",
    label: "In-Store\nPaan",
    route: "InStore",
    color: COLORS.secondary,
  },
  {
    icon: "calendar-outline",
    label: "Events",
    route: "Events",
    color: "#9C27B0",
  },
  {
    icon: "mail-outline",
    label: "Contact",
    route: "Contact",
    color: COLORS.textMedium,
  },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScroll = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    // Hero auto-scroll
    const interval = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroScroll.current?.scrollTo({
          x: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, reviewsRes, eventsRes] = await Promise.allSettled([
        apiService.getFeaturedProducts(6),
        apiService.getFeaturedReviews(),
        apiService.getFeaturedEvents(),
      ]);
      if (productsRes.status === "fulfilled")
        setFeaturedProducts(productsRes.value?.data || []);
      if (reviewsRes.status === "fulfilled")
        setReviews(reviewsRes.value?.data?.slice(0, 3) || []);
      if (eventsRes.status === "fulfilled")
        setEvents(eventsRes.value?.data?.slice(0, 2) || []);
    } catch (e) {
      console.error("Error loading home:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing)
    return <LoadingSpinner message="Loading KC Paan..." />;

  return (
    <View style={styles.root}>
      <Header navigation={navigation} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadData();
              setRefreshing(false);
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Hero Carousel */}
        <View style={styles.heroContainer}>
          <ScrollView
            ref={heroScroll}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) =>
              setHeroIndex(
                Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH),
              )
            }
          >
            {HERO_SLIDES.map((slide, i) => (
              <View
                key={i}
                style={[styles.heroSlide, { backgroundColor: slide.bg }]}
              >
                {/* Decorative pattern */}
                <View style={styles.heroPattern}>
                  {[...Array(6)].map((_, j) => (
                    <View
                      key={j}
                      style={[
                        styles.heroCircle,
                        {
                          opacity: 0.04 + j * 0.02,
                          transform: [{ scale: 1 + j * 0.5 }],
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.heroContent}>
                  <View style={styles.goldBadge}>
                    <Text style={styles.goldBadgeText}>✦ KC PAAN ✦</Text>
                  </View>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <View style={styles.heroGoldLine} />
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  <TouchableOpacity
                    style={styles.heroCTA}
                    onPress={() => navigation.navigate("OnlineStore")}
                  >
                    <Text style={styles.heroCTAText}>{slide.accent}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === heroIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route + link.label}
              style={styles.quickLink}
              onPress={() => navigation.navigate(link.route)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: link.color + "18" },
                ]}
              >
                <Ionicons name={link.icon} size={24} color={link.color} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Banner */}
        <View style={styles.aboutBanner}>
          <View style={styles.aboutAccent} />
          <View style={styles.aboutContent}>
            <Text style={styles.aboutLabel}>OUR STORY</Text>
            <Text style={styles.aboutTitle}>
              A Legacy of{"\n"}Authentic Flavors
            </Text>
            <Text style={styles.aboutText}>
              KC Paan brings the ancient art of paan-making and Ayurvedic
              wellness products to Kansas City. Each product is crafted with
              generations of knowledge and the finest ingredients.
            </Text>
            <TouchableOpacity
              style={styles.aboutBtn}
              onPress={() => navigation.navigate("About")}
            >
              <Text style={styles.aboutBtnText}>Our Journey</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <SectionHeader label="SPECIALTIES" title="Featured Products" />
              <TouchableOpacity
                onPress={() => navigation.navigate("OnlineStore")}
              >
                <Text style={styles.seeAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredProducts}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={(p) =>
                    navigation.navigate("ProductDetail", { product: p })
                  }
                />
              )}
              keyExtractor={(item) => item.product_id?.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
            />
          </View>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={[styles.section, styles.reviewsSection]}>
            <SectionHeader
              label="WHAT PEOPLE SAY"
              title="Customer Reviews"
              centered
            />
            {reviews.map((review, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.author_name?.charAt(0)?.toUpperCase() || "A"}
                    </Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>
                      {review.author_name}
                    </Text>
                    <View style={styles.reviewRatingRow}>
                      <StarRating rating={review.rating} />
                      <Text style={styles.reviewSource}>{review.source}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={COLORS.secondary}
                  />
                </View>
                <Text style={styles.reviewText} numberOfLines={4}>
                  {review.review_text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Events Preview */}
        {events.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <SectionHeader label="UPCOMING" title="Events" />
              <TouchableOpacity onPress={() => navigation.navigate("Events")}>
                <Text style={styles.seeAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {events.map((event, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.eventCard}
                onPress={() => navigation.navigate("Events", { event })}
              >
                <View style={styles.eventDateBox}>
                  <Text style={styles.eventDay}>
                    {new Date(event.event_date).getDate()}
                  </Text>
                  <Text style={styles.eventMonth}>
                    {new Date(event.event_date)
                      .toLocaleString("default", { month: "short" })
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName} numberOfLines={2}>
                    {event.event_name}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color={COLORS.textLight}
                    />
                    <Text style={styles.eventLocation}>
                      {event.location || event.city}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CTA - Catering */}
        <TouchableOpacity
          style={styles.cateringBanner}
          onPress={() => navigation.navigate("Contact", { type: "catering" })}
          activeOpacity={0.95}
        >
          <View style={styles.cateringContent}>
            <Text style={styles.cateringLabel}>AVAILABLE FOR</Text>
            <Text style={styles.cateringTitle}>Catering & Events</Text>
            <Text style={styles.cateringSubtitle}>
              Bring authentic paan to your special occasions
            </Text>
            <View style={styles.cateringBtn}>
              <Text style={styles.cateringBtnText}>Request a Quote</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Store Info Footer */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeInfoTitle}>Visit Us</Text>
          <View style={styles.storeInfoRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.secondary}
            />
            <Text style={styles.storeInfoText}>{STORE_INFO.address}</Text>
          </View>
          <View style={styles.storeInfoRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
            <View>
              <Text style={styles.storeInfoText}>
                {STORE_INFO.hours.weekdays}
              </Text>
              <Text style={styles.storeInfoText}>
                {STORE_INFO.hours.weekends}
              </Text>
            </View>
          </View>
          <View style={styles.storeInfoRow}>
            <Ionicons name="call-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.storeInfoText}>{STORE_INFO.phone}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    // WEB SCROLL FIX: bound height to viewport so ScrollView has a finite
    // container to scroll within (mirrors what the OS does on mobile)
    ...(Platform.OS === "web" && { height: "100vh", overflow: "hidden" }),
  },
  scroll: { flex: 1 },

  // Hero
  heroContainer: { height: 340, position: "relative" },
  heroSlide: {
    width: SCREEN_WIDTH,
    height: 340,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  heroContent: { flex: 1, justifyContent: "center" },
  goldBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  goldBadgeText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: COLORS.white,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 44,
    marginBottom: SPACING.md,
  },
  heroGoldLine: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.75)",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white,
    paddingBottom: 3,
  },
  heroCTAText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroDots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: { backgroundColor: COLORS.secondary, width: 20 },

  // Quick Links
  quickLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  quickLink: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  quickLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },

  // About Banner
  aboutBanner: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundDark,
    margin: SPACING.md,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutAccent: { width: 4, backgroundColor: COLORS.secondary },
  aboutContent: { flex: 1, padding: SPACING.lg },
  aboutLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  aboutTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  aboutBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  aboutBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Section
  section: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: SPACING.sm,
  },

  // Reviews
  reviewsSection: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: SPACING.lg,
  },
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(200,134,10,0.2)",
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  reviewAvatar: {
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
    color: COLORS.white,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: 2,
  },
  reviewSource: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    textTransform: "capitalize",
  },
  reviewText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
  },

  // Events
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  eventDateBox: {
    width: 52,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  eventDay: { fontSize: FONT_SIZES.xl, fontWeight: "800", color: COLORS.white },
  eventMonth: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
  },
  eventInfo: { flex: 1 },
  eventName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventLocation: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  // Catering Banner
  cateringBanner: {
    margin: SPACING.md,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  cateringContent: { padding: SPACING.xl },
  cateringLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  cateringTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.sm,
  },
  cateringSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  cateringBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    alignSelf: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
    paddingBottom: 2,
  },
  cateringBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },

  // Store Info
  storeInfo: {
    backgroundColor: COLORS.headerBg,
    margin: SPACING.md,
    borderRadius: 8,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  storeInfoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.sm,
  },
  storeInfoRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
  },
  storeInfoText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.75)",
    flex: 1,
    lineHeight: 20,
  },
});

export default HomeScreen;
