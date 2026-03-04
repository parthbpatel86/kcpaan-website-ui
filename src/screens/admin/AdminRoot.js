// src/screens/admin/AdminRoot.js
// Entry point for the admin section - handles auth gate
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AdminAuthProvider, useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoginScreen from './AdminLoginScreen';
import AdminApp from './AdminApp';
import { ADMIN_COLORS } from '../../utils/adminConstants';

const AdminGate = () => {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  return isAdminAuthenticated ? <AdminApp /> : <AdminLoginScreen />;
};

const AdminRoot = () => (
  <AdminAuthProvider>
    <AdminGate />
  </AdminAuthProvider>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminRoot;
