import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';

// STUN/TURN servers configuration
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.onIceCandidateCallback = null;
    this.onConnectionStateChangeCallback = null;
  }

  // Initialize peer connection
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(configuration);
      console.log('Peer connection created');

      // Handle remote stream
      this.peerConnection.onaddstream = (event) => {
        console.log('Remote stream added:', event.stream);
        this.remoteStream = event.stream;
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(event.stream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
          if (this.onIceCandidateCallback) {
            this.onIceCandidateCallback(event.candidate);
          }
        }
      };

      // Monitor connection state
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        if (this.onConnectionStateChangeCallback) {
          this.onConnectionStateChangeCallback(this.peerConnection.iceConnectionState);
        }
      };

      // Monitor signaling state
      this.peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state:', this.peerConnection.signalingState);
      };

      return this.peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  // Get local media stream
  async getLocalStream(isFrontCamera = true) {
    try {
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
          facingMode: isFrontCamera ? 'user' : 'environment',
        },
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      console.log('Local stream obtained:', stream.toURL());
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  // Add local stream to peer connection
  addLocalStream(stream) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    this.localStream = stream;
    this.peerConnection.addStream(stream);
    console.log('Local stream added to peer connection');
  }

  // Create offer (caller)
  async createOffer() {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peerConnection.setLocalDescription(offer);
      console.log('Offer created and set as local description');
      
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Create answer (callee)
  async createAnswer() {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('Answer created and set as local description');
      
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Set remote description
  async setRemoteDescription(description) {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const remoteDesc = new RTCSessionDescription(description);
      await this.peerConnection.setRemoteDescription(remoteDesc);
      console.log('Remote description set:', description.type);
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  // Add ICE candidate
  async addIceCandidate(candidate) {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const iceCandidate = new RTCIceCandidate(candidate);
      await this.peerConnection.addIceCandidate(iceCandidate);
      console.log('ICE candidate added');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      // Don't throw, ICE candidates can fail
    }
  }

  // Toggle local audio
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        console.log('Audio toggled:', enabled);
        return true;
      }
    }
    return false;
  }

  // Toggle local video
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        console.log('Video toggled:', enabled);
        return true;
      }
    }
    return false;
  }

  // Switch camera
  async switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack._switchCamera();
        console.log('Camera switched');
      }
    }
  }

  // Close connection and cleanup
  close() {
    console.log('Closing WebRTC connection');

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream.release();
      this.localStream = null;
    }

    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.onIceCandidateCallback = null;
    this.onConnectionStateChangeCallback = null;
  }

  // Set callbacks
  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }

  // Get connection state
  getConnectionState() {
    return this.peerConnection ? this.peerConnection.iceConnectionState : 'closed';
  }

  // Check if connected
  isConnected() {
    const state = this.getConnectionState();
    return state === 'connected' || state === 'completed';
  }
}

// Export singleton instance
export default new WebRTCService();
