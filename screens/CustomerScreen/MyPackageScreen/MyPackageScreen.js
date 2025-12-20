import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
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
import PackageFeedbackModal from "../../../components/OrderManagementCard/PackageFeedbackModal";
import orderService from "../../../services/orderService";
import PackageCard from "../../../components/PackageCard/PackageCard";
import { PackageCardSkeletonList } from "../../../components/PackageCard/PackageCardSkeleton";
import LoadingIndicator from "../../../components/LoadingIndicator";
export default function MyPackageScreen() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Report Modal States
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPackageForReport, setSelectedPackageForReport] =
    useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Feedback Modal States
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedPackageForFeedback, setSelectedPackageForFeedback] =
    useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getPackages();
      console.log("Package Response:", response);

      if (response.status === "200") {
        const gymCourseItems = response.data.gymCourse?.items || [];
        const freelancePtItems = response.data.freelancePtPackage?.items || [];

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
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  };

  const getPackageOrderInfo = async (customerPurchasedId) => {
    try {
      const response = await orderService.getPackageOrder(customerPurchasedId);
      if (response.data) {
        setSelectedPackageForFeedback(response.data);
        setFeedbackModalVisible(true);
      } else {
        Alert.alert(
          t("errors.error") || "Error",
          t("myPackage.feedback.errorLoadingOrder") ||
            "Failed to load order information. Please try again."
        );
      }
    } catch (error) {
      console.error("Error fetching package order info:", error);
      Alert.alert(
        t("errors.error") || "Error",
        t("myPackage.feedback.errorLoadingOrder") ||
          "Failed to load order information. Please try again."
      );
    }
  };

  const isPackageExpired = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  const filteredPackages = packages.filter((pkg) => {
    const expired = isPackageExpired(pkg.expirationDate);
    return activeTab === "expired" ? expired : !expired;
  });

  const handleRenew = (item) => {
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
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t("myPackage.reportModal.permissionRequired"),
          t("myPackage.reportModal.permissionMessage")
        );
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
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.failedToPickImage")
      );
    }
  };

  const handleRemoveImage = (index) => {
    setReportImages(reportImages.filter((_, i) => i !== index));
  };

  const handleOpenFeedbackModal = (item) => {
    // Check if package is expired or has no available sessions
    const expired = isPackageExpired(item.expirationDate);
    const noSessionsLeft = item.availableSessions === 0;

    if (!expired && !noSessionsLeft) {
      Alert.alert(
        t("myPackage.feedback.notAvailableTitle") || "Not Available",
        t("myPackage.feedback.notAvailableMessage") ||
          "Feedback is only available for expired or completed packages."
      );
      return;
    }

    getPackageOrderInfo(item.id); // Fetch order info if needed
  };

  const handleCloseFeedbackModal = (success) => {
    setFeedbackModalVisible(false);
    setSelectedPackageForFeedback(null);

    if (success) {
      // Refresh packages list after successful feedback submission
      fetchPackages();
    }
  };

  const handleSubmitReport = async () => {
    if (!reportTitle.trim()) {
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.pleaseEnterTitle")
      );
      return;
    }
    if (!reportDescription.trim()) {
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.pleaseEnterDescription")
      );
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
        Alert.alert(
          t("common.success"),
          t("myPackage.reportModal.submitSuccess")
        );
        setReportModalVisible(false);
        setReportTitle("");
        setReportDescription("");
        setReportImages([]);
        setSelectedPackageForReport(null);
      } else {
        Alert.alert(
          t("errors.error"),
          response.message || t("myPackage.reportModal.submitFailed")
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.submitFailedRetry")
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Construct customer object for Freelance PT packages
  const getCustomerForPackage = (packageItem) => {
    if (packageItem.type !== "freelancePT") return null;
    
    // Get all Freelance PT packages for this customer
    const freelancePTPackages = packages.filter(pkg => pkg.type === "freelancePT");
    
    // Construct a customer object from package data
    // Note: This constructs a customer object for navigation to CustomerDetailScreen
    const customer = {
      id: packageItem.customerId || packageItem.id, // Use customerId if available, fallback to package id
      name: packageItem.customerName || packageItem.ptName || "Customer", // Use customerName if available
      email: packageItem.customerEmail || "",
      phone: packageItem.customerPhone || "",
      avatarUrl: packageItem.customerAvatarUrl || null,
      status: "active",
      joinDate: packageItem.purchaseDate || new Date().toISOString(),
      totalPackages: freelancePTPackages.length,
      activePackages: freelancePTPackages.filter(pkg => !isPackageExpired(pkg.expirationDate)).length,
      totalSessions: freelancePTPackages.reduce((sum, pkg) => sum + (pkg.availableSessions || 0), 0),
      packages: freelancePTPackages.map(pkg => ({
        id: pkg.id,
        packageName: pkg.packageName,
        availableSessions: pkg.availableSessions || 0,
        expirationDate: pkg.expirationDate,
        purchaseDate: pkg.purchaseDate || pkg.expirationDate,
        totalSessions: pkg.totalSessions || pkg.availableSessions || 0,
      })),
    };
    
    return customer;
  };

  const renderPackageItem = ({ item }) => {
    const customer = getCustomerForPackage(item);
    
    return (
      <PackageCard
        item={item}
        onRenew={handleRenew}
        onReport={handleReport}
        onFeedback={handleOpenFeedbackModal}
        t={t}
        mode="package"
        customer={customer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Feedback Modal */}
      {selectedPackageForFeedback && (
        <PackageFeedbackModal
          visible={feedbackModalVisible}
          onClose={handleCloseFeedbackModal}
          packageItem={selectedPackageForFeedback}
        />
      )}

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
              <Text style={styles.modalTitle}>
                {t("myPackage.reportModal.modalTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedPackageForReport && (
                <View style={styles.reportPackageInfo}>
                  <Text style={styles.reportPackageLabel}>
                    {t("myPackage.reportModal.reporting")}
                  </Text>
                  <Text style={styles.reportPackageName}>
                    {selectedPackageForReport.packageName}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t("myPackage.reportModal.title")}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("myPackage.reportModal.titlePlaceholder")}
                  value={reportTitle}
                  onChangeText={setReportTitle}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t("myPackage.reportModal.description")}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={t(
                    "myPackage.reportModal.descriptionPlaceholder"
                  )}
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
                <Text style={styles.inputLabel}>
                  {t("myPackage.reportModal.evidenceImages")}
                </Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="image-outline" size={24} color={colors.red} />
                  <Text style={styles.addImageText}>
                    {t("myPackage.reportModal.addImages")}
                  </Text>
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
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#fff"
                          />
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
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
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
                  <LoadingIndicator variant="button" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      {t("myPackage.reportModal.submitReport")}
                    </Text>
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

      {loading ? (
        <View style={styles.listContainer}>
          <PackageCardSkeletonList count={4} />
        </View>
      ) : filteredPackages.length === 0 ? (
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
