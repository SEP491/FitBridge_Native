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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "../../hooks/useTranslation";
import reviewService from "../../services/reviewService";

const PackageFeedbackModal = ({ visible, onClose, packageItem }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("Package Item in Feedback Modal:", packageItem);
  
  // Extract orderItem - support both direct orderItem or nested structure
  const orderItem = packageItem?.orderItem || packageItem;
  console.log("Extracted orderItem:", orderItem);
  console.log("OrderItem ID:", orderItem?.id);
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
        selectionLimit: 3 - images.length,
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
        setImages([...images, newImage]);
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
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t("errors.error") || "Error", t("orders.pleaseSelectRating") || "Please select a rating");
      return;
    }

    if (!content.trim()) {
      Alert.alert(t("errors.error") || "Error", t("orders.pleaseEnterFeedback") || "Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Use orderItem.id as orderItemId (from the API response structure)
      const orderItemId = orderItem?.id;

      if (!orderItemId) {
        console.error("Missing orderItemId. OrderItem:", orderItem);
        console.error("PackageItem:", packageItem);
        Alert.alert(
          t("errors.error") || "Error", 
          "Invalid package item: Missing orderItemId"
        );
        setIsSubmitting(false);
        return;
      }

      formData.append("orderItemId", orderItemId);
      formData.append("rating", rating.toString());
      formData.append("content", content.trim());

      // Append images
      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });

      console.log("Submitting package review with data:", {
        orderItemId: orderItemId,
        rating: rating,
        content: content.trim(),
        images: images.length,
      });

      await reviewService.createReview(formData);

      Alert.alert(
        t("common.success") || "Success",
        t("orders.feedbackSubmitted") || "Your feedback has been submitted successfully!",
        [
          {
            text: t("common.ok") || "OK",
            onPress: () => {
              resetForm();
              onClose(true);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting package feedback:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        orderItemId: orderItem?.id,
      });
      Alert.alert(
        t("errors.error") || "Error",
        error.response?.data?.message || error.message || t("orders.feedbackError") || "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setContent("");
    setImages([]);
  };

  const handleClose = () => {
    if (rating > 0 || content.trim() || images.length > 0) {
      Alert.alert(
        t("common.warning") || "Warning",
        t("orders.discardFeedback") || "Are you sure you want to discard your feedback?",
        [
          {
            text: t("common.cancel") || "Cancel",
            style: "cancel",
          },
          {
            text: t("common.confirm") || "Confirm",
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

  const getPackageName = () => {
    // Use productName from orderItem, or fallback to packageName
    return orderItem?.productName || packageItem?.packageName || t("myPackage.package") || "Package";
  };

  const getPackageType = () => {
    // Determine type from orderItem structure
    const isGymCourse = !!orderItem?.gymCourseId;
    const gymCourse = orderItem?.gymCourse;
    const freelancePTPackage = orderItem?.freelancePTPackage;
    
    if (!isGymCourse && freelancePTPackage) {
      return t("myPackage.freelancePT") || "Freelance PT";
    } else if (isGymCourse && (gymCourse?.ptPrice > 0 || gymCourse?.pt)) {
      return t("myPackage.gymWithPT") || "Gym with PT";
    } else if (isGymCourse) {
      return t("myPackage.gymMembership") || "Gym Membership";
    }
    
    // Fallback to packageItem type if available
    if (packageItem?.type === "freelancePT") {
      return t("myPackage.freelancePT") || "Freelance PT";
    } else if (packageItem?.type === "gymCourseWithPT") {
      return t("myPackage.gymWithPT") || "Gym with PT";
    } else if (packageItem?.type === "gymCourseNormal") {
      return t("myPackage.gymMembership") || "Gym Membership";
    }
    return "";
  };

  const getPackageImageUrl = () => {
    // Get image from gymCourse or freelancePTPackage
    return orderItem?.gymCourse?.imageUrl || 
           orderItem?.freelancePTPackage?.imageUrl || 
           packageItem?.courseImageUrl;
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
              <Text style={styles.headerTitle}>
                {t("myPackage.leaveFeedback") || "Leave Feedback"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t("myPackage.shareExperience") || "Share your experience with this package"}
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
            {/* Package Info */}
            <View style={styles.packageSection}>
              <View style={styles.packageRow}>
                {getPackageImageUrl() && (
                  <Image
                    source={{ uri: getPackageImageUrl() }}
                    style={styles.packageImage}
                  />
                )}
                <View style={styles.packageInfo}>
                  <Text style={styles.packageLabel}>
                    {t("myPackage.package") || "Package"}:
                  </Text>
                  <Text style={styles.packageName}>{getPackageName()}</Text>
                  <Text style={styles.packageType}>{getPackageType()}</Text>
                </View>
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.yourRating") || "Your Rating"}{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFD700" : "#DDD"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && (t("orders.rating1") || "Poor")}
                  {rating === 2 && (t("orders.rating2") || "Fair")}
                  {rating === 3 && (t("orders.rating3") || "Good")}
                  {rating === 4 && (t("orders.rating4") || "Very Good")}
                  {rating === 5 && (t("orders.rating5") || "Excellent")}
                </Text>
              )}
            </View>

            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.yourReview") || "Your Review"}{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t("orders.reviewPlaceholder") || "Tell us about your experience..."}
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
                maxLength={500}
              />
              <Text style={styles.charCount}>{content.length}/500</Text>
            </View>

            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("orders.addPhotos") || "Add Photos"} ({images.length}/3)
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
                {images.length < 3 && (
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
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || !content.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || !content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("orders.submitFeedback") || "Submit Feedback"}
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
    maxHeight: "80%",
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
  packageSection: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  packageImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  packageType: {
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
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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

export default PackageFeedbackModal;
