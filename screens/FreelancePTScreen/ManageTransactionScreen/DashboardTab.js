import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart, ProgressChart } from "react-native-chart-kit";
import SummaryCard from "../../../components/SummaryCards/SummaryCard";
import dashBoardService from "../../../services/dashBoardService";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 32;

const DashboardTab = ({
  transactions,
  totalRevenue,
  pendingCount,
  completedCount,
  failedCount,
  showCharts,
  setShowCharts,
  setActiveTab,
  formatAmount,
  t,
}) => {
  const [selectedYears, setSelectedYears] = useState([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [displayMode, setDisplayMode] = useState("year"); // 'year', 'month'
  const [showDisplayModeModal, setShowDisplayModeModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  // Format currency to Vietnamese Dong
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
  };

  const fetchWalletData = async () => {
    try {
      const response = await dashBoardService.getWalletBalance();
      setAvailableBalance(response.data.totalAvailableBalance || 0);
      setPendingBalance(response.data.totalPendingBalance || 0);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setAvailableBalance(0);
      setPendingBalance(0);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const summaryFinancialStats = [
    {
      id: "availableBalance",
      label: t("dashboard.availableBalance", "Số dư khả dụng"),
      value: formatCurrency(availableBalance),
      helper: t("dashboard.canWithdrawNow", "Có thể rút ngay"),
      icon: "wallet",
      accent: "#FF914D",
      variant: "wide",
      style: "",
    },
    {
      id: "pendingBalance",
      label: t("dashboard.pendingBalance", "Số dư chờ xử lý"),
      value: formatCurrency(pendingBalance),
      helper: t("dashboard.awaitingPayment", "Đang chờ thanh toán"),
      icon: "timer-outline",
      accent: "#ED2A46",
      variant: "wide",
      style: "",
    },
  ];

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set();
    transactions.forEach((t) => {
      const year = new Date(t.createdAt).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [transactions]);

  // Initialize years based on display mode
  useMemo(() => {
    if (selectedYears.length === 0 && availableYears.length > 0) {
      if (displayMode === "month") {
        // In month mode, select only 1 latest year
        setSelectedYears([availableYears[0]]);
      } else {
        // In year mode, select up to 3 latest years
        const latestYears = availableYears.slice(
          0,
          Math.min(3, availableYears.length)
        );
        setSelectedYears(latestYears);
      }
    }
  }, [availableYears, displayMode]);

  const toggleYearSelection = (year) => {
    if (displayMode === "month") {
      // In monthly mode, only allow 1 year selection
      setSelectedYears([year]);
    } else {
      // In yearly mode, allow up to 3 years
      if (selectedYears.includes(year)) {
        setSelectedYears(selectedYears.filter((y) => y !== year));
      } else {
        if (selectedYears.length < 3) {
          setSelectedYears([...selectedYears, year].sort((a, b) => b - a));
        }
      }
    }
  };

  const getYearColor = (index) => {
    const colors = [
      "rgba(237, 42, 70, 1)",
      "rgba(76, 175, 80, 1)",
      "rgba(33, 150, 243, 1)",
    ];
    return colors[index] || colors[0];
  };
  const prepareLineChartData = () => {
    console.log("=== prepareLineChartData ===");
    console.log("Display mode:", displayMode);
    console.log("Selected years:", selectedYears);
    console.log("Total transactions:", transactions.length);

    let labels = [];
    let groupingFunction;

    // Determine labels and grouping based on display mode
    if (displayMode === "year") {
      // Show all 12 months
      labels = [
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
      groupingFunction = (t) => new Date(t.createdAt).getMonth();
    } else if (displayMode === "month") {
      // Show 4 weeks
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      groupingFunction = (t) => {
        const date = new Date(t.createdAt);
        const dayOfMonth = date.getDate();
        // Calculate which week of the month (0-3)
        return Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
      };
    }

    // Prepare datasets for each selected year
    const datasets = selectedYears.map((year, index) => {
      const yearTransactions = transactions.filter((t) => {
        const txDate = new Date(t.createdAt);
        const txYear = txDate.getFullYear();
        const status = t.status?.toUpperCase();

        // Filter based on display mode
        let includeTransaction =
          txYear === year && (status === "COMPLETED" || status === "SUCCESS");

        if (displayMode === "month") {
          // Only include transactions from the selected month of the selected year
          includeTransaction =
            includeTransaction &&
            txDate.getMonth() === selectedMonth &&
            txYear === year;
        }

        return includeTransaction;
      });

      console.log(
        `Year ${year}: Found ${yearTransactions.length} transactions`
      );
      yearTransactions.forEach((t) => {
        const txDate = new Date(t.createdAt);
        console.log(
          `  - ${
            t.orderCode
          }: ${txDate.toISOString()}, Month: ${txDate.getMonth()}, Amount: ${
            t.amount
          }`
        );
      });

      // Initialize revenue data structure
      const revenueData = {};
      for (let i = 0; i < labels.length; i++) {
        revenueData[i] = 0;
      }

      // Group transactions by the appropriate time unit
      yearTransactions.forEach((t) => {
        const key = groupingFunction(t);
        if (key >= 0 && key < labels.length) {
          revenueData[key] += t.amount || 0;
        }
      });

      console.log(`Year ${year} revenue data:`, revenueData);

      const color = getYearColor(index);

      return {
        data: Object.values(revenueData).map((val) => val / 1000), // Convert to thousands
        color: () => color,
        strokeWidth: 2,
      };
    });

    // If no years selected, return empty data
    if (datasets.length === 0) {
      return {
        labels: ["N/A"],
        datasets: [{ data: [0] }],
        legend: [],
      };
    }

    return {
      labels: labels,
      datasets: datasets,
      legend: selectedYears.map((year) => `${year}`),
    };
  };

  const prepareProgressRingsData = () => {
    const total = completedCount + pendingCount + failedCount;
    return {
      labels: [
        t("transaction.failed", "Failed"),
        t("transaction.pending", "Pending"),
        t("transaction.completed", "Completed"),
      ],
      data: [
        total > 0 ? failedCount / total : 0,
        total > 0 ? pendingCount / total : 0,
        total > 0 ? completedCount / total : 0,
      ],
      colors: ["#F44336", "#FF9800", "#4CAF50"],
      counts: [failedCount, pendingCount, completedCount],
      icons: ["close-circle", "time", "checkmark-circle"],
    };
  };

  const prepareBarChartData = () => {
    const monthlyData = {};
    transactions.forEach((t) => {
      const date = new Date(t.createdAt);
      const monthKey = `${date.getMonth() + 1}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { completed: 0, pending: 0, failed: 0 };
      }
      const status = t.status?.toUpperCase();
      if (status === "COMPLETED" || status === "SUCCESS") {
        monthlyData[monthKey].completed += t.amount || 0;
      } else if (status === "PENDING") {
        monthlyData[monthKey].pending += t.amount || 0;
      } else {
        monthlyData[monthKey].failed += t.amount || 0;
      }
    });

    const months = Object.keys(monthlyData).sort(
      (a, b) => Number(a) - Number(b)
    );
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

    return {
      labels: months.map((m) => monthNames[Number(m) - 1]),
      datasets: [
        {
          data: months.map((m) => monthlyData[m].completed / 1000),
          color: () => "#4CAF50",
        },
        {
          data: months.map((m) => monthlyData[m].pending / 1000),
          color: () => "#FF9800",
        },
        {
          data: months.map((m) => monthlyData[m].failed / 1000),
          color: () => "#F44336",
        },
      ],
      legend: [
        t("transaction.completed", "Completed"),
        t("transaction.pending", "Pending"),
        t("transaction.failed", "Failed"),
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 2,
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <>
      {/* Financial Stats */}
      <View style={styles.financialStatsContainer}>
        <View style={styles.financialRow}>
          {summaryFinancialStats.map((stat) => (
            <SummaryCard stat={stat} key={stat.id} />
          ))}
        </View>
      </View>

      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="list-outline" size={24} color="#ED2A46" />
          <Text style={styles.statNumber}>{transactions.length}</Text>
          <Text style={styles.statLabel}>
            {t("transaction.totalTransactions", "Total")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{formatAmount(totalRevenue)}</Text>
          <Text style={styles.statLabel}>
            {t("transaction.totalRevenue", "Revenue")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>
            {t("transaction.pending", "Pending")}
          </Text>
        </View>
      </View>

      {/* Toggle Charts Button */}
      <TouchableOpacity
        style={styles.toggleChartsButton}
        onPress={() => setShowCharts(!showCharts)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showCharts ? "chevron-up" : "chevron-down"}
          size={20}
          color="#ED2A46"
        />
        <Text style={styles.toggleChartsText}>
          {showCharts
            ? t("transaction.hideCharts", "Hide Charts")
            : t("transaction.showCharts", "Show Charts")}
        </Text>
      </TouchableOpacity>

      {/* Charts Section */}
      {showCharts && transactions.length > 0 && (
        <View style={styles.chartsContainer}>
          {/* Revenue Trend Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitle}>
                  {t("transaction.revenueTrend", "Revenue Trend by Year")}
                </Text>
                <Text style={styles.chartSubtitle}>
                  {t(
                    "transaction.amountInThousands",
                    "Amount in thousands (VND)"
                  )}
                </Text>
              </View>

              {/* Selector Buttons Row */}
              <View style={styles.selectorButtonsRow}>
                {/* Display Mode Selector */}
                <TouchableOpacity
                  style={styles.displayModeButton}
                  onPress={() => setShowDisplayModeModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="stats-chart-outline"
                    size={16}
                    color="#ED2A46"
                  />
                  <Text style={styles.displayModeText}>
                    {displayMode === "year"
                      ? t("dashboard.yearly", "Yearly")
                      : t("dashboard.monthly", "Monthly")}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#ED2A46" />
                </TouchableOpacity>

                {/* Month Selector Button (only show in monthly mode) */}
                {displayMode === "month" && (
                  <TouchableOpacity
                    style={styles.monthSelectorButton}
                    onPress={() => setShowMonthModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-number-outline"
                      size={16}
                      color="#ED2A46"
                    />
                    <Text style={styles.monthSelectorText}>
                      {
                        [
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
                        ][selectedMonth]
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#ED2A46" />
                  </TouchableOpacity>
                )}

                {/* Year Selector Button */}
                <TouchableOpacity
                  style={styles.yearSelectorButton}
                  onPress={() => setShowYearModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color="#ED2A46" />
                  <Text style={styles.yearSelectorText}>
                    {selectedYears.length > 0
                      ? selectedYears.join(", ")
                      : t("dashboard.selectYears", "Select Years")}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#ED2A46" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Year Color Legend */}
            {selectedYears.length > 0 && (
              <View style={styles.legendContainer}>
                {selectedYears.map((year, index) => (
                  <View key={year} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: getYearColor(index) },
                      ]}
                    />
                    <Text style={styles.legendText}>{year}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedYears.length > 0 ? (
              <LineChart
                data={prepareLineChartData()}
                width={CHART_WIDTH - 32}
                height={220}
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
              />
            ) : (
              <View style={styles.emptyChartMessage}>
                <Ionicons name="analytics-outline" size={40} color="#E0E0E0" />
                <Text style={styles.emptyChartText}>
                  {t(
                    "dashboard.selectYearsToView",
                    "Select years to view revenue trend"
                  )}
                </Text>
              </View>
            )}
          </View>

          {/* Status Distribution Progress Rings */}
          {completedCount + pendingCount + failedCount >= 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {t(
                  "transaction.statusDistribution",
                  "Transaction Status Distribution"
                )}
              </Text>
              <View style={styles.progressRingsWrapper}>
                <ProgressChart
                  data={{
                    labels: prepareProgressRingsData().labels,
                    data: prepareProgressRingsData().data,
                  }}
                  width={CHART_WIDTH - 32}
                  height={200}
                  strokeWidth={16}
                  radius={28}
                  chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    color: (opacity = 1, index) => {
                      const colors = ["#F44336", "#FF9800", "#11ed18ff"];
                      const hexColor = colors[index] || colors[0];

                      // Convert hex to rgba with opacity
                      const r = parseInt(hexColor.slice(1, 3), 16);
                      const g = parseInt(hexColor.slice(3, 5), 16);
                      const b = parseInt(hexColor.slice(5, 7), 16);

                      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    },
                    propsForLabels: {
                      fontSize: 11,
                    },
                  }}
                  hideLegend={true}
                  style={styles.chart}
                  hasLegend={false}
                />
                {/* Custom Legend with Icons and Stats */}
                <View style={styles.progressRingsLegend}>
                  {prepareProgressRingsData().labels.map((label, index) => {
                    const ringData = prepareProgressRingsData();
                    const percentage = (ringData.data[index] * 100).toFixed(1);
                    return (
                      <View key={index} style={styles.progressRingLegendItem}>
                        <View style={styles.progressRingLegendHeader}>
                          <Ionicons
                            name={ringData.icons[index]}
                            size={20}
                            color={ringData.colors[index]}
                          />
                          <Text
                            style={[
                              styles.progressRingLabel,
                              { color: ringData.colors[index] },
                            ]}
                          >
                            {label}
                          </Text>
                        </View>
                        <View style={styles.progressRingStats}>
                          <Text style={styles.progressRingCount}>
                            {ringData.counts[index]}
                          </Text>
                          <Text style={styles.progressRingPercentage}>
                            ({percentage}%)
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Monthly Revenue Bar Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              {t("transaction.monthlyRevenue", "Monthly Revenue by Status")}
            </Text>
            <Text style={styles.chartSubtitle}>
              {t("transaction.amountInThousands", "Amount in thousands (VND)")}
            </Text>
            <BarChart
              data={prepareBarChartData()}
              width={CHART_WIDTH - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={false}
              showValuesOnTopOfBars={false}
              fromZero
            />
          </View>
        </View>
      )}

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
              <Text style={styles.modalTitle}>
                {t("dashboard.selectYears", "Select Years")}
              </Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {displayMode === "month"
                ? t(
                    "dashboard.selectOneYear",
                    "Select a year to view monthly data"
                  )
                : t(
                    "dashboard.selectUpTo3Years",
                    "Select up to 3 years to compare"
                  )}
            </Text>

            <ScrollView style={styles.yearList}>
              {availableYears.map((year) => {
                const isSelected = selectedYears.includes(year);
                const canSelect =
                  displayMode === "month"
                    ? true
                    : selectedYears.length < 3 || isSelected;

                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearItem,
                      isSelected && styles.yearItemSelected,
                      !canSelect && styles.yearItemDisabled,
                    ]}
                    onPress={() => canSelect && toggleYearSelection(year)}
                    disabled={!canSelect}
                    activeOpacity={0.7}
                  >
                    <View style={styles.yearItemContent}>
                      <Text
                        style={[
                          styles.yearItemText,
                          isSelected && styles.yearItemTextSelected,
                          !canSelect && styles.yearItemTextDisabled,
                        ]}
                      >
                        {year}
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.yearColorIndicator,
                            {
                              backgroundColor: getYearColor(
                                selectedYears.indexOf(year)
                              ),
                            },
                          ]}
                        />
                      )}
                    </View>
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

              {availableYears.length === 0 && (
                <View style={styles.emptyYearList}>
                  <Ionicons name="calendar-outline" size={40} color="#E0E0E0" />
                  <Text style={styles.emptyYearText}>
                    {t("dashboard.noYearsAvailable", "No years available")}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.selectedCountText}>
                {displayMode === "month"
                  ? `${selectedYears.length} ${t(
                      "dashboard.yearSelected",
                      "year selected"
                    )}`
                  : `${selectedYears.length} / 3 ${t(
                      "dashboard.yearsSelected",
                      "years selected"
                    )}`}
              </Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowYearModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>
                  {t("dashboard.done", "Done")}
                </Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.modalTitle}>
                {t("dashboard.selectMonth", "Select Month")}
              </Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t("dashboard.chooseMonth", "Choose a month to view weekly data")}
            </Text>

            <ScrollView
              style={styles.monthListContainer}
              showsVerticalScrollIndicator={true}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => {
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
                    <View style={styles.monthItemContent}>
                      <Text
                        style={[
                          styles.monthItemText,
                          isSelected && styles.monthItemTextSelected,
                        ]}
                      >
                        {t(`dashboard.${month.toLowerCase()}`, month)}
                      </Text>
                    </View>
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
              <Text style={styles.modalTitle}>
                {t("dashboard.selectDisplayMode", "Select Display Mode")}
              </Text>
              <TouchableOpacity onPress={() => setShowDisplayModeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t(
                "dashboard.chooseTimeFrame",
                "Choose how to view your revenue data"
              )}
            </Text>

            <View style={styles.displayModeList}>
              {/* Year Mode */}
              <TouchableOpacity
                style={[
                  styles.displayModeItem,
                  displayMode === "year" && styles.displayModeItemSelected,
                ]}
                onPress={() => {
                  setDisplayMode("year");
                  // Auto-select 3 latest years when switching to year mode
                  if (availableYears.length > 0) {
                    const latestYears = availableYears.slice(
                      0,
                      Math.min(3, availableYears.length)
                    );
                    setSelectedYears(latestYears);
                  }
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
                      {t("dashboard.yearly", "Yearly")}
                    </Text>
                    <Text style={styles.displayModeItemDescription}>
                      {t(
                        "dashboard.yearlyDescription",
                        "View data by month across the year"
                      )}
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
                  // Auto-select 1 latest year when switching to month mode
                  if (availableYears.length > 0) {
                    setSelectedYears([availableYears[0]]);
                  }
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
                      {t("dashboard.monthly", "Monthly")}
                    </Text>
                    <Text style={styles.displayModeItemDescription}>
                      {t(
                        "dashboard.monthlyDescription",
                        "View data by week for the current month"
                      )}
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
    </>
  );
};

const styles = StyleSheet.create({
  financialStatsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  financialRow: {
    flexDirection: "row",
    gap: 12,
  },
  statsContainer: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  toggleChartsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    gap: 8,
  },
  toggleChartsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
  chartsContainer: {
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitleContainer: {
    marginBottom: 8,
  },
  selectorButtonsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  displayModeButton: {
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
  displayModeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ED2A46",
  },
  yearSelectorButton: {
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
  yearSelectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ED2A46",
  },

  monthSelectorButton: {
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
  monthSelectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ED2A46",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  emptyChartMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyChartText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
    textAlign: "center",
  },
  // Progress Rings Styles
  progressRingsWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  progressRingsLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  progressRingLegendItem: {
    alignItems: "center",
    flex: 1,
  },
  progressRingLegendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  progressRingLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  progressRingStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressRingCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  progressRingPercentage: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  // Modal Styles
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
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
  yearItemDisabled: {
    opacity: 0.4,
  },
  yearItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  yearItemTextSelected: {
    color: "#2E7D32",
  },
  yearItemTextDisabled: {
    color: "#999",
  },
  yearColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  emptyYearList: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyYearText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  doneButton: {
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  // Display Mode Modal Styles
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
  // Month Modal Styles
  monthListContainer: {
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
  monthItemContent: {
    flex: 1,
  },
  monthItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  monthItemTextSelected: {
    color: "#2E7D32",
  },
});

export default DashboardTab;
