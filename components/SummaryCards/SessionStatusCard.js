import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { PieChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  labelColor: () => "#333",
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

const SessionStatusCard = ({ sessionReport }) => {
  const report = sessionReport || {};
  const totalSessions = report.totalSessions || 1;

  const pieChartData = useMemo(
    () => [
      {
        name: "Hoàn thành",
        population: report.completedSessions || 0,
        color: "#4CAF50",
        legendFontColor: "#4CAF50",
        legendFontSize: 12,
      },
      {
        name: "Đã đặt",
        population: report.bookedSessions || 0,
        color: "#2196F3",
        legendFontColor: "#2196F3",
        legendFontSize: 12,
      },
      {
        name: "Hủy",
        population: report.cancelledSessions || 0,
        color: "#F44336",
        legendFontColor: "#F44336",
        legendFontSize: 12,
      },
    ],
    [report.completedSessions, report.bookedSessions, report.cancelledSessions]
  );

  const completionRate = Math.round(
    ((report.completedSessions || 0) / totalSessions) * 100
  );

  return (
    <View style={[styles.summaryCard, styles.sessionChartCard]}>
      <View style={styles.chartCardHeader}>
        <View style={styles.chartIconBubble}>
          <Icon name="pie-chart-outline" size={18} color="#2196F3" />
        </View>
        <Text style={styles.summaryLabel}>Trạng thái buổi tập</Text>
      </View>
      {/* <PieChart
        data={pieChartData}
        width={(SCREEN_WIDTH - 60) / 2}
        height={160}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        hasLegend={false}
      /> */}
      <View style={styles.sessionLegendContainer}>
        {pieChartData.map((item) => (
          <View style={styles.legendItem} key={item.name}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>
              {item.name}: {item.population}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.progressWrapper}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressLabel}>Tỉ lệ hoàn thành</Text>
          <Text style={styles.progressValue}>{completionRate}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${completionRate}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionChartCard: {
    marginLeft: 6,
  },
  chartCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  chartIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8a8a8a",
    marginBottom: 6,
  },
  sessionLegendContainer: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: "#444",
  },
  progressWrapper: {
    marginTop: 12,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#EBEDF0",
    borderRadius: 6,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
});

export default SessionStatusCard;

