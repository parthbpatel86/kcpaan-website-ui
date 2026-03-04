// src/screens/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING, STATUS_COLORS } from '../../utils/adminConstants';
import adminApiService from '../../api/adminApiService';
import { StatCard, StatusBadge, AdminLoading, AdminEmpty } from '../../components/admin/AdminShared';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.allSettled([
        adminApiService.getDashboardStats(),
        adminApiService.getOrders(1, { limit: 5 }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value?.data?.orders || []);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <AdminLoading message="Loading Dashboard..." />;

  const s = stats || {};

  const QUICK_ACTIONS = [
    { label: 'Add Product', icon: 'add-circle-outline', screen: 'Products', color: ADMIN_COLORS.info },
    { label: 'View Orders', icon: 'receipt-outline', screen: 'Orders', color: ADMIN_COLORS.warning },
    { label: 'Update Menu', icon: 'restaurant-outline', screen: 'Menu', color: ADMIN_COLORS.success },
    { label: 'Manage Events', icon: 'calendar-outline', screen: 'Events', color: ADMIN_COLORS.secondary },
    { label: 'Catering Requests', icon: 'people-outline', screen: 'Catering', color: ADMIN_COLORS.primary },
    { label: 'Page Content', icon: 'document-text-outline', screen: 'Content', color: '#8B5CF6' },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor={ADMIN_COLORS.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Live</Text>
        </View>
      </View>

      {/* Stats Row 1 */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Revenue"
          value={`$${(s.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="cash-outline"
          color={ADMIN_COLORS.success}
          trend={s.revenue_trend}
          trendLabel="vs last month"
        />
        <StatCard
          label="Total Orders"
          value={s.total_orders || 0}
          icon="receipt-outline"
          color={ADMIN_COLORS.info}
          trend={s.orders_trend}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Products"
          value={s.total_products || 0}
          icon="cube-outline"
          color={ADMIN_COLORS.secondary}
        />
        <StatCard
          label="Customers"
          value={s.total_customers || 0}
          icon="people-outline"
          color={ADMIN_COLORS.primary}
          trend={s.customers_trend}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Pending Orders"
          value={s.pending_orders || 0}
          icon="time-outline"
          color={ADMIN_COLORS.warning}
        />
        <StatCard
          label="Low Stock Items"
          value={s.low_stock || 0}
          icon="warning-outline"
          color={ADMIN_COLORS.error}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.quickCard, { borderColor: a.color + '44' }]}
              onPress={() => onNavigate(a.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => onNavigate('Orders')}>
            <Text style={styles.seeAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length === 0 ? (
          <AdminEmpty icon="receipt-outline" message="No orders yet" />
        ) : (
          recentOrders.map((order, i) => (
            <TouchableOpacity
              key={order.order_id}
              style={[styles.orderRow, i % 2 === 1 && styles.orderRowAlt]}
              onPress={() => onNavigate('Orders', { orderId: order.order_id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNum}>#{order.order_number}</Text>
                <Text style={styles.orderCustomer}>
                  {order.shipping_first_name} {order.shipping_last_name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.orderAmount}>${parseFloat(order.total_amount || 0).toFixed(2)}</Text>
                <StatusBadge status={order.order_status} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Alerts */}
      {(s.low_stock > 0 || s.pending_catering > 0 || s.pending_reviews > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {s.low_stock > 0 && (
            <TouchableOpacity style={[styles.alert, styles.alertWarning]} onPress={() => onNavigate('Products')}>
              <Ionicons name="warning-outline" size={18} color={ADMIN_COLORS.warning} />
              <Text style={[styles.alertText, { color: ADMIN_COLORS.warning }]}>
                {s.low_stock} product(s) are low on stock
              </Text>
              <Ionicons name="chevron-forward" size={14} color={ADMIN_COLORS.warning} />
            </TouchableOpacity>
          )}
          {s.pending_catering > 0 && (
            <TouchableOpacity style={[styles.alert, styles.alertInfo]} onPress={() => onNavigate('Catering')}>
              <Ionicons name="people-outline" size={18} color={ADMIN_COLORS.info} />
              <Text style={[styles.alertText, { color: ADMIN_COLORS.info }]}>
                {s.pending_catering} new catering request(s) need review
              </Text>
              <Ionicons name="chevron-forward" size={14} color={ADMIN_COLORS.info} />
            </TouchableOpacity>
          )}
          {s.pending_reviews > 0 && (
            <TouchableOpacity style={[styles.alert, styles.alertSuccess]} onPress={() => onNavigate('Reviews')}>
              <Ionicons name="star-outline" size={18} color={ADMIN_COLORS.success} />
              <Text style={[styles.alertText, { color: ADMIN_COLORS.success }]}>
                {s.pending_reviews} review(s) awaiting approval
              </Text>
              <Ionicons name="chevron-forward" size={14} color={ADMIN_COLORS.success} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: ADMIN_SPACING.lg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border,
  },
  headerTitle: { fontSize: ADMIN_FONTS.xxl, fontWeight: '800', color: ADMIN_COLORS.text },
  headerSub: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ADMIN_COLORS.success + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: ADMIN_COLORS.success },
  onlineText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.success, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: ADMIN_SPACING.sm, paddingTop: ADMIN_SPACING.sm },
  section: { margin: ADMIN_SPACING.md, marginTop: ADMIN_SPACING.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ADMIN_SPACING.md },
  sectionTitle: { fontSize: ADMIN_FONTS.lg, fontWeight: '700', color: ADMIN_COLORS.text },
  seeAll: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.primary, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ADMIN_SPACING.sm },
  quickCard: {
    width: '31%', backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 10, padding: ADMIN_SPACING.md, alignItems: 'center',
    borderWidth: 1, gap: ADMIN_SPACING.sm,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, textAlign: 'center', fontWeight: '600' },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 8, marginBottom: ADMIN_SPACING.xs,
  },
  orderRowAlt: { backgroundColor: ADMIN_COLORS.bgCardHover },
  orderNum: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  orderCustomer: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  orderAmount: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.success },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md, borderRadius: 8, marginBottom: ADMIN_SPACING.sm,
    borderWidth: 1,
  },
  alertWarning: { backgroundColor: ADMIN_COLORS.warning + '15', borderColor: ADMIN_COLORS.warning + '44' },
  alertInfo: { backgroundColor: ADMIN_COLORS.info + '15', borderColor: ADMIN_COLORS.info + '44' },
  alertSuccess: { backgroundColor: ADMIN_COLORS.success + '15', borderColor: ADMIN_COLORS.success + '44' },
  alertText: { flex: 1, fontSize: ADMIN_FONTS.sm, fontWeight: '600' },
});

export default AdminDashboard;
