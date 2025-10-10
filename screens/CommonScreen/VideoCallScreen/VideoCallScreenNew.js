import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useVideoCall } from '../../../context/VideoCallContext';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import WebRTC (only in development builds)
let RTCView;
if (!isExpoGo) {
  try {
    const webrtc = require('react-native-webrtc');
    RTCView = webrtc.RTCView;
  } catch (error) {
    console.log('WebRTC not available:', error);
  }
}

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen({ route, navigation }) {
  // Get params from navigation
  const { roomId, username, recipientName, recipientAvatar } = route.params || {};
  
  const [callDuration, setCallDuration] = useState(0);
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);

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
  } = useVideoCall();

  const callerInfo = {
    name: recipientName || 'Personal Trainer',
    avatar: recipientAvatar || 'PT',
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
        console.log('VideoCallScreen: Starting call', { roomId, username });
        await startCall(username, roomId, 5000, false);
      } catch (error) {
        console.error('VideoCallScreen: Error starting call:', error);
        Alert.alert('Error', 'Failed to start video call');
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  if (showExpoGoWarning) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.expoGoWarningContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.expoGoWarningContent}
          >
            <Ionicons name="warning-outline" size={80} color="#FFA500" />
            <Text style={styles.expoGoWarningTitle}>Development Build Required</Text>
            <Text style={styles.expoGoWarningText}>
              Video calling with real camera/microphone requires a development build.
            </Text>
            <Text style={styles.expoGoWarningText}>
              Run: <Text style={styles.expoGoWarningCode}>eas build --profile development</Text>
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
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
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
          <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.errorGradient}>
            <Ionicons name="alert-circle" size={60} color="#FFF" />
            <Text style={styles.errorText}>Connection Error</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Background (Remote video or placeholder) */}
      {remoteMediaStream && RTCView ? (
        <RTCView
          streamURL={remoteMediaStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
          mirror={false}
        />
      ) : (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.remoteVideoPlaceholder}
        >
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{callerInfo.avatar}</Text>
          </View>
          <Text style={styles.callerName}>{callerInfo.name}</Text>
          <Text style={styles.waitingText}>Waiting for connection...</Text>
        </LinearGradient>
      )}

      {/* Top bar with call info */}
      <View style={styles.topBar}>
        <View style={styles.callInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{callerInfo.avatar}</Text>
          </View>
          <View style={styles.callerDetails}>
            <Text style={styles.callerNameText}>{callerInfo.name}</Text>
            <Text style={styles.callDurationText}>{formatDuration(callDuration)}</Text>
          </View>
        </View>
      </View>

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

      {/* Bottom controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          {/* Microphone */}
          <TouchableOpacity
            style={[styles.controlButton, isAudioMuted && styles.controlButtonMuted]}
            onPress={toggleMicrophone}
          >
            <Ionicons
              name={isAudioMuted ? 'mic-off' : 'mic'}
              size={28}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Camera */}
          <TouchableOpacity
            style={[styles.controlButton, isVideoMuted && styles.controlButtonMuted]}
            onPress={toggleCamera}
          >
            <Ionicons
              name={isVideoMuted ? 'videocam-off' : 'videocam'}
              size={28}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* End call */}
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <MaterialIcons name="call-end" size={32} color="#FFF" />
          </TouchableOpacity>

          {/* Flip camera */}
          <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
            <Ionicons name="camera-reverse" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Speaker (placeholder for now) */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Alert.alert('Speaker', 'Speaker toggle coming soon')}
          >
            <Ionicons name="volume-high" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    width: width,
    height: height,
  },
  remoteVideoPlaceholder: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  callerDetails: {
    flex: 1,
  },
  callerNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  callDurationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  localVideoContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight + 80 || 120,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  localVideoOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonMuted: {
    backgroundColor: '#f5576c',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5576c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorGradient: {
    width: 300,
    height: 300,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  expoGoWarningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  expoGoWarningContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  expoGoWarningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  expoGoWarningText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  expoGoWarningCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
  },
  expoGoWarningButton: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  expoGoWarningButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
