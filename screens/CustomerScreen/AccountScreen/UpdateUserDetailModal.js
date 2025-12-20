import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserDetailService from "../../../services/user-detailService";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingIndicator from "../../../components/LoadingIndicator";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const FormSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const InputFieldSkeleton = () => (
    <View style={styles.inputFieldContainer}>
      <Animated.View style={[styles.skeletonLabel, { opacity }]} />
      <Animated.View style={[styles.skeletonInput, { opacity }]} />
    </View>
  );

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Body Measurements Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.skeletonSectionTitle, { opacity }]} />

        {/* Input Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <View key={row} style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <InputFieldSkeleton />
            </View>
            <View style={styles.inputHalf}>
              <InputFieldSkeleton />
            </View>
          </View>
        ))}
      </View>

      {/* Additional Info Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.skeletonSectionTitle, { opacity }]} />
        <InputFieldSkeleton />
        <View style={styles.inputFieldContainer}>
          <Animated.View style={[styles.skeletonLabel, { opacity }]} />
          <Animated.View style={[styles.skeletonTextArea, { opacity }]} />
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const UpdateUserDetailModal = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    biceps: "",
    foreArm: "",
    thigh: "",
    calf: "",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    height: "",
    weight: "",
    experience: "",
    bio: "",
  });

  useEffect(() => {
    if (visible) {
      fetchUserDetails();
    }
  }, [visible]);

  const fetchUserDetails = async () => {
    setFetching(true);
    try {
      const response = await UserDetailService.getUserDetail();
      if (response && response.data) {
        setFormData({
          biceps: response.data.biceps?.toString() || "",
          foreArm: response.data.foreArm?.toString() || "",
          thigh: response.data.thigh?.toString() || "",
          calf: response.data.calf?.toString() || "",
          chest: response.data.chest?.toString() || "",
          waist: response.data.waist?.toString() || "",
          hip: response.data.hip?.toString() || "",
          shoulder: response.data.shoulder?.toString() || "",
          height: response.data.height?.toString() || "",
          weight: response.data.weight?.toString() || "",
          experience: response.data.experience?.toString() || "",
          bio: response.data.bio || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert(
        t("common.error"),
        t("userDetail.failedToLoad", "Failed to load user details")
      );
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      "biceps",
      "foreArm",
      "thigh",
      "calf",
      "chest",
      "waist",
      "hip",
      "shoulder",
      "height",
      "weight",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );

    if (missingFields.length > 0) {
      Alert.alert(
        t("common.error"),
        t("userDetail.fillAllFields", "Please fill all required fields")
      );
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        biceps: parseFloat(formData.biceps) || 0,
        foreArm: parseFloat(formData.foreArm) || 0,
        thigh: parseFloat(formData.thigh) || 0,
        calf: parseFloat(formData.calf) || 0,
        chest: parseFloat(formData.chest) || 0,
        waist: parseFloat(formData.waist) || 0,
        hip: parseFloat(formData.hip) || 0,
        shoulder: parseFloat(formData.shoulder) || 0,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        experience: formData.experience ? parseFloat(formData.experience) : null,
        bio: formData.bio || null,
      };

      const response = await UserDetailService.updateUserDetail(submissionData);
      if (response && response.status === "200") {
        Alert.alert(
          t("common.success"),
          t("userDetail.updateSuccess", "User details updated successfully")
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      Alert.alert(
        t("common.error"),
        t("userDetail.updateFailed", "Failed to update user details")
      );
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, unit, placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.inputFieldContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          style={[
            styles.inputWithUnit,
            isFocused && styles.inputWithUnitFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder={placeholder || "0"}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholderTextColor="#ccc"
            maxLength={2}
            editable={true}
          />
          {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <>
      <View style={styles.coverLayer}></View>
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("userDetail.updateDetails", "Update User Details")}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {fetching ? (
          <FormSkeleton />
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
              {/* Body Measurements */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("userDetail.bodyMeasurements", "Body Measurements")}
                </Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Biceps", "Biceps")}
                      value={formData.biceps}
                      onChange={(value) => handleInputChange("biceps", value)}
                      unit="cm"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.ForeArm", "Forearm")}
                      value={formData.foreArm}
                      onChange={(value) => handleInputChange("foreArm", value)}
                      unit="cm"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Thigh", "Thigh")}
                      value={formData.thigh}
                      onChange={(value) => handleInputChange("thigh", value)}
                      unit="cm"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Calf", "Calf")}
                      value={formData.calf}
                      onChange={(value) => handleInputChange("calf", value)}
                      unit="cm"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Chest", "Chest")}
                      value={formData.chest}
                      onChange={(value) => handleInputChange("chest", value)}
                      unit="cm"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Waist", "Waist")}
                      value={formData.waist}
                      onChange={(value) => handleInputChange("waist", value)}
                      unit="cm"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Hip", "Hip")}
                      value={formData.hip}
                      onChange={(value) => handleInputChange("hip", value)}
                      unit="cm"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("muscleGroups.Shoulder", "Shoulder")}
                      value={formData.shoulder}
                      onChange={(value) =>
                        handleInputChange("shoulder", value)
                      }
                      unit="cm"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("userGoals.height", "Height")}
                      value={formData.height}
                      onChange={(value) => handleInputChange("height", value)}
                      unit="cm"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <InputField
                      label={t("userGoals.weight", "Weight")}
                      value={formData.weight}
                      onChange={(value) => handleInputChange("weight", value)}
                      unit="kg"
                    />
                  </View>
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("userDetail.additionalInfo", "Additional Information")}
                </Text>

                <View style={styles.inputFieldContainer}>
                  <Text style={styles.inputLabel}>
                    {t("userDetail.experience", "Experience")} ({t("userDetail.years", "years")})
                  </Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t("userDetail.enterExperience", "Enter years of experience")}
                      value={formData.experience}
                      onChangeText={(value) =>
                        handleInputChange("experience", value)
                      }
                      keyboardType="decimal-pad"
                      placeholderTextColor="#ccc"
                    />
                  </View>
                </View>

                <View style={styles.inputFieldContainer}>
                  <Text style={styles.inputLabel}>
                    {t("profile.bio", "Bio")}
                  </Text>
                  <View style={styles.textAreaContainer}>
                    <TextInput
                      style={styles.textArea}
                      placeholder={t("profile.enterBio", "Enter your bio")}
                      value={formData.bio}
                      onChangeText={(value) => handleInputChange("bio", value)}
                      multiline
                      numberOfLines={4}
                      placeholderTextColor="#ccc"
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {t("common.cancel", "Cancel")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator variant="button" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {t("common.save", "Save")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  coverLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  container: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
    maxHeight: 700,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
    maxHeight: SCREEN_HEIGHT - 450,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputFieldContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  inputWithUnitFocused: {
    borderColor: "#ED2A46",
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  unitText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ED2A46",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#ED2A46",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ED2A46",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  skeletonSectionTitle: {
    width: "60%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonLabel: {
    width: "40%",
    height: 13,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  skeletonInput: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  skeletonTextArea: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
});

export default UpdateUserDetailModal;

