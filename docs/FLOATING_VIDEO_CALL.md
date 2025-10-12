# Floating Video Call Feature

## Overview
The floating video call feature allows users to minimize video calls into a draggable floating window while navigating the app.

## Components

### 1. DraggableContainer
**Location:** `components/DraggableContainer/DraggableContainer.js`

A reusable component that makes any child draggable with smooth animations.

**Features:**
- Pan gesture with 5px minimum distance to distinguish taps from drags
- Scale (0.95x) and opacity (0.9) animations during drag
- Automatic snap-to-corner on release (finds nearest of 4 corners)
- Spring physics for smooth animations (damping: 15, stiffness: 150)
- Configurable corner offsets and container size

**Props:**
```javascript
{
  children,              // React element to make draggable
  initialPosition,       // { x, y } starting position
  containerWidth,        // Width of draggable container (default: 160)
  containerHeight,       // Height of draggable container (default: 280)
  onSnapToCorner,       // Callback when snapped to corner
  setDraggableContainerPosition, // Update position state
  cornerOffset,          // Offset from screen edges (default: 10)
  style                  // Additional styles
}
```

**Dependencies:**
- react-native-reanimated (v4.1.2)
- react-native-gesture-handler (v2.28.0)

### 2. FloatingVideoCall
**Location:** `components/FloatingVideoCall/FloatingVideoCall.js`

The floating video call overlay with Picture-in-Picture layout.

**Features:**
- Remote video as main view (160x220px)
- Local video as PiP overlay (50x70px, bottom-right corner)
- Maximize button (top-right) to return to full screen
- Control bar with mic, camera, end call, flip camera buttons
- Only renders when `isInCall=true` AND `isMinimized=true`
- Automatic Expo Go detection (returns null if in Expo Go)

**Layout:**
- Total size: 160px wide × 280px tall
  - Video area: 160×220px
  - Controls: 160×60px

**Navigation:**
- Uses `useNavigation()` hook from React Navigation
- Maximize button calls `onToggleMinimize()` and navigates to `VideoCallScreen`

### 3. VideoCallContext Updates
**Location:** `context/VideoCallContext.js`

Added minimize state management:

```javascript
const [isMinimized, setIsMinimized] = useState(false);

const onToggleMinimize = useCallback(() => {
  setIsMinimized(!isMinimized);
}, [isMinimized]);
```

**Exported State & Methods:**
- `isMinimized`: boolean - whether video is minimized
- `onToggleMinimize`: function - toggle minimize state

### 4. VideoCallScreenNew Updates
**Location:** `screens/CommonScreen/VideoCallScreen/VideoCallScreenNew.js`

Added minimize button to the top bar:

**Handler:**
```javascript
const handleMinimize = () => {
  onToggleMinimize();
  navigation.goBack();
};
```

**UI:**
- Minimize button in top-right corner of call screen
- Icon: `remove-outline` (horizontal line)
- Circular button with semi-transparent background

## Integration

### App Structure
```
App.js
└─ GestureHandlerRootView
   └─ SafeAreaProvider
      └─ SignalRProvider
         └─ WebRTCProvider
            └─ VideoCallProvider
               └─ LocationProvider
                  └─ FitnessProvider
                     └─ CartProvider
                        └─ Navigator
```

### Navigator Structure
```
Navigator.js
└─ NavigationContainer
   ├─ Stack.Navigator (screens)
   └─ FloatingVideoCall (overlay)
```

FloatingVideoCall is placed **after** Stack.Navigator but **inside** NavigationContainer, allowing it to:
1. Access navigation context via `useNavigation()` hook
2. Render globally above all screens as an overlay
3. Persist across screen navigation

## User Flow

### Minimize Flow:
1. User joins video call → `VideoCallScreen` opens
2. User taps minimize button → `handleMinimize()` called
3. `onToggleMinimize()` sets `isMinimized = true`
4. `navigation.goBack()` returns to previous screen
5. `FloatingVideoCall` becomes visible (isInCall=true, isMinimized=true)
6. User can drag the floating window and continue using app

### Maximize Flow:
1. User taps maximize button on floating window
2. `handleMaximize()` called in `FloatingVideoCall`
3. `onToggleMinimize()` sets `isMinimized = false`
4. `navigation.navigate('VideoCallScreen')` opens full screen
5. `FloatingVideoCall` hides (isMinimized=false)
6. Full video call UI displayed

## Gesture Interactions

### DraggableContainer Behavior:
1. **Pan Start:**
   - Minimum 5px movement to activate
   - Scales to 0.95x, opacity to 0.9

2. **Pan Move:**
   - Follows finger position
   - Smooth translation with SharedValue

3. **Pan End:**
   - Calculates distances to all 4 corners
   - Finds nearest corner
   - Animates with spring physics to corner
   - Restores scale to 1.0, opacity to 1.0

### Corner Positions:
- **Top-Left:** (cornerOffset, cornerOffset)
- **Top-Right:** (screenWidth - containerWidth - cornerOffset, cornerOffset)
- **Bottom-Left:** (cornerOffset, screenHeight - containerHeight - cornerOffset)
- **Bottom-Right:** (screenWidth - containerWidth - cornerOffset, screenHeight - containerHeight - cornerOffset)

## Styling

### FloatingVideoCall Styles:
```javascript
floatingContainer: {
  width: 160,
  height: 280,
  backgroundColor: '#000',
  borderRadius: 12,
  overflow: 'hidden',
  elevation: 10,        // Android shadow
  shadowColor: '#000',  // iOS shadow
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
}
```

### Control Button Layout:
- 5 buttons in a row
- Icon size: 20px
- Button size: 32×32px
- Spacing: 8px between buttons

## Testing Checklist

- [ ] Minimize button visible in full video call
- [ ] Minimize toggles state and navigates back
- [ ] Floating window appears after minimize
- [ ] Can drag floating window smoothly
- [ ] Window snaps to nearest corner on release
- [ ] Can navigate between screens with floating window visible
- [ ] Maximize button returns to full screen
- [ ] Video streams continue during minimize/maximize
- [ ] Control buttons work in floating mode
- [ ] End call properly cleans up floating window
- [ ] No visual glitches during transitions
- [ ] Floating window persists across screen changes
- [ ] Gesture conflicts with other UI elements resolved

## Known Limitations

1. **Expo Go:** Feature disabled in Expo Go (WebRTC not available)
2. **Development Build:** Requires `eas build --profile development`
3. **Platform:** Android/iOS only (no web support)
4. **Navigation Params:** VideoCallScreen needs roomId, username params when maximizing

## Dependencies

```json
{
  "react-native-webrtc": "^124.0.6",
  "react-native-reanimated": "^4.1.2",
  "react-native-gesture-handler": "^2.28.0",
  "@react-navigation/native": "^6.x"
}
```

## Future Enhancements

- [ ] Double-tap to maximize gesture
- [ ] Resize floating window gesture
- [ ] Picture-in-Picture mode on iOS/Android
- [ ] Custom snap positions (not just corners)
- [ ] Minimize animation transition
- [ ] Restore position across app restarts
- [ ] Multiple floating windows support
- [ ] Screen sharing in PiP mode
