import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "../../hooks/useTranslation";
import reportService from "../../services/reportService";
import uploadImageService from "../../services/uploadImageService";

const ReportModal = ({ visible, onClose, orderItems = [] }) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("Order Items in Report Modal:", orderItems);
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleBackToList = () => {
    if (title.trim() || description.trim() || images.length > 0) {
      Alert.alert(
        t("common.warning"),
        t("orders.unsavedReport") ||
          "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.confirm"),
            style: "destructive",
            onPress: () => {
              resetForm();
              setShowForm(false);
              setSelectedItem(null);
            },
          },
        ]
      );
    } else {
      setShowForm(false);
      setSelectedItem(null);
    }
  };

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("errors.error"), t("errors.photoPermissionRequired"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert(t("errors.error"), t("errors.imagePickError"));
    }
  };

  const handleTakePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("errors.error"),
          t("errors.cameraPermissionRequired") ||
            "Camera permission is required to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || "image/jpeg",
          name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(
        t("errors.error"),
        t("errors.cameraError") || "Failed to take picture. Please try again."
      );
    }
  };

  const handleAddImage = () => {
    if (images.length >= 5) {
      Alert.alert(
        t("errors.error"),
        t("orders.maxImagesReached") || "Maximum 5 images allowed"
      );
      return;
    }

    Alert.alert(
      t("orders.addPhoto") || "Add Photo",
      t("orders.selectPhotoSource") || "Select photo source",
      [
        {
          text: t("orders.takePhoto") || "Take Photo",
          onPress: handleTakePicture,
        },
        {
          text: t("orders.choosePhoto") || "Choose Photo",
          onPress: handlePickImages,
        },
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.pleaseEnterTitle") || "Please enter a title"
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        t("errors.error"),
        t("myPackage.reportModal.pleaseEnterDescription") ||
          "Please enter a description"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images first
      const imageUrls = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });

        const uploadResponse = await uploadImageService.uploadImage(formData);
        if (uploadResponse.status === "200" && uploadResponse.data) {
          imageUrls.push(uploadResponse.data);
        }
      }

      // Create report with order item ID
      const reportPayload = {
        reportedItemId: selectedItem.id,
        title: title.trim(),
        description: description.trim(),
        reportType: "OrderReport",
        imageUrls: imageUrls,
      };

      console.log("Submitting report with data:", reportPayload);

      const response = await reportService.createReport(reportPayload);

      if (response.status === "200" || response.status === "201") {
        Alert.alert(
          t("common.success"),
          t("myPackage.reportModal.submitSuccess") ||
            "Report submitted successfully!",
          [
            {
              text: t("common.ok"),
              onPress: () => {
                resetForm();
                setShowForm(false);
                setSelectedItem(null);
                onClose(true);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t("errors.error"),
          response?.message ||
            t("myPackage.reportModal.submitFailed") ||
            "Failed to submit report"
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        t("errors.error"),
        error?.response?.data?.message ||
          t("myPackage.reportModal.submitFailedRetry") ||
          "Failed to submit report. Please try again."
      );
    } finally {
      setShowForm(false);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImages([]);
  };

  const handleClose = () => {
    if (showForm && (title.trim() || description.trim() || images.length > 0)) {
      Alert.alert(
        t("common.warning"),
        t("orders.unsavedReport") ||
          "You have unsaved changes. Are you sure you want to close?",
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.close"),
            style: "destructive",
            onPress: () => {
              resetForm();
              setShowForm(false);
              setSelectedItem(null);
              onClose(false);
            },
          },
        ]
      );
    } else {
      resetForm();
      setShowForm(false);
      setSelectedItem(null);
      onClose(false);
    }
  };

  const renderProductList = () => (
    <>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {t("myPackage.report") || "Report Issue"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t("orders.selectProduct") || "Select a product to report"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productListSection}>
          <Text style={styles.productListTitle}>
            {t("orders.orderItems") || "Order Items"} ({orderItems.length})
          </Text>
          {orderItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productListItem}
              onPress={() => handleSelectItem(item)}
              activeOpacity={0.7}
            >
              <View style={styles.productListCard}>
                {item.productDetail?.imageUrl ? (
                  <Image
                    source={{ uri: item.productDetail.imageUrl }}
                    style={styles.productListImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productListPlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#CCC" />
                  </View>
                )}
                <View style={styles.productListInfo}>
                  <Text style={styles.productListName} numberOfLines={2}>
                    {item.productDetail?.flavourName || "Product"}
                    {item.productDetail?.weightValue > 0 &&
                      ` - ${item.productDetail.weightValue}${
                        item.productDetail.weightUnit || ""
                      }`}
                  </Text>
                  <Text style={styles.productListQuantity}>
                    {t("orders.quantity")}: {item.quantity}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );

  const renderReportForm = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {t("myPackage.report") || "Report Issue"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
        <View style={styles.productSection}>
          <View style={styles.productCard}>
            {selectedItem?.productDetail?.imageUrl ? (
              <Image
                source={{ uri: selectedItem.productDetail.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#CCC" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {selectedItem?.productDetail?.flavourName || "Product"}
                {selectedItem?.productDetail?.weightValue > 0 &&
                  ` - ${selectedItem.productDetail.weightValue}${
                    selectedItem.productDetail.weightUnit || ""
                  }`}
              </Text>
              <Text style={styles.productQuantity}>
                {t("orders.quantity")}: {selectedItem?.quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Report Form */}
        <View style={styles.formSection}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t("myPackage.reportModal.title") || "Title"}{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.titleInput}
              placeholder={
                t("myPackage.reportModal.titlePlaceholder") ||
                "Brief summary of the issue"
              }
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t("myPackage.reportModal.description") || "Description"}{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder={
                t("myPackage.reportModal.descriptionPlaceholder") ||
                "Describe the issue in detail..."
              }
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Images Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t("myPackage.reportModal.photos") || "Photos"}{" "}
              <Text style={styles.optional}>
                ({t("common.optional") || "Optional"})
              </Text>
            </Text>
            <Text style={styles.photoHint}>
              {t("myPackage.reportModal.photoHint") ||
                "Add up to 5 photos to support your report"}
            </Text>

            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                >
                  <Ionicons name="camera-outline" size={32} color="#999" />
                  <Text style={styles.addImageText}>
                    {t("orders.addPhoto") || "Add Photo"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flag" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {t("myPackage.reportModal.submitReport") || "Submit Report"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {showForm ? renderReportForm() : renderProductList()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
  productListSection: {
    padding: 16,
  },
  productListTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  productListItem: {
    marginBottom: 12,
  },
  productListCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productListImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  productListPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  productListInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productListName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productListQuantity: {
    fontSize: 13,
    color: "#666",
  },
  productSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productQuantity: {
    fontSize: 13,
    color: "#666",
  },
  formSection: {
    backgroundColor: "#fff",
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#E74C3C",
  },
  optional: {
    fontSize: 13,
    fontWeight: "400",
    color: "#999",
  },
  titleInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  descriptionInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  photoHint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  addImageText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  bottomActions: {
    
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#CCC",
  },
  submitButton: {
    backgroundColor: "#E74C3C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default ReportModal;
