# Quick Setup Guide - Video Call with Camera & Mic

## What's Been Implemented ✅

### 1. Real Camera & Microphone Access
- ✅ Camera permission handling with `expo-camera`
- ✅ Microphone permission handling with `expo-av`
- ✅ WebRTC local stream capture using `react-native-webrtc`
- ✅ Real-time video display in the UI

### 2. Working Features
- **Camera Controls**:
  - Toggle camera on/off (working with real camera)
  - Flip between front/back camera
  - Picture-in-picture self-view
  
- **Audio Controls**:
  - Mute/unmute microphone
  - Speaker toggle
  - Real-time audio capture

- **Video Display**:
  - Local video preview (your camera)
  - Remote video placeholder (for other person)
  - Professional UI with controls

## Current Status

### ✅ Working Now
1. **Local Video Stream**: Your camera feed is captured and displayed
2. **Permissions**: App will request camera and microphone access
3. **Controls**: All buttons are functional
4. **Camera Flip**: Switch between front/back camera works
5. **Video Toggle**: Turn your camera on/off
6. **Audio Toggle**: Mute/unmute your microphone

### ⏳ Needs Backend for Full Functionality
1. **Remote Video**: Requires signaling server + WebRTC peer connection
2. **Actual Calling**: Need backend to connect two users
3. **Call Notifications**: Incoming call alerts

## How to Test Right Now

### Step 1: Run the App
```bash
npx expo start
```

### Step 2: Test on Physical Device
**Important**: WebRTC requires a real device (won't work on emulator/simulator)

```bash
# For Android
npx expo start --android

# For iOS
npx expo start --ios
```

### Step 3: Grant Permissions
When you open the video call screen:
1. App will ask for Camera permission → **Allow**
2. App will ask for Microphone permission → **Allow**

### Step 4: See Your Camera
- You should see yourself in the small PiP window (top-right)
- The large screen shows placeholder for the other person
- All controls are functional

## Testing the Features

### Test Camera
1. ✅ You should see yourself in the top-right corner
2. ✅ Tap the camera button to turn video off/on
3. ✅ Tap the flip button to switch front/back camera

### Test Microphone
1. ✅ Tap the microphone button to mute/unmute
2. ✅ Button turns red when muted

### Test UI
1. ✅ All buttons respond to taps
2. ✅ End call button (red) goes back to previous screen
3. ✅ Timer shows call duration

## What You'll See

```
┌─────────────────────────────────────┐
│ Sarah Williams         [Add User]   │  ← Top bar with caller info
│ 00:00                              │
│                                     │
│                                     │
│         [Large Video Area]          │  ← Placeholder for remote person
│         (Purple gradient)           │
│              SW                     │
│                                     │
│                  ┌──────┐          │
│                  │ YOU  │          │  ← Your camera (PiP)
│                  │ [📹] │          │
│                  └──────┘          │
│                                     │
│                                     │
│  [🎤] [📹] [❌] [🔊] [⋯]          │  ← Controls
│                                     │
│  Chat  Share  Record               │  ← Quick actions
└─────────────────────────────────────┘
```

## Next Steps for Full Video Calling

To connect two users for a real video call, you need:

### Option 1: Use Existing Service (Easiest)
- Use services like Twilio, Agora, or Vonage
- They handle signaling server and infrastructure
- Follow their React Native integration guides

### Option 2: Build Your Own (Advanced)
1. **Set up signaling server** (Node.js + Socket.io)
   - See `docs/WEBRTC_INTEGRATION.md` for complete guide
   - Handles call setup, offers, answers, ICE candidates

2. **Configure STUN/TURN servers**
   - STUN: Network discovery (free services available)
   - TURN: Relay server for restrictive networks (required for production)

3. **Implement WebRTC peer connection**
   - Create services/webrtcService.js
   - Create services/signalingService.js
   - Connect users peer-to-peer

## File Locations

### Main Files
- `screens/CommonScreen/VideoCallScreen/VideoCallScreen.js` - Main video call UI
- `navigation/Navigator.js` - Screen registration
- `screens/CommonScreen/UserMenuScreen/UserMenuScreen.js` - Entry point

### Documentation
- `docs/VIDEO_CALL_UI.md` - UI documentation
- `docs/WEBRTC_INTEGRATION.md` - Full WebRTC integration guide

## Troubleshooting

### Camera Permission Denied
**Problem**: Camera doesn't show
**Solution**: 
1. Go to device Settings → Apps → FitBridge
2. Enable Camera and Microphone permissions
3. Restart the app

### Black Screen
**Problem**: Video shows black screen
**Solution**:
1. Make sure you're on a real device (not emulator)
2. Check camera permissions are granted
3. Try flipping the camera

### App Crashes on Open
**Problem**: App crashes when opening video call
**Solution**:
1. Make sure permissions are granted
2. Check console for errors
3. Restart the app

### Camera Flip Not Working
**Problem**: Flip camera button doesn't work
**Solution**:
1. Wait for initial camera to load first
2. Some devices may have only one camera
3. Check device camera availability

## Performance Tips

### For Better Quality
- Use Wi-Fi instead of mobile data
- Ensure good lighting for camera
- Keep app in foreground during call
- Close other apps to free memory

### Battery Saving
- Video calls use significant battery
- Keep device plugged in for long calls
- Lower screen brightness
- Use earphones to reduce speaker power

## Security & Privacy

### Current Implementation
- ✅ Permissions requested properly
- ✅ Camera access only when call is active
- ✅ Camera stream stops when call ends
- ✅ No recording without user action

### For Production
- Add end-to-end encryption
- Secure signaling server with authentication
- Log camera/mic access for compliance
- Add privacy indicators

## Quick Commands

```bash
# Install dependencies
npm install

# Run on device
npx expo start --android  # or --ios

# Check for errors
npx expo start --clear

# View logs
npx react-native log-android  # or log-ios
```

## Support & Resources

### Documentation
- [React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)

### Video Call Services
- [Twilio Video](https://www.twilio.com/docs/video)
- [Agora](https://www.agora.io/en/products/video-call/)
- [Vonage Video API](https://www.vonage.com/communications-apis/video/)

### WebRTC Resources
- [WebRTC.org](https://webrtc.org/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

---

**Status**: ✅ Camera and Microphone Working
**Next**: Implement backend signaling server for peer-to-peer connection
**Last Updated**: October 8, 2025
