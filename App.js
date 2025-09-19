import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Navigator from "./navigation/Navigator";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "./context/CartContext";
import { AvatarProvider } from "./context/AvatarContext";
import { LocationProvider } from "./context/LocationContext";
import { FitnessProvider } from "./context/FitnessContext";
import { useEffect } from "react";
// Import i18n configuration
import "./i18n";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocationProvider>
          <FitnessProvider>
            <AvatarProvider>
              <CartProvider>
                <View style={{ flex: 1 }}>
                  <Navigator />
                </View>
              </CartProvider>
            </AvatarProvider>
          </FitnessProvider>
        </LocationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
