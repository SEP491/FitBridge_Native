import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import customerPurchasedService from "../../../services/customerPurchased";
import UserGoalService from "../../../services/user-goalService";
import { OverviewStatistics } from "./components/OverviewStatistics";
import { DailyProgressChart } from "./components/DailyProgressChart";
import { MuscleGroupPerformance } from "./components/MuscleGroupPerformance";
import { UserGoalsProgress } from "./components/UserGoalsProgress";
import { SessionStatistics } from "./components/SessionStatistics";
import { MuscleGroupBreakdown } from "./components/MuscleGroupBreakdown";
import { MuscleGroupDropdownModal } from "./components/MuscleGroupDropdownModal";
import { CreateUserGoalModal } from "./components/CreateUserGoalModal";
import { CreateUserGoalForm } from "./components/CreateUserGoalForm";
import { createUserGoalWithImage } from "../../../lib/userGoalHelper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const TrainingResultScreen = ({ route, navigation }) => {
  const {
    customerPurchasedId,
    customer,
    pkg,
    activeTab: initialActiveTab,
  } = route.params;
  const { t } = useTranslation();
  console.log("TrainingResultScreen Params:", pkg);
  // State for data
  const [stats, setStats] = useState(null);
  const [muscleReport, setMuscleReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for muscle group chart
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("Weight"); // 'Weight', 'Reps', 'Time'
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab || "overview"); // 'overview', 'details', or 'userGoal'

  // State for user goals
  const [userGoalExists, setUserGoalExists] = useState(null);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showCreateGoalForm, setShowCreateGoalForm] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);

  // Translate muscle group keys to localized text
  const getMuscleGroupText = (key) => {
    if (!key) return "";
    // Normalize key to match translation keys when possible
    // API keys examples: Biceps, Calf, Chest, ForeArm, Hip, Shoulders, Thigh, AbsCore, Back, Triceps, Glutes, FullBody, Other, Thighs
    switch (key) {
      case "Biceps":
        return t("muscleGroups.biceps", "Biceps");
      case "Calf":
        return t("muscleGroups.calf", "Calf");
      case "Chest":
        return t("muscleGroups.chest", "Chest");
      case "ForeArm":
        return t("muscleGroups.foreArm", "Forearm");
      case "Hip":
        return t("muscleGroups.hip", "Hip");
      case "Shoulders":
        return t("muscleGroups.shoulder", "Shoulder");
      case "Thigh":
      case "Thighs":
        return t("muscleGroups.thigh", "Thigh");
      case "AbsCore":
        return t("muscleGroups.waist", "Waist");
      case "Back":
        return t("muscleGroups.back", "Back");
      case "Triceps":
        return t("muscleGroups.triceps", "Triceps");
      case "Glutes":
        return t("muscleGroups.glutes", "Glutes");
      case "FullBody":
        return t("muscleGroups.fullBody", "Full Body");
      case "Other":
        return t("muscleGroups.other", "Other");
      default:
        return key;
    }
  };

  // Fetch data on component mount
  React.useEffect(() => {
    fetchTrainingData();
  }, [customerPurchasedId]);

  // Check if user goal exists on component mount
  React.useEffect(() => {
    checkUserGoalExists();
  }, [customerPurchasedId]);

  // Fetch statistics and muscle report
  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse =
        await customerPurchasedService.getCustomerPurchasedPackageResult(
          customerPurchasedId
        );
      console.log("Statistics Response:", statsResponse);

      // Fetch muscle report
      const muscleReportResponse =
        await customerPurchasedService.getCustomerPurchasedMuscleReport(
          customerPurchasedId
        );
      console.log("Muscle Report Response:", muscleReportResponse);

      if (statsResponse?.status === "200" && statsResponse?.data) {
        setStats(statsResponse.data);
      }

      if (
        muscleReportResponse?.status === "200" &&
        muscleReportResponse?.data
      ) {
        setMuscleReport(muscleReportResponse.data);
      }
    } catch (err) {
      console.error("Error fetching training data:", err);
      setError(t("trainingResults.errorText"));
    } finally {
      setLoading(false);
    }
  };

  // Check if user goal exists
  const checkUserGoalExists = async () => {
    try {
      const response = await UserGoalService.checkExistUserGoals(
        customerPurchasedId
      );
      console.log("User Goal Check Response:", response);

      if (response?.status === "200" || response?.status === 200) {
        const exists = response?.data;
        setUserGoalExists(exists);

        // Show modal if user goal doesn't exist
        if (!exists) {
          setShowCreateGoalModal(true);
        }
      }
    } catch (err) {
      console.error("Error checking user goals:", err);
      // Assume goal doesn't exist if check fails
      setUserGoalExists(false);
      setShowCreateGoalModal(true);
    }
  };

  // Handle create user goal submission
  const handleCreateUserGoal = async (goalData) => {
    try {
      setCreatingGoal(true);

      const createdGoal = await createUserGoalWithImage(goalData);

      Alert.alert(
        t("common.success", "Success"),
        t(
          "userGoals.goalCreatedSuccessfully",
          "User goal created successfully!"
        )
      );

      setShowCreateGoalForm(false);
      setUserGoalExists(true);

      // Refresh stats to show new goals
      fetchTrainingData();
    } catch (err) {
      console.error("Error creating user goal:", err);
      Alert.alert(
        t("common.error", "Error"),
        t(
          "userGoals.failedToCreateGoal",
          "Failed to create user goal. Please try again."
        )
      );
    } finally {
      setCreatingGoal(false);
    }
  };

  // Initialize selected muscle group
  React.useEffect(() => {
    if (
      muscleReport?.muscleGroupActivities &&
      muscleReport.muscleGroupActivities.length > 0 &&
      !selectedMuscleGroup
    ) {
      setSelectedMuscleGroup(muscleReport.muscleGroupActivities[0].muscleGroup);
    }
  }, [muscleReport]);

  // Prepare line chart data based on selected muscle group and metric
  const prepareLineChartData = () => {
    if (!muscleReport?.muscleGroupActivities || !selectedMuscleGroup) {
      return null;
    }

    const muscleData = muscleReport.muscleGroupActivities.find(
      (m) => m.muscleGroup === selectedMuscleGroup
    );

    if (
      !muscleData ||
      !muscleData.dailyResults ||
      muscleData.dailyResults.length === 0
    ) {
      return null;
    }

    // Sort by date
    const sortedResults = [...muscleData.dailyResults].sort(
      (a, b) => new Date(a.practiceDay) - new Date(b.practiceDay)
    );

    const labels = sortedResults.map((result) => {
      const date = new Date(result.practiceDay);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let data = [];
    let yAxisSuffix = "";

    switch (selectedMetric) {
      case "Weight":
        data = sortedResults.map((result) => result.totalWeights || 0);
        yAxisSuffix = " kg";
        break;
      case "Reps":
        data = sortedResults.map((result) => result.totalReps || 0);
        yAxisSuffix = "";
        break;
      case "Time":
        data = sortedResults.map((result) => result.totalTime || 0);
        yAxisSuffix = " s";
        break;
    }

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: [`${getMuscleGroupText(selectedMuscleGroup)} - ${selectedMetric}`],
    };
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    fillShadowGradient: "#ED2A46",
    fillShadowGradientOpacity: 1,
    propsForLabels: {
      fontSize: 12,
      fontWeight: "600",
    },
  };

  // Shared StatCard component
  const StatCard = ({ title, children, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        {icon && <Ionicons name={icon} size={24} color="#ED2A46" />}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  // Shared StatRow component
  const StatRow = ({ label, value, icon, valueColor }) => (
    <View style={styles.statRow}>
      <View style={styles.statRowLeft}>
        {icon && <Ionicons name={icon} size={18} color="#666" />}
        <Text style={styles.statRowLabel}>{label}</Text>
      </View>
      <Text style={[styles.statRowValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>
            {t("trainingResults.loadingText")}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ED2A46" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTrainingData}
          >
            <Text style={styles.retryButtonText}>
              {t("trainingResults.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Customer & Package Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              {/* Avatar */}
              {customer?.avatarUrl ? (
                <Image
                  source={{ uri: customer.avatarUrl }}
                  style={styles.infoAvatar}
                />
              ) : (
                <View style={styles.infoAvatarPlaceholder}>
                  <Text style={styles.infoAvatarInitials}>
                    {customer?.name
                      ? customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                      : "?"}
                  </Text>
                </View>
              )}

              {/* Text info */}
              <View style={styles.infoTextContainer}>
                <Text style={styles.customerName}>
                  {customer?.name || t("trainingResults.customer")}
                </Text>
                
                {customer?.email ? (
                  <Text style={styles.infoContactText}>{customer.email}</Text>
                ) : null}
                {customer?.phone ? (
                  <Text style={styles.infoContactText}>{customer.phone}</Text>
                ) : null}
                <Text style={styles.packageName}>
                  {pkg?.packageName || t("trainingResults.package")}
                </Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {/* First Row - Overview Tab */}
            <View style={styles.firstRow}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  styles.fullWidthTab,
                  activeTab === "overview" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("overview")}
              >
                <Ionicons
                  name="stats-chart"
                  size={20}
                  color={activeTab === "overview" ? "#ED2A46" : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "overview" && styles.activeTabText,
                  ]}
                >
                  {t(
                    "trainingResults.overviewAndProgress",
                    "Overview & Progress"
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Second Row - Details and User Goal Tabs */}
            <View style={styles.secondRow}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  styles.halfWidthTab,
                  activeTab === "details" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("details")}
              >
                <Ionicons
                  name="analytics"
                  size={20}
                  color={activeTab === "details" ? "#ED2A46" : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "details" && styles.activeTabText,
                  ]}
                >
                  {t("trainingResults.detailedStatistics", "Details")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  styles.halfWidthTab,
                  activeTab === "userGoal" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("userGoal")}
              >
                <Ionicons
                  name="medal-sharp"
                  size={20}
                  color={activeTab === "userGoal" ? "#ED2A46" : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "userGoal" && styles.activeTabText,
                  ]}
                >
                  {t("trainingResults.userGoal", "User Goal")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Overview & Progress Tab */}
          {activeTab === "overview" && (
            <>
              {/* Overview Statistics */}
              <OverviewStatistics stats={stats} t={t} StatCard={StatCard} />

              {/* Daily Muscle Group Progress Chart */}
              <DailyProgressChart
                muscleReport={muscleReport}
                selectedMuscleGroup={selectedMuscleGroup}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                setShowMuscleDropdown={setShowMuscleDropdown}
                prepareLineChartData={prepareLineChartData}
                StatCard={StatCard}
                t={t}
              />

              {/* Muscle Group Performance */}
              <MuscleGroupPerformance
                stats={stats}
                t={t}
                StatCard={StatCard}
                getMuscleGroupText={getMuscleGroupText}
              />

              {/* User Goals Progress */}
              <UserGoalsProgress
                chartConfig={chartConfig}
                t={t}
                StatCard={StatCard}
                stats={stats}
                onlyLineChart={true}
                customerPurchasedId={customerPurchasedId}
                navigation={navigation}
                initialUserGoals={stats?.userGoals}
              />
            </>
          )}

          {/* Detailed Statistics Tab */}
          {activeTab === "details" && (
            <>
              {/* Session Statistics */}
              <SessionStatistics
                stats={stats}
                t={t}
                StatCard={StatCard}
                StatRow={StatRow}
              />

              {/* Activity Statistics */}
              <StatCard title={t("trainingResults.activities")} icon="barbell">
                <StatRow
                  label={t("trainingResults.totalActivities")}
                  value={stats.totalActivities}
                />
                <StatRow
                  label={t("trainingResults.totalActivitySets")}
                  value={stats.totalActivitySets}
                />
                <StatRow
                  label={t("trainingResults.completedActivitySets")}
                  value={stats.completedActivitySets}
                  valueColor="#4CAF50"
                />
                <StatRow
                  label={t("trainingResults.averageSetsPerSession")}
                  value={stats.averageSetsPerSession}
                />
              </StatCard>

              {/* Performance Metrics */}
              <StatCard title={t("trainingResults.performance")} icon="trophy">
                <StatRow
                  label={t("trainingResults.averageSessionTime")}
                  value={`${stats.averageSessionTimePerSession?.toFixed(
                    1
                  )} ${t("trainingResults.seconds")}`}
                  icon="timer-outline"
                />
                <StatRow
                  label={t("trainingResults.averageWeightLifted")}
                  value={`${stats.averageWeightLiftedPerSession?.toFixed(
                    1
                  )} kg`}
                  icon="barbell-outline"
                />
                <StatRow
                  label={t(
                    "trainingResults.averageRepsPerSession",
                    "Avg Reps/Session"
                  )}
                  value={stats.averageRepsPerSession?.toFixed(1)}
                  icon="refresh-outline"
                />
              </StatCard>

              {/* Workout Statistics */}
              {stats.workoutStatistics && (
                <StatCard
                  title={t("trainingResults.workoutDetails")}
                  icon="analytics"
                >
                  <StatRow
                    label={t("trainingResults.totalWeightLifted")}
                    value={`${stats.workoutStatistics.totalWeightLifted} kg`}
                    icon="barbell-outline"
                  />
                  <StatRow
                    label={t("trainingResults.totalRepsCompleted")}
                    value={`${stats.workoutStatistics.totalRepsCompleted} / ${stats.workoutStatistics.plannedNumOfReps}`}
                  />
                  <StatRow
                    label={t("trainingResults.totalPracticeTime")}
                    value={`${Math.floor(
                      stats.workoutStatistics.totalPracticeTimeSeconds 
                    )} ${t("trainingResults.seconds")} / ${Math.floor(
                      stats.workoutStatistics.plannedPracticeTime
                    )} ${t("trainingResults.seconds")}`}
                  />
                  <StatRow
                    label={t("trainingResults.averageRestTime")}
                    value={`${stats.workoutStatistics.averageRestTimeSeconds} ${t("trainingResults.seconds")}`}
                  />
                </StatCard>
              )}

              {/* Activity Type Breakdown */}
              {stats.workoutStatistics?.activityTypeBreakdown && (
                <StatCard
                  title={t("trainingResults.activityTypeBreakdown")}
                  icon="list"
                >
                  {Object.entries(
                    stats.workoutStatistics.activityTypeBreakdown
                  ).map(([type, count]) => (
                    <StatRow key={type} label={type} value={count} />
                  ))}
                </StatCard>
              )}

              {/* Muscle Group Breakdown */}
              <MuscleGroupBreakdown
                stats={stats}
                t={t}
                StatCard={StatCard}
                getMuscleGroupText={getMuscleGroupText}
              />
            </>
          )}

          {/* User Goal Tab */}
          {activeTab === "userGoal" && (
            <>
              {/* User Goals Progress */}
              <UserGoalsProgress
                chartConfig={chartConfig}
                t={t}
                StatCard={StatCard}
                stats={stats}
                customerPurchasedId={customerPurchasedId}
                navigation={navigation}
                initialUserGoals={stats?.userGoals}
                onCreateGoal={() => {
                  setShowCreateGoalForm(true);
                }}
              />
            </>
          )}

          {/* Muscle Group Dropdown Modal */}
          <MuscleGroupDropdownModal
            visible={showMuscleDropdown}
            onClose={() => setShowMuscleDropdown(false)}
            muscleReport={muscleReport}
            selectedMuscleGroup={selectedMuscleGroup}
            onSelectMuscle={setSelectedMuscleGroup}
            t={t}
          />
        </ScrollView>
      )}
      {/* Create User Goal Modal */}
      <CreateUserGoalModal
        visible={showCreateGoalModal && !showCreateGoalForm}
        onClose={() => {
          setShowCreateGoalModal(false);
          // If goal doesn't exist and user closes modal, keep showing modal on next tab change
          if (!userGoalExists && activeTab === "userGoal") {
            setShowCreateGoalModal(true);
          }
        }}
        onCreateGoal={() => {
          setShowCreateGoalModal(false);
          setShowCreateGoalForm(true);
        }}
        t={t}
      />

      {/* Create User Goal Form */}
      {showCreateGoalForm && (
        <CreateUserGoalForm
          visible={showCreateGoalForm}
          onClose={() => setShowCreateGoalForm(false)}
          onSubmit={handleCreateUserGoal}
          customerPurchasedId={customerPurchasedId}
          t={t}
          loading={creatingGoal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ED2A46",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#ED2A46",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  infoAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE4E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoAvatarInitials: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ED2A46",
  },
  infoTextContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  packageName: {
    marginTop:4,
    fontSize: 14,
    color: "#666",
  },
  infoContactText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  firstRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  secondRow: {
    flexDirection: "row",
    gap: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  fullWidthTab: {
    flex: 1,
  },
  halfWidthTab: {
    flex: 1,
  },
  activeTab: {
    backgroundColor: "#FFF0F2",
    borderWidth: 2,
    borderColor: "#ED2A46",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#ED2A46",
    fontWeight: "700",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  statCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 0.8,
  },
  statRowLabel: {
    fontSize: 14,
    color: "#666",
  },
  statRowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});

export default TrainingResultScreen;
