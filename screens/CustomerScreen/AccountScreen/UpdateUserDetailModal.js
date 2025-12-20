import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserDetailService from "../../../services/user-detailService";
import { useTranslation } from "../../../hooks/useTranslation";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder={placeholder || "0"}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="decimal-pad"
            placeholderTextColor="#ccc"
            maxLength={8}
          />
          {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("userDetail.updateDetails", "Update User Details")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {fetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ED2A46" />
              <Text style={styles.loadingText}>
                {t("userDetail.loading", "Loading...")}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("userDetail.experience", "Experience")} ({t("userDetail.years", "years")})
                  </Text>
                  <View style={styles.inputContainer}>
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

                <View style={styles.inputGroup}>
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

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("common.cancel", "Cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {t("common.save", "Save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight:SCREEN_HEIGHT -100,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    height: 50,
  },
  inputContainerFocused: {
    borderColor: "#ED2A46",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  unitText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#ED2A46",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default UpdateUserDetailModal;

