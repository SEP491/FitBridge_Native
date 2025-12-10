import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import reviewService from "../../services/reviewService";
import { fetchUserFromStorage } from "../../lib";

const ReviewCard = ({
  review,
  t,
  showProductType = false,
  productTypeText = null,
  onReviewUpdated,
  onReviewDeleted,
}) => {
  console.log(review);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRating, setEditRating] = useState(review.rating || 5);
  const [editContent, setEditContent] = useState(review.content || "");
  const [editImages, setEditImages] = useState(review.imageUrls || []);
  const [editImageFiles, setEditImageFiles] = useState([]); // New image files to upload
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserFromStorage();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const closeImageViewer = () => {
    setModalVisible(false);
  };

  const navigateImage = (direction) => {
    if (direction === "next") {
      setSelectedImageIndex((prev) =>
        prev < review.imageUrls.length - 1 ? prev + 1 : 0
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev > 0 ? prev - 1 : review.imageUrls.length - 1
      );
    }
  };

  const openEditModal = () => {
    // Reset edit state when opening edit modal
    setEditRating(review.rating || 5);
    setEditContent(review.content || "");
    setEditImages(review.imageUrls || []);
    setEditImageFiles([]);
    setEditModalVisible(true);
  };

  const handleEditReview = () => {
    const buttons = [];

    if (!review.isEdited) {
      buttons.push({
        text: t ? t("common.edit") || "Edit" : "Edit",
        onPress: openEditModal,
      });
    }

    buttons.push({
      text: t ? t("common.delete") || "Delete" : "Delete",
      style: "destructive",
      onPress: handleDeleteAction,
    });

    Alert.alert(
      t ? t("common.actions") || "Actions" : "Actions",
      undefined,
      buttons
    );
  };

  const handleDeleteAction = () => {
    Alert.alert(
      t ? t("common.warning") || "Warning" : "Warning",
      t
        ? t("common.confirmDelete") ||
            "Are you sure you want to delete this review?"
        : "Are you sure you want to delete this review?",
      [
        {
          text: t ? t("common.cancel") || "Cancel" : "Cancel",
          style: "cancel",
        },
        {
          text: t ? t("common.delete") || "Delete" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await reviewService.deleteReview(review.id);
              Alert.alert(
                t ? t("common.success") || "Success" : "Success",
                t
                  ? t("common.deleteReviewSuccess") ||
                      "Review deleted successfully"
                  : "Review deleted successfully"
              );
              // Optionally refresh the parent component
              if (onReviewDeleted) {
                onReviewDeleted(review.id);
              }
            } catch (error) {
              Alert.alert(
                t ? t("common.error") || "Error" : "Error",
                t
                  ? t("common.deleteReviewError") || "Failed to delete review"
                  : "Failed to delete review"
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      Alert.alert(
        t ? t("common.warning") || "Warning" : "Warning",
        t
          ? t("common.enterReviewContent") || "Please enter review content"
          : "Please enter review content"
      );
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Add reviewId (required by API)
      formData.append("reviewId", review.id);

      // Add rating
      formData.append("rating", editRating.toString());

      // Add content
      formData.append("content", editContent);

      // Add existing images as array of strings (URLs)
      editImages.forEach((imageUri) => {
        formData.append("images", imageUri);
      });

      // Add new image files
      editImageFiles.forEach((imageFile) => {
        formData.append("images", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name,
        });
      });

      await reviewService.editReview(formData);
      Alert.alert(
        t ? t("common.success") || "Success" : "Success",
        t
          ? t("common.updateReviewSuccess") || "Review updated successfully"
          : "Review updated successfully"
      );
      setEditModalVisible(false);
      // Optionally refresh the parent component
      if (onReviewUpdated) {
        onReviewUpdated();
      }
    } catch (error) {
      Alert.alert(
        t ? t("common.error") || "Error" : "Error",
        t
          ? t("common.updateReviewError") || "Failed to update review"
          : "Failed to update review"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t ? t("errors.error") || "Error" : "Error",
          t
            ? t("errors.photoPermissionRequired") ||
                "Photo library permission is required"
            : "Photo library permission is required"
        );
        return;
      }

      const remainingSlots = 3 - (editImages.length + editImageFiles.length);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        const newImageFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setEditImageFiles([...editImageFiles, ...newImageFiles]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert(
        t ? t("errors.error") || "Error" : "Error",
        t
          ? t("errors.imagePickError") || "Failed to pick images"
          : "Failed to pick images"
      );
    }
  };

  const handleTakePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t ? t("errors.error") || "Error" : "Error",
          t
            ? t("errors.cameraPermissionRequired") ||
                "Camera permission is required"
            : "Camera permission is required"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const remainingSlots = 3 - (editImages.length + editImageFiles.length);
        if (remainingSlots <= 0) {
          Alert.alert(
            t ? t("common.warning") || "Warning" : "Warning",
            t
              ? t("common.maxImagesReached") || "Maximum 3 images allowed"
              : "Maximum 3 images allowed"
          );
          return;
        }

        const newImage = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || "image/jpeg",
          name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        };
        setEditImageFiles([...editImageFiles, newImage]);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(
        t ? t("errors.error") || "Error" : "Error",
        t
          ? t("errors.cameraError") || "Failed to take picture"
          : "Failed to take picture"
      );
    }
  };

  const handleAddImage = () => {
    const remainingSlots = 3 - (editImages.length + editImageFiles.length);
    if (remainingSlots <= 0) {
      Alert.alert(
        t ? t("common.warning") || "Warning" : "Warning",
        t
          ? t("common.maxImagesReached") || "Maximum 3 images allowed"
          : "Maximum 3 images allowed"
      );
      return;
    }

    Alert.alert(
      t ? t("orders.addPhoto") || "Add Photo" : "Add Photo",
      t
        ? t("orders.selectPhotoSource") || "Select photo source"
        : "Select photo source",
      [
        {
          text: t ? t("orders.takePhoto") || "Take Photo" : "Take Photo",
          onPress: handleTakePicture,
        },
        {
          text: t ? t("orders.choosePhoto") || "Choose Photo" : "Choose Photo",
          onPress: handlePickImages,
        },
        {
          text: t ? t("common.cancel") || "Cancel" : "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveImage = (index, isNewImage = false) => {
    Alert.alert(
      t ? t("common.confirm") || "Confirm" : "Confirm",
      t
        ? t("common.removeImage") || "Remove this image?"
        : "Remove this image?",
      [
        {
          text: t ? t("common.cancel") || "Cancel" : "Cancel",
          style: "cancel",
        },
        {
          text: t ? t("common.remove") || "Remove" : "Remove",
          style: "destructive",
          onPress: () => {
            if (isNewImage) {
              setEditImageFiles(editImageFiles.filter((_, i) => i !== index));
            } else {
              setEditImages(editImages.filter((_, i) => i !== index));
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewInfoContainer}>
            <View style={styles.reviewAvatar}>
              <Image
                source={{ uri: review.userAvatarUrl }}
                style={styles.reviewAvatarImage}
                defaultSource={require("../../assets/images/LogoColor.png")}
                resizeMode="contain"
              />
            </View>
            <View style={styles.reviewHeaderInfo}>
              <Text style={styles.reviewUserName}>{review.userName}</Text>
              <View style={styles.reviewRatingRow}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < review.rating ? "star" : "star-outline"}
                    size={14}
                    color={index < review.rating ? "#FFB800" : "#E0E0E0"}
                  />
                ))}
                <Text style={styles.reviewDate}>
                  {formatReviewDate(review.createdAt)}
                </Text>
              </View>
              {review.isEdited && (
                <Text style={styles.reviewEditedText}>
                  {t ? t("product.edited") : "Edited"}
                </Text>
              )}
            </View>
          </View>
            <View style={styles.actionsContainer}>
              {user?.id === review.userId && (
              <TouchableOpacity
                onPress={handleEditReview}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={20} color="#666" />
              </TouchableOpacity>
              )}
            </View>
        </View>

        {review.content && (
          <View>
            {showProductType && productTypeText && (
              <Text style={styles.reviewProductType}>{productTypeText}</Text>
            )}
            <Text style={styles.reviewContent}>{review.content}</Text>
          </View>
        )}

        {review.imageUrls && review.imageUrls.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewImagesContainer}
          >
            {review.imageUrls.map((url, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openImageViewer(index)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: url }}
                  style={styles.reviewImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeImageViewer}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            <Image
              source={{ uri: review.imageUrls[selectedImageIndex] }}
              style={styles.modalImage}
              resizeMode="contain"
            />

            {review.imageUrls.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonLeft]}
                  onPress={() => navigateImage("prev")}
                >
                  <Ionicons name="chevron-back" size={32} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={() => navigateImage("next")}
                >
                  <Ionicons name="chevron-forward" size={32} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {selectedImageIndex + 1} / {review.imageUrls.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>
                {t ? t("common.editReview") || "Edit Review" : "Edit Review"}
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.editModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Review ID (Display Only) */}
              <View style={styles.editFieldContainer}>
                <Text style={styles.editFieldLabel}>
                  {t ? t("common.reviewId") || "Review ID" : "Review ID"}
                </Text>
                <Text style={styles.editFieldValue}>{review.id}</Text>
              </View>

              {/* Rating */}
              <View style={styles.editFieldContainer}>
                <Text style={styles.editFieldLabel}>
                  {t ? t("product.rating") || "Rating" : "Rating"}
                </Text>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setEditRating(index + 1)}
                    >
                      <Ionicons
                        name={index < editRating ? "star" : "star-outline"}
                        size={32}
                        color={index < editRating ? "#FFB800" : "#E0E0E0"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Content */}
              <View style={styles.editFieldContainer}>
                <Text style={styles.editFieldLabel}>
                  {t ? t("orders.yourReview") || "Your Review" : "Your Review"}
                </Text>
                <TextInput
                  style={styles.editContentInput}
                  multiline
                  numberOfLines={4}
                  value={editContent}
                  onChangeText={setEditContent}
                  placeholder={
                    t
                      ? t("orders.reviewPlaceholder") ||
                        "Share your experience..."
                      : "Share your experience..."
                  }
                  placeholderTextColor="#999"
                />
              </View>

              {/* Images */}
              <View style={styles.editFieldContainer}>
                <Text style={styles.editFieldLabel}>
                  {t ? t("orders.addPhotos") || "Images" : "Images"} (
                  {editImages.length + editImageFiles.length}/3)
                </Text>
                <View style={styles.editImagesContainer}>
                  {/* Existing Images */}
                  {editImages.map((imageUri, index) => (
                    <View
                      key={`existing-${index}`}
                      style={styles.editImageWrapper}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.editImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index, false)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#ED2A46"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* New Images */}
                  {editImageFiles.map((imageFile, index) => (
                    <View key={`new-${index}`} style={styles.editImageWrapper}>
                      <Image
                        source={{ uri: imageFile.uri }}
                        style={styles.editImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index, true)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#ED2A46"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add Image Button */}
                  {editImages.length + editImageFiles.length < 3 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={handleAddImage}
                    >
                      <Ionicons name="camera-outline" size={32} color="#999" />
                      <Text style={styles.addImageText}>
                        {t ? t("orders.addPhoto") || "Add" : "Add"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isLoading && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveEdit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t ? t("common.save") || "Save" : "Save"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  reviewInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  reviewAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  reviewContent: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  reviewProductType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reviewImagesContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  reviewEditedText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: -20,
    zIndex: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalContent: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  imageCounter: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Edit Modal styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  editModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get("window").height * 0.9,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  editModalCloseButton: {
    padding: 4,
  },
  editModalBody: {
    padding: 20,
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  editFieldContainer: {
    marginBottom: 24,
  },
  editFieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  editFieldValue: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  editContentInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  editImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  editImageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  editImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
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
  editModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saveButton: {
    backgroundColor: "#ED2A46",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReviewCard;
