import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../../hooks/useTranslation";
import { useCart } from "../../../context/CartContext";
import colors from "../../../constants/color";
import productService from "../../../services/productService";

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [productDetails, setProductDetails] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'addToCart' or 'buyNow'
  const [modalQuantity, setModalQuantity] = useState(1); // Quantity in modal

  useEffect(() => {
    fetchProductDetails();
  }, [product.id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductDetails(product.id);
      setProductDetails(response.data);
      // Set first available variant as default
      if (response.data?.productDetails && response.data.productDetails.length > 0) {
        setSelectedVariant(response.data.productDetails[0]);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Alert.alert(t("common.error"), "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const discountPercentage = selectedVariant
    ? selectedVariant.displayPrice > selectedVariant.salePrice
      ? Math.round(
          ((selectedVariant.displayPrice - selectedVariant.salePrice) / selectedVariant.displayPrice) *
            100
        )
      : 0
    : 0;

  const handleIncreaseQuantity = () => {
    const maxQuantity = selectedVariant?.quantity || product.quantity;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleVariantConfirm = (variant) => {
    setSelectedVariant(variant);
    setQuantity(modalQuantity);
    setVariantModalVisible(false);

    // Execute the pending action
    if (pendingAction === 'addToCart') {
      executeAddToCart(variant, modalQuantity);
    } else if (pendingAction === 'buyNow') {
      executeBuyNow(variant, modalQuantity);
    }
    setPendingAction(null);
    setModalQuantity(1); // Reset modal quantity
  };

  const executeAddToCart = (variant, qty) => {
    const currentQuantity = variant?.quantity || product.quantity;
    if (currentQuantity === 0) {
      Alert.alert(
        t("product.outOfStock"),
        t("product.productOutOfStock"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    addToCart({
      ...product,
      selectedVariant: variant,
      quantity: qty,
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
          onPress: () => navigation.navigate("CartScreen", { initialTab: "product" }),
        },
      ]
    );
  };

  const executeBuyNow = (variant, qty) => {
    const currentQuantity = variant?.quantity || product.quantity;
    if (currentQuantity === 0) {
      Alert.alert(
        t("product.outOfStock"),
        t("product.productOutOfStock"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    addToCart({
      ...product,
      selectedVariant: variant,
      quantity: qty,
    });

    navigation.navigate("CartScreen", { initialTab: "product" });
  };

  const handleAddToCart = () => {
    setPendingAction('addToCart');
    setModalQuantity(1);
    setVariantModalVisible(true);
  };

  const handleBuyNow = () => {
    setPendingAction('buyNow');
    setModalQuantity(1);
    setVariantModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={colors.red} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("product.productDetails")}</Text>
          <View style={styles.cartButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            source={{ uri: selectedVariant?.imageUrl || product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </View>

        {/* Variant Selector */}
        {productDetails?.productDetails && productDetails.productDetails.length > 0 && (
          <View style={styles.variantSection}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantLabel}>Select Variant:</Text>
              <TouchableOpacity onPress={() => setVariantModalVisible(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantsContainer}
            >
              {productDetails.productDetails.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantCard,
                    selectedVariant?.id === variant.id && styles.variantCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                >
                  <Text style={[
                    styles.variantWeight,
                    selectedVariant?.id === variant.id && styles.variantTextSelected,
                  ]}>
                    {variant.weightValue} {variant.weightUnit}
                  </Text>
                  <Text style={[
                    styles.variantFlavour,
                    selectedVariant?.id === variant.id && styles.variantTextSelected,
                  ]}>
                    {variant.flavourName}
                  </Text>
                  {variant.quantity === 0 && (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockBadgeText}>Out</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
            <Text style={styles.salePrice}>
              {formatPrice(selectedVariant?.salePrice || product.salePrice)}
            </Text>
            {discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(selectedVariant?.displayPrice || product.displayPrice)}
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
              name={(selectedVariant?.quantity || product.quantity) > 0 ? "checkmark-circle" : "close-circle"}
              size={20}
              color={(selectedVariant?.quantity || product.quantity) > 0 ? "#52C41A" : "#FF4D4F"}
            />
            <Text
              style={[
                styles.stockText,
                { color: (selectedVariant?.quantity || product.quantity) > 0 ? "#52C41A" : "#FF4D4F" },
              ]}
            >
              {(selectedVariant?.quantity || product.quantity) > 0
                ? `${t("product.inStock")} (${selectedVariant?.quantity || product.quantity} ${t("product.available")})`
                : t("product.outOfStock")}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        {(selectedVariant?.quantity || product.quantity) > 0 && (
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
                  quantity === (selectedVariant?.quantity || product.quantity) && styles.quantityButtonDisabled,
                ]}
                onPress={handleIncreaseQuantity}
                disabled={quantity === (selectedVariant?.quantity || product.quantity)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity === (selectedVariant?.quantity || product.quantity) ? "#CCC" : colors.red}
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

      {/* Variant Selection Modal */}
      <Modal
        visible={variantModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setVariantModalVisible(false);
          setPendingAction(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Variant</Text>
              <TouchableOpacity
                onPress={() => {
                  setVariantModalVisible(false);
                  setPendingAction(null);
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={productDetails?.productDetails || []}
              keyExtractor={(item) => item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalVariantList}
              renderItem={({ item: variant }) => {
                const isSelected = selectedVariant?.id === variant.id;
                const discountPercent = variant.displayPrice > variant.salePrice
                  ? Math.round(((variant.displayPrice - variant.salePrice) / variant.displayPrice) * 100)
                  : 0;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalVariantCard,
                      isSelected && styles.modalVariantCardSelected,
                    ]}
                    onPress={() => {
                      if (variant.quantity > 0) {
                        setSelectedVariant(variant);
                        setModalQuantity(1); // Reset quantity when changing variant
                      }
                    }}
                    disabled={variant.quantity === 0}
                  >
                    <View style={styles.modalVariantImageContainer}>
                      <Image
                        source={{ uri: variant.imageUrl || product.imageUrl }}
                        style={styles.modalVariantImage}
                        resizeMode="cover"
                      />
                      {variant.quantity === 0 && (
                        <View style={styles.modalOutOfStockOverlay}>
                          <Text style={styles.modalOutOfStockText}>Out of Stock</Text>
                        </View>
                      )}
                      {discountPercent > 0 && variant.quantity > 0 && (
                        <View style={styles.modalDiscountBadge}>
                          <Text style={styles.modalDiscountText}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalVariantInfo}>
                      <Text style={styles.modalVariantWeight} numberOfLines={1}>
                        {variant.weightValue} {variant.weightUnit}
                      </Text>
                      <Text style={styles.modalVariantFlavour} numberOfLines={1}>
                        {variant.flavourName}
                      </Text>
                      <Text style={styles.modalVariantSalePrice}>
                        {formatPrice(variant.salePrice)}
                      </Text>
                      {discountPercent > 0 && (
                        <Text style={styles.modalVariantDisplayPrice}>
                          {formatPrice(variant.displayPrice)}
                        </Text>
                      )}
                    </View>

                    {isSelected && (
                      <View style={styles.modalSelectedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.red} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Confirm Button */}
            {pendingAction && selectedVariant && (
              <View style={styles.modalFooter}>
                {/* Quantity Selector */}
                <View style={styles.modalQuantitySection}>
                  <Text style={styles.modalQuantityLabel}>Quantity</Text>
                  <View style={styles.modalQuantityControls}>
                    <TouchableOpacity
                      style={[
                        styles.modalQuantityButton,
                        modalQuantity === 1 && styles.modalQuantityButtonDisabled,
                      ]}
                      onPress={() => {
                        if (modalQuantity > 1) {
                          setModalQuantity(modalQuantity - 1);
                        }
                      }}
                      disabled={modalQuantity === 1}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={modalQuantity === 1 ? "#CCC" : colors.red}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalQuantityText}>{modalQuantity}</Text>
                    <TouchableOpacity
                      style={[
                        styles.modalQuantityButton,
                        modalQuantity >= (selectedVariant?.quantity || 1) && styles.modalQuantityButtonDisabled,
                      ]}
                      onPress={() => {
                        const maxQty = selectedVariant?.quantity || 1;
                        if (modalQuantity < maxQty) {
                          setModalQuantity(modalQuantity + 1);
                        }
                      }}
                      disabled={modalQuantity >= (selectedVariant?.quantity || 1)}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={modalQuantity >= (selectedVariant?.quantity || 1) ? "#CCC" : colors.red}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => handleVariantConfirm(selectedVariant)}
                  disabled={selectedVariant.quantity === 0}
                >
                  <Text style={styles.modalConfirmText}>
                    {pendingAction === 'addToCart' ? 'Add to Cart' : 'Buy Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  variantSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
  },
  variantLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  variantsContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  variantCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    minWidth: 120,
    position: "relative",
  },
  variantCardSelected: {
    borderColor: colors.red,
    backgroundColor: "#FFF5F6",
  },
  variantWeight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  variantFlavour: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.red,
  },
  variantTextSelected: {
    color: colors.red,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  descriptionSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
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
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
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
  // Variant selector button styles
  variantSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
  },
  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  variantLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red,
  },
  variantsContainer: {
    paddingRight: 16,
  },
  variantCard: {
    minWidth: 100,
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  variantCardSelected: {
    borderColor: colors.red,
    backgroundColor: "#FFF5F7",
  },
  variantWeight: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  variantFlavour: {
    fontSize: 12,
    color: "#666",
  },
  variantTextSelected: {
    color: colors.red,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalVariantList: {
    padding: 12,
  },
  modalVariantCard: {
    flex: 1,
    margin: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    maxWidth: "31%",
  },
  modalVariantCardSelected: {
    borderColor: colors.red,
    borderWidth: 2,
  },
  modalVariantImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  modalVariantImage: {
    width: "100%",
    height: "100%",
  },
  modalOutOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOutOfStockText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  modalDiscountBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalDiscountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  modalVariantInfo: {
    padding: 8,
  },
  modalVariantWeight: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  modalVariantFlavour: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  modalVariantSalePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.red,
  },
  modalVariantDisplayPrice: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  modalSelectedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  modalFooter: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  modalQuantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  modalQuantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  modalQuantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalQuantityButtonDisabled: {
    opacity: 0.5,
  },
  modalQuantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  modalConfirmButton: {
    backgroundColor: colors.red,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
