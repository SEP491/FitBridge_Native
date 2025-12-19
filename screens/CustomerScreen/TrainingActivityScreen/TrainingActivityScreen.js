import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import bookingService from "../../../services/bookingService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";

// Body part images mapping
const bodyPartImages = {
  chest: require("../../../assets/images/bodyparts/chest.png"),
  back: require("../../../assets/images/bodyparts/back.png"),

  shoulder: require("../../../assets/images/bodyparts/shoulder.png"),
  biceps: require("../../../assets/images/bodyparts/biceps.png"),
  triceps: require("../../../assets/images/bodyparts/triceps.png"),
  foreArm: require("../../../assets/images/bodyparts/foreArm.png"),
  thigh: require("../../../assets/images/bodyparts/thigh.png"),
  glutes: require("../../../assets/images/bodyparts/glutes.png"),
  calf: require("../../../assets/images/bodyparts/calf.png"),
  waist: require("../../../assets/images/bodyparts/waist.png"),
  fullbody: require("../../../assets/images/bodyparts/fullbody.png"),
  other: require("../../../assets/images/bodyparts/other.png"),
};

const MUSCLE_GROUPS = [
  { id: "Chest", name: "Ngực", image: bodyPartImages.chest },
  { id: "Back", name: "Lưng", image: bodyPartImages.back },
  { id: "Shoulders", name: "Vai", image: bodyPartImages.shoulder },
  { id: "Biceps", name: "Tay Trước", image: bodyPartImages.biceps },
  { id: "Triceps", name: "Tay Sau", image: bodyPartImages.triceps },
  { id: "Forearms", name: "Cẳng Tay", image: bodyPartImages.foreArm },
  { id: "Thighs", name: "Đùi", image: bodyPartImages.thigh },
  { id: "Glutes", name: "Mông", image: bodyPartImages.glutes },
  { id: "Calves", name: "Bắp chân", image: bodyPartImages.calf },
  { id: "AbsCore", name: "Bụng", image: bodyPartImages.waist },
  { id: "FullBody", name: "Toàn Thân", image: bodyPartImages.fullbody },
  { id: "Other", name: "Khác", image: bodyPartImages.other },
];

const { width } = Dimensions.get("window");

