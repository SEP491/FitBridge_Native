import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const ProductCardSkeleton = () => {
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
      {/* Image */}
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.image, { opacity }]} />
        <Animated.View style={[styles.discountBadge, { opacity }]} />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        {/* Product name */}
        <Animated.View style={[styles.productName, { opacity }]} />

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Animated.View style={[styles.ratingIcon, { opacity }]} />
          <Animated.View style={[styles.ratingText, { opacity }]} />
          <Animated.View style={[styles.reviewsText, { opacity }]} />
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Animated.View style={[styles.salePrice, { opacity }]} />
          <Animated.View style={[styles.originalPrice, { opacity }]} />
        </View>

        {/* Footer row */}
        <View style={styles.footerRow}>
          <View style={styles.soldContainer}>
            <Animated.View style={[styles.soldIcon, { opacity }]} />
            <Animated.View style={[styles.soldText, { opacity }]} />
          </View>
          <Animated.View style={[styles.originBadge, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const ProductCardSkeletonList = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 50,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    width: "80%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
  },
  ratingText: {
    width: 30,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
  },
  reviewsText: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  salePrice: {
    width: 70,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  originalPrice: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  soldIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
  },
  soldText: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  originBadge: {
    width: 40,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default ProductCardSkeleton;
export { ProductCardSkeletonList };


