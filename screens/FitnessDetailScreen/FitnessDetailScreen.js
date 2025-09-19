import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFitnessContext } from "../../context/FitnessContext";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const FitnessDetailScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    fitnessData,
    isLoading,
    error,
    weeklyData,
    monthlyData,
    weeklyTotals,
    monthlyTotals,
    weeklyAverage,
    monthlyAverage,
    stepGoalProgress,
    refreshData,
    startTracking,
    stopTracking,
  } = useFitnessContext();

  const [selectedPeriod, setSelectedPeriod] = useState("daily"); // daily, weekly, monthly
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
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
    let data, title;

    switch (selectedPeriod) {
      case "weekly":
        data = weeklyTotals;
        title = t("fitness.thisWeek");
        break;
      case "monthly":
        data = monthlyTotals;
        title = t("fitness.thisMonth");
        break;
      default:
        data = fitnessData;
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
                      { width: `${Math.min(stepGoalProgress.progress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {stepGoalProgress.progress}% of{" "}
                  {stepGoalProgress.goal.toLocaleString()}
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
    if (selectedPeriod === "daily") return null;

    const averageData =
      selectedPeriod === "weekly" ? weeklyAverage : monthlyAverage;
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
    const data = selectedPeriod === "weekly" ? weeklyData : monthlyData;
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
              const date = new Date(day.date);
              const dayLabel =
                selectedPeriod === "weekly"
                  ? date.toLocaleDateString("en", { weekday: "short" })
                  : date.getDate().toString();

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

  if (isLoading) {
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

            {/* Tracking Control Button */}
            <View style={styles.trackingControlRow}>
              <TouchableOpacity
                onPress={handleToggleTracking}
                style={[
                  styles.trackingButton,
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
            </View>
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
    alignItems: "center",
  },
  trackingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
});

export default FitnessDetailScreen;
