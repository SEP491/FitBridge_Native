import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";

const GymDetailScreenSkeleton = () => {
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel Skeleton */}
        <View style={styles.carouselContainer}>
          <Animated.View style={[styles.carouselImage, { opacity }]} />
        </View>

        {/* Main Card */}
        <View style={styles.cardDetail}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Animated.View style={[styles.gymNameLine, { opacity }]} />
              <Animated.View style={[styles.hotBadge, { opacity }]} />
            </View>

            <View style={styles.locationContainer}>
              <Animated.View style={[styles.locationIcon, { opacity }]} />
              <Animated.View style={[styles.addressLine, { opacity }]} />
            </View>

            <View style={styles.priceRatingContainer}>
              <View style={styles.priceContainer}>
                <Animated.View style={[styles.priceLabelLine, { opacity }]} />
                <Animated.View style={[styles.priceLine, { opacity }]} />
                <Animated.View style={[styles.priceUnitLine, { opacity }]} />
              </View>
              <View style={styles.ratingBadge}>
                <Animated.View style={[styles.ratingStar, { opacity }]} />
                <Animated.View style={[styles.ratingTextLine, { opacity }]} />
                <Animated.View style={[styles.reviewCountLine, { opacity }]} />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <Animated.View style={[styles.actionButton, { opacity }]} />
            <Animated.View style={[styles.actionButton, { opacity }]} />
          </View>

          {/* Description Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Animated.View style={[styles.sectionIcon, { opacity }]} />
              <Animated.View style={[styles.sectionTitleLine, { opacity }]} />
            </View>
            <Animated.View style={[styles.descriptionLineLong, { opacity }]} />
            <Animated.View
              style={[styles.descriptionLineMedium, { opacity }]}
            />
            <Animated.View
              style={[styles.descriptionLineShort, { opacity }]}
            />
          </View>

          {/* Equipment Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Animated.View style={[styles.sectionIcon, { opacity }]} />
              <Animated.View style={[styles.sectionTitleLine, { opacity }]} />
              <Animated.View style={[styles.countBadge, { opacity }]} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.assetsScrollContainer}
            >
              {[1, 2, 3, 4].map((item) => (
                <Animated.View
                  key={item}
                  style={[styles.assetCard, { opacity }]}
                >
                  <Animated.View
                    style={[styles.assetImage, { opacity }]}
                  />
                  <View style={styles.assetInfo}>
                    <Animated.View
                      style={[styles.assetNameLine, { opacity }]}
                    />
                    <Animated.View
                      style={[styles.assetCategoryLine, { opacity }]}
                    />
                    <Animated.View
                      style={[styles.assetQuantityLine, { opacity }]}
                    />
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {/* Facilities Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Animated.View style={[styles.sectionIcon, { opacity }]} />
              <Animated.View style={[styles.sectionTitleLine, { opacity }]} />
              <Animated.View style={[styles.countBadge, { opacity }]} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.assetsScrollContainer}
            >
              {[1, 2, 3].map((item) => (
                <Animated.View
                  key={item}
                  style={[styles.facilityCard, { opacity }]}
                >
                  <Animated.View
                    style={[styles.facilityImage, { opacity }]}
                  />
                  <View style={styles.facilityInfo}>
                    <Animated.View
                      style={[styles.facilityNameLine, { opacity }]}
                    />
                    <Animated.View
                      style={[styles.facilityDescriptionLine, { opacity }]}
                    />
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {/* Map Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Animated.View style={[styles.sectionIcon, { opacity }]} />
              <Animated.View style={[styles.sectionTitleLine, { opacity }]} />
            </View>
            <Animated.View style={[styles.mapContainer, { opacity }]} />
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Animated.View style={[styles.ratingNumberLine, { opacity }]} />
            <Animated.View style={[styles.ratingStar, { opacity }]} />
            <Animated.View style={[styles.reviewsTitleLine, { opacity }]} />
          </View>

          <View style={styles.reviewsContainer}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Animated.View
                    style={[styles.reviewAvatar, { opacity }]}
                  />
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
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  carouselContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#F8F9FA",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  cardDetail: {
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  gymNameLine: {
    width: "70%",
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  hotBadge: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  locationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  addressLine: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceLabelLine: {
    width: 40,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  priceLine: {
    width: 100,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  priceUnitLine: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingStar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  ratingTextLine: {
    width: 30,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  reviewCountLine: {
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  sectionTitleLine: {
    width: 120,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  countBadge: {
    width: 30,
    height: 20,
    borderRadius: 10,
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
  },
  assetsScrollContainer: {
    flexDirection: "row",
    gap: 12,
  },
  assetCard: {
    width: 200,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  assetImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E5E7EB",
  },
  assetInfo: {
    padding: 12,
  },
  assetNameLine: {
    width: "80%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  assetCategoryLine: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  assetQuantityLine: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  facilityCard: {
    width: 180,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  facilityImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E5E7EB",
  },
  facilityInfo: {
    padding: 12,
  },
  facilityNameLine: {
    width: "90%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  facilityDescriptionLine: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  reviewsSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
  },
  reviewsContainer: {
    marginTop: 12,
  },
  ratingNumberLine: {
    width: 30,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  reviewsTitleLine: {
    width: 100,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
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

export default GymDetailScreenSkeleton;

