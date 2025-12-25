import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";

const ProductDetailsScreenSkeleton = () => {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.productImage, { opacity }]} />
      </View>

      {/* Product Info Section */}
      <View style={styles.infoSection}>
        {/* Price Row */}
        <View style={styles.priceRow}>
          <Animated.View style={[styles.salePriceLine, { opacity }]} />
          <Animated.View style={[styles.originalPriceLine, { opacity }]} />
        </View>

        {/* Product Name */}
        <Animated.View style={[styles.productNameLine, { opacity }]} />
        <Animated.View style={[styles.productNameLineShort, { opacity }]} />

        {/* Rating and Info Row */}
        <View style={styles.originAndRatingRow}>
          <View style={styles.ratingRow}>
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.ratingTextLine, { opacity }]} />
            <Animated.View style={[styles.separatorLine, { opacity }]} />
            <Animated.View style={[styles.reviewsTextLine, { opacity }]} />
            <Animated.View style={[styles.separatorLine, { opacity }]} />
            <Animated.View style={[styles.soldTextLine, { opacity }]} />
          </View>
          <Animated.View style={[styles.originLine, { opacity }]} />
        </View>
      </View>

      {/* Variant Section - Weight */}
      <View style={styles.variantSection}>
        <View style={styles.variantHeader}>
          <Animated.View style={[styles.variantLabelLine, { opacity }]} />
          <Animated.View style={[styles.viewAllLine, { opacity }]} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.variantsContainer}
        >
          {[1, 2, 3, 4].map((item) => (
            <Animated.View
              key={item}
              style={[styles.variantCard, { opacity }]}
            />
          ))}
        </ScrollView>
      </View>

      {/* Variant Section - Flavour */}
      <View style={styles.variantSection}>
        <View style={styles.variantHeader}>
          <Animated.View style={[styles.variantLabelLine, { opacity }]} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.variantsContainer}
        >
          {[1, 2, 3, 4].map((item) => (
            <Animated.View
              key={item}
              style={[styles.variantCard, { opacity }]}
            />
          ))}
        </ScrollView>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <Animated.View style={[styles.sectionTitleLine, { opacity }]} />

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.detailRow}>
              <Animated.View style={[styles.detailLabelLine, { opacity }]} />
              <Animated.View style={[styles.detailValueLine, { opacity }]} />
            </View>
          ))}
        </View>

        {/* Description Lines */}
        <Animated.View style={[styles.descriptionLineLong, { opacity }]} />
        <Animated.View style={[styles.descriptionLineMedium, { opacity }]} />
        <Animated.View style={[styles.descriptionLineShort, { opacity }]} />
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Animated.View style={[styles.sectionTitleLine, { opacity }]} />
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Animated.View style={[styles.reviewAvatar, { opacity }]} />
              <View style={styles.reviewInfo}>
                <Animated.View
                  style={[styles.reviewNameLine, { opacity }]}
                />
                <View style={styles.reviewRatingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Animated.View
                      key={star}
                      style={[styles.reviewStar, { opacity }]}
                    />
                  ))}
                  <Animated.View
                    style={[styles.reviewDateLine, { opacity }]}
                  />
                </View>
              </View>
            </View>
            <Animated.View style={[styles.reviewTextLine, { opacity }]} />
            <Animated.View
              style={[styles.reviewTextLineShort, { opacity }]}
            />
          </View>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "90%",
    height: "90%",
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  infoSection: {
    padding: 16,
    backgroundColor: "#fff",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  salePriceLine: {
    width: 120,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  originalPriceLine: {
    width: 100,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  productNameLine: {
    width: "90%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  productNameLineShort: {
    width: "60%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  originAndRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingStar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  ratingTextLine: {
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  separatorLine: {
    width: 1,
    height: 14,
    backgroundColor: "#E5E7EB",
  },
  reviewsTextLine: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  soldTextLine: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  originLine: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  variantSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  variantLabelLine: {
    width: 150,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  viewAllLine: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  variantsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  variantCard: {
    width: 80,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitleLine: {
    width: 120,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabelLine: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  detailValueLine: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  descriptionLineLong: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  descriptionLineMedium: {
    width: "90%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  descriptionLineShort: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  reviewsSection: {
    padding: 16,
    backgroundColor: "#fff",
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameLine: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewStar: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  reviewDateLine: {
    width: 80,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
  },
  reviewTextLine: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  reviewTextLineShort: {
    width: "80%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProductDetailsScreenSkeleton;

