import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigator from "./navigation/Navigator";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "./context/CartContext";
import { LocationProvider } from "./context/LocationContext";
import { FitnessProvider } from "./context/FitnessContext";
import { SignalRProvider } from "./context/SignalRContext";
import { NotificationProvider } from "./context/NotificationContext";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import authService from "./services/authService";
// Import i18n configuration
import "./i18n";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
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

        // Add any other initialization logic here
        // For example: loading fonts, checking app updates, etc.

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
    const hideSplashScreen = async () => {
      if (appIsReady) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplashScreen();
  }, [appIsReady]);

  if (!appIsReady || !authCheckComplete) {
    // Return null while splash screen is still showing and auth is being checked
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SignalRProvider>
          <NotificationProvider>
            <LocationProvider>
              <FitnessProvider>
                <CartProvider>
                  <View style={{ flex: 1 }}>
                    <Navigator isAuthenticated={isAuthenticated} user={user} />
                  </View>
                </CartProvider>
              </FitnessProvider>
            </LocationProvider>
          </NotificationProvider>
        </SignalRProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
