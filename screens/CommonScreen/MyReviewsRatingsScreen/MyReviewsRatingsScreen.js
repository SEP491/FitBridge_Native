import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import ProductReviewsTab from "./ProductReviewsTab";
import GymPackageReviewsTab from "./GymPackageReviewsTab";
import FreelancePTReviewsTab from "./FreelancePTReviewsTab";

export default function MyReviewsRatingsScreen() {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("product"); // 'product', 'gymCourse', 'freelancePT'

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "product" && styles.activeTab]}
          onPress={() => setActiveTab("product")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cube-outline"
            size={20}
            color={activeTab === "product" ? "#ED2A46" : "#999"}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "product" && styles.activeTabText,
            ]}
          >
            {t("orders.products") || "Product"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "gymCourse" && styles.activeTab]}
          onPress={() => setActiveTab("gymCourse")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="fitness-outline"
            size={20}
            color={activeTab === "course" ? "#ED2A46" : "#999"}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "gymCourse" && styles.activeTabText,
            ]}
          >
            {t("myPackage.gymPackage") || "Gym Package"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "freelancePT" && styles.activeTab]}
          onPress={() => setActiveTab("freelancePT")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={activeTab === "freelancePT" ? "#ED2A46" : "#999"}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "freelancePT" && styles.activeTabText,
            ]}
          >
            {t("myPackage.freelancePT") || "Freelance PT Package"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content - each tab handles its own data and loading */}
      {activeTab === "product" && <ProductReviewsTab />}
      {activeTab === "gymCourse" && <GymPackageReviewsTab />}
      {activeTab === "freelancePT" && <FreelancePTReviewsTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#F8F9FA",
  },
  activeTab: {
    backgroundColor: "rgba(237, 42, 70, 0.1)",
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: "#ED2A46",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(237, 42, 70, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  feedbackButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ED2A46",
  },
  feedbackStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedbackStatusText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4CAF50",
  },
});
