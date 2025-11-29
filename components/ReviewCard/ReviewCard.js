import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ReviewCard = ({
  review,
  t,
  showProductType = false,
  productTypeText = null,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  return (
    <>
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAvatar} />
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
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
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
    marginBottom: 8,
  },
  reviewProductType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reviewImagesContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
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
});

export default ReviewCard;