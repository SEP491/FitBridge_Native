import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWebRTC } from "./webrtcContext";
import { ConnectionStates } from "../services/signalR/ConnectionStates";
import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import AppStates from "../constants/AppStates";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { CALL_MAINTENANCE_TASK } from "../services/backgroundTasks/callMaintenance";
import { CLIENT_METHODS } from "../services/signalR/signalingMethods";
import registerMeetingManagementHandlers from "../services/signalR/registerMeetingManagementHandlers";
import unregisterMeetingManagementHandlers from "../services/signalR/unregisterMeetingManagementHandlers";
import { useSignalR } from "./signalrContext_webrtc";
// import signalrService from "../services/signalR/service";

const MeetingStateContext = createContext();

export const useMeetingState = () => {
  const context = useContext(MeetingStateContext);
  if (!context) {
    throw new Error(
      "useMeetingState must be used within a MeetingStateProvider"
    );
  }
  return context;
};
export const MeetingStateProvider = ({ children }) => {
  const DEFAULT_LOG_INTERVAL = 5000;

  const [callInfo, setCallInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInBackground, setIsInBackground] = useState(false);
  const [error, setError] = useState(null);

  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [skipInitializeCall, setSkipInitializeCall] = useState(false);
  const [showExpirationAlert, setShowExpirationAlert] = useState(false);
  const [expirationAlertMessage, setExpirationAlertMessage] = useState(
    "Meeting will end in 5 minutes"
  );
  const [stopMeeting, setStopMeeting] = useState(false);
  const [stopMeetingMessage, setStopMeetingMessage] = useState(
    "Meeting has ended, click ok to leave the call"
  );

  const { service: signalrService } = useSignalR();
  const { service: webrtcService } = useWebRTC();

  const onToggleFlipCamera = useCallback(() => {
    webrtcService.toggleFlipCamera();
  }, [webrtcService]);

  const onToggleAudio = useCallback(() => {
    console.log("🔇 [MeetingState] Toggling audio, current state:", isAudioMuted);
    webrtcService.toggleAudio();
    setIsAudioMuted(!isAudioMuted);
    console.log("🔇 [MeetingState] Audio toggled to:", !isAudioMuted);
  }, [webrtcService, isAudioMuted]);

  const onToggleVideo = useCallback(() => {
    console.log("📹 [MeetingState] Toggling video, current state:", isVideoMuted);
    webrtcService.toggleVideo();
    setIsVideoMuted(!isVideoMuted);
    console.log("📹 [MeetingState] Video toggled to:", !isVideoMuted);
  }, [webrtcService, isVideoMuted]);

  const onToggleMinimize = useCallback(() => {
    console.log("onToggleMinimize", isMinimized);
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("notification response received", response);
        if (
          response.notification.request.content.data.action === "return_to_call"
        ) {
          // If call is minimized, maximize it (show full screen)
          if (isMinimized) {
            onToggleMinimize();
          }
          // Note: Navigation to call screen should be handled by the FloatingVideoCall component
          // when user taps the maximize button
        }
      }
    );

    return () => {
      subscription?.remove();
    };
  }, [isMinimized, onToggleMinimize]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === AppStates.BACKGROUND && isInCall) {
        console.log("App backgrounded during call - showing notification");
        setIsInBackground(true);
        await showCallNotifications();
        await startBackgroundTask();
      } else if (nextAppState === AppStates.ACTIVE && isInBackground) {
        console.log("App foregrounded after call - stopping notification");
        setIsInBackground(false);
        await hideCallNotifications();
        await stopBackgroundTask();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [isInCall, isInBackground, startBackgroundTask, stopBackgroundTask]);

  const showCallNotifications = useCallback(async () => {
    try {
      console.log("🔔 [MeetingState] Showing call notification");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Video Call in Progress",
          body: `Click to return to call`,
          data: { action: "return_to_call" },
          sticky: true,
          priority: "high",
        },
        trigger: null, // show immediately
      });
      console.log("✅ [MeetingState] Call notification shown");
    } catch (error) {
      console.error("❌ [MeetingState] Failed to show call notification:", error);
    }
  }, [callInfo]);

  const hideCallNotifications = useCallback(async () => {
    try {
      console.log("🔕 [MeetingState] Hiding call notifications");
      await Notifications.dismissAllNotificationsAsync();
      console.log("✅ [MeetingState] Call notifications hidden");
    } catch (error) {
      console.error("❌ [MeetingState] Failed to hide call notification:", error);
    }
  }, []);

  const startBackgroundTask = useCallback(async () => {
    try {
      console.log("starting background task");
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        CALL_MAINTENANCE_TASK
      );
      if (isRegistered) {
        console.log("background task already registered");
        return;
      }
      await BackgroundTask.registerTaskAsync(CALL_MAINTENANCE_TASK, {
        minimumInterval: 15000,
      });

      console.log("background task registered");
    } catch (error) {
      console.error("Failed to start background task:", error);
    }
  }, []);

  const stopBackgroundTask = useCallback(async () => {
    try {
      console.log("stopping background task");
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        CALL_MAINTENANCE_TASK
      );

      if (!isRegistered) {
        return;
      }
      await BackgroundTask.unregisterTaskAsync(CALL_MAINTENANCE_TASK);
      console.log("background task unregistered");
    } catch (error) {
      console.error("Failed to stop background task:", error);
    }
  }, []);
  const startCall = useCallback(
    async (
      username,
      roomId,
      logInverval = DEFAULT_LOG_INTERVAL,
      logStats = true
    ) => {
      console.log("🚀 [MeetingState] startCall called with:", {
        username,
        roomId,
        logInverval,
        logStats
      });

      const initializeWebRTC = async () => {
        try {
          console.log("📡 [MeetingState] Initializing WebRTC...");
          console.log("📡 [MeetingState] SignalR connection:", signalrService.connection);
          
          setIsLoading(true);
          setError(null);

          console.log("📝 [MeetingState] Registering meeting management handlers...");
          registerMeetingManagementHandlers(
            signalrService.connection,
            signalrService.boundTriggerCallback
          );

          console.log("📝 [MeetingState] Setting up expiration alert handler...");
          signalrService.onEvent(
            CLIENT_METHODS.SHOW_EXPIRATION_ALERT,
            handleShowExpirationAlert
          );
          
          console.log("📝 [MeetingState] Setting up stop meeting handler...");
          signalrService.onEvent(CLIENT_METHODS.STOP_MEETING, handleStopMeeting);

          console.log("🎥 [MeetingState] Setting local stream callback...");
          webrtcService.setLocalStreamCallback((stream) => {
            console.log("✅ [MeetingState] Local stream callback triggered:", stream);
            console.log("🎥 [MeetingState] Local stream tracks:", stream?.getTracks());
            setLocalMediaStream(stream);
          });
          
          console.log("🎥 [MeetingState] Setting remote stream callback...");
          webrtcService.setOnTrackCallback((stream) => {
            console.log("✅ [MeetingState] Remote stream callback triggered:", stream);
            console.log("🎥 [MeetingState] Remote stream tracks:", stream?.getTracks());
            setRemoteMediaStream(stream);
          });

          const finalRoomId = roomId ? roomId : "e1d7ae1c-b7d5-43d7-8811-a13e8aec983a";
          console.log("🔗 [MeetingState] Initializing WebRTC connection...", {
            roomId: finalRoomId,
            username
          });

          await webrtcService.initializeConnection(finalRoomId, username);
          
          console.log("✅ [MeetingState] WebRTC connection initialized successfully");
          
          // webrtcService.startStatsCollection(
          //   (stats) => {
          //     if (logStats) {
          //       // webrtcService.logCallQualityStats(stats);
          //     }
          //   },
          //   logInverval ? parseInt(logInverval) : DEFAULT_LOG_INTERVAL
          // );

          setIsInCall(true);
          setIsLoading(false);
          console.log("✅ [MeetingState] Call started successfully, isInCall set to true");

          signalrService.offEvent("onConnected", initializeWebRTC);
        } catch (error) {
          console.error("❌ [MeetingState] Error initializing WebRTC:", error);
          console.error("❌ [MeetingState] Error stack:", error.stack);
          setError(error.message || "Failed to initialize call");
          setIsLoading(false);
          setIsInCall(false);
        }
      };

      console.log("🔍 [MeetingState] Checking SignalR connection status:", signalrService.connectionStatus.state);
      
      if (
        signalrService.connectionStatus.state === ConnectionStates.CONNECTED
      ) {
        console.log("✅ [MeetingState] SignalR already connected, initializing WebRTC now");
        await initializeWebRTC();
      } else {
        console.log("⏳ [MeetingState] SignalR not connected, waiting for connection...");
        signalrService.onEvent("onConnected", initializeWebRTC);
      }
    },
    [webrtcService, signalrService]
  );

  const endCall = useCallback(() => {
    try {
      console.log("🛑 [MeetingState] endCall called");
      
      if (localMediaStream) {
        console.log("🛑 [MeetingState] Stopping local media stream tracks...");
        localMediaStream.getTracks().forEach((track) => {
          console.log("🛑 [MeetingState] Stopping track:", track.kind, track.id);
          track.stop();
        });
      } else {
        console.log("⚠️ [MeetingState] No local media stream to stop");
      }
      
      if (remoteMediaStream) {
        console.log("🛑 [MeetingState] Stopping remote media stream tracks...");
        remoteMediaStream.getTracks().forEach((track) => {
          console.log("🛑 [MeetingState] Stopping track:", track.kind, track.id);
          track.stop();
        });
      } else {
        console.log("⚠️ [MeetingState] No remote media stream to stop");
      }
      
      if (webrtcService) {
        console.log("🛑 [MeetingState] Closing WebRTC connection...");
        webrtcService.closeConnection();
        webrtcService.setOnTrackCallback(null);
        webrtcService.setLocalStreamCallback(null);
        console.log("✅ [MeetingState] WebRTC connection closed");
      } else {
        console.log("⚠️ [MeetingState] No WebRTC service to close");
      }

      console.log("🛑 [MeetingState] Resetting call state...");
      setSkipInitializeCall(false);
      setIsInCall(false);
      setIsMinimized(false);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setIsLoading(false);
      setError(null);

      if (signalrService) {
        try {
          console.log("🛑 [MeetingState] Removing SignalR event handlers...");
          signalrService.offEvent(
            CLIENT_METHODS.SHOW_EXPIRATION_ALERT,
            handleShowExpirationAlert
          );
          signalrService.offEvent(CLIENT_METHODS.STOP_MEETING, handleStopMeeting);
          console.log("✅ [MeetingState] SignalR event handlers removed");
        } catch (error) {
          console.error('❌ [MeetingState] Error removing signalR event handlers:', error);
        }
      } else {
        console.log("⚠️ [MeetingState] No SignalR service for event cleanup");
      }
      
      console.log("🛑 [MeetingState] Unregistering meeting management handlers...");
      unregisterMeetingManagementHandlers(signalrService?.connection);
      
      console.log("✅ [MeetingState] endCall completed successfully");
    } catch (error) {
      console.error('❌ [MeetingState] Error in endCall:', error);
      console.error('❌ [MeetingState] Error stack:', error.stack);
    }
  }, [webrtcService, localMediaStream, remoteMediaStream, signalrService]);

  const handleShowExpirationAlert = useCallback(() => {
    console.log("⏰ [MeetingState] handleShowExpirationAlert - Meeting expiring soon");
    setShowExpirationAlert(true);
    setExpirationAlertMessage("Meeting will end in 5 minutes");
  }, []);

  const handleStopMeeting = useCallback(() => {
    console.log("🛑 [MeetingState] handleStopMeeting - Meeting stopped by server");
    endCall();
    setStopMeeting(true);
  }, [endCall]);

  return (
    <MeetingStateContext.Provider
      value={{
        isInCall,
        isMinimized,
        isInBackground,
        localMediaStream,
        remoteMediaStream,
        isAudioMuted,
        isVideoMuted,
        isLoading,
        error,
        callInfo,
        skipInitializeCall,
        showExpirationAlert,
        expirationAlertMessage,
        stopMeeting,
        stopMeetingMessage,
        startCall,
        endCall,
        onToggleMinimize,
        onToggleAudio,
        onToggleVideo,
        onToggleFlipCamera,
        setCallInfo,
        showCallNotifications,
        hideCallNotifications,
        startBackgroundTask,
        stopBackgroundTask,
        setSkipInitializeCall,
        setShowExpirationAlert,
        setExpirationAlertMessage,
        setStopMeeting,
        setStopMeetingMessage,
      }}
    >
      {children}
    </MeetingStateContext.Provider>
  );
};
