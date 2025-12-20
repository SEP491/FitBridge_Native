import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import orderService from "../../../services/orderService";
import { fetchUserFromStorage } from "../../../lib";
import OrderManagementCard from "../../../components/OrderManagementCard";
import { useTranslation } from "../../../hooks/useTranslation";
import { ProductCardSkeletonList } from "../../../components/ProductCard/ProductCardSkeleton";
import LoadingIndicator from "../../../components/LoadingIndicator";

const ManageOrderScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    initialStatus = "All",
    filterFeedback = false,
    orders: passedOrders = [],
  } = route.params || {};
  const [orders, setOrders] = useState(passedOrders);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderSummary, setOrderSummary] = useState(null);
  const [initialStatusSet, setInitialStatusSet] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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
  // Status filters for the swiper
  const statusFilters = [
    {
      id: "all",
      label: t("orders.all"),
      icon: "apps-outline",
      color: "#8E44AD",
      status: "All",
    },
    {
      id: "confirm",
      label: t("orders.confirm"),
      icon: "document-text-outline",
      color: "#3498DB",
      status: "Created",
    },
    {
      id: "pending",
      label: t("orders.pending"),
      icon: "time-outline",
      color: "#F39C12",
      status: "Pending",
    },
    {
      id: "processing",
      label: t("orders.processing"),
      icon: "construct-outline",
      color: "#1ABC9C",
      status: "Processing",
    },

    {
      id: "assigning",
      label: t("orders.assigning"),
      icon: "people-outline",
      color: "#9B59B6",
      status: "Assigning",
    },
    {
      id: "accepted",
      label: t("orders.accepted"),
      icon: "checkmark-done-outline",
      color: "#27AE60",
      status: "Accepted",
    },
    {
      id: "shipping",
      label: t("orders.shipping"),
      icon: "bicycle-outline",
      color: "#E74C3C",
      status: "Shipping",
    },
    {
      id: "arrived",
      label: t("orders.arrived"),
      icon: "location-outline",
      color: "#2980B9",
      status: "Arrived",
    },
    {
      id: "feedback",
      label: t("orders.feedback"),
      icon: "star-outline",
      color: "#E67E22",
      status: "Feedback",
      filterFeedback: true,
    },
    {
      id: "finished",
      label: t("orders.finished"),
      icon: "checkmark-circle-outline",
      color: "#27AE60",
      status: "Finished",
    },
    {
      id: "cancelled",
      label: t("orders.cancelled"),
      icon: "close-circle-outline",
      color: "#E74C3C",
      status: "Cancelled",
    },
    {
      id: "returned",
      label: t("orders.returned"),
      icon: "arrow-undo-outline",
      color: "#C0392B",
      status: "Returned",
    },
  ];
  useEffect(() => {
    if (!user?.id) return;

    if (selectedStatus === "Feedback") {
      filterOrdersByStatus();
      fetchOrdersSummary();
    } else if (selectedStatus === "All") {
      fetchOrders(1, true);
      fetchOrdersSummary();
    } else if (selectedStatus) {
      fetchOrdersByStatus(selectedStatus, 1, false);
      fetchOrdersSummary();
    } else {
      fetchOrders(1, true);
      fetchOrdersSummary();
    }
  }, [selectedStatus, user]);

  useEffect(() => {
    if (!user?.id) return;
    setPage(1); // Reset page when status changes
    if (selectedStatus === "Feedback") {
      // Special case: Feedback uses local filtering
      filterOrdersByStatus();
    } else {
      // All other statuses: fetch from API
      fetchOrdersByStatus(selectedStatus, 1, false);
    }
  }, [selectedStatus, user]);

  const fetchOrders = async (
    pageNum = 1,
    isRefresh = false,
    isLoadMore = false
  ) => {
    if (!user?.id) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await orderService.getProductOrder({
        sortOrder: "dsc",
        pageNumber: pageNum,
        customerId: user?.id,
      });
      const newItems = response.data.productOrders.items || [];

      if (isLoadMore) {
        // Append new items to existing list
        setOrders((prevOrders) => [...prevOrders, ...newItems]);
        setFilteredOrders((prevFiltered) => [...prevFiltered, ...newItems]);
      } else {
        // Replace list with new items
        setOrders(newItems);
        setFilteredOrders(newItems);
      }

      setTotalPages(response.data.productOrders.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const fetchOrdersSummary = async () => {
    if (!user?.id) return;
    try {
      const response = await orderService.getProductOrder({
        doApplyPaging: false,
        customerId: user?.id,
      });
      setOrderSummary(response.data || null);
    } catch (error) {
      console.error("Error fetching order summary:", error);
    }
  };

  const fetchOrdersByStatus = async (
    status,
    pageNum = 1,
    isLoadMore = false
  ) => {
    if (!user?.id) return;
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      let apiStatus = status;

      // Map combined statuses to API parameters
      if (status === "All") {
        apiStatus = null; // Fetch all orders
      } else if (status === "Arrived") {
        // For Arrived, fetch Arrived + CustomerNotReceived
        const [arrivedRes, notReceivedRes] = await Promise.all([
          orderService.getProductOrder({
            status: "Arrived",
            sortOrder: "dsc",
            pageNumber: pageNum,
            customerId: user?.id,
          }),
          orderService.getProductOrder({
            status: "CustomerNotReceived",
            sortOrder: "dsc",
            pageNumber: pageNum,
            customerId: user?.id,
          }),
        ]);
        const combined = [
          ...(arrivedRes.data.productOrders.items || []),
          ...(notReceivedRes.data.productOrders.items || []),
        ];

        if (isLoadMore) {
          setFilteredOrders((prev) => [...prev, ...combined]);
          setOrders((prev) => [...prev, ...combined]);
        } else {
          setFilteredOrders(combined);
          setOrders(combined);
        }

        // Use max of both total pages
        const maxPages = Math.max(
          arrivedRes.data.productOrders.totalPages || 1,
          notReceivedRes.data.productOrders.totalPages || 1
        );
        setTotalPages(maxPages);
        setPage(pageNum);
        return;
      } else if (status === "Returned") {
        // For Returned, fetch Returned + InReturn
        const [returnedRes, inReturnRes] = await Promise.all([
          orderService.getProductOrder({
            status: "Returned",
            sortOrder: "dsc",
            pageNumber: pageNum,
            customerId: user?.id,
          }),
          orderService.getProductOrder({
            status: "InReturn",
            sortOrder: "dsc",
            pageNumber: pageNum,
            customerId: user?.id,
          }),
        ]);
        const combined = [
          ...(returnedRes.data.productOrders.items || []),
          ...(inReturnRes.data.productOrders.items || []),
        ];

        if (isLoadMore) {
          setFilteredOrders((prev) => [...prev, ...combined]);
          setOrders((prev) => [...prev, ...combined]);
        } else {
          setFilteredOrders(combined);
          setOrders(combined);
        }

        // Use max of both total pages
        const maxPages = Math.max(
          returnedRes.data.productOrders.totalPages || 1,
          inReturnRes.data.productOrders.totalPages || 1
        );
        setTotalPages(maxPages);
        setPage(pageNum);
        return;
      }

      // For other statuses, fetch directly
      const params = apiStatus
        ? {
            status: apiStatus,
            sortOrder: "dsc",
            pageNumber: pageNum,
            customerId: user?.id,
          }
        : { sortOrder: "dsc", pageNumber: pageNum, customerId: user?.id };
      const response = await orderService.getProductOrder(params);
      const newItems = response.data.productOrders.items || [];

      if (isLoadMore) {
        setFilteredOrders((prev) => [...prev, ...newItems]);
        setOrders((prev) => [...prev, ...newItems]);
      } else {
        setFilteredOrders(newItems);
        setOrders(newItems);
      }

      setTotalPages(response.data.productOrders.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterOrdersByStatus = () => {
    // This function is now only used for the Feedback special case
    if (selectedStatus === "Feedback") {
      let filtered =
        orderSummary?.productOrders?.items?.filter(
          (order) => order.currentStatus === "Finished"
        ) || [];
      filtered = filtered.filter((order) =>
        order.orderItems.some((item) => !item.isFeedback)
      );
      setFilteredOrders(filtered);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    if (selectedStatus === "Feedback") {
      filterOrdersByStatus();
      fetchOrdersSummary();
    } else if (selectedStatus === "All") {
      fetchOrders(1, true);
      fetchOrdersSummary();
    } else {
      fetchOrdersByStatus(selectedStatus, 1, false);
      fetchOrdersSummary();
    }
  };

  const handleLoadMore = () => {
    // Don't load more for Feedback (uses local filtering)
    if (selectedStatus === "Feedback") return;

    if (!loadingMore && !loading && page < totalPages) {
      if (selectedStatus === "All") {
        fetchOrders(page + 1, false, true);
      } else {
        fetchOrdersByStatus(selectedStatus, page + 1, true);
      }
    }
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  const renderStatusButton = (item) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        selectedStatus === item.status && {
          backgroundColor: item.color,
          borderColor: item.color,
        },
      ]}
      onPress={() => handleStatusSelect(item.status)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={25}
        color={selectedStatus === item.status ? "#fff" : item.color}
      />
      <Text
        style={[
          styles.statusButtonText,
          selectedStatus === item.status && { color: "#fff" },
        ]}
      >
        {item.label}
      </Text>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              selectedStatus === item.status ? "#fff" : item.color,
          },
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            { color: selectedStatus === item.status ? item.color : "#fff" },
          ]}
        >
          {item.status === "All"
            ? orderSummary?.summaryProductOrder?.totalProductOrders || 0
            : item.status === "Arrived"
            ? (orderSummary?.summaryProductOrder?.totalArrived ?? 0) +
              (orderSummary?.summaryProductOrder?.totalCustomerNotReceived ?? 0)
            : item.status === "Processing"
            ? orderSummary?.summaryProductOrder?.totalProcessing || 0
            : item.status === "Returned"
            ? (orderSummary?.summaryProductOrder?.totalReturned ?? 0) +
              (orderSummary?.summaryProductOrder?.totalInReturn ?? 0)
            : item.status === "Created"
            ? orderSummary?.summaryProductOrder?.totalCreated || 0
            : item.status === "Pending"
            ? orderSummary?.summaryProductOrder?.totalPending || 0
            : item.status === "Assigning"
            ? orderSummary?.summaryProductOrder?.totalAssigning || 0
            : item.status === "Accepted"
            ? orderSummary?.summaryProductOrder?.totalAccepted || 0
            : item.status === "Shipping"
            ? orderSummary?.summaryProductOrder?.totalShipping || 0
            : item.status === "Finished"
            ? orderSummary?.summaryProductOrder?.totalFinished || 0
            : item.status === "Cancelled"
            ? orderSummary?.summaryProductOrder?.totalCancelled || 0
            : item.filterFeedback
            ? orderSummary?.productOrders?.items?.filter(
                (order) =>
                  order.currentStatus === "Finished" &&
                  order.orderItems.some((i) => !i.isFeedback)
              ).length || 0
            : orders.filter((order) => order.currentStatus === item.status)
                .length}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>
        {t("orders.noOrdersFound") || "No Orders Found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === "All"
          ? t("orders.noOrdersMessage") || "You haven't placed any orders yet"
          : `${t("orders.noStatusOrders", {
              status: selectedStatus.toLowerCase(),
            })}`}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <LoadingIndicator
        variant="inline"
        message={t("orders.loadingMore") || "Loading more..."}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Status Filter with PairSwiper */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>
          {t("orders.filterByStatus") || "Filter by Status"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScrollContent}
        >
          {statusFilters.map((item) => (
            <View key={item.id}>{renderStatusButton(item)}</View>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.listContent}>
          <ProductCardSkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <OrderManagementCard order={item} onRefresh={handleRefresh} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#ED2A46"]}
              tintColor="#ED2A46"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  placeholder: {
    width: 40,
  },
  filterSection: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginTop: -64,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statusScrollContent: {
    paddingHorizontal: 8,
    gap: 10,
  },
  statusButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
    minHeight: 100,
    width: 90,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    color: "#666",
  },
});

export default ManageOrderScreen;
