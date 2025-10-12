# FloatingVideoCall Visibility Logic

## How It Works

The FloatingVideoCall component uses three conditions to determine when it should be visible:

```javascript
if (!isInCall || !isMinimized || isExpoGo) {
  return null; // Hide component
}

// If we reach here, show the floating video call
return <DraggableContainer>...</DraggableContainer>
```

## Visibility Truth Table

| isInCall | isMinimized | isExpoGo | Result | Explanation |
|----------|-------------|----------|--------|-------------|
| ❌ false | ❌ false | ❌ false | ❌ **Hidden** | No active call |
| ❌ false | ❌ false | ✅ true  | ❌ **Hidden** | No active call |
| ❌ false | ✅ true  | ❌ false | ❌ **Hidden** | No active call |
| ❌ false | ✅ true  | ✅ true  | ❌ **Hidden** | No active call |
| ✅ true  | ❌ false | ❌ false | ❌ **Hidden** | Call active but in full screen |
| ✅ true  | ❌ false | ✅ true  | ❌ **Hidden** | Call active but in full screen |
| ✅ true  | ✅ true  | ❌ false | ✅ **VISIBLE** | ✨ Perfect condition! |
| ✅ true  | ✅ true  | ✅ true  | ❌ **Hidden** | Expo Go not supported |

## Required Conditions (All Must Be True)

### 1. isInCall = true
**When:** After `startCall()` is successfully called in VideoCallContext
**Why:** No point showing floating video if there's no active call

```javascript
// In VideoCallContext
const startCall = async (roomId, username, recipientName) => {
  await webrtcService.initialize(roomId, username);
  setIsInCall(true); // ✅ Now floating can potentially show
};
```

### 2. isMinimized = true
**When:** User taps the minimize button in VideoCallScreen
**Why:** This is what toggles between full screen and floating mode

```javascript
// In VideoCallScreen
const handleMinimize = () => {
  onToggleMinimize(); // Sets isMinimized = true
  navigation.goBack();
};
```

### 3. isExpoGo = false
**When:** Running on a development build (not Expo Go)
**Why:** WebRTC is not available in Expo Go

```javascript
const isExpoGo = Constants.appOwnership === 'expo';
// Development build: isExpoGo = false ✅
// Expo Go: isExpoGo = true ❌
```

## User Flow Examples

### Example 1: Starting a Call
```
Initial State:
  isInCall = false
  isMinimized = false
  isExpoGo = false
  → FloatingVideoCall: HIDDEN ❌

User joins call:
  isInCall = true ✅
  isMinimized = false
  isExpoGo = false
  → FloatingVideoCall: HIDDEN ❌ (because isMinimized = false)
  → VideoCallScreen: VISIBLE ✅ (full screen)

User taps minimize button:
  isInCall = true ✅
  isMinimized = true ✅
  isExpoGo = false ✅
  → FloatingVideoCall: VISIBLE ✅✅✅
  → VideoCallScreen: HIDDEN (navigated back)
```

### Example 2: Maximizing from Floating
```
Current State:
  isInCall = true ✅
  isMinimized = true ✅
  isExpoGo = false ✅
  → FloatingVideoCall: VISIBLE ✅

User taps maximize button:
  onToggleMinimize() called
  isInCall = true ✅
  isMinimized = false ❌
  isExpoGo = false ✅
  → FloatingVideoCall: HIDDEN ❌ (because isMinimized = false)
  → Navigates to VideoCallScreen (full screen) ✅
```

### Example 3: Ending a Call
```
Current State (Floating):
  isInCall = true ✅
  isMinimized = true ✅
  isExpoGo = false ✅
  → FloatingVideoCall: VISIBLE ✅

User taps end call button:
  endCall() called
  isInCall = false ❌
  isMinimized = true
  isExpoGo = false
  → FloatingVideoCall: HIDDEN ❌ (because isInCall = false)
```

## Code Flow Diagram

```
FloatingVideoCall Component
    ↓
Check Conditions
    ↓
┌───────────────────────────────────┐
│ if (!isInCall || !isMinimized ||  │
│     isExpoGo)                      │
└───────────────────────────────────┘
    ↓                    ↓
   YES                  NO
    ↓                    ↓
return null      return <DraggableContainer>
(Hidden)              (Visible)
```

## Context Integration

```
App.js
  └─ Navigator.js
      ├─ Stack.Navigator (screens)
      └─ FloatingVideoCall ← Always rendered here
```

FloatingVideoCall is **always mounted** but conditionally **visible**:
- Mounted: Inside NavigationContainer (always present)
- Visible: Only when `isInCall && isMinimized && !isExpoGo`

## Benefits of This Approach

### 1. Performance
- Component stays mounted → faster show/hide
- No unmount/remount overhead
- Preserves draggable position state

### 2. Simplicity
- Single conditional check
- Clear logic: "Show when minimized and in call"
- Easy to understand and debug

### 3. Consistency
- State managed in context
- Same state as VideoCallScreen
- No sync issues

### 4. Reliability
- Can't accidentally show when no call active
- Can't show in Expo Go where it won't work
- Proper cleanup when call ends

## Testing the Logic

### Test 1: Minimize Then End Call
```bash
1. Start call (isInCall=true, isMinimized=false)
2. Verify: FloatingVideoCall hidden ✓
3. Tap minimize (isInCall=true, isMinimized=true)
4. Verify: FloatingVideoCall visible ✓
5. Tap end call (isInCall=false, isMinimized=true)
6. Verify: FloatingVideoCall hidden ✓
```

### Test 2: Multiple Minimize/Maximize Cycles
```bash
1. Start call → Hidden ✓
2. Minimize → Visible ✓
3. Maximize → Hidden ✓
4. Minimize → Visible ✓
5. Maximize → Hidden ✓
6. Minimize → Visible ✓
7. End call → Hidden ✓
```

### Test 3: Expo Go Detection
```bash
Run in Expo Go:
1. Start call (isInCall=true, isMinimized=false, isExpoGo=true)
2. Verify: FloatingVideoCall hidden ✓
3. Tap minimize (isInCall=true, isMinimized=true, isExpoGo=true)
4. Verify: FloatingVideoCall still hidden ✓ (Expo Go blocks it)
```

## Debugging Tips

### Check Current State
```javascript
// Add this temporarily to debug
console.log('FloatingVideoCall State:', {
  isInCall,
  isMinimized,
  isExpoGo,
  shouldShow: isInCall && isMinimized && !isExpoGo
});
```

### Common Issues

**Issue 1: FloatingVideoCall not showing after minimize**
- Check: Is `isInCall` true?
- Check: Is `isMinimized` true?
- Check: Are you in Expo Go? (should be false)
- Solution: Verify context state with React DevTools

**Issue 2: FloatingVideoCall showing when it shouldn't**
- Check: Did context state get stuck?
- Check: Is endCall() properly cleaning up?
- Solution: Verify state transitions

**Issue 3: FloatingVideoCall shows in full screen mode**
- Check: Is `isMinimized` properly toggling?
- Check: Is `onToggleMinimize()` being called?
- Solution: Check VideoCallScreen minimize handler

## Summary

The FloatingVideoCall visibility logic is:

```
Show ONLY when ALL of these are true:
✅ isInCall = true (call is active)
✅ isMinimized = true (user minimized the call)
✅ isExpoGo = false (running on dev build)

Otherwise: Hide (return null)
```

This ensures the floating video call appears exactly when it should - when there's an active call that the user has minimized, and only on platforms that support WebRTC.
