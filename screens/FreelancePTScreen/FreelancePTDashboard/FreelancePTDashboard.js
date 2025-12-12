import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Dimensions,
} from "react-native";
import { fetchUserFromStorage, formatDateForAPI } from "../../../lib";
import { mockedDataDashboard } from "./mockedDataDashboard";
import Icon from "react-native-vector-icons/Ionicons";
import DashboardHeader from "./DashboardHeader";
import QuickActions from "./QuickActions";
import SummarySection from "./SummarySection";
import UpcomingSessions from "./UpcomingSessions";
import BestsellerPackages from "./BestsellerPackages";
import dashBoardService from "../../../services/dashBoardService";
import { useFocusEffect } from "@react-navigation/native";
import accountService from "../../../services/accountService";

const FreelancePTDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

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
    }, [])
  );

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
        date: formatDateForAPI(new Date()),
      });
      setTodaySessions(response.data.items || []);
    } catch (error) {
      console.error("Error loading today's sessions:", error);
      setTodaySessions([]);
    } finally {
      setLoadingSessions(false);
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
          renderRevenueComparison={renderRevenueComparison}
          onRefresh={onRefresh}
        />

        <UpcomingSessions sessions={todaySessions} loading={loadingSessions} />

        <BestsellerPackages
          formatCurrency={formatCurrency}
          renderRevenueComparison={renderRevenueComparison}
          renderComparisonBadge={renderComparisonBadge}
        />
        {/* </View> */}
      </ScrollView>

      {/* Header stays fixed on top */}
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
});

export default FreelancePTDashboard;
