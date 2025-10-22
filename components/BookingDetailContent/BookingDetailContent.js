import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";

const bodyPartImages = {
  chest: require("../../assets/images/bodyparts/chest.png"),
  back: require("../../assets/images/bodyparts/back.png"),

  shoulder: require("../../assets/images/bodyparts/shoulder.png"),
  biceps: require("../../assets/images/bodyparts/biceps.png"),
  triceps: require("../../assets/images/bodyparts/triceps.png"),
  foreArm: require("../../assets/images/bodyparts/foreArm.png"),
  thigh: require("../../assets/images/bodyparts/thigh.png"),
  glutes: require("../../assets/images/bodyparts/glutes.png"),
  calf: require("../../assets/images/bodyparts/calf.png"),
  waist: require("../../assets/images/bodyparts/waist.png"),
  fullbody: require("../../assets/images/bodyparts/fullbody.png"),
  other: require("../../assets/images/bodyparts/other.png"),
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

export default function BookingDetailContent({
  bookingDetail,
  userRole,
  navigation,
  t,
  onAddExercise,
}) {
  // Get unique activity types from sessionActivities
  const scrollViewRef = React.useRef(null);

  console.log("Booking Detail:", bookingDetail);
  const getUniqueActivityTypes = () => {
    if (
      !bookingDetail?.sessionActivities ||
      bookingDetail.sessionActivities.length === 0
    ) {
      return [];
    }
    const types = bookingDetail.sessionActivities.map(
      (activity) => activity.activityType
    );
    return [...new Set(types)];
  };

  // Get unique muscle groups from sessionActivities
  const getUniqueMuscleGroups = () => {
    if (
      !bookingDetail?.sessionActivities ||
      bookingDetail.sessionActivities.length === 0
    ) {
      return [];
    }
    const muscleGroups = bookingDetail.sessionActivities.flatMap(
      (activity) => activity.muscleGroup || []
    );
    return [...new Set(muscleGroups)];
  };

  const handleNoteFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Header */}
        {bookingDetail?.bookingName && (
          <View style={styles.headerCard}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="barbell" size={28} color={colors.orange} />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {bookingDetail.bookingName}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t("bookingDetail.sessionDetails")}
              </Text>
            </View>
          </View>
        )}

        {/* Activity Types Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.activityTypes")}
            </Text>
          </View>
          <View style={styles.activityTypesContainer}>
            {getUniqueActivityTypes().map((activityType, index) => {
              const activityTypeInfo = ACTIVITY_TYPES.find(
                (t) => t.id === activityType
              );
              return (
                <View
                  key={index}
                  style={[
                    styles.activityTypeChip,
                    { backgroundColor: activityTypeInfo?.color || "#f0f0f0" },
                  ]}
                >
                  <Ionicons
                    name={activityType === "WarmUp" ? "walk" : "barbell"}
                    size={16}
                    color="#333"
                  />
                  <Text style={styles.activityTypeText}>
                    {activityTypeInfo?.name || activityType}
                  </Text>
                </View>
              );
            })}
            {/* Empty state */}
            {getUniqueActivityTypes().length === 0 && (
              <View style={styles.emptyStateCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#999"
                />
                <Text style={styles.emptyText}>
                  {t("bookingDetail.noActivityTypes")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Muscle Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.mainMuscleGroups")}
            </Text>
          </View>
          <View style={styles.muscleGrid}>
            {getUniqueMuscleGroups().map((muscleId) => {
              const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);
              if (!muscle) return null;
              return (
                <View key={muscleId} style={styles.muscleCard}>
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
                </View>
              );
            })}
            {/* Empty state */}
            {getUniqueMuscleGroups().length === 0 && (
              <View style={styles.emptyStateCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#999"
                />
                <Text style={styles.emptyText}>
                  {t("bookingDetail.noMuscleGroups")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Activity Sets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.exerciseList")} (
              {bookingDetail?.sessionActivities?.length || 0})
            </Text>
          </View>

          {bookingDetail?.sessionActivities?.map((activity, actIndex) => (
            <View
              key={actIndex}
              style={[
                styles.setCard,
                activity.isCompleted && styles.completedSetCard,
              ]}
            >
              <TouchableOpacity
                style={styles.setCardContent}
                onPress={() =>
                  navigation.navigate("TrainingActivityScreen", {
                    activityId: activity.id,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.setHeader}>
                  <View style={styles.setTitleContainer}>
                    <Ionicons
                      name={
                        activity.isCompleted
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={20}
                      color={activity.isCompleted ? "#4CAF50" : colors.orange}
                    />
                    <Text style={styles.setTitle}>
                      {activity.activityName || t("bookingDetail.exerciseName")}
                    </Text>
                    {userRole === "FreelancePT" && (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          navigation.navigate("EditSessionActivityScreen", {
                            sessionActivity: activity,
                          })
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={25}
                          color={colors.orange}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {activity.isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.setTag,
                    {
                      backgroundColor:
                        ACTIVITY_TYPES.find(
                          (t) => t.id === activity.activityType
                        )?.color || "#f0f0f0",
                    },
                  ]}
                >
                  <Text style={styles.setTagText}>
                    {ACTIVITY_TYPES.find((t) => t.id === activity.activityType)
                      ?.name || activity.activityType}
                  </Text>
                </View>
                <View style={styles.setDetailContainer}>
                  <View style={styles.setDetailRow}>
                    <Ionicons name="layers-outline" size={16} color="#666" />
                    <Text style={styles.setDetailText}>
                      {activity.totalSets || 0} sets
                    </Text>
                  </View>
                  <View style={styles.setDetailRow}>
                    <Ionicons name="analytics-outline" size={16} color="#666" />
                    <Text style={styles.setDetailText}>
                      {activity.activitySetType === "Reps"
                        ? `${activity.totalPlannedNumOfReps || 0} reps`
                        : activity.activitySetType === "Time"
                        ? `${activity.totalPlannedPracticeTime || 0}s`
                        : activity.activitySetType === "Distance"
                        ? `${activity.totalPlannedDistance || 0}m`
                        : ""}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Edit Button - Only for FreelancePT */}
            </View>
          ))}

          {/* Empty state for sets */}
          {(!bookingDetail?.sessionActivities ||
            bookingDetail.sessionActivities.length === 0) && (
            <View style={styles.emptySetContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#ddd" />
              <Text style={styles.emptySetText}>
                {t("bookingDetail.noExercises")}
              </Text>
              {userRole === "FreelancePT" && (
                <Text style={styles.emptySetHint}>
                  {t("bookingDetail.addExerciseHint")}
                </Text>
              )}
            </View>
          )}

          {/* Add Button - Only for PT */}
          {userRole === "FreelancePT" && (
            <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
              <Ionicons name="add-circle" size={24} color={colors.white} />
              <Text style={styles.addButtonText}>
                {t("bookingDetail.addExercise")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>{t("bookingDetail.notes")}</Text>
          </View>
          <View style={styles.noteBox}>
            <TextInput
              style={styles.noteInput}
              placeholder={
                userRole === "FreelancePT"
                  ? t("bookingDetail.addNotesPlaceholder")
                  : t("bookingDetail.noNotes")
              }
              placeholderTextColor="#999"
              value={bookingDetail?.note || ""}
              editable={userRole === "FreelancePT"}
              multiline
              onFocus={handleNoteFocus}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconContainer: {
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
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  activityTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  emptyStateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  muscleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  muscleImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  muscleIcon: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  muscleName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
  setCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  setCardContent: {
    flex: 1,
    padding: 16,
  },
  completedSetCard: {
    backgroundColor: "#F0F8F0",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  setTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  setTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  setTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  setDetailContainer: {
    flexDirection: "row",
    gap: 16,
  },
  setDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  setDetailText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  emptySetContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  emptySetText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySetHint: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: colors.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  noteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteInput: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 22,
  },
  editButton: {
    padding: 0,
    marginRight: 8,
  },
});
