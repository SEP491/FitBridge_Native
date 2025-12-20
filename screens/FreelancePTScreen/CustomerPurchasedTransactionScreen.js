import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import customerPurchasedService from "../../services/customerPurchased";
import { useTranslation } from "../../hooks/useTranslation";
import { t } from "../../i18n";
import { fetchUserFromStorage } from "../../lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { TransactionItemSkeletonList } from "../../components/TransactionItem/TransactionItemSkeleton";

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${hours}:${minutes} • ${day}/${month}/${year}`;
};

const formatCurrency = (value) => {
  if (typeof value !== "number") return "-";
  return new Intl.NumberFormat("vi-VN").format(value);
};
const getStatusColor = (status) => {
  const statusUpper = status?.toUpperCase();
  switch (statusUpper) {
    case "COMPLETED":
    case "SUCCESS":
      return "#4CAF50";
    case "PENDING":
      return "#FF9800";
    case "FAILED":
    case "CANCELLED":
      return "#F44336";
    case "RESOLVED":
      return "#4CAF50";
    case "REJECTED":
      return "#F44336";
    case "ADMINAPPROVED":
      return "#4CAF50";
    case "ADMINREJECTED":
      return "#F44336";
    default:
      return "#666";
  }
};
const getStatusText = (status) => {
  const statusUpper = status?.toUpperCase();
  switch (statusUpper) {
    case "COMPLETED":
    case "SUCCESS":
      return t("transaction.completed", "Completed");
    case "PENDING":
      return t("transaction.pending", "Pending");
    case "FAILED":
      return t("transaction.failed", "Failed");
    case "CANCELLED":
      return t("transaction.cancelled", "Cancelled");
    case "RESOLVED":
      return t("transaction.resolved", "Resolved");
    case "REJECTED":
      return t("transaction.rejected", "Rejected");
    case "ADMINAPPROVED":
      return t("transaction.adminApproved", "Admin Approved");
    case "ADMINREJECTED":
      return t("transaction.adminRejected", "Admin Rejected");
    default:
      return status;
  }
};

const TransactionItem = ({ item, t, userRole }) => {
  const statusColor = getStatusColor(item.status);
  const statusText = getStatusText(item.status);


  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>
            {item.description ||
              t("customerPurchasedTransaction.transaction", "Transaction")}
          </Text>
          <Text style={styles.transactionId}>
            {item.transactionId || item.orderId || "-"}
          </Text>
          <Text style={styles.courseName}>
            {t("customerPurchasedTransaction.orderCode")}:{" "}
            {item.orderCode ?? "-"}
          </Text>
          <Text style={styles.courseName}>
            {t("customerPurchasedTransaction.method")}:{" "}
            {item.paymentMethod ?? "-"}
          </Text>
        </View>

        {/* Status & Date on the top-right */}
        <View style={styles.statusContainer}>
          <Text
            style={[styles.statusText, { color: statusColor }]}
            numberOfLines={1}
          >
            {statusText}
          </Text>
          <Text style={styles.statusDate}>
            {formatDateTime(item.transactionDate)}
          </Text>
        </View>
      </View>

      {/* Amount badges row */}
      <View style={[
        styles.amountBadgesRow,
        userRole !== "FreelancePT" && styles.amountBadgesRowFullWidth
      ]}>
        <View style={[
          styles.amountBadge, 
          styles.totalBadge,
          userRole !== "FreelancePT" && styles.fullWidthBadge
        ]}>
          <Text style={styles.amountBadgeLabel}>
            {t("customerPurchasedTransaction.total")}
          </Text>
          <Text style={styles.amountBadgeValue}>
            {formatCurrency(item.totalAmount)}₫
          </Text>
        </View>
        {userRole === "FreelancePT" && (
          <View style={[styles.amountBadge, styles.profitBadge]}>
            <Text style={styles.amountBadgeLabel}>
              {t("customerPurchasedTransaction.merchantProfit")}
            </Text>
            <Text style={styles.amountBadgeValue}>
              {formatCurrency(item.merchantProfit)}₫
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const CustomerPurchasedTransactionScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { customerPurchasedId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchUserFromStorage();
      setUserRole(user?.role);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerPurchasedId) {
        setError(t("customerPurchasedTransaction.missingPackageId"));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res =
          await customerPurchasedService.getCustomerPurchasedPackageTransaction(
            customerPurchasedId
          );
        if (res?.status === "200") {
          setData(res.data);
        } else {
          setError(
            res?.message || t("customerPurchasedTransaction.failedToLoad")
          );
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
        setError(t("customerPurchasedTransaction.failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerPurchasedId]);

  const headerInfo = useMemo(() => {
    if (!data) return null;
    const { customerName, packageName, availableSessions, expirationDate } =
      data;
    return {
      customerName: customerName || "-",
      packageName: packageName || "-",
      availableSessions: availableSessions ?? "-",
      expirationDate: expirationDate ? formatDateTime(expirationDate) : "-",
    };
  }, [data]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.skeletonContainer}>
          <TransactionItemSkeletonList
            count={4}
            showProfitBadge={userRole === "FreelancePT"}
          />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={32} color="#F57C00" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !data ? (
        <View style={styles.centerContent}>
          <Text style={styles.hintText}>
            {t("customerPurchasedTransaction.noData")}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={data.transactions || []}
            keyExtractor={(item) => item.transactionId}
            renderItem={({ item }) => <TransactionItem item={item} t={t} userRole={userRole} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Text style={styles.hintText}>
                  {t("customerPurchasedTransaction.noTransactions")}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#f1f3f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  hintText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#F57C00",
    textAlign: "center",
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  summarySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#777",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },
  statusBadgeAlt: {
    backgroundColor: "rgba(245, 124, 0, 0.12)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  statusDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#666",
  },
  metaText: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
  },
  amountRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 13,
    color: "#555",
  },
  amountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  // New styles to match BalanceDetailScreen transaction cards
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
  amountBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  amountBadgesRowFullWidth: {
    justifyContent: "flex-start",
  },
  amountBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  totalBadge: {
    borderWidth: 1,

    borderColor: "rgba(237, 42, 70, 0.4)",
    backgroundColor: "rgba(237, 42, 70, 0.06)",
  },
  profitBadge: {
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
    backgroundColor: "rgba(76, 175, 80, 0.06)",
  },
  amountBadgeLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  amountBadgeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  fullWidthBadge: {
    flex: 1,
    width: "100%",
  },
});

export default CustomerPurchasedTransactionScreen;
