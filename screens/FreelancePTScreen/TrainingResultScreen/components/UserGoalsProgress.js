import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import UserGoalService from "../../../../services/user-goalService";
import BodyMeasurementsService from "../../../../services/body-measurementService";
import BodyMeasurementHistoryModal from "./BodyMeasurementHistoryModal";
import { CreateUserGoalForm } from "./CreateUserGoalForm";
import { fetchUserFromStorage } from "../../../../lib";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require("../../../../assets/images/bodyparts/biceps.png"),
  Calf: require("../../../../assets/images/bodyparts/calf.png"),
  Chest: require("../../../../assets/images/bodyparts/chest.png"),
  ForeArm: require("../../../../assets/images/bodyparts/foreArm.png"),
  Hip: require("../../../../assets/images/bodyparts/hip.png"),
  Shoulder: require("../../../../assets/images/bodyparts/shoulder.png"),
  Thigh: require("../../../../assets/images/bodyparts/thigh.png"),
  Waist: require("../../../../assets/images/bodyparts/waist.png"),
  Back: require("../../../../assets/images/bodyparts/back.png"),
  Triceps: require("../../../../assets/images/bodyparts/triceps.png"),
  Glutes: require("../../../../assets/images/bodyparts/glutes.png"),
  FullBody: require("../../../../assets/images/bodyparts/fullbody.png"),
  Other: require("../../../../assets/images/bodyparts/other.png"),
};

