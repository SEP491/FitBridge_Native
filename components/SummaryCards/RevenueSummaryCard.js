import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const RevenueSummaryCard = ({
  totalRevenue = 0,
  compareToLastMonth,
  formatCurrency,
  renderRevenueComparison,
}) => (
  <View style={[styles.summaryCard, styles.revenueCard]}>
    <LinearGradient
      colors={["#FFF5F6", "#FFFFFF"]}
      style={styles.revenueCardGradient}
    >
      <View style={styles.revenueCardHeader}>
        <View style={styles.revenueIconBubble}>
          <Icon name="cash-outline" size={20} color="#ED2A46" />
        </View>
        <Text style={styles.summaryLabel}>Doanh thu tháng</Text>
      </View>
      <Text style={styles.summaryValue}>
        {formatCurrency ? formatCurrency(totalRevenue) : totalRevenue}
      </Text>
      {renderRevenueComparison
        ? renderRevenueComparison(compareToLastMonth)
        : null}
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueCard: {
    marginRight: 6,
    overflow: "hidden",
  },
  revenueCardGradient: {
    padding: 16,
    borderRadius: 20,
  },
  revenueCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  revenueIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(237, 42, 70, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8a8a8a",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
});

export default RevenueSummaryCard;

