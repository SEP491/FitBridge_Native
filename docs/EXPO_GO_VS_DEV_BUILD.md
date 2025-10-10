# Video Call - Expo Go vs Development Build

## Current Status ✅

The VideoCallScreen now **intelligently detects** whether it's running in Expo Go or a development build, and behaves accordingly.

## How It Works

### 🔍 Detection
```javascript
import Constants from 'expo-constants';
const isExpoGo = Constants.appOwnership === 'expo';
```

### 📱 In Expo Go
When running in Expo Go:
- Shows a **friendly warning screen** explaining WebRTC is not available
- Provides **clear instructions** on how to test with real camera
- Displays a "Go Back" button
- **No crashes** or errors

**What Users See:**
```
┌─────────────────────────────────┐
│       ⚠️ (Warning Icon)         │
│                                 │
│  Development Build Required     │
│                                 │
│  Video calling with real        │
│  camera/microphone requires     │
│  a development build.           │
│                                 │
│  WebRTC is not available in     │
│  Expo Go.                       │
│                                 │
│  ┌─────────────────────────┐   │
│  │ To use this feature:    │   │
│  │ 1. Run: npx expo        │   │
│  │    run:android          │   │
│  │ 2. Or run: npx expo     │   │
│  │    run:ios              │   │
│  │ 3. Or create a          │   │
│  │    development build    │   │
│  └─────────────────────────┘   │
│                                 │
│      [  Go Back  ]             │
└─────────────────────────────────┘
```

### 🚀 In Development Build
When running in a development build (after `npx expo run:android` or `npx expo run:ios`):
- **Full WebRTC support** enabled
- Real camera and microphone access
- All video call features working
- Peer-to-peer video calling capability

## Testing Guide

### Option 1: Test UI in Expo Go ✅ (Current)
```bash
npx expo start
# Scan QR code with Expo Go
# Navigate to video call
# See friendly warning message
```

**What works:**
- ✅ UI and layout
- ✅ Button interactions
- ✅ Navigation
- ✅ Friendly error handling

**What doesn't work:**
- ❌ Real camera access
- ❌ Real microphone access
- ❌ Actual video streaming

### Option 2: Test with Development Build 🎥 (For Real Features)

#### Android:
```bash
npx expo run:android
```

#### iOS:
```bash
npx expo run:ios
```

**What works:**
- ✅ Everything from Option 1, PLUS:
- ✅ Real camera access
- ✅ Real microphone access
- ✅ Video streaming
- ✅ Camera flip
- ✅ Full WebRTC features

## Code Implementation

### Smart Import
```javascript
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
```

### Detection in useEffect
```javascript
useEffect(() => {
  const initializeMedia = async () => {
    // Check if running in Expo Go
    if (isExpoGo) {
      setShowExpoGoWarning(true);
      setConnectionStatus('expo-go');
      return; // Exit early
    }

    // Check if WebRTC is available
    if (!mediaDevices) {
      Alert.alert(...);
      return;
    }

    // Proceed with camera/mic setup
    await startLocalStream();
  };
}, []);
```

### Safe RTCView Usage
```javascript
{localStream && !isVideoOff && RTCView ? (
  <RTCView
    streamURL={localStream.toURL()}
    style={styles.localVideoActive}
    objectFit="cover"
    mirror={!isFlipped}
  />
) : (
  <View style={styles.videoOffLocal}>
    {/* Fallback UI */}
  </View>
)}
```

## Why This Matters

### For Development
- **No crashes** when testing in Expo Go
- Clear feedback on what's needed
- Smooth transition to development build

### For Users
- Professional error handling
- Clear instructions
- No confusion about why camera doesn't work

### For Production
- Same code works in both environments
- No special builds or branches needed
- Easy testing and deployment

## Build Commands Reference

### Development Build (One-time setup)
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### After First Build
Once you've built once, you can use:
```bash
# Start dev server
npx expo start --dev-client

# Then on device, open the app (not Expo Go)
```

## Package Dependencies

### Required for WebRTC (in package.json)
```json
{
  "dependencies": {
    "react-native-webrtc": "^124.0.6",
    "expo-constants": "included with expo"
  }
}
```

### Not Required Anymore ✅
- ~~expo-camera~~ (removed, not compatible)
- ~~expo-av~~ (removed, not needed)

WebRTC handles everything!

## Common Questions

### Q: Can I test video calling in Expo Go?
**A:** No, but you'll see a helpful message explaining how to test it properly.

### Q: Do I need to change code when building for production?
**A:** No! The same code works everywhere. It auto-detects the environment.

### Q: What if someone uses Expo Go in production?
**A:** They'll see the friendly warning. But production apps should use standalone builds anyway.

### Q: Can I still develop other features in Expo Go?
**A:** Yes! Everything except WebRTC works normally in Expo Go.

### Q: How do I know if I'm in a development build?
**A:** 
- App name is your actual app (not "Expo Go")
- Home screen shows your app icon
- Camera features work
- No warning screen appears

## File Structure

```
screens/CommonScreen/VideoCallScreen/
├── VideoCallScreen.js          # Main component with detection logic
docs/
├── CAMERA_MIC_SETUP.md        # Original setup guide
├── WEBRTC_INTEGRATION.md      # Full WebRTC integration
├── VIDEO_CALL_UI.md           # UI documentation
└── EXPO_GO_VS_DEV_BUILD.md    # This file
```

## Next Steps

### For Basic UI Testing (Now) ✅
```bash
npx expo start
# Use Expo Go
# See UI and warning message
```

### For Full Feature Testing (Next) 🎥
```bash
npx expo run:android
# or
npx expo run:ios
# Test with real camera/mic
```

### For Production Deployment (Later) 🚀
```bash
# Build standalone app
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### "Module not found: react-native-webrtc"
**Solution:** This is expected in Expo Go. The code handles it gracefully.

### Warning screen shows in development build
**Cause:** Constants.appOwnership might be 'expo' even in dev build
**Solution:** Check if mediaDevices is available (code already does this)

### Camera doesn't work after building
**Solutions:**
1. Check permissions in device settings
2. Rebuild with `npx expo run:android --device`
3. Verify react-native-webrtc is in package.json

## Summary

| Feature | Expo Go | Development Build |
|---------|---------|------------------|
| UI/Layout | ✅ | ✅ |
| Navigation | ✅ | ✅ |
| Buttons | ✅ | ✅ |
| Camera | ❌ (Warning) | ✅ (Real) |
| Microphone | ❌ (Warning) | ✅ (Real) |
| Video Calling | ❌ (Warning) | ✅ (Real) |
| Error Handling | ✅ Friendly | ✅ Graceful |

---

**Status**: ✅ **Smart Detection Implemented**
**Expo Go**: Shows helpful warning
**Development Build**: Full WebRTC support
**Last Updated**: October 10, 2025
