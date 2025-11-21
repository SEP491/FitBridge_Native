import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import bookingService from "../../../services/bookingService";
import { fetchUserFromStorage } from "../../../lib";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import BookingDetailContent from "../../../components/BookingDetailContent";
import BookingResultCard from "../../../components/BookingResultCard";

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

const ACTIVITY_TYPES = [
  { id: "WarmUp", name: "Warm Up", color: "#FFF7ED", iconColor: "#EA580C" },
  {
    id: "Resistance",
    name: "Resistance",
    color: "#ECFDF5",
    iconColor: "#059669",
  },
  { id: "Cardio", name: "Cardio", color: "#EFF6FF", iconColor: "#2563EB" },
  { id: "Mobility", name: "Mobility", color: "#F5F3FF", iconColor: "#7C3AED" },
  { id: "CoolDown", name: "Cool Down", color: "#ECFEFF", iconColor: "#06B6D4" },
  { id: "Rehab", name: "Rehab", color: "#FEF2F2", iconColor: "#DC2626" },
];

const ACTIVITY_SET_TYPES = ["Reps", "Time", "Distance"];

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

export default function BookingDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { Booking } = route.params;

  console.log("Booking passed to BookingDetailScreen:", Booking);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResult, setLoadingResult] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "results"

  // Form states for PT - Add Activity Modal
  const [activityType, setActivityType] = useState("WarmUp");
  const [activitySetType, setActivitySetType] = useState("Reps");
  const [activityName, setActivityName] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [activitySets, setActivitySets] = useState([
    {
      plannedNumOfReps: "",
      weightLifted: "",
      plannedPracticeTime: "",
      plannedDistance: "",
    },
  ]);

  useEffect(() => {
    fetchUser();
    fetchBookingDetail();
  }, [Booking]);

  useEffect(() => {
    if (activeTab === "results" && !bookingResult) {
      fetchBookingResult();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    try {
      const user = await fetchUserFromStorage();
      console.log("Current user:", user.role);
      setUserRole(user.role);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingDetail(Booking.bookingId);
      console.log("Booking Detail:", response.data);
      setBookingDetail(response.data);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingResult = async () => {
    try {
      setLoadingResult(true);
      const response = await bookingService.getBookingResult(Booking.bookingId);
      console.log("Booking Result:", response.data);
      setBookingResult(response.data);
    } catch (error) {
      console.error("Error fetching booking result:", error);
      // Don't show error if result doesn't exist yet
    } finally {
      setLoadingResult(false);
    }
  };

  const isEmptyContent = () => {
    if (!bookingDetail) return true;
    return (
      bookingDetail.bookingId === "00000000-0000-0000-0000-000000000000" ||
      !bookingDetail.sessionActivities ||
      bookingDetail.sessionActivities.length === 0
    );
  };

  const toggleMuscleGroup = (muscleId) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleId)
        ? prev.filter((id) => id !== muscleId)
        : [...prev, muscleId]
    );
  };

  const addSet = () => {
    setActivitySets([
      ...activitySets,
      {
        plannedNumOfReps: "",
        weightLifted: "",
        plannedPracticeTime: "",
        plannedDistance: "",
      },
    ]);
  };

  const removeSet = (index) => {
    if (activitySets.length > 1) {
      setActivitySets(activitySets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...activitySets];
    newSets[index][field] = value;
    setActivitySets(newSets);
  };

  const resetForm = () => {
    setActivityType("WarmUp");
    setActivitySetType("Reps");
    setActivityName("");
    setSelectedMuscles([]);
    setActivitySets([
      {
        plannedNumOfReps: "",
        weightLifted: "",
        plannedPracticeTime: "",
        plannedDistance: "",
      },
    ]);
  };

  const handleCreateActivity = async () => {
    // Validation
    if (!activityName.trim()) {
      Alert.alert(
        t("bookingDetail.error"),
        t("bookingDetail.enterActivityName")
      );
      return;
    }
    if (selectedMuscles.length === 0) {
      Alert.alert(
        t("bookingDetail.error"),
        t("bookingDetail.selectAtLeastOneMuscleGroup")
      );
      return;
    }

    // Validate sets based on activity set type
    const validSets = activitySets.filter((set) => {
      if (activitySetType === "Reps") {
        return set.plannedNumOfReps && set.plannedNumOfReps > 0;
      }
      if (activitySetType === "Time") {
        return set.plannedPracticeTime && set.plannedPracticeTime > 0;
      }
      // Distance
      return set.plannedDistance && set.plannedDistance > 0;
    });

    if (validSets.length === 0) {
      Alert.alert(
        t("bookingDetail.error"),
        t("bookingDetail.enterExerciseInfo")
      );
      return;
    }

    setCreating(true);
    try {
      const payload = {
        bookingId: Booking.bookingId,
        activityType: activityType,
        activitySetType: activitySetType,
        activityName: activityName.trim(),
        muscleGroups: selectedMuscles,
        activitySets: validSets.map((set) => ({
          plannedNumOfReps:
            activitySetType === "Reps"
              ? parseInt(set.plannedNumOfReps) || 0
              : 0,
          weightLifted:
            activitySetType === "Reps" ? parseFloat(set.weightLifted) || 0 : 0,
          plannedPracticeTime:
            activitySetType === "Time"
              ? parseInt(set.plannedPracticeTime) || 0
              : 0,
          plannedDistance:
            activitySetType === "Distance"
              ? parseInt(set.plannedDistance) || 0
              : 0,
        })),
      };

      console.log("Creating activity:", payload);
      await bookingService.createSessionActivities(payload);

      Alert.alert(
        t("bookingDetail.success"),
        t("bookingDetail.activityCreatedSuccessfully")
      );
      setShowAddModal(false);
      resetForm();
      fetchBookingDetail();
    } catch (error) {
      console.error("Error creating activity:", error);
      Alert.alert(
        t("bookingDetail.error"),
        error.response?.data?.message || t("bookingDetail.cannotCreateActivity")
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  // Customer view - Empty state
  if (userRole === "Customer" && isEmptyContent()) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>{t("bookingDetail.noContent")}</Text>
        <Text style={styles.emptySubtitle}>
          {t("bookingDetail.ptHasNotCreatedContent")}
        </Text>
      </View>
    );
  }

  const renderTabContent = () => {
    if (activeTab === "details") {
      return (
        <BookingDetailContent
          bookingDetail={bookingDetail}
          Booking={Booking}
          userRole={userRole}
          navigation={navigation}
          t={t}
          onAddExercise={() => setShowAddModal(true)}
        />
      );
    } else {
      if (loadingResult) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.orange} />
          </View>
        );
      }
      return (
        <BookingResultCard
          result={bookingResult}
          navigation={navigation}
          Booking={Booking}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && styles.activeTab]}
          onPress={() => setActiveTab("details")}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === "details" ? colors.orange : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "details" && styles.activeTabText,
            ]}
          >
            {t("bookingDetail.sessionDetailsTab")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "results" && styles.activeTab]}
          onPress={() => setActiveTab("results")}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={activeTab === "results" ? colors.orange : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "results" && styles.activeTabText,
            ]}
          >
            {t("bookingDetail.trainingResultsTab")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("bookingDetail.addExerciseModal")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Activity Type Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {t("bookingDetail.activityType")}
                </Text>
                <View style={styles.typeButtonsContainer}>
                  {ACTIVITY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        activityType === type.id && styles.activityTypeActive,
                      ]}
                      onPress={() => setActivityType(type.id)}
                    >
                      {activityType === type.id && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.typeButtonText,
                          activityType === type.id &&
                            styles.activityTypeTextActive,
                        ]}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Set Type - vertical list */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {t("bookingDetail.exerciseType")}
                </Text>
                <View style={{ gap: 10 }}>
                  {ACTIVITY_SET_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        activitySetType === type && styles.typeButtonActive,
                        { width: "100%" },
                      ]}
                      onPress={() => setActivitySetType(type)}
                    >
                      {activitySetType === type && (
                        <View
                          style={[
                            styles.selectedIndicator,
                            styles.blueIndicator,
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.typeButtonText,
                          activitySetType === type &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {type === "Reps"
                          ? t("bookingDetail.reps")
                          : type === "Time"
                          ? t("bookingDetail.time")
                          : t("bookingDetail.distance")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Muscle Groups Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {t("bookingDetail.selectMuscleGroups")}
                </Text>
                <View style={styles.muscleGrid}>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <TouchableOpacity
                      key={muscle.id}
                      style={[
                        styles.muscleCardSelectable,
                        selectedMuscles.includes(muscle.id) &&
                          styles.muscleCardSelected,
                      ]}
                      onPress={() => toggleMuscleGroup(muscle.id)}
                    >
                      {muscle.image ? (
                        <Image
                          source={muscle.image}
                          style={styles.muscleImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.muscleIcon}>
                          <Ionicons name="body" size={32} color="#FF914D" />
                        </View>
                      )}
                      <Text style={styles.muscleName}>{muscle.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {t("bookingDetail.exerciseName")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("bookingDetail.enterExerciseName")}
                  value={activityName}
                  onChangeText={setActivityName}
                />
              </View>

              {/* Activity Sets */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {t("bookingDetail.exerciseDetails")}
                </Text>
                {activitySets.map((set, index) => (
                  <View key={index} style={styles.setInputCard}>
                    <View style={styles.setInputHeader}>
                      <Text style={styles.setInputTitle}>
                        {t("bookingDetail.set")} {index + 1}
                      </Text>
                      {activitySets.length > 1 && (
                        <TouchableOpacity onPress={() => removeSet(index)}>
                          <Ionicons name="trash" size={20} color={colors.red} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {activitySetType === "Reps" ? (
                      <View style={styles.setInputRow}>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>
                            {t("bookingDetail.reps")}
                          </Text>
                          <TextInput
                            style={styles.smallInput}
                            placeholder="15"
                            keyboardType="numeric"
                            value={set.plannedNumOfReps}
                            onChangeText={(val) =>
                              updateSet(index, "plannedNumOfReps", val)
                            }
                          />
                        </View>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>
                            {t("bookingDetail.weight")}
                          </Text>
                          <TextInput
                            style={styles.smallInput}
                            placeholder="10"
                            keyboardType="numeric"
                            value={set.weightLifted}
                            onChangeText={(val) =>
                              updateSet(index, "weightLifted", val)
                            }
                          />
                        </View>
                      </View>
                    ) : activitySetType === "Time" ? (
                      <View style={styles.setInputRow}>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>
                            {t("bookingDetail.duration")}
                          </Text>
                          <TextInput
                            style={styles.smallInput}
                            placeholder="60"
                            keyboardType="numeric"
                            value={set.plannedPracticeTime}
                            onChangeText={(val) =>
                              updateSet(index, "plannedPracticeTime", val)
                            }
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.setInputRow}>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>
                            {t("bookingDetail.distance")}
                          </Text>
                          <TextInput
                            style={styles.smallInput}
                            placeholder="1000"
                            keyboardType="numeric"
                            value={set.plannedDistance}
                            onChangeText={(val) =>
                              updateSet(index, "plannedDistance", val)
                            }
                          />
                        </View>
                      </View>
                    )}
                  </View>
                ))}

                <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#64748B"
                  />
                  <Text style={styles.addSetButtonText}>
                    {t("bookingDetail.addSet")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateActivity}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t("bookingDetail.confirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: colors.orange,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: colors.orange,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F97316",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
    marginLeft: 8,
  },
  // Header Card
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF3E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  // Section Styles
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },
  // Activity Types
  activityTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  activityTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  // Muscle Groups
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  muscleCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  muscleCardSelectable: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  muscleCardSelected: {
    borderColor: "#F97316",
    backgroundColor: "#FEF3E2",
    shadowColor: "#F97316",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2.5,
  },
  muscleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  muscleImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  muscleEmoji: {
    fontSize: 24,
  },
  muscleName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    lineHeight: 14,
  },
  // Set Cards
  setCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFE5CC",
    shadowColor: "#FF914D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  setHeader: {
    marginBottom: 12,
  },
  setTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D3142",
  },
  setTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  setTagText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D3142",
  },
  setDetailContainer: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: "#FFF5E6",
  },
  setDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setDetailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A5568",
  },
  // Empty States
  emptyStateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 10,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptySetContainer: {
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptySetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 12,
  },
  emptySetHint: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    fontWeight: "500",
  },
  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.red,
    marginTop: 10,
    gap: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
  },
  // Note Box
  noteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 18,
    minHeight: 120,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  noteInput: {
    fontSize: 15,
    color: "#2D3142",
    textAlignVertical: "top",
    lineHeight: 24,
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  typeButton: {
    width: "48%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    position: "relative",
    overflow: "hidden",
  },
  halfButton: {
    flex: 0.48,
  },
  activityTypeActive: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.red,
    borderWidth: 2.5,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  typeButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.orange,
    borderWidth: 2.5,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  blueIndicator: {
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  activityTypeTextActive: {
    color: colors.red,
    fontWeight: "700",
  },
  typeButtonTextActive: {
    color: colors.orange,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    color: "#1E293B",
    fontWeight: "500",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  setInputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  setInputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  setInputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  setInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  smallInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    color: "#1E293B",
    fontWeight: "600",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    gap: 8,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  addSetButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  submitButton: {
    backgroundColor: "#F97316",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
