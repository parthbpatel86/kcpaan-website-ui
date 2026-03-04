// src/components/shared/index.js
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <View style={sharedStyles.centered}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={sharedStyles.loadingText}>{message}</Text>
  </View>
);

export const StarRating = ({ rating, size = 14, color = COLORS.secondary }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Ionicons key={i} name="star" size={size} color={color} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Ionicons key={i} name="star-half" size={size} color={color} />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={size} color={color} />);
    }
  }
  return <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>;
};

export const SectionHeader = ({ label, title, centered = false }) => (
  <View style={[sharedStyles.sectionHeader, centered && { alignItems: 'center' }]}>
    {label && <Text style={sharedStyles.sectionLabel}>{label}</Text>}
    {title && <Text style={[sharedStyles.sectionTitle, centered && { textAlign: 'center' }]}>{title}</Text>}
    <View style={[sharedStyles.goldLine, centered && { alignSelf: 'center' }]} />
  </View>
);

export const EmptyState = ({ icon = 'leaf-outline', title, message }) => (
  <View style={sharedStyles.emptyState}>
    <Ionicons name={icon} size={60} color={COLORS.border} />
    {title && <Text style={sharedStyles.emptyTitle}>{title}</Text>}
    {message && <Text style={sharedStyles.emptyMessage}>{message}</Text>}
  </View>
);

const sharedStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  loadingText: { marginTop: SPACING.md, color: COLORS.textLight, fontSize: FONT_SIZES.md },
  sectionHeader: { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  goldLine: {
    height: 3, width: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    marginTop: SPACING.sm,
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textMedium, marginTop: SPACING.md },
  emptyMessage: { fontSize: FONT_SIZES.md, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm },
});
