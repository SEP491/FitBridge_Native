import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
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

const RevenueLineChart = ({ onDataLoaded }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState("year"); // 'year' or 'month'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDisplayModeModal, setShowDisplayModeModal] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // Calculate startDate and endDate based on display mode
  const calculateDates = () => {
    if (displayMode === "year") {
      // Year mode: entire year
      const start = new Date(selectedYear, 0, 2); // January 1st
      const end = new Date(selectedYear, 11, 32); // December 31st
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    } else {
      // Month mode: selected month only
      const start = new Date(selectedYear, selectedMonth, 2);
      const end = new Date(selectedYear, selectedMonth + 1, 1); // Last day of selected month
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }
  };

  useEffect(() => {
    const { startDate, endDate } = calculateDates();
    fetchRevenueData(startDate, endDate);
    fetchAvailableYears();
  }, [selectedYear, selectedMonth, displayMode]);

  // Fetch available years from API
  const fetchAvailableYears = async () => {
    try {
      const response = await dashBoardService.getRevenueDetails();
      let items = [];

      if (response?.data?.items) {
        items = response.data.items;
      }

      // Extract unique years from plannedDistributionDate
      const years = new Set();
      items.forEach((item) => {
        if (item.plannedDistributionDate) {
          const date = new Date(item.plannedDistributionDate);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        }
      });

      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears);

      // Set default year if not set
      if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
        setSelectedYear(sortedYears[0]);
      }
    } catch (err) {
      console.error("Error fetching available years:", err);
    }
  };

  const fetchRevenueData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      // Pass date parameters to API
      const params = {
        startDate,
        endDate,
      };
      const response = await dashBoardService.getRevenueDetails(params);

      // Handle API response structure from request service
      // Request service returns: { status, message, data: { items, total, totalProfitSum } }
      // So response.data contains: { items: [...], total: 8, totalProfitSum: 12861000 }
      let items = [];

      if (response) {
        // Standard structure: response.data.items
        if (response.data && Array.isArray(response.data.items)) {
          items = response.data.items;
        }
      }

      console.log("Revenue items count:", items.length);
      if (items.length > 0) {
        console.log("Sample item:", items[0]);
      }

      // Filter items by date range
      const filteredItems = items.filter((item) => {
        if (!item.plannedDistributionDate) return false;
        const itemDate = new Date(item.plannedDistributionDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });

      // Aggregate based on display mode
      const aggregated = {};

      filteredItems.forEach((item) => {
        const dateSource = item.plannedDistributionDate;
        if (!dateSource) return;

        const date = new Date(dateSource);
        // Validate date
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", dateSource);
          return;
        }

        let key;
        if (displayMode === "year") {
          // Year mode: aggregate by month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        } else {
          // Month mode: aggregate by week (4 weeks)
          const dayOfMonth = date.getDate();
          const weekNumber = Math.min(Math.floor((dayOfMonth - 1) / 7), 3); // 0-3 for 4 weeks
          key = `week-${weekNumber}`;
        }

        if (!aggregated[key]) {
          aggregated[key] = {
            totalRevenue: 0,
            appCommission: 0,
            paybackToGym: 0,
            date:
              displayMode === "year"
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                    2,
                    "0"
                  )}-01`
                : dateSource, // Use original date for month mode
          };
        }

        // Use the actual field names from API response
        const subTotal = parseFloat(item.subTotal) || 0;
        const systemProfit = parseFloat(item.systemProfit) || 0;
        const totalProfit = parseFloat(item.totalProfit) || 0;

        aggregated[key].totalRevenue += subTotal;
        aggregated[key].appCommission += systemProfit;
        aggregated[key].paybackToGym += totalProfit;
      });

      // Convert to array and sort
      let aggregatedArray;
      if (displayMode === "year") {
        // Sort by month
        aggregatedArray = Object.keys(aggregated)
          .sort()
          .map((monthKey) => ({
            date: aggregated[monthKey].date,
            totalRevenue: aggregated[monthKey].totalRevenue,
            appCommission: aggregated[monthKey].appCommission,
            paybackToGym: aggregated[monthKey].paybackToGym,
          }));
      } else {
        // Sort by week (0-3)
        aggregatedArray = [0, 1, 2, 3].map((weekNum) => {
          const weekKey = `week-${weekNum}`;
          if (aggregated[weekKey]) {
            return {
              date: aggregated[weekKey].date,
              totalRevenue: aggregated[weekKey].totalRevenue,
              appCommission: aggregated[weekKey].appCommission,
              paybackToGym: aggregated[weekKey].paybackToGym,
              weekNumber: weekNum,
            };
          }
          return {
            date: new Date(selectedYear, selectedMonth, weekNum * 7 + 1)
              .toISOString()
              .split("T")[0],
            totalRevenue: 0,
            appCommission: 0,
            paybackToGym: 0,
            weekNumber: weekNum,
          };
        });
      }

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

    // Format labels based on display mode
    const labels = data.map((item) => {
      if (displayMode === "year") {
        // Year mode: show month names
        const date = new Date(item.date);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return monthNames[date.getMonth()];
      } else {
        // Month mode: show week numbers
        return `Tuần ${(item.weekNumber || 0) + 1}`;
      }
    });
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

  const chartData = prepareChartData();

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Ionicons name="trending-up" size={24} color="#ED2A46" />
          <Text style={styles.chartTitle}>Xu Hướng Doanh Thu & Lợi Nhuận</Text>
        </View>

        {/* Display Mode, Year and Month Selectors */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowDisplayModeModal(true)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Ionicons name="stats-chart-outline" size={16} color="#ED2A46" />
            <Text style={styles.selectorText}>
              {displayMode === "year" ? "Theo Năm" : "Theo Tháng"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#ED2A46" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowYearModal(true)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={16} color="#ED2A46" />
            <Text style={styles.selectorText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={16} color="#ED2A46" />
          </TouchableOpacity>

          {displayMode === "month" && (
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowMonthModal(true)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons
                name="calendar-number-outline"
                size={16}
                color="#ED2A46"
              />
              <Text style={styles.selectorText}>
                {monthNames[selectedMonth]}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#ED2A46" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED2A46" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ED2A46" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !chartData || chartData.labels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              Không có dữ liệu để hiển thị cho {monthNames[selectedMonth]}{" "}
              {selectedYear}
            </Text>
          </View>
        ) : (
          <>
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
                formatYLabel={(value) => {
                  const num = parseFloat(value);
                  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                  return value;
                }}
              />
            </ScrollView>

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={styles.legendText}>Tổng Doanh Thu</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F59E0B" }]}
                />
                <Text style={styles.legendText}>Hoa Hồng App</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Tiền Về Ví</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Year Selection Modal */}
      <Modal
        visible={showYearModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Năm</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.yearList}>
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearItem,
                      isSelected && styles.yearItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.yearItemText,
                        isSelected && styles.yearItemTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month Selection Modal */}
      <Modal
        visible={showMonthModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tháng</Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthList}>
              {monthNames.map((month, index) => {
                const isSelected = selectedMonth === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthItem,
                      isSelected && styles.monthItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setShowMonthModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        isSelected && styles.monthItemTextSelected,
                      ]}
                    >
                      {month}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Display Mode Selection Modal */}
      <Modal
        visible={showDisplayModeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDisplayModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Chế Độ Hiển Thị</Text>
              <TouchableOpacity onPress={() => setShowDisplayModeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.displayModeList}>
              {/* Year Mode */}
              <TouchableOpacity
                style={[
                  styles.displayModeItem,
                  displayMode === "year" && styles.displayModeItemSelected,
                ]}
                onPress={() => {
                  setDisplayMode("year");
                  setShowDisplayModeModal(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.displayModeItemContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={displayMode === "year" ? "#2E7D32" : "#333"}
                  />
                  <View style={styles.displayModeTextContainer}>
                    <Text
                      style={[
                        styles.displayModeItemTitle,
                        displayMode === "year" &&
                          styles.displayModeItemTitleSelected,
                      ]}
                    >
                      Theo Năm
                    </Text>
                    <Text style={styles.displayModeItemDescription}>
                      Xem dữ liệu theo tháng trong năm
                    </Text>
                  </View>
                </View>
                {displayMode === "year" && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>

              {/* Month Mode */}
              <TouchableOpacity
                style={[
                  styles.displayModeItem,
                  displayMode === "month" && styles.displayModeItemSelected,
                ]}
                onPress={() => {
                  setDisplayMode("month");
                  setShowDisplayModeModal(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.displayModeItemContent}>
                  <Ionicons
                    name="apps-outline"
                    size={24}
                    color={displayMode === "month" ? "#2E7D32" : "#333"}
                  />
                  <View style={styles.displayModeTextContainer}>
                    <Text
                      style={[
                        styles.displayModeItemTitle,
                        displayMode === "month" &&
                          styles.displayModeItemTitleSelected,
                      ]}
                    >
                      Theo Tháng
                    </Text>
                    <Text style={styles.displayModeItemDescription}>
                      Xem dữ liệu theo tuần trong tháng
                    </Text>
                  </View>
                </View>
                {displayMode === "month" && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    minHeight: 200,
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
    minHeight: 200,
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
    minHeight: 200,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  selectorContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ED2A46",
    gap: 6,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ED2A46",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  yearList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  yearItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  yearItemSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  yearItemTextSelected: {
    color: "#2E7D32",
  },
  monthList: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  monthItemSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  monthItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  monthItemTextSelected: {
    color: "#2E7D32",
  },
  displayModeList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  displayModeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  displayModeItemSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  displayModeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  displayModeTextContainer: {
    flex: 1,
  },
  displayModeItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  displayModeItemTitleSelected: {
    color: "#2E7D32",
  },
  displayModeItemDescription: {
    fontSize: 12,
    color: "#666",
  },
});

export default RevenueLineChart;
