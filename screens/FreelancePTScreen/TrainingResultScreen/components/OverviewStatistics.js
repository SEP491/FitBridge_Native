import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const OverviewStatistics = ({ stats, t, StatCard }) => {
  // Calculate progress percentage for circular indicators
  const sessionProgress =
    (stats.completedSessions / stats.totalSessions) * 100 || 0;
  const activityProgress =
    (stats.completedActivitySets / stats.totalActivitySets) * 100 || 0;

  // Function to get color based on percentage for Session Completion (Orange tones)
  const getSessionColorByPercentage = (percentage) => {
    if (percentage >= 80) return "#FF6F00"; // Dark Orange - Excellent
    if (percentage >= 60) return "#FF8F00"; // Medium Orange - Good
    if (percentage >= 40) return "#FFA726"; // Light Orange - Average
    if (percentage >= 20) return "#FFB74D"; // Pale Orange - Below Average
    return "#FFCC80"; // Very Pale Orange - Poor
  };

  // Function to get color based on percentage for Activity Completion (Green tones)
  const getActivityColorByPercentage = (percentage) => {
    if (percentage >= 80) return "#2E7D32"; // Dark Green - Excellent
    if (percentage >= 60) return "#43A047"; // Medium Green - Good
    if (percentage >= 40) return "#66BB6A"; // Light Green - Average
    if (percentage >= 20) return "#81C784"; // Pale Green - Below Average
    return "#A5D6A7"; // Very Pale Green - Poor
  };

  // Colors for the two progress rings
  const sessionColor = getSessionColorByPercentage(stats.completionRate || 0);
  const activityColor = getActivityColorByPercentage(
    stats.activityCompletionRate || 0
  );

  // Prepare data for ProgressChart
  const progressChartData = {
    labels: [
      t("trainingResults.activities", "Activities"),
      t("trainingResults.sessions", "Sessions"),
    ],
    data: [
      (stats.activityCompletionRate || 0) / 100,
      (stats.completionRate || 0) / 100,
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1, index) => {
      // Use different colors for each ring based on index
      // Index 0 = Activities (Green), Index 1 = Sessions (Orange)
      const colors = [activityColor, sessionColor];
      const selectedColor = colors[index] || activityColor;

      const hex = selectedColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // Progress Bar Component
  const ProgressBar = ({
    current,
    total,
    label,
    useAutoColor = true,
    color,
    icon,
    ringType = "session",
  }) => {
    const percentage = (current / total) * 100 || 0;

    let finalColor;
    if (useAutoColor) {
      // Use different color functions based on ring type
      finalColor =
        ringType === "session"
          ? getSessionColorByPercentage(percentage)
          : getActivityColorByPercentage(percentage);
    } else {
      finalColor = color || "#ED2A46";
    }

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <View style={styles.progressBarLabelContainer}>
            {icon && <Ionicons name={icon} size={16} color="#666" />}
            <Text style={styles.progressBarLabel}>{label}</Text>
          </View>
          <Text style={styles.progressBarValue}>
            {current}/{total}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: finalColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressBarPercentage, { color: finalColor }]}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
    );
  };

  return (
    <StatCard title={t("trainingResults.overview")} icon="stats-chart">
      {/* Progress Chart from react-native-chart-kit */}
      <View style={styles.progressChartContainer}>
        <ProgressChart
          data={progressChartData}
          width={SCREEN_WIDTH * 0.4}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={true}
          style={styles.progressChart}
        />
        {/* Legend with percentages */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: sessionColor }]}
            />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>
                {t("trainingResults.completionRate", "Session Completion")}
              </Text>
              <Text style={[styles.legendValue, { color: sessionColor }]}>
                {(stats.completionRate || 0).toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: activityColor }]}
            />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>
                {t("trainingResults.activityRate", "Activity Completion")}
              </Text>
              <Text style={[styles.legendValue, { color: activityColor }]}>
                {(stats.activityCompletionRate || 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Progress Bars */}
      <View style={styles.progressBarsSection}>
        <ProgressBar
          current={stats.completedSessions}
          total={stats.totalSessions}
          label={t("trainingResults.completedSessions", "Sessions Completed")}
          useAutoColor={true}
          ringType="session"
          icon="calendar"
        />

        <ProgressBar
          current={stats.completedActivitySets}
          total={stats.totalActivitySets}
          label={t(
            "trainingResults.completedActivitySets",
            "Activity Sets Completed"
          )}
          useAutoColor={true}
          ringType="activity"
          icon="checkmark-circle"
        />

        {stats.upcomingSessions > 0 && (
          <ProgressBar
            current={stats.upcomingSessions}
            total={stats.totalSessions}
            label={t("trainingResults.upcomingSessions", "Upcoming Sessions")}
            useAutoColor={false}
            color="#2196F3"
            icon="time"
          />
        )}

        {stats.cancelledSessions > 0 && (
          <ProgressBar
            current={stats.cancelledSessions}
            total={stats.totalSessions}
            label={t("trainingResults.cancelledSessions", "Cancelled Sessions")}
            useAutoColor={false}
            color="#F44336"
            icon="close-circle"
          />
        )}
      </View>
    </StatCard>
  );
};

const styles = StyleSheet.create({
  // Progress Chart Styles
  progressChartContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    display: "flex",
    paddingHorizontal: 15,
  },
  progressChart: {
    borderRadius: 16,
  },

  // Legend Styles
  legendContainer: {
    flexDirection: "column",
    justifyContent: "center",
    width: SCREEN_WIDTH * 0.35,
    gap: 16,
  },
  legendItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    gap: 10,
    maxHeight: SCREEN_WIDTH * 0.18,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 16,
    fontWeight: "bold",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  // Progress Bars Section
  progressBarsSection: {
    gap: 16,
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBarLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressBarLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  progressBarValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "bold",
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#ED2A46",
  },
  progressBarPercentage: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    fontWeight: "500",
  },
});
