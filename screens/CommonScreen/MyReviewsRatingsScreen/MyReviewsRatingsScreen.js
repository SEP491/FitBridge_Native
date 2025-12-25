import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import ProductReviewsTab from "./ProductReviewsTab";
import GymPackageReviewsTab from "./GymPackageReviewsTab";
import FreelancePTReviewsTab from "./FreelancePTReviewsTab";
import reviewService from "../../../services/reviewService";
import { fetchUserFromStorage } from "../../../lib";
import ReviewCard from "../../../components/ReviewCard/ReviewCard";
import { ReviewCardSkeletonList } from "../../../components/ReviewCard/ReviewCardSkeleton";

export default function MyReviewsRatingsScreen() {
  const { t } = useTranslation();

  // Top-level tab: 'unreviewed' or 'reviewed'
  const [contentType, setContentType] = useState("reviewed");
  // Sub-tabs for reviewed content: 'product', 'gymCourse', 'freelancePT'
  const [activeTab, setActiveTab] = useState("product");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [reviewedContent, setReviewedContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // Map tab names to reviewType API values
  const reviewTypeMap = {
    product: "ProductDetail",
    gymCourse: "GymCourse",
    freelancePT: "FreelancePTPackage",
  };

  useEffect(() => {
    // Fetch current user ID from your auth context or service
    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchUserFromStorage();
        if (userData?.id) {
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching current user", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchReviewedContent = async (reviewType) => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await reviewService.getReviewedContent({
        page: 1,
        size: 50,
        customerId: currentUserId,
        sortOrder: "dsc",
        reviewType: reviewType, // GymCourse, FreelancePTPackage, ProductDetail
      });
      if (response?.data?.items) {
        setReviewedContent(response.data.items);
      } else {
        setReviewedContent([]);
      }
    } catch (error) {
      console.error("Error fetching reviewed content:", error);
      setReviewedContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contentType === "reviewed" && currentUserId) {
      const reviewType = reviewTypeMap[activeTab];
      if (reviewType) {
        fetchReviewedContent(reviewType);
      }
    }
  }, [contentType, activeTab, currentUserId]);

  const onReviewDeleted = () => {
    const reviewType = reviewTypeMap[activeTab];
    fetchReviewedContent(reviewType);
  };
  const onReviewUpdated = () => {
    const reviewType = reviewTypeMap[activeTab];
    fetchReviewedContent(reviewType);
  };
  const getProductTypeText = (review) => {
    if (review.productDetail) {
      // For ProductDetail, show product name with flavour if available
      const productName = review.productDetail.productName;
      const flavourName = review.productDetail.flavourName;
      const weightValue = review.productDetail.weightValue;
      const weightUnit = review.productDetail.weightUnit;
      return flavourName
        ? `${productName} - ${flavourName} - ${weightValue} ${weightUnit}`
        : productName;
    }
    if (review.gymBrief) {
      return t("myReviewsRatings.GymCourse") + ": " + review.gymBrief.gymName;
    }
    if (review.freelancePtBrief) {
      return (
        t("myReviewsRatings.FreelancePT") +
        ": " +
        review.freelancePtBrief.fullName
      );
    }
    return null;
  };

  const renderReviewedContent = () => {
    if (loading) {
      return (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ReviewCardSkeletonList count={4} />
        </ScrollView>
      );
    }

    if (reviewedContent.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>
            {t("myReviewsRatings.noReviewedContent") ||
              "No reviewed content found"}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {reviewedContent.map((review) => {
          const productTypeText = getProductTypeText(review);
          return (
            <ReviewCard
              key={review.id}
              review={review}
              t={t}
              isReviewMode={true}
              showProductType={!!productTypeText}
              productTypeText={productTypeText}
              onReviewDeleted={onReviewDeleted}
              onReviewUpdated={onReviewUpdated}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top-level Tabs: Unreviewed Content / Reviewed Content */}
      <View style={styles.topTabContainer}>
        <TouchableOpacity
          style={[
            styles.topTab,
            contentType === "unreviewed" && styles.activeTopTab,
          ]}
          onPress={() => setContentType("unreviewed")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.topTabText,
              contentType === "unreviewed" && styles.activeTopTabText,
            ]}
          >
            {t("myReviewsRatings.unreviewedContent") || "Unreviewed Content"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.topTab,
            contentType === "reviewed" && styles.activeTopTab,
          ]}
          onPress={() => setContentType("reviewed")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.topTabText,
              contentType === "reviewed" && styles.activeTopTabText,
            ]}
          >
            {t("myReviewsRatings.reviewedContent") || "Reviewed Content"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-tabs for Reviewed Content */}
      {contentType === "reviewed" && (
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
              color={activeTab === "gymCourse" ? "#ED2A46" : "#999"}
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
            style={[
              styles.tab,
              activeTab === "freelancePT" && styles.activeTab,
            ]}
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
      )}

      {/* Sub-tabs for Unreviewed Content */}
      {contentType === "unreviewed" && (
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
              color={activeTab === "gymCourse" ? "#ED2A46" : "#999"}
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
            style={[
              styles.tab,
              activeTab === "freelancePT" && styles.activeTab,
            ]}
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
      )}

      {/* Content */}
      {contentType === "unreviewed" && (
        <>
          {activeTab === "product" && (
            <ProductReviewsTab currentUserId={currentUserId} />
          )}
          {activeTab === "gymCourse" && (
            <GymPackageReviewsTab currentUserId={currentUserId} />
          )}
          {activeTab === "freelancePT" && (
            <FreelancePTReviewsTab currentUserId={currentUserId} />
          )}
        </>
      )}

      {contentType === "reviewed" && renderReviewedContent()}
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
  topTabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  topTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#F8F9FA",
  },
  activeTopTab: {
    backgroundColor: "rgba(237, 42, 70, 0.1)",
  },
  topTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  activeTopTabText: {
    color: "#ED2A46",
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
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
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
