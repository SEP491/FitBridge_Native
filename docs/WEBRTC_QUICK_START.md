# Video Call Quick Start Guide

## Quick Usage

### 1. Basic Video Call Navigation

```javascript
// Navigate to video call screen
navigation.navigate('JoinCallVideoScreen', {
  roomId: 'room-123',
  username: 'john_doe',
  recipientName: 'Jane Smith',
  recipientAvatar: 'JS',
});
```

### 2. Using Video Call Context

```javascript
import { useVideoCall } from '../context/VideoCallContext';

function MyComponent() {
  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    startCall,
    endCall,
    onToggleAudio,
    onToggleVideo,
  } = useVideoCall();

  // Start a call
  const handleStartCall = async () => {
    await startCall('username', 'room-id');
  };

  // End call
  const handleEndCall = () => {
    endCall();
  };

  return (
    <View>
      {isInCall ? (
        <Text>In Call</Text>
      ) : (
        <Button title="Start Call" onPress={handleStartCall} />
      )}
    </View>
  );
}
```

## File Structure

```
FitBridge_Native/
├── context/
│   ├── SignalRContext.js          # SignalR connection provider
│   ├── WebRTCContext.js            # WebRTC service provider
│   └── VideoCallContext.js         # Video call state management
├── services/
│   ├── webrtc/
│   │   └── service.js              # WebRTC peer connection logic
│   └── signalR/
│       ├── signalRService.js       # SignalR hub connection
│       ├── signalingMethods.js     # Hub method constants
│       └── ConnectionStates.js     # Connection state enum
├── screens/
│   └── CommonScreen/
│       └── VideoCallScreen/
│           └── VideoCallScreenNew.js # Video call UI
└── docs/
    └── WEBRTC_IMPLEMENTATION_GUIDE.md # Full documentation
```

## Context Providers Setup

In `App.js`, wrap your app with the providers:

```javascript
import { SignalRProvider } from './context/SignalRContext';
import { WebRTCProvider } from './context/WebRTCContext';
import { VideoCallProvider } from './context/VideoCallContext';

export default function App() {
  return (
    <SignalRProvider>
      <WebRTCProvider>
        <VideoCallProvider>
          {/* Your app */}
        </VideoCallProvider>
      </WebRTCProvider>
    </SignalRProvider>
  );
}
```

## Common Operations

### Start a Call
```javascript
const { startCall } = useVideoCall();
await startCall(username, roomId, 5000, true); // log stats every 5s
```

### End a Call
```javascript
const { endCall } = useVideoCall();
endCall();
```

### Toggle Microphone
```javascript
const { onToggleAudio, isAudioMuted } = useVideoCall();
onToggleAudio(); // Toggles mute state
```

### Toggle Camera
```javascript
const { onToggleVideo, isVideoMuted } = useVideoCall();
onToggleVideo(); // Toggles camera on/off
```

### Flip Camera
```javascript
const { onToggleFlipCamera } = useVideoCall();
onToggleFlipCamera(); // Switch between front/back camera
```

## Video Stream Display

```javascript
import { RTCView } from 'react-native-webrtc';
import { useVideoCall } from '../context/VideoCallContext';

function VideoDisplay() {
  const { localMediaStream, remoteMediaStream } = useVideoCall();

  return (
    <View>
      {/* Remote video (full screen) */}
      {remoteMediaStream && (
        <RTCView
          streamURL={remoteMediaStream.toURL()}
          style={{ width: '100%', height: '100%' }}
          objectFit="cover"
          mirror={false}
        />
      )}

      {/* Local video (picture-in-picture) */}
      {localMediaStream && (
        <RTCView
          streamURL={localMediaStream.toURL()}
          style={{ width: 120, height: 160 }}
          objectFit="cover"
          mirror={true}
        />
      )}
    </View>
  );
}
```

## Environment Setup

### Required Environment Variables

Create a `.env` file:
```env
EXPO_PUBLIC_TURN_USERNAME=your-metered-username
EXPO_PUBLIC_TURN_CREDENTIAL=your-metered-credential
EXPO_PUBLIC_SIGNALR_HUB_URL=https://your-server.com/videohub
```

### Get TURN Server Credentials

