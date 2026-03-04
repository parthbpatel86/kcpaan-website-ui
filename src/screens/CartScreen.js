// src/screens/CartScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Header, { FloatingButtons } from "../components/Header";
import { EmptyState } from "../components/shared/index";

// Cross-platform alert helper
const showAlert = (title, message, buttons) => {
  if (Platform.OS === "web") {
    // On web, Alert.alert is unreliable — use native browser dialogs
    const confirmBtn = buttons?.find(
      (b) => b.style !== "cancel" && b.style !== "destructive" && b.onPress,
    );
    const cancelBtn = buttons?.find((b) => b.style === "cancel");
    if (confirmBtn && cancelBtn) {
      if (window.confirm(`${title}\n\n${message}`)) {
        confirmBtn.onPress?.();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showAlert("Login Required", "Please sign in to proceed with checkout.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }
    navigation.navigate("Checkout");
  };

  const handleRemove = (cartKey, name) => {
    showAlert("Remove Item", `Remove "${name}" from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(cartKey),
      },
    ]);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Shopping Cart" showBack />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="bag-outline"
            title="Your Cart is Empty"
            message="Browse our products and add items to your cart."
          />
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("OnlineStore")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.items}>
              {cartItems.map((item) => (
                <View key={item.cartKey} style={styles.cartItem}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons
                        name="leaf-outline"
                        size={24}
                        color={COLORS.border}
                      />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product_name}
                    </Text>
                    {item.variant && (
                      <Text style={styles.itemVariant}>
                        {item.variant.variant_name}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>
                      ${parseFloat(item.price).toFixed(2)}
                    </Text>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          updateQuantity(item.cartKey, item.quantity - 1)
                        }
                      >
                        <Ionicons name="remove" size={16} color={COLORS.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          updateQuantity(item.cartKey, item.quantity + 1)
                        }
                      >
                        <Ionicons name="add" size={16} color={COLORS.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleRemove(item.cartKey, item.product_name)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Est. Tax (8.5%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  {subtotal >= 50 ? "FREE" : "Calculated at checkout"}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              {subtotal < 50 && (
                <Text style={styles.freeShippingHint}>
                  Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                </Text>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom Checkout */}
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.checkoutTotal}>${total.toFixed(2)}</Text>
              <Text style={styles.checkoutTotalSub}>Total (incl. tax)</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  shopBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },
  shopBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
  items: { padding: SPACING.md, gap: SPACING.sm },
  cartItem: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemImage: { width: 90, height: 90 },
  itemImagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1, padding: SPACING.sm },
  itemName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 20,
    textAlign: "center",
  },
  itemRight: {
    padding: SPACING.sm,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.primary,
  },
  summary: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  summaryLabel: { fontSize: FONT_SIZES.md, color: COLORS.textLight },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
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
  freeShippingHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: "600",
    textAlign: "center",
    marginTop: SPACING.sm,
    backgroundColor: COLORS.success + "15",
    borderRadius: 4,
    padding: SPACING.sm,
  },
  checkoutBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutTotal: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.primary,
  },
  checkoutTotalSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

export default CartScreen;
