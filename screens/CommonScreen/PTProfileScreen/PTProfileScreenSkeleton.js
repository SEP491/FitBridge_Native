import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PTProfileScreenSkeleton = () => {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={["#FF914D", "#ED2A46"]}
        style={styles.gradientContainer}
      >
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <Animated.View style={[styles.avatar, { opacity }]} />
          
          {/* Rating Badge */}
          <Animated.View style={[styles.ratingBadge, { opacity }]} />

          {/* Name */}
          <Animated.View style={[styles.nameLine, { opacity }]} />

          {/* Description */}
          <Animated.View style={[styles.descriptionLine, { opacity }]} />
          <Animated.View style={[styles.descriptionLineShort, { opacity }]} />

          {/* Basic Info */}
          <View style={styles.basicInfoContainer}>
            <Animated.View style={[styles.basicInfoItem, { opacity }]} />
            <Animated.View style={[styles.basicInfoItem, { opacity }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statCard, { opacity }]}>
          <Animated.View style={[styles.statIcon, { opacity }]} />
          <Animated.View style={[styles.statValue, { opacity }]} />
          <Animated.View style={[styles.statLabel, { opacity }]} />
        </Animated.View>
        <Animated.View style={[styles.statCard, { opacity }]}>
          <Animated.View style={[styles.statIcon, { opacity }]} />
          <Animated.View style={[styles.statValue, { opacity }]} />
          <Animated.View style={[styles.statLabel, { opacity }]} />
        </Animated.View>
        <Animated.View style={[styles.statCard, { opacity }]}>
          <Animated.View style={[styles.statIcon, { opacity }]} />
          <Animated.View style={[styles.statValue, { opacity }]} />
          <Animated.View style={[styles.statLabel, { opacity }]} />
        </Animated.View>
      </View>

      {/* Announcement Section */}
      <Animated.View style={[styles.announcementSection, { opacity }]}>
        <Animated.View style={[styles.announcementIcon, { opacity }]} />
        <View style={styles.announcementTextContainer}>
          <Animated.View style={[styles.announcementLine, { opacity }]} />
          <Animated.View style={[styles.announcementLineShort, { opacity }]} />
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Animated.View style={[styles.tab, { opacity }]} />
        <Animated.View style={[styles.tab, { opacity }]} />
      </View>

      {/* Profile Tab Content */}
      <View style={styles.sectionContainer}>
        {/* Pricing Section */}
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <Animated.View style={[styles.healthCard, { opacity }]}>
          <Animated.View style={[styles.healthHeader, { opacity }]} />
        </Animated.View>

        {/* Body Measurements Section */}
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <View style={styles.measurementsGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[styles.measurementCard, { opacity }]}
            >
              <Animated.View style={[styles.bodyPartImage, { opacity }]} />
              <Animated.View style={[styles.measurementLabel, { opacity }]} />
              <Animated.View style={[styles.measurementValue, { opacity }]} />
            </Animated.View>
          ))}
        </View>

        {/* Trainer Info Section */}
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <View style={styles.formContainer}>
          <Animated.View style={[styles.inputLabel, { opacity }]} />
          <View style={styles.tagsContainer}>
            <Animated.View style={[styles.tag, { opacity }]} />
            <Animated.View style={[styles.tag, { opacity }]} />
            <Animated.View style={[styles.tag, { opacity }]} />
          </View>
          <Animated.View style={[styles.inputLabel, { opacity }]} />
          <Animated.View style={[styles.certificationItem, { opacity }]} />
          <Animated.View style={[styles.inputLabel, { opacity }]} />
          <Animated.View style={[styles.bioText, { opacity }]} />
        </View>
      </View>
    </ScrollView>
  );
};

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    marginTop: -64,
  },
  gradientContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 80,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: 16,
  },
  ratingBadge: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginTop: -12,
    marginBottom: 8,
  },
  nameLine: {
    width: "60%",
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  descriptionLine: {
    width: "80%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  descriptionLineShort: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  basicInfoContainer: {
    flexDirection: "row",
    gap: 8,
  },
  basicInfoItem: {
    width: 100,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: -60,
    zIndex: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  statValue: {
    width: 40,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  announcementSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#E5E7EB",
  },
  announcementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
  },
  announcementTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  announcementLine: {
    width: "90%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginBottom: 6,
  },
  announcementLineShort: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 2,
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    width: "50%",
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    height: 80,
    marginBottom: 20,
  },
  healthHeader: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  measurementCard: {
    width: "30%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  bodyPartImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  measurementLabel: {
    width: 50,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },
  measurementValue: {
    width: 40,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  formContainer: {
    gap: 16,
  },
  inputLabel: {
    width: "40%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    width: 80,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  certificationItem: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  bioText: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
});

export default PTProfileScreenSkeleton;

