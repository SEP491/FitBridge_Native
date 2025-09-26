import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigator from "./navigation/Navigator";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "./context/CartContext";
import { LocationProvider } from "./context/LocationContext";
import { FitnessProvider } from "./context/FitnessContext";
// Import i18n configuration
import "./i18n";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocationProvider>
          <FitnessProvider>
            <CartProvider>
              <View style={{ flex: 1 }}>
                <Navigator />
              </View>
            </CartProvider>
          </FitnessProvider>
        </LocationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
