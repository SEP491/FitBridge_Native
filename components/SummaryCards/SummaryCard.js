import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const SummaryCard = ({ stat }) => {
  const navigation = useNavigation();
  const cardWidthStyle =
    stat.variant === "compact" ? styles.statCardCompact : styles.statCardWide;

  const displayValue =
    typeof stat.value === "number" && stat.value > 1000
      ? stat.value.toLocaleString()
      : stat.value;

  const handleShowDetail = () => {
    if (stat.id === "availableBalance" || stat.id === "pendingBalance") {
      navigation.navigate("BalanceDetailScreen", {
        initialTab: stat.id === "availableBalance" ? "available" : "pending",
      });
    }
  };

  // Check if we should use the simple dashboard style
  const useSimpleStyle = stat.style === '' || stat.style === 'simple';

  if (useSimpleStyle) {
    return (
      <TouchableOpacity style={[styles.simpleStatCard, cardWidthStyle]} activeOpacity={0.6} onPress={handleShowDetail}>
      <View style={styles.simpleStatCardInner}>
        <View style={styles.statHeader}>
          <Text style={styles.summaryCardLabel}>{stat.label}</Text>
          <View
            style={[
              styles.summaryIconBubble,
              { backgroundColor: `${stat.accent}20` },
            ]}
          >
            <Icon name={stat.icon} size={20} color={stat.accent} />
          </View>
        </View>

        <View style={styles.summaryValueRow}>
          <Text style={styles.summaryCardValue}>{displayValue}</Text>
          {stat.suffix && (
            <Text style={[styles.summaryCardSuffix, { color: stat.accent }]}>
              {stat.suffix}
            </Text>
          )}
        </View>
      </View>
  </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.statCard, cardWidthStyle]} activeOpacity={0.6} onPress={handleShowDetail}>
        <View style={styles.statCardInner}>
          <View style={styles.statHeader}>
            <Text style={styles.summaryCardLabel}>{stat.label}</Text>
            <View
              style={[
                styles.summaryIconBubble,
                { backgroundColor: `${stat.accent}20` },
              ]}
            >
              <Icon name={stat.icon} size={20} color={stat.accent} />
            </View>
          </View>

          <View style={styles.summaryValueRow}>
            <Text style={styles.summaryCardValue}>{displayValue}</Text>
            {stat.suffix && (
              <Text style={[styles.summaryCardSuffix, { color: stat.accent }]}>
                {stat.suffix}
              </Text>
            )}
          </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 20,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  simpleStatCard:{
    borderRadius: 20,
        elevation: 8,

  },
  statCardInner: {
    padding: 16,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(100px)",
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
    margin: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  simpleStatCardInner:{
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 20,
  },
  statCardWide: {
    flex: 1,
  },
  statCardCompact: {
    flex: 1,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryIconBubble: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: "#7A7A7A",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  summaryCardSuffix: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    marginLeft: 4,
    marginBottom: 2,
  },
  // Simple dashboard style (matching DashboardTab.js)
  simpleStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  simpleStatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  simpleStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  simpleStatHelper: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default SummaryCard;