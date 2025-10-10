# Video Call Preparation Screen

## Overview

The Video Call Preparation Screen allows users to test their camera and microphone before joining a video call. Users can also enter or generate a room ID to join.

## Features

### 1. Camera & Microphone Preview
- **Live Preview**: Real-time camera preview before joining the call
- **Test Controls**: Toggle audio, video, and flip camera
- **Visual Feedback**: Shows camera off state when video is disabled
- **Loading State**: Displays loading indicator while initializing camera

### 2. Room Management
- **Enter Room ID**: Manually enter a room ID to join an existing call
- **Generate Room ID**: Auto-generate a random 6-character room ID
- **Room ID Sharing**: Instructions to share the room ID with others

### 3. User Information
- **Auto-load Username**: Automatically loads username from storage
- **Editable Name**: Users can change their display name before joining
- **Persistent Data**: Username is saved and reused

## Navigation Flow

```
User Menu
    ↓
VideoCallPrep (Preparation Screen)
    ↓ (after entering room ID)
JoinCallVideoScreen (Video Call)
```

## Usage

### From Code

```javascript
// Navigate to preparation screen
navigation.navigate('VideoCallPrep');

// The screen will handle everything:
// 1. Load username from AsyncStorage
// 2. Start camera preview
// 3. Allow user to enter room ID
// 4. Navigate to video call with proper params
```

### User Flow

1. **User opens prep screen**
   - Camera preview starts automatically
   - Username is loaded from storage

2. **User tests equipment**
   - Toggle microphone on/off
   - Toggle camera on/off
   - Flip between front/back camera

3. **User enters room details**
   - Enter room ID manually, or
   - Click refresh button to generate random ID

4. **User joins call**
   - Click "Join Call" button
   - Camera preview stops
   - Navigates to video call screen with room ID and username

## Props

The screen doesn't require any props. It receives navigation from React Navigation.

## State Management

### Local State
- `roomId` - The room ID to join
- `username` - User's display name
- `previewStream` - MediaStream for camera preview
- `isAudioMuted` - Microphone mute state
- `isVideoOff` - Camera off state
- `loading` - Join call loading state
- `loadingPreview` - Camera preview loading state

### AsyncStorage Data
- `username` - Retrieved on mount
- `userEmail` - Fallback if username not found

## Camera Preview

### Initialization
```javascript
useEffect(() => {
  const startPreview = async () => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setPreviewStream(stream);
  };
  startPreview();
  
  // Cleanup on unmount
  return () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
  };
}, []);
```

### Controls
- **Toggle Audio**: Enable/disable microphone
- **Toggle Video**: Enable/disable camera
- **Flip Camera**: Switch between front and back camera

## Room ID Management

### Manual Entry
```javascript
<TextInput
  value={roomId}
  onChangeText={setRoomId}
  placeholder="Enter room ID"
  autoCapitalize="characters"
/>
```

### Auto-generate
```javascript
const generateRoomId = () => {
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  setRoomId(randomId);
};
```

## Validation

### Form Validation
```javascript
const isFormValid = roomId.trim().length > 0 && username.trim().length > 0;
```

- Room ID must not be empty
- Username must not be empty
- Join button is disabled when form is invalid

## Navigation Parameters

When navigating to VideoCallScreen:
```javascript
navigation.navigate('JoinCallVideoScreen', {
  roomId: roomId.trim(),
  username: username.trim(),
  recipientName: 'Room ' + roomId.trim(),
  recipientAvatar: 'R',
});
```

## Cleanup

### Preview Stream Cleanup
The preview stream is automatically stopped when:
1. User joins the call (navigates away)
2. Component unmounts
3. User goes back

```javascript
// Stop all tracks
if (previewStream) {
  previewStream.getTracks().forEach(track => track.stop());
  setPreviewStream(null);
}
```

## Expo Go Detection

Similar to the video call screen, the prep screen detects Expo Go and shows a warning:

```javascript
const isExpoGo = Constants.appOwnership === 'expo';

if (isExpoGo) {
  return <ExpoGoWarningScreen />;
}
```

## Styling

