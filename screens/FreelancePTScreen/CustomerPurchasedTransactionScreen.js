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

const TransactionItem = ({ item }) => {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>{item.description || "Transaction"}</Text>
        <View style={[styles.statusBadge, item.status !== "Success" && styles.statusBadgeAlt]}>
          <Ionicons
            name={item.status === "Success" ? "checkmark-circle" : "alert-circle"}
            color={item.status === "Success" ? "#2E7D32" : "#F57C00"}
            size={16}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.status === "Success" ? "#2E7D32" : "#F57C00" },
            ]}
          >
            {item.status || "Unknown"}
          </Text>
        </View>
      </View>

      <Text style={styles.metaText}>{formatDateTime(item.transactionDate)}</Text>
      <Text style={styles.metaText}>Order code: {item.orderCode ?? "-"}</Text>
      <Text style={styles.metaText}>Order ID: {item.orderId ?? "-"}</Text>
      <Text style={styles.metaText}>Method: {item.paymentMethod ?? "-"}</Text>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Total</Text>
        <Text style={styles.amountValue}>{formatCurrency(item.totalAmount)}₫</Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Merchant profit</Text>
        <Text style={styles.amountValue}>{formatCurrency(item.merchantProfit)}₫</Text>
      </View>
    </View>
  );
};

const CustomerPurchasedTransactionScreen = ({ route, navigation }) => {
  const { customerPurchasedId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerPurchasedId) {
        setError("Missing package id");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await customerPurchasedService.getCustomerPurchasedPackageTransaction(
          customerPurchasedId
        );
        if (res?.status === "200") {
          setData(res.data);
        } else {
          setError(res?.message || "Failed to load transactions");
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerPurchasedId]);

  const headerInfo = useMemo(() => {
    if (!data) return null;
    const { customerName, packageName, availableSessions, expirationDate } = data;
    return {
      customerName: customerName || "-",
      packageName: packageName || "-",
      availableSessions: availableSessions ?? "-",
      expirationDate: expirationDate ? formatDateTime(expirationDate) : "-",
    };
  }, [data]);

  const renderTransaction = ({ item }) => <TransactionItem item={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.hintText}>Đang tải lịch sử giao dịch...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={32} color="#F57C00" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !data ? (
        <View style={styles.centerContent}>
          <Text style={styles.hintText}>Không có dữ liệu</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{headerInfo?.packageName}</Text>
            <Text style={styles.summarySubtitle}>{headerInfo?.customerName}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available sessions</Text>
              <Text style={styles.summaryValue}>{headerInfo?.availableSessions}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expires</Text>
              <Text style={styles.summaryValue}>{headerInfo?.expirationDate}</Text>
            </View>
          </View>

          <FlatList
            data={data.transactions || []}
            keyExtractor={(item) => item.transactionId}
            renderItem={renderTransaction}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Text style={styles.hintText}>Chưa có giao dịch</Text>
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
    alignItems: "center",
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
});

export default CustomerPurchasedTransactionScreen;

