import signalR_webrtcService from './signalR/signalR-webrtcService';
import WebRTCService from './webrtc/service';

class VideoCallService {
  constructor() {
    this.webrtcService = null;
    this.isInitialized = false;
  }

  async initialize(roomId, username) {
    try {
      console.log('VideoCallService: Initializing', { roomId, username });
      
      // Create new WebRTC service instance
      this.webrtcService = new WebRTCService();
      
      // Connect to SignalR if not already connected
      // if (signalR_webrtcService.connectionStatus.state !== 'Connected') {
      //   await signalR_webrtcService.startConnection();
      // }
      
      // Initialize WebRTC connection
      await this.webrtcService.initializeConnection(roomId, username);
      
      // Register SignalR handlers
      this.webrtcService.registerSignalrHandlers();
      
      this.isInitialized = true;
      console.log('VideoCallService: Initialized successfully');
      
      return this.webrtcService;
    } catch (error) {
      console.error('VideoCallService: Initialization failed', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      console.log('VideoCallService: Cleaning up');
      
      if (this.webrtcService) {
        // Unregister SignalR handlers
        this.webrtcService.unregisterSignalrHandlers();
        
        // Close WebRTC connection
        await this.webrtcService.closeConnection();
        
        this.webrtcService = null;
      }
      
      this.isInitialized = false;
      console.log('VideoCallService: Cleaned up successfully');
    } catch (error) {
      console.error('VideoCallService: Cleanup failed', error);
    }
  }

  // Convenience methods
  setLocalStreamCallback(callback) {
    if (this.webrtcService) {
      this.webrtcService.setLocalStreamCallback(callback);
    }
  }

  setOnTrackCallback(callback) {
    if (this.webrtcService) {
      this.webrtcService.setOnTrackCallback(callback);
    }
  }

  toggleAudio() {
    if (this.webrtcService) {
      this.webrtcService.toggleAudio();
    }
  }

  toggleVideo() {
    if (this.webrtcService) {
      this.webrtcService.toggleVideo();
    }
  }

  toggleFlipCamera() {
    if (this.webrtcService) {
      this.webrtcService.toggleFlipCamera();
    }
  }

  getLocalStream() {
    return this.webrtcService?.localStream || null;
  }

  getPeerConnection() {
    return this.webrtcService?.peerConnection || null;
  }
}

// Export singleton
export default new VideoCallService();
