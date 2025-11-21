import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ActivityTypeTag = ({ type }) => {
  const activityConfig = {
    WarmUp: { bg: "#FFF7ED", text: "#EA580C", icon: "fire" },
    Resistance: { bg: "#ECFDF5", text: "#059669", icon: "dumbbell" },
    Cardio: { bg: "#EFF6FF", text: "#2563EB", icon: "run" },
    Mobility: { bg: "#F5F3FF", text: "#7C3AED", icon: "yoga" },
    CoolDown: { bg: "#ECFEFF", text: "#06B6D4", icon: "snowflake" },
    Rehab: { bg: "#FEF2F2", text: "#DC2626", icon: "medical-bag" },
  };

  const config = activityConfig[type] || activityConfig.Resistance;

  return (
    <View style={[styles.activityTypeTag, { backgroundColor: config.bg }]}>
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.text}
      />
      <Text style={[styles.activityTypeText, { color: config.text }]}>
        {type}
      </Text>
    </View>
  );
};

export default function BookingResultCard({ result, navigation, Booking }) {
  const { t } = useTranslation();
  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="stats-chart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>
          {t("bookingResultCard.noTrainingResults")}
        </Text>
      </View>
    );
  }
  const customerInfo = { name: Booking.customerName };
  const pkgInfo = { packageName: Booking.packageName };
  const {
    sessionName,
    dateTraining,
    plannedStartTime,
    plannedEndTime,
    actualStartTime,
    actualEndTime,
    sessionTotalSummary,
    activityTypesPerformed,
    activitiesSummary,
    muscleGroupAggregates,
    note,
    nutritionTip,
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
          <Text style={styles.headerTitle}>
            {t("bookingResultCard.trainingResults")}
          </Text>
          <Text style={styles.headerSubtitle}>{sessionName}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (navigation && Booking.customerPurchasedId) {
            navigation.navigate("TrainingResultScreen", {
              customerPurchasedId: Booking.customerPurchasedId,
              customer: customerInfo,
              pkg: pkgInfo,
              activeTab: "userGoal",
            });
          }
        }}
        style={styles.viewDetailsButton}
      >
        <Ionicons name="bar-chart" size={20} color={colors.white} />
        <Text style={styles.viewDetailsButtonText}>
          {t("bookingResultCard.viewTrainingAnalytics")}
        </Text>
      </TouchableOpacity>

      {/* Time Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>{t("bookingResultCard.time")}</Text>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>
              {t("bookingResultCard.trainingDate")}
            </Text>
            <Text style={styles.timeValue}>{dateTraining}</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>
              {t("bookingResultCard.planned")}
            </Text>
            <Text style={styles.timeValue}>
              {plannedStartTime?.substring(0, 5) || "--:--"} -{" "}
              {plannedEndTime?.substring(0, 5) || "--:--"}
            </Text>
          </View>
        </View>
        {(actualStartTime || actualEndTime) && (
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>
                {t("bookingResultCard.actual")}
              </Text>
              <Text style={styles.timeValue}>
                {actualStartTime?.substring(0, 5) || "--:--"} -{" "}
                {actualEndTime?.substring(0, 5) || "--:--"}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Activity Types Performed */}
      {activityTypesPerformed && activityTypesPerformed.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="tag-multiple"
              size={20}
              color={colors.orange}
            />
            <Text style={styles.cardTitle}>
              {t("bookingResultCard.activityTypesPerformed")}
            </Text>
          </View>
          <View style={styles.activityTypesContainer}>
            {activityTypesPerformed.map((type, index) => (
              <ActivityTypeTag key={index} type={type} />
            ))}
          </View>
        </View>
      )}

      {/* Session Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>
            {t("bookingResultCard.sessionOverview")}
          </Text>
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Ionicons name="fitness" size={24} color="#8B5CF6" />
            <Text style={styles.summaryValue}>
              {sessionTotalSummary?.sessionActivityCount || 0}
            </Text>
            <Text style={styles.summaryLabel}>
              {t("bookingResultCard.exercises")}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="repeat" size={24} color="#EC4899" />
            <Text style={styles.summaryValue}>
              {sessionTotalSummary?.totalCompletedSets || 0}/
              {sessionTotalSummary?.plannedSets || 0}
            </Text>
            <Text style={styles.summaryLabel}>
              {t("bookingResultCard.sets")}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="counter" size={24} color="#10B981" />
            <Text style={styles.summaryValue}>
              {sessionTotalSummary?.totalCompletedReps || 0}/
              {sessionTotalSummary?.plannedReps || 0}
            </Text>
            <Text style={styles.summaryLabel}>
              {t("bookingResultCard.reps")}
            </Text>
          </View>
          {sessionTotalSummary?.totalRestTimeSec > 0 && (
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={24}
                color="#F59E0B"
              />
              <Text style={styles.summaryValue}>
                {Math.round(sessionTotalSummary.totalRestTimeSec / 60)}
              </Text>
              <Text style={styles.summaryLabel}>
                {t("bookingResultCard.restMinutes")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={20} color={colors.orange} />
          <Text style={styles.cardTitle}>
            {t("bookingResultCard.completionProgress")}
          </Text>
        </View>

        {/* 3 Separate Progress Charts */}
        <View style={styles.progressChartsRow}>
          {/* Overall Progress */}
          <View style={styles.singleChartContainer}>
            <View style={styles.chartWrapper}>
              <ProgressChart
                data={{
                  data: [
                    (sessionTotalSummary?.completionPercentage || 0) / 100,
                  ],
                }}
                width={110}
                height={110}
                strokeWidth={12}
                radius={40}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
                }}
                hideLegend={true}
                style={styles.singleChart}
              />
              <View style={styles.chartCenterText}>
                <Text
                  style={[styles.chartPercentage, { color: colors.orange }]}
                >
                  {sessionTotalSummary?.completionPercentage || 0}%
                </Text>
              </View>
            </View>
            <Text style={styles.chartLabel}>
              {t("bookingResultCard.overall")}
            </Text>
          </View>

          {/* Sets Progress */}
          <View style={styles.singleChartContainer}>
            <View style={styles.chartWrapper}>
              <ProgressChart
                data={{
                  data: [
                    sessionTotalSummary?.plannedSets > 0
                      ? (sessionTotalSummary?.totalCompletedSets || 0) /
                        sessionTotalSummary.plannedSets
                      : 0,
                  ],
                }}
                width={110}
                height={110}
                strokeWidth={12}
                radius={40}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                }}
                hideLegend={true}
                style={styles.singleChart}
              />
              <View style={styles.chartCenterText}>
                <Text style={[styles.chartPercentage, { color: "#8B5CF6" }]}>
                  {sessionTotalSummary?.plannedSets > 0
                    ? Math.round(
                        ((sessionTotalSummary?.totalCompletedSets || 0) /
                          sessionTotalSummary.plannedSets) *
                          100
                      )
                    : 0}
                  %
                </Text>
              </View>
            </View>
            <Text style={styles.chartLabel}>{t("bookingResultCard.sets")}</Text>
            <Text style={styles.chartSubLabel}>
              {sessionTotalSummary?.totalCompletedSets || 0}/
              {sessionTotalSummary?.plannedSets || 0}
            </Text>
          </View>

          {/* Reps Progress */}
          <View style={styles.singleChartContainer}>
            <View style={styles.chartWrapper}>
              <ProgressChart
                data={{
                  data: [
                    sessionTotalSummary?.plannedReps > 0
                      ? (sessionTotalSummary?.totalCompletedReps || 0) /
                        sessionTotalSummary.plannedReps
                      : 0,
                  ],
                }}
                width={110}
                height={110}
                strokeWidth={12}
                radius={40}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
                }}
                hideLegend={true}
                style={styles.singleChart}
              />
              <View style={styles.chartCenterText}>
                <Text style={[styles.chartPercentage, { color: "#EC4899" }]}>
                  {sessionTotalSummary?.plannedReps > 0
                    ? Math.round(
                        ((sessionTotalSummary?.totalCompletedReps || 0) /
                          sessionTotalSummary.plannedReps) *
                          100
                      )
                    : 0}
                  %
                </Text>
              </View>
            </View>
            <Text style={styles.chartLabel}>{t("bookingResultCard.reps")}</Text>
            <Text style={styles.chartSubLabel}>
              {sessionTotalSummary?.totalCompletedReps || 0}/
              {sessionTotalSummary?.plannedReps || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Muscle Groups Analysis */}
      {muscleGroupAggregates && muscleGroupAggregates.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="arm-flex"
              size={20}
              color={colors.orange}
            />
            <Text style={styles.cardTitle}>
              {t("bookingResultCard.sessionAnalysis")}
            </Text>
          </View>
          {muscleGroupAggregates.map((muscle, index) => (
            <View key={index} style={styles.muscleGroupItem}>
              <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupName}>{muscle.muscleGroup}</Text>
                <Text style={styles.muscleGroupActivities}>
                  {muscle.sessionActivitiesCount}{" "}
                  {t("bookingResultCard.exercisesCount")}
                </Text>
              </View>
              <View style={styles.muscleStatsRow}>
                <View style={styles.muscleStat}>
                  <Text style={styles.muscleStatLabel}>
                    {t("bookingResultCard.sets")}
                  </Text>
                  <Text style={styles.muscleStatValue}>
                    {muscle.totalSetsCompleted}
                  </Text>
                </View>
                <View style={styles.muscleStat}>
                  <Text style={styles.muscleStatLabel}>
                    {t("bookingResultCard.reps")}
                  </Text>
                  <Text style={styles.muscleStatValue}>
                    {muscle.totalRepsCompleted}
                  </Text>
                </View>
                {/* <View style={styles.muscleStat}>
                  <Text style={styles.muscleStatLabel}>Khối lượng</Text>
                  <Text style={styles.muscleStatValue}>
                    {muscle.volumeActualWeightLifted}/
                    {muscle.volumePlannedWeightLifted} kg
                  </Text>
                </View> */}
              </View>
              {muscle.volumePlannedWeightLifted > 0 && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          (muscle.volumeActualWeightLifted /
                            muscle.volumePlannedWeightLifted) *
                            100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Activities Summary */}
      {activitiesSummary && activitiesSummary.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={20} color={colors.orange} />
            <Text style={styles.cardTitle}>
              {t("bookingResultCard.exerciseDetails")}
            </Text>
          </View>
          {activitiesSummary.map((activity, index) => {
            const hasReps = activity.plannedReps > 0;
            const hasTime = activity.plannedPracticeTimeSeconds > 0;
            const hasWeight = activity.heaviestWeightLifted > 0;
            const hasDistance = activity.plannedDistanceMeters > 0;

            return (
              <View
                key={activity.sessionActivityId}
                style={styles.activityItemCompact}
              >
                <View style={styles.activityCompactHeader}>
                  <View style={styles.activityCompactTitleRow}>
                    <Text style={styles.activityCompactName}>
                      {activity.activityName}
                    </Text>
                    <ActivityTypeTag type={activity.activityType} />
                  </View>
                  <Text style={styles.activityCompactMuscle}>
                    {activity.muscleGroup}
                  </Text>
                </View>

                {/* Compact Stats Row */}
                <View style={styles.activityCompactStats}>
                  {/* Sets */}
                  <View style={styles.compactStatItem}>
                    <Ionicons name="repeat" size={14} color="#8B5CF6" />
                    <Text style={styles.compactStatText}>
                      {activity.completedSets}/{activity.plannedSets}
                    </Text>
                  </View>

                  {/* Reps */}
                  {hasReps && (
                    <View style={styles.compactStatItem}>
                      <MaterialCommunityIcons
                        name="counter"
                        size={14}
                        color="#EC4899"
                      />
                      <Text style={styles.compactStatText}>
                        {activity.completedReps}/{activity.plannedReps}
                      </Text>
                    </View>
                  )}

                  {/* Time */}
                  {hasTime && (
                    <View style={styles.compactStatItem}>
                      <MaterialCommunityIcons
                        name="timer"
                        size={14}
                        color="#3B82F6"
                      />
                      <Text style={styles.compactStatText}>
                        {Math.round(activity.completedPracticeTimeSeconds / 60)}
                        /{Math.round(activity.plannedPracticeTimeSeconds / 60)}m
                      </Text>
                    </View>
                  )}

                  {/* Distance */}
                  {hasDistance && (
                    <View style={styles.compactStatItem}>
                      <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={14}
                        color="#10B981"
                      />
                      <Text style={styles.compactStatText}>
                        {activity.completedDistanceMeters}/
                        {activity.plannedDistanceMeters}m
                      </Text>
                    </View>
                  )}

                  {/* Weight Range */}
                  {hasWeight && (
                    <View style={styles.compactStatItem}>
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={14}
                        color="#F59E0B"
                      />
                      <Text style={styles.compactStatText}>
                        {activity.lightestWeightLifted ===
                        activity.heaviestWeightLifted
                          ? `${activity.heaviestWeightLifted}kg`
                          : `${activity.lightestWeightLifted}-${activity.heaviestWeightLifted}kg`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Notes */}
      {note && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.orange}
            />
            <Text style={styles.cardTitle}>{t("bookingResultCard.notes")}</Text>
          </View>
          <Text style={styles.notesText}>{note}</Text>
        </View>
      )}

      {/* Nutrition Tip */}
      {nutritionTip && (
        <View style={[styles.card, styles.nutritionCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="nutrition-outline" size={20} color="#10B981" />
            <Text style={[styles.cardTitle, { color: "#10B981" }]}>
              {t("bookingResultCard.nutritionAdvice")}
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
    backgroundColor: "#F8FAFC",
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
  activityTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  activityTypeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressChartsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  singleChartContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  singleChart: {
    borderRadius: 16,
  },
  chartCenterText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartPercentage: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartLabel: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  chartSubLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  progressDetailsGrid: {
    marginTop: 16,
    gap: 12,
  },
  progressDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
  },
  progressDetailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  progressDetailContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressDetailLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  progressDetailValue: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "700",
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  muscleGroupItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  muscleGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  muscleGroupName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  muscleGroupActivities: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  muscleStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  muscleStat: {
    flex: 1,
  },
  muscleStatLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  muscleStatValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.orange,
    borderRadius: 4,
  },
  activityItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    marginBottom: 12,
  },
  activityTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  activityMuscle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  activityMainStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  activityStatBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statBoxContent: {
    flex: 1,
  },
  statBoxLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statValueCompleted: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  statValueSeparator: {
    fontSize: 14,
    color: "#CBD5E1",
    marginHorizontal: 3,
  },
  statValuePlanned: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  statValueUnit: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 2,
  },
  // Compact Activity Item Styles
  activityItemCompact: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  activityCompactHeader: {
    marginBottom: 10,
  },
  activityCompactTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  activityCompactName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    marginRight: 8,
  },
  activityCompactMuscle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  activityCompactStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  compactStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  compactStatText: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "600",
  },
  weightDetailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  weightDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightDetail: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  weightDetailDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
  weightDetailLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  weightDetailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  timeDetailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  timeDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeDetail: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  timeDetailDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
  timeDetailLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timeDetailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  activityStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityStatText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
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
  viewDetailsButton: {
    backgroundColor: colors.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewDetailsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
