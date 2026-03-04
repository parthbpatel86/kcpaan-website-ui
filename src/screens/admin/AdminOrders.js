// src/screens/admin/AdminOrders.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING, ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/adminConstants';
import adminApiService from '../../api/adminApiService';
import {
  StatusBadge, AdminButton, AdminSelect, AdminInput,
  AdminLoading, AdminEmpty, confirmAction, adminStyles,
} from '../../components/admin/AdminShared';

const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { loadOrders(); }, [activeFilter, page]);

  const loadOrders = async () => {
    try {
      const filters = {};
      if (activeFilter !== 'all') filters.status = activeFilter;
      if (search) filters.search = search;
      const res = await adminApiService.getOrders(page, filters);
      setOrders(res?.data?.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const openOrder = (order) => { setSelectedOrder(order); setModalVisible(true); };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminApiService.updateOrderStatus(orderId, newStatus);
      setSelectedOrder((p) => ({ ...p, order_status: newStatus }));
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, order_status: newStatus } : o));
      Alert.alert('Updated', `Order status changed to ${newStatus}`);
    } catch { Alert.alert('Error', 'Failed to update order status.'); }
  };

  const handlePaymentUpdate = async (orderId, newStatus) => {
    try {
      await adminApiService.updatePaymentStatus(orderId, newStatus);
      setSelectedOrder((p) => ({ ...p, payment_status: newStatus }));
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, payment_status: newStatus } : o));
    } catch { Alert.alert('Error', 'Failed to update payment status.'); }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      `${o.shipping_first_name} ${o.shipping_last_name}`.toLowerCase().includes(q) ||
      o.shipping_city?.toLowerCase().includes(q)
    );
  });

  if (loading) return <AdminLoading message="Loading Orders..." />;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.count}>{orders.length} orders</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={ADMIN_COLORS.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order #, customer..."
          placeholderTextColor={ADMIN_COLORS.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => { setActiveFilter(f); setPage(1); }}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.order_id?.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor={ADMIN_COLORS.primary} />}
        ListEmptyComponent={<AdminEmpty icon="receipt-outline" message="No orders found" />}
        renderItem={({ item: order, index }) => (
          <TouchableOpacity
            style={[styles.orderCard, index % 2 === 1 && styles.orderCardAlt]}
            onPress={() => openOrder(order)}
            activeOpacity={0.8}
          >
            <View style={styles.orderCardLeft}>
              <Text style={styles.orderNum}>#{order.order_number}</Text>
              <Text style={styles.orderCustomer}>
                {order.shipping_first_name} {order.shipping_last_name}
              </Text>
              <Text style={styles.orderDate}>
                {new Date(order.created_at || order.order_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.orderCardRight}>
              <Text style={styles.orderAmount}>${parseFloat(order.total_amount || 0).toFixed(2)}</Text>
              <StatusBadge status={order.order_status} />
              <StatusBadge status={order.payment_status} />
            </View>
            <Ionicons name="chevron-forward" size={16} color={ADMIN_COLORS.textDim} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Order Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setModalVisible(false)}
            onStatusUpdate={handleStatusUpdate}
            onPaymentUpdate={handlePaymentUpdate}
          />
        )}
      </Modal>
    </View>
  );
};

