import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";
import accountService from "../../../services/accountService";

// Body part images mapping
const bodyPartImages = {
  shoulder: require("../../../assets/images/bodyparts/shoulder.png"),
  biceps: require("../../../assets/images/bodyparts/biceps.png"),
  calf: require("../../../assets/images/bodyparts/calf.png"),
  chest: require("../../../assets/images/bodyparts/chest.png"),
  foreArm: require("../../../assets/images/bodyparts/foreArm.png"),
  hip: require("../../../assets/images/bodyparts/hip.png"),
  waist: require("../../../assets/images/bodyparts/waist.png"),
  thigh: require("../../../assets/images/bodyparts/thigh.png"),
};



const PTProfileScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { ptId } = route.params;

  const [pt, setPt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "packages"
  const [purchasedPackage, setPurchasedPackage] = useState(null);

  console.log("PT Data:", pt);

  useEffect(() => {
    if (ptId) {
      fetchPTDetail();
    }
  }, [ptId]);

  const fetchPTDetail = async () => {
    try {
      setLoading(true);
      const response = await accountService.getFreelancePTDetail(ptId);
      if (response.status === "200" && response.data) {
        setPt(response.data);
      }
      if (response.data.freelancePTPackages) {
        const purchasedPackage = response.data.freelancePTPackages.find(pkg => pkg.isPurchased === true);
        if (purchasedPackage) {
          setPurchasedPackage(purchasedPackage);
        } else {
          setPurchasedPackage(null);
        }
      }

      console.log("Fetched PT Detail:", response.data);
    } catch (error) {
      console.error("Error fetching PT detail:", error);
      Alert.alert(
        t("errors.error"),
        t("errors.failedToLoadPackage")
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Body measurements data structure
  const getBodyMeasurements = () => {
    if (!pt?.userDetail) return [];
    
    const { userDetail } = pt;
    return [
      { key: "shoulder", label: "Shoulder", value: userDetail.shoulder, unit: "cm", image: bodyPartImages.shoulder },
      { key: "chest", label: "Chest", value: userDetail.chest, unit: "cm", image: bodyPartImages.chest },
      { key: "waist", label: "Waist", value: userDetail.waist, unit: "cm", image: bodyPartImages.waist },
      { key: "biceps", label: "Biceps", value: userDetail.biceps, unit: "cm", image: bodyPartImages.biceps },
      { key: "hip", label: "Hip", value: userDetail.hip, unit: "cm", image: bodyPartImages.hip },
      { key: "foreArm", label: "Forearm", value: userDetail.foreArm, unit: "cm", image: bodyPartImages.foreArm },
      { key: "thigh", label: "Thigh", value: userDetail.thigh, unit: "cm", image: bodyPartImages.thigh },
      { key: "calf", label: "Calf", value: userDetail.calf, unit: "cm", image: bodyPartImages.calf },
    ];
  };

  const handleContactPress = () => {
    // Handle contact action (e.g., open chat or phone)
    Alert.alert(
      t("common.contact"),
      t("freelancePT.contactTrainer"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.ok") },
      ]
    );
  };

  const handleBookSession = () => {
    // Navigate to booking screen or show available packages
    navigation.navigate("FreelancePTPackageDetailScreen", {
      freelancePTPackageId: pt?.packageId,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF914D" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </SafeAreaView>
    );
  }

  if (!pt) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>{t("errors.packageNotFound")}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t("common.goBack")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={["#FF914D", "#ED2A46"]}
          style={styles.gradientContainer}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  pt.freelancePt?.avatarUrl 
                    ? { uri: pt.freelancePt.avatarUrl }
                    : require("../../../assets/images/LogoColor.png")
                }
                style={styles.avatar}
              />
              {pt.freelancePt?.rating ? (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{pt.freelancePt.rating}</Text>
                </View>
              ) : (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>N/A</Text>
                </View>
              )}
            </View>

            <Text style={styles.name}>{pt.freelancePt?.fullName}</Text>
            <Text style={styles.description}>
              {pt.freelancePt?.description || "Professional Personal Trainer"}
            </Text>

            <View style={styles.basicInfoContainer}>
              <View style={styles.basicInfoItem}>
                <MaterialCommunityIcons
                  name="medal-outline"
                  size={18}
                  color="#FFD700"
                />
                <Text style={styles.basicInfoText}>
                  {pt.freelancePt?.experienceYears || 0} {t("freelancePT.experienceYears")}
                </Text>
              </View>
              <View style={styles.basicInfoItem}>
                <Ionicons name="people-outline" size={18} color="#FFD700" />
                <Text style={styles.basicInfoText}>
                  {pt.freelancePt?.totalPurchased ?? 0} {t("freelancePT.totalPurchased")}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="human-male-height"
              size={24}
              color="#FF914D"
            />
            <Text style={styles.statValue}>
              {pt?.userDetail?.height || "N/A"}
            </Text>
            <Text style={styles.statLabel}>Height (cm)</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={24}
              color="#FF914D"
            />
            <Text style={styles.statValue}>
              {pt?.userDetail?.weight || "N/A"}
            </Text>
            <Text style={styles.statLabel}>Weight (kg)</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#FF914D" />
            <Text style={styles.statValue}>
              {pt?.freelancePt?.totalPurchased ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t("freelancePT.clients")}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "profile" && styles.activeTab]}
            onPress={() => setActiveTab("profile")}
          >
            <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>
              PT Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "packages" && styles.activeTab]}
            onPress={() => setActiveTab("packages")}
          >
            <Text style={[styles.tabText, activeTab === "packages" && styles.activeTabText]}>
              Packages ({pt?.freelancePTPackages?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <>
        {/* Price Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t("freelancePT.pricing")}
          </Text>

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color="#FF914D"
              />
              <View style={styles.healthInfo}>
                <Text style={styles.healthTitle}>
                  {t("freelancePT.priceFrom")}
                </Text>
                <Text style={styles.healthSubtitle}>
                  {t("freelancePT.perSession")}
                </Text>
              </View>
              <Text style={[styles.healthValue, { color: "#FF914D" }]}>
                {pt.freelancePt?.priceFrom ? formatPrice(pt.freelancePt.priceFrom) : "Contact for pricing"}
              </Text>
            </View>
          </View>
        </View>

        {/* Body Measurements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="human-handsup"
                size={20}
                color="#FF914D"
              />{" "}
              Body Measurements
            </Text>
          </View>

          <View style={styles.measurementsGrid}>
            {getBodyMeasurements().map((measurement, index) => (
              <View key={measurement.key} style={styles.measurementCard}>
                {measurement.image ? (
                  <Image
                    source={measurement.image}
                    style={styles.bodyPartImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.bodyPartImagePlaceholder}>
                    <MaterialCommunityIcons
                      name="human"
                      size={32}
                      color="#FF"
                    />
                  </View>
                )}
                <Text style={styles.measurementLabel}>
                  {measurement.label}
                </Text>
                <Text style={styles.measurementValue}>
                  {measurement.value || "N/A"}{" "}
                  {measurement.value && (
                    <Text style={styles.measurementUnit}>
                      {measurement.unit}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trainer Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("freelancePT.trainerInfo")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Specializations */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="fitness-outline" size={16} color="#FF914D" />{" "}
                {t("freelancePT.specializations")}
              </Text>
              <View style={styles.tagsContainer}>
                {pt.freelancePt?.goalTrainings && pt.freelancePt.goalTrainings.length > 0 ? (
                  pt.freelancePt.goalTrainings.map((goal, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{goal}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyTag}>
                    <Text style={styles.emptyTagText}>No Specializations</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Certifications */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="ribbon-outline" size={16} color="#FF914D" />{" "}
                {t("freelancePT.certifications")}
              </Text>
              <View style={styles.certificationsContainer}>
                {pt.freelancePt?.certifications && pt.freelancePt.certifications.length > 0 ? (
                  pt.freelancePt.certifications.map((cert, index) => (
                    <View key={index} style={styles.certificationItem}>
                      <Text style={styles.certificationText}>{cert}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.certificationItem}>
                    <Text style={[styles.certificationText, { color: "#999" }]}>
                      No Certifications
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* About/Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("freelancePT.about")}
              </Text>
              <View style={[styles.textInput, styles.disabledInput]}>
                <Text style={styles.bioText}>
                  {pt.bio || pt.description || "No description available"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        </>
        )}

        {/* Packages Tab Content */}
        {activeTab === "packages" && (
          <View style={styles.packagesContainer}>
            {pt?.freelancePTPackages && pt.freelancePTPackages.length > 0 ? (
              // Sort packages: purchased packages first, then unpurchased
              [...pt.freelancePTPackages]
                .sort((a, b) => {
                  // If a is purchased and b is not, a comes first (return -1)
                  // If b is purchased and a is not, b comes first (return 1)
                  // If both have same purchase status, keep original order (return 0)
                  if (a.isPurchased && !b.isPurchased) return -1;
                  if (!a.isPurchased && b.isPurchased) return 1;
                  return 0;
                })
                .map((packageItem, index) => (
                <TouchableOpacity
                  key={packageItem.id}
                  style={[
                    styles.packageCard,
                    packageItem.isPurchased && styles.purchasedPackageCard
                  ]}
                  onPress={() => navigation.navigate("FreelancePTPackageDetailScreen", {
                    freelancePTPackageId: packageItem.id,
                    purchasedPackage: purchasedPackage,
                  })}
                >
                  {/* Package Image */}
                  <View style={styles.packageImageContainer}>
                    <Image
                      source={
                        packageItem.imageUrl && packageItem.imageUrl !== "string"
                          ? { uri: packageItem.imageUrl }
                          : require("../../../assets/images/gymroom.jpg")
                      }
                      style={styles.packageImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.6)"]}
                      style={styles.packageGradient}
                    />
                    {/* Purchased Badge */}
                    {packageItem.isPurchased && (
                      <View style={styles.purchasedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.purchasedBadgeText}>Purchased</Text>
                      </View>
                    )}
                  </View>

                  {/* Package Info */}
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName} numberOfLines={2}>
                      {packageItem.name || "Untitled Package"}
                    </Text>
                    
                    <Text style={styles.packageDescription} numberOfLines={2}>
                      {packageItem.description || "No description available"}
                    </Text>

                    <View style={styles.packageDetailsRow}>
                      <View style={styles.packageDetailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.packageDetailText}>
                          {packageItem.durationInDays || 0} days
                        </Text>
                      </View>
                      <View style={styles.packageDetailItem}>
                        <MaterialCommunityIcons name="dumbbell" size={14} color="#666" />
                        <Text style={styles.packageDetailText}>
                          {packageItem.numOfSessions || 0} sessions
                        </Text>
                      </View>
                      <View style={styles.packageDetailItem}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.packageDetailText}>
                          {packageItem.sessionDurationInMinutes || 0} min
                        </Text>
                      </View>
                    </View>

                    <View style={styles.packageFooter}>
                      <View style={styles.packagePriceContainer}>
                        <Text style={styles.packagePrice}>
                          {packageItem.price ? formatPrice(packageItem.price) : "Contact"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.packageButton}
                        onPress={() => navigation.navigate("FreelancePTPackageDetailScreen", {
                          freelancePTPackageId: packageItem.id,
                          purchasedPackage: purchasedPackage,
                        })}
                      >
                        <Text style={styles.packageButtonText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color="#ED2A46" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyPackagesContainer}>
                <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
                <Text style={styles.emptyPackagesText}>
                  No packages available yet
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF914D",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerButton: {
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
  scrollContainer: {
    flex: 1,
  },
  gradientContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  basicInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  basicInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  basicInfoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    zIndex: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  healthCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthInfo: {
    flex: 1,
    marginLeft: 12,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  healthSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f8f9fa",
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE0E3",
  },
  tagText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "600",
  },
  certificationsContainer: {
    gap: 8,
    marginTop: 4,
  },
  certificationItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  certificationText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  bioText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  measurementCard: {
    width: "30%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  bodyPartImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  bodyPartImagePlaceholder: {
    width: 48,
    height: 48,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
  },
  measurementLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  measurementUnit: {
    fontSize: 11,
    fontWeight: "400",
    color: "#999",
  },
  emptyTag: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emptyTagText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  additionalInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  additionalInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  additionalInfoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  additionalInfoValue: {
    fontSize: 16,
    color: "#ED2A46",
    fontWeight: "700",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ED2A46",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ED2A46",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#ED2A46",
    fontSize: 16,
    fontWeight: "600",
  },
  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ED2A46",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    shadowColor: "#ED2A46",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,

  },
  // Package Styles
  packagesContainer: {
    padding: 16,
    gap: 16,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  purchasedPackageCard: {
    borderWidth: 3,
    borderColor: "#ED2A46",
    backgroundColor: "#F1F8F4",
    elevation: 8,
    shadowColor: "#ED2A46",
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  packageImageContainer: {
    height: 180,
    position: "relative",
  },
  purchasedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ED2A46",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  purchasedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  packageImage: {
    width: "100%",
    height: "100%",
  },
  packageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  packageInfo: {
    padding: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  packageDetailsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  packageDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageDetailText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  packageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  packagePriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ED2A46",
  },
  packageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF5F6",
    borderRadius: 8,
  },
  packageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
  emptyPackagesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyPackagesText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});

export default PTProfileScreen;
