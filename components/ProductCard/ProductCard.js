import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handlePress = () => {
    navigation.navigate("ProductDetailsScreen", { product });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getShortCountryName = (country) => {
    if (!country) return "";
    if(country.length <= 8)
      return country;
    return country
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const discountPercentage = product.displayPrice > product.salePrice
    ? Math.round(((product.displayPrice - product.salePrice) / product.displayPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}
        {product.quantity === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>{t("product.outOfStock")}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFA500" />
          <Text style={styles.ratingText}>
            {product.rating > 0 ? product.rating.toFixed(1) : "N/A"}
          </Text>
          <Text style={styles.reviewsText}>({product.totalReviews || 0})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.salePrice}>{formatPrice(product.salePrice)}</Text>
          {discountPercentage > 0 && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.displayPrice)}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.soldContainer}>
            <Ionicons name="checkmark-circle" size={14} color="#52C41A" />
            <Text style={styles.soldText}>
              {t("product.sold")}: {product.totalSoldQuantity || 0}
            </Text>
          </View>
          {product.countryOfOrigin && (
            <View style={styles.originBadge}>
              <Text style={styles.originText}>{getShortCountryName(product.countryOfOrigin)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  reviewsText: {
    fontSize: 12,
    color: "#999",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  soldText: {
    fontSize: 11,
    color: "#666",
  },
  originBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  originText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
});
