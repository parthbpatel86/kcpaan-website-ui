// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { login, register } = useAuth();

  const setField = (field) => (value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Required", "Please enter email and password.");
      return;
    }
    if (!isLogin) {
      if (!form.firstName) {
        Alert.alert("Required", "Please enter your first name.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      if (form.password.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = isLogin
        ? await login(form.email, form.password)
        : await register({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          });

      if (response?.success) {
        if (isLogin) {
          navigation.goBack();
        } else {
          Alert.alert(
            "Account Created!",
            "Please check your email to verify your account.",
            [{ text: "OK", onPress: () => setIsLogin(true) }],
          );
        }
      } else {
        Alert.alert(
          "Error",
          response?.message ||
            (isLogin ? "Invalid email or password." : "Registration failed."),
        );
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, secure = false, ...props }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, secure && { paddingRight: 46 }]}
          value={form[field]}
          onChangeText={setField(field)}
          secureTextEntry={secure && !showPass}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          {...props}
        />
        {secure && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPass(!showPass)}
          >
            <Ionicons
              name={showPass ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <Header navigation={navigation} showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>KC PAAN</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroSubtitle}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Tab Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isLogin && styles.toggleTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !isLogin && styles.toggleTextActive,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Fields */}
            {!isLogin && (
              <>
                <View style={styles.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="First Name *"
                      field="firstName"
                      placeholder="First"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={{ width: SPACING.md }} />
                  <View style={{ flex: 1 }}>
                    <Field
                      label="Last Name"
                      field="lastName"
                      placeholder="Last"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <Field
                  label="Phone"
                  field="phone"
                  placeholder="(816) 000-0000"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <Field
              label="Email *"
              field="email"
              placeholder="your@email.com"
              keyboardType="email-address"
            />
            <Field
              label="Password *"
              field="password"
              placeholder="••••••••"
              secure
            />
            {!isLogin && (
              <Field
                label="Confirm Password *"
                field="confirmPassword"
                placeholder="••••••••"
                secure
              />
            )}

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Text style={styles.switchLink}>
                  {isLogin ? "Register" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.guestNote}>
              You can also checkout as a guest without an account.
            </Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: COLORS.headerBg,
    padding: SPACING.xxl,
    alignItems: "center",
    paddingBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  heroLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  form: { padding: SPACING.lg },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 8,
    marginBottom: SPACING.xl,
    overflow: "hidden",
  },
  toggleBtn: { flex: 1, paddingVertical: SPACING.md, alignItems: "center" },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  toggleTextActive: { color: COLORS.white },
  nameRow: { flexDirection: "row" },
  field: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMedium,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
  },
  inputWrap: { position: "relative" },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  forgotBtn: { alignItems: "flex-end", marginBottom: SPACING.md },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
  switchBtn: { marginTop: SPACING.lg, alignItems: "center" },
  switchText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  switchLink: { color: COLORS.primary, fontWeight: "700" },
  guestNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.md,
  },
});

export default LoginScreen;
