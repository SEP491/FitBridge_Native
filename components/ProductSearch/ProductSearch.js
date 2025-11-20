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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";
import ProductCard from "../ProductCard/ProductCard";
import { getItem, setItem, removeItem } from "../../lib/storage/storageUtils";
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

      console.log('Searching products with params:', { searchTerm: query, page, size: 10 });

      // Search products - API returns data directly, not wrapped in data property
      const productResponse = await productService.searchProducts({
        searchTerm: query,
        page: page,
        size: 10,
      });

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

      // Get recommended products if no search results
      if (productTotal === 0 && !append) {
        try {
          const recommendedResponse = await productService.searchProducts({
            page: 1,
            size: 10,
          });
          const recommendedData = recommendedResponse.data?.items || [];
          const recommendedTotal = recommendedResponse.data?.total || 0;
          
          setProductRecommendedResults(recommendedData);
          setTotalProductRecommended(recommendedTotal);
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
      const searches = await getItem("recentProductSearches");
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
      const searches = await getItem("recentProductSearches");
      const recentSearches = searches || [];
      const updatedSearches = [keyword, ...recentSearches.filter((s) => s !== keyword)].slice(0, 10);
      await setItem("recentProductSearches", updatedSearches);
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error saving recent search:", error);
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
    searchInputRef.current?.focus();
  };

  const handleRemoveRecentSearch = async (keyword) => {
    try {
      const updatedSearches = recentSearches.filter((s) => s !== keyword);
      await setItem("recentProductSearches", updatedSearches);
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const handleClearAllRecentSearches = async () => {
    try {
      await removeItem("recentProductSearches");
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

        {/* Content */}
        {loading && !hasSearched ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED2A46" />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
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
                {/* Result Info */}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultText}>
                    {totalProductSearchResults > 0
                      ? `${totalProductSearchResults} ${t("search.productsFound")}`
                      : t("search.noProductsFound")}
                  </Text>
                </View>

                {/* Search Results */}
                {productSearchResults.length > 0 && (
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

                {/* Recommended Products */}
                {productSearchResults.length === 0 &&
                  productRecommendedResults.length > 0 && (
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
                {hasMoreProductData && (
                  <TouchableOpacity
                    style={styles.loadMoreContainer}
                    onPress={loadMoreData}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ED2A46" />
                    ) : (
                      <Ionicons name="chevron-down" size={24} color="#ED2A46" />
                    )}
                    <Text style={styles.loadMoreText}>
                      {loading ? t("common.loading") : t("common.loadMore")}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Empty State */}
                {productSearchResults.length === 0 &&
                  productRecommendedResults.length === 0 && (
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
    paddingBottom: 20,
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
    marginBottom: 15,
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
});
