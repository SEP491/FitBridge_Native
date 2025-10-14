import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSignalR } from "./SignalRContext";
import { useWebRTC } from "./webrtcContext";
import { ConnectionStates } from "../services/signalR/ConnectionStates";

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error("useVideoCall must be used within a VideoCallProvider");
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const DEFAULT_LOG_INTERVAL = 5000;

  const [callInfo, setCallInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState(null);

  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const { service: signalrService } = useSignalR();
  const { service: webrtcService } = useWebRTC();

  const onToggleFlipCamera = useCallback(() => {
    webrtcService.toggleFlipCamera();
  }, [webrtcService]);

  const onToggleAudio = useCallback(() => {
    webrtcService.toggleAudio();
    setIsAudioMuted(!isAudioMuted);
  }, [webrtcService, isAudioMuted]);

  const onToggleVideo = useCallback(() => {
    webrtcService.toggleVideo();
    setIsVideoMuted(!isVideoMuted);
  }, [webrtcService, isVideoMuted]);

  const onToggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const startCall = useCallback(
    async (
      username,
      roomId,
      logInterval = DEFAULT_LOG_INTERVAL,
      logStats = true
    ) => {
      const initializeWebRTC = async () => {
        try {
          setIsLoading(true);
          setError(null);

          webrtcService.setLocalStreamCallback((stream) => {
            console.log('VideoCall: Local stream received');
            setLocalMediaStream(stream);
          });

          webrtcService.setOnTrackCallback((stream) => {
            console.log('VideoCall: Remote stream received');
            setRemoteMediaStream(stream);
          });

          await webrtcService.initializeConnection(roomId, username);

          // Optionally enable stats collection
          if (logStats) {
            webrtcService.startStatsCollection(
              (stats) => {
                webrtcService.logCallQualityStats(stats);
              },
              logInterval
            );
          }

          setIsInCall(true);
          setIsLoading(false);

          signalrService.offEvent("onConnected", initializeWebRTC);
        } catch (err) {
          console.error('VideoCall: Error initializing call', err);
          setError(err.message || 'Failed to start call');
          setIsLoading(false);
        }
      };

      if (signalrService.connectionStatus.state === ConnectionStates.CONNECTED) {
        await initializeWebRTC();
      } else {
        // Wait for SignalR to connect first
        await signalrService.startConnection();
        signalrService.onEvent("onConnected", initializeWebRTC);
      }
    },
    [webrtcService, signalrService]
  );

  const endCall = useCallback(() => {
    try {
      console.log('VideoCall: Ending call');

      if (localMediaStream) {
        localMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (remoteMediaStream) {
        remoteMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      webrtcService.closeConnection();
      webrtcService.setOnTrackCallback(null);
      webrtcService.setLocalStreamCallback(null);

      setLocalMediaStream(null);
      setRemoteMediaStream(null);
      setIsInCall(false);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('VideoCall: Error ending call', err);
    }
  }, [webrtcService, localMediaStream, remoteMediaStream]);

  return (
    <VideoCallContext.Provider
      value={{
        // State
        isInCall,
        localMediaStream,
        remoteMediaStream,
        isAudioMuted,
        isVideoMuted,
        isLoading,
        error,
        callInfo,
        isMinimized,

        // Methods
        startCall,
        endCall,
        onToggleAudio,
        onToggleVideo,
        onToggleFlipCamera,
        onToggleMinimize,
        setCallInfo,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallContext;
