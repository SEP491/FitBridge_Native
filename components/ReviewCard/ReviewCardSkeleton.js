import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const ReviewCardSkeleton = () => {
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
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          <Animated.View style={[styles.avatar, { opacity }]} />
        </View>

        <View style={styles.headerContent}>
          <Animated.View style={[styles.nameLine, { opacity }]} />
          <View style={styles.ratingRow}>
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.dateLine, { opacity }]} />
          </View>
          <Animated.View style={[styles.editedTag, { opacity }]} />
        </View>

        <Animated.View style={[styles.actionIcon, { opacity }]} />
      </View>

      {/* Product type line */}
      <Animated.View style={[styles.productTypeLine, { opacity }]} />

      {/* Content lines */}
      <Animated.View style={[styles.contentLineLong, { opacity }]} />
      <Animated.View style={[styles.contentLineMedium, { opacity }]} />
      <Animated.View style={[styles.contentLineShort, { opacity }]} />

      {/* Images row */}
      <View style={styles.imagesRow}>
        <Animated.View style={[styles.imageSkeleton, { opacity }]} />
        <Animated.View style={[styles.imageSkeleton, { opacity }]} />
        <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

const ReviewCardSkeletonList = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ReviewCardSkeleton key={`review-skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  headerContent: {
    flex: 1,
  },
  nameLine: {
    width: "50%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingStar: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginRight: 4,
  },
  dateLine: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
  },
  editedTag: {
    width: 40,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  actionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginLeft: 12,
  },
  productTypeLine: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  contentLineLong: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  contentLineMedium: {
    width: "90%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  contentLineShort: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: "row",
  },
  imageSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
});

export default ReviewCardSkeleton;
export { ReviewCardSkeletonList };


