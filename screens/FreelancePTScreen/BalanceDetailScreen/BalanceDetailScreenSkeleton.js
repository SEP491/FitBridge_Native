import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";

const BalanceDetailScreenSkeleton = () => {
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
      {/* Summary Card */}
      <Animated.View style={[styles.summaryCard, { opacity }]}>
        <Animated.View style={[styles.summaryLabel, { opacity }]} />
        <Animated.View style={[styles.summaryAmount, { opacity }]} />
        <Animated.View style={[styles.summaryCount, { opacity }]} />
      </Animated.View>

      {/* Transaction List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Section 1 */}
        <View style={styles.dateSection}>
          <Animated.View style={[styles.dateHeader, { opacity }]} />
          {Array.from({ length: 3 }).map((_, index) => (
            <Animated.View
              key={`transaction-1-${index}`}
              style={[styles.transactionItem, { opacity }]}
            >
              <View style={styles.transactionHeader}>
                <Animated.View style={[styles.iconContainer, { opacity }]} />
                <View style={styles.transactionInfo}>
                  <Animated.View style={[styles.transactionType, { opacity }]} />
                  <Animated.View style={[styles.transactionId, { opacity }]} />
                  <Animated.View style={[styles.courseName, { opacity }]} />
                </View>
                <View style={styles.amountContainer}>
                  <Animated.View style={[styles.amount, { opacity }]} />
                  <Animated.View style={[styles.balanceText, { opacity }]} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Date Section 2 */}
        <View style={styles.dateSection}>
          <Animated.View style={[styles.dateHeader, { opacity }]} />
          {Array.from({ length: 2 }).map((_, index) => (
            <Animated.View
              key={`transaction-2-${index}`}
              style={[styles.transactionItem, { opacity }]}
            >
              <View style={styles.transactionHeader}>
                <Animated.View style={[styles.iconContainer, { opacity }]} />
                <View style={styles.transactionInfo}>
                  <Animated.View style={[styles.transactionType, { opacity }]} />
                  <Animated.View style={[styles.transactionId, { opacity }]} />
                </View>
                <View style={styles.amountContainer}>
                  <Animated.View style={[styles.amount, { opacity }]} />
                  <Animated.View style={[styles.balanceText, { opacity }]} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Date Section 3 */}
        <View style={styles.dateSection}>
          <Animated.View style={[styles.dateHeader, { opacity }]} />
          {Array.from({ length: 4 }).map((_, index) => (
            <Animated.View
              key={`transaction-3-${index}`}
              style={[styles.transactionItem, { opacity }]}
            >
              <View style={styles.transactionHeader}>
                <Animated.View style={[styles.iconContainer, { opacity }]} />
                <View style={styles.transactionInfo}>
                  <Animated.View style={[styles.transactionType, { opacity }]} />
                  <Animated.View style={[styles.transactionId, { opacity }]} />
                  <Animated.View style={[styles.courseName, { opacity }]} />
                </View>
                <View style={styles.amountContainer}>
                  <Animated.View style={[styles.amount, { opacity }]} />
                  <Animated.View style={[styles.balanceText, { opacity }]} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  summaryAmount: {
    width: "50%",
    height: 32,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  summaryCount: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    width: "50%",
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    width: "60%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  transactionId: {
    width: "80%",
    height: 13,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  courseName: {
    width: "70%",
    height: 13,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  amountContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  amount: {
    width: 80,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  balanceText: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default BalanceDetailScreenSkeleton;

