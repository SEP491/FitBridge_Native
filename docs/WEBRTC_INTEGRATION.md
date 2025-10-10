# WebRTC Video Call Integration Guide

## Overview
This guide explains how to integrate the VideoCallScreen with a real WebRTC signaling server for peer-to-peer video calling between two users.

## Current Implementation

### ✅ What's Working
- **Camera Access**: Local camera stream using `react-native-webrtc`
- **Microphone Access**: Audio stream capture
- **Permission Handling**: Camera and microphone permissions with expo-camera and expo-av
- **Video Display**: RTCView for local and remote video streams
- **Controls**: Toggle mic, camera, flip camera, end call
- **UI**: Professional 1v1 call interface

### 🔄 What Needs Integration
- **Signaling Server**: WebSocket/Socket.io for call setup
- **WebRTC Connection**: Peer connection establishment
- **ICE Candidates**: Network traversal
- **Remote Stream**: Receiving other user's video/audio

## Architecture

```
User A (Caller)          Signaling Server          User B (Callee)
     |                          |                         |
     |------- call-request ---->|                         |
     |                          |------- incoming-call -->|
     |                          |<------ call-accepted ---|
     |<------ call-accepted ----|                         |
     |                          |                         |
     |------- offer ----------->|------- offer ---------> |
     |                          |<------ answer ----------|
     |<------ answer -----------|                         |
     |                          |                         |
     |------- ice-candidate --->|------- ice-candidate -->|
     |<------ ice-candidate ----|<------ ice-candidate ---|
     |                          |                         |
     [    Peer-to-Peer Video Connection Established    ]
```

## Step-by-Step Integration

### 1. Install Additional Dependencies

```bash
npm install socket.io-client
```

### 2. Create WebRTC Service

Create `services/webrtcService.js`:

```javascript
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

// STUN/TURN servers configuration
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for better connectivity
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password',
    },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onIceCandidate = null;
  }

  // Initialize peer connection
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle remote stream
    this.peerConnection.onaddstream = (event) => {
      if (this.onRemoteStream) {
        this.onRemoteStream(event.stream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Monitor connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };
  }

  // Add local stream to peer connection
  addLocalStream(stream) {
    this.localStream = stream;
    this.peerConnection.addStream(stream);
  }

  // Create offer (caller)
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Create answer (callee)
  async createAnswer() {
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Set remote description
  async setRemoteDescription(description) {
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(description)
      );
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  // Add ICE candidate
  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Close connection
  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}

export default new WebRTCService();
```

### 3. Create Signaling Service

Create `services/signalingService.js`:

```javascript
import io from 'socket.io-client';

class SignalingService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Connect to signaling server
  connect(userId, token) {
    this.socket = io('https://your-signaling-server.com', {
      auth: { token },
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Initiate call
  initiateCall(calleeId, callerInfo) {
    this.socket.emit('call-request', {
      calleeId,
      callerInfo,
    });
  }

  // Accept call
  acceptCall(callId) {
    this.socket.emit('call-accepted', { callId });
  }

  // Reject call
  rejectCall(callId) {
    this.socket.emit('call-rejected', { callId });
  }

  // Send offer
  sendOffer(callId, offer) {
    this.socket.emit('offer', { callId, offer });
  }

  // Send answer
  sendAnswer(callId, answer) {
    this.socket.emit('answer', { callId, answer });
  }

  // Send ICE candidate
  sendIceCandidate(callId, candidate) {
    this.socket.emit('ice-candidate', { callId, candidate });
  }

  // End call
  endCall(callId) {
    this.socket.emit('call-ended', { callId });
  }

  // Listen for incoming call
  onIncomingCall(callback) {
    this.socket.on('incoming-call', callback);
  }

  // Listen for call accepted
  onCallAccepted(callback) {
    this.socket.on('call-accepted', callback);
  }

  // Listen for call rejected
  onCallRejected(callback) {
    this.socket.on('call-rejected', callback);
  }

  // Listen for offer
  onOffer(callback) {
    this.socket.on('offer', callback);
  }

  // Listen for answer
  onAnswer(callback) {
    this.socket.on('answer', callback);
  }

  // Listen for ICE candidate
  onIceCandidate(callback) {
    this.socket.on('ice-candidate', callback);
  }

  // Listen for call ended
  onCallEnded(callback) {
    this.socket.on('call-ended', callback);
  }
}

export default new SignalingService();
```

