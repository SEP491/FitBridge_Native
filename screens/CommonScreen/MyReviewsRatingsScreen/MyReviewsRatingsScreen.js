import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import orderService from "../../../services/orderService";
import PackageCard from "../../../components/PackageCard/PackageCard";
import PackageFeedbackModal from "../../../components/OrderManagementCard/PackageFeedbackModal";
import OrderManagementCard from "../../../components/OrderManagementCard/OrderManagementCard";

export default function MyReviewsRatingsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("product"); // 'product' or 'course'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCourseForFeedback, setSelectedCourseForFeedback] = useState(null);
  
  // Product reviews state
  const [productReviews, setProductReviews] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  
  // Course reviews state
  const [courseReviews, setCourseReviews] = useState([]);
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [activeTab])
  );

  const fetchReviews = async (pageNum = 1, append = false) => {
    if (activeTab === "product") {
      fetchProductReviews(pageNum, append);
    } else {
      fetchCourseReviews(pageNum, append);
    }
  };

  const fetchProductReviews = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setProductLoading(true);

      // Fetch order summary to get all orders (similar to Feedback filter in ManageOrderScreen)
      const summaryResponse = await orderService.getProductOrder({ 
        doApplyPaging: false,
        sortOrder: "dsc",
      });
      setOrderSummary(summaryResponse.data || null);

      // Filter orders similar to Feedback filter: Finished orders with items that haven't been reviewed
      const allOrders = summaryResponse.data?.productOrders?.items || [];
      let filtered = allOrders.filter((order) => order.currentStatus === "Finished");
      filtered = filtered.filter((order) =>
        order.orderItems.some((item) => !item.isFeedback)
      );

      // Apply pagination manually
      const pageSize = 10;
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedOrders = filtered.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filtered.length / pageSize);

      if (append) {
        setProductReviews((prev) => [...prev, ...paginatedOrders]);
      } else {
        setProductReviews(paginatedOrders);
      }
      setProductPage(pageNum);
      setProductTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    } finally {
      setLoading(false);
      setProductLoading(false);
    }
  };

  const fetchCourseReviews = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setCourseLoading(true);

      const response = await orderService.getCourseOrder({
        page: pageNum,
        size: 10,
        sortOrder: "dsc",
      });

      const orders = response.data?.items || [];
      const totalPages = response.data?.totalPages || 1;

      // Filter only finished orders and flatten order items
      const courseItems = orders
        .filter((order) => order.status === "Finished")
        .flatMap((order) =>
          order.orderItems.map((item) => {
            const isGymCourse = !!item.gymCourseId;
            const gymCourse = item.gymCourse;
            const freelancePTPackage = item.freelancePTPackage;
            
            // Determine package type
            let packageType = "gymCourseNormal";
            if (!isGymCourse) {
              packageType = "freelancePT";
            } else if (gymCourse?.ptPrice > 0 || gymCourse?.pt) {
              packageType = "gymCourseWithPT";
            }

            return {
              id: item.id,
              orderId: order.id,
              packageName: item.productName,
              courseName: item.productName,
              type: packageType,
              courseType: isGymCourse ? "gym" : "freelancePT",
              gymCourseId: item.gymCourseId,
              freelancePTPackageId: item.freelancePTPackageId,
              isFeedback: item.isFeedback,
              hasReviewed: item.isFeedback,
              price: item.price,
              courseImageUrl: gymCourse?.imageUrl || freelancePTPackage?.imageUrl,
              imageUrl: gymCourse?.imageUrl || freelancePTPackage?.imageUrl,
              ptName: gymCourse?.pt?.fullName || freelancePTPackage?.pt?.fullName || null,
              availableSessions: gymCourse?.session || freelancePTPackage?.session || 0,
              expirationDate: order.createdAt, // Using createdAt as placeholder
              createdAt: order.createdAt,
              // Store gymCourse and freelancePTPackage at top level for easier access
              gymCourse: gymCourse,
              freelancePTPackage: freelancePTPackage,
              // Store the complete orderItem with all API fields (id, gymCourse, freelancePTPackage, etc.)
              orderItem: {
                id: item.id,
                productName: item.productName,
                gymCourseId: item.gymCourseId,
                freelancePTPackageId: item.freelancePTPackageId,
                gymCourse: item.gymCourse,
                freelancePTPackage: item.freelancePTPackage,
                price: item.price,
                quantity: item.quantity,
                isFeedback: item.isFeedback,
                isRefunded: item.isRefunded,
              },
            };
          })
        );

      if (append) {
        setCourseReviews((prev) => [...prev, ...courseItems]);
      } else {
        setCourseReviews(courseItems);
      }
      setCoursePage(pageNum);
      setCourseTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching course reviews:", error);
    } finally {
      setLoading(false);
      setCourseLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (activeTab === "product") {
      if (productPage < productTotalPages && !productLoading) {
        fetchProductReviews(productPage + 1, true);
      }
    } else {
      if (coursePage < courseTotalPages && !courseLoading) {
        fetchCourseReviews(coursePage + 1, true);
      }
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>
        {activeTab === "product"
          ? t("product.noReviewsYet") || "No Product Reviews Yet"
          : t("myPackage.noReviewsYet") || "No Course Reviews Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "product"
          ? t("product.reviewProductsMessage") || "Your product reviews will appear here"
          : t("myPackage.reviewCoursesMessage") || "Your course reviews will appear here"}
      </Text>
    </View>
  );

  const handleFeedback = (item) => {
    // Pass the item with orderItem structure - the modal will extract orderItem.id
    // The item already contains orderItem from the transformation in fetchCourseReviews
    const packageForFeedback = {
      ...item,
      orderItem: item.orderItem || item, // Use orderItem if available, otherwise use item itself
    };
    console.log("Feedback for package:", packageForFeedback);
    setSelectedCourseForFeedback(packageForFeedback);
    setFeedbackModalVisible(true);
  };

  const handleRenew = (item) => {
    // Not applicable for finished orders in this screen
    console.log("Renew:", item);
  };

  const handleReport = (item) => {
    // TODO: Navigate to report screen
    console.log("Report:", item);
  };

  const handleCloseFeedbackModal = (success) => {
    setFeedbackModalVisible(false);
    setSelectedCourseForFeedback(null);
    
    if (success) {
      // Refresh the reviews after successful feedback
      if (activeTab === "course") {
        fetchCourseReviews(1, false);
      } else {
        fetchProductReviews(1, false);
      }
    }
  };

  const handleProductRefresh = () => {
    fetchProductReviews(1, false);
  };

  const handleCoursePress = (item) => {
    // Navigate to appropriate detail screen based on course type
    if (item.courseType === "freelancePT" && item.freelancePTPackageId) {
      // Navigate to Freelance PT Package Detail Screen
      navigation.navigate("FreelancePTPackageDetailScreen", {
        packageId: item.freelancePTPackageId,
        freelancePTPackageId: item.freelancePTPackageId,
      });
    } else if (item.courseType === "gym" && item.gymCourseId) {
      // For gym courses, navigate to Gym Detail Screen with gymId
      const gymId = item.gymCourse?.gymOwnerId || item.orderItem?.gymCourse?.gymOwnerId;
      if (gymId) {
        navigation.navigate("GymDetailScreen", { gymId });
      } else {
        console.warn("Gym ID not found for gym course:", item);
      }
    }
  };

  const renderReviewItem = ({ item }) => {
    if (activeTab === "course") {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleCoursePress(item)}
        >
          <PackageCard
            item={item}
            onRenew={handleRenew}
            onReport={handleReport}
            onFeedback={handleFeedback}
            t={t}
          />
        </TouchableOpacity>
      );
    }

    // Product order card (for orders that need feedback)
    return (
      <OrderManagementCard 
        order={item} 
        onRefresh={handleProductRefresh}
      />
    );
  };

  const getCurrentReviews = () => {
    return activeTab === "product" ? productReviews : courseReviews;
  };

  const hasMoreData = () => {
    return activeTab === "product"
      ? productPage < productTotalPages
      : coursePage < courseTotalPages;
  };

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
          style={[styles.tab, activeTab === "course" && styles.activeTab]}
          onPress={() => setActiveTab("course")}
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
              activeTab === "course" && styles.activeTabText,
            ]}
          >
            {t("myPackage.package") || "Course"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && getCurrentReviews().length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentReviews()}
          renderItem={renderReviewItem}
          keyExtractor={(item, index) => `${activeTab}-review-${item.id || index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ED2A46"]}
              tintColor="#ED2A46"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (
              (activeTab === "product" && productLoading) ||
              (activeTab === "course" && courseLoading)
            ) {
              return (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#ED2A46" />
                </View>
              );
            }
            return null;
          }}>
        </FlatList>
      )}

      {/* Feedback Modal for Courses */}
      <PackageFeedbackModal
        visible={feedbackModalVisible}
        onClose={handleCloseFeedbackModal}
        packageItem={selectedCourseForFeedback}
      />
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