export default function TrainingActivityScreen({ route, navigation }) {
  const { t } = useTranslation();
  const userRole = route.params?.userRole || "customer"; // Default to customer if not provided
  const { activityId, sessionState } = route.params;
  const [activityDetail, setActivityDetail] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [manualInputMode, setManualInputMode] = useState(false); // allow PT to type values

  // For Reps tracking
  const [currentReps, setCurrentReps] = useState(0);

  // For Distance tracking
  const [currentDistance, setCurrentDistance] = useState("");

  // For Time tracking
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // For Rest time
  const [isResting, setIsResting] = useState(false);
  const [actualRestTime, setActualRestTime] = useState(0);
  const restTimerRef = useRef(null);

  // Store actual time when in manual mode (in case it's > planned)
  const manualActualTimeRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const getActivityAssetLabel = () => {
    if (!activityDetail) return "";
    return activityDetail.vietnameseAssetName || activityDetail.assetName || "";
  };

  const getActivityAssetImage = () => {
    if (!activityDetail) return null;
    // Prefer metadataImage if present, fall back to assetImage
    return activityDetail.metadataImage || activityDetail.assetImage || null;
  };

  const getActivityMuscle = () => {
    if (!activityDetail?.muscleGroup) return null;
    const muscleId = activityDetail.muscleGroup;
    return MUSCLE_GROUPS.find((m) => m.id === muscleId) || null;
  };

  const loadingActivityDetail = async () => {
    try {
      const response = await bookingService.getSessionActivityDetail(
        activityId
      );
      console.log("Activity Detail Response:", response);
      setActivityDetail(response.data);

      // Find the first uncompleted set and set it as current
      const firstUncompletedIndex = response.data.activitySets.findIndex(
        (set) => !set.isCompleted
      );

      // If found, set it as current index, otherwise keep at 0
      if (firstUncompletedIndex !== -1) {
        setCurrentSetIndex(firstUncompletedIndex);
      }
    } catch (error) {
      console.error("Error fetching activity detail:", error);
      Alert.alert(
        t("common.error"),
        t("trainingActivity.errorLoadingActivity")
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadingActivityDetail();
    setRefreshing(false);
  };

  useEffect(() => {
    loadingActivityDetail();

    return () => {
      // Cleanup timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [activityId]);

  // Handle back button press
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If no unsaved changes or not resting, allow navigation
      if (!hasUnsavedChanges && !isResting) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show alert about unsaved changes
      Alert.alert(
        t("trainingActivity.warning"),
        t("trainingActivity.unsavedChangesWarning") ||
          "You have unsaved changes. Your workout result will not be saved if you leave now.",
        [
          {
            text: t("common.cancel") || "Cancel",
            style: "cancel",
            onPress: () => {},
          },
          {
            text: t("trainingActivity.leaveAnyway") || "Leave Anyway",
            style: "destructive",
            onPress: () => {
              // Reset states before leaving
              setHasUnsavedChanges(false);
              setIsResting(false);
              setIsWorkoutActive(false);
              setIsTimerRunning(false);
              // Navigate back
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, isResting]); // Timer for Time-based exercises (countdown)
  useEffect(() => {
    // Don't run timer if in manual input mode
    if (
      isTimerRunning &&
      activityDetail?.activitySetType === "Time" &&
      !manualInputMode
    ) {
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
  }, [isTimerRunning, activityDetail?.activitySetType, manualInputMode]);

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

    // Reset manual actual time ref
    manualActualTimeRef.current = null;

    // If editing a completed set (for FreelancePT), load existing values
    const isEditingCompleted =
      currentSet.isCompleted && userRole === "FreelancePT";

    if (isEditingCompleted) {
      // Load existing rest time if available
      setActualRestTime(currentSet.restTime || 0);
    } else {
      setActualRestTime(0);
    }

    if (activityDetail.activitySetType === "Reps") {
      setCurrentReps(isEditingCompleted ? currentSet.numOfReps || 0 : 0);
    } else if (activityDetail.activitySetType === "Time") {
      if (isEditingCompleted) {
        // Load the actual practice time that was saved
        const savedTime = currentSet.practiceTime || 0;
        setCurrentTime(savedTime);
        setIsTimerRunning(false); // Don't auto-start timer when editing
        // Enable manual input mode for editing completed sets so PT can see/edit actual time
        setManualInputMode(true);
      } else {
        setCurrentTime(currentSet.plannedPracticeTime);
        setIsTimerRunning(true);
        setManualInputMode(false);
      }
    } else if (activityDetail.activitySetType === "Distance") {
      setCurrentDistance(
        isEditingCompleted ? currentSet.actualDistance?.toString() || "" : ""
      );
    }
  };

  const incrementReps = () => {
    if (isWorkoutActive && activityDetail?.activitySetType === "Reps") {
      setCurrentReps((prev) => prev + 1);
    }
  };

  const decrementReps = () => {
    if (isWorkoutActive && activityDetail?.activitySetType === "Reps") {
      setCurrentReps((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleDistanceChange = (value) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    setCurrentDistance(sanitized);
  };

  const toggleTimer = () => {
    // Don't allow timer toggle in manual input mode
    if (manualInputMode) {
      Alert.alert(
        t("trainingActivity.warning"),
        t("trainingActivity.turnOffManualBeforeAction") ||
          "Please turn off manual input mode before performing this action."
      );
      return;
    }
    setIsTimerRunning((prev) => !prev);
  };

  const endSet = () => {
    // If in manual input mode and Time mode, handle conversion
    if (manualInputMode && activityDetail?.activitySetType === "Time") {
      const currentSet = activityDetail?.activitySets[currentSetIndex];
      if (currentSet) {
        // currentTime is actual time
        // If actual time > planned, we need to preserve it
        if (currentTime > currentSet.plannedPracticeTime) {
          // Store actual time in ref for saveChanges() to use
          manualActualTimeRef.current = currentTime;
          // Set currentTime to 0 (or negative) to indicate we're using manualActualTimeRef
          setCurrentTime(0);
        } else {
          // Convert actual time to remaining time for normal calculation
          const remainingTime = currentSet.plannedPracticeTime - currentTime;
          setCurrentTime(Math.max(0, remainingTime));
          manualActualTimeRef.current = null; // Clear ref
        }
      }
    } else {
      manualActualTimeRef.current = null; // Clear ref if not in manual mode
    }

    // Stop the workout and start rest timer
    setIsWorkoutActive(false);
    setIsTimerRunning(false);
    setIsResting(true);
    // When finishing a set, always leave manual input mode
    setManualInputMode(false);
    setActualRestTime(0); // Reset rest time counter
  };

  const saveChanges = async () => {
    const currentSet = activityDetail?.activitySets[currentSetIndex];
    if (!currentSet) return;

    // Pre-calc actual practice time for Time mode (used for API + local state)
    let actualPracticeTime = 0;
    if (activityDetail.activitySetType === "Time") {
      if (manualInputMode) {
        // Still in manual mode, currentTime is actual time
        actualPracticeTime = currentTime;
      } else if (manualActualTimeRef.current !== null) {
        // We have stored actual time from manual mode (when actual > planned)
        actualPracticeTime = manualActualTimeRef.current;
        manualActualTimeRef.current = null; // Clear after use
      } else {
        // Countdown mode: currentTime is remaining time
        actualPracticeTime = currentSet.plannedPracticeTime - currentTime;
      }
    }

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
        updateData.activitySet.practiceTime = actualPracticeTime;
        updateData.activitySet.numOfReps = 0;
      } else if (activityDetail.activitySetType === "Distance") {
        const distanceValue = Number(currentDistance) || 0;
        updateData.activitySet.actualDistance = distanceValue;
        updateData.activitySet.numOfReps = 0;
        updateData.activitySet.practiceTime = 0;
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
            ? actualPracticeTime
            : updatedSets[currentSetIndex].practiceTime,
        distance:
          activityDetail.activitySetType === "Distance"
            ? Number(currentDistance) || 0
            : updatedSets[currentSetIndex].distance,
      };

      setActivityDetail({
        ...activityDetail,
        activitySets: updatedSets,
      });

      // After saving, ensure manual input mode is turned off
      setManualInputMode(false);

      setHasUnsavedChanges(false);
      setIsResting(false);
      setActualRestTime(0);
      setCurrentDistance("");

      // Find the next uncompleted set
      const nextUncompletedIndex = updatedSets.findIndex(
        (set, index) => index > currentSetIndex && !set.isCompleted
      );

      // Move to next uncompleted set if found
      if (nextUncompletedIndex !== -1) {
        setCurrentSetIndex(nextUncompletedIndex);
        setCurrentReps(0);
        setCurrentTime(0);
        setCurrentDistance("");
      }

      Alert.alert(t("common.success"), t("trainingActivity.resultSaved"));
    } catch (error) {
      console.error("Error saving activity set:", error);
      Alert.alert(t("common.error"), t("trainingActivity.errorSavingResult"));
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
  const isDistanceMode = activityDetail.activitySetType === "Distance";

  const completedSets = activityDetail.activitySets.filter(
    (set) => set.isCompleted
  ).length;

  const muscle = getActivityMuscle();

  return (
    <View style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Main Timer Display */}
        <View style={styles.timerDisplayContainer}>
          {/* Show simple initial value only when not started, not resting and not in manual mode */}
          {!isWorkoutActive && !isResting && !manualInputMode ? (
            <Text style={styles.mainTimerText}>
              {isRepsMode ? "0" : isTimeMode ? "00:00" : "0 m"}
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
              {isRepsMode &&
                (manualInputMode ? (
                  <View style={styles.manualInputWrapper}>
                    <Text style={styles.manualInputLabel}>
                      {t("trainingActivity.completedReps") || "Completed reps"}
                    </Text>
                    <TextInput
                      style={styles.manualNumberInput}
                      value={currentReps.toString()}
                      onChangeText={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
                        setCurrentReps(Number.isNaN(num) ? 0 : num);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                    />
                    <Text style={styles.repsSubtext}>
                      / {currentSet.plannedNumOfReps} reps
                    </Text>
                  </View>
                ) : (
                  <View style={styles.repsContainer}>
                    <TouchableOpacity
                      style={styles.controlReps}
                      onPress={decrementReps}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.controlRepsText}>-</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity
                      style={styles.controlReps}
                      onPress={incrementReps}
                    >
                      <Text style={styles.controlRepsText}>+</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              {isTimeMode &&
                (manualInputMode ? (
                  <View style={styles.manualInputWrapper}>
                    <Text style={styles.manualInputLabel}>
                      {t("trainingActivity.actualTime") || "Actual time (sec)"}
                    </Text>
                    <TextInput
                      style={styles.manualNumberInput}
                      value={currentTime.toString()}
                      onChangeText={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
                        setCurrentTime(Number.isNaN(num) ? 0 : num);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                    />
                    <Text style={styles.repsSubtext}>
                      {t("trainingActivity.plannedTimeLabel", {
                        value: currentSet?.plannedPracticeTime || 0,
                      })}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.mainTimerTouchable}>
                    <Text style={styles.mainTimerText}>
                      {formatTime(currentTime).replace(":", ":")}
                    </Text>
                  </View>
                ))}
              {isDistanceMode && (
                <View style={styles.distanceInputWrapper}>
                  <Text style={styles.distanceInputLabel}>
                    {t("trainingActivity.distanceCompleted")}
                  </Text>
                  <View style={styles.distanceInputRow}>
                    <TextInput
                      style={styles.distanceInput}
                      value={currentDistance}
                      onChangeText={handleDistanceChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                      editable={isWorkoutActive || manualInputMode}
                      returnKeyType="done"
                    />
                    <Text style={styles.distanceUnit}>
                      {t("trainingActivity.meters")}
                    </Text>
                  </View>
                  <Text style={styles.distancePlannedText}>
                    {t("trainingActivity.plannedDistanceLabel", {
                      value: currentSet?.plannedDistance || 0,
                    })}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Manual input toggle - only for PT, positioned under timer */}

          <TouchableOpacity
            style={[
              styles.manualToggle,
              manualInputMode && styles.manualToggleActive,
            ]}
            onPress={() => {
              if (!isWorkoutActive) {
                Alert.alert(
                  t("trainingActivity.warning"),
                  t("trainingActivity.startBeforeManual") ||
                    "Please start the activity before using manual input."
                );
                return;
              }
              if (isTimeMode && isTimerRunning) {
                Alert.alert(
                  t("trainingActivity.warning"),
                  t("trainingActivity.pauseBeforeManual") ||
                    "Please pause or finish the timer before switching to manual input."
                );
                return;
              }

              // Toggle manual input mode
              const newManualMode = !manualInputMode;

              if (isTimeMode) {
                const currentSet =
                  activityDetail?.activitySets[currentSetIndex];
                if (currentSet) {
                  if (newManualMode) {
                    // Switching TO manual mode: convert remaining time to actual time
                    // currentTime is remaining time, convert to actual time
                    const actualTime =
                      currentSet.plannedPracticeTime - currentTime;
                    setCurrentTime(actualTime);
                    setIsTimerRunning(false); // Stop timer when entering manual mode
                  } else {
                    // Switching FROM manual mode: convert actual time back to remaining time
                    // currentTime is actual time, convert back to remaining time
                    const remainingTime =
                      currentSet.plannedPracticeTime - currentTime;
                    setCurrentTime(Math.max(0, remainingTime));
                  }
                }
              }

              setManualInputMode(newManualMode);
            }}
          >
            <Ionicons
              name={manualInputMode ? "create" : "hand-left-outline"}
              size={16}
              color={manualInputMode ? "#FFFFFF" : "#0F172A"}
            />
            <Text
              style={[
                styles.manualToggleText,
                manualInputMode && styles.manualToggleTextActive,
              ]}
            >
              {t("trainingActivity.manualInput") || "Manual input"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity Info Badge with asset & muscle info */}
        <View style={styles.activityBadgeContainer}>
          <View style={styles.activityBadge}>
            <View style={styles.muscleBadge}>
              {muscle?.image ? (
                <Image
                  source={muscle.image}
                  style={styles.muscleImage}
                  resizeMode="contain"
                />
              ) : (
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={28}
                  color="#1E293B"
                />
              )}
            </View>

            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>
                {activityDetail.activityName}
              </Text>
              {!!getActivityAssetLabel() && (
                <Text style={styles.activityAssetName}>
                  {getActivityAssetLabel()}
                </Text>
              )}

              <Text style={styles.activityProgress}>
                {completedSets}/{activityDetail.activitySets.length}{" "}
                {t("trainingActivity.completed")}
              </Text>
            </View>
            {getActivityAssetImage() && (
              <Image
                source={{ uri: getActivityAssetImage() }}
                style={styles.activityAssetImage}
                resizeMode="cover"
              />
            )}
          </View>
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

          {isDistanceMode && (
            <View style={styles.statItem}>
              <Ionicons name="map-outline" size={22} color="#F97316" />
              <Text style={styles.statLabel}>
                {t("trainingActivity.meters")}
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

                  // If switching to a completed set and user is FreelancePT, load existing values
                  const targetSet = activityDetail.activitySets[index];
                  const isEditingCompleted =
                    targetSet.isCompleted && userRole === "FreelancePT";

                  if (isEditingCompleted) {
                    // Load existing values for editing
                    if (activityDetail.activitySetType === "Reps") {
                      setCurrentReps(targetSet.numOfReps || 0);
                    } else if (activityDetail.activitySetType === "Time") {
                      setCurrentTime(targetSet.practiceTime || 0);
                      // Enable manual input mode for Time mode when editing completed sets
                      setManualInputMode(true);
                    } else if (activityDetail.activitySetType === "Distance") {
                      setCurrentDistance(
                        targetSet.actualDistance?.toString() || ""
                      );
                    }
                    setActualRestTime(targetSet.restTime || 0);
                  } else {
                    // Reset to default values for new/incomplete sets
                    setCurrentReps(0);
                    setCurrentTime(0);
                    setCurrentDistance("");
                    setActualRestTime(0);
                    setManualInputMode(false);
                  }
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
                {isDistanceMode && (
                  <Text
                    style={[
                      styles.setRowText,
                      isActive && styles.setRowTextActive,
                    ]}
                  >
                    {set.actualDistance || 0}m / {set.plannedDistance || 0}m
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
                // Only disable for customers, FreelancePT can edit completed sets
                currentSet.isCompleted &&
                  userRole !== "FreelancePT" &&
                  styles.actionButtonDisabled,
                { opacity: sessionState === "not-started" ? 0.5 : 1 },
              ]}
              onPress={startSet}
              disabled={
                (currentSet.isCompleted && userRole !== "FreelancePT") ||
                sessionState === "not-started"
              }
            >
              <Text style={styles.actionButtonText}>
                {currentSet.isCompleted && userRole === "FreelancePT"
                  ? t("trainingActivity.edit") || "Chỉnh sửa"
                  : currentSet.isCompleted
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
                  style={[
                    styles.pauseButton,
                    manualInputMode && styles.actionButtonDisabled,
                  ]}
                  onPress={toggleTimer}
                  disabled={manualInputMode}
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
  repsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
  },
  controlReps: {
    backgroundColor: "rgba(226, 232, 240, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    backdropFilter: "blur(10px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  controlRepsText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
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
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  repsSubtext: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
  },
  manualInputWrapper: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  manualInputLabel: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  manualNumberInput: {
    width: "60%",
    textAlign: "center",
    fontSize: 32,
    fontWeight: "500",
    color: "#1E293B",
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  distanceInputWrapper: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  distanceInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  distanceInputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  distanceInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: "300",
    color: "#1E293B",
    textAlign: "center",
  },
  distanceUnit: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F97316",
  },
  distancePlannedText: {
    fontSize: 14,
    color: "#64748B",
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
    width: 55,
    height: 55,
    borderRadius: 24,
    backgroundColor: "#FEF3E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FB923C",
  },
  muscleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    padding: 5,
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
  activityAssetName: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    marginBottom: 3,
  },
  activityAssetImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: "#E2E8F0",
  },
  activityProgress: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  manualToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#EEF2FF",
    marginTop: 12,
  },
  manualToggleActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4338CA",
  },
  manualToggleText: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "600",
  },
  manualToggleTextActive: {
    color: "#FFFFFF",
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
