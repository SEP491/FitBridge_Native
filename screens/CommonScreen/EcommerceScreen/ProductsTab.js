import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProductsTab() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="construct-outline" size={80} color="#CCC" />
        <Text style={styles.comingSoonTitle}>
          {t("common.comingSoon")}
        </Text>
        <Text style={styles.comingSoonSubtitle}>
          {t("ecommerce.productsComingSoon")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: "#6B6B6B",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 24,
  },
});
