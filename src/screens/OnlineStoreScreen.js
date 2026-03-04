// src/screens/OnlineStoreScreen.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import ProductCard from "../components/ProductCard";
import {
  LoadingSpinner,
  SectionHeader,
  EmptyState,
} from "../components/shared/index";

const OnlineStoreScreen = ({ navigation, route }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    loadInitialData();
  }, []);

  // Re-apply category filter whenever navigation params change (e.g. from sidebar)
  useEffect(() => {
    if (!route.params?.categorySlug) {
      setSelectedCategory(null);
      setFilteredProducts(products.filter((p) => p.is_available_online));
      return;
    }
    const cat = categories.find(
      (c) => c.category_slug === route.params.categorySlug,
    );
    if (cat) handleCategorySelect(cat);
  }, [route.params?.categorySlug, categories]);

  const loadInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.allSettled([
        apiService.getAllCategories(),
        apiService.getAllProducts(),
      ]);
      const cats =
        catRes.status === "fulfilled" ? catRes.value?.data || [] : [];
      const prods =
        prodRes.status === "fulfilled" ? prodRes.value?.data || [] : [];
      setCategories(cats);
      setProducts(prods);
      setFilteredProducts(prods.filter((p) => p.is_available_online));
    } catch (e) {
      console.error("Store error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSearchQuery("");
    try {
      const res = await apiService.getProductsByCategory(category.category_id);
      const prods = (res?.data || []).filter((p) => p.is_available_online);
      setFilteredProducts(applySort(prods, sortBy));
    } catch (e) {
      console.error("Category filter error:", e);
    }
  };

  // Debounce ref — keeps the pending timer across renders without causing re-renders
  const searchDebounceRef = useRef(null);

  const handleSearch = useCallback(
    (query) => {
      // ✅ FIX: Update the input value synchronously so the TextInput stays controlled
      // and does NOT lose focus. The async API call is debounced separately below.
      setSearchQuery(query);

      // Clear empty query immediately — no debounce needed
      if (!query.trim()) {
        setSearching(false);
        setFilteredProducts(
          selectedCategory
            ? products.filter(
                (p) =>
                  p.category_id === selectedCategory.category_id &&
                  p.is_available_online,
              )
            : products.filter((p) => p.is_available_online),
        );
        return;
      }

      // Debounce the async API call: only fire 400ms after the user stops typing.
      // This prevents re-renders mid-keystroke that would cause focus loss on web.
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      setSearching(true);
      searchDebounceRef.current = setTimeout(async () => {
        try {
          const res = await apiService.searchProducts(query);
          setFilteredProducts(
            (res?.data || []).filter((p) => p.is_available_online),
          );
        } catch {
          const lower = query.toLowerCase();
          setFilteredProducts(
            products.filter(
              (p) =>
                p.is_available_online &&
                (p.product_name?.toLowerCase().includes(lower) ||
                  p.short_description?.toLowerCase().includes(lower)),
            ),
          );
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    [products, selectedCategory],
  );

  const clearCategory = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setFilteredProducts(products.filter((p) => p.is_available_online));
  };

  const applySort = (prods, sort) => {
    switch (sort) {
      case "price_asc":
        return [...prods].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...prods].sort((a, b) => b.price - a.price);
      case "name":
        return [...prods].sort((a, b) =>
          a.product_name?.localeCompare(b.product_name),
        );
      default:
        return prods;
    }
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setFilteredProducts(applySort(filteredProducts, sort));
  };

  if (loading) return <LoadingSpinner message="Loading Store..." />;

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Online Store" showBack />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {(searchQuery || searching) && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <TouchableOpacity
            style={[styles.catChip, !selectedCategory && styles.catChipActive]}
            onPress={clearCategory}
          >
            <Text
              style={[
                styles.catChipText,
                !selectedCategory && styles.catChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories
            .filter((c) => !c.parent_category_id)
            .map((cat) => (
              <TouchableOpacity
                key={cat.category_id}
                style={[
                  styles.catChip,
                  selectedCategory?.category_id === cat.category_id &&
                    styles.catChipActive,
                ]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    selectedCategory?.category_id === cat.category_id &&
                      styles.catChipTextActive,
                  ]}
                >
                  {cat.category_name}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* Sort & Result count */}
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
          {selectedCategory ? ` in ${selectedCategory.category_name}` : ""}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "default", label: "Default" },
            { key: "price_asc", label: "Price ↑" },
            { key: "price_desc", label: "Price ↓" },
            { key: "name", label: "A–Z" },
          ].map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortBtn, sortBy === s.key && styles.sortBtnActive]}
              onPress={() => handleSortChange(s.key)}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === s.key && styles.sortTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="bag-outline"
          title="No Products Found"
          message={
            searchQuery
              ? `No results for "${searchQuery}"`
              : "No products in this category."
          }
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(p) =>
                navigation.navigate("ProductDetail", { product: p })
              }
            />
          )}
          keyExtractor={(item) => item.product_id?.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  catContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  catScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  catChipTextActive: { color: COLORS.white },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  sortBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 4,
    backgroundColor: COLORS.backgroundDark,
  },
  sortBtnActive: { backgroundColor: COLORS.secondary },
  sortText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  sortTextActive: { color: COLORS.white },
  grid: { paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm },
});

export default OnlineStoreScreen;
