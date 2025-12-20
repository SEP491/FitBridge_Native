import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import transactionService from "../../../services/transactionService";
import paymentService from "../../../services/paymentService";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatPrice } from "../../../lib";
import LoadingIndicator from "../../../components/LoadingIndicator";

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(
        (order) => order.orderStatus === selectedStatus
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        // Search in order ID
        if (order.orderId?.toLowerCase().includes(query)) {
          return true;
        }
        // Search in item names
        if (
          order.items?.some((item) =>
            item.itemName?.toLowerCase().includes(query)
          )
        ) {
          return true;
        }
        // Search in order code from transactions
        if (
          order.transactions?.some((tx) =>
            tx.orderCode?.toString().includes(query)
          )
        ) {
          return true;
        }
        return false;
      });
    }

    return filtered;
  }, [orders, selectedStatus, searchQuery]);

  const loadOrders = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page,
        size: 10,
      };

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await transactionService.getTransactions(params);
      console.log("Orders Response:", response.data);

      if (response.data && response.data.items) {
        if (append) {
          setOrders((prev) => [...prev, ...response.data.items]);
        } else {
          setOrders(response.data.items);
        }
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalOrders(response.data.total);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadOrders(1, false);
  }, [selectedStatus]);

  const loadMoreOrders = useCallback(() => {
    if (!loadingMore && currentPage < totalPages) {
      loadOrders(currentPage + 1, true);
    }
  }, [loadingMore, currentPage, totalPages]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(1, false);
    setRefreshing(false);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "Finished":
        return {
          color: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          icon: "checkmark-circle",
          text: t("orderHistory.finished") || "Hoàn thành",
        };
      case "Cancelled":
        return {
          color: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          icon: "close-circle",
          text: t("orderHistory.cancelled") || "Đã hủy",
        };
      case "Created":
      default:
        return {
          color: "#17a2b8",
          backgroundColor: "rgba(23, 162, 184, 0.1)",
          icon: "document-text",
          text: t("orderHistory.created") || "Đã tạo",
        };
    }
  };

  // Get transaction status info
  const getTransactionStatusInfo = (status) => {
    switch (status) {
      case "Success":
        return {
          color: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          text: t("orderHistory.success") || "Thành công",
        };
      case "Failed":
        return {
          color: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          text: t("orderHistory.failed") || "Thất bại",
        };
      case "Pending":
      default:
        return {
          color: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          text: t("orderHistory.pending") || "Đang chờ",
        };
    }
  };

  const renderOrderCard = ({ item: order, index }) => {
    const statusInfo = getStatusInfo(order.orderStatus);
    // Get the main payment transaction (first successful or first transaction)
    const mainTransaction =
      order.transactions?.find((tx) => tx.status === "Success") ||
      order.transactions?.[0];

    return (
      <View style={[styles.orderCard, index === 0 && styles.firstCard]}>
        {/* Header with order ID and status */}
        <View
          style={[
            styles.orderHeader,
            { backgroundColor: statusInfo.backgroundColor },
          ]}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderIdLabel}>
              {t("orderHistory.orderId") || "Mã đơn hàng"}
            </Text>
            <Text style={styles.orderId} numberOfLines={1}>
              {order.orderId || "-"}
            </Text>
            <Text style={styles.orderDate}>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusInfo.color,
                  shadowColor: statusInfo.color,
                },
              ]}
            >
              <Ionicons name={statusInfo.icon} size={14} color="#fff" />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItemsContainer}>
          {order.items?.map((item, itemIndex) => (
            <View key={item.orderItemId || itemIndex} style={styles.orderItem}>
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/60",
                }}
                style={styles.itemImage}
                defaultSource={require("../../../assets/images/gymroom.jpg")}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.itemName || t("orderHistory.unknownItem") || "Sản phẩm"}
                </Text>
                <Text style={styles.itemQuantity}>
                  {t("orderHistory.quantity") || "Số lượng"}:{" "}
                  {item.quantity || 1}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          {order.discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {t("orderHistory.subtotal") || "Tạm tính"}
              </Text>
              <Text style={styles.priceValue}>
                {formatPrice(order.subTotalPrice || 0)}
              </Text>
            </View>
          )}
          {order.discountAmount > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.discountRow}>
                <Text style={styles.priceLabel}>
                  {t("orderHistory.discount") || "Giảm giá"}
                </Text>
                {order.coupon && (
                  <View style={styles.couponBadge}>
                    <Ionicons name="pricetag" size={12} color="#fff" />
                    <Text style={styles.couponText}>
                      {order.coupon.couponCode}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.priceValue, styles.discountValue]}>
                -{formatPrice(order.discountAmount || 0)}
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>
              {t("orderHistory.total") || "Tổng cộng"}
            </Text>
            <Text style={styles.totalValue}>
              {formatPrice(order.totalAmount || 0)}
            </Text>
          </View>
        </View>

        {/* Transaction Status */}
        {mainTransaction && (
          <View style={styles.transactionInfo}>
            <View style={styles.transactionStatusRow}>
              <Ionicons
                name="card-outline"
                size={16}
                color={getTransactionStatusInfo(mainTransaction.status).color}
              />
              <Text style={styles.transactionMethod}>
                {mainTransaction.paymentMethodName || "PayOS"}
              </Text>
              <View
                style={[
                  styles.transactionStatusBadge,
                  {
                    backgroundColor: getTransactionStatusInfo(
                      mainTransaction.status
                    ).backgroundColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.transactionStatusText,
                    {
                      color: getTransactionStatusInfo(mainTransaction.status)
                        .color,
                    },
                  ]}
                >
                  {getTransactionStatusInfo(mainTransaction.status).text}
                </Text>
              </View>
            </View>
            {mainTransaction.orderCode && (
              <Text style={styles.orderCode}>
                {t("orderHistory.orderCode") || "Mã giao dịch"}:{" "}
                {mainTransaction.orderCode}
              </Text>
            )}
          </View>
        )}

        {/* Repay Button for Created Orders */}
        {order.orderStatus === "Created" && (
          <View style={styles.repayButtonContainer}>
            <TouchableOpacity
              style={styles.repayButton}
              onPress={async () => {
                try {
                  Alert.alert(
                    t("orderHistory.confirmRepay") || "Xác nhận thanh toán lại",
                    t("orderHistory.confirmRepayMessage") ||
                      "Bạn có chắc chắn muốn thanh toán lại đơn hàng này?",
                    [
                      {
                        text: t("orderHistory.cancel") || "Hủy",
                        style: "cancel",
                      },
                      {
                        text: t("orderHistory.confirm") || "Xác nhận",
                        onPress: async () => {
                          try {
                            const response = await paymentService.repaidOrder({
                              orderId: order.orderId,
                            });

                            if (response?.data) {
                              // Open payment link
                              const supported = await Linking.canOpenURL(
                                response.data
                              );
                              if (supported) {
                                await Linking.openURL(response.data);
                              } else {
                                Alert.alert(
                                  t("orderHistory.error") || "Lỗi",
                                  t("orderHistory.cannotOpenLink") ||
                                    "Không thể mở liên kết thanh toán"
                                );
                              }
                            } else {
                              Alert.alert(
                                t("orderHistory.success") || "Thành công",
                                t("orderHistory.repaySuccess") ||
                                  "Yêu cầu thanh toán lại đã được gửi thành công"
                              );
                              // Refresh orders
                              loadOrders(1, false);
                            }
                          } catch (error) {
                            console.error("Error repaying order:", error);
                            Alert.alert(
                              t("orderHistory.error") || "Lỗi",
                              error?.response?.data?.message ||
                                t("orderHistory.repayError") ||
                                "Có lỗi xảy ra khi thanh toán lại. Vui lòng thử lại."
                            );
                          }
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error("Error:", error);
                }
              }}
            >
              <Ionicons name="card" size={18} color="#fff" />
              <Text style={styles.repayButtonText}>
                {t("orderHistory.repayOrder") || "Thanh toán lại"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedStatus && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("")}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedStatus && styles.filterChipTextActive,
            ]}
          >
            {t("orderHistory.all") || "Tất cả"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Created" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Created")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Created" && styles.filterChipTextActive,
            ]}
          >
            {t("orderHistory.created") || "Đã tạo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Pending" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Pending")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Pending" && styles.filterChipTextActive,
            ]}
          >
            {t("orderHistory.pending") || "Đang chờ"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Finished" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Finished")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Finished" && styles.filterChipTextActive,
            ]}
          >
            {t("orderHistory.finished") || "Hoàn thành"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Cancelled" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Cancelled")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Cancelled" && styles.filterChipTextActive,
            ]}
          >
            {t("orderHistory.cancelled") || "Đã hủy"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery
          ? t("orderHistory.noOrdersFound") || "Không tìm thấy đơn hàng"
          : t("orderHistory.noOrders") || "Chưa có đơn hàng nào"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? t("orderHistory.tryDifferentKeywords") ||
            "Thử tìm kiếm với từ khóa khác"
          : t("orderHistory.ordersWillAppear") ||
            "Các đơn hàng của bạn sẽ xuất hiện ở đây"}
      </Text>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <LoadingIndicator
        variant="page"
        color="#FF914D"
        message={t("orderHistory.loadingOrders") || "Đang tải đơn hàng..."}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryIcon}>
            <Ionicons name="receipt" size={24} color="#fff" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>
              {t("orderHistory.totalOrders") || "Tổng đơn hàng"}
            </Text>
            <Text style={styles.summaryCount}>{totalOrders}</Text>
            <Text style={styles.summarySubText}>
              {t("orderHistory.page") || "Trang"} {currentPage} / {totalPages}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadOrders(1, false)}
        >
          <Ionicons name="refresh" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              t("orderHistory.searchPlaceholder") || "Tìm kiếm đơn hàng..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter */}
      {renderStatusFilter()}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.orderId}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          loadingMore ? (
            <LoadingIndicator
              variant="inline"
              color="#FF914D"
              message={t("orderHistory.loadingMore") || "Đang tải thêm..."}
            />
          ) : (
            <View style={styles.bottomSpacing} />
          )
        }
        onEndReached={loadMoreOrders}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF914D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryInfo: {},
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  summarySubText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  clearButton: {
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingRight: 16,
    columnGap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FF914D",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  firstCard: {
    marginTop: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  orderItemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "400",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF914D",
  },
  priceBreakdown: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF914D",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  couponText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  discountValue: {
    color: "#dc3545",
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF914D",
  },
  transactionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  transactionStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  transactionMethod: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  transactionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  orderCode: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
    marginTop: 4,
  },
  repayButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  repayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF914D",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#FF914D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  repayButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748b",
  },
  bottomSpacing: {
    height: 20,
  },
});