### 4. Update VideoCallScreen

Add WebRTC integration to `VideoCallScreen.js`:

```javascript
import webrtcService from '../../../services/webrtcService';
import signalingService from '../../../services/signalingService';

export default function VideoCallScreen({ route, navigation }) {
  const { callId, recipientId, recipientName, isOutgoing } = route.params || {};
  
  // ... existing state ...
  const [callId, setCallId] = useState(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Request permissions and start local stream
        await initializeMedia();

        // Initialize WebRTC
        webrtcService.createPeerConnection();
        webrtcService.addLocalStream(localStreamRef.current);

        // Set up WebRTC callbacks
        webrtcService.onRemoteStream = (stream) => {
          setRemoteStream(stream);
          remoteStreamRef.current = stream;
          setConnectionStatus('connected');
        };

        webrtcService.onIceCandidate = (candidate) => {
          signalingService.sendIceCandidate(callId, candidate);
        };

        // Set up signaling listeners
        setupSignalingListeners();

        // If outgoing call, initiate
        if (isOutgoing) {
          signalingService.initiateCall(recipientId, {
            name: 'Your Name',
            avatar: 'YN',
          });
        }
      } catch (error) {
        console.error('Error initializing call:', error);
      }
    };

    initializeCall();

    return () => {
      webrtcService.close();
      signalingService.disconnect();
    };
  }, []);

  const setupSignalingListeners = () => {
    // Listen for call accepted
    signalingService.onCallAccepted(async ({ callId }) => {
      setCallId(callId);
      // Create and send offer
      const offer = await webrtcService.createOffer();
      signalingService.sendOffer(callId, offer);
    });

    // Listen for offer (callee)
    signalingService.onOffer(async ({ callId, offer }) => {
      setCallId(callId);
      await webrtcService.setRemoteDescription(offer);
      // Create and send answer
      const answer = await webrtcService.createAnswer();
      signalingService.sendAnswer(callId, answer);
    });

    // Listen for answer (caller)
    signalingService.onAnswer(async ({ answer }) => {
      await webrtcService.setRemoteDescription(answer);
    });

    // Listen for ICE candidates
    signalingService.onIceCandidate(async ({ candidate }) => {
      await webrtcService.addIceCandidate(candidate);
    });

    // Listen for call ended
    signalingService.onCallEnded(() => {
      handleEndCall();
    });
  };

  const handleEndCall = () => {
    if (callId) {
      signalingService.endCall(callId);
    }
    webrtcService.close();
    stopLocalStream();
    navigation.goBack();
  };

  // ... rest of component
}
```

### 5. Backend Signaling Server

