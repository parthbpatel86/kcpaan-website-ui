// src/screens/admin/AdminProducts.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ADMIN_COLORS,
  ADMIN_FONTS,
  ADMIN_SPACING,
} from "../../utils/adminConstants";
import adminApiService from "../../api/adminApiService";
import {
  StatusBadge,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminToggle,
  AdminLoading,
  AdminEmpty,
  AdminSectionHeader,
  confirmAction,
  adminStyles,
} from "../../components/admin/AdminShared";

const BLANK_PRODUCT = {
  product_name: "",
  short_description: "",
  full_description: "",
  price: "",
  compare_at_price: "",
  sku: "",
  inventory_quantity: "",
  weight: "",
  category_id: "",
  is_featured: false,
  is_available_online: true,
  is_available_instore: true,
  is_active: true,
  display_order: 0,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        adminApiService.getProducts(),
        adminApiService.getCategories(),
      ]);
      setProducts(
        prodRes.status === "fulfilled"
          ? prodRes.value?.data?.products || prodRes.value?.data || []
          : [],
      );
      setCategories(
        catRes.status === "fulfilled" ? catRes.value?.data || [] : [],
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditProduct({ ...BLANK_PRODUCT });
    setVariants([]);
    setEditModalOpen(true);
  };

  const openEdit = async (product) => {
    setEditProduct({ ...product });
    setEditModalOpen(true);
    const vRes = await adminApiService
      .getProductVariants(product.product_id)
      .catch(() => null);
    setVariants(vRes?.data || []);
  };

  const handleSave = async () => {
    if (!editProduct.product_name?.trim() || !editProduct.price) {
      Alert.alert("Required", "Product name and price are required.");
      return;
    }
    setSaving(true);
    try {
      let productId = editProduct.product_id;

      if (productId) {
        // ── Update existing product ──────────────────────────────────
        await adminApiService.updateProduct(productId, editProduct);
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === productId ? { ...p, ...editProduct } : p,
          ),
        );
      } else {
        // ── Create new product ───────────────────────────────────────
        const res = await adminApiService.createProduct(editProduct);
        productId = res?.data?.product_id;
        setProducts((prev) => [...prev, res?.data]);
      }

      // ── Save variants ────────────────────────────────────────────
      // Only process if we have a product_id (new or existing)
      if (productId && variants.length > 0) {
        // Separate new variants (no variant_id) from existing ones (have variant_id)
        const newVariants = variants.filter(
          (v) => !v.variant_id && v.variant_name?.trim(),
        );
        const existingVariants = variants.filter(
          (v) => v.variant_id && v.variant_name?.trim(),
        );

        // Create all new variants
        await Promise.allSettled(
          newVariants.map((v) =>
            adminApiService.createVariant(productId, {
              variant_name: v.variant_name.trim(),
              variant_type: v.variant_type || "flavor",
              price_adjustment: parseFloat(v.price_adjustment) || 0,
              inventory_quantity: parseInt(v.inventory_quantity) || 0,
            }),
          ),
        );

        // Update any existing variants that may have been edited
        await Promise.allSettled(
          existingVariants.map((v) =>
            adminApiService.updateVariant(productId, v.variant_id, {
              variant_name: v.variant_name.trim(),
              variant_type: v.variant_type || "flavor",
              price_adjustment: parseFloat(v.price_adjustment) || 0,
              inventory_quantity: parseInt(v.inventory_quantity) || 0,
            }),
          ),
        );

        // Delete variants that were removed from the list
        if (editProduct.product_id) {
          // Only for existing products — compare loaded variants vs current list
          const currentIds = variants
            .filter((v) => v.variant_id)
            .map((v) => v.variant_id);
          const loadedIds =
            (
              await adminApiService
                .getProductVariants(productId)
                .catch(() => ({ data: [] }))
            ).data?.map((v) => v.variant_id) || [];
          const removedIds = loadedIds.filter((id) => !currentIds.includes(id));
          await Promise.allSettled(
            removedIds.map((id) =>
              adminApiService.deleteVariant(productId, id),
            ),
          );
        }
      }

      setEditModalOpen(false);
      Alert.alert("Saved", "Product saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    confirmAction(
      "Delete Product",
      `Delete "${product.product_name}"? This cannot be undone.`,
      async () => {
        try {
          await adminApiService.deleteProduct(product.product_id);
          setProducts((prev) =>
            prev.filter((p) => p.product_id !== product.product_id),
          );
        } catch {
          Alert.alert("Error", "Failed to delete product.");
        }
      },
    );
  };

  const handleToggleActive = async (product) => {
    try {
      await adminApiService.toggleProductActive(
        product.product_id,
        !product.is_active,
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === product.product_id
            ? { ...p, is_active: !p.is_active }
            : p,
        ),
      );
    } catch {
      Alert.alert("Error", "Failed to toggle product status.");
    }
  };

  const handleInventoryUpdate = async (product) => {
    Alert.prompt(
      "Update Inventory",
      `Current: ${product.inventory_quantity}\nEnter new quantity:`,
      async (qty) => {
        if (qty !== null && !isNaN(qty)) {
          try {
            await adminApiService.updateProductInventory(
              product.product_id,
              parseInt(qty),
            );
            setProducts((prev) =>
              prev.map((p) =>
                p.product_id === product.product_id
                  ? { ...p, inventory_quantity: parseInt(qty) }
                  : p,
              ),
            );
          } catch {
            Alert.alert("Error", "Failed to update inventory.");
          }
        }
      },
      "plain-text",
      product.inventory_quantity?.toString(),
    );
  };

  const catOptions = categories.map((c) => ({
    value: c.category_id,
    label: c.category_name,
  }));

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !filterCat || p.category_id?.toString() === filterCat.toString();
    return matchSearch && matchCat;
  });

  if (loading) return <AdminLoading message="Loading Products..." />;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subTitle}>{filtered.length} items</Text>
        </View>
        <AdminButton
          label="Add Product"
          icon="add-outline"
          onPress={openCreate}
        />
      </View>

      {/* Search & Filter */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={15}
            color={ADMIN_COLORS.textDim}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, SKU..."
            placeholderTextColor={ADMIN_COLORS.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.catFilter, !filterCat && styles.catFilterActive]}
            onPress={() => setFilterCat("")}
          >
            <Text
              style={[
                styles.catFilterText,
                !filterCat && styles.catFilterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.category_id}
              style={[
                styles.catFilter,
                filterCat === c.category_id?.toString() &&
                  styles.catFilterActive,
              ]}
              onPress={() => setFilterCat(c.category_id?.toString())}
            >
              <Text
                style={[
                  styles.catFilterText,
                  filterCat === c.category_id?.toString() &&
                    styles.catFilterTextActive,
                ]}
              >
                {c.category_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.product_id?.toString()}
        ListEmptyComponent={
          <AdminEmpty icon="cube-outline" message="No products found" />
        }
        renderItem={({ item: product }) => (
          <View style={styles.productCard}>
            {product.image_url || product.primary_image ? (
              <Image
                source={{ uri: product.image_url || product.primary_image }}
                style={styles.productImg}
              />
            ) : (
              <View style={[styles.productImg, styles.productImgPlaceholder]}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={ADMIN_COLORS.textDim}
                />
              </View>
            )}
            <View style={styles.productInfo}>
              <View style={styles.productInfoTop}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.product_name}
                </Text>
                <StatusBadge
                  status={product.is_active ? "active" : "inactive"}
                />
              </View>
              <Text style={styles.productSku}>
                {product.sku ? `SKU: ${product.sku}` : "No SKU"}
              </Text>
              <View style={styles.productMeta}>
                <Text style={styles.productPrice}>
                  ${parseFloat(product.price || 0).toFixed(2)}
                </Text>
                <View
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor:
                        (product.inventory_quantity || 0) > 5
                          ? ADMIN_COLORS.success + "22"
                          : ADMIN_COLORS.error + "22",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stockText,
                      {
                        color:
                          (product.inventory_quantity || 0) > 5
                            ? ADMIN_COLORS.success
                            : ADMIN_COLORS.error,
                      },
                    ]}
                  >
                    {product.inventory_quantity || 0} in stock
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openEdit(product)}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={ADMIN_COLORS.info}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleToggleActive(product)}
              >
                <Ionicons
                  name={product.is_active ? "eye-outline" : "eye-off-outline"}
                  size={16}
                  color={
                    product.is_active
                      ? ADMIN_COLORS.success
                      : ADMIN_COLORS.textDim
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleInventoryUpdate(product)}
              >
                <Ionicons
                  name="layers-outline"
                  size={16}
                  color={ADMIN_COLORS.warning}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(product)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={ADMIN_COLORS.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Edit/Create Modal */}
      <Modal
        visible={editModalOpen}
        animationType="slide"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editProduct?.product_id ? "Edit Product" : "Add Product"}
            </Text>
            <TouchableOpacity onPress={() => setEditModalOpen(false)}>
              <Ionicons name="close" size={22} color={ADMIN_COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <AdminInput
              label="Product Name"
              value={editProduct?.product_name}
              onChangeText={(v) =>
                setEditProduct((p) => ({ ...p, product_name: v }))
              }
              required
            />
            <AdminInput
              label="Short Description"
              value={editProduct?.short_description}
              onChangeText={(v) =>
                setEditProduct((p) => ({ ...p, short_description: v }))
              }
              multiline
            />
            <AdminInput
              label="Full Description"
              value={editProduct?.full_description}
              onChangeText={(v) =>
                setEditProduct((p) => ({ ...p, full_description: v }))
              }
              multiline
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="Price ($)"
                  value={editProduct?.price?.toString()}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, price: v }))
                  }
                  type="number"
                  required
                />
              </View>
              <View style={{ width: ADMIN_SPACING.md }} />
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="Compare Price ($)"
                  value={editProduct?.compare_at_price?.toString()}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, compare_at_price: v }))
                  }
                  type="number"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="SKU"
                  value={editProduct?.sku}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, sku: v }))
                  }
                />
              </View>
              <View style={{ width: ADMIN_SPACING.md }} />
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="Inventory Qty"
                  value={editProduct?.inventory_quantity?.toString()}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, inventory_quantity: v }))
                  }
                  type="number"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="Weight (g)"
                  value={editProduct?.weight?.toString()}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, weight: v }))
                  }
                  type="number"
                />
              </View>
              <View style={{ width: ADMIN_SPACING.md }} />
              <View style={{ flex: 1 }}>
                <AdminInput
                  label="Display Order"
                  value={editProduct?.display_order?.toString()}
                  onChangeText={(v) =>
                    setEditProduct((p) => ({ ...p, display_order: v }))
                  }
                  type="number"
                />
              </View>
            </View>
            <AdminSelect
              label="Category"
              value={editProduct?.category_id}
              options={catOptions}
              onSelect={(v) =>
                setEditProduct((p) => ({ ...p, category_id: v }))
              }
            />
            <AdminInput
              label="Image URL"
              value={editProduct?.image_url}
              onChangeText={(v) =>
                setEditProduct((p) => ({ ...p, image_url: v }))
              }
              placeholder="https://..."
            />
            <AdminToggle
              label="Active"
              value={!!editProduct?.is_active}
              onToggle={(v) => setEditProduct((p) => ({ ...p, is_active: v }))}
            />
            <AdminToggle
              label="Featured"
              value={!!editProduct?.is_featured}
              onToggle={(v) =>
                setEditProduct((p) => ({ ...p, is_featured: v }))
              }
            />
            <AdminToggle
              label="Available Online"
              value={!!editProduct?.is_available_online}
              onToggle={(v) =>
                setEditProduct((p) => ({ ...p, is_available_online: v }))
              }
            />
            <AdminToggle
              label="Available In-Store"
              value={!!editProduct?.is_available_instore}
              onToggle={(v) =>
                setEditProduct((p) => ({ ...p, is_available_instore: v }))
              }
            />

            {/* Variants section (only for existing products) */}
            {editProduct?.product_id && (
              <View style={styles.variantsSection}>
                <AdminSectionHeader
                  title="Variants / Flavors"
                  action={() => {
                    const newVariant = {
                      variant_name: "",
                      variant_type: "flavor",
                      price_adjustment: 0,
                      inventory_quantity: 0,
                    };
                    setVariants((prev) => [...prev, newVariant]);
                  }}
                  actionLabel="Add Variant"
                  actionIcon="add-outline"
                />
                {variants.map((v, i) => (
                  <View key={i} style={styles.variantRow}>
                    <TextInput
                      style={[adminStyles.input, { flex: 1 }]}
                      value={v.variant_name}
                      onChangeText={(val) =>
                        setVariants((prev) =>
                          prev.map((vv, idx) =>
                            idx === i ? { ...vv, variant_name: val } : vv,
                          ),
                        )
                      }
                      placeholder="Flavor name..."
                      placeholderTextColor={ADMIN_COLORS.textDim}
                    />
                    <TextInput
                      style={[
                        adminStyles.input,
                        { width: 70, marginLeft: ADMIN_SPACING.sm },
                      ]}
                      value={v.price_adjustment?.toString()}
                      onChangeText={(val) =>
                        setVariants((prev) =>
                          prev.map((vv, idx) =>
                            idx === i ? { ...vv, price_adjustment: val } : vv,
                          ),
                        )
                      }
                      placeholder="+$0"
                      placeholderTextColor={ADMIN_COLORS.textDim}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                      style={{ marginLeft: ADMIN_SPACING.sm }}
                      onPress={() =>
                        setVariants((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={ADMIN_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                gap: ADMIN_SPACING.md,
                marginTop: ADMIN_SPACING.md,
                paddingBottom: 80,
              }}
            >
              <AdminButton
                label="Cancel"
                onPress={() => setEditModalOpen(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <AdminButton
                label="Save Product"
                onPress={handleSave}
                loading={saving}
                icon="checkmark-outline"
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ADMIN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  title: {
    fontSize: ADMIN_FONTS.xl,
    fontWeight: "800",
    color: ADMIN_COLORS.text,
  },
  subTitle: {
    fontSize: ADMIN_FONTS.sm,
    color: ADMIN_COLORS.textMuted,
    marginTop: 2,
  },
  toolbar: {
    padding: ADMIN_SPACING.md,
    gap: ADMIN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: ADMIN_SPACING.sm,
    backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 8,
    paddingHorizontal: ADMIN_SPACING.md,
    paddingVertical: ADMIN_SPACING.sm,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  searchInput: { flex: 1, color: ADMIN_COLORS.text, fontSize: ADMIN_FONTS.md },
  catFilter: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: ADMIN_COLORS.bgCard,
    marginRight: 6,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  catFilterActive: {
    backgroundColor: ADMIN_COLORS.primary,
    borderColor: ADMIN_COLORS.primary,
  },
  catFilterText: {
    fontSize: ADMIN_FONTS.xs,
    color: ADMIN_COLORS.textMuted,
    fontWeight: "600",
  },
  catFilterTextActive: { color: ADMIN_COLORS.white },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: ADMIN_SPACING.sm,
    padding: ADMIN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  productImg: { width: 56, height: 56, borderRadius: 8 },
  productImgPlaceholder: {
    backgroundColor: ADMIN_COLORS.bgCard,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: { flex: 1 },
  productInfoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  productName: {
    flex: 1,
    fontSize: ADMIN_FONTS.md,
    fontWeight: "700",
    color: ADMIN_COLORS.text,
  },
  productSku: {
    fontSize: ADMIN_FONTS.xs,
    color: ADMIN_COLORS.textDim,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: ADMIN_SPACING.sm,
  },
  productPrice: {
    fontSize: ADMIN_FONTS.md,
    fontWeight: "700",
    color: ADMIN_COLORS.success,
  },
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  stockText: { fontSize: ADMIN_FONTS.xs, fontWeight: "700" },
  productActions: { flexDirection: "row", gap: 4 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ADMIN_COLORS.bgCard,
  },
  modal: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ADMIN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
    backgroundColor: ADMIN_COLORS.bgCard,
    paddingTop: ADMIN_SPACING.lg + 40,
  },
  modalTitle: {
    fontSize: ADMIN_FONTS.xl,
    fontWeight: "800",
    color: ADMIN_COLORS.text,
  },
  modalBody: { flex: 1, padding: ADMIN_SPACING.lg },
  row: { flexDirection: "row" },
  variantsSection: {
    marginTop: ADMIN_SPACING.lg,
    padding: ADMIN_SPACING.md,
    backgroundColor: ADMIN_COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ADMIN_SPACING.sm,
  },
});

export default AdminProducts;
