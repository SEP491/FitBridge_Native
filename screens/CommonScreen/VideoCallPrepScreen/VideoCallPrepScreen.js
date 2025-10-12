import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useVideoCall } from '../../../context/VideoCallContext';
import signalRService from '../../../services/signalR/signalRService';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import WebRTC (only in development builds)
let RTCView, mediaDevices;
if (!isExpoGo) {
  try {
    const webrtc = require('react-native-webrtc');
    RTCView = webrtc.RTCView;
    mediaDevices = webrtc.mediaDevices;
  } catch (error) {
    console.log('WebRTC not available:', error);
  }
}

const { width, height } = Dimensions.get('window');

export default function VideoCallPrepScreen({ navigation }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!isFormValid || loading) return;
    setError("");
    setLoading(true);
    try {
      const url = process.env.EXPO_PUBLIC_API_WEBRTC_URL + "/meetingroom/login";
      console.log('Logging in to:', url);
      const response = await axios.post(url, {
        username,
        password,
        roomId,
      });

      if (response.status === 200) {
        const token = response.data.accessToken;
        console.log('Login successful, token received');
        await AsyncStorage.setItem("accessSignalRToken", token);
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("roomId", roomId);
        await signalRService.startConnection();
        
        // Navigate to video call after successful login
        handleJoinCall();
      } else {
        Alert.alert("Error", "Login failed. Please try again.");
      }
    } catch (e) {
      console.error("Login error:", e);
      const errorMsg = e.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Error", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }
  
  // Load username from storage
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        
        if (storedUsername) {
          setUsername(storedUsername);
        } else if (storedEmail) {
          // Use email without domain if username not found
          setUsername(storedEmail.split('@')[0]);
        } else {
          setUsername('User');
        }
      } catch (error) {
        console.error('Error loading username:', error);
        setUsername('User');
      }
    };
    
    loadUsername();
  }, []);

  // Initialize preview stream
  useEffect(() => {
    if (isExpoGo) {
      setLoadingPreview(false);
      return;
    }

    let mounted = true;

    const startPreview = async () => {
      try {
        if (!mediaDevices) {
          throw new Error('WebRTC not available');
        }

        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (mounted) {
          setPreviewStream(stream);
          setLoadingPreview(false);
        } else {
          // Component unmounted, stop tracks
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error('Error starting preview:', error);
        if (mounted) {
          Alert.alert(
            'Camera/Microphone Error',
            'Unable to access camera or microphone. Please check permissions.',
            [{ text: 'OK' }]
          );
          setLoadingPreview(false);
        }
      }
    };

    startPreview();

    return () => {
      mounted = false;
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle audio preview
  const toggleAudio = () => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle video preview
  const toggleVideo = () => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Flip camera
  const flipCamera = async () => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((track) => {
        track._switchCamera();
      });
    }
  };

  // Join call
  const handleJoinCall = () => {
    if (!roomId.trim()) {
      Alert.alert('Room ID Required', 'Please enter a room ID to join the call.');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Username Required', 'Please enter your username.');
      return;
    }

    // Stop preview stream before joining
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }

    // Navigate to video call screen
    navigation.navigate('VideoCallScreen', {
      roomId: roomId.trim(),
      username: username.trim(),
      recipientName: 'Room ' + roomId.trim(),
      recipientAvatar: 'R',
    });
  };

  // Generate random room ID
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  const isFormValid = roomId.trim().length > 0 && username.trim().length > 0 && password.trim().length > 0;

  if (isExpoGo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.expoGoContainer}>
          <Ionicons name="warning-outline" size={80} color="#FFA500" />
          <Text style={styles.expoGoTitle}>Development Build Required</Text>
          <Text style={styles.expoGoText}>
            Video calling with camera preview requires a development build.
          </Text>
          <Text style={styles.expoGoText}>
            Run: <Text style={styles.expoGoCode}>eas build --profile development</Text>
          </Text>
          <TouchableOpacity
            style={styles.expoGoButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.expoGoButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Video Call</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Video Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Camera & Microphone Preview</Text>
            <View style={styles.previewContainer}>
              {loadingPreview ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="large" color="#667eea" />
                  <Text style={styles.previewLoadingText}>Starting camera...</Text>
                </View>
              ) : previewStream && !isVideoOff && RTCView ? (
                <RTCView
                  streamURL={previewStream.toURL()}
                  style={styles.preview}
                  objectFit="cover"
                  mirror={true}
                />
              ) : (
                <View style={styles.previewOff}>
                  <Ionicons name="videocam-off" size={64} color="#999" />
                  <Text style={styles.previewOffText}>Camera Off</Text>
                </View>
              )}

              {/* Preview Controls */}
              <View style={styles.previewControls}>
                <TouchableOpacity
                  style={[styles.previewButton, isAudioMuted && styles.previewButtonMuted]}
                  onPress={toggleAudio}
                  disabled={loadingPreview}
                >
                  <Ionicons
                    name={isAudioMuted ? 'mic-off' : 'mic'}
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.previewButton, isVideoOff && styles.previewButtonMuted]}
                  onPress={toggleVideo}
                  disabled={loadingPreview}
                >
                  <Ionicons
                    name={isVideoOff ? 'videocam-off' : 'videocam'}
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={flipCamera}
                  disabled={loadingPreview || isVideoOff}
                >
                  <Ionicons name="camera-reverse" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Room Details */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Call Details</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            {/* Room ID Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room ID</Text>
              <View style={styles.roomIdContainer}>
                <TextInput
                  style={[styles.input, styles.roomIdInput]}
                  placeholder="Enter room ID"
                  value={roomId}
                  onChangeText={setRoomId}
                  autoCapitalize="characters"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generateRoomId}
                >
                  <MaterialIcons name="refresh" size={24} color="#667eea" />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>
                Share this room ID with others to join the same call
              </Text>
            </View>
            
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Join Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              !isFormValid && styles.joinButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="video-call" size={24} color="#FFF" />
                <Text style={styles.joinButtonText}>Login & Join Call</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 3 / 4,
    maxHeight: 400,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewLoading: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewLoadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14,
  },
  previewOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  previewOffText: {
    color: '#999',
    marginTop: 12,
    fontSize: 16,
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 16,
  },
  previewButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonMuted: {
    backgroundColor: '#f5576c',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roomIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomIdInput: {
    flex: 1,
  },
  generateButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  bottomSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#CCC',
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  expoGoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  expoGoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  expoGoText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  expoGoCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
  },
  expoGoButton: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  expoGoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});