Create a Node.js signaling server using Socket.io:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = new Map();
const activeCalls = new Map();

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;
  
  console.log(`User connected: ${userId}`);
  connectedUsers.set(userId, socket.id);

  // Handle call request
  socket.on('call-request', ({ calleeId, callerInfo }) => {
    const calleeSocketId = connectedUsers.get(calleeId);
    if (calleeSocketId) {
      const callId = `call_${Date.now()}`;
      activeCalls.set(callId, {
        caller: userId,
        callee: calleeId,
      });

      io.to(calleeSocketId).emit('incoming-call', {
        callId,
        callerInfo,
        callerId: userId,
      });
    }
  });

  // Handle call accepted
  socket.on('call-accepted', ({ callId }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const callerSocketId = connectedUsers.get(call.caller);
      io.to(callerSocketId).emit('call-accepted', { callId });
    }
  });

  // Handle call rejected
  socket.on('call-rejected', ({ callId }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const callerSocketId = connectedUsers.get(call.caller);
      io.to(callerSocketId).emit('call-rejected', { callId });
      activeCalls.delete(callId);
    }
  });

  // Handle offer
  socket.on('offer', ({ callId, offer }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const calleeSocketId = connectedUsers.get(call.callee);
      io.to(calleeSocketId).emit('offer', { callId, offer });
    }
  });

  // Handle answer
  socket.on('answer', ({ callId, answer }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const callerSocketId = connectedUsers.get(call.caller);
      io.to(callerSocketId).emit('answer', { callId, answer });
    }
  });

  // Handle ICE candidate
  socket.on('ice-candidate', ({ callId, candidate }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const otherUserId = call.caller === userId ? call.callee : call.caller;
      const otherSocketId = connectedUsers.get(otherUserId);
      io.to(otherSocketId).emit('ice-candidate', { callId, candidate });
    }
  });

  // Handle call ended
  socket.on('call-ended', ({ callId }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const otherUserId = call.caller === userId ? call.callee : call.caller;
      const otherSocketId = connectedUsers.get(otherUserId);
      io.to(otherSocketId).emit('call-ended', { callId });
      activeCalls.delete(callId);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    connectedUsers.delete(userId);
    
    // End any active calls
    activeCalls.forEach((call, callId) => {
      if (call.caller === userId || call.callee === userId) {
        const otherUserId = call.caller === userId ? call.callee : call.caller;
        const otherSocketId = connectedUsers.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('call-ended', { callId });
        }
        activeCalls.delete(callId);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
```

### 6. Navigation Integration

Update navigation to pass call parameters:

```javascript
// To start an outgoing call
navigation.navigate('JoinCallVideoScreen', {
  isOutgoing: true,
  recipientId: 'user123',
  recipientName: 'Sarah Williams',
  recipientAvatar: 'SW',
});

// For incoming call (from notification)
navigation.navigate('JoinCallVideoScreen', {
  isOutgoing: false,
  callId: 'call_1234567890',
  callerId: 'user456',
  callerName: 'John Doe',
  callerAvatar: 'JD',
});
```

### 7. Add Incoming Call Notification

Create `components/IncomingCallModal.js`:

```javascript
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function IncomingCallModal({ visible, callerInfo, onAccept, onReject }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.content}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{callerInfo?.avatar}</Text>
          </View>
          
          <Text style={styles.callerName}>{callerInfo?.name}</Text>
          <Text style={styles.callText}>Incoming Video Call</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={onReject}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
            >
              <Ionicons name="videocam" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '700',
  },
  callerName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  callText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#ED2A46',
  },
});
```

## Testing

### Local Testing Steps

1. **Set up signaling server**:
   ```bash
   cd signaling-server
   npm install express socket.io
   node server.js
   ```

2. **Update server URL** in `signalingService.js`:
   ```javascript
   this.socket = io('http://YOUR_LOCAL_IP:3000', {
     // ...
   });
   ```

3. **Test with two devices**:
   - Install app on two physical devices
   - Login with different accounts
   - Start call from one device
   - Accept on other device

### Production Deployment

1. **Deploy signaling server** to cloud (AWS, Heroku, DigitalOcean)
2. **Set up TURN servers** for reliable NAT traversal
3. **Enable SSL/TLS** for secure connections
4. **Add authentication** to prevent unauthorized access

## Troubleshooting

### Common Issues

1. **No video showing**:
   - Check camera permissions
   - Verify RTCView streamURL is valid
   - Check console for errors

2. **Connection fails**:
   - Verify STUN/TURN servers are accessible
   - Check firewall settings
   - Ensure both devices are connected to internet

3. **Audio not working**:
   - Check microphone permissions
   - Verify audio track is enabled
   - Test speaker/earpiece settings

4. **ICE connection failed**:
   - Add TURN servers (STUN alone may not work behind strict NATs)
   - Check network connectivity
   - Verify signaling server is running

## Performance Optimization

### Video Quality

```javascript
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
  },
};
```

### Adaptive Bitrate

Monitor connection quality and adjust video quality:

```javascript
peerConnection.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      const bytesReceived = report.bytesReceived;
      const packetsLost = report.packetsLost;
      // Adjust quality based on metrics
    }
  });
});
```

## Security Considerations

1. **End-to-End Encryption**: WebRTC provides DTLS-SRTP encryption by default
2. **Token-based Authentication**: Secure signaling server access
3. **TURN Server Authentication**: Use credentials for TURN servers
4. **Content Security**: Validate all signaling messages

## Next Steps

1. ✅ Implement signaling server
2. ✅ Integrate WebRTC service
3. ✅ Add incoming call notifications
4. ✅ Test peer-to-peer connection
5. Deploy to production
6. Add call history
7. Implement call recording
8. Add screen sharing

---

**Last Updated**: October 8, 2025
**Version**: 2.0.0
**Status**: Ready for WebRTC Integration
