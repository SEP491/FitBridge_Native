import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import certificateService from "../../../services/certificateService";
import { fetchUserFromStorage } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";
import LoadingIndicator from "../../../components/LoadingIndicator";

export default function ManageCerScreen() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [certificateMetadata, setCertificateMetadata] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [providedDate, setProvidedDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [image, setImage] = useState(null);
  const [selectingMetadata, setSelectingMetadata] = useState(false);
  const [showProvidedDatePicker, setShowProvidedDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] =
    useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Status filter options
  const statusFilters = [
    { key: "all", label: t("certificate.status.all") || "All" },
    { key: "active", label: t("certificate.status.active") },
    {
      key: "waitingforreview",
      label: t("certificate.status.waitingForReview"),
    },
    { key: "rejected", label: t("certificate.status.rejected") },
    { key: "expired", label: t("certificate.status.expired") },
  ];

  // Filtered certificates based on selected status
  const filteredCertificates =
    selectedStatus === "all"
      ? certificates
      : certificates.filter(
          (cert) => cert.certificateStatus?.toLowerCase() === selectedStatus
        );

  // Format date to dd-mm-yyyy for display
  const formatDateDisplay = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    // If it's already in dd-mm-yyyy format, convert to YYYY-MM-DD
    const parts = dateString.split("-");
    if (parts.length === 3) {
      // Assume format is dd-mm-yyyy
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    // If it's a Date object or ISO string, format it
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // Parse dd-mm-yyyy string to Date object
  const parseDateString = (dateString) => {
    if (!dateString) return new Date();
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date();
  };

  const handleProvidedDateConfirm = (selectedDate) => {
    setShowProvidedDatePicker(false);

    // Check if expiration date is already set and if provided date is after it
    if (expirationDate) {
      const expirationDateObj = parseDateString(expirationDate);
      if (selectedDate > expirationDateObj) {
        Alert.alert(
          t("certificate.error") || "Error",
          t("certificate.providedDateMustBeBeforeExpiration") ||
            "Provided date must be before expiration date"
        );
        return;
      }
    }

    setProvidedDate(formatDateDisplay(selectedDate));
  };

  const handleExpirationDateConfirm = (selectedDate) => {
    setShowExpirationDatePicker(false);

    // Check if provided date is already set and if expiration date is before it
    if (providedDate) {
      const providedDateObj = parseDateString(providedDate);
      if (selectedDate <= providedDateObj) {
        Alert.alert(
          t("certificate.error") || "Error",
          t("certificate.expirationDateMustBeAfterProvided") ||
            "Expiration date must be after provided date"
        );
        return;
      }
    }

    setExpirationDate(formatDateDisplay(selectedDate));
  };

  useEffect(() => {
    fetchUser();
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const userFromStorage = await fetchUserFromStorage();
      if (userFromStorage) {
        setUser(userFromStorage);
      }
      console.log("Fetched user:", userFromStorage);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await certificateService.getCertificateForPT({
        ptId: user?.id,
        page: 1,
        size: 10,
      });
      if (response.data && response.data.items) {
        setCertificates(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      console.log("Fetching certificate metadata...");
      const response = await certificateService.getCertificateMetadata();
      console.log("Metadata response:", response);
      if (response.data?.items) {
        console.log("Metadata items:", response.data.items);
        setCertificateMetadata(response.data.items);
      } else {
        console.log("No metadata items found in response");
      }
    } catch (error) {
      console.error("Error fetching certificate metadata:", error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const pickImage = async (useCamera = false) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          t("certificate.permissionRequired"),
          t("certificate.permissionMessage")
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri,
          name:
            asset.fileName ||
            `certificate-${Date.now()}.${asset.uri.split(".").pop() || "jpg"}`,
          type: asset.mimeType || "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const resetForm = () => {
    setSelectedMetadata(null);
    setProvidedDate("");
    setExpirationDate("");
    setImage(null);
  };

  const handleCreateCertificate = async () => {
    if (!selectedMetadata?.id) {
      Alert.alert(
        t("certificate.missingInfo"),
        t("certificate.missingInfoMessage")
      );
      return;
    }
    if (!providedDate) {
      Alert.alert(
        t("certificate.missingDate"),
        t("certificate.missingDateMessage")
      );
      return;
    }

    // Validate that provided date is before expiration date
    if (expirationDate) {
      const providedDateObj = parseDateString(providedDate);
      const expirationDateObj = parseDateString(expirationDate);
      if (providedDateObj >= expirationDateObj) {
        Alert.alert(
          t("certificate.error") || "Error",
          t("certificate.providedDateMustBeBeforeExpiration") ||
            "Provided date must be before expiration date"
        );
        return;
      }
    }

    if (!image) {
      Alert.alert(
        t("certificate.missingImage"),
        t("certificate.missingImageMessage")
      );
      return;
    }

    const formData = new FormData();
    formData.append("ptId", user?.id);
    formData.append("certificateMetadataId", selectedMetadata.id);
    formData.append("providedDate", formatDateForAPI(providedDate));
    formData.append(
      "expirationDate",
      expirationDate ? formatDateForAPI(expirationDate) : ""
    );
    formData.append("certUrl", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    });

    try {
      setSubmitting(true);
      await certificateService.createCertificate(formData);
      resetForm();
      setShowForm(false);
      fetchCertificates();
      Alert.alert(t("certificate.success"), t("certificate.createSuccess"));
    } catch (error) {
      console.error("Error creating certificate:", error);
      Alert.alert(t("certificate.error"), t("certificate.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#4CAF50";
      case "waitingforreview":
        return "#FF914D";
      case "rejected":
        return "#F44336";
      case "expired":
        return "#6B6B6B";
      default:
        return "#6B6B6B";
    }
  };

  // Translate certificate status
  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "waitingforreview":
        return t("certificate.status.waitingForReview");
      case "rejected":
        return t("certificate.status.rejected");
      case "active":
        return t("certificate.status.active");
      case "expired":
        return t("certificate.status.expired");
      default:
        return status;
    }
  };

  // Format date string to dd-mm-yyyy
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    // Handle various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's already in dd-mm-yyyy format, return as is
      return dateString;
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderCertificate = ({ item }) => {
    const metadata = item.certificateMetadata || {};

    return (
      <View style={styles.certificateCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconBadge}>
              <Ionicons name="ribbon" size={24} color={colors.red} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.certificateName} numberOfLines={1}>
                {metadata.certName || item.ptName}
              </Text>
              <Text style={styles.providerName} numberOfLines={1}>
                {metadata.providerName}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge - Moved below header */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${getStatusColor(item.certificateStatus)}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.certificateStatus) },
              ]}
            >
              {getStatusText(item.certificateStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Card Body */}
        <View style={styles.cardBody}>
          {metadata.certCode && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("certificate.code")}:</Text>
              <Text style={styles.infoValue}>{metadata.certCode}</Text>
            </View>
          )}
          {metadata.certificateType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("certificate.type")}:</Text>
              <Text style={styles.infoValue}>{metadata.certificateType}</Text>
            </View>
          )}
          {metadata.specializations?.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t("certificate.specializations")}:
              </Text>
              <Text style={styles.infoValue}>
                {metadata.specializations.join(", ")}
              </Text>
            </View>
          )}

          {/* Date Section */}
          <View style={styles.dateSection}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>{t("certificate.provided")}</Text>
              <Text style={styles.dateValue}>
                {formatDateForDisplay(item.providedDate)}
              </Text>
            </View>
            {item.expirationDate && (
              <>
                <View style={styles.dateSeparator} />
                <View style={styles.dateColumn}>
                  <Text style={styles.dateLabel}>
                    {t("certificate.expires")}
                  </Text>
                  <Text style={styles.dateValue}>
                    {formatDateForDisplay(item.expirationDate)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Certificate Image */}
        {item.certUrl && (
          <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
            <Image
              source={{ uri: item.certUrl }}
              style={styles.certificateImage}
            />
          </TouchableOpacity>
        )}

        {/* Note Section */}
        {item.note && (
          <View style={styles.noteSection}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#FF914D"
            />
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMetadataItem = ({ item }) => (
    <TouchableOpacity
      style={styles.metadataCard}
      onPress={() => {
        setSelectedMetadata(item);
        setSelectingMetadata(false);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.metadataIconBadge}>
        <Ionicons name="ribbon" size={22} color={colors.red} />
      </View>
      <View style={styles.metadataInfo}>
        <Text style={styles.metadataName}>{item.certName}</Text>
        <Text style={styles.metadataCode}>{item.certCode}</Text>
        <Text style={styles.metadataProvider}>{item.providerName}</Text>
        <View style={styles.metadataTagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.certificateType}</Text>
          </View>
          {item.specializations?.slice(0, 2).map((spec, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>{t("certificate.noCertificates")}</Text>
      <Text style={styles.emptySubtitle}>
        {t("certificate.noCertificatesDesc")}
      </Text>
    </View>
  );

  const renderMetadataEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>
        {t("certificate.noCertificateTypes")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Status Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedStatus === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedStatus(filter.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedStatus === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {selectedStatus === filter.key && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {filter.key === "all"
                      ? certificates.length
                      : certificates.filter(
                          (c) =>
                            c.certificateStatus?.toLowerCase() === filter.key
                        ).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingIndicator
          variant="page"
          message={t("certificate.loadingCertificates")}
        />
      ) : (
        <FlatList
          data={filteredCertificates}
          keyExtractor={(item) => item.id}
          renderItem={renderCertificate}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setShowForm(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Certificate Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (selectingMetadata) {
            setSelectingMetadata(false);
          } else {
            setShowForm(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              {/* Modal Handle */}
              <View style={styles.modalHandle} />

              {selectingMetadata ? (
                /* Certificate Type Selection View */
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => setSelectingMetadata(false)}
                      style={styles.modalBackButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-back" size={24} color="#64748B" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>
                      {t("certificate.selectCertificateType")}
                    </Text>
                    <View style={{ width: 28 }} />
                  </View>

                  {loadingMetadata ? (
                    <LoadingIndicator
                      variant="inline"
                      message={t("certificate.loadingCertificateTypes")}
                    />
                  ) : (
                    <FlatList
                      data={certificateMetadata}
                      keyExtractor={(item) => item.id}
                      renderItem={renderMetadataItem}
                      contentContainerStyle={styles.listContainer}
                      ListEmptyComponent={renderMetadataEmpty}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              ) : (
                /* Certificate Form View */
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {t("certificate.addCertificate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowForm(false)}
                      style={styles.modalCloseButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={28} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    {/* Certificate Type Selector */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        {t("certificate.certificateType")} *
                      </Text>
                      <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={() => setSelectingMetadata(true)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={20}
                          color="#64748B"
                        />
                        <Text
                          style={[
                            styles.selectorButtonText,
                            !selectedMetadata && styles.selectorPlaceholder,
                          ]}
                          numberOfLines={1}
                        >
                          {selectedMetadata
                            ? `${selectedMetadata.certName} (${selectedMetadata.certCode})`
                            : t("certificate.selectCertificateTypePlaceholder")}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Provided Date */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        {t("certificate.providedDate")} *
                      </Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowProvidedDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#64748B"
                        />
                        <Text
                          style={[
                            styles.dateText,
                            !providedDate && styles.datePlaceholder,
                          ]}
                        >
                          {providedDate || t("certificate.selectProvidedDate")}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Expiration Date */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        {t("certificate.expirationDate")} *
                      </Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowExpirationDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#64748B"
                        />
                        <Text
                          style={[
                            styles.dateText,
                            !expirationDate && styles.datePlaceholder,
                          ]}
                        >
                          {expirationDate ||
                            t("certificate.selectExpirationDate")}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Certificate Image */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        {t("certificate.certificateImage")} *
                      </Text>
                      <View style={styles.imagePickerRow}>
                        <TouchableOpacity
                          style={styles.imagePickerButton}
                          onPress={() => pickImage(false)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="images-outline"
                            size={24}
                            color={colors.red}
                          />
                          <Text style={styles.imagePickerText}>
                            {t("certificate.gallery")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.imagePickerButton}
                          onPress={() => pickImage(true)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="camera-outline"
                            size={24}
                            color={colors.red}
                          />
                          <Text style={styles.imagePickerText}>
                            {t("certificate.camera")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {image?.uri && (
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: image.uri }}
                            style={styles.imagePreview}
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setImage(null)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="close-circle"
                              size={28}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        submitting && styles.submitButtonDisabled,
                      ]}
                      onPress={handleCreateCertificate}
                      disabled={submitting}
                      activeOpacity={0.8}
                    >
                      {submitting ? (
                        <LoadingIndicator variant="button" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#fff"
                          />
                          <Text style={styles.submitButtonText}>
                            {t("certificate.saveCertificate")}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* Date Pickers - Inside Modal as siblings to modalOverlay */}
        <DateTimePickerModal
          isVisible={showProvidedDatePicker}
          mode="date"
          onConfirm={handleProvidedDateConfirm}
          onCancel={() => setShowProvidedDatePicker(false)}
          date={providedDate ? parseDateString(providedDate) : new Date()}
          maximumDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={showExpirationDatePicker}
          mode="date"
          onConfirm={handleExpirationDateConfirm}
          onCancel={() => setShowExpirationDatePicker(false)}
          date={
            expirationDate
              ? parseDateString(expirationDate)
              : providedDate
              ? (() => {
                  const minDate = parseDateString(providedDate);
                  minDate.setDate(minDate.getDate() + 1);
                  return minDate;
                })()
              : new Date()
          }
          minimumDate={
            providedDate
              ? (() => {
                  const minDate = parseDateString(providedDate);
                  // Set minimum date to the day after provided date
                  minDate.setDate(minDate.getDate() + 1);
                  return minDate;
                })()
              : undefined
          }
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Filter Tabs
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.red,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  // List Container
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },

  // Certificate Card
  certificateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  providerName: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // Status Container - for badge below header
  statusContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // Card Body
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 6,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },

  // Date Section
  dateSection: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateSeparator: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 14,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },

  // Certificate Image
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  certificateImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#F8FAFC",
    resizeMode: "cover",
  },

  // Note Section
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7ED",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF914D",
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginLeft: 10,
  },

  // Modal Overlay & Container
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  // Modal Header
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBackButton: {
    padding: 4,
    marginRight: 12,
  },

  // Modal Scroll Content
  modalScrollContent: {
    padding: 20,
    paddingBottom: 24,
  },

  // Form Elements
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },

  // Selector Button
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    marginLeft: 10,
    fontWeight: "500",
  },
  selectorPlaceholder: {
    color: "#94A3B8",
    fontWeight: "400",
  },

  // Date Input
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    marginLeft: 10,
    fontWeight: "500",
  },
  datePlaceholder: {
    color: "#94A3B8",
    fontWeight: "400",
  },

  // Input Wrapper
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    paddingVertical: 14,
    paddingLeft: 10,
  },

  // Image Picker
  imagePickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F7",
    borderWidth: 1.5,
    borderColor: colors.red,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red,
  },

  // Image Preview
  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 220,
    backgroundColor: "#F8FAFC",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 14,
  },

  // Submit Button
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Metadata Card
  metadataCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  metadataIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  metadataInfo: {
    flex: 1,
  },
  metadataName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  metadataCode: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.red,
    marginBottom: 4,
  },
  metadataProvider: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
  },
  metadataTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
});
