import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { useMeetingState } from "../../../context/meetingStateContext";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Conditionally import WebRTC (only in development builds)
let RTCView;
if (!isExpoGo) {
  try {
    const webrtc = require("react-native-webrtc");
    RTCView = webrtc.RTCView;
  } catch (error) {
    console.log("WebRTC not available:", error);
  }
}

const { width, height } = Dimensions.get("window");

export default function VideoCallScreen({ route, navigation }) {
  // Get params from navigation
  const { roomId, username, recipientName, recipientAvatar } =
    route.params || {};

  const [callDuration, setCallDuration] = useState(0);
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = React.useRef(null);

  // Get video call state and methods from context
  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isLoading,
    error,
    startCall,
    endCall,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
    onToggleMinimize,
  } = useMeetingState();


  const callerInfo = {
    name: recipientName || "Personal Trainer",
    avatar: recipientAvatar || "PT",
  };

  // Initialize call on mount
  useEffect(() => {
    const initializeCall = async () => {
      // Check if running in Expo Go
      if (isExpoGo) {
        setShowExpoGoWarning(true);
        return;
      }

      try {
        console.log("VideoCallScreen: Starting call", { roomId, username });
        await startCall(username, roomId, 5000, false);
      } catch (error) {
        console.error("VideoCallScreen: Error starting call:", error);
        Alert.alert("Error", "Failed to start video call");
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      if (isInCall) {
        endCall();
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isInCall && !isLoading) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isInCall, isLoading]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle end call
  const handleEndCall = () => {
    endCall();
    navigation.goBack();
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    onToggleAudio();
  };

  // Toggle camera
  const toggleCamera = () => {
    onToggleVideo();
  };

  // Flip camera
  const flipCamera = () => {
    onToggleFlipCamera();
  };

  // Handle minimize
  const handleMinimize = () => {
    onToggleMinimize();
    navigation.goBack();
  };

  // Handle screen touch to show/hide controls
  const handleScreenTouch = () => {
    setShowControls(true);

    // Clear existing timeout
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    // Set new timeout to hide controls after 5 seconds
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  // Auto-hide controls on mount
  useEffect(() => {
    handleScreenTouch();

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  if (showExpoGoWarning) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.expoGoWarningContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.expoGoWarningContent}
          >
            <Ionicons name="warning-outline" size={80} color="#FFA500" />
            <Text style={styles.expoGoWarningTitle}>
              Development Build Required
            </Text>
            <Text style={styles.expoGoWarningText}>
              Video calling with real camera/microphone requires a development
              build.
            </Text>
            <Text style={styles.expoGoWarningText}>
              Run:{" "}
              <Text style={styles.expoGoWarningCode}>
                eas build --profile development
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.expoGoWarningButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.expoGoWarningButtonText}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.loadingGradient}
          >
            <Ionicons name="videocam" size={60} color="#FFF" />
            <Text style={styles.loadingText}>Connecting...</Text>
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            style={styles.errorGradient}
          >
            <Ionicons name="alert-circle" size={60} color="#FFF" />
            <Text style={styles.errorText}>Connection Error</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleScreenTouch}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Top bar with call info */}
      <View style={styles.topBar}>
        <View style={styles.callInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{callerInfo.avatar}</Text>
          </View>
          <View style={styles.callerDetails}>
            <Text style={styles.callerNameText}>{callerInfo.name}</Text>
            <Text style={styles.callDurationText}>
              {formatDuration(callDuration)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.minimizeButton}
          onPress={handleMinimize}
        >
          <Ionicons name="remove-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        {/* Middle section - spacer */}
        <View style={styles.middleSection}>
          {/* Local video (Picture-in-Picture) */}
          <View style={styles.localVideoContainer}>
            {localMediaStream && !isVideoMuted ? (
              <RTCView
                streamURL={localMediaStream.toURL()}
                style={styles.localVideo}
                objectFit="cover"
                mirror={true}
              />
            ) : (
              <View style={styles.localVideoOff}>
                <Ionicons name="videocam-off" size={32} color="#FFF" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Video container - fills entire screen */}
      <View style={styles.videoContainer}>
        {/* Background (Remote video or placeholder) */}
        {remoteMediaStream ? (
          <RTCView
            streamURL={remoteMediaStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <LinearGradient
            colors={["#667eea", "#d1ced4ff"]}
            style={styles.remoteVideoPlaceholder}
          >
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{callerInfo.avatar}</Text>
            </View>
            <Text style={styles.callerName}>{callerInfo.name}</Text>
            <Text style={styles.waitingText}>Waiting for connection...</Text>
          </LinearGradient>
        )}
      </View>

      {/* Overlay content */}
      <View style={styles.overlayContainer}></View>

      {/* Bottom controls - absolute positioned with auto-hide */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controls}>
            {/* Microphone */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isAudioMuted && styles.controlButtonMuted,
              ]}
              onPress={toggleMicrophone}
            >
              <Ionicons
                name={isAudioMuted ? "mic-off" : "mic"}
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>

            {/* Camera */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isVideoMuted && styles.controlButtonMuted,
              ]}
              onPress={toggleCamera}
            >
              <Ionicons
                name={isVideoMuted ? "videocam-off" : "videocam"}
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>

            {/* End call */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <MaterialIcons name="call-end" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Flip camera */}
            <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
              <Ionicons name="camera-reverse" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* Speaker (placeholder for now) */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                Alert.alert("Speaker", "Speaker toggle coming soon")
              }
            >
              <Ionicons name="volume-high" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4f2828ff",
    flexDirection: "column",
  },
  videoContainer: {
    width: "100%",
    backgroundColor: "#000",
    flex: 100,
  },
  remoteVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  remoteVideoPlaceholder: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    paddingTop: StatusBar.currentHeight + 60 || 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: "#f5c6c6ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  callInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  callerDetails: {
    flex: 1,
  },
  callerNameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },
  callDurationText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  middleSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 20,
    paddingRight: 20,
  },
  localVideoContainer: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  localVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  localVideoOff: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 35,
    margin: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: "#f5576c",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonMuted: {
    backgroundColor: "#ED2A46",
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f5576c",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorGradient: {
    width: 300,
    height: 300,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#FFF",
    marginTop: 10,
    textAlign: "center",
  },
  errorButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  expoGoWarningContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  expoGoWarningContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  expoGoWarningTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  expoGoWarningText: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  expoGoWarningCode: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 4,
  },
  expoGoWarningButton: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
  },
  expoGoWarningButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});