1. Go to [metered.ca](https://www.metered.ca/)
2. Sign up for free account
3. Get your credentials
4. Add to `.env` file

## Building the App

### Development Build (Required for WebRTC)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Build for iOS
eas build --profile development --platform ios
```

### Why Development Build?

WebRTC uses native modules that are **NOT available in Expo Go**. You must build a development build to test video calling.

## Testing

### Two Device Testing

1. **Device 1**: Start a call with `roomId: "test-room"`
2. **Device 2**: Join the same `roomId: "test-room"`
3. Both devices should see each other's video

### Test Checklist

- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Local video visible
- [ ] Remote video visible (with second user)
- [ ] Audio working
- [ ] Mute/unmute working
- [ ] Camera on/off working
- [ ] Camera flip working
- [ ] Call ends properly
- [ ] No memory leaks after call

## Troubleshooting

### Problem: "WebRTC not available"
**Solution**: Build a development build, don't use Expo Go

### Problem: No video/audio
**Solution**: Check permissions in device settings

### Problem: Can't connect to other user
**Solution**: Verify both users have the same `roomId`

### Problem: "SignalR connection failed"
**Solution**: Check `EXPO_PUBLIC_SIGNALR_HUB_URL` is correct

### Problem: Poor video quality
**Solution**: Check network connection, enable stats logging

## Console Logs to Monitor

```
✅ Good logs:
- "SignalR: Connection established"
- "WebRTC [username]: Room joined, isPolite: true"
- "WebRTC [username]: Local stream received"
- "WebRTC [username]: connected ice connection"
- "VideoCall: Remote stream received"

❌ Problem logs:
- "WebRTC: Cannot initialize - no peer connection"
- "SignalR: Connection failed"
- "WebRTC: ICE connection failed"
- "Error initializing call"
```

## API Reference

### useVideoCall() Hook

Returns an object with:

**State:**
- `isInCall` (boolean): Whether currently in a call
- `localMediaStream` (MediaStream|null): Local video/audio stream
- `remoteMediaStream` (MediaStream|null): Remote video/audio stream
- `isAudioMuted` (boolean): Microphone muted state
- `isVideoMuted` (boolean): Camera off state
- `isLoading` (boolean): Call initialization in progress
- `error` (string|null): Error message if any
- `callInfo` (object|null): Current call information

**Methods:**
- `startCall(username, roomId, logInterval?, logStats?)`: Initialize and start a call
- `endCall()`: End current call and clean up resources
- `onToggleAudio()`: Toggle microphone on/off
- `onToggleVideo()`: Toggle camera on/off
- `onToggleFlipCamera()`: Switch between front/back camera
- `setCallInfo(info)`: Set call metadata

## Next Steps

1. ✅ Set up environment variables
2. ✅ Build development build
3. ✅ Test basic call flow
4. 📝 Implement call history
5. 📝 Add push notifications for incoming calls
6. 📝 Implement call quality indicators
7. 📝 Add recording functionality

## Support & Documentation

- Full documentation: `docs/WEBRTC_IMPLEMENTATION_GUIDE.md`
- WebRTC service: `services/webrtc/service.js`
- SignalR service: `services/signalR/signalRService.js`
- Video call context: `context/VideoCallContext.js`

## Example: Custom Call Screen

```javascript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useVideoCall } from '../context/VideoCallContext';

export default function CustomCallScreen() {
  const {
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isLoading,
    error,
    onToggleAudio,
    onToggleVideo,
    endCall,
  } = useVideoCall();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* Remote Video */}
      {remoteMediaStream && (
        <RTCView
          streamURL={remoteMediaStream.toURL()}
          style={{ flex: 1 }}
          objectFit="cover"
        />
      )}

      {/* Local Video */}
      {localMediaStream && (
        <RTCView
          streamURL={localMediaStream.toURL()}
          style={{ width: 120, height: 160, position: 'absolute', top: 20, right: 20 }}
          objectFit="cover"
          mirror={true}
        />
      )}

      {/* Controls */}
      <View style={{ flexDirection: 'row', position: 'absolute', bottom: 40 }}>
        <TouchableOpacity onPress={onToggleAudio}>
          <Text>{isAudioMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onToggleVideo}>
          <Text>{isVideoMuted ? '📷❌' : '📷'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={endCall}>
          <Text>📞 End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

**Ready to start video calling!** 🎥📞
