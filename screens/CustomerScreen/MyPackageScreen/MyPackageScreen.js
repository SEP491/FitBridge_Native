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
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import packageService from "../../../services/packageService";
import colors from "../../../constants/color";
import { useNavigation } from "@react-navigation/native";
import ReportService from "../../../services/reportService";
import uploadImageService from "../../../services/uploadImageService";
import * as ImagePicker from "expo-image-picker";

export default function MyPackageScreen() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const navigation = useNavigation();
  
  // Report Modal States
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPackageForReport, setSelectedPackageForReport] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

  const handleReport = (item) => {
    setSelectedPackageForReport(item);
    setReportModalVisible(true);
    setReportTitle("");
    setReportDescription("");
    setReportImages([]);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setReportImages([...reportImages, ...result.assets]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveImage = (index) => {
    setReportImages(reportImages.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    if (!reportTitle.trim()) {
      Alert.alert("Error", "Please enter a report title");
      return;
    }
    if (!reportDescription.trim()) {
      Alert.alert("Error", "Please enter a report description");
      return;
    }

    setIsSubmittingReport(true);

    try {
      // Upload images first
      const imageUrls = [];
      for (const image of reportImages) {
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          type: "image/jpeg",
          name: `report_${Date.now()}.jpg`,
        });

        const uploadResponse = await uploadImageService.uploadImage(formData);
        if (uploadResponse.status === "200" && uploadResponse.data) {
          imageUrls.push(uploadResponse.data);
        }
      }

      // Determine report type based on package type
      let reportType;
      if (selectedPackageForReport.type === "freelancePT") {
        reportType = "FreelancePtReport";
      } else {
        reportType = "GymCourseReport";
      }

      // Create report
      const reportData = {
        reportedItemId: selectedPackageForReport.id,
        title: reportTitle,
        description: reportDescription,
        reportType: reportType,
        imageUrls: imageUrls,
      };

      const response = await ReportService.createReport(reportData);

      if (response.status === "200" || response.status === "201") {
        Alert.alert("Success", "Report submitted successfully");
        setReportModalVisible(false);
        setReportTitle("");
        setReportDescription("");
        setReportImages([]);
        setSelectedPackageForReport(null);
      } else {
        Alert.alert("Error", response.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
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
        {/* First Row: Image and Information */}
        <View style={styles.mainRow}>
          {/* Image with Badge */}
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
            {/* Package Type Badge on Image */}
            <View
              style={[
                styles.typeImageBadge,
                { backgroundColor: typeConfig.color },
              ]}
            >
              <Ionicons name={typeConfig.icon} size={10} color="#fff" />
              <Text style={styles.typeImageBadgeText}>{typeConfig.label}</Text>
            </View>
          </View>

          {/* Information Section */}
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
                    <Ionicons name="person" size={14} color={typeConfig.color} />
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
                    <Ionicons name="people" size={14} color={typeConfig.color} />
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
                    size={14}
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
                      size={16}
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
                    <Ionicons name="calendar" size={16} color="#2e7d32" />
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
            </View>
          </View>
        </View>

        {/* Second Row: Action Buttons */}
        {!expired && (
          <View style={styles.actionButtonsRow}>
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

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => handleReport(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="flag-outline" size={18} color={colors.red} />
              <Text style={styles.reportButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Package</Text>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedPackageForReport && (
                <View style={styles.reportPackageInfo}>
                  <Text style={styles.reportPackageLabel}>Reporting:</Text>
                  <Text style={styles.reportPackageName}>
                    {selectedPackageForReport.packageName}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter report title"
                  value={reportTitle}
                  onChangeText={setReportTitle}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe the issue in detail"
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {reportDescription.length}/500
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Evidence Images (Optional)</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="image-outline" size={24} color={colors.red} />
                  <Text style={styles.addImageText}>Add Images</Text>
                </TouchableOpacity>

                {reportImages.length > 0 && (
                  <View style={styles.imagePreviewContainer}>
                    {reportImages.map((image, index) => (
                      <View key={index} style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.imagePreview}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReportModalVisible(false)}
                disabled={isSubmittingReport}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmittingReport && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReport}
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  mainRow: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
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
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
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
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "space-between",
  },
  headerSection: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  activeBadge: {
    backgroundColor: "#e8f5e8",
  },
  warningBadge: {
    backgroundColor: "#fff3e0",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2e7d32",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2e7d32",
  },
  warningText: {
    color: "#f57c00",
  },
  infoSection: {
    gap: 8,
  },
  ptInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    borderLeftWidth: 2,
    gap: 6,
  },
  ptAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ptInfo: {
    flex: 1,
  },
  ptLabel: {
    fontSize: 9,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  ptName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  membershipText: {
    fontSize: 10,
    fontWeight: "700",
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 6,
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
  actionButtonsRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  renewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
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
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.red,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportButtonText: {
    fontSize: 14,
    color: colors.red,
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
  // Report Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: "70%",
  },
  reportPackageInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  reportPackageLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  reportPackageName: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: colors.red,
    borderRadius: 10,
    borderStyle: "dashed",
    gap: 8,
  },
  addImageText: {
    fontSize: 14,
    color: colors.red,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },
  imagePreviewWrapper: {
    position: "relative",
    width: 80,
    height: 80,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.red,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.red,
    gap: 6,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
