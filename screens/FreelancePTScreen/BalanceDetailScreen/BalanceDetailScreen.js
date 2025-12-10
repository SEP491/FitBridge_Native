import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import dashBoardService from "../../../services/dashBoardService";
import { formatPrice } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import BalanceDetailScreenSkeleton from "./BalanceDetailScreenSkeleton";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BalanceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { initialTab } = route.params || { initialTab: "available" };

  const [activeTab, setActiveTab] = useState(initialTab);
  const [availableData, setAvailableData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableTotal, setAvailableTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [availableTotalProfitSum, setAvailableTotalProfitSum] = useState(0);
  const [pendingTotalProfitSum, setPendingTotalProfitSum] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "available") {
        const response = await dashBoardService.getAvailableBalanceDetail();
        if (response && response.data) {
          setAvailableData(response.data.items || []);
          setAvailableTotal(response.data.total || 0);
          setAvailableTotalProfitSum(response.data.totalProfitSum || 0);
        }
      } else {
        const response = await dashBoardService.getPendingBalanceDetail();
        if (response && response.data) {
          setPendingData(response.data.items || []);
          setPendingTotal(response.data.total || 0);
          setPendingTotalProfitSum(response.data.totalProfitSum || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching balance details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const openImageModal = (imageUri) => {
    setSelectedImageUri(imageUri);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImageUri(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateHeader = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    const daysOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    return `${day}/${month}/${year} - ${dayOfWeek}`;
  };

  const getTransactionDate = (item) => {
    return item.actualDistributionDate || item.createdAt || item.transactionDate || item.withdrawDate;
  };

  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    let runningBalance = currentTotal;

    // Sort transactions by date (newest first)
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(getTransactionDate(a));
      const dateB = new Date(getTransactionDate(b));
      return dateB - dateA; // Descending order (newest first)
    });

    sorted.forEach((item) => {
      const dateKey = getTransactionDate(item);
      if (!dateKey) return;

      const date = new Date(dateKey);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      // Calculate running balance going backward in time
      // The balance shown is AFTER the transaction
      const amount = item.totalProfit || 0;
      const isWithdraw = item.transactionType === "Withdraw";
      
      // Store the balance after this transaction
      grouped[dateStr].push({
        ...item,
        runningBalance,
      });

      // Calculate balance before this transaction (for next older transaction)
      if (isWithdraw) {
        // Withdrawal reduces balance, so before = after + amount
        runningBalance = runningBalance + amount;
      } else {
        // Deposit increases balance, so before = after - amount
        runningBalance = runningBalance - amount;
      }
    });

    return grouped;
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case "Withdraw":
        return "arrow-down-circle-outline";
      case "DistributeProfit":
        return "arrow-up-circle-outline";
      case "Order":
        return "receipt-outline";
      default:
        return "cash-outline";
    }
  };

  const getTransactionTypeIconColor = (type) => {
    switch (type) {
      case "Withdraw":
        return "#ED2A46";
      case "DistributeProfit":
        return "#4CAF50";
      case "Order":
        return "#FF914D";
      default:
        return "#666";
    }
  };
  
  const getTransactionTypeColor = (type) => {
    switch (type){
      case "Withdraw":
        return "#ED2A46";
      case "DistributeProfit":
        return "#4CAF50";
      case "Order":
        return "#FF914D";
      default:
        return "#666";
    }
  };

  const getTransactionTypeBackgroundColor = (type) => {
    switch (type){
      case "Withdraw":
        return "rgba(237, 42, 70, 0.1)"; // #ED2A46 with 10% opacity
      case "DistributeProfit":
        return "rgba(76, 175, 80, 0.1)"; // #4CAF50 with 10% opacity
      case "Order":
        return "rgba(255, 145, 77, 0.1)"; // #FF914D with 10% opacity
      default:
        return "rgba(102, 102, 102, 0.1)"; // #666 with 10% opacity
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "Withdraw":
        return t("transactionType.withdraw", "Rút tiền");
      case "DistributeProfit":
        return t("transactionType.distributeProfit", "Phân bổ lợi nhuận");
      default:
        return type;
    }
  };

  const renderTransactionItem = (item, index) => {
    const icon = getTransactionTypeIcon(item.transactionType);
    const color = getTransactionTypeColor(item.transactionType);
    const text = getTransactionTypeText(item.transactionType);
    const iconColor = getTransactionTypeIconColor(item.transactionType);
    const backgroundColor = getTransactionTypeBackgroundColor(item.transactionType);
    const isWithdraw = item.transactionType === "Withdraw";
    const amount = item.totalProfit || 0;

    return (
      <View key={item.transactionId || index} style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <View style={[styles.iconContainer, { backgroundColor }]}>
              <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{text || "N/A"}</Text>
            <Text style={styles.transactionId}>
              {item.transactionId?.substring(0, 100).toUpperCase() || "N/A"}
            </Text>
            {item.description && (
              <Text style={styles.courseName}>{item.description}</Text>
            )}

          </View> 
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color }]}>
              {isWithdraw ? " " : "+"} {formatPrice(amount)}
            </Text>
            {item.balance !== undefined && (
              <Text style={styles.balanceText}>
                SD: {formatPrice(item.balance)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDateSection = (dateKey, transactions) => {
    // Convert dateKey (YYYY-MM-DD) to date string for formatting
    const dateHeader = formatDateHeader(dateKey);

    return (
      <View key={dateKey} style={styles.dateSection}>
        <Text style={styles.dateHeader}>{dateHeader}</Text>
        {transactions.map((item, index) => renderTransactionItem(item, `${dateKey}-${index}`))}
      </View>
    );
  };

  const currentData = activeTab === "available" ? availableData : pendingData;
  const currentTotal = activeTab === "available" ? availableTotal : pendingTotal;
  const groupedTransactions = groupTransactionsByDate(currentData);
  const dateKeys = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <View style={styles.container}>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "available" && styles.activeTab]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.activeTabText,
            ]}
          >
            Khả dụng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Chờ xử lý
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <BalanceDetailScreenSkeleton />
      ) : (
        <>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {activeTab === "available" ? "Tổng số dư khả dụng" : "Tổng số dư chờ xử lý"}
            </Text>
            <Text style={styles.summaryAmount}>
              {formatPrice(activeTab === "available" ? availableTotalProfitSum : pendingTotalProfitSum)}
            </Text>
            <Text style={styles.summaryCount}>
              {currentData.length} giao dịch
            </Text>
          </View>

          {/* Transaction List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {currentData.length > 0 ? (
              dateKeys.map((dateKey) => renderDateSection(dateKey, groupedTransactions[dateKey]))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không có giao dịch nào</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeImageModal}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              {selectedImageUri && (
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ED2A46",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ED2A46",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
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
  },
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 9,
    color: "#999",
    marginTop: 2,
    fontWeight: "300",
  },
  courseName: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },
  withdrawalRequest: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  amountContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default BalanceDetailScreen;

