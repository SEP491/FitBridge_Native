import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { fetchUserFromStorage, formatDateForAPI } from "../../../lib";
import { mockedDataDashboard } from "./mockedDataDashboard";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart, ProgressChart } from "react-native-chart-kit";
import DashboardHeader from "./DashboardHeader";
import QuickActions from "./QuickActions";
import SummarySection from "./SummarySection";
import UpcomingSessions from "./UpcomingSessions";
import BestsellerPackages from "./BestsellerPackages";
import dashBoardService from "../../../services/dashBoardService";
import transactionService from "../../../services/transactionService";
import { useFocusEffect } from "@react-navigation/native";
import accountService from "../../../services/accountService";
import { useTranslation } from "../../../hooks/useTranslation";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 32;

const FreelancePTDashboard = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [monthLyRevenue, setMonthLyRevenue] = useState(null);
  
  // Charts state
  const [showCharts, setShowCharts] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [displayMode, setDisplayMode] = useState("year");
  const [showDisplayModeModal, setShowDisplayModeModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Get available years from transactions
  const availableYears = React.useMemo(() => {
    const years = new Set();
    transactions.forEach((t) => {
      const year = new Date(t.createdAt).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Initialize years based on display mode
  React.useMemo(() => {
    if (selectedYears.length === 0 && availableYears.length > 0) {
      if (displayMode === "month") {
        setSelectedYears([availableYears[0]]);
      } else {
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
      setSelectedYears([year]);
    } else {
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
    let labels = [];
    let groupingFunction;

    if (displayMode === "year") {
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
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      groupingFunction = (t) => {
        const date = new Date(t.createdAt);
        const dayOfMonth = date.getDate();
        return Math.min(3, Math.floor((dayOfMonth - 1) / 7));
      };
    }

    const datasets = selectedYears.map((year, yearIndex) => {
      const yearData = Array(labels.length).fill(0);
      transactions.forEach((t) => {
        const tDate = new Date(t.createdAt);
        const tYear = tDate.getFullYear();
        const tMonth = displayMode === "month" ? tDate.getMonth() : null;

        if (displayMode === "month") {
          if (tYear === year && tMonth === selectedMonth) {
            const group = groupingFunction(t);
            if (
              (t.status?.toUpperCase() === "COMPLETED" ||
                t.status?.toUpperCase() === "SUCCESS") &&
              group >= 0 &&
              group < labels.length
            ) {
              yearData[group] += t.amount || 0;
            }
          }
        } else {
          if (tYear === year) {
            const group = groupingFunction(t);
            if (
              (t.status?.toUpperCase() === "COMPLETED" ||
                t.status?.toUpperCase() === "SUCCESS") &&
              group >= 0 &&
              group < labels.length
            ) {
              yearData[group] += t.amount || 0;
            }
          }
        }
      });

      const scaledData = yearData.map((val) => val / 1000);
      return {
        data: scaledData,
        color: () => getYearColor(yearIndex),
        strokeWidth: 2,
      };
    });

    return { labels, datasets };
  };

  const prepareProgressRingsData = () => {
    const totalCount =
      transactions.filter(
        (t) =>
          t.status?.toUpperCase() === "COMPLETED" ||
          t.status?.toUpperCase() === "SUCCESS"
      ).length +
      transactions.filter((t) => t.status?.toUpperCase() === "PENDING")
        .length +
      transactions.filter(
        (t) =>
          t.status?.toUpperCase() === "FAILED" ||
          t.status?.toUpperCase() === "CANCELLED"
      ).length;

    const completedCount = transactions.filter(
      (t) =>
        t.status?.toUpperCase() === "COMPLETED" ||
        t.status?.toUpperCase() === "SUCCESS"
    ).length;
    const pendingCount = transactions.filter(
      (t) => t.status?.toUpperCase() === "PENDING"
    ).length;
    const failedCount = transactions.filter(
      (t) =>
        t.status?.toUpperCase() === "FAILED" ||
        t.status?.toUpperCase() === "CANCELLED"
    ).length;

    return {
      labels: [
        t("transaction.failed", "Failed"),
        t("transaction.pending", "Pending"),
        t("transaction.completed", "Completed"),
      ],
      data: [
        totalCount > 0 ? failedCount / totalCount : 0,
        totalCount > 0 ? pendingCount / totalCount : 0,
        totalCount > 0 ? completedCount / totalCount : 0,
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

    const months = Object.keys(monthlyData).sort((a, b) => Number(a) - Number(b));
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

  const totalRevenue = transactions
    .filter(
      (t) =>
        t.status?.toUpperCase() === "COMPLETED" ||
        t.status?.toUpperCase() === "SUCCESS"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const completedCount = transactions.filter(
    (t) =>
      t.status?.toUpperCase() === "COMPLETED" ||
      t.status?.toUpperCase() === "SUCCESS"
  ).length;

  const pendingCount = transactions.filter(
    (t) => t.status?.toUpperCase() === "PENDING"
  ).length;

  const failedCount = transactions.filter(
    (t) =>
      t.status?.toUpperCase() === "FAILED" ||
      t.status?.toUpperCase() === "CANCELLED"
  ).length;

  const quickActions = [
    {
      icon: "wallet",
      label: "Rút tiền",
      subtitle: "Chuyển khoản ngay",
      accent: "#FF914D",
      onPress: () => navigation?.navigate?.("WithdrawScreen"),
    },
    {
      icon: "calendar",
      label: "Lịch tập",
      subtitle: "Quản lý buổi tập",
      accent: "#2196F3",
      onPress: () => navigation?.navigate?.("ScheduleScreen"),
    },
    {
      icon: "bar-chart",
      label: "Báo cáo",
      subtitle: "Theo dõi hiệu suất",
      accent: "#8E54E9",
      onPress: () => {},
    },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
      loadTodaySessions();
      fetchMonthLyRevenue();
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const response = await transactionService.getTransactions({
        page: 1,
        size: 100,
      });
      if (response.data && response.data.items) {
        setTransactions(response.data.items);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    }
  };

  const fetchMonthLyRevenue = async () => {
    try {
      const response = await dashBoardService.getRevenueDetail();
      const data = response.data;

      // Process the revenue data
      let totalRevenue = 0;
      let totalProfit = 0;
      let totalSystemProfit = 0;

      if (data && data.items && Array.isArray(data.items)) {
        // Calculate total revenue from items
        data.items.forEach((item) => {
          totalProfit += item.totalProfit || 0;
          totalSystemProfit += item.systemProfit || 0;
        });

        // Total revenue is the sum of profit and system profit (or just profit, depending on business logic)
        // Using totalProfit as the trainer's revenue
        totalRevenue = totalProfit;
      }

      // Set the processed monthly revenue data
      setMonthLyRevenue({
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
        totalSystemProfit: totalSystemProfit,
        totalItems: data?.total || 0,
        items: data?.items || [],
        compareWithLastMonth: data?.compareWithLastMonth || null, // If API provides this
      });
    } catch (error) {
      console.error("Error fetching month ly revenue:", error);
      setMonthLyRevenue({
        totalRevenue: 0,
        totalProfit: 0,
        totalSystemProfit: 0,
        totalItems: 0,
        items: [],
        compareWithLastMonth: null,
      });
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await dashBoardService.getWalletBalance();
      setAvailableBalance(response.data.totalAvailableBalance);
      setPendingBalance(response.data.totalPendingBalance);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      Alert.alert("Error", "Failed to fetch wallet data");
    }
  };

  const loadTodaySessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await accountService.getBookingForPT({
        // date: formatDateForAPI(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        date: formatDateForAPI(new Date()),
      });
      setTodaySessions(response.data.items || []);
      console.log("Today's sessions:", response.data.items || []);
    } catch (error) {
      console.error("Error loading today's sessions:", error);
      setTodaySessions([]);
    } finally {
      setTimeout(() => {
        setLoadingSessions(false);
      }, 2000);
    }
  };

  // Format currency to Vietnamese Dong
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
  };

  const summaryFinancialStats = [
    {
      id: "availableBalance",
      label: "Số dư khả dụng",
      value: formatCurrency(availableBalance || 0),
      helper: "Có thể rút ngay",
      icon: "wallet",
      accent: "#FF914D",
      variant: "wide",
    },
    {
      id: "pendingBalance",
      label: "Số dư chờ xử lý",
      value: formatCurrency(pendingBalance || 0),
      helper: "Đang chờ thanh toán",
      icon: "timer-outline",
      accent: "#ED2A46",
      variant: "wide",
    },
  ];

  const summaryPerformanceStats = [
    {
      id: "todaySessions",
      label: "Buổi hôm nay",
      value: mockedDataDashboard[0]?.todaySessions || 0,
      helper: "Đã xác nhận",
      icon: "calendar-outline",
      accent: "#2196F3",
      variant: "compact",
    },
    {
      id: "pendingBookingRequests",
      label: "Yêu cầu chờ",
      value: mockedDataDashboard[0]?.pendingBookingRequests || 0,
      helper: "Cần phản hồi",
      icon: "notifications-outline",
      accent: "#FFB703",
      variant: "compact",
    },
    {
      id: "completionRate",
      label: "Hoàn thành",
      value: mockedDataDashboard[0]?.completionRate || 0,
      suffix: "%",
      helper: "Mục tiêu 90%",
      icon: "checkmark-circle-outline",
      accent: "#4CAF50",
      variant: "compact",
    },
    {
      id: "rating",
      label: "Đánh giá",
      value: (mockedDataDashboard[0]?.rating || 0).toFixed(1),
      suffix: "/5",
      helper: "Từ học viên",
      icon: "star-outline",
      accent: "#F7B801",
      variant: "compact",
    },
  ];

  // Parse comparison percentage and determine if it's growth or decline
  const parseComparison = (compareValue) => {
    if (!compareValue) return { displayText: null, isGrowth: false };
    const percentage = parseFloat(compareValue.replace("%", ""));
    const isGrowth = percentage >= 100;

    let displayText;
    if (isGrowth) {
      const growth = percentage - 100;
      displayText = `${growth}%`;
    } else {
      const decline = 100 - percentage;
      displayText = `${decline}%`;
    }

    return {
      displayText,
      isGrowth,
      value: percentage,
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchWalletData(),
      loadTodaySessions(),
      fetchMonthLyRevenue(),
      loadTransactions(),
    ]).finally(() => setRefreshing(false));
  };

  // Render Revenue Comparison Info
  const renderRevenueComparison = (compareToLastMonth) => {
    if (!compareToLastMonth) return null;

    const comparison = parseComparison(compareToLastMonth);
    const chartColor = comparison.isGrowth ? "#4CAF50" : "#F44336";

    return (
      <View style={styles.revenueComparisonContainer}>
        <View style={styles.comparisonInfoContainer}>
          <Text style={styles.comparisonLabel}>vs Tháng trước</Text>
          <View style={styles.comparisonTextContainer}>
            <Icon
              name={comparison.isGrowth ? "trending-up" : "trending-down"}
              size={16}
              color={chartColor}
              style={{ marginLeft: 6 }}
            />
            <Text
              style={[
                styles.comparisonDisplayText,
                comparison.isGrowth
                  ? styles.comparisonDisplayTextUp
                  : styles.comparisonDisplayTextDown,
              ]}
            >
              {comparison.displayText}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Comparison Badge for Secondary Packages
  const renderComparisonBadge = (compareToLastMonth) => {
    if (!compareToLastMonth) return null;

    const comparison = parseComparison(compareToLastMonth);
    const badgeColor = comparison.isGrowth ? "#4CAF50" : "#F44336";
    const backgroundColor = comparison.isGrowth
      ? "rgba(76, 175, 80, 0.1)"
      : "rgba(244, 67, 54, 0.1)";

    return (
      <View style={[styles.comparisonContainer, { backgroundColor }]}>
        <Icon
          name={comparison.isGrowth ? "trending-up" : "trending-down"}
          size={10}
          color={badgeColor}
          style={{ marginRight: 4 }}
        />
        <Text
          style={[
            styles.comparisonText,
            comparison.isGrowth
              ? styles.comparisonTextUp
              : styles.comparisonTextDown,
          ]}
        >
          {comparison.displayText}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserFromStorage();
      if (userData) {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.screen}>
      {/* Scroll content is full-screen and scrolls UNDER the header */}
      <DashboardHeader user={user} />

      <ScrollView
        style={styles.container}
        bounces={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* <QuickActions actions={quickActions} /> */}
        {/* <View style={styles.summaryContainer}> */}
        <SummarySection
          summaryFinancialStats={summaryFinancialStats}
          summaryPerformanceStats={summaryPerformanceStats}
          formatCurrency={formatCurrency}
          monthLyRevenue={monthLyRevenue}
          renderRevenueComparison={renderRevenueComparison}
          onRefresh={onRefresh}
        />

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
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#ED2A46"
                    />
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
                {t(
                  "transaction.amountInThousands",
                  "Amount in thousands (VND)"
                )}
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

        <UpcomingSessions sessions={todaySessions} loading={loadingSessions} />

        {/* <BestsellerPackages
          formatCurrency={formatCurrency}
          renderRevenueComparison={renderRevenueComparison}
          renderComparisonBadge={renderComparisonBadge}
        /> */}
        {/* </View> */}
      </ScrollView>

      {/* Header stays fixed on top */}

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
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color="#E0E0E0"
                  />
                  <Text style={styles.emptyYearText}>
                    {t("dashboard.noYearsAvailable", "No years available")}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.selectedCountText}>
                {displayMode === "month"
                  ? `${selectedYears.length} ${t("dashboard.yearSelected", "year selected")}`
                  : `${selectedYears.length} / 3 ${t("dashboard.yearsSelected", "years selected")}`}
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
              {t(
                "dashboard.chooseMonth",
                "Choose a month to view weekly data"
              )}
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
              <TouchableOpacity
                onPress={() => setShowDisplayModeModal(false)}
              >
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
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4CAF50"
                  />
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
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4CAF50"
                  />
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
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    // zIndex: 1000,
  },
  container: {
    flex: 1,
    zIndex: 2,
    // paddingTop: Dimensions.get("window").height * 0.22, // space under the header
    // paddingBottom: Dimensions.get("window").height * 0.1,
  },
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  comparisonInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  comparisonLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 4,
  },
  comparisonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  comparisonDisplayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  comparisonDisplayTextUp: {
    color: "#4CAF50",
  },
  comparisonDisplayTextDown: {
    color: "#F44336",
  },
  comparisonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comparisonText: {
    fontSize: 9,
    fontWeight: "700",
  },
  comparisonTextUp: {
    color: "#4CAF50",
  },
  comparisonTextDown: {
    color: "#F44336",
  },
  // Charts Styles
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

export default FreelancePTDashboard;
