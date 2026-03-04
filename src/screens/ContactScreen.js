// src/screens/ContactScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES, STORE_INFO } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import { SectionHeader } from "../components/shared/index";

const INQUIRY_TYPES = [
  { key: "general", label: "General", icon: "chatbubble-outline" },
  { key: "catering", label: "Catering", icon: "restaurant-outline" },
  { key: "feedback", label: "Feedback", icon: "star-outline" },
  { key: "support", label: "Support", icon: "help-circle-outline" },
];

const ContactScreen = ({ navigation, route }) => {
  const initialType = route.params?.type || "general";
  const [activeType, setActiveType] = useState(initialType);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) {
      Alert.alert(
        "Required Fields",
        "Please fill in first name, email, and message.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiService.submitContactForm({ ...form, type: activeType });
      Alert.alert("Message Sent!", "We'll get back to you within 24 hours.", [
        {
          text: "OK",
          onPress: () =>
            setForm({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              subject: "",
              message: "",
            }),
        },
      ]);
    } catch {
      Alert.alert(
        "Error",
        "Could not send message. Please try calling or emailing us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = () => {
    const address = encodeURIComponent(STORE_INFO.address);
    Linking.openURL(
      Platform.OS === "ios"
        ? `maps:?address=${address}`
        : `https://www.google.com/maps/search/?api=1&query=${address}`,
    );
  };

  const Field = ({ label, field, required = false, ...props }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && " *"}
      </Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={setField(field)}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Contact" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${STORE_INFO.phone}`)}
          >
            <Ionicons name="call" size={22} color={COLORS.white} />
            <Text style={styles.actionLabel}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.whatsappBtn]}
            onPress={() =>
              Linking.openURL(`https://wa.me/${STORE_INFO.whatsapp}`)
            }
          >
            <Ionicons name="logo-whatsapp" size={22} color={COLORS.white} />
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.emailBtn]}
            onPress={() => Linking.openURL(`mailto:${STORE_INFO.email}`)}
          >
            <Ionicons name="mail" size={22} color={COLORS.white} />
            <Text style={styles.actionLabel}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.mapBtn]}
            onPress={openMaps}
          >
            <Ionicons name="map" size={22} color={COLORS.white} />
            <Text style={styles.actionLabel}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            {[
              {
                icon: "logo-facebook",
                color: "#1877F2",
                url: STORE_INFO.social.facebook,
                label: "Facebook",
              },
              {
                icon: "logo-instagram",
                color: "#E1306C",
                url: STORE_INFO.social.instagram,
                label: "Instagram",
              },
              {
                icon: "logo-youtube",
                color: "#FF0000",
                url: STORE_INFO.social.youtube,
                label: "YouTube",
              },
              {
                icon: "logo-whatsapp",
                color: "#25D366",
                url: `https://wa.me/${STORE_INFO.whatsapp}`,
                label: "WhatsApp",
              },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.socialBtn}
                onPress={() => Linking.openURL(s.url)}
              >
                <View style={[styles.socialIcon, { backgroundColor: s.color }]}>
                  <Ionicons name={s.icon} size={22} color={COLORS.white} />
                </View>
                <Text style={styles.socialLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <SectionHeader label="GET IN TOUCH" title="Send a Message" />

          {/* Inquiry Type */}
          <View style={styles.typeRow}>
            {INQUIRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeBtn,
                  activeType === t.key && styles.typeBtnActive,
                ]}
                onPress={() => setActiveType(t.key)}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={activeType === t.key ? COLORS.white : COLORS.textLight}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    activeType === t.key && styles.typeBtnTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Field
                label="First Name"
                field="firstName"
                required
                placeholder="First"
              />
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Field label="Last Name" field="lastName" placeholder="Last" />
            </View>
          </View>

          <Field
            label="Email"
            field="email"
            required
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone"
            field="phone"
            placeholder="(816) 000-0000"
            keyboardType="phone-pad"
          />
          <Field
            label="Subject"
            field="subject"
            placeholder="What's this about?"
          />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.message}
              onChangeText={setField("message")}
              placeholder={
                activeType === "catering"
                  ? "Tell us about your event: date, number of guests, occasion..."
                  : "Your message here..."
              }
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="send-outline" size={18} color={COLORS.white} />
            <Text style={styles.submitBtnText}>
              {submitting ? "Sending..." : "Send Message"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <TouchableOpacity style={styles.storeInfoRow} onPress={openMaps}>
            <Ionicons name="location" size={18} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeInfoValue}>{STORE_INFO.address}</Text>
              <Text style={styles.storeInfoLink}>Open in Maps →</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.storeInfoRow}>
            <Ionicons name="time" size={18} color={COLORS.secondary} />
            <View>
              <Text style={styles.storeInfoValue}>
                {STORE_INFO.hours.weekdays}
              </Text>
              <Text style={styles.storeInfoValue}>
                {STORE_INFO.hours.weekends}
              </Text>
            </View>
          </View>
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
  quickActions: {
    flexDirection: "row",
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.headerBg,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
  },
  whatsappBtn: { backgroundColor: "#25D366" },
  emailBtn: { backgroundColor: COLORS.secondary },
  mapBtn: { backgroundColor: COLORS.accent },
  actionLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
  },
  socialSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  socialTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  socialRow: { flexDirection: "row", justifyContent: "space-around" },
  socialBtn: { alignItems: "center", gap: SPACING.xs },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  socialLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  formSection: { padding: SPACING.lg },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  typeBtnTextActive: { color: COLORS.white },
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
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textarea: { height: 120 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
  storeInfo: {
    backgroundColor: COLORS.headerBg,
    margin: SPACING.md,
    borderRadius: 8,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  storeInfoRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
  },
  storeInfoValue: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
  },
  storeInfoLink: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default ContactScreen;
