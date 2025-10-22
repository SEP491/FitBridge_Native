import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import bookingService from "../../../services/bookingService";
import { fetchUserFromStorage } from "../../../lib";
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

const ACTIVITY_SET_TYPES = ["Reps", "Time"];

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

export default function EditSessionActivityScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { sessionActivity } = route.params;
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [activityType, setActivityType] = useState(
    sessionActivity?.activityType || "WarmUp"
  );
  const [activitySetType, setActivitySetType] = useState(
    sessionActivity?.activitySetType || "Reps"
  );
  const [activityName, setActivityName] = useState(
    sessionActivity?.activityName || ""
  );
  const [note, setNote] = useState(sessionActivity?.note || "");
  const [nutritionTip, setNutritionTip] = useState(
    sessionActivity?.nutritionTip || ""
  );
  const [muscleGroup, setMuscleGroup] = useState(
    sessionActivity?.muscleGroup || ""
  );

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const user = await fetchUserFromStorage();
      console.log("Current user:", user.role);
      setUserRole(user.role);

      // Only allow FreelancePT to edit
      if (user.role !== "FreelancePT") {
        Alert.alert(
          "Access Denied",
          "Only FreelancePT can edit session activities"
        );
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!activityName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên hoạt động");
      return;
    }
    if (!muscleGroup) {
      Alert.alert("Lỗi", "Vui lòng chọn nhóm cơ");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sessionActivityId: sessionActivity.id,
        activityType: activityType,
        activityName: activityName.trim(),
        activitySetType: activitySetType,
        note: note.trim(),
        nutritionTip: nutritionTip.trim(),
        muscleGroup: muscleGroup,
      };

      console.log("Updating session activity:", payload);
      await bookingService.updateSessionActivity(payload);

      Alert.alert("Thành công", "Đã cập nhật hoạt động thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating session activity:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể cập nhật hoạt động"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await bookingService.deleteSessionActivity(sessionActivity.id);

      Alert.alert("Thành công", "Đã xóa hoạt động thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error deleting session activity:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể xóa hoạt động"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        {/* Activity Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Loại hoạt động</Text>
          <View style={styles.typeButtonsContainer}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  activityType === type.id && styles.typeButtonActive,
                ]}
                onPress={() => setActivityType(type.id)}
              >
                {activityType === type.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
                <Text
                  style={[
                    styles.typeButtonText,
                    activityType === type.id && styles.typeButtonTextActive,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Set Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Loại bài tập</Text>
          <View style={styles.typeButtonsContainer}>
            {ACTIVITY_SET_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  styles.halfButton,
                  activitySetType === type && styles.setTypeButtonActive,
                ]}
                onPress={() => setActivitySetType(type)}
              >
                {activitySetType === type && (
                  <View
                    style={[styles.selectedIndicator, styles.blueIndicator]}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
                <Text
                  style={[
                    styles.typeButtonText,
                    activitySetType === type && styles.setTypeButtonTextActive,
                  ]}
                >
                  {type === "Reps" ? "Số lần lặp" : "Thời gian"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Muscle Group Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nhóm cơ</Text>
          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((muscle) => (
              <TouchableOpacity
                key={muscle.id}
                style={[
                  styles.muscleCard,
                  muscleGroup === muscle.id && styles.muscleCardSelected,
                ]}
                onPress={() => setMuscleGroup(muscle.id)}
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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tên hoạt động</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên hoạt động"
            value={activityName}
            onChangeText={setActivityName}
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập ghi chú"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Nutrition Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lời khuyên dinh dưỡng</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập lời khuyên dinh dưỡng"
            value={nutritionTip}
            onChangeText={setNutritionTip}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Lưu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },

  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  typeButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
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
  setTypeButtonActive: {
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
    backgroundColor: colors.orange,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.orange,
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
  typeButtonTextActive: {
    color: colors.orange,
    fontWeight: "700",
  },
  setTypeButtonTextActive: {
    color: colors.orange,
    fontWeight: "700",
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  muscleCard: {
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
  muscleName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    lineHeight: 14,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButton: {
    backgroundColor: "#DC2626",
  },
  saveButton: {
    backgroundColor: colors.orange,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
