# Video Call UI - 1v1 Call Documentation

## Overview
A professional 1-on-1 video call interface designed for personal training sessions, consultations, and one-on-one interactions. The UI follows modern video calling standards (FaceTime, WhatsApp, Telegram) with emphasis on personal connection and simplicity.

## Features

### 🎥 Core Features
- **Full-Screen Remote Video**: Large, immersive view of the other participant
- **Picture-in-Picture Local Video**: Self-preview with draggable positioning
- **Connection Status Indicator**: Real-time connection quality and duration
- **Call Duration Timer**: Automatic time tracking from call start
- **Camera Flip**: Quick toggle between front and back cameras
- **HD Quality Indicator**: Shows current call quality (HD, SD)

### 🎛️ Call Controls
1. **Microphone Toggle**: Mute/unmute audio
2. **Camera Toggle**: Turn video on/off
3. **End Call**: Red button to terminate the call
4. **Speaker Toggle**: Switch between speaker and earpiece
5. **More Options**: Access additional features

### ✨ Quick Actions
- **Chat**: In-call text messaging
- **Screen Share**: Share your screen with the other person
- **Record**: Record the call (with permission)

### 🎨 UI/UX Highlights

#### Local Video (Self Preview)
- **Position**: Top-right corner for unobtrusive viewing
- **Size**: 100x150px rounded rectangle
- **Features**:
  - Camera off indicator badge
  - Flip camera button (bottom-right)
  - Semi-transparent background when camera is off
  - Draggable (future enhancement)

#### Remote Video (Main View)
- **Layout**: Full-screen immersive experience
- **Background**: Gradient background with caller avatar when:
  - Connecting to call
  - Other person's camera is off
  - Connection issues
- **Avatar**: Large circular avatar with initials
- **Animations**: Pulsing effect during connection

#### Control Bar (Bottom)
- **Background**: Black gradient overlay for readability
- **Layout**: 5 main controls evenly spaced
- **States**: Active/inactive with color changes
- **End Call Button**: 
  - Larger than other buttons (64x64px)
  - Rotated phone icon
  - Red background with shadow
  - Prominent position in center

#### Top Bar
- **Background**: Black gradient overlay
- **Content**:
  - Caller name and role
  - Connection status with animated indicator
  - Call duration timer (MM:SS format)
  - Add participant button

## Component Structure

```
VideoCallScreen
├── Remote Video Container (Full Screen)
│   ├── Gradient Background
│   ├── Large Avatar (when no video)
│   └── Connection Status Overlay
├── Top Bar
│   ├── Caller Info
│   │   ├── Name
│   │   ├── Status (Connecting/Connected/Reconnecting)
│   │   └── Duration Timer
│   └── Add Participant Button
├── Local Video (PiP)
│   ├── Video Preview
│   ├── Camera Off Indicator
│   └── Flip Camera Button
├── Connection Quality Indicator
│   ├── WiFi Icon
│   └── Quality Badge (HD/SD)
└── Bottom Controls
    ├── Main Controls
    │   ├── Microphone
    │   ├── Camera
    │   ├── End Call
    │   ├── Speaker
    │   └── More Options
    └── Quick Actions
        ├── Chat
        ├── Screen Share
        └── Record
```

## State Management

### Call States
```javascript
const [isMuted, setIsMuted] = useState(false);
const [isVideoOff, setIsVideoOff] = useState(false);
const [isSpeakerOn, setIsSpeakerOn] = useState(true);
const [isFlipped, setIsFlipped] = useState(false);
const [callDuration, setCallDuration] = useState(0);
const [connectionStatus, setConnectionStatus] = useState('connecting');
```

### Connection Status Values
- `'connecting'` - Initial call setup
- `'connected'` - Active call with good connection
- `'reconnecting'` - Temporary connection loss

## Styling Guide

