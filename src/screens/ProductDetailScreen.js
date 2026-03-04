// src/screens/ProductDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import { useCart } from "../context/CartContext";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import { StarRating } from "../components/shared/index";

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const [varRes, revRes, imgRes] = await Promise.allSettled([
        apiService.selectRecords(
          "product_variants",
          `product_id = ${product.product_id} AND is_active = 1`,
        ),
        apiService.getProductReviews(product.product_id),
        apiService.selectRecords(
          "product_images",
          `product_id = ${product.product_id}`,
          "*",
          "display_order",
        ),
      ]);
      if (varRes.status === "fulfilled") setVariants(varRes.value?.data || []);
      if (revRes.status === "fulfilled") setReviews(revRes.value?.data || []);
      if (imgRes.status === "fulfilled") setImages(imgRes.value?.data || []);
    } catch {}
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const finalPrice = (
    parseFloat(product.price) + (selectedVariant?.price_adjustment || 0)
  ).toFixed(2);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const allImages =
    images.length > 0
      ? images
      : product.image_url
        ? [{ image_url: product.image_url }]
        : [];

  return (
    <View style={styles.root}>
      <Header navigation={navigation} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          {allImages.length > 0 ? (
            <>
              <Image
                source={{ uri: allImages[currentImage]?.image_url }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {allImages.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbsScroll}
                >
                  {allImages.map((img, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setCurrentImage(i)}
                    >
                      <Image
                        source={{ uri: img.image_url }}
                        style={[
                          styles.thumb,
                          currentImage === i && styles.thumbActive,
                        ]}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="leaf-outline" size={80} color={COLORS.border} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Name & Rating */}
          <Text style={styles.productName}>{product.product_name}</Text>
          {reviews.length > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={avgRating} />
              <Text style={styles.ratingCount}>({reviews.length} reviews)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${finalPrice}</Text>
            {product.compare_at_price && (
              <Text style={styles.comparePrice}>
                ${parseFloat(product.compare_at_price).toFixed(2)}
              </Text>
            )}
            {product.compare_at_price && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  Save{" "}
                  {Math.round(
                    ((product.compare_at_price - product.price) /
                      product.compare_at_price) *
                      100,
                  )}
                  %
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {product.full_description || product.short_description}
          </Text>

          {/* Variants */}
          {variants.length > 0 && (
            <View style={styles.variantsSection}>
              <Text style={styles.variantsLabel}>
                {variants[0]?.variant_type?.toUpperCase() || "VARIANT"}
              </Text>
              <View style={styles.variantsRow}>
                {variants.map((v) => (
                  <TouchableOpacity
                    key={v.variant_id}
                    style={[
                      styles.variantBtn,
                      selectedVariant?.variant_id === v.variant_id &&
                        styles.variantBtnActive,
                    ]}
                    onPress={() =>
                      setSelectedVariant(
                        selectedVariant?.variant_id === v.variant_id ? null : v,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.variantBtnText,
                        selectedVariant?.variant_id === v.variant_id &&
                          styles.variantBtnTextActive,
                      ]}
                    >
                      {v.variant_name}
                    </Text>
                    {v.price_adjustment > 0 && (
                      <Text style={styles.variantAdjust}>
                        +${v.price_adjustment}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.variantsLabel}>QUANTITY</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  setQuantity(
                    Math.min(product.max_order_quantity || 20, quantity + 1),
                  )
                }
              >
                <Ionicons name="add" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart */}
          <TouchableOpacity
            style={[
              styles.addBtn,
              !product.is_available_online && styles.addBtnDisabled,
              added && styles.addBtnSuccess,
            ]}
            onPress={handleAddToCart}
            disabled={!product.is_available_online}
          >
            <Ionicons
              name={added ? "checkmark" : "bag-add-outline"}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.addBtnText}>
              {!product.is_available_online
                ? "In-Store Only"
                : added
                  ? "Added to Cart!"
                  : "Add to Cart"}
            </Text>
          </TouchableOpacity>

          {/* SKU */}
          {product.sku && <Text style={styles.sku}>SKU: {product.sku}</Text>}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              {reviews.map((r, i) => (
                <View key={i} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <StarRating rating={r.rating} size={13} />
                    {r.is_verified_purchase && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={12}
                          color={COLORS.success}
                        />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  {r.review_title && (
                    <Text style={styles.reviewItemTitle}>{r.review_title}</Text>
                  )}
                  <Text style={styles.reviewItemText}>{r.review_text}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
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
  gallery: { backgroundColor: COLORS.backgroundDark },
  mainImage: { width: "100%", height: 320 },
  noImage: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundDark,
  },
  thumbsScroll: { padding: SPACING.sm },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 4,
    marginRight: SPACING.sm,
    opacity: 0.7,
  },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: COLORS.primary },
  content: { padding: SPACING.lg },
  productName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  ratingCount: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  price: { fontSize: 28, fontWeight: "800", color: COLORS.primary },
  comparePrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  saveBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  saveText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.success,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  variantsSection: { marginBottom: SPACING.lg },
  variantsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMedium,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  variantsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  variantBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  variantBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  variantBtnTextActive: { color: COLORS.white },
  variantAdjust: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  quantitySection: { marginBottom: SPACING.lg },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  qtyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 30,
    textAlign: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  addBtnDisabled: { backgroundColor: COLORS.textMuted },
  addBtnSuccess: { backgroundColor: COLORS.success },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sku: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  reviewsSection: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.lg,
  },
  reviewsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.md,
  },
  reviewItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: "600",
  },
  reviewItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

export default ProductDetailScreen;
