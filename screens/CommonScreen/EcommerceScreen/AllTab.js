import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProductCard from "../../../components/ProductCard/ProductCard";
import FeaturedGymsSection from "../HomeScreen/FeaturedGymsSection";
import FreelancePTTrainersSection from "../HomeScreen/FreelancePTTrainersSection";
import TopRatingProductSection from "../HomeScreen/TopRatingProductSection";
import BestSellerProductSection from "../HomeScreen/BestSellerProductSection";
import productService from "../../../services/productService";

export default function AllTab({ refreshTrigger }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch products from API
      const response = await productService.searchProducts({ page: 1, size: 20 });
      
      if (response.data && response.data.items) {
        setProducts(response.data.items);
        setProductsPage(1);
        setTotalPages(response.data.totalPages);
        setHasMoreProducts(1 < response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMoreProducts || !hasMoreProducts) return;

    try {
      setLoadingMoreProducts(true);
      const nextPage = productsPage + 1;

      // Fetch more products from API
      const response = await productService.searchProducts({ page: nextPage, size: 20 });
      
      if (response.data && response.data.items) {
        setProducts((prev) => [...prev, ...response.data.items]);
        setProductsPage(nextPage);
        setHasMoreProducts(nextPage < response.data.totalPages);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMoreProducts(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Best Seller Product Section */}
      <BestSellerProductSection refreshTrigger={refreshTrigger} products={products} viewMore={false} />

      {/* Top Rating Product Section */}
      <TopRatingProductSection refreshTrigger={refreshTrigger} products={products} viewMore={false} />

      {/* Products FlatList */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderBar}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="cube" size={20} color="#ED2A46" />
              <Text style={styles.sectionHeaderTitle}>
                {t("ecommerce.products")}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {products.length}
                </Text>
              </View>
            </View>
          </View>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.flatListRow}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <ProductCard product={item} />
              </View>
            )}
            ListFooterComponent={() => {
              if (loadingMoreProducts) {
                return (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.red} />
                    <Text style={styles.loadingMoreText}>
                      {t("common.loading")}
                    </Text>
                  </View>
                );
              }
              if (hasMoreProducts) {
                return (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreProducts}
                  >
                    <Text style={styles.loadMoreText}>
                      {t("common.loadMore")}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.red} />
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  homeSection: {
    marginTop: 25,
    paddingHorizontal: 15,
    width: "100%",
  },
  homeTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  titleWithIcon: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  homeSectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ED2A46",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#ED2A46",
    marginTop: 4,
    borderRadius: 2,
  },
  swiperContainer: {
    paddingBottom: 25,
  },
  paginationDot: {
    backgroundColor: "#E0E0E0",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 20,
  },
  activePaginationDot: {
    backgroundColor: "#ED2A46",
    width: 21,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    top: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderBar: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
    marginBottom: 10,
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
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  flatListRow: {
    justifyContent: "space-between",
    marginBottom: 0,
  },
  productItem: {
    width: "48%",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  loadMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red,
  },
});
