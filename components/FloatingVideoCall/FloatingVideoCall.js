import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMeetingState } from "../../context/meetingStateContext";
import DraggableContainer from "../DraggableContainer/DraggableContainer";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";
const defaultAvatar = require("../../assets/images/LogoColor.png");

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

// Main component - works as a modal overlay, not a screen
export default function FloatingVideoCall() {
  const navigation = useNavigation();

  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isMinimized,
    isLoading,
    error,
    startCall,
    endCall,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
    onToggleMinimize,
    callInfo, // Get call info from context if available
  } = useMeetingState();

  const [draggableContainerPosition, setDraggableContainerPosition] = useState({
    x: 10,
    y: 100,
  });

  const [callDuration, setCallDuration] = useState(0);
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [username, setUsername] = useState("");
  const [booking, setBooking] = useState(null);
  const hideControlsTimeout = useRef(null);

  // Get booking info from callInfo in context
  useEffect(() => {
    if (callInfo?.booking) {
      setBooking(callInfo.booking);
    }
  }, [callInfo]);

  // Set audio mode when call starts
  useEffect(() => {
    if (isInCall && !isMinimized) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false, // Use speaker by default
      }).catch((error) => {
        console.error("Error setting audio mode:", error);
      });
    }
  }, [isInCall, isMinimized]);

  // Call duration timer
  useEffect(() => {
    if (isInCall && !isLoading) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isInCall, isLoading]);

  // Handle screen touch to show/hide controls (only for full screen)
  const handleScreenTouch = () => {
    if (isMinimized) return;

    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  // Auto-hide controls on mount (only for full screen)
  useEffect(() => {
    if (!isMinimized) {
      handleScreenTouch();
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isMinimized]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle maximize - toggle minimize state (no navigation)
  const handleMaximize = () => {
    onToggleMinimize(); // Toggle back to full screen
  };

  // Handle end call - just end call, no navigation
  const handleEndCall = () => {
    endCall();
  };

  // Handle minimize - just toggle state, no navigation
  const handleMinimize = () => {
    onToggleMinimize();
  };

  // Toggle speaker/earpiece
  const toggleSpeaker = async () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      setIsSpeakerOn(newSpeakerState);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newSpeakerState,
      });
    } catch (error) {
      console.error("Error toggling speaker:", error);
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  // Only show when in call or loading
  // This is a modal overlay, not a screen
  if (!isInCall && !isLoading) {
    return null;
  }

  // Show Expo Go warning
  if (showExpoGoWarning) {
    return (
      <View style={styles.fullScreenContainer}>
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

  // Show loading state (full screen)
  if (isLoading && !isMinimized) {
    return (
      <View style={styles.fullScreenContainer}>
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

  // Show error state (full screen)
  if (error && !isMinimized) {
    return (
      <View style={styles.fullScreenContainer}>
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

  // Show full screen video call when not minimized (modal overlay)
  if (isInCall && !isMinimized) {
    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.fullScreenContainer}
          activeOpacity={1}
          onPress={handleScreenTouch}
        >
          {/* Top bar with call info */}
          <View style={styles.topBar}>
            <View style={styles.middleSection}>
              {/* Local video (Picture-in-Picture) */}
              <View style={styles.localVideoContainer}>
                {localMediaStream && !isVideoMuted && RTCView ? (
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
            <View style={styles.callInfo}>
              <View style={styles.callerDetails}>
                <Text style={styles.callerNameText}>
                  {booking?.customerName || booking?.ptName || "Caller"}
                </Text>
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
            {remoteMediaStream && RTCView ? (
              <RTCView
                streamURL={remoteMediaStream.toURL()}
                style={styles.remoteVideo}
                objectFit="cover"
                zOrder={1}
                mirror={false}
              />
            ) : (
              <LinearGradient
                colors={["#667eea", "#d1ced4ff"]}
                style={styles.remoteVideoPlaceholder}
              >
                <View style={styles.avatarLarge}>
                  <Image
                    source={
                      booking?.customerAvatarUrl
                        ? { uri: booking.customerAvatarUrl }
                        : defaultAvatar
                    }
                    style={styles.avatarLargeImage}
                  />
                </View>
                <Text style={styles.callerName}>
                  {booking?.customerName || booking?.ptName || "Customer"}
                </Text>
                <Text style={styles.waitingText}>
                  Waiting for connection...
                </Text>
              </LinearGradient>
            )}
          </View>

          {/* Bottom controls - absolute positioned with auto-hide */}
          {showControls && (
            <View style={styles.controlsContainer}>
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isAudioMuted && styles.controlButtonMuted,
                  ]}
                  onPress={onToggleAudio}
                >
                  <Ionicons
                    name={isAudioMuted ? "mic-off" : "mic"}
                    size={28}
                    color="#FFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isVideoMuted && styles.controlButtonMuted,
                  ]}
                  onPress={onToggleVideo}
                >
                  <Ionicons
                    name={isVideoMuted ? "videocam-off" : "videocam"}
                    size={28}
                    color="#FFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.endCallButton}
                  onPress={handleEndCall}
                >
                  <MaterialIcons name="call-end" size={32} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={onToggleFlipCamera}
                >
                  <Ionicons name="camera-reverse" size={28} color="#FFF" />
                </TouchableOpacity>

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
      </View>
    );
  }

  // Show minimized floating video call (modal overlay with smaller size)
  if (isInCall && isMinimized && !isExpoGo) {
    return (
      <View style={styles.floatingModalOverlay}>
        <DraggableContainer
          initialPosition={draggableContainerPosition}
          setDraggableContainerPosition={setDraggableContainerPosition}
          onSnapToCorner={(corner) => console.log("Snapped to:", corner)}
          cornerOffset={{ top: 60, left: 10, right: 10, bottom: 100 }}
          containerWidth={160}
          containerHeight={280}
        >
          <View style={styles.floatingContainer}>
            {/* Remote Video (main) */}
            <View style={styles.floatingVideoContainer}>
              {remoteMediaStream && RTCView ? (
                <RTCView
                  streamURL={remoteMediaStream.toURL()}
                  style={styles.floatingRemoteVideo}
                  objectFit="cover"
                  mirror={false}
                />
              ) : (
                <View style={styles.floatingPlaceholderVideo}>
                  <Ionicons name="person" size={40} color="#FFF" />
                  <Text style={styles.floatingPlaceholderText}>Waiting...</Text>
                </View>
              )}

              {/* Local Video (PiP overlay) */}
              <View style={styles.floatingLocalVideoContainer}>
                {localMediaStream && !isVideoMuted && RTCView ? (
                  <RTCView
                    streamURL={localMediaStream.toURL()}
                    style={styles.floatingLocalVideo}
                    objectFit="cover"
                    mirror={true}
                  />
                ) : (
                  <View style={styles.floatingLocalVideoOff}>
                    <Ionicons name="videocam-off" size={16} color="#FFF" />
                  </View>
                )}
              </View>

              {/* Maximize button */}
              <TouchableOpacity
                style={styles.floatingMaximizeButton}
                onPress={handleMaximize}
              >
                <MaterialIcons name="open-in-full" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Controls */}
            <View style={styles.floatingControls}>
              <TouchableOpacity
                style={[
                  styles.floatingControlButton,
                  isAudioMuted && styles.floatingControlButtonMuted,
                ]}
                onPress={onToggleAudio}
              >
                <Ionicons
                  name={isAudioMuted ? "mic-off" : "mic"}
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.floatingControlButton,
                  isVideoMuted && styles.floatingControlButtonMuted,
                ]}
                onPress={onToggleVideo}
              >
                <Ionicons
                  name={isVideoMuted ? "videocam-off" : "videocam"}
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingEndCallButton}
                onPress={handleEndCall}
              >
                <MaterialIcons name="call-end" size={18} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingControlButton}
                onPress={onToggleFlipCamera}
              >
                <Ionicons name="camera-reverse" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </DraggableContainer>
      </View>
    );
  }

  return null;
}

// Component is exported directly above - no wrapper needed

const styles = StyleSheet.create({
  // Modal overlay - covers entire screen
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  // Full screen styles
  fullScreenContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#FF914D",
    padding: 15,
    gap: 10,
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
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
  topBar: {
    paddingBottom: 20,
    marginTop: 60,
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
  // Floating/minimized styles
  floatingModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    elevation: 9998,
    pointerEvents: "box-none", // Allow touches to pass through to content below
  },
  floatingContainer: {
    width: 160,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  floatingVideoContainer: {
    width: 160,
    height: 220,
    backgroundColor: "#1a1a1a",
    position: "relative",
  },
  floatingRemoteVideo: {
    width: "100%",
    height: "100%",
  },
  floatingPlaceholderVideo: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  floatingPlaceholderText: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 8,
  },
  floatingLocalVideoContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 50,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  floatingLocalVideo: {
    width: "100%",
    height: "100%",
  },
  floatingLocalVideoOff: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingMaximizeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  floatingControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingControlButtonMuted: {
    backgroundColor: "#f5576c",
  },
  floatingEndCallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5576c",
    justifyContent: "center",
    alignItems: "center",
  },
});
