import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import dashBoardService from "../../services/dashBoardService";
import mockedData from "./mockedData";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 32;

// Format VND currency
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to MM/YYYY
const formatMonthYear = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const RevenueLineChart = ({ startDate, endDate, onDataLoaded }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const fetchRevenueData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashBoardService.getRevenueDetails();

      // Handle API response structure from request service
      // Request service returns: { status, message, data: { items, total, totalProfitSum } }
      // So response.data contains: { items: [...], total: 8, totalProfitSum: 12861000 }
      let items = [];
      
      if (response) {
        // Standard structure: response.data.items
        if (response.data && Array.isArray(response.data.items)) {
          items = mockedData.data.items;
        } 
      }

      console.log("Revenue items count:", items.length);
      if (items.length > 0) {
        console.log("Sample item:", items[0]);
      }

      // Aggregate by month of plannedDistributionDate
      const aggregated = {};

      items.forEach((item) => {
        const dateSource = item.plannedDistributionDate;
        if (!dateSource) return;

        const date = new Date(dateSource);
        // Validate date
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", dateSource);
          return;
        }

        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!aggregated[monthKey]) {
          aggregated[monthKey] = {
            totalRevenue: 0,
            appCommission: 0,
            paybackToGym: 0,
          };
        }

        // Use the actual field names from API response
        const subTotal = parseFloat(item.subTotal) || 0;
        const systemProfit = parseFloat(item.systemProfit) || 0;
        const totalProfit = parseFloat(item.totalProfit) || 0;

        aggregated[monthKey].totalRevenue += subTotal;
        aggregated[monthKey].appCommission += systemProfit;
        aggregated[monthKey].paybackToGym += totalProfit;
      });

      // Convert to array and sort by date
      const aggregatedArray = Object.keys(aggregated)
        .sort()
        .map((monthKey) => ({
          date: `${monthKey}-01`,
          totalRevenue: aggregated[monthKey].totalRevenue,
          appCommission: aggregated[monthKey].appCommission,
          paybackToGym: aggregated[monthKey].paybackToGym,
        }));

      setData(aggregatedArray);

      // Calculate totals and pass to parent
      if (onDataLoaded) {
        const totalRevenue = aggregatedArray.reduce(
          (sum, item) => sum + (item.totalRevenue || 0),
          0
        );
        const totalAppCommission = aggregatedArray.reduce(
          (sum, item) => sum + (item.appCommission || 0),
          0
        );
        const totalPaybackToGym = aggregatedArray.reduce(
          (sum, item) => sum + (item.paybackToGym || 0),
          0
        );
        const avgRevenue =
          aggregatedArray.length > 0
            ? totalRevenue / aggregatedArray.length
            : 0;

        onDataLoaded({
          totalRevenue,
          totalAppCommission,
          totalPaybackToGym,
          avgRevenue,
        });
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (data.length === 0) return null;

    const labels = data.map((item) => formatMonthYear(item.date));
    const totalRevenueData = data.map((item) => item.totalRevenue || 0);
    const appCommissionData = data.map((item) => item.appCommission || 0);
    const paybackToGymData = data.map((item) => item.paybackToGym || 0);

    return {
      labels,
      datasets: [
        {
          data: totalRevenueData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
          strokeWidth: 3,
        },
        {
          data: appCommissionData,
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Amber
          strokeWidth: 3,
        },
        {
          data: paybackToGymData,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
          strokeWidth: 3,
        },
      ],
      formatYLabel: (value) => {
        const numValue = parseFloat(value);
        if (numValue >= 1000000) {
          return `${(numValue / 1000000).toFixed(1)}M`;
        } else if (numValue >= 1000) {
          return `${(numValue / 1000).toFixed(1)}K`;
        }
        return value;
      },
    };
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
    },
    formatYLabel: formatVND,
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ED2A46" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  const chartData = prepareChartData();

  if (!chartData || chartData.labels.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#E0E0E0" />
          <Text style={styles.emptyText}>
            Không có dữ liệu để hiển thị
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Ionicons name="trending-up" size={24} color="#ED2A46" />
          <Text style={styles.chartTitle}>
            Xu Hướng Doanh Thu & Lợi Nhuận
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={Math.max(CHART_WIDTH, chartData.labels.length * 60)}
            height={300}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            fromZero
            segments={5}
            
          />
        </ScrollView>
      
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={styles.legendText}>Tổng Doanh Thu</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Hoa Hồng App</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.legendText}>Tiền Về Ví</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#ED2A46",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default RevenueLineChart;

