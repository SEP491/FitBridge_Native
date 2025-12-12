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
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.imageSkeleton, { opacity }]} />
        {/* Optional discount badge skeleton */}
        <Animated.View style={[styles.discountBadge, { opacity }]} />
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {/* Product Name */}
        <Animated.View style={[styles.productNameLine, { opacity }]} />

        {/* Rating Container */}
        <View style={styles.ratingContainer}>
          <Animated.View style={[styles.ratingStar, { opacity }]} />
          <Animated.View style={[styles.ratingText, { opacity }]} />
          <Animated.View style={[styles.reviewsText, { opacity }]} />
        </View>

        {/* Price Container */}
        <View style={styles.priceContainer}>
          <Animated.View style={[styles.salePrice, { opacity }]} />
          <Animated.View style={[styles.originalPrice, { opacity }]} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
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

const ProductCardSkeletonList = ({ count = 6 }) => {
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
  imageSkeleton: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 40,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  infoContainer: {
    padding: 12,
  },
  productNameLine: {
    width: "90%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  ratingStar: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  ratingText: {
    width: 30,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginLeft: 4,
  },
  reviewsText: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  salePrice: {
    width: 80,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  originalPrice: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  soldIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E5E7EB",
  },
  soldText: {
    width: 70,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  originBadge: {
    width: 40,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

export default ProductCardSkeleton;
export { ProductCardSkeletonList };