export const UserGoalsProgress = ({
  t,
  StatCard,
  stats,
  customerPurchasedId,
  onCreateGoal,
  navigation,
}) => {
  const [userGoals, setUserGoals] = React.useState(null);
  const [bodyMeasurements, setBodyMeasurements] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    React.useState("Weight");
  const [historyModalVisible, setHistoryModalVisible] = React.useState(false);
  const [updatingGoals, setUpdatingGoals] = React.useState(false);
  const [showEditGoalForm, setShowEditGoalForm] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);

  const fetchUser = async () => {
    try {
      const user = await fetchUserFromStorage();
      setUserRole(user.role);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  const fetchUserGoals = async () => {
    try {
      setLoading(true);
      if (!customerPurchasedId) {
        setUserGoals(null);
        setLoading(false);
        return;
      }
      const response = await UserGoalService.getUserGoals(customerPurchasedId);
      if (response?.status === "200" || response?.status === 200) {
        setUserGoals(response.data);
      } else if (response?.status === "400" || response?.status === 400) {
        setUserGoals(null);
      }
    } catch (error) {
      console.error("Error fetching user goals:", error);
      setUserGoals(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBodyMeasurements = async () => {
    try {
      if (!customerPurchasedId) return;
      const response = await BodyMeasurementsService.getBodyMeasurements(
        customerPurchasedId
      );
      console.log("Body Measurements Response:", response);
      if (response?.status === "200" || response?.status === 200) {
        setBodyMeasurements(response.data?.items || []);
      }
    } catch (error) {
      console.error("Error fetching body measurements:", error);
      setBodyMeasurements([]);
    }
  };

  React.useEffect(() => {
    fetchUser();
    fetchUserGoals();
    fetchBodyMeasurements();
  }, [customerPurchasedId]);

  const handleSubmitEditGoals = async (data) => {
    if (!customerPurchasedId) return;
    try {
      setUpdatingGoals(true);
      await UserGoalService.updateUserGoals(customerPurchasedId, data);
      Alert.alert(
        t("userGoals.updateSuccessTitle", "Goals Updated"),
        t(
          "userGoals.updateSuccessMessage",
          "User goals have been updated successfully."
        )
      );
      setShowEditGoalForm(false);
      fetchUserGoals();
    } catch (error) {
      console.error("Error updating user goals:", error);
      Alert.alert(
        t("userGoals.updateErrorTitle", "Update Failed"),
        t(
          "userGoals.updateErrorMessage",
          "Unable to update user goals. Please try again."
        )
      );
    } finally {
      setUpdatingGoals(false);
    }
  };

  if (loading) {
    return (
      <StatCard
        title={t("trainingResults.userGoalsProgress", "User Goals Progress")}
        icon="trending-up"
      >
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.emptyStateTitle}>
            {t("common.loading", "Loading...")}
          </Text>
        </View>
      </StatCard>
    );
  }

  if (!userGoals) {
    return (
      <>
        <StatCard
          title={t("trainingResults.userGoalsProgress", "User Goals Progress")}
          icon="trending-up"
        >
          <View style={styles.emptyStateContainer}>
            <Ionicons name="flag-outline" size={48} color="#ED2A46" />
            <Text style={styles.emptyStateTitle}>
              {t("userGoals.noGoalsSet", "No Goals Set")}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {t(
                "userGoals.createGoalToTrack",
                "Create goals to track your fitness progress"
              )}
            </Text>
            {onCreateGoal && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={onCreateGoal}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>
                  {t("userGoals.createGoal", "Create Goal")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </StatCard>
      </>
    );
  }

  // Define muscle groups to display
  const muscleGroups = [
    {
      key: "Weight",
      label: t("muscleGroups.weight", "Weight"),
      apiKey: "weight",
    },
    { key: "Height", label: t("userGoals.height", "Height"), apiKey: "height" },
    {
      key: "Biceps",
      label: t("muscleGroups.biceps", "Biceps"),
      apiKey: "biceps",
    },
    {
      key: "ForeArm",
      label: t("muscleGroups.foreArm", "Forearm"),
      apiKey: "foreArm",
    },
    { key: "Chest", label: t("muscleGroups.chest", "Chest"), apiKey: "chest" },
    {
      key: "Shoulder",
      label: t("muscleGroups.shoulder", "Shoulder"),
      apiKey: "shoulder",
    },
    { key: "Waist", label: t("muscleGroups.waist", "Waist"), apiKey: "waist" },
    { key: "Hip", label: t("muscleGroups.hip", "Hip"), apiKey: "hip" },
    { key: "Thigh", label: t("muscleGroups.thigh", "Thigh"), apiKey: "thigh" },
    { key: "Calf", label: t("muscleGroups.calf", "Calf"), apiKey: "calf" },
  ];

  // Get chart data for selected muscle group
  const getChartDataForMuscle = (muscleKey) => {
    const group = muscleGroups.find((g) => g.key === muscleKey);
    if (!group) return null;

    const apiKey = group.apiKey;
    const start = userGoals[`start${muscleKey}`];
    const target = userGoals[`target${muscleKey}`];

    // Sort measurements by date
    const sortedMeasurements = [...bodyMeasurements].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Get measurement values
    const measurementValues = sortedMeasurements.map((m) => m[apiKey] || 0);
    const dates = sortedMeasurements.map((m) => {
      const date = new Date(m.createdAt);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Progress line data (start + measurements)
    const progressValues = [start, ...measurementValues].filter(
      (v) => v != null
    );
    const progressLabels = [t("userGoals.start", "Start"), ...dates];

    // Target line data (constant target value across all points)
    const targetValues = progressValues.map(() => target);

    return {
      labels: progressLabels,
      datasets: [
        {
          data: progressValues,
          color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: targetValues,
          color: (opacity = 1) => `rgba(232, 149, 6, 1)`,
          strokeWidth: 3,
          withDots: false,
        },
      ],
    };
  };

  const chartData = getChartDataForMuscle(selectedMuscleGroup);
  const firstTimeScanMeasurements = bodyMeasurements.length === 0;

  return (
    <>
      <StatCard
        title={t("trainingResults.currentUserStats", "Current User Stats")}
        icon="body"
      >
        {/* Add Measurement and View History Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addMeasurementButton}
            onPress={() =>
              navigation?.navigate("AddMeasurementScreen", {
                customerPurchasedId,
                firstTimeScan: firstTimeScanMeasurements,
              })
            }
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addMeasurementButtonText}>
              {t("bodyMeasurements.addMeasurement", "Add Measurement")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Ionicons name="time-outline" size={20} color="#ED2A46" />
            <Text style={styles.viewHistoryButtonText}>
              {t("bodyMeasurements.viewHistory", "View History")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.currentStatsContainer}>
          {/* Latest Measurement Stats */}
          {bodyMeasurements.length > 0 ? (
            <>
              <View style={styles.mainStatsRow}>
                <View style={styles.mainStatCard}>
                  <Text style={styles.mainStatLabel}>
                    {t("userGoals.height", "Height")}
                  </Text>
                  <Text style={styles.mainStatValue}>
                    {bodyMeasurements[0]?.height || "-"}
                  </Text>
                  <Text style={styles.mainStatUnit}>
                    {t("profile.units.cm", "cm")}
                  </Text>
                </View>
                <View style={styles.mainStatDivider} />
                <View style={styles.mainStatCard}>
                  <Text style={styles.mainStatLabel}>
                    {t("userGoals.weight", "Weight")}
                  </Text>
                  <Text style={styles.mainStatValue}>
                    {bodyMeasurements[0]?.weight || "-"}
                  </Text>
                  <Text style={styles.mainStatUnit}>
                    {t("profile.units.kg", "kg")}
                  </Text>
                </View>
              </View>

              {/* Muscle Stats Grid - 2 Columns Full Width */}
              <View style={styles.muscleStatsGrid}>
                {muscleGroups.map((group, index) => {
                  // Skip Height and Weight as they are displayed in the main stats row
                  if (group.key === "Weight" || group.key === "Height")
                    return null;

                  const latestValue = bodyMeasurements[0]?.[group.apiKey];

                  // Skip if no value
                  if (latestValue === null || latestValue === undefined)
                    return null;

                  const muscleImage = muscleGroupImages[group.key];

                  return (
                    <View key={index} style={styles.muscleStatCard}>
                      {muscleImage && (
                        <Image
                          source={muscleImage}
                          style={styles.muscleStatImage}
                          resizeMode="contain"
                        />
                      )}
                      <View style={styles.muscleStatInfo}>
                        <Text style={styles.muscleStatLabel}>
                          {group.label}
                        </Text>
                        <View style={styles.muscleStatValueContainer}>
                          <Text style={styles.muscleStatValue}>
                            {latestValue || 0}
                          </Text>
                          <Text style={styles.muscleStatUnit}>
                            {t("profile.units.cm", "cm")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="body-outline" size={48} color="#ED2A46" />
              <Text style={styles.emptyStateTitle}>
                {t("userGoals.noMeasurements", "No Measurements Yet")}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {t(
                  "userGoals.addMeasurements",
                  "Add body measurements to track your progress"
                )}
              </Text>
            </View>
          )}
        </View>
      </StatCard>

      <StatCard
        title={t("trainingResults.userGoalsProgress", "User Goals Progress")}
        icon="trending-up"
      >
        {/* Update Goals Button */}
        {userRole === "FreelancePT" && (
        <View style={styles.updateGoalsContainer}>
          <TouchableOpacity
            style={[
              styles.updateGoalsButton,
              (!customerPurchasedId || updatingGoals) &&
                styles.updateGoalsButtonDisabled,
            ]}
            onPress={() => setShowEditGoalForm(true)}
            disabled={!customerPurchasedId || updatingGoals}
          >
            {updatingGoals ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="create-outline" size={15} color="#fff" />
            )}
            <Text style={styles.updateGoalsButtonText}>
              {t("userGoals.updateGoals", "Update User Goals")}
            </Text>
          </TouchableOpacity>
        </View>
            )}
        {/* Muscle Group Selection Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.muscleGroupSelector}
          contentContainerStyle={styles.muscleGroupSelectorContent}
        >
          {muscleGroups.map((group) => {
            const start = userGoals[`start${group.key}`];
            const target = userGoals[`target${group.key}`];

            // Skip if no target is set
            if (!target || start === null || start === undefined) return null;

            return (
              <TouchableOpacity
                key={group.key}
                style={[
                  styles.muscleGroupButton,
                  selectedMuscleGroup === group.key &&
                    styles.muscleGroupButtonActive,
                ]}
                onPress={() => setSelectedMuscleGroup(group.key)}
              >
                <Text
                  style={[
                    styles.muscleGroupButtonText,
                    selectedMuscleGroup === group.key &&
                      styles.muscleGroupButtonTextActive,
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Progress Chart */}
        {chartData && chartData.datasets[0].data.length > 0 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 64}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "2",
                  strokeWidth: "2",
                  stroke: "#ED2A46",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: "#e0e0e0",
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              fromZero={false}
              segments={5}
              withShadow={false}
            />

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#ED2A46" }]}
                />
                <Text style={styles.legendText}>
                  {t("userGoals.progress", "Progress")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FFC107" }]}
                />
                <Text style={styles.legendText}>
                  {t("userGoals.target", "Target")}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="analytics-outline" size={48} color="#ED2A46" />
            <Text style={styles.emptyStateTitle}>
              {t("userGoals.noDataAvailable", "No Data Available")}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {t(
                "userGoals.addMeasurementsToSeeChart",
                "Add body measurements to see progress chart"
              )}
            </Text>
          </View>
        )}

        {/* Detailed Goals Info */}
        <View style={styles.goalsDetailContainer}>
          {muscleGroups.map((group, index) => {
            const start = userGoals[`start${group.key}`];
            const target = userGoals[`target${group.key}`];

            // Skip if no target is set or start is missing
            if (!target || start === null || start === undefined) return null;

            // Get latest measurement value
            const latestMeasurement =
              bodyMeasurements.length > 0
                ? bodyMeasurements[0][group.apiKey]
                : null;
            const currentValue =
              latestMeasurement !== null ? latestMeasurement : start;

            // Calculate progress percentage based on goal direction
            let progressPercent = 0;

            if (target === start) {
              // Goal is to MAINTAIN (e.g., Start: 175, Target: 175)
              // Start at 100% since they're already at goal
              // But adjust based on latest measurement deviation
              if (currentValue === target) {
                progressPercent = 100;
              } else if (currentValue > target) {
                // Latest is higher than target - show as exceeding (positive over 100%)
                const deviation = currentValue - target;
                const deviationPercent = (deviation / target) * 100;
                progressPercent = 100 + deviationPercent;
              } else {
                // Latest is lower than target - show as below goal (less than 100%)
                const deviation = target - currentValue;
                const deviationPercent = (deviation / target) * 100;
                progressPercent = -deviationPercent;
              }
            } else if (target > start) {
              // Goal is to INCREASE (e.g., Start: 40, Target: 50)
              // Positive progress: moving from start towards target
              // Negative progress: moving away from target (going down instead of up)
              const totalChange = target - start;
              const currentChange = currentValue - start;
              progressPercent = (currentChange / totalChange) * 100;
            } else {
              // Goal is to DECREASE (e.g., Start: 40, Target: 30)
              // Positive progress: moving from start towards target (going down)
              // Negative progress: moving away from target (going up instead of down)
              const totalChange = start - target;
              const currentChange = start - currentValue;
              progressPercent = (currentChange / totalChange) * 100;
            }

            // Don't cap the percentage - show actual progress
            // This allows showing if someone exceeded their goal or went very wrong direction

            return (
              <View key={index} style={styles.goalDetailItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalMuscleGroup}>{group.label}</Text>
                  <Text
                    style={[
                      styles.goalProgress,
                      {
                        color:
                          progressPercent < 0
                            ? "#F44336" // Red for negative progress (wrong direction)
                            : progressPercent >= 100
                            ? "#4CAF50" // Green for completed
                            : progressPercent >= 50
                            ? "#FF9800" // Orange for halfway
                            : "#FF6B35", // Orange-red for low progress
                      },
                    ]}
                  >
                    {progressPercent >= 0 ? "+" : ""}
                    {progressPercent.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.goalValues}>
                  <View style={styles.goalValue}>
                    <Text style={styles.goalValueLabel}>
                      {t("userGoals.start", "Start")}
                    </Text>
                    <Text style={styles.goalValueNumber}>{start || 0}</Text>
                  </View>
                  <View style={styles.goalValue}>
                    <Text style={styles.goalValueLabel}>
                      {t("userGoals.latest", "Latest")}
                    </Text>
                    <Text
                      style={[styles.goalValueNumber, { color: "#4CAF50" }]}
                    >
                      {currentValue || start || 0}
                    </Text>
                  </View>
                  <View style={styles.goalValue}>
                    <Text style={styles.goalValueLabel}>
                      {t("userGoals.target", "Target")}
                    </Text>
                    <Text
                      style={[styles.goalValueNumber, { color: "#ED2A46" }]}
                    >
                      {target}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          Math.max(progressPercent, 0),
                          100
                        )}%`,
                        backgroundColor:
                          progressPercent < 0 ? "#F44336" : "#4CAF50",
                      },
                    ]}
                  />
                </View>

                {/* Show measurement count */}
                <Text style={styles.measurementCount}>
                  {bodyMeasurements.length}{" "}
                  {t("userGoals.measurements", "measurements")}{" "}
                  {t("userGoals.recorded", "recorded")}
                </Text>
              </View>
            );
          })}
        </View>
      </StatCard>

      {/* Edit User Goal Form */}
      {showEditGoalForm && userGoals && (
        <CreateUserGoalForm
          visible={showEditGoalForm}
          modalPostion={1000}
          onClose={() => setShowEditGoalForm(false)}
          onSubmit={handleSubmitEditGoals}
          customerPurchasedId={customerPurchasedId}
          t={t}
          loading={updatingGoals}
          initialData={userGoals}
          initialSelectedTargetParts={muscleGroups
            .map((g) => g.key)
            .filter((key) => {
              const targetVal = userGoals[`target${key}`];
              return targetVal !== null && targetVal !== undefined && targetVal !== 0;
            })}
          mode="edit"
        />
      )}

      {/* Body Measurement History Modal */}
      <BodyMeasurementHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        measurements={bodyMeasurements}
        t={t}
      />
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    // flexDirection: "row",
    justifyContent: "space-between",
  },
  viewHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ED2A46",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewHistoryButtonText: {
    color: "#ED2A46",
    fontWeight: "700",
    fontSize: 15,
  },
  addMeasurementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ED2A46",
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addMeasurementButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  updateGoalsContainer: {
    alignItems: "flex-end",
    position:'absolute',
    right:15,
    top:15,
  },
  updateGoalsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#ED2A46",
    gap: 6,
  },
  updateGoalsButtonDisabled: {
    opacity: 0.6,
  },
  updateGoalsButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  goalsDetailContainer: {
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  goalDetailItem: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalMuscleGroup: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: "bold",
  },
  goalValues: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
  },
  goalValue: {
    alignItems: "center",
  },
  goalValueLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  goalValueNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  currentStatsContainer: {
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#f0f0f0",
  },
  currentStatsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  mainStatsRow: {
    flexDirection: "row",
    backgroundColor: "#FFF0F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ED2A46",
  },
  mainStatCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainStatDivider: {
    width: 2,
    height: 60,
    backgroundColor: "#ED2A46",
    marginHorizontal: 16,
  },
  mainStatLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ED2A46",
    marginBottom: 4,
  },
  mainStatUnit: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  muscleStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  muscleStatCard: {
    width: "48%", // 2 columns with gap
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  muscleStatImage: {
    width: 50,
    height: 50,
  },
  muscleStatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  muscleStatLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  muscleStatValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  muscleStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  muscleStatUnit: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  emptyStateContainer: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderTopColor: "#f0f0f0",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ED2A46",
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  muscleGroupSelector: {
    marginBottom: 16,
    borderTopWidth: 2,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  muscleGroupSelectorContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  muscleGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  muscleGroupButtonActive: {
    backgroundColor: "#ED2A46",
    borderColor: "#ED2A46",
  },
  muscleGroupButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  muscleGroupButtonTextActive: {
    color: "#fff",
  },
  measurementCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});
