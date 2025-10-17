import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";

const ProgressCircle = ({
  percentage,
  label,
  value,
  color = colors.orange,
}) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressCircleContainer}>
      <View style={styles.circleWrapper}>
        <View style={styles.circleBackground}>
          <View style={[styles.circleProgress, { borderColor: color }]}>
            <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
          </View>
        </View>
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressValue}>{value}</Text>
    </View>
  );
};

export default function BookingResultCard({ result }) {
  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="stats-chart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có kết quả tập luyện</Text>
      </View>
    );
  }

  const {
    bookingName,
    bookingDate,
    startTime,
    endTime,
    actualStartTime,
    actualEndTime,
    setsPlan,
    setsCompleted,
    restTime,
    repsProgress,
    weightLiftedProgress,
    practiceTimeProgress,
    nutritionTip,
    notes,
    ptName,
    ptAvatarUrl,
  } = result;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerIcon}>
          <Ionicons name="trophy" size={28} color={colors.orange} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Kết quả tập luyện</Text>
          <Text style={styles.headerSubtitle}>{bookingName}</Text>
        </View>
      </View>

      {/* Time Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>Thời gian</Text>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Ngày tập</Text>
            <Text style={styles.timeValue}>{bookingDate}</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Dự kiến</Text>
            <Text style={styles.timeValue}>
              {startTime?.substring(0, 5)} - {endTime?.substring(0, 5)}
            </Text>
          </View>
        </View>
        {(actualStartTime || actualEndTime) && (
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Thực tế</Text>
              <Text style={styles.timeValue}>
                {actualStartTime?.substring(0, 5) || "--:--"} -{" "}
                {actualEndTime?.substring(0, 5) || "--:--"}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Sets Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="repeat-outline" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>Tổng quan</Text>
        </View>
        <View style={styles.setsContainer}>
          <View style={styles.setItem}>
            <Text style={styles.setLabel}>Số set đã hoàn thành</Text>
            <View style={styles.setValueContainer}>
              <Text style={styles.setValueCompleted}>{setsCompleted}</Text>
              <Text style={styles.setValueSeparator}>/</Text>
              <Text style={styles.setValuePlan}>{setsPlan}</Text>
            </View>
          </View>
          {restTime > 0 && (
            <View style={styles.setItem}>
              <Text style={styles.setLabel}>Thời gian nghỉ</Text>
              <Text style={styles.restTimeValue}>{restTime} phút</Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>Tiến độ tập luyện</Text>
        </View>
        <View style={styles.progressGrid}>
          {repsProgress && (
            <ProgressCircle
              percentage={repsProgress.repsProgressPercentage}
              label="Số reps đã thực hiện"
              value={`${repsProgress.repsCompleted}/ ${repsProgress.repsPlan} reps`}
              color="#FF6B9D"
            />
          )}
          {weightLiftedProgress && (
            <ProgressCircle
              percentage={weightLiftedProgress.weightLiftedProgressPercentage}
              label="Số cân nặng đã thực hiện"
              value={`${weightLiftedProgress.weightLiftedCompleted.toLocaleString()}/ ${weightLiftedProgress.weightLiftedPlan.toLocaleString()} kg`}
              color="#7C3AED"
            />
          )}
          {practiceTimeProgress && (
            <ProgressCircle
              percentage={practiceTimeProgress.practiceTimeProgressPercentage}
              label="Thời gian thực hiện"
              value={`${practiceTimeProgress.practiceTimeCompleted}/ ${practiceTimeProgress.practiceTimePlan} phút`}
              color="#3B82F6"
            />
          )}
        </View>
      </View>

      {/* PT Info */}
      {ptName && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.orange} />
            <Text style={styles.cardTitle}>Huấn luyện viên</Text>
          </View>
          <View style={styles.ptContainer}>
            {ptAvatarUrl ? (
              <Image source={{ uri: ptAvatarUrl }} style={styles.ptAvatar} />
            ) : (
              <View style={[styles.ptAvatar, styles.ptAvatarPlaceholder]}>
                <Ionicons name="person" size={24} color="#94A3B8" />
              </View>
            )}
            <Text style={styles.ptName}>{ptName}</Text>
          </View>
        </View>
      )}

      {/* Notes */}
      {notes && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.orange}
            />
            <Text style={styles.cardTitle}>Ghi chú</Text>
          </View>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {/* Nutrition Tip */}
      {nutritionTip && (
        <View style={[styles.card, styles.nutritionCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="nutrition-outline" size={20} color="#10B981" />
            <Text style={[styles.cardTitle, { color: "#10B981" }]}>
              Lời khuyên dinh dưỡng
            </Text>
          </View>
          <Text style={styles.nutritionText}>{nutritionTip}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timeValue: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
  setsContainer: {
    gap: 16,
  },
  setItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  setValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  setValueCompleted: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.orange,
  },
  setValueSeparator: {
    fontSize: 18,
    color: "#CBD5E1",
    marginHorizontal: 4,
  },
  setValuePlan: {
    fontSize: 18,
    color: "#94A3B8",
    fontWeight: "600",
  },
  restTimeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  progressCircleContainer: {
    alignItems: "center",
    width: "30%",
    minWidth: 100,
  },
  circleWrapper: {
    marginBottom: 12,
  },
  circleBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  circleProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 13,
    color: "#1E293B",
    textAlign: "center",
    fontWeight: "700",
  },
  ptContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ptAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  ptAvatarPlaceholder: {
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  ptName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  notesText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  nutritionCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  nutritionText: {
    fontSize: 14,
    color: "#166534",
    lineHeight: 22,
    fontWeight: "500",
  },
});
