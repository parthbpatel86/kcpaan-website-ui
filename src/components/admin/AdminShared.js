// src/components/admin/AdminShared.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, ScrollView, Modal, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING, STATUS_COLORS } from '../../utils/adminConstants';

// ── Stat Card ────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = ADMIN_COLORS.primary, trend, trendLabel }) => (
  <View style={[adminStyles.statCard, { borderTopColor: color }]}>
    <View style={adminStyles.statHeader}>
      <View style={[adminStyles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      {trend !== undefined && (
        <View style={[adminStyles.trendBadge, { backgroundColor: trend >= 0 ? ADMIN_COLORS.success + '22' : ADMIN_COLORS.error + '22' }]}>
          <Ionicons name={trend >= 0 ? 'trending-up' : 'trending-down'} size={12} color={trend >= 0 ? ADMIN_COLORS.success : ADMIN_COLORS.error} />
          <Text style={[adminStyles.trendText, { color: trend >= 0 ? ADMIN_COLORS.success : ADMIN_COLORS.error }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={adminStyles.statValue}>{value}</Text>
    <Text style={adminStyles.statLabel}>{label}</Text>
    {trendLabel && <Text style={adminStyles.trendLabel}>{trendLabel}</Text>}
  </View>
);

// ── Status Badge ───────────────────────────────────────────────
export const StatusBadge = ({ status, size = 'sm' }) => {
  const color = STATUS_COLORS[status?.toLowerCase()] || ADMIN_COLORS.textMuted;
  return (
    <View style={[adminStyles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <View style={[adminStyles.badgeDot, { backgroundColor: color }]} />
      <Text style={[adminStyles.badgeText, { color, fontSize: size === 'sm' ? ADMIN_FONTS.xs : ADMIN_FONTS.sm }]}>
        {status?.toUpperCase()}
      </Text>
    </View>
  );
};

// ── Admin Text Input ──────────────────────────────────────────
export const AdminInput = ({ label, value, onChangeText, placeholder, multiline = false, type = 'text', required = false, ...rest }) => (
  <View style={adminStyles.inputGroup}>
    {label && (
      <Text style={adminStyles.inputLabel}>{label}{required && <Text style={{ color: ADMIN_COLORS.error }}> *</Text>}</Text>
    )}
    <TextInput
      style={[adminStyles.input, multiline && adminStyles.inputMulti]}
      value={value?.toString() || ''}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={ADMIN_COLORS.textDim}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      keyboardType={type === 'number' ? 'decimal-pad' : type === 'email' ? 'email-address' : 'default'}
      textAlignVertical={multiline ? 'top' : 'center'}
      autoCapitalize={type === 'email' ? 'none' : 'sentences'}
      {...rest}
    />
  </View>
);

// ── Admin Select (simple dropdown simulation) ──────────────────
export const AdminSelect = ({ label, value, options = [], onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value || o.key === value);
  return (
    <View style={adminStyles.inputGroup}>
      {label && <Text style={adminStyles.inputLabel}>{label}</Text>}
      <TouchableOpacity style={adminStyles.selectBtn} onPress={() => setOpen(true)}>
        <Text style={[adminStyles.selectText, !selected && { color: ADMIN_COLORS.textDim }]}>
          {selected?.label || 'Select...'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={ADMIN_COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={adminStyles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={adminStyles.selectModal}>
            <Text style={adminStyles.selectModalTitle}>{label}</Text>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value ?? opt.key}
                  style={[adminStyles.selectOption, (value === opt.value || value === opt.key) && adminStyles.selectOptionActive]}
                  onPress={() => { onSelect(opt.value ?? opt.key); setOpen(false); }}
                >
                  <Text style={[adminStyles.selectOptionText, (value === opt.value || value === opt.key) && { color: ADMIN_COLORS.primary }]}>
                    {opt.label}
                  </Text>
                  {(value === opt.value || value === opt.key) && (
                    <Ionicons name="checkmark" size={16} color={ADMIN_COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── Admin Toggle ──────────────────────────────────────────────
export const AdminToggle = ({ label, value, onToggle }) => (
  <View style={adminStyles.toggleRow}>
    <Text style={adminStyles.toggleLabel}>{label}</Text>
    <TouchableOpacity
      style={[adminStyles.toggle, value && adminStyles.toggleOn]}
      onPress={() => onToggle(!value)}
      activeOpacity={0.8}
    >
      <View style={[adminStyles.toggleKnob, value && adminStyles.toggleKnobOn]} />
    </TouchableOpacity>
  </View>
);

// ── Admin Button ──────────────────────────────────────────────
export const AdminButton = ({ label, onPress, loading = false, icon, variant = 'primary', size = 'md', style }) => {
  const bg = variant === 'primary' ? ADMIN_COLORS.primary
    : variant === 'success' ? ADMIN_COLORS.success
    : variant === 'danger' ? ADMIN_COLORS.error
    : variant === 'warning' ? ADMIN_COLORS.warning
    : 'transparent';
  const borderColor = variant === 'ghost' ? ADMIN_COLORS.border : 'transparent';

  return (
    <TouchableOpacity
      style={[
        adminStyles.adminBtn,
        { backgroundColor: bg, borderWidth: 1, borderColor },
        size === 'sm' && adminStyles.adminBtnSm,
        loading && { opacity: 0.7 },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={ADMIN_COLORS.white} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 14 : 16} color={ADMIN_COLORS.white} />}
          <Text style={[adminStyles.adminBtnText, size === 'sm' && { fontSize: ADMIN_FONTS.xs }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ── Data Table Row ─────────────────────────────────────────────
export const TableRow = ({ cells = [], onPress, striped = false }) => (
  <TouchableOpacity
    style={[adminStyles.tableRow, striped && adminStyles.tableRowStriped]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {cells.map((cell, i) => (
      <View key={i} style={[adminStyles.tableCell, cell.flex && { flex: cell.flex }, cell.style]}>
        {typeof cell.content === 'string' ? (
          <Text style={[adminStyles.tableCellText, cell.textStyle]}>{cell.content}</Text>
        ) : cell.content}
      </View>
    ))}
  </TouchableOpacity>
);

// ── Section Header ─────────────────────────────────────────────
export const AdminSectionHeader = ({ title, action, actionLabel, actionIcon }) => (
  <View style={adminStyles.sectionHeader}>
    <Text style={adminStyles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity style={adminStyles.sectionAction} onPress={action}>
        {actionIcon && <Ionicons name={actionIcon} size={14} color={ADMIN_COLORS.primary} />}
        <Text style={adminStyles.sectionActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Empty State ──────────────────────────────────────────────
export const AdminEmpty = ({ icon = 'cube-outline', message = 'No data yet' }) => (
  <View style={adminStyles.emptyState}>
    <Ionicons name={icon} size={48} color={ADMIN_COLORS.textDim} />
    <Text style={adminStyles.emptyText}>{message}</Text>
  </View>
);

// ── Loading ──────────────────────────────────────────────────
export const AdminLoading = ({ message = 'Loading...' }) => (
  <View style={adminStyles.loadingState}>
    <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
    <Text style={adminStyles.loadingText}>{message}</Text>
  </View>
);

// ── Confirm Dialog ────────────────────────────────────────────
export const confirmAction = (title, message, onConfirm, destructive = true) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: destructive ? 'Delete' : 'Confirm', style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

// ─────────────────────── STYLES ──────────────────────────────

const adminStyles = StyleSheet.create({
  // Stat Card
  statCard: {
    flex: 1, minWidth: 140,
    backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 10, padding: ADMIN_SPACING.md,
    borderTopWidth: 3, margin: ADMIN_SPACING.xs,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: ADMIN_SPACING.sm },
  statIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  trendText: { fontSize: ADMIN_FONTS.xs, fontWeight: '700' },
  statValue: { fontSize: ADMIN_FONTS.xxl, fontWeight: '800', color: ADMIN_COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, letterSpacing: 0.5 },
  trendLabel: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginTop: 2 },

  // Badge
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeText: { fontWeight: '700', letterSpacing: 0.5 },

  // Input
  inputGroup: { marginBottom: ADMIN_SPACING.md },
  inputLabel: {
    fontSize: ADMIN_FONTS.xs, fontWeight: '700', color: ADMIN_COLORS.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: ADMIN_SPACING.xs,
  },
  input: {
    backgroundColor: ADMIN_COLORS.bg, borderWidth: 1.5, borderColor: ADMIN_COLORS.border,
    borderRadius: 6, padding: ADMIN_SPACING.sm + 2,
    fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.text,
  },
  inputMulti: { height: 100, textAlignVertical: 'top' },

  // Select
  selectBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: ADMIN_COLORS.bg, borderWidth: 1.5, borderColor: ADMIN_COLORS.border,
    borderRadius: 6, padding: ADMIN_SPACING.sm + 2,
  },
  selectText: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: ADMIN_SPACING.lg },
  selectModal: {
    backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 12,
    maxHeight: 400, overflow: 'hidden',
  },
  selectModalTitle: {
    fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text,
    padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  selectOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  selectOptionActive: { backgroundColor: ADMIN_COLORS.primary + '15' },
  selectOptionText: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.text },

  // Toggle
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ADMIN_SPACING.md },
  toggleLabel: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.textMuted },
  toggle: {
    width: 46, height: 26, borderRadius: 13,
    backgroundColor: ADMIN_COLORS.border, justifyContent: 'center', padding: 2,
  },
  toggleOn: { backgroundColor: ADMIN_COLORS.primary },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: ADMIN_COLORS.white },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // Button
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 6, paddingVertical: 10, paddingHorizontal: ADMIN_SPACING.md,
  },
  adminBtnSm: { paddingVertical: 6, paddingHorizontal: ADMIN_SPACING.sm },
  adminBtnText: { color: ADMIN_COLORS.white, fontSize: ADMIN_FONTS.sm, fontWeight: '700', letterSpacing: 0.5 },

  // Table
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: ADMIN_SPACING.sm, paddingHorizontal: ADMIN_SPACING.md,
    borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  tableRowStriped: { backgroundColor: ADMIN_COLORS.bg + '60' },
  tableCell: { paddingHorizontal: 4 },
  tableCellText: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: ADMIN_SPACING.md,
  },
  sectionTitle: { fontSize: ADMIN_FONTS.lg, fontWeight: '700', color: ADMIN_COLORS.text },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionActionText: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.primary, fontWeight: '600' },

  // Empty/Loading
  emptyState: { alignItems: 'center', padding: ADMIN_SPACING.xxl, gap: ADMIN_SPACING.md },
  emptyText: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.textDim, textAlign: 'center' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: ADMIN_SPACING.md },
  loadingText: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.textMuted },
});

export { adminStyles };
