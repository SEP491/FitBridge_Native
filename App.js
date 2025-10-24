import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigator from "./navigation/Navigator";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "./context/CartContext";
import { LocationProvider } from "./context/LocationContext";
import { FitnessProvider } from "./context/FitnessContext";
import { SignalRProvider } from "./context/SignalRContext";
import { WebRTCProvider } from "./context/webrtcContext";
import { NotificationProvider } from "./context/NotificationContext";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import authService from "./services/authService";
import { registerGlobals } from "react-native-webrtc";
// Import i18n configuration
import "./i18n";
import { MeetingStateProvider } from "./context/meetingStateContext";
import { SignalR_WebRTCProvider } from "./context/signalrContext_webrtc";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  registerGlobals();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("Starting app initialization");

        // Check authentication status
        console.log("Checking authentication");
        const authResult = await authService.validateToken();

        if (authResult.isValid) {
          console.log(
            "User authenticated:",
            authResult.user?.email || "unknown"
          );
          setIsAuthenticated(true);
          setUser(authResult.user);
        } else {
          console.log("User not authenticated");
          setIsAuthenticated(false);
          setUser(null);
        }

        setAuthCheckComplete(true);

        console.log("App initialization complete");
      } catch (e) {
        console.error("App initialization error:", e.message);
        // Even if there's an error, we should continue with unauthenticated state
        setIsAuthenticated(false);
        setUser(null);
        setAuthCheckComplete(true);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    let isRevenueCatInitialized = false;

    if (!isRevenueCatInitialized) {
      isRevenueCatInitialized = true;

      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_APPLE,
      });
      console.log("✅ RevenueCat configured");
    } else {
      console.log("⏭️ Already configured, skipping");
    }
  }, []);

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (appIsReady) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplashScreen();
  }, [appIsReady]);

  if (!appIsReady || !authCheckComplete) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SignalRProvider>
          <SignalR_WebRTCProvider>
            <WebRTCProvider>
              <MeetingStateProvider>
                <NotificationProvider>
                  <LocationProvider>
                    <FitnessProvider>
                      <CartProvider>
                        <Navigator
                          isAuthenticated={isAuthenticated}
                          user={user}
                        />
                      </CartProvider>
                    </FitnessProvider>
                  </LocationProvider>
                </NotificationProvider>
              </MeetingStateProvider>
            </WebRTCProvider>
          </SignalR_WebRTCProvider>
        </SignalRProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
