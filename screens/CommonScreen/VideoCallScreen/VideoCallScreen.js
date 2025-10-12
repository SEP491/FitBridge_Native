import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
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
    onToggleMinimize,
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

      // Check if WebRTC is available
      if (!RTCView) {
        Alert.alert(
          'Development Build Required',
          'Video calling requires a development build. WebRTC is not available in Expo Go.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      try {
        // Start the call with provided params
        if (roomId && username) {
          await startCall(roomId, username, recipientName);
        }
      } catch (error) {
        console.error('Error starting call:', error);
      }
    };

    initializeCall();

    // Call duration timer (only when in call)
    let interval;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [roomId, username, recipientName]);



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

  // Handle minimize
  const handleMinimize = () => {
    onToggleMinimize();
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

  // Show Expo Go warning
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

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <Ionicons name="call" size={60} color="#FFF" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Show error state
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

      {/* Top bar with call info and minimize button */}
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
        
        {/* Minimize Button */}
        <TouchableOpacity style={styles.minimizeButton} onPress={handleMinimize}>
          <Ionicons name="remove-outline" size={24} color="#FFF" />
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 40) + 80,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  loadingText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorGradient: {
    width: '90%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  errorSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  errorButtonText: {
    color: '#f5576c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expoGoWarningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expoGoWarningContent: {
    width: '90%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  expoGoWarningTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  expoGoWarningText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  expoGoWarningCode: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  expoGoWarningButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  expoGoWarningButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
