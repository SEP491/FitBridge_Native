import React, { useState, useEffect, use } from 'react';
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
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useMeetingState } from '../../../context/meetingStateContext';
import signalR_webrtcService from '../../../services/signalR/signalR-webrtcService';
import meetingService from '../../../services/meetingService';

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

export default function VideoCallPrepScreen({ navigation, route }) {
  const [roomId, setRoomId] = useState('e1d7ae1c-b7d5-43d7-8811-a13e8aec983a');
  const [previewStream, setPreviewStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [error, setError] = useState('');
  const [meetingID, setMeetingID] = useState(null);
  const [isCheckingMeeting, setIsCheckingMeeting] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState(''); // 'checking', 'creating', 'ready'

  const { booking } = route.params || {};
  console.log("VideoCallPrepScreen: booking =", booking);

  const checkMeetingExists = async (booking) => {
    setIsCheckingMeeting(true);
    setMeetingStatus('checking');
    try {
      await signalR_webrtcService.startConnection();  
      const response = await meetingService.getMeetingById(booking.bookingId);
      if (response.data) {
        setMeetingID(response.data.id);
        setMeetingStatus('ready');
      } 
    } catch (error) {
      setMeetingStatus('');
      setIsCheckingMeeting(false);
      createMeeting();
      return null;
    } finally {
      setIsCheckingMeeting(false);
    }
  };

  const createMeeting = async () => {
    setIsCheckingMeeting(true);
    setMeetingStatus('creating');
    try {
      const response = await meetingService.createMeeting({
        bookingId: booking.bookingId,
      });
      setMeetingID(response.data.id);
      setMeetingStatus('ready');
    } catch (error) {
      console.error('Error creating meeting:', error);
      setMeetingStatus('');
    } finally {
      setIsCheckingMeeting(false);
    }
  };

  useEffect(() => {
    if (booking.bookingId) {
      checkMeetingExists(booking);
    }
  }, [booking]);


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

  // Handle join button press
  const handleSubmit = () => {
    // Stop preview stream before joining
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    if (meetingID) {
      // Navigate to video call screen
      navigation.navigate('VideoCallScreen', {
        roomId: meetingID.trim(),
        booking: booking,
      });
    }
  };

  // Check if form is valid
  const isFormValid = meetingID !== null && !isCheckingMeeting;



  if (isExpoGo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#ED2A46" />
        <LinearGradient colors={['#ED2A46', '#C41E3A']} style={styles.expoGoContainer}>
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
    <ImageBackground 
      source={require('../../../assets/images/bg-prepscreen.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#ED2A46" />

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
            <View style={styles.previewContainer}>
              {loadingPreview ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="large" color="#ED2A46" />
                  <Text style={styles.previewLoadingText}>Starting camera...</Text>
                </View>
              ) : previewStream && !isVideoOff ? (
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
            </View>

            {/* Preview Controls */}
              <View style={styles.previewControls}>
                <TouchableOpacity
                  style={[styles.previewButton, isAudioMuted ? {backgroundColor: '#ED2A46', } : { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
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
                  style={[styles.previewButton, isVideoOff ? {backgroundColor: '#ED2A46', } : { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
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

          {/* Booking Information Card */}
          {booking && (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Ionicons name="calendar" size={24} color="#ED2A46" />
                <Text style={styles.bookingTitle}>Session Details</Text>
              </View>

              {/* Session Name */}
              <View style={styles.bookingRow}>
                <View style={styles.bookingIconContainer}>
                  <Ionicons name="fitness" size={20} color="#ED2A46" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingLabel}>Session</Text>
                  <Text style={styles.bookingValue}>{booking.bookingName || 'Training Session'}</Text>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.bookingRow}>
                <View style={styles.bookingIconContainer}>
                  <Ionicons name="person" size={20} color="#ED2A46" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingLabel}>Client</Text>
                  <Text style={styles.bookingValue}>{booking.customerName || 'Client'}</Text>
                </View>
              </View>

              {/* Date */}
              <View style={styles.bookingRow}>
                <View style={styles.bookingIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#ED2A46" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingLabel}>Date</Text>
                  <Text style={styles.bookingValue}>
                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Time */}
              <View style={styles.bookingRow}>
                <View style={styles.bookingIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#ED2A46" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingLabel}>Time</Text>
                  <Text style={styles.bookingValue}>
                    {booking.ptFreelanceStartTime && booking.ptFreelanceEndTime
                      ? `${booking.ptFreelanceStartTime.substring(0, 5)} - ${booking.ptFreelanceEndTime.substring(0, 5)}`
                      : 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Note (if available) */}
              {booking.note && (
                <View style={styles.bookingNoteContainer}>
                  <View style={styles.bookingIconContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#667eea" />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingLabel}>Note</Text>
                    <Text style={styles.bookingNoteText}>{booking.note}</Text>
                  </View>
                </View>
              )}

              {/* Nutrition Tip (if available) */}
              {booking.nutritionTip && (
                <View style={styles.nutritionTipContainer}>
                  <View style={styles.nutritionTipHeader}>
                    <Ionicons name="nutrition" size={18} color="#4CAF50" />
                    <Text style={styles.nutritionTipTitle}>Nutrition Tip</Text>
                  </View>
                  <Text style={styles.nutritionTipText}>{booking.nutritionTip}</Text>
                </View>
              )}

              {/* Meeting Status */}
              {isCheckingMeeting && (
                <View style={styles.statusContainer}>
                  <ActivityIndicator size="small" color="#ED2A46" />
                  <Text style={styles.statusText}>
                    {meetingStatus === 'checking' ? 'Checking for existing meeting...' : 'Creating meeting...'}
                  </Text>
                </View>
              )}

              {meetingStatus === 'ready' && !isCheckingMeeting && (
                <View style={styles.readyContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.readyText}>Ready to join</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Join Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              (!isFormValid || isCheckingMeeting) && styles.joinButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading || isCheckingMeeting}
          >
            {loading || isCheckingMeeting ? (
              <>
                <ActivityIndicator color="#FFF" />
                <Text style={styles.joinButtonText}>
                  {meetingStatus === 'checking' && 'Checking Meeting...'}
                  {meetingStatus === 'creating' && 'Creating Meeting...'}
                  {loading && !meetingStatus && 'Loading...'}
                </Text>
              </>
            ) : (
              <>
                <MaterialIcons name="video-call" size={24} color="#FFF" />
                <Text style={styles.joinButtonText}>Join Call</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  previewSection: {
    marginBottom: 15,
    flex: 1,
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(40px)",
    borderRadius: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.21)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    padding:20,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 4 / 4,
    maxHeight: 180,
    width: '80%',
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  previewButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
   
    backdropFilter: 'blur(40px)',
    borderBottomWidth: 1,
    borderRightWidth: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.21)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonMuted: {
    
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  bookingValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bookingNoteContainer: {
    flexDirection: 'row',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  bookingNoteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  nutritionTipContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  nutritionTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  nutritionTipText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF0F2',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#ED2A46',
    marginLeft: 8,
    fontWeight: '500',
  },
  readyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  readyText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(40px)",
    borderRadius: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.21)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    padding:20,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 10,
    maxWidth: 600,
    
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
