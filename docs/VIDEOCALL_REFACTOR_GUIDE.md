# Video Call Refactor - Google Meet Style

## Overview
Refactored VideoCallScreen.js to work seamlessly with the VideoCallContext and FloatingVideoCall component, following Google Meet's minimize/maximize pattern.

## Key Changes

### 1. Removed Direct VideoCallService Usage
**Before:**
```javascript
import videoCallService from '../../../services/videoCallService';
// Direct service calls throughout component
await videoCallService.initialize(...);
await videoCallService.toggleAudio();
```

**After:**
```javascript
import { useVideoCall } from '../../../context/VideoCallContext';
// Use context hook
const { isInCall, localMediaStream, remoteMediaStream, ... } = useVideoCall();
```

### 2. Simplified State Management
**Before:**
```javascript
const [isMuted, setIsMuted] = useState(false);
const [isVideoOff, setIsVideoOff] = useState(false);
const [localStream, setLocalStream] = useState(null);
const [remoteStream, setRemoteStream] = useState(null);
const [connectionStatus, setConnectionStatus] = useState('connecting');
```

**After:**
```javascript
const [callDuration, setCallDuration] = useState(0);
const [showExpoGoWarning, setShowExpoGoWarning] = useState(false);
// All other state comes from context
```

### 3. Added Minimize Functionality
**New Feature:**
```javascript
const handleMinimize = () => {
  onToggleMinimize();
  navigation.goBack();
};
```

**UI:**
```jsx
<TouchableOpacity style={styles.minimizeButton} onPress={handleMinimize}>
  <Ionicons name="remove-outline" size={24} color="#FFF" />
</TouchableOpacity>
```

### 4. Consistent UI Structure
**Layout:**
```
┌─────────────────────────────────┐
│ Top Bar (Avatar + Info + Min)  │
├─────────────────────────────────┤
│                                 │
│   Remote Video (Full Screen)   │
│                                 │
│         ┌──────────┐            │
│         │  Local   │            │
│         │  Video   │            │
│         └──────────┘            │
├─────────────────────────────────┤
│  Controls (Mic|Cam|End|Flip|🔊) │
└─────────────────────────────────┘
```

### 5. State-Based Rendering
```javascript
// Show Expo Go warning
if (showExpoGoWarning) return <ExpoGoWarning />

// Show loading state
if (isLoading) return <LoadingScreen />

// Show error state
if (error) return <ErrorScreen />

// Show video call UI
return <VideoCallUI />
```

## Integration Flow

### Starting a Call
```
VideoCallPrepScreen
    ↓
    startCall(roomId, username, recipientName)
    ↓
VideoCallContext.startCall()
    ↓
WebRTCService.initialize()
    ↓
VideoCallScreen (Full View)
```

### Minimizing a Call
```
VideoCallScreen
    ↓
    User taps Minimize button
    ↓
    onToggleMinimize() → isMinimized = true
    ↓
    navigation.goBack()
    ↓
FloatingVideoCall appears (isInCall && isMinimized)
```

### Maximizing a Call
```
FloatingVideoCall
    ↓
    User taps Maximize button
    ↓
    onToggleMinimize() → isMinimized = false
    ↓
    navigation.navigate('VideoCallScreen')
    ↓
VideoCallScreen (Full View)
```

### Ending a Call
```
VideoCallScreen or FloatingVideoCall
    ↓
    endCall()
    ↓
VideoCallContext.endCall()
    ↓
WebRTCService.cleanup()
    ↓
    isInCall = false
    ↓
FloatingVideoCall disappears
```

## Component Structure

### VideoCallScreen.js
```javascript
export default function VideoCallScreen({ route, navigation }) {
  // 1. Get params
  const { roomId, username, recipientName, recipientAvatar } = route.params;
  
  // 2. Get context
  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isLoading,
    error,
    startCall,
    endCall,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
    onToggleMinimize,
  } = useVideoCall();
  
  // 3. Local state (minimal)
  const [callDuration, setCallDuration] = useState(0);
  
  // 4. Effects
  useEffect(() => {
    // Initialize call
    // Start timer
  }, []);
  
  // 5. Handlers
  const handleMinimize = () => { ... }
  const handleEndCall = () => { ... }
  const toggleMicrophone = () => { ... }
  const toggleCamera = () => { ... }
  const flipCamera = () => { ... }
  
  // 6. Conditional rendering
  if (showExpoGoWarning) return <Warning />
  if (isLoading) return <Loading />
  if (error) return <Error />
  
  // 7. Main UI
  return <VideoCallUI />
}
```

