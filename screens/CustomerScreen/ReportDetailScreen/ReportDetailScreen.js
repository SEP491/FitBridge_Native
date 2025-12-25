import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import ReportService from "../../../services/reportService";
import colors from "../../../constants/color";
import LoadingIndicator from "../../../components/LoadingIndicator";
import LogoColor from "../../../assets/images/LogoColor.png";
const { width: screenWidth } = Dimensions.get("window");

export default function ReportDetailScreen({ route }) {
  const { t } = useTranslation();
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const response = await ReportService.getReportDetail(reportId);
      console.log("Report Detail Response:", response);

      if (response.status === "200" && response.data) {
        setReport(response.data);
      }
    } catch (error) {
      console.error("Error fetching report detail:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportDetail();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formatDate(dateString)} ${hours}:${minutes}`;
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          color: "#f57c00",
          backgroundColor: "#fff3e0",
          icon: "hourglass-empty",
          label: t("myReports.status.pending"),
        };
      case "processing":
        return {
          color: "#1976d2",
          backgroundColor: "#e3f2fd",
          icon: "autorenew",
          label: t("myReports.status.processing"),
        };
      case "resolved":
        return {
          color: "#2e7d32",
          backgroundColor: "#e8f5e9",
          icon: "check-circle",
          label: t("myReports.status.resolved"),
        };
      case "fraudconfirmed":
        return {
          color: "#d32f2f",
          backgroundColor: "#ffebee",
          icon: "gavel",
          label: t("myReports.status.fraudConfirmed"),
        };
      default:
        return {
          color: "#666",
          backgroundColor: "#f5f5f5",
          icon: "info",
          label: status || t("myReports.status.unknown"),
        };
    }
  };

  const getReportTypeConfig = (type) => {
    switch (type) {
      case "FreelancePtReport":
        return {
          color: "#1976d2",
          icon: "person",
          label: t("myReports.reportType.freelancePT"),
        };
      case "GymCourseReport":
        return {
          color: colors.red,
          icon: "fitness-center",
          label: t("myReports.reportType.gymCourse"),
        };
      case "ProductReport":
        return {
          color: "#7b1fa2",
          icon: "shopping-cart",
          label: t("myReports.reportType.product"),
        };
      default:
        return {
          color: "#666",
          icon: "flag",
          label: type || t("myReports.reportType.default"),
        };
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const renderEvidenceImages = (images, title) => {
    if (!images || (Array.isArray(images) && images.length === 0)) {
      return null;
    }

    // Handle both array and single string
    const imageArray = Array.isArray(images) ? images : [images];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {imageArray.map((imageUrl, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openImageModal(imageUrl)}
              activeOpacity={0.8}
            >
              <Image
                source={imageUrl !== null ? { uri: imageUrl } : LogoColor}
                style={styles.evidenceImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingIndicator
            variant="page"
            message={t("myReports.loadingDetail")}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#e0e0e0" />
          <Text style={styles.errorTitle}>{t("myReports.reportNotFound")}</Text>
          <Text style={styles.errorSubtitle}>
            {t("myReports.reportNotFoundDesc")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(report.status);
  const typeConfig = getReportTypeConfig(report.reportType);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            <MaterialIcons
              name={statusConfig.icon}
              size={32}
              color={statusConfig.color}
            />
          </View>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          <View
            style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}
          >
            <MaterialIcons name={typeConfig.icon} size={14} color="#fff" />
            <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
          </View>
        </View>
        {/* Order Info */}
        {report.orderItemId && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("myReports.orderInfo")}</Text>
            <View style={styles.orderIdContainer}>
              <MaterialIcons name="receipt" size={16} color="#666" />
              <Text style={styles.orderIdLabel}>
                {t("myReports.orderItemId")}:
              </Text>
              <Text style={styles.orderIdValue} numberOfLines={1}>
                {report.orderItemId}
              </Text>
            </View>
          </View>
        )}
        {/* Report Info Card */}
        <View style={styles.card}>
          <Text style={styles.reportTitle}>{report.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#999" />
            <Text style={styles.infoLabel}>{t("myReports.createdAt")}:</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(report.createdAt)}
            </Text>
          </View>

          {report.resolvedAt && (
            <View style={styles.infoRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#2e7d32"
              />
              <Text style={[styles.infoLabel, { color: "#2e7d32" }]}>
                {t("myReports.resolvedAt")}:
              </Text>
              <Text style={[styles.infoValue, { color: "#2e7d32" }]}>
                {formatDateTime(report.resolvedAt)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.descriptionLabel}>
            {t("myReports.description")}
          </Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* Reported User Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {report.isProductReport
              ? t("myReports.reportedProduct")
              : t("myReports.reportedUser")}
          </Text>
          <View style={styles.userContainer}>
            <Image
              source={
                (report.isProductReport
                  ? report.reportedProductImageUrl
                  : report.reportedUserAvatarUrl) !== null
                  ? {
                      uri: report.isProductReport
                        ? report.reportedProductImageUrl
                        : report.reportedUserAvatarUrl,
                    }
                  : LogoColor
              }
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {report.isProductReport
                  ? report.reportedProduct
                  : report.reportedUserName}
              </Text>
              <Text style={styles.userLabel}>
                {report.isProductReport
                  ? t("myReports.reportedProductLabel")
                  : t("myReports.reportedUserLabel")}
              </Text>
            </View>
          </View>
        </View>

        {/* Reporter Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("myReports.reporter")}</Text>
          <View style={styles.userContainer}>
            <Image
              source={{
                uri:
                  report.reporterAvatarUrl !== null
                    ? report.reporterAvatarUrl
                    : LogoColor,
              }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {report.reporterName || "Unknown"}
              </Text>
              <Text style={styles.userLabel}>
                {t("myReports.reporterLabel") || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        {/* Evidence Images */}
        {renderEvidenceImages(
          report.evidenceImageUrls,
          t("myReports.evidenceImages")
        )}

        {/* Resolved Evidence Images */}
        {renderEvidenceImages(
          report.resolvedEvidenceImageUrls,
          t("myReports.resolvedEvidenceImages")
        )}
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeImageModal}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  userLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  evidenceImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  orderIdValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  modalImage: {
    width: screenWidth,
    height: screenWidth,
  },
});
