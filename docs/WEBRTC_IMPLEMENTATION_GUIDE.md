# WebRTC Video Call Implementation Guide

## Overview

This implementation follows the same architecture as the reference project (`webrtc-client-1to1-mobile`), using React Context API for state management and service layers for WebRTC and SignalR functionality.

## Architecture

### 1. Service Layer

#### WebRTC Service (`services/webrtc/service.js`)
- **Purpose**: Handles all WebRTC peer connection logic
- **Key Features**:
  - Perfect negotiation pattern (polite/impolite behavior)
  - ICE candidate queuing to prevent race conditions
  - Automatic reconnection on ICE connection failures
  - Call quality stats collection
  - Media track management (audio/video toggle, camera flip)

#### SignalR Service (`services/signalR/signalRService.js`)
- **Purpose**: Manages WebSocket connection with SignalR hub
- **Key Features**:
  - Automatic reconnection with exponential backoff
  - Event-based callback system
  - Group/room management
  - Hub method invocation

### 2. Context Layer

#### SignalRContext (`context/SignalRContext.js`)
- Provides SignalR service instance to the entire app
- Handles connection lifecycle
- Automatically stops connection on unmount

#### WebRTCContext (`context/WebRTCContext.js`)
- Provides WebRTC service instance
- Automatically registers/unregisters SignalR handlers based on connection state
- Ensures proper cleanup when SignalR disconnects

#### VideoCallContext (`context/VideoCallContext.js`)
- High-level video call state management
- Provides convenient hooks for UI components
- Manages call lifecycle (start, end)
- Handles media streams (local and remote)
- Provides toggle functions for audio/video/camera

### 3. UI Layer

#### VideoCallScreen (`screens/CommonScreen/VideoCallScreen/VideoCallScreenNew.js`)
- Pure UI component using `useVideoCall()` hook
- No direct service manipulation
- Declarative state management
- Automatic Expo Go detection

## Key Differences from Previous Implementation

### Before (Direct Service Calls)
```javascript
// In VideoCallScreen.js
import videoCallService from '../../../services/videoCallService';

// Manual initialization
await videoCallService.initialize(roomId, username);
videoCallService.setLocalStreamCallback((stream) => setLocalStream(stream));

// Manual cleanup
await videoCallService.cleanup();
```

### After (Context-Based)
```javascript
// In VideoCallScreen.js
import { useVideoCall } from '../../../context/VideoCallContext';

// Declarative state
const {
  localMediaStream,
  remoteMediaStream,
  isInCall,
  startCall,
  endCall,
} = useVideoCall();

// Simple calls
await startCall(username, roomId);
```

## Setup and Integration

### 1. App-Level Setup

The contexts must be wrapped in the correct order in `App.js`:

```javascript
<SignalRProvider>        {/* 1. SignalR connection */}
  <WebRTCProvider>       {/* 2. WebRTC service */}
    <VideoCallProvider>  {/* 3. Video call state */}
      {/* Your app */}
    </VideoCallProvider>
  </WebRTCProvider>
</SignalRProvider>
```

### 2. Starting a Video Call

Navigate to VideoCallScreen with required params:

```javascript
navigation.navigate('JoinCallVideoScreen', {
  roomId: 'unique-room-id',
  username: 'current-user-name',
  recipientName: 'Recipient Name',
  recipientAvatar: 'RN',
});
```

### 3. Using the Video Call Context

```javascript
import { useVideoCall } from '../../../context/VideoCallContext';

function MyComponent() {
  const {
    // State
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isLoading,
    error,
    
    // Methods
    startCall,
    endCall,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
  } = useVideoCall();
  
  // Use the state and methods
}
```

## Call Flow

### 1. Call Initialization

```
User navigates to VideoCallScreen
  ↓
VideoCallScreen calls startCall(username, roomId)
  ↓
VideoCallContext checks SignalR connection state
  ↓
If not connected: Wait for connection
If connected: Initialize immediately
  ↓
WebRTC service initializes peer connection
  ↓
Join room via SignalR (returns isPolite flag)
  ↓
Collect local media stream
  ↓
Add tracks to peer connection
  ↓
Call is ready (waiting for remote peer)
```

### 2. Perfect Negotiation

```
Peer A (Polite)              Peer B (Impolite)
     |                              |
     |--- negotiationneeded ------->|
     |<-- offer (via SignalR) ------|
     |                              |
     |--- answer (via SignalR) ---->|
     |                              |
     |<-- ICE candidates ---------->|
     |                              |
     |========= CONNECTED ==========|
```

### 3. Offer Collision Handling

When both peers create offers simultaneously:
- **Polite peer**: Discards its offer, accepts remote offer
- **Impolite peer**: Ignores remote offer, keeps its offer

This prevents negotiation deadlocks.

### 4. Call Termination

```
User clicks "End Call"
  ↓
VideoCallScreen calls endCall()
  ↓
Stop all local media tracks
  ↓
Stop all remote media tracks
  ↓
WebRTC service closes peer connection
  ↓
Leave room via SignalR
  ↓
Clean up callbacks and state
  ↓
Navigate back
```

## WebRTC Configuration

### ICE Servers (TURN/STUN)

```javascript
const iceServers = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:standard.relay.metered.ca:80",
    username: process.env.EXPO_PUBLIC_TURN_USERNAME,
    credential: process.env.EXPO_PUBLIC_TURN_CREDENTIAL,
  },
  // ... more TURN servers
];
```

**Important**: Set these environment variables in `.env`:
```
EXPO_PUBLIC_TURN_USERNAME=your-username
EXPO_PUBLIC_TURN_CREDENTIAL=your-credential
```

## SignalR Hub Methods

