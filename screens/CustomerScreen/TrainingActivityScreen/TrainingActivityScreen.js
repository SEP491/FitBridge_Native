import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import bookingService from "../../../services/bookingService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";

const { width } = Dimensions.get("window");

export default function TrainingActivityScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { activityId } = route.params;
  const [activityDetail, setActivityDetail] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // For Reps tracking
  const [currentReps, setCurrentReps] = useState(0);

  // For Time tracking
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // For Rest time
  const [isResting, setIsResting] = useState(false);
  const [actualRestTime, setActualRestTime] = useState(0);
  const restTimerRef = useRef(null);

  useEffect(() => {
    const loadingActivityDetail = async () => {
      try {
        const response = await bookingService.getSessionActivityDetail(
          activityId
        );
        console.log("Activity Detail Response:", response);
        setActivityDetail(response.data);
      } catch (error) {
        console.error("Error fetching activity detail:", error);
        Alert.alert(
          t("common.error"),
          t("trainingActivity.errorLoadingActivity")
        );
      }
    };
    loadingActivityDetail();

    return () => {
      // Cleanup timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [activityId]);

  // Timer for Time-based exercises (countdown)
  useEffect(() => {
    if (isTimerRunning && activityDetail?.activitySetType === "Time") {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 0) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, activityDetail?.activitySetType]);

  // Rest timer - counts up to track actual rest time
  useEffect(() => {
    if (isResting) {
      restTimerRef.current = setInterval(() => {
        setActualRestTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting]);

  const startSet = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        t("trainingActivity.warning"),
        t("trainingActivity.saveBeforeContinue"),
        [{ text: "OK" }]
      );
      return;
    }

    const currentSet = activityDetail?.activitySets[currentSetIndex];
    if (!currentSet) return;

    setIsWorkoutActive(true);
    setHasUnsavedChanges(true);

    if (activityDetail.activitySetType === "Reps") {
      setCurrentReps(0);
    } else if (activityDetail.activitySetType === "Time") {
      setCurrentTime(currentSet.plannedPracticeTime);
      setIsTimerRunning(true);
    }
  };

  const incrementReps = () => {
    if (isWorkoutActive && activityDetail?.activitySetType === "Reps") {
      setCurrentReps((prev) => prev + 1);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const endSet = () => {
    // Stop the workout and start rest timer
    setIsWorkoutActive(false);
    setIsTimerRunning(false);
    setIsResting(true);
    setActualRestTime(0); // Reset rest time counter
  };

  const saveChanges = async () => {
    const currentSet = activityDetail?.activitySets[currentSetIndex];
    if (!currentSet) return;

    try {
      const updateData = {
        activitySet: {
          activitySetId: currentSet.id,
          weightLifted: currentSet.weightLifted,
          isCompleted: true,
          restTime: actualRestTime, // Use the actual rest time user took
        },
      };

      if (activityDetail.activitySetType === "Reps") {
        updateData.activitySet.numOfReps = currentReps;
        updateData.activitySet.practiceTime = 0;
      } else if (activityDetail.activitySetType === "Time") {
        // Calculate actual practice time (planned - remaining)
        const actualPracticeTime = currentSet.plannedPracticeTime - currentTime;
        updateData.activitySet.practiceTime = actualPracticeTime;
        updateData.activitySet.numOfReps = 0;
      }

      console.log("Updating activity set:", updateData);
      await bookingService.updateActivitySet(updateData);

      // Update local state
      const updatedSets = [...activityDetail.activitySets];
      updatedSets[currentSetIndex] = {
        ...updatedSets[currentSetIndex],
        isCompleted: true,
        restTime: actualRestTime,
        numOfReps:
          activityDetail.activitySetType === "Reps"
            ? currentReps
            : updatedSets[currentSetIndex].numOfReps,
        practiceTime:
          activityDetail.activitySetType === "Time"
            ? currentSet.plannedPracticeTime - currentTime
            : updatedSets[currentSetIndex].practiceTime,
      };

      setActivityDetail({
        ...activityDetail,
        activitySets: updatedSets,
      });

      setHasUnsavedChanges(false);
      setIsResting(false);
      setActualRestTime(0);

      Alert.alert(t("common.success"), t("trainingActivity.resultSaved"));
    } catch (error) {
      console.error("Error saving activity set:", error);
      Alert.alert(t("common.error"), t("trainingActivity.errorSavingResult"));
    }
  };

  const goToNextSet = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        t("trainingActivity.warning"),
        t("trainingActivity.saveBeforeSwitch"),
        [{ text: "OK" }]
      );
      return;
    }

    if (currentSetIndex < (activityDetail?.activitySets.length || 0) - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setCurrentReps(0);
      setCurrentTime(0);
    }
  };

  const goToPreviousSet = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        t("trainingActivity.warning"),
        t("trainingActivity.saveBeforeSwitch"),
        [{ text: "OK" }]
      );
      return;
    }

    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      setCurrentReps(0);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!activityDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>{t("trainingActivity.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSet = activityDetail.activitySets[currentSetIndex];
  const isRepsMode = activityDetail.activitySetType === "Reps";
  const isTimeMode = activityDetail.activitySetType === "Time";

  const completedSets = activityDetail.activitySets.filter(
    (set) => set.isCompleted
  ).length;

  return (
    <View style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Timer Display */}
        <View style={styles.timerDisplayContainer}>
          {!isWorkoutActive && !isResting ? (
            <Text style={styles.mainTimerText}>
              {isRepsMode ? "0" : "00:00"}
            </Text>
          ) : isResting ? (
            <View style={styles.mainTimerTouchable}>
              <Text style={styles.restLabel}>
                {t("trainingActivity.restTime")}
              </Text>
              <Text style={styles.mainTimerText}>
                {formatTime(actualRestTime)}
              </Text>
            </View>
          ) : (
            <>
              {isRepsMode && (
                <TouchableOpacity
                  style={styles.mainTimerTouchable}
                  onPress={incrementReps}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mainTimerText}>
                    {currentReps.toString().padStart(2, "0")}
                  </Text>
                  <Text style={styles.repsSubtext}>
                    / {currentSet.plannedNumOfReps} reps
                  </Text>
                </TouchableOpacity>
              )}
              {isTimeMode && (
                <View style={styles.mainTimerTouchable}>
                  <Text style={styles.mainTimerText}>
                    {formatTime(currentTime).replace(":", ":")}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Activity Info Badge */}
        <View style={styles.activityBadgeContainer}>
          <View style={styles.activityBadge}>
            <View style={styles.muscleBadge}>
              <MaterialCommunityIcons
                name="arm-flex"
                size={24}
                color="#1E293B"
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>
                {activityDetail.activityName}
              </Text>
              <Text style={styles.activityProgress}>
                {completedSets}/{activityDetail.activitySets.length}{" "}
                {t("trainingActivity.completed")}
              </Text>
            </View>
          </View>
          {/* {!currentSet.isCompleted && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{t("trainingActivity.training")}</Text>
            </TouchableOpacity>
          )} */}
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>{t("trainingActivity.set")}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="barbell-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>{t("trainingActivity.kg")}</Text>
          </View>

          {isRepsMode && (
            <View style={styles.statItem}>
              <Ionicons name="repeat-outline" size={22} color="#F97316" />
              <Text style={styles.statLabel}>{t("trainingActivity.reps")}</Text>
            </View>
          )}

          {isTimeMode && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={22} color="#F97316" />
              <Text style={styles.statLabel}>
                {t("trainingActivity.seconds")}
              </Text>
            </View>
          )}

          <View style={styles.statItem}>
            <Ionicons name="pause-circle-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>{t("trainingActivity.rest")}</Text>
          </View>
        </View>

        {/* Sets List */}
        <View style={styles.setsContainer}>
          {activityDetail.activitySets.map((set, index) => {
            const isActive = index === currentSetIndex;
            const isCompleted = set.isCompleted;

            return (
              <TouchableOpacity
                key={set.id}
                style={[
                  styles.setRow,
                  isCompleted && styles.setRowCompleted,
                  isActive && styles.setRowActive,
                ]}
                onPress={() => {
                  if (hasUnsavedChanges) {
                    Alert.alert(
                      t("trainingActivity.warning"),
                      t("trainingActivity.saveBeforeSwitch")
                    );
                    return;
                  }
                  setCurrentSetIndex(index);
                  setCurrentReps(0);
                  setCurrentTime(0);
                }}
              >
                {/* Set Number */}
                <Text
                  style={[
                    styles.setRowText,
                    isActive && styles.setRowTextActive,
                  ]}
                >
                  {index + 1}
                </Text>

                {/* Weight */}
                <Text
                  style={[
                    styles.setRowText,
                    isActive && styles.setRowTextActive,
                  ]}
                >
                  {set.weightLifted} kg
                </Text>

                {/* Reps or Time */}
                {isRepsMode && (
                  <Text
                    style={[
                      styles.setRowText,
                      isActive && styles.setRowTextActive,
                    ]}
                  >
                    {set.numOfReps || 0} / {set.plannedNumOfReps}
                  </Text>
                )}
                {isTimeMode && (
                  <Text
                    style={[
                      styles.setRowText,
                      isActive && styles.setRowTextActive,
                    ]}
                  >
                    {set.practiceTime || 0}s / {set.plannedPracticeTime}s
                  </Text>
                )}

                {/* Rest Time */}
                <Text
                  style={[
                    styles.setRowText,
                    isActive && styles.setRowTextActive,
                  ]}
                >
                  {set.restTime}s
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isWorkoutActive && !isResting ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                currentSet.isCompleted && styles.actionButtonDisabled,
              ]}
              onPress={startSet}
              disabled={currentSet.isCompleted}
            >
              <Text style={styles.actionButtonText}>
                {currentSet.isCompleted
                  ? t("trainingActivity.completedStatus")
                  : t("trainingActivity.start")}
              </Text>
            </TouchableOpacity>
          ) : isResting ? (
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveButtonText}>
                {t("trainingActivity.save")}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {isTimeMode && (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={toggleTimer}
                >
                  <Text style={styles.pauseButtonText}>
                    {isTimerRunning
                      ? t("trainingActivity.pause")
                      : t("trainingActivity.resume")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.endButton} onPress={endSet}>
                <Text style={styles.endButtonText}>
                  {t("trainingActivity.finish")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Main Timer Display
  timerDisplayContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  mainTimerText: {
    fontSize: 56,
    fontWeight: "300",
    color: "#1E293B",
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  mainTimerTouchable: {
    alignItems: "center",
  },
  repsSubtext: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
  },
  restLabel: {
    fontSize: 16,
    color: "#F97316",
    marginBottom: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Activity Badge
  activityBadgeContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
    marginRight: 12,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  muscleBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FB923C",
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 3,
  },
  activityProgress: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: "#F97316",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 16,
    // backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    // borderWidth: 1.5,
    // borderColor: "#E2E8F0",
  },
  statItem: {
    // display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },

  // Sets List
  setsContainer: {
    paddingHorizontal: 16,
    // paddingBottom: 120,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  setRowCompleted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  setRowActive: {
    backgroundColor: "#FEF3E2",
    borderColor: "#F97316",
    borderWidth: 2.5,
    shadowColor: "#F97316",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  setRowText: {
    fontSize: 15,
    // fontWeight: "600",
    color: "#64748B",
    flex: 1,
    textAlign: "center",
  },
  setRowTextActive: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 16,
  },
  //   checkIcon: {
  //     position: "absolute",
  //     top: 8,
  //     right: 8,
  //   },

  // Control Buttons
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#F97316",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#EA580C",
  },
  actionButtonDisabled: {
    backgroundColor: "#CBD5E1",
    borderColor: "#94A3B8",
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  pauseButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  endButton: {
    flex: 1,
    backgroundColor: "#F97316",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#EA580C",
  },
  endButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#059669",
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
