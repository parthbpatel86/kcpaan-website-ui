// src/screens/CheckoutScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import apiService from "../api/apiService";
import Header from "../components/Header";

// Cross-platform alert helper — Alert.alert is broken on React Native Web
const showAlert = (title, message, buttons) => {
  if (Platform.OS === "web") {
    const actionBtn = buttons?.find((b) => b.style !== "cancel" && b.onPress);
    const cancelBtn = buttons?.find((b) => b.style === "cancel");
    if (actionBtn && cancelBtn) {
      if (window.confirm(`${title}\n\n${message}`)) {
        actionBtn.onPress?.();
      }
    } else if (actionBtn) {
      window.alert(`${title}\n\n${message}`);
      actionBtn.onPress?.();
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const DELIVERY_OPTIONS = [
  {
    key: "pickup",
    label: "Store Pickup",
    subtitle: "Ready in 30 mins · Free",
    price: 0,
  },
  {
    key: "standard",
    label: "Standard Delivery",
    subtitle: "3–5 business days",
    price: 5.99,
  },
  {
    key: "express",
    label: "Express Delivery",
    subtitle: "1–2 business days",
    price: 12.99,
  },
];

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  const [delivery, setDelivery] = useState("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Pricing ─────────────────────────────────────────────────────────
  const subtotal = getCartTotal();
  const tax = subtotal * 0.085;
  const deliveryFee =
    DELIVERY_OPTIONS.find((d) => d.key === delivery)?.price ?? 0;
  const freeShipping = delivery !== "pickup" && subtotal >= 50;
  const effectiveFee = freeShipping ? 0 : deliveryFee;
  const total = subtotal + tax + effectiveFee;

  // ── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (delivery !== "pickup") {
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.state.trim()) e.state = "Required";
      if (!form.zip.trim()) e.zip = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ── Place Order ──────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validate()) {
      showAlert("Missing Info", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const orderData = {
        customer_id: user?.customer_id || null,
        customer_name: `${form.firstName} ${form.lastName}`.trim(),
        customer_email: form.email,
        customer_phone: form.phone,
        delivery_type: delivery,
        delivery_address:
          delivery !== "pickup"
            ? `${form.address}, ${form.city}, ${form.state} ${form.zip}`
            : "Store Pickup",
        order_notes: form.notes,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(tax.toFixed(2)),
        delivery_fee: parseFloat(effectiveFee.toFixed(2)),
        total_amount: parseFloat(total.toFixed(2)),
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          variant_id: item.variant?.variant_id || null,
          variant_name: item.variant?.variant_name || null,
          quantity: item.quantity,
          unit_price: parseFloat(parseFloat(item.price).toFixed(2)),
          total_price: parseFloat(
            (parseFloat(item.price) * item.quantity).toFixed(2),
          ),
        })),
      };

      const response = await apiService.createOrder(orderData);
      const orderId = response?.data?.order_id || response?.data?.id || "N/A";

      clearCart();

      showAlert(
        "🎉 Order Placed!",
        `Thank you, ${form.firstName}! Your order #${orderId} has been received.\n\nWe'll send a confirmation to ${form.email}.`,
        [
          {
            text: "Continue Shopping",
            onPress: () => navigation.navigate("Home"),
          },
        ],
      );
    } catch (err) {
      console.error("Order error:", err);
      const errorMsg =
        err?.response?.data?.error || err?.message || "Something went wrong.";
      showAlert(
        "Order Failed",
        `Could not place your order. Please try again.\n\nError: ${errorMsg}`,
        [{ text: "OK" }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI helpers ───────────────────────────────────────────────────────
  const Field = ({ label, field, placeholder, keyboardType, required }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.req}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder || label}
        placeholderTextColor={COLORS.textMuted}
        value={form[field]}
        onChangeText={(v) => set(field, v)}
        keyboardType={keyboardType || "default"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Checkout" showBack />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Contact Info ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.secondary}
            />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" field="firstName" required />
            </View>
            <View style={{ width: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <Field label="Last Name" field="lastName" required />
            </View>
          </View>
          <Field
            label="Email"
            field="email"
            keyboardType="email-address"
            required
          />
          <Field
            label="Phone"
            field="phone"
            keyboardType="phone-pad"
            required
          />
        </View>

        {/* ── Delivery Method ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Delivery Method</Text>
          </View>
          {DELIVERY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.deliveryOption,
                delivery === opt.key && styles.deliveryOptionActive,
              ]}
              onPress={() => setDelivery(opt.key)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radio,
                  delivery === opt.key && styles.radioActive,
                ]}
              >
                {delivery === opt.key && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.deliveryLabel,
                    delivery === opt.key && styles.deliveryLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.deliverySubtitle}>{opt.subtitle}</Text>
              </View>
              <Text
                style={[
                  styles.deliveryPrice,
                  delivery === opt.key && styles.deliveryPriceActive,
                ]}
              >
                {opt.price === 0
                  ? "FREE"
                  : subtotal >= 50 && opt.key !== "pickup"
                    ? "FREE"
                    : `$${opt.price.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Delivery Address (only if not pickup) ── */}
        {delivery !== "pickup" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.secondary}
              />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <Field label="Street Address" field="address" required />
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Field label="City" field="city" required />
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Field label="State" field="state" required />
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Field
                  label="ZIP"
                  field="zip"
                  keyboardType="numeric"
                  required
                />
              </View>
            </View>
          </View>
        )}

        {/* ── Order Notes ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={COLORS.secondary}
            />
            <Text style={styles.sectionTitle}>
              Order Notes <Text style={styles.optional}>(optional)</Text>
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Special instructions, allergies, gift message..."
            placeholderTextColor={COLORS.textMuted}
            value={form.notes}
            onChangeText={(v) => set("notes", v)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── Order Summary ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="receipt-outline"
              size={18}
              color={COLORS.secondary}
            />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          {cartItems.map((item) => (
            <View key={item.cartKey} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.product_name}
                {item.variant ? ` · ${item.variant.variant_name}` : ""}
              </Text>
              <Text style={styles.orderItemQty}>×{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8.5%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {delivery === "pickup" ? "Pickup" : "Delivery"}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                effectiveFee === 0 && { color: COLORS.success },
              ]}
            >
              {effectiveFee === 0 ? "FREE" : `$${effectiveFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          {!freeShipping && delivery !== "pickup" && subtotal < 50 && (
            <Text style={styles.freeShipHint}>
              Add ${(50 - subtotal).toFixed(2)} more for free delivery!
            </Text>
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── Place Order Bar ── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.barTotal}>${total.toFixed(2)}</Text>
          <Text style={styles.barSub}>
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · incl.
            tax
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, submitting && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Text style={styles.placeBtnText}>Place Order</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...(Platform.OS === "web" && { height: "100vh", overflow: "hidden" }),
  },
  scroll: { flex: 1 },

  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginBottom: 0,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  optional: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "400",
    color: COLORS.textMuted,
  },

  row: { flexDirection: "row" },

  field: { marginBottom: SPACING.sm },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMedium,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  req: { color: COLORS.error },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  inputError: { borderColor: COLORS.error },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: SPACING.sm },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.error, marginTop: 2 },

  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  deliveryOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  deliveryLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.text,
  },
  deliveryLabelActive: { color: COLORS.primary },
  deliverySubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  deliveryPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.textLight,
  },
  deliveryPriceActive: { color: COLORS.primary },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: SPACING.sm,
  },
  orderItemName: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  orderItemQty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    minWidth: 28,
    textAlign: "center",
  },
  orderItemPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 55,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.primary,
  },
  freeShipHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: "600",
    textAlign: "center",
    marginTop: SPACING.sm,
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  barTotal: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.primary,
  },
  barSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minWidth: 150,
    justifyContent: "center",
  },
  placeBtnDisabled: { opacity: 0.6 },
  placeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default CheckoutScreen;