### Hub Methods (Client → Server)

```javascript
HUB_METHODS = {
  JOIN_ROOM: 'JoinRoom',
  LEAVE_ROOM: 'LeaveRoom',
  SEND_MESSAGE: 'SendMessage',
  SEND_ICE_CANDIDATE: 'SendIceCandidate',
}
```

### Client Methods (Server → Client)

```javascript
CLIENT_METHODS = {
  RECEIVE_MESSAGE: 'ReceiveMessage',
  RECEIVE_ICE_CANDIDATE: 'ReceiveICECandidate',
  USER_JOINED: 'UserJoined',
  USER_LEFT: 'UserLeft',
}
```

## Call Quality Monitoring

The WebRTC service provides built-in stats collection:

```javascript
// Enable stats logging
await startCall(username, roomId, 5000, true); // log every 5s

// Stats include:
// - Video: FPS, resolution, bitrate, packet loss
// - Audio: bitrate, packet loss, jitter, audio level
// - Network: RTT, available bandwidth
```

### Example Stats Output

```
=== CALL QUALITY METRICS ===
Connection: connected | ICE: connected
Ping: 45.2ms
Video FPS: In=30 Out=30
Video Resolution: In=640x480 Out=640x480
Video Bitrate: In=850.5kbps Out=820.3kbps
Video Packet Loss: In=0.12% Out=0.08%
Audio Bitrate: In=64.2kbps Out=64.5kbps
Audio Packet Loss: In=0.00% Out=0.00%
Audio Level: In=0.45 Out=0.38
Jitter: Video=0.003ms Audio=0.002ms
==========================
```

## Error Handling

### Connection Errors

```javascript
const { error, isLoading } = useVideoCall();

if (error) {
  // Display error UI
  return <ErrorScreen error={error} />;
}

if (isLoading) {
  // Display loading UI
  return <LoadingScreen />;
}
```

### ICE Connection Failures

The service automatically handles:
- **ICE connection failed**: Restarts ICE immediately
- **ICE connection disconnected**: Waits 3 seconds, then restarts ICE

### User Disconnection

When a user leaves:
```javascript
handleUserLeft(username) {
  // Stop stats collection
  // Reset peer connection
  // Reinitialize connection (stay in room)
}
```

## Expo Go vs Development Build

### Expo Go Limitations

WebRTC requires native modules that are **not available in Expo Go**. The app detects this and shows a friendly warning.

### Building for Testing

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### Detection Code

```javascript
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

if (isExpoGo) {
  // Show warning screen
  return <ExpoGoWarning />;
}
```

## Best Practices

### 1. Always Use Contexts

❌ **Don't**:
```javascript
import webrtcService from './services/webrtc/service';
webrtcService.initialize(); // Direct service call
```

✅ **Do**:
```javascript
const { startCall } = useVideoCall();
await startCall(username, roomId);
```

### 2. Clean Up Resources

The contexts handle cleanup automatically, but ensure proper navigation:

```javascript
const handleEndCall = () => {
  endCall(); // Context handles cleanup
  navigation.goBack(); // Navigate away
};
```

### 3. Handle Permissions

Android requires explicit permission requests:

```javascript
// The VideoCallScreen handles this, but for custom implementations:
const grants = await PermissionsAndroid.requestMultiple([
  PermissionsAndroid.PERMISSIONS.CAMERA,
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
]);
```

### 4. Test with Real Network Conditions

- Test on cellular networks (3G, 4G, 5G)
- Test with poor WiFi
- Test with network interruptions
- Monitor call quality stats

## Troubleshooting

### No Video/Audio

1. **Check permissions**: Ensure camera/microphone permissions are granted
2. **Check device**: Test on real device (not simulator for iOS)
3. **Check logs**: Look for WebRTC initialization errors
4. **Check TURN servers**: Verify credentials are correct

### Connection Not Establishing

1. **Check SignalR**: Verify SignalR connection is established
2. **Check room ID**: Ensure both users use the same room ID
3. **Check ICE candidates**: Look for ICE candidate exchange in logs
4. **Check firewall**: Some networks block WebRTC traffic

### Poor Call Quality

1. **Enable stats**: Set `logStats: true` in `startCall()`
2. **Check packet loss**: High packet loss indicates network issues
3. **Check bandwidth**: Monitor available incoming/outgoing bandwidth
4. **Check RTT**: High round-trip time indicates latency

### Memory Leaks

The contexts automatically clean up resources, but ensure:
- Streams are stopped when call ends
- Event listeners are removed
- Peer connections are closed

## Testing Checklist

- [ ] Start call successfully
- [ ] See local video
- [ ] See remote video (with second user)
- [ ] Toggle audio (mute/unmute)
- [ ] Toggle video (camera on/off)
- [ ] Flip camera (front/back)
- [ ] End call gracefully
- [ ] Handle network interruptions
- [ ] Handle user disconnect
- [ ] Display call duration
- [ ] Show Expo Go warning
- [ ] Show loading state
- [ ] Show error state
- [ ] Test on Android
- [ ] Test on iOS

## Future Enhancements

- [ ] Screen sharing
- [ ] Recording
- [ ] Picture-in-Picture mode
- [ ] Background call notifications
- [ ] Group video calls (more than 2 participants)
- [ ] Virtual backgrounds
- [ ] Noise suppression
- [ ] Echo cancellation
- [ ] Call quality indicators in UI
- [ ] Network bandwidth adaptation

## Resources

- [WebRTC API Documentation](https://webrtc.org/)
- [Perfect Negotiation Pattern](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all services are properly initialized
3. Ensure environment variables are set correctly
4. Test with a development build (not Expo Go)
5. Review this documentation thoroughly
