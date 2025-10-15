import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import bookingService from "../../../services/bookingService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../constants/color";

const { width } = Dimensions.get("window");

export default function TrainingActivityScreen({ route, navigation }) {
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
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
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
        Alert.alert("Lỗi", "Không thể tải thông tin bài tập");
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

  // Rest timer
  useEffect(() => {
    if (isResting && restTimeRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
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
  }, [isResting, restTimeRemaining]);

  const startSet = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Cảnh báo",
        "Bạn cần lưu kết quả bài tập hiện tại trước khi tiếp tục",
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

  const saveChanges = async () => {
    const currentSet = activityDetail?.activitySets[currentSetIndex];
    if (!currentSet) return;

    try {
      const updateData = {
        activitySet: {
          activitySetId: currentSet.id,
          weightLifted: currentSet.weightLifted,
          isCompleted: true,
          restTime: currentSet.restTime,
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
      setIsWorkoutActive(false);
      setIsTimerRunning(false);

      Alert.alert("Thành công", "Đã lưu kết quả bài tập", [
        {
          text: "OK",
          onPress: () => {
            // Start rest timer
            if (currentSet.restTime > 0) {
              setRestTimeRemaining(currentSet.restTime);
              setIsResting(true);
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving activity set:", error);
      Alert.alert("Lỗi", "Không thể lưu kết quả bài tập");
    }
  };

  const goToNextSet = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Cảnh báo",
        "Bạn cần lưu kết quả bài tập hiện tại trước khi chuyển sang bài tập khác",
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
        "Cảnh báo",
        "Bạn cần lưu kết quả bài tập hiện tại trước khi chuyển sang bài tập khác",
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
          <Text>Đang tải...</Text>
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
          {!isWorkoutActive ? (
            <Text style={styles.mainTimerText}>00:00,00</Text>
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
                    /{currentSet.plannedNumOfReps} reps
                  </Text>
                </TouchableOpacity>
              )}
              {isTimeMode && (
                <View style={styles.mainTimerTouchable}>
                  <Text style={styles.mainTimerText}>
                    {formatTime(currentTime).replace(":", ",")}
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
                {completedSets}/{activityDetail.activitySets.length} hoàn thành
              </Text>
            </View>
          </View>
          {/* {!currentSet.isCompleted && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Đang tập</Text>
            </TouchableOpacity>
          )} */}
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>Hiệp</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="barbell-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>Kg</Text>
          </View>

          {isRepsMode && (
            <View style={styles.statItem}>
              <Ionicons name="repeat-outline" size={22} color="#F97316" />
              <Text style={styles.statLabel}>Lượt</Text>
            </View>
          )}

          {isTimeMode && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={22} color="#F97316" />
              <Text style={styles.statLabel}>Giây</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <Ionicons name="pause-circle-outline" size={22} color="#F97316" />
            <Text style={styles.statLabel}>Nghỉ</Text>
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
                      "Cảnh báo",
                      "Bạn cần lưu kết quả bài tập hiện tại trước khi chuyển sang bài tập khác"
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
          {!isWorkoutActive ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                currentSet.isCompleted && styles.actionButtonDisabled,
              ]}
              onPress={startSet}
              disabled={currentSet.isCompleted}
            >
              <Text style={styles.actionButtonText}>
                {currentSet.isCompleted ? "Đã hoàn thành" : "Bắt đầu"}
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
                    {isTimerRunning ? "Tạm dừng" : "Tiếp tục"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Rest Timer Modal */}
        <Modal visible={isResting} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.restModal}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={48}
                color={colors.orange}
              />
              <Text style={styles.restTitle}>Thời gian nghỉ</Text>
              <Text style={styles.restTimer}>
                {formatTime(restTimeRemaining)}
              </Text>
              <TouchableOpacity
                style={styles.skipRestButton}
                onPress={() => {
                  setIsResting(false);
                  setRestTimeRemaining(0);
                }}
              >
                <Text style={styles.skipRestText}>Bỏ qua nghỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  // Rest Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  restModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 40,
    alignItems: "center",
    minWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FB923C",
  },
  restTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#334155",
    marginTop: 16,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  restTimer: {
    fontSize: 68,
    fontWeight: "300",
    color: "#F97316",
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
  },
  skipRestButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#FEF3E2",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FB923C",
  },
  skipRestText: {
    fontSize: 16,
    color: "#F97316",
    fontWeight: "700",
  },
});
