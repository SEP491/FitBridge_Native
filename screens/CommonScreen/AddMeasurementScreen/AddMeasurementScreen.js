import React, { useEffect, useRef, useState } from "react";
import BodygramService from "../../../services/bodygramService";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
import { Camera } from "expo-camera";
import WebView from "react-native-webview";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getCurrentLanguage } from "../../../i18n";
import BodyMeasurementsService from "../../../services/body-measurementService";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import UserDetailService from "../../../services/user-detailService";

export default function AddMeasurementScreen({ route }) {
  const { customerPurchasedId, firstTimeScan, customerId } = route.params;
  console.log("customerId:", customerId);
  const navigation = useNavigation();
  const { t } = useTranslation();
  console.log("firstTimeScan:", firstTimeScan);
  const ORG_ID = process.env.EXPO_PUBLIC_BODYGRAM_ORG_ID;
  const webViewRef = useRef(null);
  const [scanToken, setScanToken] = useState(null);
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [measurementMode, setMeasurementMode] = useState(null); // null, 'bodygram', or 'manual'
  const [manualMeasurements, setManualMeasurements] = useState({
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
    dob: "",
    gender: "",
  });
  const [userRole, setUserRole] = React.useState(null);

  const fetchUser = async () => {
    try {
      const user = await fetchUserFromStorage();
      setUserRole(user.role);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  useEffect(() => {
    if (measurementMode === "bodygram") {
      const fetchScanToken = async () => {
        const deviceLanguage = getCurrentLanguage();
        console.log("Device Language:", deviceLanguage);
        // Check if user is logged in and has required fields
        if (
          !manualMeasurements ||
          !manualMeasurements.dob ||
          !manualMeasurements.gender ||
          !manualMeasurements.height ||
          !manualMeasurements.weight
        ) {
          Alert.alert(
            t("bodyMeasurements.loginRequired"),
            t("bodyMeasurements.loginRequiredMessage")
          );
          navigation.goBack();
          return;
        }

        const userAge =
          new Date().getFullYear() -
          new Date(manualMeasurements.dob).getFullYear();
        const gender = manualMeasurements.gender.toLowerCase();
        try {
          const requestData = {
            customScanId: customerPurchasedId,
            scope: [
              "api.platform.bodygram.com/scans:create",
              "api.platform.bodygram.com/scans:read",
            ],
          };
          const tokenResponse = await BodygramService.createScanToken(
            requestData
          );
          setScanToken(tokenResponse.token);
          setWebViewUrl(
            `https://platform.bodygram.com/${deviceLanguage}/${ORG_ID}/scan?token=${tokenResponse.token}&system=metric&height=${manualMeasurements.height}&weight=${manualMeasurements.weight}&gender=${gender}&age=${userAge}&remove-header=true&tap=true&can-save-as-image=true&debugger=false`
          );
          console.log("Scan Token Response:", tokenResponse);
        } catch (error) {
          console.error("Error fetching scan token:", error);
        }
      };
      requestPermissions();
      fetchScanToken();
    }
  }, [measurementMode]);
  const requestPermissions = async () => {
    // Request camera permissions
    const cameraStatus = await Camera.requestCameraPermissionsAsync();

    if (cameraStatus.status !== "granted") {
      Alert.alert(
        t("bodyMeasurements.permissionsRequired"),
        t("bodyMeasurements.cameraPermissionRequired")
      );
    }
  };
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const { type, payload } = data;

      switch (type) {
        case "onRequestClose":
          console.log("Message (Close):", payload);
          // Handle close request - maybe navigate back or close modal
          break;

        case "onSuccess":
          console.log("Message (Success):", payload);
          const parsedPayload =
            typeof payload === "string" ? JSON.parse(payload) : payload;
          console.log("Parsed Payload:", parsedPayload);
          console.log("Scan ID:", parsedPayload.id);
          getScanResult(parsedPayload.id);
          break;

        case "onError":
          console.log("Message (Error):", payload);
          Alert.alert(
            t("bodyMeasurements.scanError"),
            payload?.message || t("bodyMeasurements.errorOccurred")
          );
          break;

        case "onStartProcessingScannedImages":
          console.log("Message (Start Processing):", payload);
          // Handle processing start
          break;

        case "onModelLoadStatusChange":
          console.log("Message (Model Load Status Change):", payload);
          // Handle model loading status
          break;

        default:
          console.log("Unknown message type:", type);
      }
    } catch (error) {
      console.error("Error parsing message from WebView:", error);
    }
  };

  const getScanResult = async (scanId) => {
    try {
      const response = await BodygramService.getScanResult(scanId);
      console.log("Scan Result:", response);
      handleSaveMeasurements(response);
    } catch (error) {
      Alert.alert(
        t("bodyMeasurements.error"),
        t("bodyMeasurements.failedToGetScanResult")
      );
      console.error("Error getting scan result:", error);
    }
  };

  const handleSaveMeasurements = async (scanResultData, scanId) => {
    if (!scanResultData) {
      Alert.alert(
        t("bodyMeasurements.noScanResult"),
        t("bodyMeasurements.completeScanFirst")
      );
      return;
    }
    try {
      const formattedData = BodygramService.formatMeasurementsForBackend(
        scanResultData,
        customerPurchasedId
      );
      console.log("Formatted Measurement Data:", formattedData);
      // Here you would typically send formattedData to your backend
      const saveResponse = await BodyMeasurementsService.createBodyMeasurements(
        formattedData
      );
      console.log("Save response:", saveResponse);
      Alert.alert(
        t("bodyMeasurements.success"),
        t("bodyMeasurements.measurementsSavedSuccessfully")
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t("bodyMeasurements.error"),
        t("bodyMeasurements.failedToFormatMeasurements")
      );
      console.error("Error formatting measurements:", error);
    }
  };

  const handleSaveManualMeasurements = async () => {
    try {
      // Validate required fields
      const formattedData = {
        biceps: parseFloat(manualMeasurements.biceps) || 0,
        foreArm: parseFloat(manualMeasurements.foreArm) || 0,
        thigh: parseFloat(manualMeasurements.thigh) || 0,
        calf: parseFloat(manualMeasurements.calf) || 0,
        chest: parseFloat(manualMeasurements.chest) || 0,
        waist: parseFloat(manualMeasurements.waist) || 0,
        hip: parseFloat(manualMeasurements.hip) || 0,
        shoulder: parseFloat(manualMeasurements.shoulder) || 0,
        height: parseFloat(manualMeasurements.height) || 0,
        weight: parseFloat(manualMeasurements.weight) || 0,
        customerPurchasedId: customerPurchasedId,
      };

      console.log("Manual Measurement Data:", formattedData);
      const saveResponse = await BodyMeasurementsService.createBodyMeasurements(
        formattedData
      );
      console.log("Save response:", saveResponse);
      Alert.alert(
        t("bodyMeasurements.success"),
        t("bodyMeasurements.measurementsSavedSuccessfully")
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t("bodyMeasurements.error"),
        t("bodyMeasurements.failedToSaveMeasurements")
      );
      console.error("Error saving manual measurements:", error);
    }
  };

  const loadUserInfo = async () => {
    try {
      // First try to get user details from API using customerId
      if (customerId) {
        try {
          const response = await UserDetailService.getUserDetailByCustomerId(
            customerId
          );
          console.log("User Details Response:", response.data);
          if (response && response.data) {
            setManualMeasurements({
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
              dob: response.data.dob?.toString() || "",
              gender: response.data.gender?.toString() || "",
            });
            return; // Successfully loaded from API, no need to fallback
          }
        } catch (apiError) {
          console.error("Error fetching user details from API:", apiError);
          // Fall through to use storage as fallback
        }
      }

      // Fallback to storage if API fails or customerId not provided
      const userInfo = await fetchUserFromStorage();
      if (userInfo) {
        setManualMeasurements((prev) => ({
          ...prev,
          height: userInfo.height ? userInfo.height.toString() : "",
          weight: userInfo.weight ? userInfo.weight.toString() : "",
        }));
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [measurementMode, customerId]);

  const injectedJavaScript = `
    (function() {
      // Create the interface bridge
      window.BGScanflowJSWebviewInterface = function(fnName, args) {
        if (typeof window.ReactNativeWebView !== 'undefined') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: fnName,
            payload: args
          }));
        }
      };

      // Override the individual callback methods
      window.BGScanflowJSWebviewInterface.onRequestClose = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onRequestClose',
          payload: message
        }));
      };

      window.BGScanflowJSWebviewInterface.onSuccess = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onSuccess',
          payload: message
        }));
      };

      window.BGScanflowJSWebviewInterface.onError = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onError',
          payload: message
        }));
      };

      window.BGScanflowJSWebviewInterface.onStartProcessingScannedImages = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onStartProcessingScannedImages',
          payload: message
        }));
      };

      window.BGScanflowJSWebviewInterface.onModelLoadStatusChange = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onModelLoadStatusChange',
          payload: message
        }));
      };

      true; // Required for injectedJavaScript
    })();
  `;
  // Mode selection screen
  if (measurementMode === null) {
    return (
      <View style={styles.container}>
        <View style={styles.modeSelectionContainer}>
          <Text style={styles.modeSelectionTitle}>
            {t("bodyMeasurements.selectMeasurementMethod")}
          </Text>
          <Text style={styles.modeSelectionSubtitle}>
            {t("bodyMeasurements.selectMethodDescription")}
          </Text>

          {userRole !== "FreelancePT" && (
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => setMeasurementMode("bodygram")}
            >
              <Text style={styles.modeButtonText}>
                {t("bodyMeasurements.bodygramScan")}
              </Text>
              <Text style={styles.modeButtonDescription}>
                {t("bodyMeasurements.bodygramDescription")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => setMeasurementMode("manual")}
          >
            <Text style={styles.modeButtonText}>
              {t("bodyMeasurements.manualInput")}
            </Text>
            <Text style={styles.modeButtonDescription}>
              {t("bodyMeasurements.manualInputDescription")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Manual input form
  if (measurementMode === "manual") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {t("bodyMeasurements.enterMeasurements")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.height")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.height}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    height: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterHeight")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.weight")} (kg)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.weight}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    weight: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterWeight")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.chest")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.chest}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    chest: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterChest")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.waist")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.waist}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    waist: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterWaist")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bodyMeasurements.hip")} (cm)</Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.hip}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    hip: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterHip")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.shoulder")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.shoulder}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    shoulder: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterShoulder")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.biceps")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.biceps}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    biceps: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterBiceps")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.foreArm")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.foreArm}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    foreArm: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterForeArm")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.thigh")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.thigh}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    thigh: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterThigh")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bodyMeasurements.calf")} (cm)
              </Text>
              <TextInput
                style={styles.input}
                value={manualMeasurements.calf}
                onChangeText={(text) =>
                  setManualMeasurements((prev) => ({
                    ...prev,
                    calf: text,
                  }))
                }
                keyboardType="numeric"
                placeholder={t("bodyMeasurements.enterCalf")}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveManualMeasurements}
            >
              <Text style={styles.saveButtonText}>
                {t("bodyMeasurements.saveMeasurements")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMeasurementMode(null)}
            >
              <Text style={styles.backButtonText}>
                {t("bodyMeasurements.goBack")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Bodygram WebView
  return (
    <View style={styles.container}>
      {webViewUrl && (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButtonHeader}
              onPress={() => setMeasurementMode(null)}
            >
              <Text style={styles.backButtonText}>
                {t("bodyMeasurements.goBack")}
              </Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            cacheEnabled={false}
            onMessage={handleMessage}
            injectedJavaScript={injectedJavaScript}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView HTTP error:", nativeEvent.statusCode);
            }}
            // Grant all permissions for camera and microphone
            onPermissionRequest={(request) => {
              request.grant();
            }}
          />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  webview: {
    flex: 1,
  },
  // Mode selection styles
  modeSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  modeSelectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modeSelectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  modeButton: {
    width: "100%",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  modeButtonDescription: {
    fontSize: 14,
    color: "#666",
  },
  // Form styles
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.red,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  // Header styles
  header: {
    backgroundColor: colors.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButtonHeader: {
    padding: 10,
  },
});
