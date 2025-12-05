import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const SCREEN_WIDTH = Dimensions.get("window").width;

const QuickActionCard = ({ action }) => {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      activeOpacity={0.85}
      onPress={action.onPress}
    >
      <LinearGradient
        colors={[`${action.accent}22`, `${action.accent}08`]}
        style={styles.quickActionGradient}
      >
        <View style={[styles.quickIconContainer, { backgroundColor: action.accent }]}>
          <Icon name={action.icon} size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
          <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
        </View>
        <Icon name="chevron-forward" size={18} color="#999" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const QuickActions = ({ actions }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickActionScroll}
    >
      {actions.map((action) => (
        <QuickActionCard action={action} key={action.label} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  quickActionScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  quickActionCard: {
    width: SCREEN_WIDTH * 0.6,
    marginRight: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionGradient: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  quickIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2B2B",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});

export default QuickActions;
