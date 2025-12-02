import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const ConversationSkeleton = () => {
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
    <View style={styles.container}>
      {/* Avatar Skeleton */}
      <View style={styles.avatarContainer}>
        <Animated.View
          style={[
            styles.avatar,
            {
              opacity,
            },
          ]}
        />
      </View>

      {/* Content Skeleton */}
      <View style={styles.contentContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Animated.View
            style={[
              styles.titleSkeleton,
              {
                opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.timeSkeleton,
              {
                opacity,
              },
            ]}
          />
        </View>

        {/* Message Row */}
        <View style={styles.messageRow}>
          <Animated.View
            style={[
              styles.messageSkeleton1,
              {
                opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.messageSkeleton2,
              {
                opacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const ConversationSkeletonList = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleSkeleton: {
    height: 16,
    width: "60%",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  timeSkeleton: {
    height: 12,
    width: 60,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageSkeleton1: {
    height: 14,
    flex: 1,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  messageSkeleton2: {
    height: 14,
    width: "30%",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default ConversationSkeleton;
export { ConversationSkeletonList };

