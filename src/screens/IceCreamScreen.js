// src/screens/IceCreamScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import {
  LoadingSpinner,
  SectionHeader,
  StarRating,
} from "../components/shared/index";
import { useCart } from "../context/CartContext";

const FLAVOR_PALETTE = [
  "#F5A623",
  "#E8503A",
  "#7ED321",
  "#4A90E2",
  "#9B59B6",
  "#F1C40F",
  "#1ABC9C",
  "#E91E63",
];

const IceCreamScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await apiService.selectRecords(
        "products",
        `category_id IN (SELECT category_id FROM categories WHERE category_slug = 'ice-cream-kulfi') AND is_active = 1`,
        "*",
        "display_order, product_name",
      );
      const prods = res?.data || [];
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
        loadVariants(prods[0].product_id);
      }
    } catch (e) {
      console.error("IceCream error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (productId) => {
    try {
      const res = await apiService.selectRecords(
        "product_variants",
        `product_id = ${productId} AND is_active = 1`,
      );
      setVariants(res?.data || []);
      setSelectedVariant(null);
    } catch {
      setVariants([]);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    loadVariants(product.product_id);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, 1, selectedVariant);
    // Confirmation could be a toast
  };

  if (loading) return <LoadingSpinner message="Loading Flavors..." />;

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Ice Cream & Kulfi" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroDecor}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heroBlob,
                  {
                    backgroundColor: FLAVOR_PALETTE[i] + "30",
                    top: i * 40,
                    left: (i % 3) * 80,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>HOMEMADE DAILY</Text>
            <Text style={styles.heroTitle}>Kulfi & Ice Cream</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroSubtitle}>
              Crafted with authentic recipes, real ingredients, and the finest
              flavors from India.
            </Text>
          </View>
        </View>

        {/* Product Selector */}
        {products.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="OUR SELECTION" title="Choose Your Treat" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.product_id}
                  style={[
                    styles.productTab,
                    selectedProduct?.product_id === product.product_id &&
                      styles.productTabActive,
                  ]}
                  onPress={() => handleSelectProduct(product)}
                >
                  <Text
                    style={[
                      styles.productTabText,
                      selectedProduct?.product_id === product.product_id &&
                        styles.productTabTextActive,
                    ]}
                  >
                    {product.product_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Product Detail */}
        {selectedProduct && (
          <View style={styles.productDetail}>
            {selectedProduct.image_url ? (
              <Image
                source={{ uri: selectedProduct.image_url }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.productEmoji}>🍦</Text>
              </View>
            )}

            <View style={styles.productInfo}>
              <View style={styles.productHeaderRow}>
                <Text style={styles.productName}>
                  {selectedProduct.product_name}
                </Text>
                <View
                  style={[
                    styles.availabilityTag,
                    {
                      backgroundColor:
                        selectedProduct.inventory_quantity > 0
                          ? COLORS.success + "20"
                          : COLORS.error + "20",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.availDot,
                      {
                        backgroundColor:
                          selectedProduct.inventory_quantity > 0
                            ? COLORS.success
                            : COLORS.error,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.availText,
                      {
                        color:
                          selectedProduct.inventory_quantity > 0
                            ? COLORS.success
                            : COLORS.error,
                      },
                    ]}
                  >
                    {selectedProduct.inventory_quantity > 0
                      ? "Available"
                      : "Out of Season"}
                  </Text>
                </View>
              </View>

              <Text style={styles.productPrice}>
                ${parseFloat(selectedProduct.price).toFixed(2)}
              </Text>
              {selectedProduct.compare_at_price && (
                <Text style={styles.comparePrice}>
                  Regular: $
                  {parseFloat(selectedProduct.compare_at_price).toFixed(2)}
                </Text>
              )}
              <Text style={styles.productDescription}>
                {selectedProduct.full_description ||
                  selectedProduct.short_description}
              </Text>

              {/* Flavor Variants */}
              {variants.length > 0 && (
                <View style={styles.variantsSection}>
                  <Text style={styles.variantsLabel}>CHOOSE FLAVOR</Text>
                  <View style={styles.variantsGrid}>
                    {variants.map((variant, idx) => (
                      <TouchableOpacity
                        key={variant.variant_id}
                        style={[
                          styles.variantChip,
                          {
                            borderColor:
                              FLAVOR_PALETTE[idx % FLAVOR_PALETTE.length],
                          },
                          selectedVariant?.variant_id ===
                            variant.variant_id && {
                            backgroundColor:
                              FLAVOR_PALETTE[idx % FLAVOR_PALETTE.length],
                          },
                        ]}
                        onPress={() =>
                          setSelectedVariant(
                            selectedVariant?.variant_id === variant.variant_id
                              ? null
                              : variant,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.flavorDot,
                            {
                              backgroundColor:
                                FLAVOR_PALETTE[idx % FLAVOR_PALETTE.length],
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.variantText,
                            selectedVariant?.variant_id ===
                              variant.variant_id && { color: COLORS.white },
                          ]}
                        >
                          {variant.variant_name}
                        </Text>
                        {variant.price_adjustment > 0 && (
                          <Text style={styles.variantPrice}>
                            +${variant.price_adjustment.toFixed(2)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Add to Cart */}
              <TouchableOpacity
                style={[
                  styles.addToCartBtn,
                  selectedProduct.inventory_quantity <= 0 && styles.btnDisabled,
                ]}
                onPress={handleAddToCart}
                disabled={selectedProduct.inventory_quantity <= 0}
              >
                <Ionicons
                  name="bag-add-outline"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.addToCartText}>
                  {selectedProduct.inventory_quantity > 0
                    ? "Add to Order"
                    : "Not Available"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* All Flavors Grid */}
        <View style={styles.section}>
          <SectionHeader label="ALL VARIETIES" title="Our Full Menu" />
          <View style={styles.allFlavors}>
            {products.map((product, idx) => (
              <TouchableOpacity
                key={product.product_id}
                style={styles.flavorCard}
                onPress={() => handleSelectProduct(product)}
              >
                <View
                  style={[
                    styles.flavorColorBand,
                    {
                      backgroundColor:
                        FLAVOR_PALETTE[idx % FLAVOR_PALETTE.length],
                    },
                  ]}
                />
                <View style={styles.flavorCardContent}>
                  <Text style={styles.flavorName}>{product.product_name}</Text>
                  <Text style={styles.flavorPrice}>
                    ${parseFloat(product.price).toFixed(2)}
                  </Text>
                  <Text style={styles.flavorDesc} numberOfLines={2}>
                    {product.short_description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.secondary}
          />
          <Text style={styles.infoText}>
            Our ice cream and kulfi are made fresh daily with seasonal
            ingredients. Availability may vary. Call ahead or visit us in store
            to confirm today's selection.
          </Text>
        </View>

        <View style={{ height: 100 }} />
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
  hero: {
    height: 220,
    backgroundColor: COLORS.headerBg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroDecor: { ...StyleSheet.absoluteFillObject },
  heroBlob: { position: "absolute", width: 120, height: 120, borderRadius: 60 },
  heroContent: { padding: SPACING.xl, paddingBottom: SPACING.lg },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  heroLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
  },
  section: { padding: SPACING.lg },
  productTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  productTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  productTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  productTabTextActive: { color: COLORS.white },
  productDetail: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  productImage: { width: "100%", height: 240 },
  productImagePlaceholder: {
    height: 160,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  productEmoji: { fontSize: 64 },
  productInfo: { padding: SPACING.lg },
  productHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  productName: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  availabilityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: FONT_SIZES.xs, fontWeight: "700" },
  productPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  comparePrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
    marginBottom: SPACING.md,
  },
  productDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  variantsSection: { marginBottom: SPACING.lg },
  variantsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMedium,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  variantsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: COLORS.surface,
  },
  flavorDot: { width: 8, height: 8, borderRadius: 4 },
  variantText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  variantPrice: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
  },
  btnDisabled: { backgroundColor: COLORS.textMuted },
  addToCartText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
  allFlavors: { gap: SPACING.sm },
  flavorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  flavorColorBand: { width: 6, alignSelf: "stretch" },
  flavorCardContent: { flex: 1, padding: SPACING.md },
  flavorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  flavorPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
  },
  flavorDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  infoNote: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
    margin: SPACING.md,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

export default IceCreamScreen;
