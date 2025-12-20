import React, { useEffect, useRef, useState } from "react";
import BodygramService from "../../../services/bodygramService";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
import { Camera } from "expo-camera";
import WebView from "react-native-webview";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { Alert } from "react-native";
import { getCurrentLanguage } from "../../../i18n";
import BodyMeasurementsService from "../../../services/body-measurementService";

export default function AddMeasurementScreen({ route }) {
  const { customerPurchasedId, firstTimeScan } = route.params;
  console.log("firstTimeScan:", firstTimeScan);
  const ORG_ID = process.env.EXPO_PUBLIC_BODYGRAM_ORG_ID;
  const webViewRef = useRef(null);
  const [scanToken, setScanToken] = useState(null);
  const [webViewUrl, setWebViewUrl] = useState(null);
  useEffect(() => {
    const fetchScanToken = async () => {
      const deviceLanguage = getCurrentLanguage();
      console.log("Device Language:", deviceLanguage);
      const userInfo = await fetchUserFromStorage();
      
      // Check if user is logged in and has required fields
      if (!userInfo || !userInfo.dob || !userInfo.gender || !userInfo.height || !userInfo.weight) {
        Alert.alert(
          "Login Required",
          "Please login and complete your profile to use body measurement."
        );
        navigation.goBack();
        return;
      }
      
      const userAge =
        new Date().getFullYear() - new Date(userInfo.dob).getFullYear();
      const gender = userInfo.gender.toLowerCase();
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
          firstTimeScan
            ? `https://platform.bodygram.com/${deviceLanguage}/${ORG_ID}/scan?token=${tokenResponse.token}&system=metric&height=${userInfo.height}&weight=${userInfo.weight}&gender=${gender}&age=${userAge}&remove-header=true&tap=true&can-save-as-image=true&debugger=false`
            : `https://platform.bodygram.com/${deviceLanguage}/${ORG_ID}/scan?token=${tokenResponse.token}&system=metric&height=${userInfo.height}&weight=${userInfo.weight}&gender=${gender}&age=${userAge}&screens=scan&tap=true&remove-header=true&tap=true&can-save-as-image=true&debugger=false`
        );
        console.log("Scan Token Response:", tokenResponse);
      } catch (error) {
        console.error("Error fetching scan token:", error);
      }
    };
    requestPermissions();
    fetchScanToken();
  }, []);
  const requestPermissions = async () => {
    // Request camera permissions
    const cameraStatus = await Camera.requestCameraPermissionsAsync();

    if (cameraStatus.status !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera permissions are required for scanning."
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
          Alert.alert("Scan Error", payload?.message || "An error occurred");
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
      Alert.alert("Error", "Failed to get scan result.");
      console.error("Error getting scan result:", error);
    }
  };

  const handleSaveMeasurements = async (scanResultData, scanId) => {
    if (!scanResultData) {
      Alert.alert("No Scan Result", "Please complete a scan first.");
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
      Alert.alert("Success", "Measurements Saved successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to format measurements.");
      console.error("Error formatting measurements:", error);
    }
  };

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
  return (
    <View style={styles.container}>
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
