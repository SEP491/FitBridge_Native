import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RevenueLineChart from "./RevenueLineChart";

// Format VND currency
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Example usage of RevenueLineChart component
 * 
 * This component demonstrates how to use RevenueLineChart similar to the web version.
 * You can integrate this into your gym dashboard screen.
 * 
 * Usage:
 * <RevenueChartExample />
 */
const RevenueChartExample = () => {
  // Set initial date range to current year
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(
    `${currentYear}-01-01`
  );
  const [endDate, setEndDate] = useState(
    `${currentYear}-12-31`
  );
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalAppCommission: 0,
    totalPaybackToGym: 0,
    avgRevenue: 0,
  });

  const handleDataLoaded = (data) => {
    setMetrics(data);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="cash-outline" size={28} color="#ED2A46" />
        <Text style={styles.headerTitle}>
          Bảng Điều Khiển Doanh Thu Phòng Gym
        </Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Theo dõi doanh thu từ bán khóa học và hoa hồng ứng dụng
      </Text>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, styles.blueCard]}>
          <View style={styles.metricIcon}>
            <Ionicons name="trending-up" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.metricLabel}>Tổng Doanh Thu</Text>
          <Text style={styles.metricValue}>
            {formatVND(metrics.totalRevenue)}
          </Text>
        </View>

        <View style={[styles.metricCard, styles.amberCard]}>
          <View style={styles.metricIcon}>
            <Ionicons name="remove-circle" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.metricLabel}>Hoa Hồng App</Text>
          <Text style={styles.metricValue}>
            - {formatVND(metrics.totalAppCommission)}
          </Text>
        </View>

        <View style={[styles.metricCard, styles.greenCard]}>
          <View style={styles.metricIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <Text style={styles.metricLabel}>Tiền Về Chủ Gym</Text>
          <Text style={styles.metricValue}>
            {formatVND(metrics.totalPaybackToGym)}
          </Text>
        </View>

        <View style={[styles.metricCard, styles.purpleCard]}>
          <View style={styles.metricIcon}>
            <Ionicons name="stats-chart" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.metricLabel}>Doanh Thu Trung Bình</Text>
          <Text style={styles.metricValue}>
            {formatVND(metrics.avgRevenue)}
          </Text>
        </View>
      </View>

      {/* Revenue Line Chart */}
      <RevenueLineChart
        startDate={startDate}
        endDate={endDate}
        onDataLoaded={handleDataLoaded}
      />

      {/* Note: In a real implementation, you would add a date picker here
          similar to the web version using RangePicker from a date picker library */}
      <View style={styles.noteContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
        <Text style={styles.noteText}>
          Để thay đổi khoảng thời gian, cập nhật startDate và endDate props
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  amberCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  purpleCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
  },
});

export default RevenueChartExample;

