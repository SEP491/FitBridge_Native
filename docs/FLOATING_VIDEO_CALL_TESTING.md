# Testing the Floating Video Call

## Prerequisites

1. **Development Build Required:**
   ```bash
   eas build --profile development --platform android
   # or
   eas build --profile development --platform ios
   ```

2. **Install the build on your device:**
   - Android: Install the APK
   - iOS: Use TestFlight or direct installation

## Test Scenarios

### Test 1: Basic Minimize/Maximize Flow

**Steps:**
1. Open app and navigate to Video Call Prep screen
2. Enter room ID (e.g., "test123")
3. Tap "Join Call" button
4. Wait for video call screen to load
5. Tap the minimize button (horizontal line icon, top-right)
6. Verify floating window appears
7. Tap maximize button (expand icon, top-right of floating window)
8. Verify full screen returns

**Expected Results:**
- ✅ Video streams continue during minimize
- ✅ Floating window shows remote video (main) and local video (PiP)
- ✅ Can return to full screen
- ✅ No connection interruption

### Test 2: Dragging Behavior

**Steps:**
1. Minimize video call to get floating window
2. Drag the window to different positions on screen
3. Release in various areas
4. Observe snap-to-corner behavior

**Expected Results:**
- ✅ Window follows finger smoothly
- ✅ Window scales down (0.95x) and becomes slightly transparent during drag
- ✅ Window snaps to nearest corner when released
- ✅ Smooth spring animation to corner
- ✅ Window returns to normal scale and opacity

### Test 3: Navigation with Floating Window

**Steps:**
1. Minimize video call
2. Navigate to different screens:
   - Home screen
   - Gym detail screen
   - Blog screen
   - Profile screen
3. Verify floating window persists

**Expected Results:**
- ✅ Floating window stays visible on all screens
- ✅ Window maintains position across navigation
- ✅ Video continues playing
- ✅ Can still interact with floating window

### Test 4: Control Buttons in Floating Mode

**Steps:**
1. Minimize video call
2. Test each control button:
   - Microphone toggle
   - Camera toggle
   - End call button
   - Flip camera button

**Expected Results:**
- ✅ Mic button mutes/unmutes audio (icon changes)
- ✅ Camera button enables/disables video
- ✅ End call terminates call and removes floating window
- ✅ Flip camera switches front/back camera
- ✅ Visual feedback for each action

### Test 5: Multiple Minimize/Maximize Cycles

**Steps:**
1. Join video call
2. Minimize → Maximize → Minimize → Maximize (repeat 3-5 times)
3. Check for memory leaks or performance issues

**Expected Results:**
- ✅ Smooth transitions each time
- ✅ No lag or stuttering
- ✅ Video quality remains consistent
- ✅ No memory warnings in console

### Test 6: Edge Cases

**Steps:**
1. Minimize call, then navigate back manually
2. Try to minimize when already minimized
3. End call while minimized
4. Minimize immediately after joining call
5. Rotate device while floating window visible (if supported)

**Expected Results:**
- ✅ Graceful handling of all edge cases
- ✅ No crashes or undefined behavior
- ✅ Proper cleanup on end call

## Debugging Tips

### Check Console Logs

Look for these log messages:

```javascript
// Connection
WebRTC: Starting local media
WebRTC: Signaling state changed: [state]
WebRTC: ICE connection state changed: [state]

// Streams
VideoCall: Local stream obtained
VideoCall: Remote stream received

// Minimize
VideoCall: Toggle minimize: [true/false]

// Navigation
Navigation: VideoCallScreen -> [previous screen]
```

### Common Issues

**Issue 1: Floating window not appearing**
- Check: Is `isInCall` true?
- Check: Is `isMinimized` true?
- Check: Is it Expo Go? (should return null)
- Solution: Verify context state in React DevTools

**Issue 2: Video not showing in floating window**
- Check: Are streams available? (localMediaStream, remoteMediaStream)
- Check: Is RTCView imported correctly?
- Solution: Log stream.toURL() values

**Issue 3: Dragging not working**
- Check: Is GestureHandlerRootView wrapping the app?
- Check: Are reanimated and gesture-handler installed?
- Solution: Run `npm list react-native-reanimated react-native-gesture-handler`

**Issue 4: Navigation error on maximize**
- Check: Is FloatingVideoCall inside NavigationContainer?
- Check: Is VideoCallScreen registered in navigation?
- Solution: Move FloatingVideoCall to Navigator.js

**Issue 5: Window position resets**
- Check: Is draggableContainerPosition state maintained?
- Solution: Verify useState is not being reset

## Performance Metrics

Monitor these during testing:

1. **Frame Rate:**
   - Should maintain 60 FPS during drag
   - Video playback should be smooth

2. **Memory Usage:**
   - No significant memory leaks
   - Stable memory after multiple minimize/maximize cycles

3. **Battery Impact:**
   - Acceptable battery drain during video call
   - No excessive CPU usage

4. **Network:**
   - Stable connection during screen changes
   - No dropped frames when minimized

## Test Matrix

| Scenario | Android | iOS | Notes |
|----------|---------|-----|-------|
| Basic minimize/maximize | ⬜ | ⬜ | |
| Dragging smooth | ⬜ | ⬜ | |
| Snap to corners | ⬜ | ⬜ | |
| Navigation persistence | ⬜ | ⬜ | |
| Control buttons | ⬜ | ⬜ | |
| Multiple cycles | ⬜ | ⬜ | |
| Edge cases | ⬜ | ⬜ | |
| Performance | ⬜ | ⬜ | |

## Reporting Issues

When reporting bugs, include:

1. Device and OS version
2. App build version
3. Steps to reproduce
4. Console logs
5. Screenshots/video if possible
6. Expected vs actual behavior

## Next Steps After Testing

Once testing is complete:

1. Fix any identified bugs
2. Optimize performance if needed
3. Add error boundaries for crash prevention
4. Consider adding analytics tracking
5. Update user documentation
6. Prepare for production release