### Design Features
- **Gradient Header**: Purple gradient header with back button
- **Card-based Layout**: Clean, card-based form design
- **Preview Container**: 3:4 aspect ratio camera preview
- **Bottom Controls**: Fixed bottom section for join button
- **Responsive Design**: Works on various screen sizes

### Colors
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Error: `#f5576c` (Red)
- Background: `#F5F5F5` (Light Gray)
- Text: `#333` (Dark Gray)

## Error Handling

### Camera Access Errors
```javascript
try {
  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  setPreviewStream(stream);
} catch (error) {
  Alert.alert(
    'Camera/Microphone Error',
    'Unable to access camera or microphone. Please check permissions.'
  );
}
```

### Form Validation Errors
```javascript
if (!roomId.trim()) {
  Alert.alert('Room ID Required', 'Please enter a room ID to join the call.');
  return;
}

if (!username.trim()) {
  Alert.alert('Username Required', 'Please enter your username.');
  return;
}
```

## Integration Points

### 1. User Menu
```javascript
// UserMenuScreen.js
{
  label: "Join Call Video",
  icon: <Ionicons name="videocam-outline" size={28} color="#ED2A46" />,
  navigation: "VideoCallPrep",
  category: "account",
}
```

### 2. Navigator
```javascript
// Navigator.js
<Stack.Screen
  name="VideoCallPrep"
  component={VideoCallPrepScreen}
  options={{
    headerShown: false,
    orientation: 'portrait',
  }}
/>
```

## Testing Checklist

### Basic Functionality
- [ ] Screen opens without errors
- [ ] Camera preview starts automatically
- [ ] Username loads from storage
- [ ] Room ID input works
- [ ] Generate button creates random ID
- [ ] Join button enables when form is valid

### Camera Preview
- [ ] Video preview displays
- [ ] Microphone toggle works
- [ ] Camera toggle works
- [ ] Flip camera works
- [ ] Preview stops when joining call

### Form Validation
- [ ] Empty room ID prevents joining
- [ ] Empty username prevents joining
- [ ] Join button disabled when invalid
- [ ] Alerts show for empty fields

### Navigation
- [ ] Back button returns to previous screen
- [ ] Join button navigates to video call
- [ ] Correct params passed to video call

### Cleanup
- [ ] Preview stream stops on back
- [ ] Preview stream stops on join
- [ ] No memory leaks

## Best Practices

### 1. Always Stop Preview Stream
```javascript
// Stop preview before navigating
if (previewStream) {
  previewStream.getTracks().forEach(track => track.stop());
}
```

### 2. Handle Permissions Gracefully
```javascript
// Show helpful error messages
Alert.alert(
  'Camera/Microphone Error',
  'Unable to access camera or microphone. Please check permissions.'
);
```

### 3. Validate Before Navigation
```javascript
// Check form validity before navigating
if (!isFormValid) {
  Alert.alert('Error', 'Please fill in all required fields.');
  return;
}
```

## Future Enhancements

- [ ] Audio level indicator for microphone test
- [ ] Network quality test
- [ ] Recently used room IDs
- [ ] Room ID QR code scanner
- [ ] Save preferred camera (front/back)
- [ ] Background blur/virtual background preview
- [ ] Echo test for audio

## Troubleshooting

### Problem: Camera preview not showing
**Solution**: Check camera permissions, ensure development build

### Problem: Username not loading
**Solution**: Check AsyncStorage keys match ('username' or 'userEmail')

### Problem: Join button always disabled
**Solution**: Verify both roomId and username have values

### Problem: Preview doesn't stop on navigation
**Solution**: Ensure cleanup in useEffect return function

## Example Usage

### Basic Navigation
```javascript
// From any screen
navigation.navigate('VideoCallPrep');
```

### With Pre-filled Room ID (Future Enhancement)
```javascript
navigation.navigate('VideoCallPrep', {
  roomId: 'ABC123',
});
```

## Related Documentation

- Video Call Screen: `docs/WEBRTC_QUICK_START.md`
- WebRTC Implementation: `docs/WEBRTC_IMPLEMENTATION_GUIDE.md`
- Context Usage: `docs/WEBRTC_BEFORE_AFTER.md`

---

**Status**: ✅ Implemented and Ready for Testing
