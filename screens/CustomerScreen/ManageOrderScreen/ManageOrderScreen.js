import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import orderService from "../../../services/orderService";
import OrderManagementCard from "../../../components/OrderManagementCard";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import { useTranslation } from "../../../hooks/useTranslation";

const ManageOrderScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { initialStatus = "All", filterFeedback = false, orders: passedOrders = [] } = route.params || {};
  const [orders, setOrders] = useState(passedOrders);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status filters for the swiper
  const statusFilters = [
    {
      id: "all",
      label: "All",
      icon: "apps-outline",
      color: "#9E9E9E",
      status: "All",
    },
    {
      id: "confirm",
      label: "Confirm",
      icon: "document-text-outline",
      color: "#757575",
      status: "Created",
    },
    {
      id: "pending",
      label: "Pending",
      icon: "time-outline",
      color: "#FF9800",
      status: "Pending",
    },
    {
      id: "processing",
      label: "Processing",
      icon: "construct-outline",
      color: "#2196F3",
      status: "Processing",
    },
    {
      id: "shipping",
      label: "Shipping",
      icon: "car-outline",
      color: "#00BCD4",
      status: "Shipping",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: "star-outline",
      color: "#FF9800",
      status: "Finished",
      filterFeedback: true,
    },
  ];

  useEffect(() => {
    // Only fetch if no orders were passed from UserMenu
    if (passedOrders.length === 0) {
      fetchOrders();
    }
  }, []);

  useEffect(() => {
    filterOrdersByStatus();
  }, [selectedStatus, orders]);

  const fetchOrders = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await orderService.getProductOrder({sortOrder:"dsc"});

      if (response.status === "200" && response.data) {
        const fetchedOrders = response.data.items || [];
        setOrders(fetchedOrders);
        setTotalPages(response.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrdersByStatus = () => {
    if (selectedStatus === "All") {
      setFilteredOrders(orders);
    } else {
      let filtered = orders.filter(
        (order) => order.currentStatus === selectedStatus
      );

      // Special case for Feedback filter - show finished orders with items that need feedback
      if (
        selectedStatus === "Finished" &&
        (statusFilters.find((f) => f.status === selectedStatus)?.filterFeedback ||
          filterFeedback)
      ) {
        filtered = filtered.filter((order) =>
          order.orderItems.some((item) => !item.isFeedback)
        );
      }

      setFilteredOrders(filtered);
    }
  };

  const handleRefresh = () => {
    fetchOrders(1, true);
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
        size={32}
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
          { backgroundColor: selectedStatus === item.status ? "#fff" : item.color },
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            { color: selectedStatus === item.status ? item.color : "#fff" },
          ]}
        >
          {item.status === "All"
            ? orders.length
            : item.filterFeedback
            ? orders.filter(
                (order) =>
                  order.currentStatus === item.status &&
                  order.orderItems.some((i) => !i.isFeedback)
              ).length
            : orders.filter((order) => order.currentStatus === item.status)
                .length}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>{t("orders.noOrdersFound") || "No Orders Found"}</Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === "All"
          ? t("orders.noOrdersMessage") || "You haven't placed any orders yet"
          : `${t("orders.noStatusOrders").replace("{{status}}", selectedStatus.toLowerCase()) || `No ${selectedStatus.toLowerCase()} orders`}`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("orders.manageOrders") || "Manage Orders"}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Status Filter with PairSwiper */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>{t("orders.filterByStatus") || "Filter by Status"}</Text>
        <PairedSwiper
          data={statusFilters}
          renderItem={renderStatusButton}
          itemsPerSlide={4}
          height={120}
          showsPagination={true}
          containerStyle={styles.swiperContainer}
        />
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>{t("orders.loadingOrders") || "Loading orders..."}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderManagementCard order={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
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
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  swiperContainer: {
    height: 120,
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
  },
  statusButtonText: {
    fontSize: 12,
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
});

export default ManageOrderScreen;