const OrderDetailModal = ({ order, onClose, onStatusUpdate, onPaymentUpdate }) => {
  const [trackingNum, setTrackingNum] = useState(order.tracking_number || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const saveTracking = async () => {
    setSaving(true);
    try {
      await adminApiService.updateOrderStatus(order.order_id, order.order_status, trackingNum);
      Alert.alert('Saved', 'Tracking number updated.');
    } catch { Alert.alert('Error', 'Failed to save tracking number.'); }
    finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await adminApiService.addOrderNote(order.order_id, note);
      setNote('');
      Alert.alert('Note Added', 'Order note saved.');
    } catch { Alert.alert('Error', 'Failed to add note.'); }
  };

  return (
    <View style={styles.modal}>
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <View>
          <Text style={styles.modalTitle}>Order #{order.order_number}</Text>
          <Text style={styles.modalSub}>{new Date(order.created_at || order.order_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={ADMIN_COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalBody}>
        {/* Status Controls */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Order Status</Text>
          <View style={styles.statusGrid}>
            {ORDER_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, order.order_status === s && styles.statusBtnActive]}
                onPress={() => onStatusUpdate(order.order_id, s)}
              >
                <Text style={[styles.statusBtnText, order.order_status === s && styles.statusBtnTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Payment Status</Text>
          <View style={styles.statusGrid}>
            {PAYMENT_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, order.payment_status === s && { ...styles.statusBtnActive, backgroundColor: ADMIN_COLORS.success }]}
                onPress={() => onPaymentUpdate(order.order_id, s)}
              >
                <Text style={[styles.statusBtnText, order.payment_status === s && styles.statusBtnTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Customer & Shipping</Text>
          <View style={styles.infoGrid}>
            <InfoRow label="Name" value={`${order.shipping_first_name} ${order.shipping_last_name}`} />
            <InfoRow label="Address" value={`${order.shipping_address1}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}`} />
            {order.shipping_phone && <InfoRow label="Phone" value={order.shipping_phone} />}
          </View>
        </View>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Items ({order.items.length})</Text>
            {order.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>${parseFloat(item.unit_price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.orderTotals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalVal}>${parseFloat(order.subtotal_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalVal}>${parseFloat(order.shipping_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalVal}>${parseFloat(order.tax_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowBold]}>
                <Text style={styles.totalLabelBold}>TOTAL</Text>
                <Text style={styles.totalValBold}>${parseFloat(order.total_amount || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tracking Number */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Tracking</Text>
          <View style={styles.trackingRow}>
            <TextInput
              style={[styles.trackingInput, { flex: 1 }]}
              value={trackingNum}
              onChangeText={setTrackingNum}
              placeholder="Enter tracking number"
              placeholderTextColor={ADMIN_COLORS.textDim}
            />
            <AdminButton label="Save" onPress={saveTracking} loading={saving} size="sm" style={{ marginLeft: ADMIN_SPACING.sm }} />
          </View>
        </View>

        {/* Add Note */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Add Note</Text>
          <TextInput
            style={[adminStyles.input, { height: 80, textAlignVertical: 'top', color: ADMIN_COLORS.text }]}
            value={note}
            onChangeText={setNote}
            placeholder="Internal note about this order..."
            placeholderTextColor={ADMIN_COLORS.textDim}
            multiline
          />
          <AdminButton label="Add Note" onPress={addNote} icon="chatbubble-outline" size="sm" style={{ marginTop: ADMIN_SPACING.sm }} />
        </View>

        {/* Cancel */}
        <View style={[styles.modalSection, { paddingBottom: 40 }]}>
          <AdminButton
            label="Cancel Order"
            onPress={() => confirmAction('Cancel Order', 'Are you sure you want to cancel this order?',
              () => onStatusUpdate(order.order_id, 'cancelled')
            )}
            variant="danger"
            icon="close-circle-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: ADMIN_SPACING.lg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  title: { fontSize: ADMIN_FONTS.xl, fontWeight: '800', color: ADMIN_COLORS.text },
  count: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 8, paddingHorizontal: ADMIN_SPACING.md, paddingVertical: ADMIN_SPACING.sm,
    borderWidth: 1, borderColor: ADMIN_COLORS.border,
  },
  searchInput: { flex: 1, color: ADMIN_COLORS.text, fontSize: ADMIN_FONTS.md },
  filters: { paddingHorizontal: ADMIN_SPACING.md, marginBottom: ADMIN_SPACING.sm },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16,
    backgroundColor: ADMIN_COLORS.bgCard, marginRight: ADMIN_SPACING.sm,
    borderWidth: 1, borderColor: ADMIN_COLORS.border,
  },
  filterChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  filterText: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, fontWeight: '600' },
  filterTextActive: { color: ADMIN_COLORS.white },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  orderCardAlt: { backgroundColor: ADMIN_COLORS.bg },
  orderCardLeft: { flex: 1 },
  orderNum: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  orderCustomer: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  orderDate: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginTop: 2 },
  orderCardRight: { alignItems: 'flex-end', gap: 4 },
  orderAmount: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.success },
  // Modal
  modal: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: ADMIN_SPACING.lg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
    backgroundColor: ADMIN_COLORS.bgCard,
    paddingTop: ADMIN_SPACING.lg + 40,
  },
  modalTitle: { fontSize: ADMIN_FONTS.xl, fontWeight: '800', color: ADMIN_COLORS.text },
  modalSub: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  closeBtn: { padding: 8 },
  modalBody: { flex: 1 },
  modalSection: {
    margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 10, padding: ADMIN_SPACING.md,
    borderWidth: 1, borderColor: ADMIN_COLORS.border,
  },
  modalSectionTitle: {
    fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text,
    marginBottom: ADMIN_SPACING.md, paddingBottom: ADMIN_SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ADMIN_SPACING.sm },
  statusBtn: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6,
    backgroundColor: ADMIN_COLORS.bg, borderWidth: 1, borderColor: ADMIN_COLORS.border,
  },
  statusBtnActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  statusBtnText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, fontWeight: '600' },
  statusBtnTextActive: { color: ADMIN_COLORS.white },
  infoGrid: { gap: ADMIN_SPACING.sm },
  infoRow: { flexDirection: 'row', gap: ADMIN_SPACING.md },
  infoLabel: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, width: 70 },
  infoValue: { flex: 1, fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.text, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: ADMIN_SPACING.sm, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  itemName: { flex: 1, fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.text },
  itemQty: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginHorizontal: ADMIN_SPACING.sm },
  itemPrice: { fontSize: ADMIN_FONTS.sm, fontWeight: '700', color: ADMIN_COLORS.text },
  orderTotals: { marginTop: ADMIN_SPACING.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRowBold: { borderTopWidth: 1, borderTopColor: ADMIN_COLORS.border, paddingTop: ADMIN_SPACING.sm, marginTop: ADMIN_SPACING.sm },
  totalLabel: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted },
  totalVal: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.text, fontWeight: '600' },
  totalLabelBold: { fontSize: ADMIN_FONTS.md, fontWeight: '800', color: ADMIN_COLORS.text },
  totalValBold: { fontSize: ADMIN_FONTS.lg, fontWeight: '800', color: ADMIN_COLORS.success },
  trackingRow: { flexDirection: 'row', alignItems: 'center' },
  trackingInput: {
    backgroundColor: ADMIN_COLORS.bg, borderWidth: 1.5, borderColor: ADMIN_COLORS.border,
    borderRadius: 6, padding: ADMIN_SPACING.sm, fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.text,
  },
});

export default AdminOrders;
