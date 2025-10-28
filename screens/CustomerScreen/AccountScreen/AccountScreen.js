import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  ActionSheetIOS,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";
import { updateAvatar, getAvatarUrl } from "../../../lib";
import accountService from "../../../services/accountService";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUser } from "../../../context/UserContext";

const { width } = Dimensions.get("window");

const AccountScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    avatarUrl,
    updateAvatar: updateAvatarContext,
    loading: userLoading,
  } = useUser();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Original profile from API
  const [userProfile, setUserProfile] = useState({});

  // Editable form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await accountService.getProfile();
      setUserProfile(response.data);
      console.log("Fetched user profile:", response.data);

      setFormData({
        fullName: response.data.fullName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(t("common.error"), t("account.cannotLoadProfile"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showImagePicker = () => {
    // Prevent multiple calls if already uploading
    if (uploadingAvatar) {
      return;
    }

    const options = [
      t("account.chooseFromLibrary"),
      t("account.takeNewPhoto"),
      t("common.cancel"),
    ];
    const cancelButtonIndex = 2;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            selectImageFromLibrary();
          } else if (buttonIndex === 1) {
            takePhotoWithCamera();
          }
        }
      );
    } else {
      // For Android, show Alert
      Alert.alert(t("account.chooseAvatar"), t("account.chooseImageSource"), [
        { text: t("account.library"), onPress: selectImageFromLibrary },
        { text: t("account.camera"), onPress: takePhotoWithCamera },
        { text: t("common.cancel"), style: "cancel" },
      ]);
    }
  };

  const selectImageFromLibrary = async () => {
    try {
      // Request permission to access media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("account.permissionAccess"),
          t("account.needPhotoPermission"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("account.settings"),
              onPress: () => {
                if (Platform.OS === "ios") {
                  Alert.alert(
                    t("account.permissionGuide"),
                    t("account.goToSettings")
                  );
                }
              },
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false, // Disable EXIF data to reduce potential issues
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error("Error selecting image from library:", error);

      let errorMessage = t("account.cannotOpenPhotoLibrary");

      if (error.message?.includes("Permission")) {
        errorMessage = t("account.noPhotoLibraryPermission");
      } else if (error.message?.includes("User cancelled")) {
        // Don't show error for user cancellation
        return;
      }

      Alert.alert(t("common.error"), errorMessage);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      // Check if running on simulator
      if (!Device.isDevice) {
        Alert.alert(
          t("account.cameraNotAvailable"),
          t("account.cameraNotAvailableSimulator")
        );
        return;
      }

      // Check camera availability first
      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();

      // Request permission to access camera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("account.permissionAccess"),
          t("account.needCameraPermission"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("account.settings"),
              onPress: () => {
                // On iOS, guide user to settings
                if (Platform.OS === "ios") {
                  Alert.alert(
                    t("account.permissionGuide"),
                    t("account.goToCameraSettings")
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // Additional check for camera availability on device
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          exif: false, // Disable EXIF data to reduce potential issues
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          uploadAvatar(result.assets[0]);
        }
      } catch (cameraError) {
        console.error("Camera launch error:", cameraError);

        // Handle specific camera launch errors
        if (
          cameraError.message?.includes("Camera not available") ||
          cameraError.message?.includes("No camera available")
        ) {
          Alert.alert(
            t("account.cameraNotAvailable"),
            t("account.cameraNotAvailableDevice")
          );
        } else {
          throw cameraError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error) {
      console.error("Error taking photo with camera:", error);

      // Handle different types of errors more specifically
      let errorMessage = t("account.cannotOpenCamera");

      if (
        error.message?.includes("Camera not available") ||
        error.message?.includes("simulator") ||
        error.message?.includes("No camera available")
      ) {
        errorMessage = t("account.cameraNotAvailableDevice");
      } else if (error.message?.includes("Permission")) {
        errorMessage = t("account.noCameraPermission");
      } else if (error.message?.includes("User cancelled")) {
        // Don't show error for user cancellation
        return;
      }

      Alert.alert(t("common.error"), errorMessage);
    }
  };

  const uploadAvatar = async (imageAsset) => {
    if (!imageAsset?.uri) {
      Alert.alert(t("common.error"), t("account.cannotReadImageInfo"));
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();

      // Extract file extension from URI
      const uriParts = imageAsset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpg";

      // Validate file type
      const allowedTypes = ["jpg", "jpeg", "png", "webp"];
      if (!allowedTypes.includes(fileType.toLowerCase())) {
        Alert.alert(t("common.error"), t("account.unsupportedImageFormat"));
        return;
      }

      formData.append("avatar", {
        uri: imageAsset.uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });

      let response;
      try {
        // Try primary upload endpoint
        response = await accountService.uploadAvatar(formData);
        console.log("Avatar upload response:", response.data);
        // Get the new avatar URL from response
        const newAvatarUrl = response.data;

        if (newAvatarUrl) {
          console.log(
            "📸 Avatar upload successful, updating across app:",
            newAvatarUrl
          );

          // Update avatar using context - this will update all components
          await updateAvatarContext(newAvatarUrl);

          // Update local user profile state
          setUserProfile((prev) => ({
            ...prev,
            avatar: newAvatarUrl,
          }));
        }
      } catch (primaryError) {
        console.log("Primary upload failed, trying alternative endpoint...");
        // Try alternative endpoint
        response = await accountService.uploadAvatar(formData);

        // Get the new avatar URL from alternative response
        const newAvatarUrl = response.data?.avatar || response.avatar;

        if (newAvatarUrl) {
          // Update avatar using context
          await updateAvatarContext(newAvatarUrl);

          // Update local user profile state
          setUserProfile((prev) => ({
            ...prev,
            avatar: newAvatarUrl,
          }));
        }
      }

      Alert.alert(t("common.success"), t("account.avatarUploadSuccess"));
    } catch (error) {
      console.error("Error uploading avatar:", error);

      // Handle different types of errors
      let errorMessage = t("account.cannotUpdateAvatar");

      if (error.response?.status === 413) {
        errorMessage = t("account.imageTooLarge");
      } else if (error.response?.status === 400) {
        errorMessage = t("account.unsupportedFormat");
      } else if (error.response?.status === 401) {
        errorMessage = t("account.sessionExpired");
      } else if (error.response?.status === 500) {
        errorMessage = t("account.serverError");
      } else if (error.message === "Network Error") {
        errorMessage = t("account.networkError");
      } else if (error.code === "ENOTFOUND") {
        errorMessage = t("account.cannotConnectServer");
      }

      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED2A46" />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ED2A46" barStyle="light-content" />

      {/* Header with Avatar */}
      <LinearGradient
        colors={["#ED2A46", "#FF914D"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: avatarUrl,
              }}
              style={[styles.avatar, uploadingAvatar && styles.avatarUploading]}
            />
            {uploadingAvatar && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={showImagePicker}
              disabled={uploadingAvatar}
            >
              <Icon name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeText}>{t("account.hello")}</Text>
          <Text style={styles.nameText}>
            {userProfile.fullName || formData.fullName || t("account.user")}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t("account.title")}</Text>
          </View>

          <View style={styles.formSection}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Icon
                  name="envelope"
                  size={14}
                  color="#ED2A46"
                  style={{ marginRight: 8 }}
                />
                {"  "}Email
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                style={[
                  styles.input,
                  editMode ? styles.inputEditable : styles.inputReadonly,
                ]}
                placeholder={t("account.enterEmail")}
                keyboardType="email-address"
                placeholderTextColor="#999"
                editable={editMode}
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Icon
                  name="phone"
                  size={14}
                  color="#ED2A46"
                  style={{ marginRight: 8 }}
                />
                {"  "}
                {t("profile.phone")}
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                style={[
                  styles.input,
                  editMode ? styles.inputEditable : styles.inputReadonly,
                ]}
                placeholder={t("account.enterPhone")}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                editable={editMode}
              />
            </View>
          </View>
        </View>

        {/* Action Cards */}
        {!editMode && (
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("UpdatePasswordScreen")}
            >
              <View style={styles.actionCardIcon}>
                <Icon name="key" size={20} color="#ED2A46" />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>
                  {t("account.changePassword")}
                </Text>
                <Text style={styles.actionCardSubtitle}>
                  {t("account.updateSecurityPassword")}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("SubscriptionScreen")}
            >
              <View
                style={[styles.actionCardIcon, { backgroundColor: "#FFF5E6" }]}
              >
                <Icon name="star" size={20} color="#FF914D" />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Nâng cấp Premium</Text>
                <Text style={styles.actionCardSubtitle}>
                  Trải nghiệm không giới hạn
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color="#999" />
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                navigation.navigate("FAQScreen");
              }}
            >
              <View
                style={[styles.actionCardIcon, { backgroundColor: "#E8F5E8" }]}
              >
                <Icon name="question-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>
                  {t("account.helpSupport")}
                </Text>
                <Text style={styles.actionCardSubtitle}>
                  {t("account.faqContact")}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarUploading: {
    opacity: 0.7,
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ED2A46",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  inputReadonly: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E5E5E5",
    color: "#666",
  },
  inputEditable: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ED2A46",
  },
  actionCardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default AccountScreen;
