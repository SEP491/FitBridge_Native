import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "../../../components/ProductCard/ProductCard";
import productService from "../../../services/productService";
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";

export default function TopRatingProductsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchTopRatedProducts();
  }, []);

  const fetchTopRatedProducts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await productService.searchProducts({ 
        page: pageNum, 
        size: 20 
      });

      if (response.data && response.data.items) {
        // Filter and sort by rating (highest first)
        const topRated = response.data.items
          .filter(product => product.rating >= 0)
          .sort((a, b) => b.rating - a.rating);

        if (pageNum === 1) {
          setTopRatedProducts(topRated);
        } else {
          setTopRatedProducts((prev) => [...prev, ...topRated]);
        }

        setPage(pageNum);
        setTotalPages(response.data.totalPages);
        setHasMore(pageNum < response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching top rated products:", error);
      if (page === 1) {
        setTopRatedProducts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    fetchTopRatedProducts(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTopRatedProducts(page + 1);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} />
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={colors.red} />
          <Text style={styles.loadingMoreText}>{t("common.loading")}</Text>
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
          <Text style={styles.loadMoreText}>{t("common.loadMore")}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.red} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {t("ecommerce.noProductsFound") || "No top rated products found"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={topRatedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.red]}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  placeholder: {
    width: 40,
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
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  productItem: {
    width: "48%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
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

