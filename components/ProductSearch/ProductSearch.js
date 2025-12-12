import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";
import ProductCard from "../ProductCard/ProductCard";
import ProductCardSkeleton from "../ProductCard/ProductCardSkeleton";
import { getData, storeData, removeData } from "../../lib/storage/storageUtils";
import productService from "../../services/productService";

export default function ProductSearch({
  visible,
  onClose,
  initialSearchText = "",
  showBackButton = true,
}) {
  const [searchText, setSearchText] = useState(initialSearchText);
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  
  // Search results states
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productRecommendedResults, setProductRecommendedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalProductSearchResults, setTotalProductSearchResults] = useState(0);
  const [totalProductRecommended, setTotalProductRecommended] = useState(0);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [hasMoreProductData, setHasMoreProductData] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    rating: 0,
    sortOrder: "asc", // "asc" or "desc"
  });
  
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches when component becomes visible
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      // Focus input after a short delay to ensure the component is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      // If there's initial search text, perform search
      if (initialSearchText) {
        performSearch(initialSearchText);
      }
    } else {
      // Reset state when closing
      setSearchText("");
      setHasSearched(false);
      setProductSearchResults([]);
      setProductRecommendedResults([]);
    }
  }, [visible, initialSearchText]);

  const performSearch = async (query, page = 1, append = false) => {
    if (!query.trim()) {
      setHasSearched(false);
      setProductSearchResults([]);
      setProductRecommendedResults([]);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      }
      setHasSearched(true);

      // Save to recent searches
      await saveToRecentSearches(query);

      // Build search parameters with filters
      const searchParams = {
        searchTerm: query,
        page: page,
        size: 10,
      };

      // Add filter parameters
      if (filters.priceRange.min) {
        searchParams.fromPrice = parseFloat(filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        searchParams.toPrice = parseFloat(filters.priceRange.max);
      }
      if (filters.rating > 0) {
        searchParams.rating = filters.rating;
      }
      if (filters.sortOrder) {
        searchParams.sortOrder = filters.sortOrder;
      }

      console.log('Searching products with params:', searchParams);

      // Search products - API returns data directly, not wrapped in data property
      const productResponse = await productService.searchProducts(searchParams);

      console.log('Product search response:', JSON.stringify(productResponse, null, 2));

      // API response structure: { status, message, data: { items, total, totalPages, ... } }
      const productData = productResponse.data?.items || [];
      const productTotal = productResponse.data?.total || 0;
      const productTotalPages = productResponse.data?.totalPages || 1;

      if (append) {
        setProductSearchResults((prev) => [...prev, ...productData]);
      } else {
        setProductSearchResults(productData);
      }
      
      setTotalProductSearchResults(productTotal);
      setCurrentProductPage(page);
      setHasMoreProductData(page < productTotalPages);

      // Always get recommended products, but filter out duplicates from search results
      if (!append) {
        try {
          const recommendedResponse = await productService.searchProducts({
            page: 1,
            size: 10,
          });
          const recommendedData = recommendedResponse.data?.items || [];
          const recommendedTotal = recommendedResponse.data?.total || 0;
          
          // Filter out products that already appear in search results
          const searchResultIds = new Set(productData.map(item => item.id));
          const filteredRecommendedData = recommendedData.filter(
            item => !searchResultIds.has(item.id)
          );
          
          setProductRecommendedResults(filteredRecommendedData);
          setTotalProductRecommended(filteredRecommendedData.length);
        } catch (error) {
          console.error("Error fetching recommended products:", error);
          setProductRecommendedResults([]);
          setTotalProductRecommended(0);
        }
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProductSearchResults([]);
      setTotalProductSearchResults(0);
      setProductRecommendedResults([]);
      setTotalProductRecommended(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = () => {
    if (!loading && hasMoreProductData) {
      performSearch(searchText, currentProductPage + 1, true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    performSearch(searchText, 1, false).finally(() => {
      setRefreshing(false);
    });
  };

  const loadRecentSearches = async () => {
    try {
      const searches = await getData("recentProductSearches");
      setRecentSearches(searches || []);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      await performSearch(searchText);
    }
  };

  const saveToRecentSearches = async (keyword) => {
    try {
      const searches = await getData("recentProductSearches");
      const recentSearches = searches || [];
      const updatedSearches = [keyword, ...recentSearches.filter((s) => s !== keyword)].slice(0, 10);
      await storeData("recentProductSearches", updatedSearches);
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    setCurrentProductPage(1);
    setProductSearchResults([]);
    setProductRecommendedResults([]);
    if (searchText.trim()) {
      performSearch(searchText.trim(), 1, false);
    }
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: "", max: "" },
      rating: 0,
      sortOrder: "asc",
    });
    setShowFilterModal(false);
    setCurrentProductPage(1);
    setProductSearchResults([]);
    setProductRecommendedResults([]);
    if (searchText.trim()) {
      performSearch(searchText.trim(), 1, false);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setHasSearched(false);
    setProductSearchResults([]);
    setProductRecommendedResults([]);
    setTotalProductSearchResults(0);
    setTotalProductRecommended(0);
    setCurrentProductPage(1);
    setHasMoreProductData(false);
    setFilters({
      priceRange: { min: "", max: "" },
      rating: 0,
      sortOrder: "asc",
    });
    searchInputRef.current?.focus();
  };

  const handleRemoveRecentSearch = async (keyword) => {
    try {
      const updatedSearches = recentSearches.filter((s) => s !== keyword);
      await storeData("recentProductSearches", updatedSearches);
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const handleClearAllRecentSearches = async () => {
    try {
      await removeData("recentProductSearches");
      setRecentSearches([]);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  };

  const handleRecentSearchSelect = (keyword) => {
    setSearchText(keyword);
    performSearch(keyword);
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeArea}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          )}

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={t("search.searchProducts")}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.7}
            disabled={!searchText.trim()}
          >
            <Text
              style={[
                styles.searchButtonText,
                !searchText.trim() && styles.searchButtonTextDisabled,
              ]}
            >
              {t("common.search")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Button - Show when searched */}
        {hasSearched && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                (filters.priceRange.min ||
                  filters.priceRange.max ||
                  filters.rating > 0 ||
                  filters.sortOrder !== "asc") &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#ED2A46" />
              {(filters.priceRange.min ||
                filters.priceRange.max ||
                filters.rating > 0 ||
                filters.sortOrder !== "asc") && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {loading && !hasSearched ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View key={`skeleton-search-${index}`} style={styles.skeletonItem}>
                  <ProductCardSkeleton />
                </View>
              ))}
            </View>
          </View>
        ) : !hasSearched ? (
          <FlatList
            style={styles.content}
            data={[]}
            ListHeaderComponent={() => (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleContainer}>
                        <Ionicons name="time" size={20} color="#ED2A46" />
                        <Text style={styles.sectionTitle}>
                          {t("search.recentSearches")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={handleClearAllRecentSearches}
                      >
                        <Text style={styles.clearAllText}>
                          {t("search.clearAll")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentItem}
                        onPress={() => handleRecentSearchSelect(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.recentItemContent}>
                          <Ionicons name="search" size={18} color="#999" />
                          <Text style={styles.recentText}>{item}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveRecentSearch(item)}
                        >
                          <Ionicons name="close" size={18} color="#999" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
            keyExtractor={(item, index) => `empty-${index}`}
          />
        ) : (
          <FlatList
            style={styles.content}
            data={[]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#ED2A46"]}
              />
            }
            ListHeaderComponent={() => (
              <>
                {/* Loading Skeletons when searching */}
                {loading && hasSearched && productSearchResults.length === 0 && (
                  <View style={styles.resultsContainer}>
                    <View style={styles.sectionWrapper}>
                      <View style={styles.sectionHeaderBar}>
                        <View style={styles.sectionHeaderContent}>
                          <Ionicons name="search" size={20} color="#ED2A46" />
                          <Text style={styles.sectionHeaderTitle}>
                            {t("search.searchResults")}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.productsGrid}>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <View key={`skeleton-search-results-${index}`} style={styles.productCardContainer}>
                            <ProductCardSkeleton />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Search Results */}
                {!loading && productSearchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <View style={styles.sectionWrapper}>
                      <View style={styles.sectionHeaderBar}>
                        <View style={styles.sectionHeaderContent}>
                          <Ionicons name="search" size={20} color="#ED2A46" />
                          <Text style={styles.sectionHeaderTitle}>
                            {t("search.searchResults")}
                          </Text>
                          <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>
                              {totalProductSearchResults}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.productsGrid}>
                        {productSearchResults.map((item) => (
                          <View key={item.id} style={styles.productCardContainer}>
                            <ProductCard product={item} />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Loading More Skeletons */}
                {loading && hasSearched && productSearchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <View style={styles.sectionWrapper}>
                      <View style={styles.productsGrid}>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <View key={`skeleton-load-more-${index}`} style={styles.productCardContainer}>
                            <ProductCardSkeleton />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Recommended Products */}
                {!loading && productRecommendedResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <View style={styles.sectionWrapper}>
                      <View
                        style={[
                          styles.sectionHeaderBar,
                          styles.recommendedHeaderBar,
                        ]}
                      >
                        <View style={styles.sectionHeaderContent}>
                          <Ionicons name="star" size={20} color="#FF9500" />
                          <Text style={styles.sectionHeaderTitle}>
                            {t("search.recommendedProducts")}
                          </Text>
                          <View
                            style={[styles.countBadge, styles.recommendedBadge]}
                          >
                            <Text style={styles.countBadgeText}>
                              {totalProductRecommended}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.productsGrid}>
                        {productRecommendedResults.map((item) => (
                          <View
                            key={item.id}
                            style={styles.productCardContainer}
                          >
                            <ProductCard product={item} />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Load More Button */}
                {!loading && hasMoreProductData && (
                  <TouchableOpacity
                    style={styles.loadMoreContainer}
                    onPress={loadMoreData}
                    disabled={loading}
                  >
                    <Ionicons name="chevron-down" size={24} color="#ED2A46" />
                    <Text style={styles.loadMoreText}>
                      {t("common.loadMore")}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Empty State */}
                {!loading &&
                  productSearchResults.length === 0 &&
                  productRecommendedResults.length === 0 &&
                  hasSearched && (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search" size={80} color="#E0E0E0" />
                      <Text style={styles.emptyTitle}>
                        {t("search.noProductsFound")}
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        {t("search.tryDifferentKeywords")}
                      </Text>
                    </View>
                  )}
              </>
            )}
            keyExtractor={(item, index) => `results-${index}`}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("common.filter", "Filter")}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.filterContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t("common.priceRange", "Price Range")}
                </Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder={t("common.min", "Min")}
                    value={filters.priceRange.min}
                    onChangeText={(text) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: text },
                      })
                    }
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder={t("common.max", "Max")}
                    value={filters.priceRange.max}
                    onChangeText={(text) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: text },
                      })
                    }
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t("common.minRating", "Minimum Rating")}
                </Text>
                <View style={styles.ratingButtons}>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingButton,
                        filters.rating === rating && styles.activeRatingButton,
                      ]}
                      onPress={() => setFilters({ ...filters, rating })}
                    >
                      <Ionicons
                        name="star"
                        size={16}
                        color={filters.rating === rating ? "#fff" : "#FFD700"}
                      />
                      <Text
                        style={[
                          styles.ratingButtonText,
                          filters.rating === rating &&
                            styles.activeRatingButtonText,
                        ]}
                      >
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort Order Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t("common.sortBy", "Sort Order")}
                </Text>
                <View style={styles.sortOptions}>
                  {[
                    {
                      value: "asc",
                      label: t("common.priceAsc", "Price: Low to High"),
                    },
                    {
                      value: "desc",
                      label: t("common.priceDesc", "Price: High to Low"),
                    },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        filters.sortOrder === option.value &&
                          styles.activeSortOption,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, sortOrder: option.value })
                      }
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          filters.sortOrder === option.value &&
                            styles.activeSortOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {filters.sortOrder === option.value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#ED2A46"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>
                  {t("common.reset", "Reset")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>
                  {t("common.apply", "Apply")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    zIndex: 2000,
  },
  safeArea: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: {
    color: "#ED2A46",
    fontSize: 16,
    fontWeight: "600",
  },
  searchButtonTextDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "500",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  recentItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  recentText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  resultInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  resultText: {
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  resultsContainer: {
    paddingBottom: 0,
  },
  sectionWrapper: {},
  sectionHeaderBar: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
  },
  recommendedHeaderBar: {
    backgroundColor: "#FFF9F0",
    borderLeftColor: "#FF9500",
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#ED2A46",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  recommendedBadge: {
    backgroundColor: "#FF9500",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  productCardContainer: {
    marginBottom: 5,
    width: "48%",
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  skeletonContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  skeletonItem: {
    width: "48%",
    marginBottom: 5,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterButton: {
    padding: 12,
    position: "relative",
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  filterButtonActive: {
    backgroundColor: "#FFF5F6",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ED2A46",
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  rangeInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rangeSeparator: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  ratingButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeRatingButton: {
    backgroundColor: "#ED2A46",
    borderColor: "#ED2A46",
  },
  ratingButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeRatingButtonText: {
    color: "#fff",
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeSortOption: {
    backgroundColor: "#FFF5F6",
    borderColor: "#ED2A46",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeSortOptionText: {
    color: "#ED2A46",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ED2A46",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
