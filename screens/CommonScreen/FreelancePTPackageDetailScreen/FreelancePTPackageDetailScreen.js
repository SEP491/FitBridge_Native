import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import freelancePTPackageService from "../../../services/freelancePTPackageService";
import ptService from "../../../services/ptService";
import { useTranslation } from "../../../hooks/useTranslation";
import { showAlert, formatPrice } from "../../../lib";
import { useCart } from "../../../context/CartContext";
import reviewService from "../../../services/reviewService";
import ReviewCard from "../../../components/ReviewCard/ReviewCard";

const { width } = Dimensions.get("window");

export default function FreelancePTPackageDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [ptData, setPtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get packageId from route params
  const packageId =
    route.params?.packageId || route.params?.freelancePTPackageId;
  const purchasedPackage = route.params?.purchasedPackage || null;
  console.log("Purchased Package:", purchasedPackage);
  useEffect(() => {
    if (packageId) {
      fetchPackageDetail();
      fetchPackageReview();
    } else {
      showAlert(
        t("error.title") || "Error",
        t("error.noPackageId") || "No package ID provided"
      );
      navigation.goBack();
    }
  }, [packageId]);

  const fetchPackageDetail = async () => {
    try {
      setLoading(true);
      const response =
        await freelancePTPackageService.getFreelancePTPackageById(packageId);

      if (response.status === "200" && response.data) {
        setPackageData(response.data);
        console.log("Fetched package data:", response.data);
      } else {
        showAlert(
          t("error.title") || "Error",
          t("error.failedToLoadPackage") || "Failed to load package details"
        );
      }
    } catch (error) {
      console.error("Error fetching package detail:", error);
      showAlert(
        t("error.title") || "Error",
        t("error.failedToLoadPackage") || "Failed to load package details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageReview = async (pageNum = 1) => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getItemReviewsById({
        freelancePtCourseId: packageId,
        pageNumber: pageNum,
        pageSize: 10,
      });
      
      if (response.data) {
        if (pageNum === 1) {
          setReviews(response.data.items || []);
        } else {
          setReviews(prev => [...prev, ...(response.data.items || [])]);
        }
        setReviewsPage(pageNum);
        setReviewsTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching package reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!packageData) return;

    try {
      setAddingToCart(true);

      // Prepare order item data for direct purchase
      const orderItem = {
        id: packageData.id,
        name: packageData.name,
        price: packageData.price,
        type: "FreelancePT",
        gymId: null, // Freelance PT has no gym
        gymName: null,
        gymAddress: null,
        gymImage: null,
        // Package details
        durationInDays: packageData.durationInDays,
        sessionDurationInMinutes: packageData.sessionDurationInMinutes,
        numOfSessions: packageData.numOfSessions,
        description: packageData.description,
        imageUrl: packageData.imageUrl,
        // Freelance PT info
        pt: ptData
          ? {
              id: ptData.id,
              fullName: ptData.fullName,
              avatar: ptData.avatar,
              gender: ptData.gender,
              goalTraining: ptData.goalTraining,
            }
          : null,
      };

      // Navigate directly to payment screen with the package data
      navigation.navigate("PaymentScreen", {
        items: [orderItem],
        totalAmount: packageData.price,
        fromDirectPurchase: true,
      });
    } catch (error) {
      console.error("Error proceeding to payment:", error);
      showAlert(
        t("error.title") || "Error",
        t("error.failedToProceed") || "Failed to proceed to payment"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>
            {t("common.loading") || "Loading..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!packageData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ED2A46" />
          <Text style={styles.errorText}>
            {t("error.packageNotFound") || "Package not found"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>
              {t("common.goBack") || "Go Back"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image with Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                packageData.imageUrl && packageData.imageUrl !== "string"
                  ? packageData.imageUrl
                  : "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageGradient}
          ></LinearGradient>
        </View>

        {/* Price Section - Compact Under Image */}
        <LinearGradient
          colors={["#FF6B6B", "#ED2A46"]}
          style={styles.priceSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.priceValue}>
            {formatPrice(packageData.price)}
          </Text>
          <Text style={styles.priceSubtext}>
            {formatPrice(
              Math.round(packageData.price / packageData.numOfSessions)
            )}{" "}
            {t("freelancePT.perSession") || "per session"}
          </Text>
        </LinearGradient>

        {/* Package Content */}
        <View style={styles.contentContainer}>
          {/* Package Name with Icon */}
          <View style={styles.packageHeader}>
            <View style={styles.packageTitleContainer}>
              <Text style={styles.packageNameTitle}>
                {t("freelancePT.packageName")}
              </Text>
              <Text style={styles.packageName}>
                {packageData.name || t("freelancePT.premiumPackage")}
              </Text>
            </View>
          </View>

          {/* Quick Stats Bar */}
          <View style={styles.quickStatsBar}>
            <View style={styles.quickStat}>
              <Ionicons name="calendar" size={18} color="#ED2A46" />
              <Text style={styles.quickStatText}>
                {packageData.durationInDays} {t("freelancePT.days") || "Days"}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Ionicons name="barbell" size={18} color="#ED2A46" />
              <Text style={styles.quickStatText}>
                {packageData.numOfSessions}{" "}
                {t("freelancePT.sessions") || "Sessions"}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Ionicons name="time" size={18} color="#ED2A46" />
              <Text style={styles.quickStatText}>
                {packageData.sessionDurationInMinutes}{" "}
                {t("freelancePT.minutes") || "Min"}
              </Text>
            </View>
          </View>

          {/* PT Information Card - Enhanced */}
          {ptData && (
            <TouchableOpacity
              style={styles.ptCard}
              onPress={() =>
                navigation.navigate("PTProfileScreen", { ptId: ptData.id })
              }
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#FFF5F6", "#FFFFFF"]}
                style={styles.ptCardGradient}
              >
                <View style={styles.ptAvatarContainer}>
                  <Image
                    source={{
                      uri: ptData.avatar || "https://via.placeholder.com/60",
                    }}
                    style={styles.ptAvatar}
                  />
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#4CAF50"
                    />
                  </View>
                </View>
                <View style={styles.ptInfo}>
                  <Text style={styles.ptLabel}>
                    👨‍🏫 {t("freelancePT.yourTrainer") || "YOUR TRAINER"}
                  </Text>
                  <Text style={styles.ptName}>{ptData.fullName}</Text>
                  {ptData.goalTraining && (
                    <View style={styles.ptGoalBadge}>
                      <Ionicons name="fitness" size={12} color="#ED2A46" />
                      <Text style={styles.ptGoal} numberOfLines={1}>
                        {ptData.goalTraining}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.ptArrow}>
                  <Ionicons name="chevron-forward" size={24} color="#ED2A46" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Package Description with styling */}
          {packageData.description && (
            <View style={styles.descriptionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text" size={20} color="#ED2A46" />
                <Text style={styles.sectionTitle}>
                  {t("freelancePT.aboutThisPackage") || "About This Package"}
                </Text>
              </View>
              <Text style={styles.packageDescription}>
                {packageData.description}
              </Text>
            </View>
          )}

          {/* Value Proposition - What You Get */}
          <View style={styles.valueSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="gift" size={20} color="#ED2A46" />
              <Text style={styles.sectionTitle}>
                {t("freelancePT.whatYouGet") || "What You Get"}
              </Text>
            </View>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {packageData.numOfSessions}{" "}
                    {t("freelancePT.trainingSessionsCount") ||
                      "Personal Training Sessions"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.oneOnOneCoaching") ||
                      "One-on-one coaching with expert trainer"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {packageData.sessionDurationInMinutes}{" "}
                    {t("freelancePT.minutesPerSession") ||
                      "Minutes per Session"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.focusOnYourGoals") ||
                      "Focused sessions tailored to your goals"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {packageData.durationInDays}{" "}
                    {t("freelancePT.daysAccess") || "Days Access"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.flexibleSchedulingWithin") ||
                      "Flexible scheduling within validity period"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {t("freelancePT.customizedTrainingPlan") ||
                      "Customized Training Plan"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.tailoredToGoals") ||
                      "Tailored to your fitness goals and level"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {t("freelancePT.progressTracking") || "Progress Tracking"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.monitorImprovements") ||
                      "Monitor your improvements throughout"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {t("freelancePT.nutritionGuidance") || "Nutrition Guidance"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.basicDietaryTips") ||
                      "Basic dietary tips and recommendations"}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>
                    {t("freelancePT.chatSupport") || "24/7 Chat Support"}
                  </Text>
                  <Text style={styles.benefitSubtitle}>
                    {t("freelancePT.askQuestionsAnytime") ||
                      "Ask questions anytime via in-app messaging"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>
                {t("freelancePT.reviews") || "Reviews"}
                {reviews.length > 0 && ` (${reviews.length})`}
              </Text>
            </View>

            {reviews.length > 0 ? (
              <View>
                {reviews.map((review, index) => (
                  <ReviewCard
                    key={review.id || index}
                    review={review}
                    t={t}
                    showProductType={false}
                  />
                ))}

                {reviewsPage < reviewsTotalPages && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => fetchPackageReview(reviewsPage + 1)}
                    disabled={reviewsLoading}
                  >
                    {reviewsLoading ? (
                      <ActivityIndicator size="small" color="#ED2A46" />
                    ) : (
                      <>
                        <Text style={styles.loadMoreText}>
                          {t("common.loadMore") || "Load More"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#ED2A46" />
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.reviewsEmpty}>
                <Ionicons name="chatbox-ellipses-outline" size={48} color="#E0E0E0" />
                <Text style={styles.reviewsEmptyText}>
                  {t("freelancePT.noReviews") || "No reviews yet"}
                </Text>
                <Text style={styles.reviewsEmptySubtext}>
                  {t("freelancePT.beFirstToReview") || "Be the first to share your experience with this package"}
                </Text>
              </View>
            )}
          </View>

          {/* Trust Signals */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={28} color="#4CAF50" />
              <Text style={styles.trustText}>
                {t("freelancePT.moneyBackGuarantee") || "Money-Back Guarantee"}
              </Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="calendar-outline" size={28} color="#4CAF50" />
              <Text style={styles.trustText}>
                {t("freelancePT.flexibleRescheduling") ||
                  "Flexible Rescheduling"}
              </Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="star" size={28} color="#FFD700" />
              <Text style={styles.trustText}>
                {t("freelancePT.topRatedTrainer") || "Top-Rated Trainer"}
              </Text>
            </View>
          </View>

          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar - Compact */}
      {!purchasedPackage ? (
        <View style={styles.bottomBar}>
          <View style={styles.priceInfoContainer}>
            <Text style={styles.bottomPriceLabel}>
              {t("freelancePT.totalInvestment") || "TOTAL INVESTMENT"}
            </Text>
            <Text style={styles.bottomPriceValue}>
              {formatPrice(packageData.price)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.buyNowButton,
              addingToCart && styles.buyNowButtonDisabled,
            ]}
            onPress={handleBuyNow}
            disabled={addingToCart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                addingToCart ? ["#CCCCCC", "#CCCCCC"] : ["#ED2A46", "#FF6B6B"]
              }
              style={styles.buyNowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {addingToCart ? (
                <Text style={styles.buyNowText}>
                  {t("common.loading") || "Loading..."}
                </Text>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#FFF" />
                  <Text style={styles.buyNowText}>
                    {t("freelancePT.buyNow") || "BUY NOW"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.purchasedBottomBar}>
          <View style={styles.purchasedNotification}>
            <View style={styles.purchasedIconContainer}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
            <View style={styles.purchasedContent}>
              <Text style={styles.purchasedTitle}>
                {t("freelancePT.alreadyPurchased") ||
                  "You Already Have a Package"}
              </Text>
              <Text style={styles.purchasedPackageName} numberOfLines={1}>
                {purchasedPackage.name}
              </Text>
              {purchasedPackage.description && (
                <Text style={styles.purchasedDescription} numberOfLines={2}>
                  {purchasedPackage.description}
                </Text>
              )}
              <View style={styles.purchasedWarning}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#FF9800"
                />
                <Text style={styles.purchasedWarningText}>
                  {t("freelancePT.completeCurrentPackage") ||
                    "Please complete your current package before purchasing a new one"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B6B6B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#6B6B6B",
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -65,
  },
  imageContainer: {
    width: width,
    height: 340,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  priceOnImageBadge: {
    width: "85%",
    maxWidth: 320,
  },
  priceBadgeGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  priceBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  priceBadgeValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  priceBadgeSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  contentContainer: {
    padding: 20,
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "flex-start",
    width: "100%",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  priceSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  packageIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageTitleContainer: {
    flex: 1,
  },
  packageNameTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6B6B",
    marginBottom: 4,
    letterSpacing: 1,
  },
  packageName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 32,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF6B6B",
    letterSpacing: 0.5,
  },
  quickStatsBar: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickStatText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  descriptionContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  packageDescription: {
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 24,
  },
  ptCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ptCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderWidth: 2,
    borderColor: "#FFE0E3",
    borderRadius: 20,
  },
  ptAvatarContainer: {
    position: "relative",
  },
  ptAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E5E5E5",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    elevation: 2,
  },
  ptInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ptLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ED2A46",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  ptName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  ptGoalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  ptGoal: {
    fontSize: 12,
    color: "#ED2A46",
    fontWeight: "600",
  },
  ptArrow: {
    marginLeft: 8,
  },
  valueSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitIconContainer: {
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  benefitSubtitle: {
    fontSize: 13,
    color: "#6B6B6B",
    lineHeight: 18,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8FFF9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  trustItem: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
    textAlign: "center",
  },
  reviewsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  reviewsEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  reviewsEmptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  reviewsEmptySubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ED2A46",
    backgroundColor: "#FFFFFF",
    gap: 8,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  priceInfoContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B6B6B",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1A1A1A",
  },
  buyNowButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    minWidth: 140,
  },
  buyNowGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  buyNowButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buyNowText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  // Purchased Package Notification Styles
  purchasedBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: "#FF9800",
    elevation: 12,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  purchasedNotification: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  purchasedIconContainer: {
    marginTop: 2,
  },
  purchasedContent: {
    flex: 1,
  },
  purchasedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  purchasedPackageName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  purchasedDescription: {
    fontSize: 13,
    color: "#6B6B6B",
    lineHeight: 18,
    marginBottom: 10,
  },
  purchasedWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
    gap: 8,
  },
  purchasedWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#E65100",
    lineHeight: 16,
    fontWeight: "600",
  },
});
