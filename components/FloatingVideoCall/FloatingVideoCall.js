import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useMeetingState } from '../../context/meetingStateContext';
import DraggableContainer from '../DraggableContainer/DraggableContainer';
import { t } from '../../i18n';

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

export default function FloatingVideoCall() {
  const navigation = useNavigation();
  
  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isMinimized,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
    onToggleMinimize,
    endCall,
  } = useMeetingState();

  const [draggableContainerPosition, setDraggableContainerPosition] = useState({
    x: 10,
    y: 100,
  });

  // Handle maximize - navigate back to full screen
  const handleMaximize = () => {
    onToggleMinimize(); // Toggle back to full screen
    navigation.navigate(t("navigation.me"), { screen: 'VideoCallScreen' });
  };

  // Handle end call
  const handleEndCall = () => {
    endCall();
  };

  // Only show floating video call when:
  // 1. Call is active (isInCall = true)
  // 2. Video is minimized (isMinimized = true)
  // 3. Not running in Expo Go
  if (!isMinimized || isExpoGo) {
    return null;
  }

  return (
    <DraggableContainer
      initialPosition={draggableContainerPosition}
      setDraggableContainerPosition={setDraggableContainerPosition}
      onSnapToCorner={(corner) => console.log('Snapped to:', corner)}
      cornerOffset={{ top: 60, left: 10, right: 10, bottom: 100 }}
      containerWidth={160}
      containerHeight={280}
    >
      <View style={styles.container}>
        {/* Remote Video (main) */}
        <View style={styles.videoContainer}>
          {remoteMediaStream && RTCView ? (
            <RTCView
              streamURL={remoteMediaStream.toURL()}
              style={styles.remoteVideo}
              objectFit="cover"
              mirror={false}
            />
          ) : (
            <View style={styles.placeholderVideo}>
              <Ionicons name="person" size={40} color="#FFF" />
              <Text style={styles.placeholderText}>Waiting...</Text>
            </View>
          )}

          {/* Local Video (PiP overlay) */}
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
                <Ionicons name="videocam-off" size={16} color="#FFF" />
              </View>
            )}
          </View>

          {/* Maximize button */}
          <TouchableOpacity
            style={styles.maximizeButton}
            onPress={handleMaximize}
          >
            <MaterialIcons name="open-in-full" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isAudioMuted && styles.controlButtonMuted]}
            onPress={onToggleAudio}
          >
            <Ionicons
              name={isAudioMuted ? 'mic-off' : 'mic'}
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isVideoMuted && styles.controlButtonMuted]}
            onPress={onToggleVideo}
          >
            <Ionicons
              name={isVideoMuted ? 'videocam-off' : 'videocam'}
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <MaterialIcons name="call-end" size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={onToggleFlipCamera}
          >
            <Ionicons name="camera-reverse" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </DraggableContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    width: 160,
    height: 220,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  placeholderVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  placeholderText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 50,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  localVideoOff: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maximizeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonMuted: {
    backgroundColor: '#f5576c',
  },
  endCallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5576c',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
