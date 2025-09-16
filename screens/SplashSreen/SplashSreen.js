import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simple timer for splash screen - location is now handled by LocationContext
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/LogoColor.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>FitBridge</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ED2A46",
  },
});

export default SplashScreen;
