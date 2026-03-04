// src/components/ProductCard.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onPress, compact = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  };

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={[styles.imageContainer, compact && styles.imageCompact]}>
        {product.image_url || product.primary_image ? (
          <Image
            source={{ uri: product.image_url || product.primary_image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="leaf-outline" size={40} color={COLORS.border} />
          </View>
        )}
        {discountPercent && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discountPercent}%</Text>
          </View>
        )}
        {!product.is_available_online && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>In-Store Only</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.product_name}
        </Text>
        {product.short_description && !compact && (
          <Text style={styles.description} numberOfLines={2}>
            {product.short_description}
          </Text>
        )}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
            {product.compare_at_price && (
              <Text style={styles.comparePrice}>
                ${parseFloat(product.compare_at_price).toFixed(2)}
              </Text>
            )}
          </View>
          {product.is_available_online && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <Ionicons name="add" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 6,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCompact: { maxWidth: 160 },
  imageContainer: { height: 160, position: 'relative', backgroundColor: COLORS.backgroundDark },
  imageCompact: { height: 120 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3,
  },
  badgeText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '700' },
  unavailableBadge: {
    position: 'absolute', bottom: 8, left: 0, right: 0,
    backgroundColor: 'rgba(26,10,0,0.7)',
    paddingVertical: 4, alignItems: 'center',
  },
  unavailableText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  info: { padding: SPACING.sm },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
  comparePrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default ProductCard;
