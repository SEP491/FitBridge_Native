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
import LoadingIndicator from "../../../components/LoadingIndicator";

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

export default function EditSessionActivityScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { sessionActivity, Booking } = route.params;
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Activity sets state
  const [activitySets, setActivitySets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [savingSetId, setSavingSetId] = useState(null);

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

  // Asset selection state
  const [assetTypeFilter, setAssetTypeFilter] = useState("Equipment"); // Equipment | NoneEquipment
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const user = await fetchUserFromStorage();
      if (!user) {
        console.log("No user found");
        navigation.goBack();
        return;
      }
      setUserRole(user.role);
      // Only allow FreelancePT to edit
      if (user.role !== "FreelancePT") {
        Alert.alert(
          t("bookingDetail.accessDeniedTitle") || "Access Denied",
          t("bookingDetail.accessDeniedMessage") ||
            "Only FreelancePT can edit session activities"
        );
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const loadSets = async () => {
    setSetsLoading(true);
    try {
      const res = await bookingService.getSetsOfActivity(sessionActivity.id);
      setActivitySets(res.data || []);
    } catch (error) {
      console.error("Error loading activity sets:", error);
      Alert.alert(
        t("common.error") || "Lỗi",
        t("bookingDetail.errorLoadingSets") || "Không thể tải danh sách set"
      );
    } finally {
      setSetsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionActivity?.id) {
      loadSets();
    }
    // Initialize selected asset from sessionActivity if available
    if (sessionActivity?.assetId) {
      // If asset info is available in sessionActivity, set it
      setSelectedAsset({
        assetId: sessionActivity.assetId,
        id: sessionActivity.assetId,
        name: sessionActivity.assetName,
        vietNameseName: sessionActivity.vietnameseAssetName,
        metadataImage:
          sessionActivity.assetImage || sessionActivity.metadataImage,
      });
    }
  }, [sessionActivity?.id]);

  // Load assets when muscle group changes
  useEffect(() => {
    if (muscleGroup) {
      fetchAssets();
    } else {
      setAvailableAssets([]);
      setSelectedAsset(null);
      setShowAssetDropdown(false);
    }
  }, [muscleGroup, assetTypeFilter]);

  // Refresh sets when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (sessionActivity?.id) {
        loadSets();
      }
    });
    return unsubscribe;
  }, [navigation, sessionActivity?.id]);

  const fetchAssets = async () => {
    if (!muscleGroup) {
      setAvailableAssets([]);
      setSelectedAsset(null);
      return;
    }

    try {
      setLoadingAssets(true);
      const res = await bookingService.getActivityMetadata({
        assetType: assetTypeFilter,
        muscleGroup: muscleGroup,
        doApplyPaging: false,
      });
      const items = res.data?.content || res.data || [];
      setAvailableAssets(items);
    } catch (error) {
      console.error("Error fetching activity assets:", error);
      Alert.alert(
        t("common.error") || "Lỗi",
        t("bookingDetail.cannotLoadAssets") ||
          "Cannot load assets for this activity."
      );
    } finally {
      setLoadingAssets(false);
    }
  };

  const updateSetField = (setId, field, value) => {
    setActivitySets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSet = async (setObj) => {
    try {
      setSavingSetId(setObj.id);
      const payload = {
        activitySetId: setObj.id,
        weightLifted: Number(setObj.weightLifted) || 0,
        plannedNumOfReps:
          activitySetType === "Reps" ? Number(setObj.plannedNumOfReps) || 0 : 0,
        plannedPracticeTime:
          activitySetType === "Time"
            ? Number(setObj.plannedPracticeTime) || 0
            : 0,
        plannedDistance:
          activitySetType === "Distance"
            ? Number(setObj.plannedDistance) || 0
            : 0,
      };

      await bookingService.updateActivitySetPlan(payload);
      Alert.alert(
        t("common.success") || "Thành công",
        t("bookingDetail.updateSetSuccess") || "Đã cập nhật set thành công"
      );
    } catch (error) {
      console.error("Error updating set plan:", error);
      Alert.alert(
        t("common.error") || "Lỗi",
        error.response?.data?.message ||
          t("bookingDetail.updateSetError") ||
          "Không thể cập nhật set"
      );
    } finally {
      setSavingSetId(null);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!activityName.trim()) {
      Alert.alert(
        t("common.error") || "Lỗi",
        t("bookingDetail.enterExerciseName") || "Vui lòng nhập tên hoạt động"
      );
      return;
    }
    if (!muscleGroup) {
      Alert.alert(
        t("common.error") || "Lỗi",
        t("bookingDetail.selectMuscleGroup") || "Vui lòng chọn nhóm cơ"
      );
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
        ...(selectedAsset && {
          assetId: selectedAsset.assetId || selectedAsset.id,
        }),
      };

      await bookingService.updateSessionActivity(payload);

      Alert.alert(
        t("common.success") || "Thành công",
        t("bookingDetail.updateActivitySuccess") ||
          "Đã cập nhật hoạt động thành công",
        [
          {
            text: t("common.ok") || "OK",
            onPress: () =>
              navigation.navigate("BookingDetailScreen", {
                refresh: true,
                Booking: Booking,
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating session activity:", error);
      Alert.alert(
        t("common.error") || "Lỗi",
        error.response?.data?.message ||
          t("bookingDetail.updateActivityError") ||
          "Không thể cập nhật hoạt động"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("bookingDetail.confirmDeleteTitle") || "Xác nhận xóa",
      t("bookingDetail.confirmDeleteMessage") ||
        "Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác.",
      [
        {
          text: t("common.cancel") || "Hủy",
          style: "cancel",
        },
        {
          text: t("common.delete") || "Xóa",
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

      Alert.alert(
        t("common.success") || "Thành công",
        t("bookingDetail.deleteActivitySuccess") ||
          "Đã xóa hoạt động thành công",
        [
          {
            text: t("common.ok") || "OK",
            onPress: () =>
              navigation.navigate("BookingDetailScreen", { refresh: true }),
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting session activity:", error);
      Alert.alert(
        t("common.error") || "Lỗi",
        error.response?.data?.message ||
          t("bookingDetail.deleteActivityError") ||
          "Không thể xóa hoạt động"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingIndicator variant="page" color={colors.orange} />;
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

        {/* Activity Type Selection (horizontal) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.activityType") || "Loại hoạt động"}
          </Text>
          <View style={styles.typeButtonsContainer}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  styles.halfButton,
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

        {/* Exercise Type Selection (vertical) */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.exerciseType") || "Loại bài tập"}
          </Text>
          <View style={styles.verticalListContainer}>
            {ACTIVITY_SET_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  activitySetType === type && styles.setTypeButtonActive,
                  { width: "100%" },
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
                  {type === "Reps"
                    ? t("bookingDetail.reps") || "Số lần lặp"
                    : type === "Time"
                    ? t("bookingDetail.time") || "Thời gian"
                    : t("bookingDetail.distance") || "Quãng đường"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Muscle Group Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.mainMuscleGroups") || "Nhóm cơ"}
          </Text>
          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((muscle) => (
              <TouchableOpacity
                key={muscle.id}
                style={[
                  styles.muscleCard,
                  muscleGroup === muscle.id && styles.muscleCardSelected,
                ]}
                onPress={() => {
                  setMuscleGroup(muscle.id);
                  // Clear asset selection when muscle group changes
                  setSelectedAsset(null);
                  setAvailableAssets([]);
                  setShowAssetDropdown(false);
                }}
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

        {/* Asset Type Selection */}
        {muscleGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.assetType") || "Loại thiết bị"}
            </Text>
            <View style={styles.typeButtonsContainer}>
              {["Equipment", "NoneEquipment"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    styles.halfButton,
                    assetTypeFilter === type && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    setAssetTypeFilter(type);
                    setSelectedAsset(null);
                    setShowAssetDropdown(false);
                  }}
                >
                  {assetTypeFilter === type && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.typeButtonText,
                      assetTypeFilter === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type === "Equipment"
                      ? t("bookingDetail.equipment") || "Thiết bị"
                      : t("bookingDetail.noneEquipment") || "Không thiết bị"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Asset Selection */}
        {muscleGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.asset") || "Thiết bị"}
            </Text>
            {loadingAssets ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator variant="inline" color={colors.orange} />
              </View>
            ) : (
              <View style={styles.assetContainer}>
                <TouchableOpacity
                  style={styles.assetSelector}
                  onPress={() =>
                    setShowAssetDropdown((prevVisible) => !prevVisible)
                  }
                >
                  <Text
                    style={
                      selectedAsset
                        ? styles.assetSelectorText
                        : styles.assetSelectorPlaceholder
                    }
                  >
                    {selectedAsset
                      ? selectedAsset.vietNameseName ||
                        selectedAsset.name ||
                        selectedAsset.vietnameseDescription
                      : t("bookingDetail.selectAsset") || "Chọn thiết bị"}
                  </Text>
                  <Ionicons
                    name={showAssetDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>

                {showAssetDropdown && (
                  <View style={styles.assetDropdown}>
                    {availableAssets && availableAssets.length > 0 ? (
                      <ScrollView
                        style={styles.assetDropdownScroll}
                        nestedScrollEnabled
                      >
                        {availableAssets.map((asset) => (
                          <TouchableOpacity
                            key={
                              asset.assetId ||
                              asset.id ||
                              asset.code ||
                              Math.random()
                            }
                            style={styles.assetOption}
                            onPress={() => {
                              setSelectedAsset(asset);
                              setShowAssetDropdown(false);
                            }}
                          >
                            <View style={styles.assetOptionRow}>
                              {asset.metadataImage ? (
                                <Image
                                  source={{ uri: asset.metadataImage }}
                                  style={styles.assetOptionImage}
                                />
                              ) : (
                                <View style={styles.assetOptionIcon}>
                                  <Ionicons
                                    name={
                                      assetTypeFilter === "Equipment"
                                        ? "barbell-outline"
                                        : "fitness-outline"
                                    }
                                    size={24}
                                    color={colors.orange}
                                  />
                                </View>
                              )}
                              <Text style={styles.assetOptionText}>
                                {asset.vietNameseName ||
                                  asset.name ||
                                  asset.vietnameseDescription}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={styles.assetEmptyContainer}>
                        <Text style={styles.assetEmptyText}>
                          {t("bookingDetail.noAssetsFound") ||
                            "Không tìm thấy thiết bị."}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Selected Asset Preview */}
            {selectedAsset && (
              <View style={styles.selectedAssetPreview}>
                {selectedAsset.metadataImage && (
                  <Image
                    source={{ uri: selectedAsset.metadataImage }}
                    style={styles.selectedAssetImage}
                  />
                )}
                <View style={styles.selectedAssetInfo}>
                  <Text style={styles.selectedAssetName}>
                    {selectedAsset.vietNameseName ||
                      selectedAsset.name ||
                      selectedAsset.vietnameseDescription}
                  </Text>
                  {selectedAsset.vietnameseDescription && (
                    <Text style={styles.selectedAssetDescription}>
                      {selectedAsset.vietnameseDescription}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Activity Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.exerciseName") || "Tên hoạt động"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              t("bookingDetail.enterExerciseName") || "Nhập tên hoạt động"
            }
            value={activityName}
            onChangeText={setActivityName}
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.notes") || "Ghi chú"}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={
              t("bookingDetail.addNotesPlaceholder") || "Nhập ghi chú"
            }
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Nutrition Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.nutritionTip") || "Lời khuyên dinh dưỡng"}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={
              t("bookingDetail.enterNutritionTip") ||
              "Nhập lời khuyên dinh dưỡng"
            }
            value={nutritionTip}
            onChangeText={setNutritionTip}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Activity Sets (view-only with edit icon) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("bookingDetail.exerciseSets") || "Các Set"}
          </Text>

          {setsLoading ? (
            <LoadingIndicator variant="inline" color={colors.orange} />
          ) : activitySets.length === 0 ? (
            <Text style={styles.emptySetsText}>
              {t("bookingDetail.noSets") || "Chưa có set nào"}
            </Text>
          ) : (
            activitySets.map((setItem, idx) => {
              const isReps = activitySetType === "Reps";
              const isTime = activitySetType === "Time";
              const isDistance = activitySetType === "Distance";

              return (
                <View key={setItem.id} style={styles.setRow}>
                  <View style={styles.setHeaderRow}>
                    <Text style={styles.setIndex}>Set {idx + 1}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("EditActivitySetScreen", {
                          set: setItem,
                          activitySetType,
                        })
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={22}
                        color={colors.orange}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.setSummaryRow}>
                    {!isDistance && (
                      <Text style={styles.setSummaryText}>
                        {setItem.weightLifted || 0} kg
                      </Text>
                    )}
                    {isReps && (
                      <Text style={styles.setSummaryText}>
                        {setItem.plannedNumOfReps || 0} reps
                      </Text>
                    )}
                    {isTime && (
                      <Text style={styles.setSummaryText}>
                        {setItem.plannedPracticeTime || 0}s
                      </Text>
                    )}
                    {isDistance && (
                      <Text style={styles.setSummaryText}>
                        {setItem.plannedDistance || 0} m
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <LoadingIndicator variant="button" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>
                  {t("common.delete") || "Xóa"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <LoadingIndicator variant="button" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {t("common.save") || "Lưu"}
                </Text>
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
  verticalListContainer: {
    flexDirection: "column",
    gap: 10,
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
  // Sets editing styles
  emptySetsText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  setRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  setHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  setFieldsRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "600",
  },
  saveSetButton: {
    backgroundColor: colors.orange,
    marginTop: 12,
    gap: 8,
  },
  setSummaryRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  setSummaryText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  // Asset selection styles
  assetContainer: {
    position: "relative",
    zIndex: 1,
  },
  assetSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  assetSelectorText: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
    flex: 1,
  },
  assetSelectorPlaceholder: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
    flex: 1,
  },
  assetDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginTop: 4,
    maxHeight: 200,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  assetDropdownScroll: {
    maxHeight: 200,
  },
  assetOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  assetOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetOptionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  assetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FEF3E2",
    justifyContent: "center",
    alignItems: "center",
  },
  assetOptionText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
    flex: 1,
  },
  assetEmptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  assetEmptyText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  selectedAssetPreview: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  selectedAssetImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  selectedAssetInfo: {
    flex: 1,
  },
  selectedAssetName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  selectedAssetDescription: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});
