import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const MyReportsScreenSkeleton = () => {
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
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.typeIconContainer, { opacity }]} />
          <View style={styles.headerInfo}>
            <Animated.View style={[styles.reportTitleLine, { opacity }]} />
            <Animated.View style={[styles.reportTypeLine, { opacity }]} />
          </View>
        </View>
        <Animated.View style={[styles.statusBadge, { opacity }]} />
      </View>

      {/* Description lines */}
      <Animated.View style={[styles.descriptionLineLong, { opacity }]} />
      <Animated.View style={[styles.descriptionLineMedium, { opacity }]} />

      {/* Reported User Container */}
      <View style={styles.reportedUserContainer}>
        <Animated.View style={[styles.reportedUserAvatar, { opacity }]} />
        <View style={styles.reportedUserInfo}>
          <Animated.View style={[styles.reportedUserLabelLine, { opacity }]} />
          <Animated.View style={[styles.reportedUserNameLine, { opacity }]} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Animated.View style={[styles.dateIcon, { opacity }]} />
          <Animated.View style={[styles.dateLine, { opacity }]} />
        </View>
        <View style={styles.dateContainer}>
          <Animated.View style={[styles.dateIcon, { opacity }]} />
          <Animated.View style={[styles.dateLineShort, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const MyReportsScreenSkeletonList = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MyReportsScreenSkeleton key={`report-skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  headerInfo: {
    flex: 1,
  },
  reportTitleLine: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  reportTypeLine: {
    width: "40%",
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statusBadge: {
    width: 80,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  descriptionLineLong: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  descriptionLineMedium: {
    width: "85%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  reportedUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
  },
  reportedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  reportedUserInfo: {
    flex: 1,
  },
  reportedUserLabelLine: {
    width: "50%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  reportedUserNameLine: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E5E7EB",
  },
  dateLine: {
    width: 120,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dateLineShort: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default MyReportsScreenSkeleton;
export { MyReportsScreenSkeletonList };

