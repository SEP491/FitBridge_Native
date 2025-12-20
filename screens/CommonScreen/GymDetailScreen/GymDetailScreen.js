import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import CarouselNative from "../../../components/Carousel/Carousel";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PackageSelectionBottomSheet from "../../../components/PackageSelectionBottomSheet/PackageSelectionBottomSheet";
import { LinearGradient } from "expo-linear-gradient";
const { width } = Dimensions.get("window");
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import gymService from "../../../services/gymService";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCart } from "../../../context/CartContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatPrice, formatNumber } from "../../../lib";
import LoadingIndicator from "../../../components/LoadingIndicator";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";

export default function GymDetailScreen({ route }) {
  const { t } = useTranslation();
  const { gymId } = route.params;
  const [packageSelectionVisible, setPackageSelectionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [gymDetail, setGymDetail] = useState({});
  const [gymCourse, setGymCourse] = useState([]);
  const [lowestPackage, setLowestPackage] = useState(null);
  const { cart, addToCart, getCartCount } = useCart();
  const navigation = useNavigation();

  // Comment-related states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchGymDetail = async () => {
      setLoading(true);
      try {
        const response = await gymService.getGymById(gymId);
        console.log(response.data);
        console.log(response.data.gymImages);
        setGymDetail(response.data);
      } catch (error) {
        console.error("Error fetching gym detail:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourseGym = async () => {
      try {
        const response = await gymService.getCourseByGymId(gymId);
        console.log("Course by Gym ID response:", response.data);
        const { items, total, page: currentPage } = response.data;

        const lowestPackage =
          items.length > 0 ? Math.min(...items.map((item) => item.price)) : 0;
        setLowestPackage(lowestPackage);
        const courseFiltered = {
          packageNormal: items
            .filter((item) => item.type === "Normal")
            .sort((a, b) => a.price - b.price),
          packagePT: items
            .filter((item) => item.type === "WithPt")
            .sort((a, b) => a.price - b.price),
        };
        setGymCourse(courseFiltered);
      } catch (error) {
        console.error("Error fetching course gym:", error);
      }
    };

    fetchGymDetail();
    fetchCourseGym();
    // fetchComments();
  }, [gymId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response1 = await gymService.getGymById(gymId);
      setGymDetail(response1.data);

      const response2 = await gymService.getCourseByGymId(gymId);
      const { items } = response2.data;
      const lowestPackage =
        items.length > 0 ? Math.min(...items.map((item) => item.price)) : 0;
      setLowestPackage(lowestPackage);
      const courseFiltered = {
        packageNormal: items
          .filter((item) => item.type === "Normal")
          .sort((a, b) => a.price - b.price),
        packagePT: items
          .filter((item) => item.type === "WithPt")
          .sort((a, b) => a.price - b.price),
      };
      setGymCourse(courseFiltered);
    } catch (error) {
      console.error("Error refreshing gym data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch comments function
  const fetchComments = async (page = 1, reset = false) => {
    setCommentsLoading(true);
    try {
      const response = await gymService.getCommentsByGymId(gymId, {
        page,
        size: 3,
      });

      const { items, totalPages } = response.data;

      if (reset || page === 1) {
        setComments(items);
      } else {
        setComments((prevComments) => [...prevComments, ...items]);
      }

      setCommentsPage(page);
      setHasMoreComments(page < totalPages);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert(t("gymDetail.error"), t("gymDetail.errorLoadingComments"));
    } finally {
      setCommentsLoading(false);
    }
  };

  // Post comment function
  const handlePostComment = async () => {
    // Check if user is logged in
    const userData = await fetchUserFromStorage();
    if (!userData) {
      Alert.alert(t("auth.loginRequired"), t("auth.pleaseLoginToContinue"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("navigation.login"),
          onPress: () =>
            navigation.navigate(t("navigation.login"), { screen: "Login" }),
        },
      ]);
      return;
    }

    if (!newComment.trim()) {
      Alert.alert(t("gymDetail.error"), t("gymDetail.enterCommentContent"));
      return;
    }

    setIsPostingComment(true);
    try {
      await gymService.postComment(gymId, {
        content: newComment.trim(),
      });

      setNewComment("");
      Alert.alert(t("common.success"), t("gymDetail.commentSuccess"));

      // Refresh comments
      // fetchComments(1, true);
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert(t("gymDetail.error"), t("gymDetail.errorPostingComment"));
    } finally {
      setIsPostingComment(false);
    }
  };

  // Load more comments
  const handleLoadMoreComments = () => {
    if (!commentsLoading && hasMoreComments) {
      // fetchComments(commentsPage + 1);
    }
  };

  if (loading) {
    return <LoadingIndicator variant="page" message={t("gymDetail.loading")} />;
  }
  if (!gymId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("gymDetail.notFound")}</Text>
      </View>
    );
  }
  // Check if package is already in the cart
  const isPackageInCart = (packageId) => {
    return cart.some(
      (item) => item.id === packageId && item.gymId === gymDetail.id
    );
  };

  // Handle adding package to cart
  const handleAddToCart = (packageGym) => {
    getCartCount();

    // if (getCartCount() > 0) {
    //   Alert.alert(t("gymDetail.cartAlert"), t("gymDetail.viewCart") + "?", [
    //     {
    //       text: t("gymDetail.no"),
    //       style: "cancel",
    //     },
    //     {
    //       text: t("gymDetail.viewCart"),
    //       onPress: () => navigation.navigate("CartScreen"),
    //     },
    //   ]);
    //   return;
    // } else {
    console.log("Gym Detail:", gymDetail);
    const gymPackage = {
      gymId: gymDetail.id,
      gymName: gymDetail.gymName,
      gymAddress: gymDetail.gymAddress,
      gymImage:
        packageGym.image ||
        gymDetail?.gymImages[0]?.url ||
        "https://levelfyc.com/wp-content/uploads/2024/08/khong-gian-4.jpg",
      id: packageGym.id,
      name: packageGym.name,
      type: packageGym.type,
      price: packageGym.price,
    };

    addToCart(gymPackage);

    Alert.alert(
      t("gymDetail.addToCartSuccess"),
      t("gymDetail.addedPackageToCart", {
        packageName: packageGym.name,
        gymName: gymDetail.gymName,
      }),
      [{ text: t("gymDetail.ok") }]
    );
    // }
  };

  const handleAddToCartWithPT = (packageGym) => {
    const gymPackage = {
      gymId: gymDetail.id,
      gymName: gymDetail.gymName,
      gymAddress: gymDetail.gymAddress,
      gymImage:
        gymDetail?.gymImages[0] ||
        "https://levelfyc.com/wp-content/uploads/2024/08/khong-gian-4.jpg",
      id: packageGym.id,
      name: packageGym.name,
      type: packageGym.type,
      price: (packageGym.price || 0) + (packageGym.ptPrice || 0),
      ptPrice: packageGym.ptPrice || 0,
    };

    navigation.navigate("PTinCourseScreen", { gymPackage: gymPackage });
    setPackageSelectionVisible(false);
  };

  // Since the API doesn't return ratings in comments, we'll use a default rating
  const averageRating = 4.5; // You can make this dynamic based on your requirements
  const totalReviews = comments.length;

  return (
    <View style={styles.container}>
      {/* Cart Icon */}
      <View style={styles.cartIconContainer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("CartScreen")}
        >
          <Ionicons name="bag-outline" size={24} color="#ED2A46" />
          {getCartCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Enhanced Carousel with Overlay */}
          <View style={styles.carouselContainer}>
            <CarouselNative
              width={width}
              height={350}
              autoPlay={true}
              scrollAnimationDuration={1000}
              style={styles.carousel}
              data={
                gymDetail?.gymImages || [
                  "https://levelfyc.com/wp-content/uploads/2024/08/khong-gian-4.jpg",
                ]
              }
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.carouselOverlay}
            />
          </View>

          {/* Enhanced Main Card */}
          <View style={styles.cardDetail}>
            <View style={styles.headerSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.gymName}>{gymDetail?.gymName}</Text>
                {gymDetail.hotResearch && (
                  <View style={styles.hotBadge}>
                    <FontAwesome6 name="fire" size={14} color="#FFF" />
                    <Text style={styles.hotText}>HOT</Text>
                  </View>
                )}
              </View>

              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.gymAddress}>{gymDetail?.gymAddress}</Text>
              </View>

              <View style={styles.priceRatingContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>{t("gymDetail.from")}</Text>
                  <Text style={styles.gymStartPrice}>
                    {formatPrice(lowestPackage)}
                  </Text>
                  <Text style={styles.priceUnit}>
                    {t("gymDetail.perMonth")}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {formatNumber(averageRating.toFixed(1))}
                  </Text>
                  <Text style={styles.reviewCount}>({totalReviews})</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.navigate("PTInGymScreen", { gymId })}
              >
                <MaterialIcons
                  name="fitness-center"
                  size={20}
                  color="#ED2A46"
                />
                <Text style={styles.secondaryButtonText}>
                  {t("gymDetail.trainerList")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => setPackageSelectionVisible(true)}
              >
                <Ionicons name="list-outline" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>
                  {t("gymDetail.packages")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced Description Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#ED2A46"
                />
                <Text style={styles.sectionTitle}>
                  {t("gymDetail.description")}
                </Text>
              </View>
              <Text style={styles.descriptionText}>
                {gymDetail?.gymDescription ||
                  "No description available for this gym."}
              </Text>
            </View>

            {/* Gym Equipment Section */}
            {gymDetail?.gymAssets &&
              gymDetail.gymAssets.filter((a) => a.assetType === "Equipment")
                .length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons
                      name="fitness-center"
                      size={20}
                      color="#ED2A46"
                    />
                    <Text style={styles.sectionTitle}>
                      {t("gymDetail.equipment") || "Equipment"}
                    </Text>
                    <View style={styles.equipmentCountBadge}>
                      <Text style={styles.equipmentCountText}>
                        {
                          gymDetail.gymAssets.filter(
                            (a) => a.assetType === "Equipment"
                          ).length
                        }
                      </Text>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.assetsScrollContainer}
                  >
                    {gymDetail.gymAssets
                      .filter((a) => a.assetType === "Equipment")
                      .map((asset) => (
                        <View key={asset.id} style={styles.assetCard}>
                          <Image
                            source={{
                              uri:
                                asset.imageUrls &&
                                asset.imageUrls.length > 0 &&
                                !asset.imageUrls[0].includes("placeholder")
                                  ? asset.imageUrls[0]
                                  : "https://cdn-icons-png.flaticon.com/512/2548/2548530.png",
                            }}
                            style={styles.assetImage}
                            resizeMode="cover"
                          />
                          <View style={styles.assetInfo}>
                            <Text style={styles.assetName} numberOfLines={2}>
                              {asset.assetName}
                            </Text>
                            <View style={styles.assetCategoryBadge}>
                              <Text style={styles.assetCategoryText}>
                                {asset.equipmentCategory}
                              </Text>
                            </View>
                            <View style={styles.assetQuantityRow}>
                              <Ionicons
                                name="layers-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.assetQuantity}>
                                {t("gymDetail.quantity") || "Qty"}:{" "}
                                {asset.quantity}
                              </Text>
                            </View>
                            {asset.targetMuscularGroups &&
                              asset.targetMuscularGroups.length > 0 && (
                                <View style={styles.muscleGroupsContainer}>
                                  {asset.targetMuscularGroups
                                    .slice(0, 3)
                                    .map((muscle, index) => (
                                      <View
                                        key={index}
                                        style={styles.muscleTag}
                                      >
                                        <Text style={styles.muscleTagText}>
                                          {muscle}
                                        </Text>
                                      </View>
                                    ))}
                                  {asset.targetMuscularGroups.length > 3 && (
                                    <View style={styles.muscleTagMore}>
                                      <Text style={styles.muscleTagMoreText}>
                                        +{asset.targetMuscularGroups.length - 3}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}
                          </View>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}

            {/* Gym Facilities Section */}
            {gymDetail?.gymAssets &&
              gymDetail.gymAssets.filter((a) => a.assetType === "Facility")
                .length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#ED2A46"
                    />
                    <Text style={styles.sectionTitle}>
                      {t("gymDetail.facilities") || "Facilities"}
                    </Text>
                    <View style={styles.equipmentCountBadge}>
                      <Text style={styles.equipmentCountText}>
                        {
                          gymDetail.gymAssets.filter(
                            (a) => a.assetType === "Facility"
                          ).length
                        }
                      </Text>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.assetsScrollContainer}
                  >
                    {gymDetail.gymAssets
                      .filter((a) => a.assetType === "Facility")
                      .map((asset) => (
                        <View key={asset.id} style={styles.facilityCard}>
                          <Image
                            source={{
                              uri:
                                asset.imageUrls &&
                                asset.imageUrls.length > 0 &&
                                !asset.imageUrls[0].includes("placeholder")
                                  ? asset.imageUrls[0]
                                  : "https://cdn-icons-png.flaticon.com/512/3656/3656988.png",
                            }}
                            style={styles.facilityImage}
                            resizeMode="cover"
                          />
                          <View style={styles.facilityInfo}>
                            <Text style={styles.facilityName} numberOfLines={2}>
                              {asset.assetName}
                            </Text>
                            <Text
                              style={styles.facilityDescription}
                              numberOfLines={3}
                            >
                              {asset.description}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}

            {/* Enhanced Map Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="map-outline" size={20} color="#ED2A46" />
                <Text style={styles.sectionTitle}>
                  {t("gymDetail.location")}
                </Text>
              </View>

              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    longitude: gymDetail?.longitude || 106.6297,
                    latitude: gymDetail?.latitude || 10.8231,
                    longitudeDelta: 0.01,
                    latitudeDelta: 0.01,
                  }}
                  showsPointsOfInterest={false}
                  zoomEnabled={false}
                  scrollEnabled={false}
                >
                  <Marker
                    coordinate={{
                      longitude: gymDetail?.longitude,
                      latitude: gymDetail?.latitude,
                    }}
                    onPress={() => {
                      navigation.navigate("MapStack", {
                        screen: "MapScreen",
                        params: {
                          longitude: gymDetail?.longitude,
                          latitude: gymDetail?.latitude,
                        },
                      });
                    }}
                    tracksViewChanges={true}
                  >
                    <View style={styles.markerContainer}>
                      <Image
                        source={require("../../../assets/images/LogoColor.png")}
                        style={styles.markerImage}
                      />
                      {gymDetail.hotResearch && (
                        <FontAwesome6 name="fire" size={20} color="#ED2A46" />
                      )}
                    </View>
                  </Marker>
                </MapView>
                <TouchableOpacity
                  style={styles.mapOverlay}
                  onPress={() => {
                    navigation.navigate("MapScreen", {
                      params: {
                        longitude: gymDetail?.longitude,
                        latitude: gymDetail?.latitude,
                      },
                    });
                  }}
                >
                  <Text style={styles.mapOverlayText}>
                    {t("gymDetail.viewFullMap")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Enhanced Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color="#ED2A46" />
              <Text style={styles.sectionTitle}>
                {t("gymDetail.commentsReviews")}
              </Text>
            </View>

            {/* Comment Input Section */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder={t("gymDetail.writeComment")}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.postCommentButton,
                  !newComment.trim() && styles.postCommentButtonDisabled,
                ]}
                onPress={handlePostComment}
                disabled={isPostingComment || !newComment.trim()}
              >
                {isPostingComment ? (
                  <LoadingIndicator variant="button" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.reviewsContainer}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Image
                          source={{
                            uri:
                              comment.avatar ||
                              "https://static.vecteezy.com/system/resources/thumbnails/027/951/137/small_2x/stylish-spectacles-guy-3d-avatar-character-illustrations-png.png",
                          }}
                          style={styles.avatarImage}
                        />
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{comment.fullName}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(comment.createAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{comment.content}</Text>
                </View>
              ))}

              {/* Load More Button */}
              {hasMoreComments && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMoreComments}
                  disabled={commentsLoading}
                >
                  {commentsLoading ? (
                    <LoadingIndicator variant="inline" />
                  ) : (
                    <>
                      <Text style={styles.loadMoreText}>
                        {t("gymDetail.loadMoreComments")}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#ED2A46" />
                    </>
                  )}
                </TouchableOpacity>
              )}

              {comments.length === 0 && !commentsLoading && (
                <View style={styles.emptyCommentsContainer}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyCommentsText}>
                    {t("gymDetail.noComments")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Package Selection Bottom Sheet */}
      <PackageSelectionBottomSheet
        visible={packageSelectionVisible}
        onClose={() => setPackageSelectionVisible(false)}
        gymCourse={gymCourse}
        isPackageInCart={isPackageInCart}
        handleAddToCart={handleAddToCart}
        handleAddToCartWithPT={handleAddToCartWithPT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },

  // Cart Icon Styles
  cartIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },

  cartButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  cartBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  cartBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Carousel Styles
  carouselContainer: {
    position: "relative",
  },

  carousel: {
    width: "100%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },

  // Main Card Styles
  cardDetail: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: -20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 24,
    zIndex: 10,
  },

  headerSection: {
    marginBottom: 24,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  gymName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
  },

  hotBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED2A46",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },

  hotText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  gymAddress: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },

  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  priceLabel: {
    fontSize: 14,
    color: "#666",
  },

  gymStartPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ED2A46",
  },

  priceUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 2,
  },

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 4,
  },

  reviewCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },

  primaryButton: {
    backgroundColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#ED2A46",
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  secondaryButtonText: {
    color: "#ED2A46",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Section Styles
  sectionContainer: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 8,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },

  // Gym Assets/Equipment Styles
  assetsScrollContainer: {
    paddingRight: 16,
    gap: 12,
  },

  assetCard: {
    width: 160,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  assetImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E0E0E0",
  },

  assetInfo: {
    padding: 12,
  },

  assetName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
    minHeight: 36,
  },

  assetCategoryBadge: {
    backgroundColor: "#ED2A46",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },

  assetCategoryText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },

  assetQuantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  assetQuantity: {
    fontSize: 12,
    color: "#666",
  },

  muscleGroupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },

  muscleTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  muscleTagText: {
    fontSize: 9,
    color: "#388E3C",
    fontWeight: "500",
  },

  muscleTagMore: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  muscleTagMoreText: {
    fontSize: 9,
    color: "#F57C00",
    fontWeight: "500",
  },

  equipmentCountBadge: {
    backgroundColor: "#ED2A46",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },

  equipmentCountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Facility Card Styles
  facilityCard: {
    width: 200,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  facilityImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E0E0E0",
  },

  facilityInfo: {
    padding: 12,
  },

  facilityName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },

  facilityDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },

  // Map Styles
  mapContainer: {
    position: "relative",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    alignItems: "center",
  },

  mapOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },

  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  markerImage: {
    width: 50,
    height: 50,
  },

  // Reviews Section
  reviewsSection: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 100,
    borderRadius: 25,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  reviewsContainer: {
    gap: 16,
  },

  reviewCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  reviewDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },

  // Comment Input Styles
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
    gap: 12,
  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: "top",
    maxHeight: 100,
    backgroundColor: "#F8F9FA",
  },

  postCommentButton: {
    backgroundColor: "#ED2A46",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  postCommentButtonDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },

  // Updated Avatar Styles
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  // Load More Button Styles
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ED2A46",
    borderRadius: 25,
    marginTop: 16,
    gap: 8,
  },

  loadMoreText: {
    color: "#ED2A46",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty Comments Styles
  emptyCommentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyCommentsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
});
