// import React, { createContext, useContext, useEffect, useMemo } from "react";
// import signalrService from "../services/signalR/signalRService";
// import { AppState } from "react-native";

// // Create the context
// const SignalRContext = createContext();

// // Custom hook to use the SignalR context
// export const useSignalR = () => {
//   const context = useContext(SignalRContext);
//   if (!context) {
//     throw new Error("useSignalR must be used within a SignalRProvider");
//   }
//   return context;
// };

// // Provider component
// export const SignalRProvider = ({ children }) => {
//   const service = useMemo(() => signalrService, []);

//   useEffect(() => {
//     return () => {
//       service.stopConnection();
//     };
//   }, []);

//   useEffect(() => {
//     const handleAppStateChange = (nextAppState) => {
//       if (nextAppState === "background") {
//         console.log("App went to background - pausing SignalR connection");
//         service.pauseConnection();
//       } else if (nextAppState === "active") {
//         console.log("App became active - starting SignalR connection");
//         service.startConnection();
//       }
//     };

//     const subscription = AppState.addEventListener(
//       "change",
//       handleAppStateChange
//     );

//     return () => {
//       subscription?.remove();
//     };
//   }, [service]);

//   return (
//     <SignalRContext.Provider value={useMemo(() => ({ service }), [service])}>
//       {children}
//     </SignalRContext.Provider>
//   );
// };

// export default SignalRContext;
import React, { createContext, useContext, useEffect, useMemo } from "react";
import signalrService from "../services/signalR/signalRService";
import { AppState } from "react-native";
import authService from "../services/authService";

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
export const SignalRProvider = ({ children }) => {
  const service = useMemo(() => signalrService, []);

  useEffect(() => {
    return () => {
      service.stopConnection();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "background") {
        console.log("App went to background - pausing SignalR connection");
        await service.pauseConnection();
      } else if (nextAppState === "active") {
        console.log("App became active - checking authentication");
        
        // Validate if user is authenticated before starting connection
        const authResult = await authService.validateToken();
        
        if (authResult.isValid) {
          console.log("User is authenticated - starting SignalR connection");
          await service.resumeConnection();
        } else {
          console.log("User is not authenticated - skipping SignalR connection");
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [service]);

  return (
    <SignalRContext.Provider value={useMemo(() => ({ service }), [service])}>
      {children}
    </SignalRContext.Provider>
  );
};

export default SignalRContext;
