import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFitnessContext } from "../../../context/FitnessContext";
import { useTranslation } from "../../../hooks/useTranslation";

const FitnessDetailScreen = () => {
  const { t } = useTranslation();
  const {
    fitnessData,
    isLoading,
    refreshData,
    startTracking,
    stopTracking,
    getFitnessStatistics,
    forceRefresh,
    saveTodayData,
  } = useFitnessContext();

  const [selectedPeriod, setSelectedPeriod] = useState("daily"); // daily, weekly, monthly
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load comprehensive statistics on mount and when period changes
  useEffect(() => {
    loadComprehensiveStats();
  }, []);

  const loadComprehensiveStats = async () => {
    try {
      setLoadingStats(true);
      console.log("Loading comprehensive fitness statistics...");

      const stats = await getFitnessStatistics();
      // console.log(
      //   "Received fitness statistics:",
      //   JSON.stringify(stats, null, 2)
      // );

      // if (stats) {
      //   console.log("Weekly data length:", stats.weekly?.data?.length);
      //   console.log("Monthly data length:", stats.monthly?.data?.length);
      //   console.log("Weekly data sample:", stats.weekly?.data?.slice(-3)); // Last 3 days
      //   console.log("Monthly data sample:", stats.monthly?.data?.slice(-7)); // Last 7 days
      // }

      setStatistics(stats);
    } catch (err) {
      console.error("Error loading comprehensive statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      await loadComprehensiveStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Force refresh initiated...");
      await forceRefresh();
      await loadComprehensiveStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleTracking = () => {
    Alert.alert(
      t("fitness.fitnessTracking"),
      fitnessData.isTracking
        ? t("fitness.pauseStepTracking")
        : t("fitness.startStepTracking"),
      [
        {
          text: t("fitness.cancel"),
          style: "cancel",
        },
        {
          text: fitnessData.isTracking
            ? t("fitness.pause")
            : t("fitness.start"),
          onPress: () => {
            if (fitnessData.isTracking) {
              stopTracking();
            } else {
              startTracking();
            }
          },
        },
      ]
    );
  };

  const handleSaveNow = async () => {
    try {
      setRefreshing(true);
      await saveTodayData();
      Alert.alert(
        "✅ Success",
        "Today's fitness data has been saved to history!",
        [{ text: "OK" }]
      );
      await loadComprehensiveStats();
    } catch (error) {
      Alert.alert("❌ Error", "Failed to save data: " + error.message, [
        { text: "OK" },
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {["daily", "weekly", "monthly"].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {t(`fitness.${period}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCurrentStats = () => {
    if (!statistics) return null;

    let data, title;

    switch (selectedPeriod) {
      case "weekly":
        data = statistics.weekly.totals;
        title = t("fitness.thisWeek");
        break;
      case "monthly":
        data = statistics.monthly.totals;
        title = t("fitness.thisMonth");
        break;
      default:
        data = statistics.today;
        title = t("fitness.today");
    }

    return (
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="walk-outline" size={32} color="#34C759" />
            </View>
            <Text style={styles.statValue}>{data.steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t("fitness.steps")}</Text>
            {selectedPeriod === "daily" && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(statistics.goals.progress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {statistics.goals.progress.toFixed(1)}% of{" "}
                  {statistics.goals.dailyStepGoal.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="location-outline" size={32} color="#FF9500" />
            </View>
            <Text style={styles.statValue}>
              {typeof data.distance === "number"
                ? data.distance.toFixed(1)
                : "0.0"}
            </Text>
            <Text style={styles.statLabel}>{t("fitness.kilometers")}</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.statValue}>{data.calories || 0}</Text>
            <Text style={styles.statLabel}>{t("fitness.calories")}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAverageStats = () => {
    if (selectedPeriod === "daily" || !statistics) return null;

    const averageData =
      selectedPeriod === "weekly"
        ? statistics.weekly.average
        : statistics.monthly.average;
    const periodText =
      selectedPeriod === "weekly"
        ? t("fitness.dailyAverageWeek")
        : t("fitness.dailyAverageMonth");

    return (
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>{periodText}</Text>
        <View style={styles.averageStats}>
          <View style={styles.averageItem}>
            <Ionicons name="walk-outline" size={20} color="#34C759" />
            <Text style={styles.averageValue}>
              {averageData.steps.toLocaleString()}
            </Text>
            <Text style={styles.averageLabel}>{t("fitness.stepsPerDay")}</Text>
          </View>
          <View style={styles.averageItem}>
            <Ionicons name="location-outline" size={20} color="#FF9500" />
            <Text style={styles.averageValue}>{averageData.distance} km</Text>
            <Text style={styles.averageLabel}>
              {t("fitness.distancePerDay")}
            </Text>
          </View>
          <View style={styles.averageItem}>
            <Ionicons name="flame-outline" size={20} color="#FF3B30" />
            <Text style={styles.averageValue}>{averageData.calories}</Text>
            <Text style={styles.averageLabel}>
              {t("fitness.caloriesPerDay")}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHistoryChart = () => {
    if (!statistics) return null;

    const data =
      selectedPeriod === "weekly"
        ? statistics.weekly.data
        : statistics.monthly.data;
    if (!data || data.length === 0) return null;

    const maxSteps = Math.max(...data.map((d) => d.steps || 0));

    return (
      <View style={styles.historyCard}>
        <Text style={styles.cardTitle}>
          {selectedPeriod === "weekly"
            ? t("fitness.last7Days")
            : t("fitness.last30Days")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartScroll}
        >
          <View style={styles.chart}>
            {data.map((day, index) => {
              const height = maxSteps > 0 ? (day.steps / maxSteps) * 100 : 0;
              const dayLabel =
                day.day ||
                (selectedPeriod === "weekly"
                  ? new Date(day.date).toLocaleDateString("en", {
                      weekday: "short",
                    })
                  : new Date(day.date).getDate().toString());

              return (
                <TouchableOpacity key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(height, 2),
                          backgroundColor:
                            day.steps > 0 ? "#34C759" : "#E5E5EA",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{dayLabel}</Text>
                  <Text style={styles.barValue}>{day.steps || 0}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // New method to render streak and achievement analytics
  const renderStreakAnalytics = () => {
    if (!statistics || selectedPeriod !== "daily") return null;

    const bestWeekDay = statistics.weekly.best;
    const bestMonthDay = statistics.monthly.best;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>{t("fitness.achievements")}</Text>

        {/* Streak Information */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>{t("fitness.streaks")}</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="flame" size={24} color="#FF6B35" />
              </View>
              <Text style={styles.streakValue}>
                {statistics.streaks.current}
              </Text>
              <Text style={styles.streakLabel}>
                {t("fitness.currentStreak")}
              </Text>
            </View>
            <View style={styles.streakItem}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <Text style={styles.streakValue}>
                {statistics.streaks.longest}
              </Text>
              <Text style={styles.streakLabel}>
                {t("fitness.longestStreak")}
              </Text>
            </View>
          </View>
        </View>

        {/* Best Performance */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>
            {t("fitness.bestPerformance")}
          </Text>
          <View style={styles.bestPerformanceContainer}>
            <View style={styles.bestPerformanceItem}>
              <Text style={styles.bestPeriodLabel}>
                {t("fitness.thisWeek")}
              </Text>
              <Text style={styles.bestValue}>
                {bestWeekDay.steps?.toLocaleString() || 0}
              </Text>
              <Text style={styles.bestLabel}>
                {t("fitness.steps")} • {bestWeekDay.day}
              </Text>
            </View>
            <View style={styles.bestPerformanceItem}>
              <Text style={styles.bestPeriodLabel}>
                {t("fitness.thisMonth")}
              </Text>
              <Text style={styles.bestValue}>
                {bestMonthDay.steps?.toLocaleString() || 0}
              </Text>
              <Text style={styles.bestLabel}>
                {t("fitness.steps")} • Day {bestMonthDay.day}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading || loadingStats) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {t("fitness.loadingFitnessData")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <ActivityIndicator
            animating={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {renderPeriodSelector()}
        {renderCurrentStats()}
        {renderAverageStats()}
        {renderHistoryChart()}
        {renderStreakAnalytics()}

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#007AFF"
            />
            <Text style={styles.statusTitle}>
              {t("fitness.trackingStatus")}
            </Text>
          </View>
          <View style={styles.statusContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t("fitness.status")}:</Text>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: fitnessData.isTracking
                        ? "#34C759"
                        : "#FF9500",
                    },
                  ]}
                />
                <Text style={styles.statusValue}>
                  {fitnessData.isTracking
                    ? t("fitness.active")
                    : t("fitness.paused")}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                {t("fitness.lastUpdated")}:
              </Text>
              <Text style={styles.statusValue}>
                {new Date().toLocaleTimeString()}
              </Text>
            </View>

            {/* Tracking Control Buttons */}
            <View style={styles.trackingControlRow}>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  onPress={handleToggleTracking}
                  style={[
                    styles.trackingButton,
                    styles.primaryButton,
                    {
                      backgroundColor: fitnessData.isTracking
                        ? "#FF3B30"
                        : "#34C759",
                    },
                  ]}
                >
                  <Ionicons
                    name={fitnessData.isTracking ? "pause" : "play"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.trackingButtonText}>
                    {fitnessData.isTracking
                      ? t("fitness.pause")
                      : t("fitness.start")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForceRefresh}
                  style={[
                    styles.trackingButton,
                    styles.secondaryButton,
                    { backgroundColor: "#007AFF" },
                  ]}
                  disabled={refreshing}
                >
                  <Ionicons
                    name={refreshing ? "hourglass-outline" : "refresh"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.trackingButtonText}>
                    {refreshing ? "Refreshing..." : t("fitness.forceRefresh")}
                  </Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  onPress={handleSaveNow}
                  style={[
                    styles.trackingButton,
                    styles.secondaryButton,
                    { backgroundColor: "#FF9500" },
                  ]}
                  disabled={refreshing}
                >
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.trackingButtonText}>Save Now</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </View>

        {/* Motion & Fitness Data Source Disclosure - iOS Only */}
        {Platform.OS === "ios" && (
          <View style={styles.healthKitDisclosure}>
            <View style={styles.healthKitHeader}>
              <Ionicons name="walk-outline" size={20} color="#34C759" />
              <Text style={styles.healthKitTitle}>
                {t("fitness.dataSource")}
              </Text>
            </View>
            <Text style={styles.healthKitDescription}>
              {t("fitness.motionFitnessDescription")}
            </Text>
            <View style={styles.healthKitBadge}>
              <Ionicons name="fitness-outline" size={16} color="#34C759" />
              <Text style={styles.healthKitBadgeText}>
                {t("fitness.motionAndFitness")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  periodButtonTextActive: {
    color: "#1C1C1E",
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 20,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  progressContainer: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  averageStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  averageItem: {
    alignItems: "center",
    flex: 1,
  },
  averageValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 4,
  },
  averageLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartScroll: {
    marginTop: 10,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 10,
  },
  chartBar: {
    alignItems: "center",
    marginHorizontal: 2,
    minWidth: 30,
  },
  barContainer: {
    height: 80,
    justifyContent: "flex-end",
    width: 20,
  },
  bar: {
    width: 20,
    backgroundColor: "#34C759",
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 4,
  },
  barValue: {
    fontSize: 8,
    color: "#8E8E93",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  statusContent: {
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  trackingControlRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    flexWrap: "wrap",
  },
  trackingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 100,
    justifyContent: "center",
  },
  primaryButton: {
    flex: 1,
    maxWidth: 130,
  },
  secondaryButton: {
    flex: 0,
    minWidth: 90,
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 16,
  },
  // New styles for streak analytics
  achievementSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
    textAlign: "center",
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  streakItem: {
    alignItems: "center",
    flex: 1,
  },
  streakIconContainer: {
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    textAlign: "center",
  },
  bestPerformanceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bestPerformanceItem: {
    alignItems: "center",
    flex: 1,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bestPeriodLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    marginBottom: 4,
  },
  bestValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 2,
  },
  bestLabel: {
    fontSize: 10,
    color: "#8E8E93",
    textAlign: "center",
  },
  // HealthKit Disclosure Styles
  healthKitDisclosure: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  healthKitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  healthKitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  healthKitDescription: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 20,
    marginBottom: 16,
  },
  healthKitBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  healthKitBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 6,
  },
});

export default FitnessDetailScreen;
