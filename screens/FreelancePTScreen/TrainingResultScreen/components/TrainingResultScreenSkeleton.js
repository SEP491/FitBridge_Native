import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";

const TrainingResultScreenSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Customer & Package Info Card Skeleton */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
          <View style={styles.infoTextContainer}>
            <Animated.View style={[styles.nameLine, { opacity }]} />
            <Animated.View style={[styles.emailLine, { opacity }]} />
            <Animated.View style={[styles.packageLine, { opacity }]} />
          </View>
        </View>
      </View>

      {/* Tab Navigation Skeleton */}
      <View style={styles.tabContainer}>
        <View style={styles.firstRow}>
          <Animated.View style={[styles.tabSkeleton, styles.fullWidthTab, { opacity }]} />
        </View>
        <View style={styles.secondRow}>
          <Animated.View style={[styles.tabSkeleton, styles.halfWidthTab, { opacity }]} />
          <Animated.View style={[styles.tabSkeleton, styles.halfWidthTab, { opacity }]} />
        </View>
      </View>

      {/* Stat Cards Skeleton */}
      {/* Overview Statistics Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.statsGrid}>
          <Animated.View style={[styles.statBox, { opacity }]} />
          <Animated.View style={[styles.statBox, { opacity }]} />
          <Animated.View style={[styles.statBox, { opacity }]} />
          <Animated.View style={[styles.statBox, { opacity }]} />
        </View>
      </View>

      {/* Daily Progress Chart Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.chartControlsRow}>
          <Animated.View style={[styles.controlButton, { opacity }]} />
          <Animated.View style={[styles.controlButton, { opacity }]} />
          <Animated.View style={[styles.controlButton, { opacity }]} />
        </View>
        <Animated.View style={[styles.chartSkeleton, { opacity }]} />
      </View>

      {/* Muscle Group Performance Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.muscleGroupRow}>
          <Animated.View style={[styles.muscleGroupItem, { opacity }]} />
          <Animated.View style={[styles.muscleGroupItem, { opacity }]} />
          <Animated.View style={[styles.muscleGroupItem, { opacity }]} />
        </View>
      </View>

      {/* User Goals Progress Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.muscleSelectorRow}>
          <Animated.View style={[styles.muscleSelectorButton, { opacity }]} />
          <Animated.View style={[styles.muscleSelectorButton, { opacity }]} />
          <Animated.View style={[styles.muscleSelectorButton, { opacity }]} />
        </View>
        <Animated.View style={[styles.chartSkeleton, { opacity }]} />
      </View>

      {/* Session Statistics Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.statRowsContainer}>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
        </View>
      </View>

      {/* Activity Statistics Card */}
      <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity }]} />
        </View>
        <View style={styles.statRowsContainer}>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
          <View style={styles.statRowSkeleton}>
            <Animated.View style={[styles.statRowLabelSkeleton, { opacity }]} />
            <Animated.View style={[styles.statRowValueSkeleton, { opacity }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  nameLine: {
    width: "60%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  emailLine: {
    width: "80%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  packageLine: {
    width: "50%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  firstRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  secondRow: {
    flexDirection: "row",
    gap: 4,
  },
  tabSkeleton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  fullWidthTab: {
    flex: 1,
  },
  halfWidthTab: {
    flex: 1,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  titleLine: {
    width: "60%",
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    width: "47%",
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  chartControlsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  controlButton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  chartSkeleton: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
  },
  muscleGroupRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  muscleGroupItem: {
    width: "30%",
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  muscleSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  muscleSelectorButton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  statRowsContainer: {
    gap: 8,
  },
  statRowSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statRowLabelSkeleton: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statRowValueSkeleton: {
    width: "30%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default TrainingResultScreenSkeleton;

