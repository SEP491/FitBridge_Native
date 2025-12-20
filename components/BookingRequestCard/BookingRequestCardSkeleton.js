import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const BookingRequestCardSkeleton = () => {
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
    <View style={styles.requestCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfoContainer}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.avatar, { opacity }]} />
          </View>

          {/* User Info */}
          <View style={styles.userTextContainer}>
            <Animated.View style={[styles.userLabelLine, { opacity }]} />
            <Animated.View style={[styles.userNameLine, { opacity }]} />
            <Animated.View style={[styles.bookingTitleLine, { opacity }]} />
          </View>
        </View>

        {/* Status Badge */}
        <Animated.View style={[styles.statusBadge, { opacity }]} />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Date Row */}
        <View style={styles.infoRow}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.infoLabelLine, { opacity }]} />
          <Animated.View style={[styles.infoValueLine, { opacity }]} />
        </View>

        {/* Time Row */}
        <View style={styles.infoRow}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.infoLabelLine, { opacity }]} />
          <Animated.View style={[styles.infoValueLineMedium, { opacity }]} />
        </View>

        {/* Request Type Row */}
        <View style={styles.infoRow}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.infoLabelLine, { opacity }]} />
          <Animated.View style={[styles.infoValueLineShort, { opacity }]} />
        </View>

        {/* Note Row */}
        <View style={styles.infoRow}>
          <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          <Animated.View style={[styles.infoLabelLine, { opacity }]} />
          <Animated.View style={[styles.infoValueLineLong, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const BookingRequestCardSkeletonList = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <BookingRequestCardSkeleton key={`booking-request-skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfoContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5E7EB",
  },
  userTextContainer: {
    flex: 1,
  },
  userLabelLine: {
    width: 80,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  userNameLine: {
    width: "70%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  bookingTitleLine: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  statusBadge: {
    width: 70,
    height: 28,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconSkeleton: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  infoLabelLine: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  infoValueLine: {
    flex: 1,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  infoValueLineMedium: {
    width: "50%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  infoValueLineShort: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  infoValueLineLong: {
    width: "80%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default BookingRequestCardSkeleton;
export { BookingRequestCardSkeletonList };

