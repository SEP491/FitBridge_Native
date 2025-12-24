import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import orderService from "../../../services/orderService";
import OrderManagementCard from "../../../components/OrderManagementCard/OrderManagementCard";
import { ProductCardSkeletonList } from "../../../components/ProductCard/ProductCardSkeleton";
import { fetchUserFromStorage } from "../../../lib";
import LoadingIndicator from "../../../components/LoadingIndicator";

export default function ProductReviewsTab() {
  const { t } = useTranslation();

  const [productReviews, setProductReviews] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allFilteredOrders, setAllFilteredOrders] = useState([]);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserFromStorage();
      console.log("Fetched user data:", userData);
      if (userData) {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  const fetchProductReviews = async (
    pageNum = 1,
    isLoadMore = false,
    userId = null
  ) => {
    if (!userId) return;
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setProductLoading(true);

      const summaryResponse = await orderService.getProductOrder({
        doApplyPaging: false,
        sortOrder: "dsc",
        customerId: userId,
        status: "Finished",
      });

      const allOrders = summaryResponse.data?.productOrders?.items || [];

      let filtered = allOrders.filter(
        (order) => order.currentStatus === "Finished"
      );
      filtered = filtered.filter((order) =>
        order.orderItems.some((item) => !item.isFeedback)
      );

      // Store all filtered orders for pagination
      if (!isLoadMore) {
        setAllFilteredOrders(filtered);
      }

      const pageSize = 10;
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedOrders = filtered.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filtered.length / pageSize);

      if (isLoadMore) {
        // Append new items, filtering out duplicates by ID
        setProductReviews((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = paginatedOrders.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prev, ...newItems];
        });
      } else {
        setProductReviews(paginatedOrders);
      }
      setProductPage(pageNum);
      setProductTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    } finally {
      setLoading(false);
      setProductLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchProductReviews(1, false, user.id);
  }, [user]);

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchProductReviews(1, false, user.id);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!user?.id) return;
    if (
      !loadingMore &&
      !loading &&
      productPage < productTotalPages &&
      !productLoading
    ) {
      fetchProductReviews(productPage + 1, true, user.id);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>
        {t("product.noReviewsYet") || "No Product Reviews Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {t("product.reviewProductsMessage") ||
          "Your product reviews will appear here"}
      </Text>
    </View>
  );

  const handleProductRefresh = () => {
    if (!user?.id) return;
    fetchProductReviews(1, false, user.id);
  };

  if (loading && productReviews.length === 0) {
    return (
      <View style={styles.listContainer}>
        <ProductCardSkeletonList count={4} />
      </View>
    );
  }

  return (
    <FlatList
      data={productReviews}
      renderItem={({ item, index }) => (
        <OrderManagementCard
          order={item}
          onRefresh={handleProductRefresh}
          key={`product-review-${item.id || index}`}
        />
      )}
      keyExtractor={(item, index) => `product-review-${item.id || index}`}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ED2A46"]}
          tintColor="#ED2A46"
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => {
        if (loadingMore) {
          return (
            <View style={styles.loadMoreContainer}>
              <LoadingIndicator variant="inline" />
            </View>
          );
        }
        return null;
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    flexGrow: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
