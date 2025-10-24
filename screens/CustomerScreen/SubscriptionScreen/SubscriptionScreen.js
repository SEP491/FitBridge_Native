import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function SubscriptionScreen() {
  // Fetch subscriptions from the API when the component mounts
  const navigation = useNavigation();
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_APPLE,
      });
    } else if (Platform.OS === "android") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_ANDROID,
      });
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    ></ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
