import React, { useState, useRef, useEffect, use } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "../../../hooks/useTranslation";
import BodygramService from "../../../services/bodygramService";
import BodyMeasurementsService from "../../../services/body-measurementService";
import { fetchUserFromStorage } from "./../../../lib/async/asyncUtils";
import outline from "../../../assets/images/outline2.png";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AddMeasurementScreen = ({ route, navigation }) => {
  const { customerPurchasedId } = route.params;
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [cameraType, setCameraType] = useState("back");
  const [showCamera, setShowCamera] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null); // 'front' or 'side'
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [measurements, setMeasurements] = useState(null);

  // User info for Bodygram API (these should ideally come from user profile)
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchUserFromStorage();
      setUserInfo(user);
      const userAge =
        new Date().getFullYear() - new Date(user.dob).getFullYear();
      const gender = user.gender.toLowerCase();

      setUserInfo((prevInfo) => ({
        ...prevInfo,
        age: userAge,
        gender: gender,
      }));
      console.log("User age", userAge);
      console.log("Fetched user from storage:", user);
    };
    fetchUser();
  }, []);

  const resizeImageToRequiredDimensions = async (photoUri) => {
    try {
      // Target dimensions: between 720x1280 and 1080x1920
      // Using 1080x1920 for best quality
      const targetWidth = 1080;
      const targetHeight = 1920;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photoUri,
        [{ resize: { width: targetWidth, height: targetHeight } }],
        {
          compress: 1.0, // Maximum quality for full resolution
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error("Error resizing image:", error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false, // We'll get base64 from manipulator
          skipProcessing: false,
        });

        // Resize image to meet dimension requirements
        const resizedPhoto = await resizeImageToRequiredDimensions(photo.uri);

        return {
          uri: resizedPhoto.uri,
          base64: resizedPhoto.base64,
        };
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert(
          t("common.error", "Lỗi"),
          t("bodyMeasurements.failedToTakePhoto", "Không thể chụp ảnh")
        );
        return null;
      }
    }
  };

  const handleCapture = async () => {
    const photo = await takePicture();
    if (photo) {
      if (currentImageType === "front") {
        setFrontImage(photo);
      } else if (currentImageType === "side") {
        setSideImage(photo);
      }
      setShowCamera(false);
      setCurrentImageType(null);
    }
  };

  const handleOpenCamera = (type) => {
    setCurrentImageType(type);
    setShowCamera(true);
  };

  const handleRetake = (type) => {
    if (type === "front") {
      setFrontImage(null);
    } else if (type === "side") {
      setSideImage(null);
    }
    setCurrentImageType(type);
    setShowCamera(true);
  };

  const handlePickImage = async (type) => {
    try {
      // Request media library permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t("common.error", "Lỗi"),
          t(
            "bodyMeasurements.galleryPermissionDenied",
            "Quyền truy cập thư viện bị từ chối"
          )
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Resize image to meet dimension requirements
        const resizedPhoto = await resizeImageToRequiredDimensions(
          result.assets[0].uri
        );

        const photo = {
          uri: resizedPhoto.uri,
          base64: resizedPhoto.base64,
        };

        if (type === "front") {
          setFrontImage(photo);
        } else if (type === "side") {
          setSideImage(photo);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        t("common.error", "Lỗi"),
        t("bodyMeasurements.failedToPickImage", "Không thể chọn ảnh")
      );
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !sideImage) {
      Alert.alert(
        t("common.error", "Error"),
        t(
          "bodyMeasurements.bothImagesRequired",
          "Both front and side images are required"
        )
      );
      return;
    }

    setProcessing(true);

    try {
      const requestBody = {
        customerScanId: customerPurchasedId,
        photoScan: {
          frontPhoto: frontImage.base64,
          rightPhoto: sideImage.base64,
          height: userInfo.height * 10,
          weight: userInfo.weight * 1000,
          age: userInfo.age,
          gender: userInfo.gender,
        },
      };

      const scanResponse = await BodygramService.createEstimate(requestBody);
      console.log("Scan response:", scanResponse);

      // Check if scan was successful
      if (scanResponse?.entry?.status !== "success") {
        throw new Error("Bodygram scan failed or is still processing");
      }

      // Format measurements for backend
      const formattedMeasurements =
        BodygramService.formatMeasurementsForBackend(
          scanResponse,
          customerPurchasedId
        );

      console.log("Formatted measurements:", formattedMeasurements);

      // Save measurements to backend
      const saveResponse = await BodyMeasurementsService.createBodyMeasurements(
        formattedMeasurements
      );

      console.log("Save response:", saveResponse);

      if (saveResponse?.status === "200" || saveResponse?.status === 200) {
        setMeasurements(scanResponse.entry.measurements);
        Alert.alert(
          t("common.success", "Success"),
          t(
            "bodyMeasurements.measurementsSaved",
            "Body measurements saved successfully!"
          ),
          [
            {
              text: t("common.ok", "OK"),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error("Failed to save measurements to backend");
      }
    } catch (error) {
      console.error("Error processing measurements:", error);
      Alert.alert(
        t("common.error", "Error"),
        t(
          "bodyMeasurements.failedToProcessMeasurements",
          `Failed to process measurements: ${error.message}`
        ),
        [
          {
            text: t("common.retry", "Retry"),
            onPress: handleSubmit,
          },
          {
            text: t("common.cancel", "Cancel"),
            style: "cancel",
          },
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  // Render camera view
  if (showCamera && permission?.granted) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            {/* Instructions */}
            <View style={styles.cameraInstructions}>
              <Text style={styles.cameraInstructionsText}>
                {currentImageType === "front"
                  ? t(
                      "bodyMeasurements.frontImageInstruction",
                      "Stand facing the camera, arms at sides"
                    )
                  : t(
                      "bodyMeasurements.sideImageInstruction",
                      "Stand sideways, arms at sides"
                    )}
              </Text>
            </View>

            {/* Body outline guide */}
            <View style={styles.bodyGuide}>
              <Image source={outline} style={styles.bodyOutlineImage} />
            </View>

            {/* Camera controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  setShowCamera(false);
                  setCurrentImageType(null);
                }}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  setCameraType(cameraType === "back" ? "front" : "back")
                }
              >
                <Ionicons name="camera-reverse" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ED2A46" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionDenied}>
          <Ionicons name="camera" size={64} color="#ED2A46" />
          <Text style={styles.permissionText}>
            {t(
              "bodyMeasurements.cameraPermissionDenied",
              "Camera permission denied"
            )}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main screen content
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Instructions */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="body" size={32} color="#ED2A46" />
          </View>
          <Text style={styles.headerTitle}>
            {t("bodyMeasurements.addMeasurement", "Body Measurement")}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t(
              "bodyMeasurements.headerDescription",
              "Take two photos to get accurate body measurements"
            )}
          </Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <View style={styles.tipIconWrapper}>
              <Ionicons name="shirt-outline" size={18} color="#ED2A46" />
            </View>
            <Text style={styles.tipText}>
              {t("bodyMeasurements.tip1", "Wear fitted clothing")}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIconWrapper}>
              <Ionicons name="sunny-outline" size={18} color="#ED2A46" />
            </View>
            <Text style={styles.tipText}>
              {t("bodyMeasurements.tip2", "Well-lit area")}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIconWrapper}>
              <Ionicons name="person-outline" size={18} color="#ED2A46" />
            </View>
            <Text style={styles.tipText}>
              {t("bodyMeasurements.tip3", "Stand straight")}
            </Text>
          </View>
        </View>

        {/* Photo Frames Section */}
        <View style={styles.photoFramesSection}>
          {/* Front Photo Frame */}
          <View style={styles.photoFrameWrapper}>
            <View style={styles.photoFrameHeader}>
              <View style={styles.photoNumberBadge}>
                <Text style={styles.photoNumberText}>1</Text>
              </View>
              <View>
                <Text style={styles.photoFrameTitle}>
                  {t("bodyMeasurements.frontPhoto", "Front Photo")}
                </Text>
                <Text style={styles.photoFrameDescription}>
                  {t(
                    "bodyMeasurements.frontPhotoDesc",
                    "Face the camera, arms at sides"
                  )}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.photoFrame}
              onPress={() =>
                frontImage ? handleRetake("front") : handleOpenCamera("front")
              }
            >
              {({ pressed }) => (
                <>
                  {frontImage ? (
                    <>
                      <Image
                        source={{ uri: frontImage.uri }}
                        style={styles.photoFrameImage}
                      />
                      {pressed && (
                        <View style={styles.photoFrameOverlay}>
                          <View style={styles.overlayContent}>
                            <Ionicons name="camera" size={32} color="#fff" />
                            <Text style={styles.photoFrameOverlayText}>
                              {t("common.retake", "Retake Photo")}
                            </Text>
                          </View>
                        </View>
                      )}
                      <View style={styles.photoFrameSuccessBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#4CAF50"
                        />
                        <Text style={styles.successBadgeText}>
                          {t("common.completed", "Completed")}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View
                      style={[
                        styles.emptyPhotoFrame,
                        pressed && styles.emptyPhotoFramePressed,
                      ]}
                    >
                      <View style={styles.cameraIconContainer}>
                        <Ionicons
                          name="camera"
                          size={56}
                          color={pressed ? "#ED2A46" : "#ccc"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.photoFrameHint,
                          pressed && styles.photoFrameHintPressed,
                        ]}
                      >
                        {t(
                          "bodyMeasurements.tapToCapture",
                          "Tap to take photo"
                        )}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Pressable>
            {/* Pick from Gallery Button */}
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => handlePickImage("front")}
            >
              <Ionicons name="images-outline" size={20} color="#ED2A46" />
              <Text style={styles.galleryButtonText}>
                {t("bodyMeasurements.chooseFromGallery", "Chọn từ thư viện")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Side Photo Frame */}
          <View style={styles.photoFrameWrapper}>
            <View style={styles.photoFrameHeader}>
              <View style={styles.photoNumberBadge}>
                <Text style={styles.photoNumberText}>2</Text>
              </View>
              <View>
                <Text style={styles.photoFrameTitle}>
                  {t("bodyMeasurements.sidePhoto", "Side Photo")}
                </Text>
                <Text style={styles.photoFrameDescription}>
                  {t(
                    "bodyMeasurements.sidePhotoDesc",
                    "Stand sideways, same posture"
                  )}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.photoFrame}
              onPress={() =>
                sideImage ? handleRetake("side") : handleOpenCamera("side")
              }
            >
              {({ pressed }) => (
                <>
                  {sideImage ? (
                    <>
                      <Image
                        source={{ uri: sideImage.uri }}
                        style={styles.photoFrameImage}
                      />
                      {pressed && (
                        <View style={styles.photoFrameOverlay}>
                          <View style={styles.overlayContent}>
                            <Ionicons name="camera" size={32} color="#fff" />
                            <Text style={styles.photoFrameOverlayText}>
                              {t("common.retake", "Retake Photo")}
                            </Text>
                          </View>
                        </View>
                      )}
                      <View style={styles.photoFrameSuccessBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#4CAF50"
                        />
                        <Text style={styles.successBadgeText}>
                          {t("common.completed", "Completed")}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View
                      style={[
                        styles.emptyPhotoFrame,
                        pressed && styles.emptyPhotoFramePressed,
                      ]}
                    >
                      <View style={styles.cameraIconContainer}>
                        <Ionicons
                          name="camera"
                          size={56}
                          color={pressed ? "#ED2A46" : "#ccc"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.photoFrameHint,
                          pressed && styles.photoFrameHintPressed,
                        ]}
                      >
                        {t(
                          "bodyMeasurements.tapToCapture",
                          "Tap to take photo"
                        )}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Pressable>
            {/* Pick from Gallery Button */}
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => handlePickImage("side")}
            >
              <Ionicons name="images-outline" size={20} color="#ED2A46" />
              <Text style={styles.galleryButtonText}>
                {t("bodyMeasurements.chooseFromGallery", "Chọn từ thư viện")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        {frontImage && sideImage && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              processing && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>
                  {t("bodyMeasurements.processing", "Processing...")}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="analytics" size={22} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {t(
                    "bodyMeasurements.processMeasurements",
                    "Analyze Measurements"
                  )}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Header Section
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(237, 42, 70, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  // Tips Container
  tipsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tipItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(237, 42, 70, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
  },

  // Photo Frames Section
  photoFramesSection: {
    paddingHorizontal: 20,
    gap: 24,
  },
  photoFrameWrapper: {
    marginBottom: 0,
  },
  photoFrameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  photoNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ED2A46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  photoNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  photoFrameTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  photoFrameDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  photoFrame: {
    width: "100%",
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyPhotoFrame: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#e8e8e8",
    borderStyle: "dashed",
    borderRadius: 16,
  },
  emptyPhotoFramePressed: {
    backgroundColor: "rgba(237, 42, 70, 0.05)",
    borderColor: "#ED2A46",
  },
  cameraIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoFrameHint: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
  },
  photoFrameHintPressed: {
    color: "#ED2A46",
  },
  photoFrameImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Show full resolution without cropping
  },
  photoFrameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    alignItems: "center",
  },
  photoFrameOverlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  photoFrameSuccessBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  successBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },

  // Gallery Button
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#ED2A46",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  galleryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ED2A46",
  },

  // Submit Button
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#ED2A46",
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#ED2A46",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Camera Styles
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  cameraInstructions: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
  },
  cameraInstructionsText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
  // bodyGuide: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // bodyOutlineImage: {
  //   width: SCREEN_WIDTH * 0.7,
  //   height: SCREEN_HEIGHT * 0.8,
  //   resizeMode: "contain",
  //   opacity: 1,
  // },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButton: {
    width: 65,
    height: 65,
    borderRadius: 38,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ED2A46",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: "#ED2A46",
  },

  // Permission Denied
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ED2A46",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddMeasurementScreen;
