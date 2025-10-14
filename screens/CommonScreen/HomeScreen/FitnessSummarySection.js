import React from "react";
import { View, StyleSheet } from "react-native";
import FitnessSummary from "../../../components/FitnessSummary/FitnessSummary";

export default function FitnessSummarySection() {
  return (
    <View style={styles.container}>
      <FitnessSummary />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Add any additional container styles if needed
  },
});
