import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import CustomerPurchasedTransactionScreen from "../../FreelancePTScreen/CustomerPurchasedTransactionScreen";
import CustomerPurchasedBookingHistoryScreen from "../../FreelancePTScreen/CustomerPurchasedBookingHistoryScreen";
import colors from "../../../constants/color";

const PackageHistoryScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { customerPurchasedId, packageName, packageType, customer } = route.params || {};
  const [activeTab, setActiveTab] = useState("transaction");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {packageName || t("packageHistory.title", "Package History")}
          </Text>
        </View>
      </View>

      {/* Enhanced Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "transaction" && styles.activeTab]}
          onPress={() => setActiveTab("transaction")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="receipt-outline"
            size={18}
            color={activeTab === "transaction" ? colors.white : "#666"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "transaction" && styles.activeTabText,
            ]}
          >
            {t("packageHistory.transaction", "Transaction")}
          </Text>
          {activeTab === "transaction" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "booking" && styles.activeTab]}
          onPress={() => setActiveTab("booking")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={activeTab === "booking" ? colors.white : "#666"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "booking" && styles.activeTabText,
            ]}
          >
            {t("packageHistory.booking", "Booking")}
          </Text>
          {activeTab === "booking" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "transaction" ? (
          <CustomerPurchasedTransactionScreen
            route={{ params: { customerPurchasedId } }}
            navigation={navigation}
          />
        ) : (
          <CustomerPurchasedBookingHistoryScreen
            route={{
              params: {
                customerPurchasedId,
                customerId: customer?.id,
                customer: customer,
              },
            }}
            navigation={navigation}
          />
        )}
      </View>
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#f1f3f5",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    position: "relative",
    overflow: "hidden",
  },
  activeTab: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#fff",
    opacity: 0.5,
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: colors.white,
  },
  tabContent: {
    flex: 1,
  },
});

export default PackageHistoryScreen;

