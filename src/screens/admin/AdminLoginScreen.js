// src/screens/admin/AdminLoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING } from '../../utils/adminConstants';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Required', 'Please enter username and password.'); return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      if (!res?.success) {
        Alert.alert('Login Failed', res?.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background pattern */}
      <View style={styles.bgPattern}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.bgCircle, {
            width: 200 + i * 80,
            height: 200 + i * 80,
            borderRadius: (200 + i * 80) / 2,
            opacity: 0.02 + i * 0.005,
          }]} />
        ))}
      </View>

      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>KC</Text>
          </View>
          <Text style={styles.logoTitle}>KC PAAN</Text>
          <Text style={styles.logoSub}>ADMIN PORTAL</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color={ADMIN_COLORS.textDim} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="admin username"
                placeholderTextColor={ADMIN_COLORS.textDim}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={ADMIN_COLORS.textDim} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={ADMIN_COLORS.textDim}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons
                  name={showPass ? 'eye-outline' : 'eye-off-outline'}
                  size={16}
                  color={ADMIN_COLORS.textDim}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={ADMIN_COLORS.white} />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In to Dashboard</Text>
                <Ionicons name="arrow-forward" size={18} color={ADMIN_COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>KC Paan Admin • Secure Access Only</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: ADMIN_COLORS.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  bgPattern: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  bgCircle: {
    position: 'absolute',
    borderWidth: 1, borderColor: ADMIN_COLORS.primary,
  },
  card: {
    width: '90%', maxWidth: 380,
    backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: ADMIN_COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5, shadowRadius: 40, elevation: 20,
  },
  logoWrap: { alignItems: 'center', paddingVertical: ADMIN_SPACING.xl },
  logo: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: ADMIN_COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: ADMIN_SPACING.md,
    shadowColor: ADMIN_COLORS.primary,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  logoText: { fontSize: 24, fontWeight: '900', color: ADMIN_COLORS.white, letterSpacing: 2 },
  logoTitle: {
    fontSize: ADMIN_FONTS.xl, fontWeight: '800', color: ADMIN_COLORS.text,
    letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  logoSub: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.secondary, letterSpacing: 3, marginTop: 4 },
  divider: { height: 1, backgroundColor: ADMIN_COLORS.border },
  form: { padding: ADMIN_SPACING.xl },
  field: { marginBottom: ADMIN_SPACING.md },
  label: {
    fontSize: ADMIN_FONTS.xs, fontWeight: '700', color: ADMIN_COLORS.textDim,
    letterSpacing: 1.5, marginBottom: ADMIN_SPACING.xs,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm,
    backgroundColor: ADMIN_COLORS.bg, borderWidth: 1.5, borderColor: ADMIN_COLORS.border,
    borderRadius: 8, paddingHorizontal: ADMIN_SPACING.md, paddingVertical: ADMIN_SPACING.sm,
  },
  input: { flex: 1, fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.text },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ADMIN_SPACING.sm,
    backgroundColor: ADMIN_COLORS.primary, borderRadius: 8,
    paddingVertical: 14, marginTop: ADMIN_SPACING.sm,
  },
  loginBtnText: { color: ADMIN_COLORS.white, fontSize: ADMIN_FONTS.md, fontWeight: '700', letterSpacing: 1 },
  footer: {
    fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim,
    textAlign: 'center', padding: ADMIN_SPACING.md,
    borderTopWidth: 1, borderTopColor: ADMIN_COLORS.border,
  },
});

export default AdminLoginScreen;
