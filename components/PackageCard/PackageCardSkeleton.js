import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const PackageCardSkeleton = () => {
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
    <View style={styles.card}>
      {/* First row: image + content */}
      <View style={styles.mainRow}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.image, { opacity }]} />
          <Animated.View style={[styles.typeBadge, { opacity }]} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Animated.View style={[styles.titleLine, { opacity }]} />
            <Animated.View style={[styles.statusBadge, { opacity }]} />
          </View>

          <View style={styles.metaBlock}>
            <Animated.View style={[styles.metaLineShort, { opacity }]} />
            <Animated.View style={[styles.metaLineLong, { opacity }]} />
          </View>

          {/* Stats grid */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Animated.View style={[styles.statIcon, { opacity }]} />
              <View style={styles.statTextBlock}>
                <Animated.View style={[styles.statValue, { opacity }]} />
                <Animated.View style={[styles.statLabel, { opacity }]} />
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Animated.View style={[styles.statIcon, { opacity }]} />
              <View style={styles.statTextBlock}>
                <Animated.View style={[styles.statValue, { opacity }]} />
                <Animated.View style={[styles.statLabel, { opacity }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Second row: action buttons placeholder (even in review mode, keep subtle) */}
      <View style={styles.actionsRow}>
        <Animated.View style={[styles.actionButton, { opacity }]} />
        <Animated.View style={[styles.actionButton, { opacity }]} />
      </View>
    </View>
  );
};

const PackageCardSkeletonList = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PackageCardSkeleton key={`package-skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mainRow: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  typeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleLine: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  statusBadge: {
    width: 50,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  metaBlock: {
    marginBottom: 8,
  },
  metaLineShort: {
    width: "60%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  metaLineLong: {
    width: "80%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
  },
  statTextBlock: {
    flex: 1,
  },
  statValue: {
    width: "40%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  statLabel: {
    width: "60%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
});

export default PackageCardSkeleton;
export { PackageCardSkeletonList };


