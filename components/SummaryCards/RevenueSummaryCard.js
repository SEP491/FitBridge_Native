import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import RevenueLineChart from "../RevenueChart/RevenueLineChart";

const RevenueSummaryCard = ({
  totalRevenue = 0,
  compareToLastMonth,
  formatCurrency,
  renderRevenueComparison,
  showChart = true,
  startDate,
  endDate,
}) => {
  const currentYear = new Date().getFullYear();
  const [chartStartDate, setChartStartDate] = useState(
    startDate || `${currentYear}-01-01`
  );
  const [chartEndDate, setChartEndDate] = useState(
    endDate || `${currentYear}-12-31`
  );
  const [chartMetrics, setChartMetrics] = useState({
    totalRevenue: totalRevenue,
    totalAppCommission: 0,
    totalPaybackToGym: 0,
    avgRevenue: 0,
  });

  useEffect(() => {
    if (startDate) setChartStartDate(startDate);
    if (endDate) setChartEndDate(endDate);
  }, [startDate, endDate]);

  const handleChartDataLoaded = (metrics) => {
    setChartMetrics(metrics);
  };

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      {/* <View style={[styles.summaryCard, styles.revenueCard]}>
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
            {formatCurrency
              ? formatCurrency(chartMetrics.totalRevenue || totalRevenue)
              : chartMetrics.totalRevenue || totalRevenue}
          </Text>
          {renderRevenueComparison
            ? renderRevenueComparison(compareToLastMonth)
            : null}
        </LinearGradient>
      </View> */}

      {/* Revenue Line Chart */}
      {showChart && (
        <View style={styles.chartContainer}>
          <RevenueLineChart
            startDate={chartStartDate}
            endDate={chartEndDate}
            onDataLoaded={handleChartDataLoaded}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
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
  chartContainer: {
    marginTop: 8,
  },
});

export default RevenueSummaryCard;

