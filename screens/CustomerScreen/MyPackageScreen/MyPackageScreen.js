import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import packageService from "../../../services/packageService";
import colors from "../../../constants/color";
import { useNavigation } from "@react-navigation/native";

export default function MyPackageScreen() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await packageService.getPackages();
        console.log("Package Response:", response);

        if (response.status === "200") {
          const gymCourseItems = response.data.gymCourse?.items || [];
          const freelancePtItems =
            response.data.freelancePtPackage?.items || [];

          // Map gym course packages - differentiate between normal and with PT
          const mappedGymCourses = gymCourseItems.map((item) => {
            // Check if this package has PT assigned by looking at ptList
            const hasPTAssigned =
              item.ptId !== null ||
              item.ptName !== null ||
              item.ptImageUrl !== null;
            console.log(
              "Mapping Gym Course Item:",
              item,
              "Has PT:",
              hasPTAssigned
            );
            return {
              ...item,
              type: hasPTAssigned ? "gymCourseWithPT" : "gymCourseNormal",
              packageType: hasPTAssigned ? "Gym + PT" : "Gym Membership",
              toExtend: true,
            };
          });

          // Map freelance PT packages
          const mappedFreelancePt = freelancePtItems.map((item) => ({
            ...item,
            type: "freelancePT",
            packageType: "Freelance PT",
            toExtend: true,
          }));

          // Combine both arrays
          const allPackages = [...mappedGymCourses, ...mappedFreelancePt];
          setPackages(allPackages);
        }
      } catch (error) {
        console.error("Error fetching package data:", error);
      }
    };
    fetchPackages();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const isPackageExpired = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  const getDaysRemaining = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPackages = packages.filter((pkg) => {
    const expired = isPackageExpired(pkg.expirationDate);
    return activeTab === "expired" ? expired : !expired;
  });

  const handleRenew = (item) => async () => {
    Alert.alert(
      t("myPackage.confirmRenewTitle"),
      t("myPackage.confirmRenewMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.ok") || "OK",
          onPress: async () => {
            navigation.navigate(t("navigation.home"), {
              screen: "PaymentScreen",
              params: {
                fromDirectPurchase: true,
                customerPurchasedIdToExtend: item.id,
                itemToExtend: item,
              },
            });
          },
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const getPackageTypeConfig = (type) => {
    switch (type) {
      case "freelancePT":
        return {
          color: "#1976d2",
          backgroundColor: "#e3f2fd",

          icon: "person",
          label: t("myPackage.packageTypes.freelancePT"),
        };
      case "gymCourseWithPT":
        return {
          color: colors.red,
          backgroundColor: "#fff5f5",
          icon: "people",
          label: t("myPackage.packageTypes.gymWithPT"),
        };
      case "gymCourseNormal":
        return {
          color: "#2e7d32",
          backgroundColor: "#e8f5e8",
          icon: "fitness",
          label: t("myPackage.packageTypes.gymMembership"),
        };
      default:
        return {
          color: "#666",
          backgroundColor: "#f5f5f5",
          icon: "card-membership",
          label: t("myPackage.packageTypes.package"),
        };
    }
  };

  const renderPackageItem = ({ item }) => {
    const expired = isPackageExpired(item.expirationDate);
    const daysRemaining = getDaysRemaining(item.expirationDate);
    const typeConfig = getPackageTypeConfig(item.type);
    const isFreelancePT = item.type === "freelancePT";
    const isGymWithPT = item.type === "gymCourseWithPT";
    const isGymNormal = item.type === "gymCourseNormal";

    return (
      <View style={[styles.packageCard, expired && styles.expiredCard]}>
        {/* Image with Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.courseImageUrl ||
                "https://fitness-nation.net/wp-content/uploads/2019/04/5-Things-to-Consider-When-Buying-a-Gym-Membership.jpg",
            }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Package Type Badge on Image */}
          <View
            style={[
              styles.typeImageBadge,
              { backgroundColor: typeConfig.color },
            ]}
          >
            <Ionicons name={typeConfig.icon} size={12} color="#fff" />
            <Text style={styles.typeImageBadgeText}>{typeConfig.label}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.packageTitle} numberOfLines={2}>
                {item.packageName}
              </Text>

              {!expired && daysRemaining >= 0 && (
                <View
                  style={[
                    styles.statusBadge,
                    daysRemaining <= 7
                      ? styles.warningBadge
                      : styles.activeBadge,
                  ]}
                >
                  <View style={styles.statusDot} />
                  <Text
                    style={[
                      styles.statusText,
                      daysRemaining <= 7 && styles.warningText,
                    ]}
                  >
                    {daysRemaining === 0
                      ? t("myPackage.today")
                      : `${daysRemaining}d`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {/* Freelance PT Info Card */}
            {isFreelancePT && item.ptName && (
              <View
                style={[
                  styles.ptInfoCard,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderLeftColor: typeConfig.color,
                  },
                ]}
              >
                <View style={[styles.ptAvatar, { backgroundColor: "#fff" }]}>
                  <Ionicons name="person" size={16} color={typeConfig.color} />
                </View>
                <View style={styles.ptInfo}>
                  <Text style={styles.ptLabel}>
                    {t("myPackage.labels.personalTrainer")}
                  </Text>
                  <Text style={styles.ptName}>{item.ptName}</Text>
                </View>
              </View>
            )}

            {/* Gym Course with PT Info Card */}
            {isGymWithPT && (
              <View
                style={[
                  styles.ptInfoCard,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderLeftColor: typeConfig.color,
                  },
                ]}
              >
                <View style={[styles.ptAvatar, { backgroundColor: "#fff" }]}>
                  <Ionicons name="people" size={16} color={typeConfig.color} />
                </View>
                <View style={styles.ptInfo}>
                  <Text style={styles.ptLabel}>
                    {t("myPackage.labels.assignedTrainer")}
                  </Text>
                  <Text style={styles.ptName}>{item.ptName}</Text>
                </View>
              </View>
            )}

            {/* Gym Normal Membership Badge */}
            {isGymNormal && (
              <View
                style={[
                  styles.membershipBadge,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderColor: typeConfig.color,
                  },
                ]}
              >
                <MaterialIcons
                  name="verified"
                  size={16}
                  color={typeConfig.color}
                />
                <Text
                  style={[styles.membershipText, { color: typeConfig.color }]}
                >
                  {t("myPackage.labels.fullGymAccess")}
                </Text>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#fff3e0" }]}>
                  <MaterialIcons
                    name="fitness-center"
                    size={18}
                    color="#f57c00"
                  />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{item.availableSessions}</Text>
                  <Text style={styles.statLabel}>
                    {t("myPackage.sessions")}
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#e8f5e8" }]}>
                  <Ionicons name="calendar" size={18} color="#2e7d32" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {formatDate(item.expirationDate)}
                  </Text>
                  <Text style={styles.statLabel}>
                    {t("myPackage.expiresOn")}
                  </Text>
                </View>
              </View>
            </View>

            {/* {!isFreelancePT && item.ptAssignmentPrice && (
              <View style={styles.priceInfoContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#666"
                />
                <Text style={styles.priceInfoText}>
                  PT Assignment:{" "}
                  {item.ptAssignmentPrice.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            )} */}
          </View>

          {/* Action Button */}
          {expired && (
            <TouchableOpacity
              style={[
                styles.renewButton,
                { backgroundColor: typeConfig.color },
              ]}
              onPress={handleRenew(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.renewButtonText}>{t("myPackage.renew")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "current" && styles.activeTab]}
          onPress={() => setActiveTab("current")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "current" && styles.activeTabText,
            ]}
          >
            {t("myPackage.current")}
          </Text>
          {activeTab === "current" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "expired" && styles.activeTab]}
          onPress={() => setActiveTab("expired")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expired" && styles.activeTabText,
            ]}
          >
            {t("myPackage.expired")}
          </Text>
          {activeTab === "expired" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {filteredPackages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="fitness-center" size={48} color="#e0e0e0" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === "current"
              ? t("myPackage.empty.currentTitle")
              : t("myPackage.empty.expiredTitle")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "current"
              ? t("myPackage.empty.currentSubtitle")
              : t("myPackage.empty.expiredSubtitle")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPackages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  activeTab: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#fff",
    opacity: 0.5,
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: colors.white,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  expiredCard: {
    opacity: 1,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  imageOverlay: {
    // position: "absolute",
    // bottom: 0,
    // left: 0,
    // right: 0,
    // height: 60,
  },
  typeImageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  typeImageBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  activeBadge: {
    backgroundColor: "#e8f5e8",
  },
  warningBadge: {
    backgroundColor: "#fff3e0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2e7d32",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
  },
  warningText: {
    color: "#f57c00",
  },
  infoSection: {
    gap: 12,
  },
  ptInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    gap: 10,
  },
  ptAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  ptInfo: {
    flex: 1,
  },
  ptLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ptName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  priceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  priceInfoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  renewButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
});
