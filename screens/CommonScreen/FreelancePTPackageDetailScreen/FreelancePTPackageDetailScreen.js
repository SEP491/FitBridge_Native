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

const { width } = Dimensions.get("window");

export default function FreelancePTPackageDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addToCart, isPackageInCart } = useCart();
  
  const [packageData, setPackageData] = useState(null);
  const [ptData, setPtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get packageId from route params
  const packageId = route.params?.packageId || route.params?.package?.id;

  useEffect(() => {
    if (packageId) {
      fetchPackageDetail();
    } else {
      showAlert(t("error.title") || "Error", t("error.noPackageId") || "No package ID provided");
      navigation.goBack();
    }
  }, [packageId]);

  const fetchPackageDetail = async () => {
    try {
      setLoading(true);
      const response = await freelancePTPackageService.getFreelancePTPackageById(packageId);
      
      if (response.status === "200" && response.data) {
        setPackageData(response.data);
        console.log("Fetched package data:", response.data);
        
        // Fetch PT details if ptId exists
        if (response.data.ptId) {
          fetchPTDetail(response.data.ptId);
        }
      } else {
        showAlert(t("error.title") || "Error", t("error.failedToLoadPackage") || "Failed to load package details");
      }
    } catch (error) {
      console.error("Error fetching package detail:", error);
      showAlert(t("error.title") || "Error", t("error.failedToLoadPackage") || "Failed to load package details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPTDetail = async (ptId) => {
    try {
      const response = await ptService.getPTDetail(ptId);
      if (response.status === "200" && response.data) {
        setPtData(response.data);
      }
    } catch (error) {
      console.error("Error fetching PT detail:", error);
      // Don't show error for PT fetch, it's optional
    }
  };

  const handleAddToCart = async () => {
    if (!packageData) return;

    // Check if already in cart
    const inCart = isPackageInCart(null, packageData.id);
    if (inCart) {
      showAlert(
        t("cart.alreadyInCart") || "Already in Cart",
        t("cart.packageAlreadyAdded") || "This package is already in your cart"
      );
      return;
    }

    try {
      setAddingToCart(true);
      
      // Prepare cart item data
      const cartItem = {
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
        pt: ptData ? {
          id: ptData.id,
          fullName: ptData.fullName,
          avatar: ptData.avatar,
          gender: ptData.gender,
          goalTraining: ptData.goalTraining,
        } : null,
      };

      addToCart(cartItem);
      
      showAlert(
        t("cart.success") || "Success",
        t("cart.packageAddedToCart") || "Package added to cart successfully",
        [
          {
            text: t("cart.continueShopping") || "Continue",
            style: "cancel",
          },
          {
            text: t("cart.viewCart") || "View Cart",
            onPress: () => navigation.navigate("CartScreen"),
          },
        ]
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      showAlert(t("error.title") || "Error", t("error.failedToAddToCart") || "Failed to add package to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>{t("common.loading") || "Loading..."}</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{t("common.goBack") || "Go Back"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("freelancePT.packageDetail") || "Package Details"}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Package Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                packageData.imageUrl && packageData.imageUrl !== 'string'
                  ? packageData.imageUrl
                  : "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
        </View>

        {/* Package Content */}
        <View style={styles.contentContainer}>
          {/* Package Name */}
          <Text style={styles.packageName}>{packageData.name}</Text>

          {/* PT Information Card */}
          {ptData && (
            <TouchableOpacity 
              style={styles.ptCard}
              onPress={() => navigation.navigate("PTProfileScreen", { ptId: ptData.id })}
              activeOpacity={0.7}
            >
              <Image
                source={{
                  uri: ptData.avatar || "https://via.placeholder.com/60",
                }}
                style={styles.ptAvatar}
              />
              <View style={styles.ptInfo}>
                <Text style={styles.ptLabel}>{t("freelancePT.trainer") || "Personal Trainer"}</Text>
                <Text style={styles.ptName}>{ptData.fullName}</Text>
                {ptData.goalTraining && (
                  <Text style={styles.ptGoal} numberOfLines={1}>
                    {ptData.goalTraining}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6B6B6B" />
            </TouchableOpacity>
          )}

          {/* Package Description */}
          {packageData.description && (
            <Text style={styles.packageDescription}>{packageData.description}</Text>
          )}

          {/* Package Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#ED2A46" />
              </View>
              <Text style={styles.detailLabel}>{t("freelancePT.duration") || "Duration"}</Text>
              <Text style={styles.detailValue}>
                {packageData.durationInDays} {t("freelancePT.days") || "days"}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="barbell-outline" size={24} color="#ED2A46" />
              </View>
              <Text style={styles.detailLabel}>{t("freelancePT.sessions") || "Sessions"}</Text>
              <Text style={styles.detailValue}>
                {packageData.numOfSessions} {t("freelancePT.sessions") || "sessions"}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={24} color="#ED2A46" />
              </View>
              <Text style={styles.detailLabel}>{t("freelancePT.perSession") || "Per Session"}</Text>
              <Text style={styles.detailValue}>
                {packageData.sessionDurationInMinutes} {t("freelancePT.minutes") || "min"}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#ED2A46" />
              </View>
              <Text style={styles.detailLabel}>{t("freelancePT.price") || "Price"}</Text>
              <Text style={styles.detailValuePrice}>
                {formatPrice(packageData.price)}
              </Text>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{t("freelancePT.whatYouGet") || "What You Get"}</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {packageData.numOfSessions} {t("freelancePT.personalTrainingSessions") || "personal training sessions"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {t("freelancePT.validFor") || "Valid for"} {packageData.durationInDays} {t("freelancePT.days") || "days"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {t("freelancePT.flexibleScheduling") || "Flexible scheduling"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {t("freelancePT.personalizedTraining") || "Personalized training plan"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>{t("freelancePT.totalPrice") || "Total Price"}</Text>
          <Text style={styles.priceValue}>{formatPrice(packageData.price)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#FFF" />
              <Text style={styles.addToCartText}>
                {t("freelancePT.addToCart") || "Add to Cart"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: {
    marginTop: 24,
    backgroundColor: "#ED2A46",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: 300,
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
    height: 100,
  },
  contentContainer: {
    padding: 20,
  },
  packageName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 16,
    color: "#6B6B6B",
    lineHeight: 24,
    marginBottom: 24,
  },
  ptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  ptAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E5E5",
  },
  ptInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ptLabel: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 4,
  },
  ptName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  ptGoal: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "500",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  detailCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  detailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  detailValuePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  infoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#6B6B6B",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  addToCartButton: {
    backgroundColor: "#ED2A46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  addToCartText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
