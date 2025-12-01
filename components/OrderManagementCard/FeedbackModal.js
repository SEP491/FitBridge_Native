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
import reviewService from "../../services/reviewService";

const FeedbackModal = ({ visible, onClose, orderItems = [] }) => {
  const { t } = useTranslation();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = orderItems[currentItemIndex];
  const currentFeedback = feedbackData[currentItem?.id] || {
    rating: 0,
    content: "",
    images: [],
  };
  console.log("Current feedback data:", currentItem);

  const updateCurrentFeedback = (updates) => {
    setFeedbackData({
      ...feedbackData,
      [currentItem.id]: {
        ...currentFeedback,
        ...updates,
      },
    });
  };

  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("errors.error"),
          t("errors.photoPermissionRequired")
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 3 - currentFeedback.images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        updateCurrentFeedback({
          images: [...currentFeedback.images, ...newImages],
        });
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
          t("errors.cameraPermissionRequired") || "Camera permission is required to take photos"
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
        updateCurrentFeedback({
          images: [...currentFeedback.images, newImage],
        });
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(t("errors.error"), t("errors.cameraError") || "Failed to take picture. Please try again.");
    }
  };

  const handleAddImage = () => {
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
    updateCurrentFeedback({
      images: currentFeedback.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (currentFeedback.rating === 0) {
      Alert.alert(t("errors.error"), t("orders.pleaseSelectRating"));
      return;
    }

    if (!currentFeedback.content.trim()) {
      Alert.alert(t("errors.error"), t("orders.pleaseEnterFeedback"));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderItemId", currentItem.id);
      formData.append("rating", currentFeedback.rating.toString());
      formData.append("content", currentFeedback.content.trim());

      // Append images
      currentFeedback.images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });

      console.log("Submitting review with data:", {
        orderItemId: currentItem.id,
        rating: currentFeedback.rating,
        content: currentFeedback.content.trim(),
        images: currentFeedback.images,
      });

      await reviewService.createReview(formData);

      // Check if there are more items to review
      if (currentItemIndex < orderItems.length - 1) {
        Alert.alert(
          t("orders.feedbackSuccess"),
          t("orders.feedbackSubmittedNext"),
          [
            {
              text: t("common.ok"),
              onPress: () => {
                // Move to next item
                setCurrentItemIndex(currentItemIndex + 1);
              },
            },
          ]
        );
      } else {
        // This was the last item
        Alert.alert(
          t("orders.feedbackSuccess"),
          t("orders.allFeedbacksSubmitted"),
          [
            {
              text: t("common.ok"),
              onPress: () => {
                resetForm();
                onClose(true); // Pass true to indicate successful submission
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        t("errors.error"),
        error.response?.data?.message || t("orders.feedbackError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentItemIndex < orderItems.length - 1) {
      Alert.alert(
        t("common.warning"),
        t("orders.skipFeedback"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("orders.skip"),
            onPress: () => {
              setCurrentItemIndex(currentItemIndex + 1);
            },
          },
        ]
      );
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const resetForm = () => {
    setFeedbackData({});
    setCurrentItemIndex(0);
  };

  const handleClose = () => {
    // Check if any feedback has been entered
    const hasAnyFeedback = Object.values(feedbackData).some(
      (fb) => fb.rating > 0 || fb.content.trim() || fb.images.length > 0
    );

    if (hasAnyFeedback) {
      Alert.alert(
        t("common.warning"),
        t("orders.discardFeedback"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.confirm"),
            onPress: () => {
              resetForm();
              onClose(false);
            },
            style: "destructive",
          },
        ]
      );
    } else {
      onClose(false);
    }
  };

  if (!currentItem) {
    return null;
  }

  const getProductName = () => {
    const detail = currentItem.productDetail;
    if (!detail) return t("orders.product");
    
    let name = detail.flavourName || detail.productName || t("orders.product");
    if (detail.weightValue > 0) {
      name += ` - ${detail.weightValue}${detail.weightUnit || ""}`;
    }
    return name;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{t("orders.leaveFeedback")}</Text>
              <Text style={styles.headerSubtitle}>
                {t("orders.item")} {currentItemIndex + 1} / {orderItems.length}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Info */}
            <View style={styles.productSection}>
              <View style={styles.productRow}>
                {currentItem.productDetail?.imageUrl && (
                  <Image
                    source={{ uri: currentItem.productDetail.imageUrl }}
                    style={styles.productImage}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>{t("orders.product")}:</Text>
                  <Text style={styles.productName}>{getProductName()}</Text>
                  {currentItem.productDetail?.proteinPerServingGrams > 0 && (
                    <Text style={styles.productNutrition}>
                      {t("orders.protein")}: {currentItem.productDetail.proteinPerServingGrams}g
                      {" | "}
                      {t("orders.calories")}: {currentItem.productDetail.caloriesPerServingKcal}kcal
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.yourRating")} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateCurrentFeedback({ rating: star })}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= currentFeedback.rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= currentFeedback.rating ? "#FFD700" : "#DDD"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {currentFeedback.rating > 0 && (
                <Text style={styles.ratingText}>
                  {currentFeedback.rating === 1 && t("orders.rating1")}
                  {currentFeedback.rating === 2 && t("orders.rating2")}
                  {currentFeedback.rating === 3 && t("orders.rating3")}
                  {currentFeedback.rating === 4 && t("orders.rating4")}
                  {currentFeedback.rating === 5 && t("orders.rating5")}
                </Text>
              )}
            </View>

            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.yourReview")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t("orders.reviewPlaceholder")}
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={currentFeedback.content}
                onChangeText={(text) => updateCurrentFeedback({ content: text })}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {currentFeedback.content.length}/500
              </Text>
            </View>

            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.addPhotos")} ({currentFeedback.images.length}/3)
              </Text>
              <View style={styles.imagesContainer}>
                {currentFeedback.images.map((image, index) => (
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
                {currentFeedback.images.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleAddImage}
                  >
                    <Ionicons name="camera-outline" size={32} color="#999" />
                    <Text style={styles.addImageText}>{t("orders.addPhoto")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer with Navigation */}
          <View style={styles.footer}>
            <View style={styles.navigationButtons}>
              {currentItemIndex > 0 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={20} color="#ED2A46" />
                  <Text style={styles.navButtonText}>{t("orders.previous")}</Text>
                </TouchableOpacity>
              )}
              
              {currentItemIndex < orderItems.length - 1 && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipButtonText}>{t("orders.skip")}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (currentFeedback.rating === 0 || !currentFeedback.content.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={currentFeedback.rating === 0 || !currentFeedback.content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {currentItemIndex < orderItems.length - 1
                    ? t("orders.submitAndNext")
                    : t("orders.submitFeedback")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: "65%",
  },
  productSection: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productNutrition: {
    fontSize: 12,
    color: "#999",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  required: {
    color: "#E74C3C",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 120,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 4,
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
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 36,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "500",
    marginLeft: 4,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FeedbackModal;
