import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const PerformanceSummaryCard = ({ stat }) => {
  const performanceStat = {
    ...stat,
    variant: stat.variant || "compact",
  };
  const accent = performanceStat.accent || "#2196F3";

  const cardWidthStyle =
    performanceStat.variant === "compact"
      ? styles.statCardCompact
      : styles.statCardWide;

  const displayValue =
    typeof performanceStat.value === "number" &&
    performanceStat.value > 1000
      ? performanceStat.value.toLocaleString()
      : performanceStat.value;

  return (
    <View style={[styles.statCard, cardWidthStyle]}>
        <View style={styles.statCardInner}>
          <View style={styles.statHeader}>
            <Text style={styles.summaryCardLabel}>{performanceStat.label}</Text>
            <View
              style={[
                styles.summaryIconBubble,
                { backgroundColor: `${accent}20` },
              ]}
            >
              <Icon
                name={performanceStat.icon}
                size={20}
                color={accent}
              />
            </View>
          </View>

          <View style={styles.summaryValueRow}>
            <Text style={styles.summaryCardValue}>{displayValue}</Text>
            {performanceStat.suffix && (
              <Text
                style={[
                  styles.summaryCardSuffix,
                  { color: accent },
                ]}
              >
                {performanceStat.suffix}
              </Text>
            )}
          </View>

          {performanceStat.helper && (
            <View style={styles.cardFooter}>
              <View
                style={[styles.footerIndicator, { backgroundColor: accent }]}
              />
              <Text style={styles.footerHelper}>{performanceStat.helper}</Text>
            </View>
          )}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 30,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  statCardInner: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(100px)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderRadius: 35,
    margin: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
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
    width: 55,
    height: 55,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "absolute",
    right: -16,
    top: -16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 1)",
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
    fontSize: 22,
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
  },
  footerIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  footerHelper: {
    fontSize: 11,
    color: "#6B6B6B",
    fontWeight: "600",
  },
});

export default PerformanceSummaryCard;

