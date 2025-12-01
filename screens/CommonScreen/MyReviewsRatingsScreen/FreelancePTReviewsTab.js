import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import orderService from "../../../services/orderService";
import PackageCard from "../../../components/PackageCard/PackageCard";
import PackageFeedbackModal from "../../../components/OrderManagementCard/PackageFeedbackModal";

export default function FreelancePTReviewsTab() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [courseReviews, setCourseReviews] = useState([]);
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCourseForFeedback, setSelectedCourseForFeedback] =
    useState(null);

  const fetchFreelancePTCoursesReviews = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setCourseLoading(true);

      const response = await orderService.getCourseOrder({
        page: pageNum,
        size: 10,
        sortOrder: "dsc",
        isFreelancePtCourse: true,
      });

      const orders = response.data?.items || [];
      const totalPages = response.data?.totalPages || 1;

      const courseItems = orders
        .filter((order) => order.status === "Finished")
        .flatMap((order) =>
          order.orderItems.map((item) => {
            const gymCourse = item.gymCourse;
            const freelancePTPackage = item.freelancePTPackage;

            // Prefer API package name when productName is null (as in the sample response)
            const displayName =
              item.productName ||
              freelancePTPackage?.name ||
              gymCourse?.name ||
              "";

            return {
              id: item.id,
              orderId: order.id,
              packageName: displayName,
              courseName: displayName,
              type: "freelancePT",
              courseType: "freelancePT",
              gymCourseId: item.gymCourseId,
              freelancePTPackageId: item.freelancePTPackageId,
              isFeedback: item.isFeedback,
              hasReviewed: item.isFeedback,
              price: item.price,
              courseImageUrl:
                freelancePTPackage?.imageUrl || gymCourse?.imageUrl,
              imageUrl: freelancePTPackage?.imageUrl || gymCourse?.imageUrl,
              ptName:
                freelancePTPackage?.ptName ||
                freelancePTPackage?.pt?.fullName ||
                gymCourse?.ptName ||
                gymCourse?.pt?.fullName ||
                null,
              // Use numOfSessions from freelancePTPackage for total sessions
              availableSessions:
                freelancePTPackage?.numOfSessions ||
                freelancePTPackage?.session ||
                gymCourse?.session ||
                0,
              expirationDate: order.createdAt,
              createdAt: order.createdAt,
              gymCourse: gymCourse,
              freelancePTPackage: freelancePTPackage,
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
      console.error("Error fetching freelance PT course reviews:", error);
    } finally {
      setLoading(false);
      setCourseLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancePTCoursesReviews();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFreelancePTCoursesReviews(1, false);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFreelancePTCoursesReviews(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (coursePage < courseTotalPages && !courseLoading) {
      fetchFreelancePTCoursesReviews(coursePage + 1, true);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="person-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>
        {t("myPackage.noReviewsYet") || "No Course Reviews Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {t("myPackage.reviewCoursesMessage") ||
          "Your course reviews will appear here"}
      </Text>
    </View>
  );

  const handleFeedback = (item) => {
    const packageForFeedback = {
      ...item,
      orderItem: item.orderItem || item,
    };
    setSelectedCourseForFeedback(packageForFeedback);
    setFeedbackModalVisible(true);
  };

  const handleRenew = (item) => {
    console.log("Renew:", item);
  };

  const handleReport = (item) => {
    console.log("Report:", item);
  };

  const handleCloseFeedbackModal = (success) => {
    setFeedbackModalVisible(false);
    setSelectedCourseForFeedback(null);

    if (success) {
      fetchFreelancePTCoursesReviews(1, false);
    }
  };

  const handleCoursePress = (item) => {
    if (item.courseType === "freelancePT" && item.freelancePTPackageId) {
      navigation.navigate("FreelancePTPackageDetailScreen", {
        packageId: item.freelancePTPackageId,
        freelancePTPackageId: item.freelancePTPackageId,
      });
    } else if (item.courseType === "gym" && item.gymCourseId) {
      const gymId =
        item.gymCourse?.gymOwnerId || item.orderItem?.gymCourse?.gymOwnerId;
      if (gymId) {
        navigation.navigate("GymDetailScreen", { gymId });
      } else {
        console.warn("Gym ID not found for gym course:", item);
      }
    }
  };

  if (loading && courseReviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED2A46" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={courseReviews}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCoursePress(item)}
            key={`freelance-review-${item.id || index}`}
          >
            <PackageCard
              item={item}
              onFeedback={handleFeedback}
              t={t}
              mode="review"
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `freelance-review-${item.id || index}`}
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
          if (courseLoading) {
            return (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#ED2A46" />
              </View>
            );
          }
          return null;
        }}
      />

      <PackageFeedbackModal
        visible={feedbackModalVisible}
        onClose={handleCloseFeedbackModal}
        packageItem={selectedCourseForFeedback}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    flexGrow: 1,
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


