import React, { createContext, useContext, useEffect, useMemo } from "react";
import signalR_webrtcService from "../services/signalR/signalR-webrtcService";
// Create the context
const SignalRContext = createContext();

// Custom hook to use the SignalR context
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};

// Provider component
export const SignalR_WebRTCProvider = ({ children }) => {
  const service = useMemo(() => signalR_webrtcService, []);

  useEffect(() => {
    return () => {
      console.log("SignalR: Stopping connection");
      service.stopConnection();
    };
  }, []);

  return (
    <SignalRContext.Provider value={useMemo(() => ({ service }), [service])}>
      {children}
    </SignalRContext.Provider>
  );
};

export default SignalRContext;