### Colors
- **Background**: Pure black `#000`
- **Primary Red**: `#ED2A46` (active states, end call)
- **Remote Video Gradient**: `['#667eea', '#764ba2']` (purple)
- **Local Video Gradient**: `['#f093fb', '#f5576c']` (pink)
- **Control Background**: `rgba(255,255,255,0.2)` (semi-transparent)
- **Active Control**: `rgba(237, 42, 70, 0.8)` (red with transparency)
- **Text**: White with various opacities

### Dimensions
- **Local Video**: 100x150px
- **Control Buttons**: 56x56px
- **End Call Button**: 64x64px
- **Large Avatar**: 120x120px
- **Small Avatar**: 50x50px

### Gradients
1. **Top Overlay**: `['rgba(0,0,0,0.7)', 'transparent']`
2. **Bottom Overlay**: `['transparent', 'rgba(0,0,0,0.8)']`
3. **Remote Video**: Purple gradient for visual appeal
4. **Local Video**: Pink gradient for differentiation

## Usage Example

```javascript
// Navigate to video call
navigation.navigate('JoinCallVideoScreen', {
  callId: 'unique-call-id',
  callerName: 'Sarah Williams',
  callerRole: 'Personal Trainer',
  callerAvatar: 'SW'
});
```

## Integration Points

### 1. WebRTC Integration
```javascript
// Replace mock video with real WebRTC streams
import { RTCView } from 'react-native-webrtc';

// Remote video
<RTCView 
  streamURL={remoteStream.toURL()} 
  style={styles.remoteVideo}
/>

// Local video
<RTCView 
  streamURL={localStream.toURL()} 
  style={styles.localVideo}
  mirror={true}
/>
```

### 2. Real-Time Communication
```javascript
// Socket.io or WebSocket for signaling
socket.on('call-status', (status) => {
  setConnectionStatus(status);
});

socket.on('participant-video-toggle', (isEnabled) => {
  // Update remote video state
});
```

### 3. Media Controls
```javascript
// Microphone toggle
const toggleMicrophone = async () => {
  localStream.getAudioTracks()[0].enabled = !isMuted;
  setIsMuted(!isMuted);
  // Notify other participant
  socket.emit('audio-toggle', !isMuted);
};

// Camera toggle
const toggleCamera = async () => {
  localStream.getVideoTracks()[0].enabled = !isVideoOff;
  setIsVideoOff(!isVideoOff);
  // Notify other participant
  socket.emit('video-toggle', !isVideoOff);
};

// Camera flip
const flipCamera = async () => {
  const videoTrack = localStream.getVideoTracks()[0];
  await videoTrack._switchCamera();
  setIsFlipped(!isFlipped);
};
```

### 4. Backend API
```javascript
// Start call
const startCall = async (recipientId) => {
  const response = await fetch('/api/calls/start', {
    method: 'POST',
    body: JSON.stringify({ recipientId }),
  });
  return response.json();
};

// End call
const endCall = async (callId) => {
  await fetch(`/api/calls/${callId}/end`, {
    method: 'POST',
  });
  navigation.goBack();
};
```

## Call Flow

### 1. Incoming Call
```
User receives call notification
→ Accept/Decline options
→ Navigate to VideoCallScreen
→ Connection status: 'connecting'
→ WebRTC handshake
→ Connection status: 'connected'
→ Call duration timer starts
```

### 2. Outgoing Call
```
User initiates call
→ Navigate to VideoCallScreen
→ Show ringing state
→ Wait for recipient to answer
→ Connection status: 'connecting'
→ WebRTC handshake
→ Connection status: 'connected'
```

### 3. Active Call
```
Both participants connected
→ Real-time video/audio streams
→ Control toggles update in real-time
→ Connection quality monitoring
→ Automatic reconnection on network issues
```

### 4. Call End
```
Either participant ends call
→ Close WebRTC connections
→ Send end call event
→ Clean up resources
→ Navigate back to previous screen
```

## Future Enhancements

### Short-term
1. **Draggable PiP**: Allow users to move local video around
2. **Call Recording**: Save call for later review
3. **Background Blur**: Blur background during video
4. **Beauty Filters**: Simple video enhancement
5. **Network Stats**: Detailed connection information

