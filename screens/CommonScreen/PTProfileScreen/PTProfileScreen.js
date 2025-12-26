import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";
import accountService from "../../../services/accountService";
import reviewService from "../../../services/reviewService";
import ReviewCard from "../../../components/ReviewCard/ReviewCard";
import LoadingIndicator from "../../../components/LoadingIndicator";
import LogoColor from "../../../assets/images/LogoColor.png";
import PTProfileScreenSkeleton from "./PTProfileScreenSkeleton";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
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
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [selectedCertificateUrl, setSelectedCertificateUrl] = useState(null);
  const [expandedCertificates, setExpandedCertificates] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageScrollViewRef = useRef(null);

  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      setAvgRating((totalRating / reviews.length).toFixed(1));
    } else {
      setAvgRating(null);
    }
  }, [reviews]);

  console.log("PT Data:", pt);

  // Fetch current user (but don't block guests from viewing)
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserFromStorage();
      if (userData) {
        setCurrentUser(userData);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (ptId) {
      fetchPTDetail();
      fetchPTReview();
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
        const purchasedPackage = response.data.freelancePTPackages.find(
          (pkg) => pkg.isPurchased === true
        );
        if (purchasedPackage) {
          setPurchasedPackage(purchasedPackage);
        } else {
          setPurchasedPackage(null);
        }
      }

      console.log("Fetched PT Detail:", response.data);
    } catch (error) {
      console.error("Error fetching PT detail:", error);
      Alert.alert(t("errors.error"), t("errors.failedToLoadPackage"));
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const fetchPTReview = async (pageNum = 1) => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getItemReviewsById({
        freelancePtId: ptId,
        page: pageNum,
        size: 100,
      });

      if (response.data) {
        if (pageNum === 1) {
          setReviews(response.data.items || []);
        } else {
          setReviews((prev) => [...prev, ...(response.data.items || [])]);
        }
        setReviewsPage(pageNum);
        setReviewsTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching PT reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Extract all specializations from certificates
  const getAllSpecializations = () => {
    if (
      !pt?.freelancePt?.certifications ||
      pt.freelancePt.certifications.length === 0
    ) {
      return [];
    }

    const specializationsSet = new Set();
    pt.freelancePt.certifications.forEach((cert) => {
      if (
        cert.certificateMetadata?.specializations &&
        Array.isArray(cert.certificateMetadata.specializations)
      ) {
        cert.certificateMetadata.specializations.forEach((spec) => {
          if (spec && spec.trim()) {
            specializationsSet.add(spec.trim());
          }
        });
      }
    });

    return Array.from(specializationsSet).sort();
  };

  // Toggle certificate accordion
  const toggleCertificate = (certId) => {
    const newExpanded = new Set(expandedCertificates);
    if (newExpanded.has(certId)) {
      newExpanded.delete(certId);
    } else {
      newExpanded.add(certId);
    }
    setExpandedCertificates(newExpanded);
  };

  // Body measurements data structure
  const getBodyMeasurements = () => {
    if (!pt?.userDetail) return [];

    const { userDetail } = pt;
    return [
      {
        key: "shoulder",
        label: t("freelancePT.shoulder"),
        value: userDetail.shoulder,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.shoulder,
      },
      {
        key: "chest",
        label: t("freelancePT.chest"),
        value: userDetail.chest,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.chest,
      },
      {
        key: "waist",
        label: t("freelancePT.waist"),
        value: userDetail.waist,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.waist,
      },
      {
        key: "biceps",
        label: t("freelancePT.biceps"),
        value: userDetail.biceps,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.biceps,
      },
      {
        key: "hip",
        label: t("freelancePT.hip"),
        value: userDetail.hip,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.hip,
      },
      {
        key: "foreArm",
        label: t("freelancePT.foreArm"),
        value: userDetail.foreArm,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.foreArm,
      },
      {
        key: "thigh",
        label: t("freelancePT.thigh"),
        value: userDetail.thigh,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.thigh,
      },
      {
        key: "calf",
        label: t("freelancePT.calf"),
        value: userDetail.calf,
        unit: t("ptProfile.units.cm"),
        image: bodyPartImages.calf,
      },
    ];
  };

  // Check if user is logged in (guest needs to login to book)

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <PTProfileScreenSkeleton />
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
    <>
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
                    : LogoColor
                }
                style={styles.avatar}
              />
              {pt.freelancePt?.rating ? (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{(pt.freelancePt.rating).toFixed(1)}</Text>
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
              {pt.freelancePt?.description ||
                t("freelancePT.professionalPersonalTrainer")}
            </Text>

            <View style={styles.basicInfoContainer}>
              <View style={styles.basicInfoItem}>
                <MaterialCommunityIcons
                  name="medal-outline"
                  size={18}
                  color="#FFD700"
                />
                <Text style={styles.basicInfoText}>
                  {pt.freelancePt?.experienceYears || 0}{" "}
                  {t("freelancePT.experienceYears")}
                </Text>
              </View>
              <View style={styles.basicInfoItem}>
                <Ionicons name="people-outline" size={18} color="#FFD700" />
                <Text style={styles.basicInfoText}>
                  {pt.freelancePt?.totalPurchased ?? 0}{" "}
                  {t("freelancePT.totalPurchased")}
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
            <Text style={styles.statLabel}>{t("freelancePT.heightLabel")}</Text>
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
            <Text style={styles.statLabel}>{t("freelancePT.weightLabel")}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#FF914D" />
            <Text style={styles.statValue}>
              {pt?.freelancePt?.totalPurchased ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t("freelancePT.clients")}</Text>
          </View>
        </View>

        {/* Available Announcements */}
        <View
          style={[
            styles.announcementSectionContainer,
            {
              borderLeftColor:
                pt?.freelancePt?.ptCurrentCourse ===
                pt?.freelancePt?.ptMaxCourse
                  ? "#FF9800"
                  : "#4CAF50",
              borderBottomColor:
                pt?.freelancePt?.ptCurrentCourse ===
                pt?.freelancePt?.ptMaxCourse
                  ? "#FF9800"
                  : "#4CAF50",
            },
          ]}
        >
          {pt?.freelancePt?.ptCurrentCourse >= pt?.freelancePt?.ptMaxCourse ? (
            <>
              <Ionicons name="information-circle" size={24} color="#FF9800" />
              <View style={styles.announcementTextContainer}>
                <Text style={styles.announcementText}>
                  Huấn luyện viên đã nhận đủ số lượng học viên
                </Text>
                <Text style={styles.announcementText2}>
                  Hãy quay lại vào lần sau để đăng ký khóa học với PT này
                </Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.announcementTextContainer}>
                <Text style={styles.announcementText}>
                  Hiện tại huấn luyện viên còn nhận{" "}
                  {pt?.freelancePt?.ptMaxCourse -
                    pt?.freelancePt?.ptCurrentCourse}{" "}
                  học viên
                </Text>
                <Text style={styles.announcementText2}>
                  Hãy đăng ký khóa học với PT này trong thời gian sớm nhất
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "profile" && styles.activeTab]}
            onPress={() => setActiveTab("profile")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "profile" && styles.activeTabText,
              ]}
            >
              {t("freelancePT.ptProfileTab")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "packages" && styles.activeTab]}
            onPress={() => setActiveTab("packages")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "packages" && styles.activeTabText,
              ]}
            >
              {t("freelancePT.packagesTab")} (
              {pt?.freelancePTPackages?.filter(
                (pkg) => pkg.isDisplayed === true || pkg.isDisplayed === "true"
              ).length || 0}
              )
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.activeTabText,
              ]}
            >
              {t("freelancePT.reviews") || "Reviews"}
              {reviews.length > 0 && ` (${reviews.length})`}
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
                    {pt.freelancePt?.priceFrom
                      ? formatPrice(pt.freelancePt.priceFrom)
                      : t("freelancePT.contactForPricing")}
                  </Text>
                </View>
              </View>
            </View>
            {pt?.freelancePt?.freelancePtImages &&
              pt.freelancePt.freelancePtImages.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color="#FF914D"
                      />{" "}
                      {t("freelancePT.imageShowcase") || "Image Showcase"}
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageGalleryContainer}
                  >
                    {pt.freelancePt.freelancePtImages.map((imageUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageGalleryItem}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setImageModalVisible(true);
                          // Scroll to selected image when modal opens
                          setTimeout(() => {
                            if (imageScrollViewRef.current) {
                              imageScrollViewRef.current.scrollTo({
                                x: index * Dimensions.get("window").width,
                                animated: false,
                              });
                            }
                          }, 100);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.imageGalleryImage}
                          resizeMode="cover"
                        />
                        {index ===
                          pt.freelancePt.freelancePtImages.length - 1 &&
                          pt.freelancePt.freelancePtImages.length > 3 && (
                            <View style={styles.imageOverlay}>
                              <Text style={styles.imageOverlayText}>
                                +{pt.freelancePt.freelancePtImages.length - 3}
                              </Text>
                            </View>
                          )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            {/* Body Measurements Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <MaterialCommunityIcons
                    name="human-handsup"
                    size={20}
                    color="#FF914D"
                  />{" "}
                  {t("freelancePT.bodyMeasurements")}
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

            {/* Image Showcase Section */}

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
                    <Ionicons
                      name="fitness-outline"
                      size={16}
                      color="#FF914D"
                    />{" "}
                    {t("freelancePT.specializations")}
                  </Text>
                  <View style={styles.tagsContainer}>
                    {(() => {
                      const specializations = getAllSpecializations();
                      return specializations.length > 0 ? (
                        specializations.map((spec, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{spec}</Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.emptyTag}>
                          <Text style={styles.emptyTagText}>
                            {t("freelancePT.noSpecializations")}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                </View>

                {/* Certifications */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="ribbon-outline" size={16} color="#FF914D" />{" "}
                    {t("freelancePT.certifications")}
                  </Text>
                  <View style={styles.certificationsContainer}>
                    {pt.freelancePt?.certifications &&
                    pt.freelancePt.certifications.length > 0 ? (
                      pt.freelancePt.certifications.map((cert, index) => {
                        const certMetadata = cert.certificateMetadata;
                        const isActive = cert.certificateStatus === "Active";
                        const certId = cert.id || `cert-${index}`;
                        const isExpanded = expandedCertificates.has(certId);

                        return (
                          <View
                            key={certId}
                            style={[
                              styles.certificationCard,
                              !isActive && styles.certificationCardInactive,
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.certificationHeader}
                              onPress={() => toggleCertificate(certId)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.certificationHeaderLeft}>
                                <View style={styles.certificationIconContainer}>
                                  <Ionicons
                                    name="ribbon"
                                    size={24}
                                    color={isActive ? "#FF914D" : "#999"}
                                  />
                                </View>
                                <View
                                  style={styles.certificationTitleContainer}
                                >
                                  <Text style={styles.certificationName}>
                                    {certMetadata?.certName ||
                                      t("freelancePT.certificateModal.title")}
                                  </Text>
                                  <Text style={styles.certificationProvider}>
                                    {certMetadata?.providerName || ""}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.certificationHeaderRight}>
                                <Ionicons
                                  name={
                                    isExpanded ? "chevron-up" : "chevron-down"
                                  }
                                  size={20}
                                  color="#666"
                                  style={styles.certificationChevron}
                                />
                              </View>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View style={styles.certificationContent}>
                                {certMetadata?.certCode && (
                                  <View
                                    style={styles.certificationCodeContainer}
                                  >
                                    <Text style={styles.certificationCodeLabel}>
                                      {t("freelancePT.certificateModal.code")}
                                    </Text>
                                    <Text style={styles.certificationCode}>
                                      {certMetadata.certCode}
                                    </Text>
                                  </View>
                                )}

                                {certMetadata?.certificateType && (
                                  <View
                                    style={styles.certificationTypeContainer}
                                  >
                                    <Ionicons
                                      name="globe-outline"
                                      size={14}
                                      color="#666"
                                    />
                                    <Text style={styles.certificationType}>
                                      {certMetadata.certificateType}
                                    </Text>
                                  </View>
                                )}

                                {certMetadata?.description && (
                                  <Text style={styles.certificationDescription}>
                                    {certMetadata.description}
                                  </Text>
                                )}

                                {certMetadata?.specializations &&
                                  certMetadata.specializations.length > 0 && (
                                    <View
                                      style={
                                        styles.certificationSpecializations
                                      }
                                    >
                                      {certMetadata.specializations.map(
                                        (spec, specIndex) => (
                                          <View
                                            key={specIndex}
                                            style={styles.specializationTag}
                                          >
                                            <Text
                                              style={
                                                styles.specializationTagText
                                              }
                                            >
                                              {spec}
                                            </Text>
                                          </View>
                                        )
                                      )}
                                    </View>
                                  )}

                                <View style={styles.certificationDates}>
                                  {cert.providedDate && (
                                    <View style={styles.certificationDateItem}>
                                      <Ionicons
                                        name="calendar-outline"
                                        size={12}
                                        color="#666"
                                      />
                                      <Text
                                        style={styles.certificationDateText}
                                      >
                                        {t(
                                          "freelancePT.certificateModal.issued"
                                        )}{" "}
                                        {cert.providedDate}
                                      </Text>
                                    </View>
                                  )}
                                  {cert.expirationDate && (
                                    <View style={styles.certificationDateItem}>
                                      <Ionicons
                                        name="time-outline"
                                        size={12}
                                        color="#666"
                                      />
                                      <Text
                                        style={styles.certificationDateText}
                                      >
                                        {t(
                                          "freelancePT.certificateModal.expires"
                                        )}{" "}
                                        {cert.expirationDate}
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {cert.certUrl && (
                                  <TouchableOpacity
                                    style={styles.certificationViewLink}
                                    onPress={() => {
                                      setSelectedCertificateUrl(cert.certUrl);
                                      setCertificateModalVisible(true);
                                    }}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name="open-outline"
                                      size={14}
                                      color="#FF914D"
                                    />
                                    <Text
                                      style={styles.certificationViewLinkText}
                                    >
                                      {t(
                                        "freelancePT.certificateModal.viewCertificate"
                                      )}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.certificationItem}>
                        <Text
                          style={[styles.certificationText, { color: "#999" }]}
                        >
                          {t("freelancePT.noCertifications")}
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
                      {pt.bio ||
                        pt.description ||
                        t("freelancePT.noDescription")}
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
                .filter(
                  (pkg) =>
                    pkg.isDisplayed === true || pkg.isDisplayed === "true"
                )
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
                      packageItem.isPurchased && styles.purchasedPackageCard,
                    ]}
                    onPress={() =>
                      navigation.navigate("FreelancePTPackageDetailScreen", {
                        freelancePTPackageId: packageItem.id,
                        purchasedPackage: purchasedPackage,
                        ptCurrentCourse: pt?.freelancePt?.ptCurrentCourse || 0,
                        ptMaxCourse: pt?.freelancePt?.ptMaxCourse || 0,
                      })
                    }
                  >
                    {/* Package Image */}
                    <View style={styles.packageImageContainer}>
                      <Image
                        source={
                          packageItem.imageUrl &&
                          packageItem.imageUrl !== "string"
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
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.purchasedBadgeText}>
                            {t("freelancePT.purchased")}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Package Info */}
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageName} numberOfLines={2}>
                        {packageItem.name || t("freelancePT.untitledPackage")}
                      </Text>

                      <Text style={styles.packageDescription} numberOfLines={2}>
                        {packageItem.description ||
                          t("freelancePT.noDescription")}
                      </Text>

                      <View style={styles.packageDetailsRow}>
                        <View style={styles.packageDetailItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.packageDetailText}>
                            {packageItem.durationInDays || 0}{" "}
                            {t("freelancePT.days")}
                          </Text>
                        </View>
                        <View style={styles.packageDetailItem}>
                          <MaterialCommunityIcons
                            name="dumbbell"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.packageDetailText}>
                            {packageItem.numOfSessions || 0}{" "}
                            {t("freelancePT.sessions")}
                          </Text>
                        </View>
                        <View style={styles.packageDetailItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.packageDetailText}>
                            {packageItem.sessionDurationInMinutes || 0}{" "}
                            {t("freelancePT.minutes")}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.packageFooter}>
                        <View style={styles.packagePriceContainer}>
                          <Text style={styles.packagePrice}>
                            {packageItem.price
                              ? formatPrice(packageItem.price)
                              : t("freelancePT.contactForPricing")}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.packageButton}
                          onPress={() =>
                            navigation.navigate(
                              "FreelancePTPackageDetailScreen",
                              {
                                freelancePTPackageId: packageItem.id,
                                purchasedPackage: purchasedPackage,
                                ptCurrentCourse:
                                  pt?.freelancePt?.ptCurrentCourse || 0,
                                ptMaxCourse: pt?.freelancePt?.ptMaxCourse || 0,
                              }
                            )
                          }
                        >
                          <Text style={styles.packageButtonText}>
                            {t("freelancePT.viewDetails")}
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#ED2A46"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.emptyPackagesContainer}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={64}
                  color="#ccc"
                />
                <Text style={styles.emptyPackagesText}>
                  {t("freelancePT.noPackagesAvailableYet")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <View style={styles.packagesContainer}>
            <View style={styles.reviewsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{avgRating}</Text>
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
                      fetchPTReview={fetchPTReview}
                    />
                  ))}

                  {reviewsPage < reviewsTotalPages && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={() => fetchPTReview(reviewsPage + 1)}
                      disabled={reviewsLoading}
                    >
                      {reviewsLoading ? (
                        <LoadingIndicator variant="inline" />
                      ) : (
                        <>
                          <Text style={styles.loadMoreText}>
                            {t("common.loadMore") || "Load More"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#ED2A46"
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.reviewsEmpty}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={48}
                    color="#E0E0E0"
                  />
                  <Text style={styles.reviewsEmptyText}>
                    {t("freelancePT.noReviews") || "No reviews yet"}
                  </Text>
                  <Text style={styles.reviewsEmptySubtext}>
                    {t("freelancePT.beFirstToReview") ||
                      "Be the first to share your experience with this trainer"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Certificate Modal */}
      <Modal
        visible={certificateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCertificateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("freelancePT.certificateModal.title")}
              </Text>
              <TouchableOpacity
                onPress={() => setCertificateModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalImageContainer}
              contentContainerStyle={styles.modalImageContent}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={true}
            >
              {selectedCertificateUrl && (
                <Image
                  source={{ uri: selectedCertificateUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Showcase Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContainer}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>
                {selectedImageIndex + 1} /{" "}
                {pt?.freelancePt?.freelancePtImages?.length || 0}
              </Text>
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                style={styles.imageModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={imageScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x /
                    Dimensions.get("window").width
                );
                setSelectedImageIndex(index);
              }}
            >
              {pt?.freelancePt?.freelancePtImages?.map((imageUrl, index) => (
                <View key={index} style={styles.imageModalImageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imageModalImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
            {pt?.freelancePt?.freelancePtImages?.length > 1 && (
              <View style={styles.imageModalPagination}>
                {pt.freelancePt.freelancePtImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.imageModalDot,
                      selectedImageIndex === index &&
                        styles.imageModalDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 80,
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
    marginTop: -60,
    zIndex: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 20,
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
    gap: 12,
  },
  certificationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF914D",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  certificationCardInactive: {
    borderColor: "#e0e0e0",
    opacity: 0.7,
  },
  certificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  certificationHeaderLeft: {
    flexDirection: "row",
    flex: 1,
  },
  certificationHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  certificationChevron: {
    marginLeft: 4,
  },
  certificationContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 12,
  },
  certificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  certificationTitleContainer: {
    flex: 1,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  certificationProvider: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  certificationStatusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificationStatusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  certificationCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  certificationCodeLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 6,
    fontWeight: "600",
  },
  certificationCode: {
    fontSize: 12,
    color: "#FF914D",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  certificationTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  certificationType: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  certificationDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  certificationSpecializations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE0E3",
  },
  specializationTagText: {
    fontSize: 11,
    color: "#ED2A46",
    fontWeight: "600",
  },
  certificationDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  certificationDateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  certificationDateText: {
    fontSize: 11,
    color: "#666",
  },
  certificationViewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  certificationViewLinkText: {
    fontSize: 13,
    color: "#FF914D",
    fontWeight: "600",
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
  // Announcement Section Styles
  announcementSectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(100px)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderRadius: 35,
    margin: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  announcementTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  announcementText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  announcementText2: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  // Certificate Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.95,
    height: Dimensions.get("window").height * 0.9,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageContainer: {
    flex: 1,
  },
  modalImageContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalImage: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
    minHeight: 400,
  },
  /* Reviews Section Styles */
  reviewsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    display: "flex",
    marginBottom: 12,
    gap: 8,
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
  // Image Gallery Styles
  imageGalleryContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  imageGalleryItem: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageGalleryImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  imageModalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  imageModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imageModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  imageModalPagination: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  imageModalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  imageModalDotActive: {
    backgroundColor: "#FF914D",
    width: 24,
  },
});

export default PTProfileScreen;
