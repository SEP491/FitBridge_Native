import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import videoCallService from '../../../services/videoCallService';

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
  // Get params from navigation (roomId, recipientName, etc.)
  const { roomId, recipientId, recipientName, recipientAvatar, isOutgoing = true } = route.params || {};
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, reconnecting, expo-go
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
  const [username, setUsername] = useState('You');
  
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  
  const callerInfo = {
    name: recipientName || 'Sarah Williams',
    role: 'Personal Trainer',
    avatar: recipientAvatar || 'SW',
  };

  const scaleAnim = new Animated.Value(1);

  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setHasCameraPermission(true);
          setHasAudioPermission(true);
          return true;
        } else {
          Alert.alert(
            'Permissions Required',
            'Camera and microphone permissions are required for video calls.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // iOS permissions are handled automatically by WebRTC
      setHasCameraPermission(true);
      setHasAudioPermission(true);
      return true;
    }
  };

  // Request permissions and initialize media
  useEffect(() => {
    const initializeCall = async () => {
      // Check if running in Expo Go
      if (isExpoGo) {
        setShowExpoGoWarning(true);
        setConnectionStatus('expo-go');
        return;
      }

      // Check if WebRTC is available
      if (!RTCView) {
        Alert.alert(
          'Development Build Required',
          'Video calling with real camera requires a development build. WebRTC is not available in Expo Go.\n\nTo test this feature:\n1. Run: npx expo run:android (or run:ios)\n2. Or build a development build',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      try {
        // Get user info
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const currentUsername = user?.fullName || 'User';
        setUsername(currentUsername);

        // Determine room ID (use provided roomId or generate one)
        const callRoomId = roomId || `room_${Date.now()}`;
        
        console.log('Initializing video call:', {
          roomId: callRoomId,
          username: currentUsername,
          recipientName,
        });

        // Initialize video call service
        await videoCallService.initialize(callRoomId, currentUsername);

        // Set up stream callbacks
        videoCallService.setLocalStreamCallback((stream) => {
          console.log('Local stream received:', stream?.id);
          setLocalStream(stream);
          localStreamRef.current = stream;
        });

        videoCallService.setOnTrackCallback((stream) => {
          console.log('Remote stream received:', stream?.id);
          setRemoteStream(stream);
          remoteStreamRef.current = stream;
          if (stream) {
            setConnectionStatus('connected');
          }
        });

        setConnectionStatus('waiting'); // Waiting for other person

      } catch (error) {
        console.error('Error initializing call:', error);
        Alert.alert(
          'Connection Error',
          'Failed to initialize video call. Please check your internet connection and try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    initializeCall();

    // Call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Cleanup video call service
      videoCallService.cleanup();
    };
  }, [roomId, recipientName]);



  // Pulse animation for connecting
  useEffect(() => {
    if (connectionStatus === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [connectionStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    try {
      await videoCallService.toggleAudio();
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      await videoCallService.toggleVideo();
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  // Flip camera (switch between front and back)
  const flipCamera = async () => {
    try {
      await videoCallService.toggleFlipCamera();
      setIsFlipped(!isFlipped);
    } catch (error) {
      console.error('Error flipping camera:', error);
      Alert.alert('Error', 'Failed to flip camera.');
    }
  };

  const handleEndCall = async () => {
    try {
      await videoCallService.cleanup();
    } catch (error) {
      console.error('Error cleaning up video call:', error);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Expo Go Warning */}
      {showExpoGoWarning && (
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
              WebRTC is not available in Expo Go.
            </Text>
            
            <View style={styles.expoGoInstructionsContainer}>
              <Text style={styles.expoGoInstructionsTitle}>To use this feature:</Text>
              <Text style={styles.expoGoInstructionsText}>
                1. Run: npx expo run:android
              </Text>
              <Text style={styles.expoGoInstructionsText}>
                2. Or run: npx expo run:ios
              </Text>
              <Text style={styles.expoGoInstructionsText}>
                3. Or create a development build
              </Text>
            </View>

            <TouchableOpacity
              style={styles.expoGoCloseButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.expoGoCloseButtonText}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
      
      {/* Remote Video (Full Screen) */}
      <View style={styles.remoteVideoContainer}>
        {remoteStream && RTCView ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.remoteVideo}
          >
            <Animated.View style={[styles.avatarLarge, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.avatarTextLarge}>{callerInfo.avatar}</Text>
            </Animated.View>
            {connectionStatus === 'connecting' && (
              <Text style={styles.connectingText}>Waiting for other person...</Text>
            )}
          </LinearGradient>
        )}
      </View>

      {/* Top Bar - Caller Info & Status */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topGradient}
      >
        <View style={styles.topBar}>
          <View style={styles.callerInfo}>
            <Text style={styles.callerName}>{callerInfo.name}</Text>
            <View style={styles.statusContainer}>
              {connectionStatus === 'connecting' && (
                <>
                  <View style={styles.connectingDot} />
                  <Text style={styles.statusText}>Connecting...</Text>
                </>
              )}
              {connectionStatus === 'connected' && (
                <Text style={styles.statusText}>{formatDuration(callDuration)}</Text>
              )}
              {connectionStatus === 'reconnecting' && (
                <>
                  <View style={[styles.connectingDot, { backgroundColor: '#FFA500' }]} />
                  <Text style={styles.statusText}>Reconnecting...</Text>
                </>
              )}
            </View>
          </View>
          
          {/* Add Participant Button */}
          <TouchableOpacity style={styles.topButton}>
            <Ionicons name="person-add-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Local Video (Picture in Picture) */}
      <View style={styles.localVideoContainer}>
        <View style={styles.localVideo}>
          {localStream && !isVideoOff && RTCView ? (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideoActive}
              objectFit="cover"
              mirror={!isFlipped}
            />
          ) : (
            <View style={styles.videoOffLocal}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarTextSmall}>You</Text>
              </View>
            </View>
          )}
          
          {/* Camera Off Indicator */}
          {isVideoOff && (
            <View style={styles.cameraOffBadge}>
              <Ionicons name="videocam-off" size={12} color="#fff" />
            </View>
          )}

          {/* Flip Camera Button */}
          {!isVideoOff && (
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={flipCamera}
            >
              <Ionicons 
                name="camera-reverse-outline" 
                size={18} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Controls */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      >
        <View style={styles.controlsContainer}>
          {/* Microphone */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMicrophone}
          >
            <Ionicons 
              name={isMuted ? 'mic-off' : 'mic'} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          {/* Camera */}
          <TouchableOpacity
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={toggleCamera}
          >
            <Ionicons 
              name={isVideoOff ? 'videocam-off' : 'videocam'} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          {/* End Call */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={32} color="#fff" />
          </TouchableOpacity>

          {/* Speaker */}
          <TouchableOpacity
            style={[styles.controlButton, !isSpeakerOn && styles.controlButtonActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons 
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          {/* More Options */}
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.quickButtonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <MaterialIcons name="present-to-all" size={20} color="#fff" />
            <Text style={styles.quickButtonText}>Share Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <Ionicons name="recording-outline" size={20} color="#fff" />
            <Text style={styles.quickButtonText}>Record</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Connection Quality Indicator */}
      {connectionStatus === 'connected' && (
        <View style={styles.qualityIndicator}>
          <Ionicons name="wifi" size={16} color="#4CAF50" />
          <Text style={styles.qualityText}>HD</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingContainer: {
    flex: 1,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  connectingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    opacity: 0.9,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  callerInfo: {
    flex: 1,
  },
  callerName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  localVideo: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoOffLocal: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoActive: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraOffBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flipButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 80,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(237, 42, 70, 0.8)',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ED2A46',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
    shadowColor: '#ED2A46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  quickButton: {
    alignItems: 'center',
    opacity: 0.8,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  qualityIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  qualityText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  expoGoWarningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  expoGoWarningText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  expoGoInstructionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  expoGoInstructionsTitle: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  expoGoInstructionsText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  expoGoCloseButton: {
    backgroundColor: '#ED2A46',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  expoGoCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
