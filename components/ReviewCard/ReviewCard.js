import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ReviewCard = ({ review, t, showProductType = false, productTypeText = null }) => {
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.userAvatarUrl }}
          style={styles.reviewAvatar}
        />
        <View style={styles.reviewHeaderInfo}>
          <Text style={styles.reviewUserName}>{review.userName}</Text>
          <View style={styles.reviewRatingRow}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < review.rating ? "star" : "star-outline"}
                size={14}
                color="#FFA500"
              />
            ))}
            <Text style={styles.reviewDate}>
              {formatReviewDate(review.createdAt)}
            </Text>
          </View>
        </View>
        {review.isEdited && (
        <Text style={styles.reviewEditedText}>
          {t ? t("product.edited") : "Edited"}
        </Text>
      )}
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
          contentContainerStyle={styles.reviewImagesContainer}
        >
          {review.imageUrls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}
      
      
    </View>
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
  },
  reviewEditedText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
});

export default ReviewCard;