### Medium-term
1. **Screen Sharing**: Share screen with annotations
2. **Virtual Backgrounds**: Replace background with images
3. **Noise Cancellation**: AI-powered audio enhancement
4. **Picture Mode**: Continue call while using other apps
5. **Call History**: View past call records

### Long-term
1. **Group Calls**: Expand to 3-4 participants
2. **Live Captions**: Real-time speech-to-text
3. **Translation**: Automatic language translation
4. **Workout Tracking**: Exercise counting during PT sessions
5. **AR Features**: Virtual equipment and guides

## Animations

### Connection Status
- **Connecting**: Pulsing avatar (scale 1.0 → 1.1)
- **Connected**: Smooth fade-in of video
- **Reconnecting**: Orange dot indicator

### Control Feedback
- **Button Press**: Scale animation (1.0 → 0.95 → 1.0)
- **State Change**: Color transition (0.3s)
- **End Call**: Slight rotation + scale

## Accessibility

### Screen Reader Support
- All buttons have accessibility labels
- Status announcements for connection changes
- Timer updates announced every minute

### Visual Indicators
- High contrast controls on dark background
- Color-blind friendly status indicators
- Large touch targets (minimum 44x44px)

### Audio Feedback
- Connection sounds (optional)
- Notification tones for status changes
- Vibration feedback for important actions

## Performance Considerations

### Optimization
- Hardware-accelerated video rendering
- Adaptive bitrate based on network
- Frame rate adjustment for low-end devices
- Background blur optimization

### Battery Management
- Reduce frame rate when idle
- Lower resolution on battery saving mode
- Pause video when app in background

### Network Handling
- Automatic quality adjustment
- Buffer management
- Reconnection logic with exponential backoff

## Testing Checklist

### Functional Testing
- [ ] Make outgoing call
- [ ] Receive incoming call
- [ ] Toggle microphone on/off
- [ ] Toggle camera on/off
- [ ] Flip camera (front/back)
- [ ] Toggle speaker on/off
- [ ] End call gracefully
- [ ] Handle network loss
- [ ] Reconnection after disconnect

### UI Testing
- [ ] Local video displays correctly
- [ ] Remote video fills screen
- [ ] Controls respond to touch
- [ ] Timer shows correct duration
- [ ] Status indicators update
- [ ] Animations are smooth
- [ ] Overlays don't block content

### Edge Cases
- [ ] Other person's camera off
- [ ] Both cameras off
- [ ] Network interruption
- [ ] Low bandwidth scenario
- [ ] App backgrounding
- [ ] Incoming phone call
- [ ] Battery low state

## API Requirements

### Endpoints Needed
```
POST   /api/calls/start          - Initiate a call
POST   /api/calls/:id/answer     - Answer incoming call
POST   /api/calls/:id/reject     - Reject incoming call
POST   /api/calls/:id/end        - End active call
GET    /api/calls/:id/status     - Get call status
PUT    /api/calls/:id/quality    - Report quality metrics
```

### WebSocket Events
```
call-initiated     - New call started
call-answered      - Call was answered
call-ended         - Call terminated
call-quality       - Quality report
audio-toggle       - Mic muted/unmuted
video-toggle       - Camera on/off
ice-candidate      - WebRTC signaling
offer              - WebRTC offer
answer             - WebRTC answer
```

## Security Considerations

### Privacy
- End-to-end encryption for video/audio
- Secure WebRTC connections (DTLS-SRTP)
- No call recording without consent
- Clear indicators when recording

### Permissions
- Camera permission required
- Microphone permission required
- Notification permission for incoming calls
- Storage permission for recordings

### Data Protection
- No video data stored on device
- Secure token-based authentication
- TURN/STUN server authentication
- Rate limiting on call attempts

---

**Last Updated**: October 8, 2025
**Version**: 1.0.0
**Component**: VideoCallScreen
**Path**: `/screens/CommonScreen/VideoCallScreen/VideoCallScreen.js`
