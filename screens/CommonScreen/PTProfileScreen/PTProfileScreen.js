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
import ptService from "../../../services/ptService";
import { useTranslation } from "../../../hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";

const PTProfileScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { ptId, pt: initialPt } = route.params;

  const [pt, setPt] = useState(initialPt);
  const [loading, setLoading] = useState(!initialPt);

  console.log("PT Data:", pt);

  useEffect(() => {
    if (!initialPt && ptId) {
      fetchPTDetail();
    }
  }, [ptId]);

  const fetchPTDetail = async () => {
    try {
      setLoading(true);
      const response = await ptService.getPTDetail(ptId);
      if (response.status === "200" && response.data) {
        setPt(response.data);
      }
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
                source={{
                  uri: pt.avatarUrl || "https://via.placeholder.com/120",
                }}
                style={styles.avatar}
              />
              {pt.rating && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{pt.rating}</Text>
                </View>
              )}
            </View>

            <Text style={styles.name}>{pt.fullName}</Text>
            {pt.description && (
              <Text style={styles.description}>{pt.description}</Text>
            )}

            <View style={styles.basicInfoContainer}>
              {pt.experienceYears && (
                <View style={styles.basicInfoItem}>
                  <MaterialCommunityIcons
                    name="medal-outline"
                    size={18}
                    color="#FFD700"
                  />
                  <Text style={styles.basicInfoText}>
                    {pt.experienceYears} {t("freelancePT.experienceYears")}
                  </Text>
                </View>
              )}
              {pt.totalPurchased !== undefined && (
                <View style={styles.basicInfoItem}>
                  <Ionicons name="people-outline" size={18} color="#FFD700" />
                  <Text style={styles.basicInfoText}>
                    {pt.totalPurchased} {t("freelancePT.totalPurchased")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          {pt.experienceYears && (
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="medal-outline"
                size={24}
                color="#FF914D"
              />
              <Text style={styles.statValue}>{pt.experienceYears}</Text>
              <Text style={styles.statLabel}>{t("freelancePT.years")}</Text>
            </View>
          )}

          {pt.rating && (
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={[styles.statValue, { color: "#FFD700" }]}>
                {pt.rating}
              </Text>
              <Text style={styles.statLabel}>{t("freelancePT.rating")}</Text>
            </View>
          )}

          {pt.totalPurchased !== undefined && (
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color="#FF914D" />
              <Text style={styles.statValue}>{pt.totalPurchased}</Text>
              <Text style={styles.statLabel}>{t("freelancePT.clients")}</Text>
            </View>
          )}
        </View>

        {/* Price Information Section */}
        {pt.priceFrom && (
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
                  {formatPrice(pt.priceFrom)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Trainer Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("freelancePT.trainerInfo")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Specializations */}
            {pt.goalTrainingList && pt.goalTrainingList.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="fitness-outline" size={16} color="#FF914D" />{" "}
                  {t("freelancePT.specializations")}
                </Text>
                <View style={styles.tagsContainer}>
                  {pt.goalTrainingList.map((goal, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {pt.certifications && pt.certifications.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="ribbon-outline" size={16} color="#FF914D" />{" "}
                  {t("freelancePT.certifications")}
                </Text>
                <View style={styles.certificationsContainer}>
                  {pt.certifications.map((cert, index) => (
                    <View key={index} style={styles.certificationItem}>
                      <Text style={styles.certificationText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* About/Bio */}
            {pt.bio && (
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
                  <Text style={styles.bioText}>{pt.bio}</Text>
                </View>
              </View>
            )}

            {pt.description && !pt.bio && (
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
                  <Text style={styles.bioText}>{pt.description}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBookSession}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {t("freelancePT.bookSession")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactPress}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FF914D" />
            <Text style={styles.secondaryButtonText}>
              {t("common.contact")}
            </Text>
          </TouchableOpacity>
        </View>
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
    color: "#FF914D",
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
    backgroundColor: "#FF914D",
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
    borderColor: "#FF914D",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#FF914D",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PTProfileScreen;
