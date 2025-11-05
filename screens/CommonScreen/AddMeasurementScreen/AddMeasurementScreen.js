import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { useTranslation } from "../../../hooks/useTranslation";
import BodygramService from "../../../services/bodygramService";
import BodyMeasurementsService from "../../../services/body-measurementService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AddMeasurementScreen = ({ route, navigation }) => {
  const { customerPurchasedId } = route.params;
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [cameraType, setCameraType] = useState("back");
  const [showCamera, setShowCamera] = useState(false);
  const [currentStep, setCurrentStep] = useState("instructions"); // instructions, front, side, review, processing
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [measurements, setMeasurements] = useState(null);

  // User info for Bodygram API (these should ideally come from user profile)
  const [userInfo, setUserInfo] = useState({
    height: 170, // in cm
    weight: 70, // in kg
    age: 30,
    gender: "male", // or "female"
  });

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
          compress: 0.8,
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
          t("common.error", "Error"),
          t("bodyMeasurements.failedToTakePhoto", "Failed to take photo")
        );
        return null;
      }
    }
  };

  const handleCaptureFrontImage = async () => {
    const photo = await takePicture();
    if (photo) {
      setFrontImage(photo);
      setShowCamera(false);
      setCurrentStep("side");
    }
  };

  const handleCaptureSideImage = async () => {
    const photo = await takePicture();
    if (photo) {
      setSideImage(photo);
      setShowCamera(false);
      setCurrentStep("review");
    }
  };

  const handleRetakeFront = () => {
    setFrontImage(null);
    setCurrentStep("front");
    setShowCamera(true);
  };

  const handleRetakeSide = () => {
    setSideImage(null);
    setCurrentStep("side");
    setShowCamera(true);
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
    setCurrentStep("processing");

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
            onPress: () => setCurrentStep("review"),
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
                {currentStep === "front"
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
            <View style={styles.bodyGuide} />

            {/* Camera controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  setShowCamera(false);
                  setCurrentStep(
                    currentStep === "front" ? "instructions" : "front"
                  );
                }}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={
                  currentStep === "front"
                    ? handleCaptureFrontImage
                    : handleCaptureSideImage
                }
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
          <Ionicons name="camera-off" size={64} color="#ED2A46" />
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
            <Text style={styles.primaryButtonText}>
              {t("common.grantPermission", "Grant Permission")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main screen content
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                (currentStep === "instructions" || currentStep === "front") &&
                  styles.stepDotActive,
              ]}
            />
            <View style={styles.stepLine} />
            <View
              style={[
                styles.stepDot,
                currentStep === "side" && styles.stepDotActive,
              ]}
            />
            <View style={styles.stepLine} />
            <View
              style={[
                styles.stepDot,
                (currentStep === "review" || currentStep === "processing") &&
                  styles.stepDotActive,
              ]}
            />
          </View>
          <View style={styles.stepLabels}>
            <Text style={styles.stepLabel}>
              {t("bodyMeasurements.frontPhoto", "Front")}
            </Text>
            <Text style={styles.stepLabel}>
              {t("bodyMeasurements.sidePhoto", "Side")}
            </Text>
            <Text style={styles.stepLabel}>
              {t("bodyMeasurements.review", "Review")}
            </Text>
          </View>
        </View>

        {/* Instructions Step */}
        {currentStep === "instructions" && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle" size={64} color="#ED2A46" />
            <Text style={styles.instructionsTitle}>
              {t("bodyMeasurements.instructionsTitle", "How to Take Photos")}
            </Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.instructionText}>
                  {t(
                    "bodyMeasurements.instruction1",
                    "Wear fitted clothing for accurate measurements"
                  )}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.instructionText}>
                  {t(
                    "bodyMeasurements.instruction2",
                    "Stand in a well-lit area with plain background"
                  )}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.instructionText}>
                  {t(
                    "bodyMeasurements.instruction3",
                    "Keep arms at your sides, feet shoulder-width apart"
                  )}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.instructionText}>
                  {t(
                    "bodyMeasurements.instruction4",
                    "Make sure your full body is visible in the frame"
                  )}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setCurrentStep("front");
                setShowCamera(true);
              }}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {t("bodyMeasurements.takeFrontPhoto", "Take Front Photo")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Front Photo Step */}
        {currentStep === "front" && !showCamera && frontImage && (
          <View style={styles.photoReviewContainer}>
            <Text style={styles.photoReviewTitle}>
              {t("bodyMeasurements.frontPhoto", "Front Photo")}
            </Text>
            <Image
              source={{ uri: frontImage.uri }}
              style={styles.photoPreview}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRetakeFront}
              >
                <Ionicons name="camera" size={20} color="#ED2A46" />
                <Text style={styles.secondaryButtonText}>
                  {t("common.retake", "Retake")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setCurrentStep("side");
                  setShowCamera(true);
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {t("common.next", "Next")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Side Photo Step */}
        {currentStep === "side" && !showCamera && !sideImage && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="body" size={64} color="#ED2A46" />
            <Text style={styles.instructionsTitle}>
              {t("bodyMeasurements.sidePhotoTitle", "Now Take Side Photo")}
            </Text>
            <Text style={styles.instructionsDescription}>
              {t(
                "bodyMeasurements.sidePhotoDescription",
                "Turn to your side and take a photo with the same posture"
              )}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {t("bodyMeasurements.takeSidePhoto", "Take Side Photo")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review Step */}
        {currentStep === "review" && frontImage && sideImage && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>
              {t("bodyMeasurements.reviewPhotos", "Review Your Photos")}
            </Text>
            <View style={styles.photoGrid}>
              <View style={styles.photoCard}>
                <Text style={styles.photoCardTitle}>
                  {t("bodyMeasurements.frontPhoto", "Front")}
                </Text>
                <Image
                  source={{ uri: frontImage.uri }}
                  style={styles.photoThumbnail}
                />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakeFront}
                >
                  <Text style={styles.retakeButtonText}>
                    {t("common.retake", "Retake")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.photoCard}>
                <Text style={styles.photoCardTitle}>
                  {t("bodyMeasurements.sidePhoto", "Side")}
                </Text>
                <Image
                  source={{ uri: sideImage.uri }}
                  style={styles.photoThumbnail}
                />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakeSide}
                >
                  <Text style={styles.retakeButtonText}>
                    {t("common.retake", "Retake")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {t(
                      "bodyMeasurements.processMeasurements",
                      "Process Measurements"
                    )}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Processing Step */}
        {currentStep === "processing" && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#ED2A46" />
            <Text style={styles.processingTitle}>
              {t(
                "bodyMeasurements.processing",
                "Processing Your Measurements..."
              )}
            </Text>
            <Text style={styles.processingDescription}>
              {t(
                "bodyMeasurements.processingDescription",
                "This may take a few moments. Please wait."
              )}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    flex: 1,
    padding: 20,
  },
  stepIndicator: {
    marginBottom: 30,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  stepDotActive: {
    backgroundColor: "#ED2A46",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepLabel: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  instructionsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  instructionsDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  instructionsList: {
    width: "100%",
    marginBottom: 30,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
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
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ED2A46",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#ED2A46",
    fontSize: 16,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  cameraInstructions: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
  },
  cameraInstructionsText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  bodyGuide: {
    position: "absolute",
    top: "20%",
    left: "25%",
    width: "50%",
    height: "60%",
    borderWidth: 2,
    borderColor: "rgba(237, 42, 70, 0.8)",
    borderRadius: 20,
    borderStyle: "dashed",
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ED2A46",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ED2A46",
  },
  photoReviewContainer: {
    alignItems: "center",
  },
  photoReviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  photoPreview: {
    width: SCREEN_WIDTH - 80,
    height: (SCREEN_WIDTH - 80) * 1.33,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  reviewContainer: {
    alignItems: "center",
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  photoCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  photoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  photoThumbnail: {
    width: 140,
    height: 186,
    borderRadius: 8,
    marginBottom: 8,
  },
  retakeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retakeButtonText: {
    color: "#ED2A46",
    fontSize: 13,
    fontWeight: "600",
  },
  processingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
  },
  processingDescription: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
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
});

export default AddMeasurementScreen;
