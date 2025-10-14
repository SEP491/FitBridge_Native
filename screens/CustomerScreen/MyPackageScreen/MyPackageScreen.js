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
    const fetchPackageGymCourse = async () => {
      try {
        const response = await packageService.getPackagesGymCourse();
        console.log("Package Gym Course Data:", response);
        if (response.status === "200") {
          setPackages(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching package data:", error);
      }
    };
    fetchPackageGymCourse();
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

  const handleRenew = (customerPurchaseId) => async () => {
    // Show confirmation alert first. If user confirms, proceed to call the extend API.
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
            try {
              const response = await packageService.extendPackage({
                customerPurchasedIdToExtend: customerPurchaseId,
                paymentMethodId: "ea6876d3-7a25-4b5a-b08e-8bb797cd1a2a",
                quantity: 1,
              });
              console.log("Extend Package Response:", response.data);

              if (
                response.data &&
                response.data.data &&
                response.data.data.checkoutUrl
              ) {
                Linking.openURL(response.data.data.checkoutUrl);
              }
            } catch (error) {
              console.error(
                "Error extending package:",
                error?.response?.data || error
              );
              Alert.alert(t("common.error"), t("errors.cannotLoadPaymentLink"));
            }
          },
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const renderPackageItem = ({ item }) => {
    const expired = isPackageExpired(item.expirationDate);
    const daysRemaining = getDaysRemaining(item.expirationDate);

    return (
      <View style={[styles.packageCard, expired && styles.expiredCard]}>
        <Image
          source={{
            uri:
              item.courseImageUrl ||
              "https://cdn.prod.website-files.com/66aa8fe9dc4db68f448a978f/67d23ab405a87450847e4872_RT_240717_ANYTIME_FITNESS_3489-BATCH_rgb.jpg",
          }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          <View style={styles.packageHeader}>
            <Text style={styles.packageTitle}>{item.packageName}</Text>
            {!expired && daysRemaining >= 0 && (
              <View
                style={[
                  styles.statusBadge,
                  daysRemaining <= 7 ? styles.warningBadge : styles.activeBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    daysRemaining <= 7 && styles.warningText,
                  ]}
                >
                  {daysRemaining === 0
                    ? t("myPackage.today")
                    : t("myPackage.daysRemaining", { count: daysRemaining })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.packageDetails}>
            {!item.canAssignPT && (
              <View style={styles.detailRow}>
                <MaterialIcons name="card-membership" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {item.availableSessions} {t("myPackage.sessions")}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {t("myPackage.expiresOn")} {formatDate(item.expirationDate)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {expired && (
              <TouchableOpacity
                style={styles.renewButton}
                onPress={handleRenew(item.id)}
              >
                <Text style={styles.renewButtonText}>
                  {t("myPackage.renew")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "current" && styles.activeTab]}
          onPress={() => setActiveTab("current")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "current" && styles.activeTabText,
            ]}
          >
            {t("myPackage.current")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "expired" && styles.activeTab]}
          onPress={() => setActiveTab("expired")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expired" && styles.activeTabText,
            ]}
          >
            {t("myPackage.expired")}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredPackages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="fitness-center" size={64} color="#ccc" />
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    display: "none",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    justifyContent: "center",
    gap: 12,
  },
  tab: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    minWidth: 140,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
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
    flexDirection: "row",
  },
  expiredCard: {
    opacity: 0.7,
  },
  courseImage: {
    width: 130,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: "#e8f5e8",
  },
  warningBadge: {
    backgroundColor: "#fff3e0",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2e7d32",
  },
  warningText: {
    color: "#f57c00",
  },
  packageDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  renewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.red,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  renewButtonText: {
    fontSize: 14,
    color: colors.red,
    fontWeight: "600",
  },
  ptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  ptButtonFullWidth: {
    flex: 1,
  },
  ptButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
