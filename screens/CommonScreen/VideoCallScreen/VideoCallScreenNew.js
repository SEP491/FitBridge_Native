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
  Modal,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { Audio } from "expo-av";
import { useMeetingState } from "../../../context/meetingStateContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";
const defaultAvatar = require("../../../assets/images/LogoColor.png");


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
  const { roomId, booking } =
    route.params || {};


  const [callDuration, setCallDuration] = useState(0);
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Speaker is on by default for video calls
  const [showAudioSourceModal, setShowAudioSourceModal] = useState(false);
  const [selectedAudioSource, setSelectedAudioSource] = useState("speaker"); // "speaker", "earpiece", "bluetooth", "wired"
  const hideControlsTimeout = React.useRef(null);
  const [username, setUsername] = useState("");
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

  // Debug: Monitor stream changes
  useEffect(() => {
    console.log("🎥 [VideoCallScreen] localMediaStream changed:", {
      exists: !!localMediaStream,
      stream: localMediaStream,
      tracks: localMediaStream?.getTracks().map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    });
  }, [localMediaStream]);

  useEffect(() => {
    console.log("🎥 [VideoCallScreen] remoteMediaStream changed:", {
      exists: !!remoteMediaStream,
      stream: remoteMediaStream,
      tracks: remoteMediaStream?.getTracks().map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    });
  }, [remoteMediaStream]);

  useEffect(() => {
    console.log("📊 [VideoCallScreen] Call state changed:", {
      isInCall,
      isLoading,
      isAudioMuted,
      isVideoMuted,
      hasLocalStream: !!localMediaStream,
      hasRemoteStream: !!remoteMediaStream,
      error
    });
  }, [isInCall, isLoading, isAudioMuted, isVideoMuted, error]);


  // Initialize call on mount
  useEffect(() => {
    const initializeCall = async () => {
      console.log("📞 [VideoCallScreen] Initializing call...");
      console.log("📞 [VideoCallScreen] Route params:", { roomId, booking });
      
      // Check if running in Expo Go
      if (isExpoGo) {
        console.warn("⚠️ [VideoCallScreen] Running in Expo Go - WebRTC not available");
        setShowExpoGoWarning(true);
        return;
      }

      // Check if RTCView is available
      if (!RTCView) {
        console.error("❌ [VideoCallScreen] RTCView component not available!");
        Alert.alert("Error", "WebRTC components not available. Please use a development build.");
        return;
      }
      console.log("✅ [VideoCallScreen] RTCView component available");

      try {
        const user = await AsyncStorage.getItem("user");
        console.log("👤 [VideoCallScreen] User from AsyncStorage:", user);
        
        const userName = user ? JSON.parse(user).fullName : "Guest";
        setUsername(userName);
        console.log("👤 [VideoCallScreen] Username set to:", userName);

        if (!roomId) {
          console.error("❌ [VideoCallScreen] No roomId provided!");
          Alert.alert("Error", "No room ID provided for video call");
          return;
        }
        console.log("🔑 [VideoCallScreen] Room ID:", roomId);

        console.log("🚀 [VideoCallScreen] Starting call with:", { userName, roomId });
        await startCall(userName, roomId, 5000, false);
        console.log("✅ [VideoCallScreen] startCall completed");

        // Set audio mode for video call with speaker on
        try {
          console.log("🔊 [VideoCallScreen] Setting audio mode...");
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false, // Use speaker by default
          });
          console.log("✅ [VideoCallScreen] Audio mode set: Speaker ON");
        } catch (audioError) {
          console.error("❌ [VideoCallScreen] Error setting audio mode:", audioError);
        }
      } catch (error) {
        console.error("❌ [VideoCallScreen] Error starting call:", error);
        console.error("❌ [VideoCallScreen] Error stack:", error.stack);
        Alert.alert("Error", "Failed to start video call: " + error.message);
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      console.log("🧹 [VideoCallScreen] Component unmounting, cleaning up...");
      try {
        if (isInCall && endCall) {
          console.log("🛑 [VideoCallScreen] Ending call on unmount");
          endCall();
        }
      } catch (error) {
        console.error('❌ [VideoCallScreen] Error during cleanup:', error);
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
    console.log("📞 [VideoCallScreen] Ending call...");
    endCall();
    console.log("📞 [VideoCallScreen] Navigating back");
    navigation.goBack();
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    console.log("🎤 [VideoCallScreen] Toggling microphone, current state:", isAudioMuted);
    onToggleAudio();
  };

  // Toggle camera
  const toggleCamera = () => {
    console.log("📹 [VideoCallScreen] Toggling camera, current state:", isVideoMuted);
    onToggleVideo();
  };

  // Flip camera
  const flipCamera = () => {
    console.log("🔄 [VideoCallScreen] Flipping camera");
    onToggleFlipCamera();
  };

  // Handle minimize
  const handleMinimize = () => {
    onToggleMinimize();
    navigation.goBack();
  };

  // Toggle speaker/earpiece
  const toggleSpeaker = async () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      setIsSpeakerOn(newSpeakerState);

      // Update audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newSpeakerState, // true = earpiece, false = speaker
      });

      console.log(`Speaker ${newSpeakerState ? "ON" : "OFF"}`);
    } catch (error) {
      console.error("Error toggling speaker:", error);
      Alert.alert("Error", "Failed to toggle speaker");
      // Revert state if error
      setIsSpeakerOn(!isSpeakerOn);
    }
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
        <View style={styles.middleSection}>
          {/* Local video (Picture-in-Picture) */}
          <View style={styles.localVideoContainer}>
            {(() => {
              console.log("🖼️ [VideoCallScreen] Rendering local video:", {
                hasStream: !!localMediaStream,
                isVideoMuted,
                streamURL: localMediaStream?.toURL?.(),
                RTCViewAvailable: !!RTCView
              });
              
              if (localMediaStream && !isVideoMuted) {
                console.log("✅ [VideoCallScreen] Rendering RTCView for local stream");
                return (
                  <RTCView
                    streamURL={localMediaStream.toURL()}
                    style={styles.localVideo}
                    objectFit="cover"
                    mirror={true}
                  />
                );
              } else {
                console.log("⚠️ [VideoCallScreen] Showing local video off placeholder");
                return (
                  <View style={styles.localVideoOff}>
                    <Ionicons name="videocam-off" size={32} color="#FFF" />
                  </View>
                );
              }
            })()}
          </View>
        </View>
        <View style={styles.callInfo}>
          <View style={styles.callerDetails}>
            <Text style={styles.callerNameText}>{booking.customerName ? booking.customerName : booking.ptName ? booking.ptName : 'NaN'}</Text>
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
        
      </View>

      {/* Video container - fills entire screen */}
      <View style={styles.videoContainer}>
        {/* Background (Remote video or placeholder) */}
        {(() => {
          console.log("🖼️ [VideoCallScreen] Rendering remote video:", {
            hasStream: !!remoteMediaStream,
            streamURL: remoteMediaStream?.toURL?.(),
            RTCViewAvailable: !!RTCView,
            tracks: remoteMediaStream?.getTracks()
          });
          
          if (remoteMediaStream) {
            console.log("✅ [VideoCallScreen] Rendering RTCView for remote stream");
            return (
              <RTCView
                streamURL={remoteMediaStream.toURL()}
                style={styles.remoteVideo}
                objectFit="cover"
                zOrder={1}
                mirror={false}
              />
            );
          } else {
            console.log("⚠️ [VideoCallScreen] Showing waiting placeholder for remote video");
            return (
              <LinearGradient
                colors={["#667eea", "#d1ced4ff"]}
                style={styles.remoteVideoPlaceholder}
              >
                <View style={styles.avatarLarge}>
                  <Image
                    source={booking?.customerAvatarUrl ? { uri: booking.customerAvatarUrl } : defaultAvatar}
                    style={styles.avatarLargeImage}
                  />
                </View>
                <Text style={styles.callerName}>{booking ? booking.customerName : 'Customer'}</Text>
                <Text style={styles.waitingText}>Waiting for connection...</Text>
              </LinearGradient>
            );
          }
        })()}
      </View>


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

            {/* Speaker toggle */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !isSpeakerOn && styles.controlButtonMuted,
              ]}
              onPress={toggleSpeaker}
            >
              <Ionicons
                name={isSpeakerOn ? "volume-high" : "volume-low"}
                size={28}
                color="#FFF"
              />
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
    flexDirection: "column",
    backgroundColor: "#FF914D",
    padding: 15,
    gap: 10,
    justifyContent: "space-between",
  },

  videoContainer: {
    width: "100%",
    height: "100%",
  },
  remoteVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  remoteVideoPlaceholder: {
    height: "85%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarLargeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: "600",
    color: "#FFF",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    paddingBottom: 20,
    marginTop: StatusBar.currentHeight + 60 || 40,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(100px)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(102, 126, 234, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
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
    color: "rgba(255, 255, 255, 0.7)",
  },
  middleSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 20,
  },
  localVideoContainer: {
    width: 150,
    height: 120,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
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
    backgroundColor: "rgba(42, 42, 42, 0.8)",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 23,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(40px)",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,

  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonMuted: {
    backgroundColor: "rgba(237, 42, 70, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(245, 87, 108, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#f5576c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  errorText: {
    fontSize: 24,
    fontWeight: "600",
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  expoGoWarningTitle: {
    fontSize: 24,
    fontWeight: "600",
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 4,
    borderRadius: 4,
  },
  expoGoWarningButton: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  expoGoWarningButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});