### FloatingVideoCall.js
```javascript
export default function FloatingVideoCall() {
  const navigation = useNavigation();
  const {
    isInCall,
    localMediaStream,
    remoteMediaStream,
    isAudioMuted,
    isVideoMuted,
    isMinimized,
    onToggleAudio,
    onToggleVideo,
    onToggleFlipCamera,
    onToggleMinimize,
    endCall,
  } = useVideoCall();
  
  // Only show when in call AND minimized
  if (!isInCall || !isMinimized || isExpoGo) {
    return null;
  }
  
  return (
    <DraggableContainer>
      <VideoPreview />
      <Controls />
    </DraggableContainer>
  );
}
```

## Benefits of Refactor

### 1. Single Source of Truth
- All video call state in VideoCallContext
- No duplicate state management
- Consistent behavior across components

### 2. Simplified Logic
- Removed ~100 lines of redundant code
- No manual stream management
- No duplicate toggle logic

### 3. Better UX
- Seamless minimize/maximize transitions
- Persistent call state
- Works exactly like Google Meet

### 4. Maintainability
- Changes in one place affect all screens
- Easy to add new features
- Clear separation of concerns

### 5. Type Safety
- Context provides consistent API
- No prop drilling
- Easy to track dependencies

## Usage Example

### Navigate to Video Call
```javascript
navigation.navigate('VideoCallPrep', {
  // Prep screen will handle starting the call
});
```

### Or Direct Call
```javascript
navigation.navigate('VideoCallScreen', {
  roomId: 'room_123',
  username: 'John Doe',
  recipientName: 'Jane Smith',
  recipientAvatar: 'JS'
});
```

## Testing Scenarios

### 1. Basic Flow
```
1. Open VideoCallPrep
2. Enter room ID
3. Tap "Join Call"
4. VideoCallScreen opens
5. Tap minimize button
6. FloatingVideoCall appears
7. Navigate to other screens
8. Tap maximize on floating window
9. Returns to VideoCallScreen
10. Tap end call
```

### 2. Control Testing
```
While in call:
- Toggle microphone ✓
- Toggle camera ✓
- Flip camera ✓
- Minimize ✓
- Maximize ✓
- End call ✓

While floating:
- Toggle microphone ✓
- Toggle camera ✓
- Flip camera ✓
- End call ✓
- Drag window ✓
```

### 3. State Persistence
```
1. Start call
2. Mute microphone
3. Minimize
4. Verify mic stays muted in floating view
5. Maximize
6. Verify mic still muted in full view
```

## Migration Guide

### If You Have Custom VideoCallScreen

1. **Replace imports:**
   ```javascript
   - import videoCallService from '../../../services/videoCallService';
   + import { useVideoCall } from '../../../context/VideoCallContext';
   ```

2. **Replace state:**
   ```javascript
   - const [localStream, setLocalStream] = useState(null);
   - const [remoteStream, setRemoteStream] = useState(null);
   + const { localMediaStream, remoteMediaStream } = useVideoCall();
   ```

3. **Replace methods:**
   ```javascript
   - await videoCallService.toggleAudio();
   + onToggleAudio();
   ```

4. **Add minimize:**
   ```javascript
   const handleMinimize = () => {
     onToggleMinimize();
     navigation.goBack();
   };
   ```

5. **Update JSX:**
   ```jsx
   - {localStream && <RTCView streamURL={localStream.toURL()} />}
   + {localMediaStream && <RTCView streamURL={localMediaStream.toURL()} />}
   ```

## Troubleshooting

### Issue: FloatingVideoCall not appearing
**Check:**
- Is `isInCall` true?
- Is `isMinimized` true?
- Is FloatingVideoCall inside NavigationContainer?

### Issue: State not persisting between minimize/maximize
**Check:**
- Are you using context values?
- Did you remove local state duplicates?
- Is VideoCallContext wrapping your app?

### Issue: Navigation error on maximize
**Check:**
- Is VideoCallScreen registered in Navigator?
- Are route params being passed correctly?
- Is FloatingVideoCall using `useNavigation()`?

### Issue: Video not showing after maximize
**Check:**
- Are streams still active in context?
- Did endCall get called accidentally?
- Check console for WebRTC errors

## Future Enhancements

- [ ] Add screen sharing in floating mode
- [ ] Picture-in-Picture API integration (iOS/Android)
- [ ] Multi-participant floating view
- [ ] Minimize animation transition
- [ ] Restore minimize state on app restart
- [ ] Floating window resize gesture
- [ ] Double-tap to maximize
- [ ] Minimize from notification

## Conclusion

The refactored VideoCallScreen now:
✅ Uses VideoCallContext for all state
✅ Supports minimize/maximize like Google Meet
✅ Works seamlessly with FloatingVideoCall
✅ Has cleaner, more maintainable code
✅ Provides consistent UX across the app
