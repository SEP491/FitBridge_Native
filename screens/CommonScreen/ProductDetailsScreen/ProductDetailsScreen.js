import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../../hooks/useTranslation";
import { useCart } from "../../../context/CartContext";
import colors from "../../../constants/color";

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const discountPercentage =
    product.displayPrice > product.salePrice
      ? Math.round(
          ((product.displayPrice - product.salePrice) / product.displayPrice) *
            100
        )
      : 0;

  const handleIncreaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product.quantity === 0) {
      Alert.alert(
        t("product.outOfStock"),
        t("product.productOutOfStock"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    addToCart({
      ...product,
      quantity: quantity,
    });

    Alert.alert(
      t("cart.addedToCart"),
      t("cart.productAddedSuccessfully"),
      [
        {
          text: t("common.continueShopping"),
          style: "cancel",
        },
        {
          text: t("cart.viewCart"),
          onPress: () => navigation.navigate("CartScreen"),
        },
      ]
    );
  };

  const handleBuyNow = () => {
    if (product.quantity === 0) {
      Alert.alert(
        t("product.outOfStock"),
        t("product.productOutOfStock"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    addToCart({
      ...product,
      quantity: quantity,
    });

    navigation.navigate("CartScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.red} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("product.productDetails")}</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("CartScreen")}
        >
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>
                {product.rating > 0 ? product.rating.toFixed(1) : "N/A"}
              </Text>
            </View>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.reviewsText}>
              {product.totalReviews || 0} {t("product.reviews")}
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.soldText}>
              {t("product.sold")}: {product.totalSoldQuantity || 0}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>{formatPrice(product.salePrice)}</Text>
            {discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.displayPrice)}
              </Text>
            )}
          </View>

          {product.countryOfOrigin && (
            <View style={styles.originRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.originLabel}>{t("product.origin")}:</Text>
              <Text style={styles.originValue}>{product.countryOfOrigin}</Text>
            </View>
          )}

          {/* Stock Status */}
          <View style={styles.stockRow}>
            <Ionicons
              name={product.quantity > 0 ? "checkmark-circle" : "close-circle"}
              size={20}
              color={product.quantity > 0 ? "#52C41A" : "#FF4D4F"}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.quantity > 0 ? "#52C41A" : "#FF4D4F" },
              ]}
            >
              {product.quantity > 0
                ? `${t("product.inStock")} (${product.quantity} ${t("product.available")})`
                : t("product.outOfStock")}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        {product.quantity > 0 && (
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>{t("product.quantity")}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 1 && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecreaseQuantity}
                disabled={quantity === 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity === 1 ? "#CCC" : colors.red}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === product.quantity && styles.quantityButtonDisabled,
                ]}
                onPress={handleIncreaseQuantity}
                disabled={quantity === product.quantity}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity === product.quantity ? "#CCC" : colors.red}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "description" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("description")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "description" && styles.activeTabText,
              ]}
            >
              {t("product.description")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "reviews" && styles.activeTab]}
            onPress={() => setSelectedTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "reviews" && styles.activeTabText,
              ]}
            >
              {t("product.reviews")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {selectedTab === "description" ? (
            <Text style={styles.descriptionText}>
              {product.description || t("product.noDescription")}
            </Text>
          ) : (
            <View style={styles.reviewsEmpty}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
              <Text style={styles.reviewsEmptyText}>
                {t("product.noReviews")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color={colors.red} />
          <Text style={styles.addToCartText}>{t("cart.addToCart")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>{t("product.buyNow")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  cartButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  separator: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  reviewsText: {
    fontSize: 13,
    color: "#666",
  },
  soldText: {
    fontSize: 13,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  salePrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ED2A46",
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  originRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  originLabel: {
    fontSize: 14,
    color: "#666",
  },
  originValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quantitySection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    borderColor: "#E0E0E0",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E0E0E0",
  },
  activeTab: {
    borderBottomColor: colors.red,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: colors.red,
  },
  tabContent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    minHeight: 200,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  reviewsEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  reviewsEmptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.red,
  },
  buyNowButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.red,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
