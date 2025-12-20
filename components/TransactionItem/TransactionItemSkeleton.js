import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const TransactionItemSkeleton = ({ showProfitBadge = false }) => {
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
      {/* Transaction Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.transactionTypeLine, { opacity }]} />
          <Animated.View style={[styles.transactionIdLine, { opacity }]} />
          <Animated.View style={[styles.courseNameLine, { opacity }]} />
          <Animated.View style={[styles.courseNameLine, { opacity }]} />
        </View>

        <View style={styles.statusWrapper}>
          <Animated.View style={[styles.statusTextLine, { opacity }]} />
          <Animated.View style={[styles.statusDateLine, { opacity }]} />
        </View>
      </View>

      {/* Amount badges row */}
      <View style={[
        styles.amountBadgesRow,
        !showProfitBadge && styles.amountBadgesRowFullWidth
      ]}>
        <View style={[
          styles.amountBadge,
          styles.totalBadge,
          !showProfitBadge && styles.fullWidthBadge
        ]}>
          <Animated.View style={[styles.amountBadgeLabelLine, { opacity }]} />
          <Animated.View style={[styles.amountBadgeValueLine, { opacity }]} />
        </View>

        {showProfitBadge && (
          <View style={[styles.amountBadge, styles.profitBadge]}>
            <Animated.View style={[styles.amountBadgeLabelLine, { opacity }]} />
            <Animated.View style={[styles.amountBadgeValueLine, { opacity }]} />
          </View>
        )}
      </View>
    </View>
  );
};

const TransactionItemSkeletonList = ({ count = 4, showProfitBadge = false }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TransactionItemSkeleton
          key={`transaction-skeleton-${index}`}
          showProfitBadge={showProfitBadge}
        />
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  transactionTypeLine: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  transactionIdLine: {
    width: "85%",
    height: 9,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  courseNameLine: {
    width: "75%",
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  statusWrapper: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  statusTextLine: {
    width: 70,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  statusDateLine: {
    width: 100,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  amountBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  amountBadgesRowFullWidth: {
    justifyContent: "flex-start",
  },
  amountBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  totalBadge: {
    borderWidth: 1,
    borderColor: "rgba(237, 42, 70, 0.4)",
    backgroundColor: "rgba(237, 42, 70, 0.06)",
  },
  profitBadge: {
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
    backgroundColor: "rgba(76, 175, 80, 0.06)",
  },
  amountBadgeLabelLine: {
    width: 50,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  amountBadgeValueLine: {
    width: 80,
    height: 15,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  fullWidthBadge: {
    flex: 1,
    width: "100%",
  },
});

export default TransactionItemSkeleton;
export { TransactionItemSkeletonList };

