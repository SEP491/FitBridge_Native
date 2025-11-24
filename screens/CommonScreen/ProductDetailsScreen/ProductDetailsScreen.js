import React, { useState, useEffect, use } from "react";
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
import addressService from "../../../services/addressService";
import orderService from "../../../services/orderService";

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'addToCart' or 'buyNow'
  const [modalQuantity, setModalQuantity] = useState(1); // Quantity in modal
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedFlavour, setSelectedFlavour] = useState(null);
  const [availableWeights, setAvailableWeights] = useState([]);
  const [availableFlavours, setAvailableFlavours] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [shippingModalTab, setShippingModalTab] = useState("details"); // 'details' or 'addresses'
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [product.id]);
  console.log("Product Details:", productDetails);
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();
      setAddresses(response.data);
      if (selectedAddress === null && response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const shippingPriceEstimate = async (addressId) => {
    setShippingLoading(true);
    try {
      const response = await orderService.orderShippingPriceEstimate({
        addressId: addressId,
      });
      console.log("Estimated shipping price:", response);
      const data = response.data || {};
      setShippingInfo({
        price: data.total_pay || 0,
        distance: data.distance || 0,
        duration: data.duration || 0,
      });
      return data.total_pay || 0;
    } catch (error) {
      console.error("Error estimating shipping price:", error);
      setShippingInfo(null);
      return 0;
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      shippingPriceEstimate(selectedAddress.id);
    }
  }, [selectedAddress]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductDetails(product.id);
      setProductDetails(response.data);

      if (
        response.data?.productDetails &&
        response.data.productDetails.length > 0
      ) {
        const variants = response.data.productDetails;

        // Extract unique weights
        const weightsMap = new Map();
        variants.forEach((v) => {
          const key = `${v.weightValue}-${v.weightUnit}`;
          if (!weightsMap.has(key)) {
            weightsMap.set(key, {
              weightId: v.weightId,
              weightValue: v.weightValue,
              weightUnit: v.weightUnit,
            });
          }
        });
        const weights = Array.from(weightsMap.values());
        setAvailableWeights(weights);

        // Extract unique flavours
        const flavoursMap = new Map();
        variants.forEach((v) => {
          if (!flavoursMap.has(v.flavourId)) {
            flavoursMap.set(v.flavourId, {
              flavourId: v.flavourId,
              flavourName: v.flavourName,
            });
          }
        });
        const flavours = Array.from(flavoursMap.values());
        setAvailableFlavours(flavours);

        // Set default selections
        setSelectedWeight(weights[0]);
        setSelectedFlavour(flavours[0]);

        // Find matching variant
        const matchingVariant = variants.find(
          (v) =>
            v.weightId === weights[0].weightId &&
            v.flavourId === flavours[0].flavourId
        );
        setSelectedVariant(matchingVariant || variants[0]);
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

  const getEstimatedDeliveryDate = (durationInSeconds) => {
    if (!durationInSeconds) return null;
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + durationInSeconds * 1000);
    return deliveryDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
    });
  };

  const findVariantBySelection = (weightId, flavourId) => {
    if (!productDetails?.productDetails) return null;
    return productDetails.productDetails.find(
      (v) => v.weightId === weightId && v.flavourId === flavourId
    );
  };

  const handleWeightChange = (weight) => {
    setSelectedWeight(weight);

    // Check if current flavour is available for this weight
    const currentVariant = findVariantBySelection(
      weight.weightId,
      selectedFlavour?.flavourId
    );

    if (currentVariant && currentVariant.quantity > 0) {
      // Current flavour is available, use it
      setSelectedVariant(currentVariant);
      setQuantity(1);
    } else {
      // Find first available flavour for this weight
      const availableVariant = productDetails?.productDetails?.find(
        (v) => v.weightId === weight.weightId && v.quantity > 0
      );

      if (availableVariant) {
        const newFlavour = availableFlavours.find(
          (f) => f.flavourId === availableVariant.flavourId
        );
        setSelectedFlavour(newFlavour);
        setSelectedVariant(availableVariant);
        setQuantity(1);
      }
    }
  };

  const handleFlavourChange = (flavour) => {
    setSelectedFlavour(flavour);
    if (selectedWeight) {
      const variant = findVariantBySelection(
        selectedWeight.weightId,
        flavour.flavourId
      );
      if (variant) {
        setSelectedVariant(variant);
        setQuantity(1);
      }
    }
  };

  const handleSelectAddressFromModal = (address) => {
    setSelectedAddress(address);
    shippingPriceEstimate(address.id);
    setShippingModalTab("details");
  };

  const discountPercentage = selectedVariant
    ? selectedVariant.displayPrice > selectedVariant.salePrice
      ? Math.round(
          ((selectedVariant.displayPrice - selectedVariant.salePrice) /
            selectedVariant.displayPrice) *
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
    if (pendingAction === "addToCart") {
      executeAddToCart(variant, modalQuantity);
    } else if (pendingAction === "buyNow") {
      executeBuyNow(variant, modalQuantity);
    }
    setPendingAction(null);
    setModalQuantity(1); // Reset modal quantity
  };

  const executeAddToCart = (variant, qty) => {
    const currentQuantity = variant?.quantity || product.quantity;
    if (currentQuantity === 0) {
      Alert.alert(t("product.outOfStock"), t("product.productOutOfStock"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    addToCart({
      ...product,
      selectedVariant: variant,
      quantity: qty,
    });

    Alert.alert(t("cart.addedToCart"), t("cart.productAddedSuccessfully"), [
      {
        text: t("common.continueShopping"),
        style: "cancel",
      },
      {
        text: t("cart.viewCart"),
        onPress: () =>
          navigation.navigate("CartScreen", { initialTab: "product" }),
      },
    ]);
  };

  const executeBuyNow = (variant, qty) => {
    const currentQuantity = variant?.quantity || product.quantity;
    if (currentQuantity === 0) {
      Alert.alert(t("product.outOfStock"), t("product.productOutOfStock"), [
        { text: t("common.ok") },
      ]);
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
    setPendingAction("addToCart");
    setModalQuantity(1);
    setVariantModalVisible(true);
  };

  const handleBuyNow = () => {
    setPendingAction("buyNow");
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
            resizeMode="contain"
          />
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </View>
        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>
              {formatPrice(selectedVariant?.salePrice || product.salePrice)}
            </Text>
            {discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(
                  selectedVariant?.displayPrice || product.displayPrice
                )}
              </Text>
            )}
          </View>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.originAndRatingRow}>
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

            {product.countryOfOrigin && (
              <View style={styles.originRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.originLabel}>{t("product.origin")}:</Text>
                <Text style={styles.originValue}>
                  {product.countryOfOrigin}
                </Text>
              </View>
            )}
          </View>

          {/* Stock Status
          <View style={styles.stockRow}>
            <Ionicons
              name={
                (selectedVariant?.quantity || product.quantity) > 0
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={20}
              color={
                (selectedVariant?.quantity || product.quantity) > 0
                  ? "#52C41A"
                  : "#FF4D4F"
              }
            />
            <Text
              style={[
                styles.stockText,
                {
                  color:
                    (selectedVariant?.quantity || product.quantity) > 0
                      ? "#52C41A"
                      : "#FF4D4F",
                },
              ]}
            >
              {(selectedVariant?.quantity || product.quantity) > 0
                ? `${t("product.inStock")} (${
                    selectedVariant?.quantity || product.quantity
                  } ${t("product.available")})`
                : t("product.outOfStock")}
            </Text>
          </View> */}

          {/* Shipping Information */}
          {shippingInfo && shippingInfo.price > 0 && (
            <TouchableOpacity 
              style={styles.shippingSection}
              onPress={() => setShippingModalVisible(true)}
            >
              <View style={styles.shippingRow}>
                <Ionicons name="cube-outline" size={20} color="#0d0f11ff" />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingLabel}>
                    {t("product.shippingPrice")}:
                  </Text>
                  {shippingLoading ? (
                    <ActivityIndicator size="small" color={colors.red} />
                  ) : (
                    <Text style={styles.shippingPrice}>
                      {formatPrice(shippingInfo.price)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
              {shippingInfo.duration > 0 && (
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryText}>
                    {t("product.estimatedDelivery")}:{" "}
                    <Text style={styles.deliveryDate}>
                      {getEstimatedDeliveryDate(shippingInfo.duration)}
                    </Text>
                    -
                    <Text style={styles.deliveryDate}>
                      {getEstimatedDeliveryDate(shippingInfo.duration * 20)}
                    </Text>
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            )}
          </View>
          
        {availableWeights.length > 0 && (
          <View style={styles.variantSection}>
            <View style={styles.variantHeader}>
              <View style={styles.variantRow}>
                <Text style={styles.variantLabel}>
                  {t("product.selectProductTypes")}
                </Text>
                <Text style={styles.subvariantLabel}>
                  {"("}
                  {availableWeights.length} {t("product.options")},{" "}
                  {availableFlavours.length} {t("product.flavour")}
                  {")"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setVariantModalVisible(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantsContainer}
            >
              {availableWeights.map((weight) => (
                <TouchableOpacity
                  key={weight.weightId}
                  style={[
                    styles.variantCard,
                    selectedWeight?.weightId === weight.weightId &&
                      styles.variantCardSelected,
                  ]}
                  onPress={() => handleWeightChange(weight)}
                >
                  <Text
                    style={[
                      styles.variantWeight,
                      selectedWeight?.weightId === weight.weightId &&
                        styles.variantTextSelected,
                    ]}
                  >
                    {weight.weightValue} {weight.weightUnit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Flavour Selector */}
        {availableFlavours.length > 0 && (
          <View style={styles.variantSection}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantLabel}>
                {t("product.selectFlavour")}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantsContainer}
            >
              {availableFlavours.map((flavour) => {
                // Check if this flavour is available for selected weight
                const variant = findVariantBySelection(
                  selectedWeight?.weightId,
                  flavour.flavourId
                );
                const isAvailable = variant && variant.quantity > 0;

                return (
                  <TouchableOpacity
                    key={flavour.flavourId}
                    style={[
                      styles.variantCard,
                      selectedFlavour?.flavourId === flavour.flavourId &&
                        styles.variantCardSelected,
                      !isAvailable && styles.variantCardDisabled,
                    ]}
                    onPress={() => isAvailable && handleFlavourChange(flavour)}
                    disabled={!isAvailable}
                  >
                    <Text
                      style={[
                        styles.variantFlavour,
                        selectedFlavour?.flavourId === flavour.flavourId &&
                          styles.variantTextSelected,
                        !isAvailable && styles.variantTextDisabled,
                      ]}
                    >
                      {flavour.flavourName}
                    </Text>
                    {!isAvailable && (
                      <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockBadgeText}>Out</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Description and Reviews Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>{t("product.description")}</Text>

          {/* Product Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("product.brandName")}:</Text>
              <Text style={styles.detailValue}>
                {productDetails?.brandName || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("product.category")}:</Text>
              <Text style={styles.detailValue}>
                {productDetails?.subCategoryName || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("product.weight")}:</Text>
              <Text style={styles.detailValue}>
                {availableWeights
                  .map((w) => w.weightValue + " " + w.weightUnit)
                  .join(", ")}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("product.flavour")}:</Text>
              <Text style={styles.detailValue}>
                {availableFlavours.map((f) => f.flavourName).join(", ")}
              </Text>
            </View>

            {productDetails?.proteinSources && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.proteinSources")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.proteinSources}
                </Text>
              </View>
            )}

            {productDetails?.productDetails[0]?.bcaaPerServingGrams && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.bcaaPerServing")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.productDetails[0]?.bcaaPerServingGrams}g/{" "}
                  {t("product.perServingTime")}
                </Text>
              </View>
            )}

            {productDetails?.productDetails[0]?.caloriesPerServingKcal && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.caloriesPerServingKcal")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.productDetails[0]?.caloriesPerServingKcal}
                  kcal/ {t("product.perServingTime")}
                </Text>
              </View>
            )}

            {productDetails?.productDetails[0]?.proteinPerServingGrams && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.proteinPerServingGrams")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.productDetails[0]?.proteinPerServingGrams}g/{" "}
                  {t("product.perServingTime")}
                </Text>
              </View>
            )}

            {productDetails?.countryOfOrigin && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.countryOfOrigin")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.countryOfOrigin}
                </Text>
              </View>
            )}
            {productDetails?.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("product.additionalInfo")}:
                </Text>
                <Text style={styles.detailValue}>
                  {productDetails?.description}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {t("product.reviews")}
          </Text>
          <View style={styles.reviewsEmpty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
            <Text style={styles.reviewsEmptyText}>
              {t("product.noReviews")}
            </Text>
          </View>
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

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Weight Selection in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Weight</Text>
                <View style={styles.modalOptionsGrid}>
                  {availableWeights.map((weight) => (
                    <TouchableOpacity
                      key={weight.weightId}
                      style={[
                        styles.modalOptionCard,
                        selectedWeight?.weightId === weight.weightId &&
                          styles.modalOptionCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedWeight(weight);
                        // Find a valid flavour for this weight
                        const variant = findVariantBySelection(
                          weight.weightId,
                          selectedFlavour?.flavourId
                        );
                        if (!variant || variant.quantity === 0) {
                          // Find first available flavour for this weight
                          const availableVariant =
                            productDetails.productDetails.find(
                              (v) =>
                                v.weightId === weight.weightId && v.quantity > 0
                            );
                          if (availableVariant) {
                            const newFlavour = availableFlavours.find(
                              (f) => f.flavourId === availableVariant.flavourId
                            );
                            setSelectedFlavour(newFlavour);
                            setSelectedVariant(availableVariant);
                          }
                        } else {
                          setSelectedVariant(variant);
                        }
                        setModalQuantity(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          selectedWeight?.weightId === weight.weightId &&
                            styles.modalOptionTextSelected,
                        ]}
                      >
                        {weight.weightValue} {weight.weightUnit}
                      </Text>
                      {selectedWeight?.weightId === weight.weightId && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.red}
                          style={styles.modalOptionCheck}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Flavour Selection in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Flavour</Text>
                <View style={styles.modalOptionsGrid}>
                  {availableFlavours.map((flavour) => {
                    const variant = findVariantBySelection(
                      selectedWeight?.weightId,
                      flavour.flavourId
                    );
                    const isAvailable = variant && variant.quantity > 0;
                    const isSelected =
                      selectedFlavour?.flavourId === flavour.flavourId;

                    return (
                      <TouchableOpacity
                        key={flavour.flavourId}
                        style={[
                          styles.modalOptionCard,
                          isSelected && styles.modalOptionCardSelected,
                          !isAvailable && styles.modalOptionCardDisabled,
                        ]}
                        onPress={() => {
                          if (isAvailable) {
                            setSelectedFlavour(flavour);
                            setSelectedVariant(variant);
                            setModalQuantity(1);
                          }
                        }}
                        disabled={!isAvailable}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            isSelected && styles.modalOptionTextSelected,
                            !isAvailable && styles.modalOptionTextDisabled,
                          ]}
                        >
                          {flavour.flavourName}
                        </Text>
                        {isSelected && isAvailable && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={colors.red}
                            style={styles.modalOptionCheck}
                          />
                        )}
                        {!isAvailable && (
                          <Text style={styles.modalOptionOutOfStock}>Out</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Selected Variant Preview */}
              {selectedVariant && (
                <View style={styles.modalVariantPreview}>
                  <Image
                    source={{
                      uri: selectedVariant.imageUrl || product.imageUrl,
                    }}
                    style={styles.modalPreviewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalPreviewInfo}>
                    <Text style={styles.modalPreviewName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.modalPreviewVariant}>
                      {selectedVariant.weightValue} {selectedVariant.weightUnit}{" "}
                      - {selectedVariant.flavourName}
                    </Text>
                    <Text style={styles.modalPreviewPrice}>
                      {formatPrice(selectedVariant.salePrice)}
                    </Text>
                    <Text style={styles.modalPreviewStock}>
                      {selectedVariant.quantity > 0
                        ? `${selectedVariant.quantity} ${t(
                            "product.available"
                          )}`
                        : t("product.outOfStock")}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

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
                        modalQuantity === 1 &&
                          styles.modalQuantityButtonDisabled,
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
                    <Text style={styles.modalQuantityText}>
                      {modalQuantity}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.modalQuantityButton,
                        modalQuantity >= (selectedVariant?.quantity || 1) &&
                          styles.modalQuantityButtonDisabled,
                      ]}
                      onPress={() => {
                        const maxQty = selectedVariant?.quantity || 1;
                        if (modalQuantity < maxQty) {
                          setModalQuantity(modalQuantity + 1);
                        }
                      }}
                      disabled={
                        modalQuantity >= (selectedVariant?.quantity || 1)
                      }
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          modalQuantity >= (selectedVariant?.quantity || 1)
                            ? "#CCC"
                            : colors.red
                        }
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
                    {pendingAction === "addToCart" ? "Add to Cart" : "Buy Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Shipping Modal */}
      <Modal
        visible={shippingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShippingModalVisible(false);
          setShippingModalTab("details");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {shippingModalTab === "addresses" && (
                <TouchableOpacity
                  onPress={() => setShippingModalTab("details")}
                  style={styles.modalBackButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                {shippingModalTab === "details" 
                  ? t("product.shippingDetails") 
                  : t("product.selectAddress")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShippingModalVisible(false);
                  setShippingModalTab("details");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {shippingModalTab === "details" ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Delivery Address Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{t("product.deliveryAddress")}</Text>
                  <TouchableOpacity
                    style={styles.addressSelectCard}
                    onPress={() => setShippingModalTab("addresses")}
                  >
                    <View style={styles.addressCardContent}>
                      <Ionicons name="location" size={24} color={colors.red} />
                      <View style={styles.addressCardInfo}>
                        <Text style={styles.addressCardName}>
                          {selectedAddress?.receiverName}
                        </Text>
                        <Text style={styles.addressCardPhone}>
                          {selectedAddress?.phoneNumber}
                        </Text>
                        <Text style={styles.addressCardAddress} numberOfLines={2}>
                          {selectedAddress?.googleMapAddressString}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Shipping Method Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{t("product.shippingMethod")}</Text>
                  <View style={styles.shippingMethodCard}>
                    <View style={styles.shippingMethodContent}>
                      <Ionicons name="cube-outline" size={24} color={colors.red} />
                      <View style={styles.shippingMethodInfo}>
                        <Text style={styles.shippingMethodName}>
                          {t("product.standardShipping")}
                        </Text>
                        <Text style={styles.shippingMethodTime}>
                          {t("product.estimatedDelivery")}: {" "}
                          {getEstimatedDeliveryDate(shippingInfo?.duration)} - {getEstimatedDeliveryDate(shippingInfo?.duration * 20)}
                        </Text>
                      </View>
                      
                      {shippingLoading ? (
                        <ActivityIndicator size="small" color={colors.red} />
                      ) : (
                        <Text style={styles.shippingMethodPrice}>
                          {formatPrice(shippingInfo?.price || 0)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressListItem,
                      selectedAddress?.id === address.id && styles.addressListItemSelected
                    ]}
                    onPress={() => handleSelectAddressFromModal(address)}
                  >
                    <View style={styles.addressListAddress}>
                    <Ionicons name="location" size={20} color={colors.red} />
                      <View style={styles.addressListContent}>
                        
                        <Text style={styles.addressListName}>
                          {address.receiverName}
                        </Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>
                              {t("product.default")}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.addressListPhone}>
                        {address.phoneNumber}
                      </Text>
                      <Text style={styles.addressListAddress} numberOfLines={2}>
                        {address.googleMapAddressString}
                      </Text>
                      </View>
                      
                    </View>
                    {selectedAddress?.id === address.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.red} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    borderTopColor: "#E0E0E0",
    borderTopWidth: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    lineHeight: 28,
  },
  originAndRatingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    marginBottom: 8,
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
  shippingSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  shippingInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  shippingLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  shippingPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 32,
  },
  deliveryText: {
    fontSize: 13,
    color: "#666",
  },
  deliveryDate: {
    fontWeight: "600",
    color: "#52C41A",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  addressInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  addressLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  addressValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    flex: 1,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  detailsGrid: {},
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 200,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    flexShrink: 0,
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
    padding: 12,
    borderTopColor: "#F0F0F0",
    borderTopWidth: 1,
  },
  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  variantLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subvariantLabel: {
    fontSize: 12,
    color: "#666",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.red,
  },
  variantsContainer: {
    paddingRight: 12,
  },
  variantCard: {
    minWidth: 80,
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    position: "relative",
    alignItems: "center",
  },
  variantCardSelected: {
    borderColor: colors.red,
    backgroundColor: "#FFF5F7",
  },
  variantWeight: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  variantFlavour: {
    fontSize: 11,
    color: "#666",
  },
  variantTextSelected: {
    color: colors.red,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF4D4F",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  outOfStockBadgeText: {
    fontSize: 8,
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
    height: 700,
    paddingBottom: 10,
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
  modalBackButton: {
    padding: 4,
    marginRight: 8,
  },
  modalVariantList: {
    padding: 12,
  },
  modalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  modalOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalOptionCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalOptionCardSelected: {
    borderColor: colors.red,
    backgroundColor: "#FFF5F7",
  },
  modalOptionCardDisabled: {
    opacity: 0.4,
    backgroundColor: "#F5F5F5",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  modalOptionTextSelected: {
    color: colors.red,
  },
  modalOptionTextDisabled: {
    color: "#999",
  },
  modalOptionCheck: {
    marginLeft: 4,
  },
  modalOptionOutOfStock: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FF4D4F",
    marginLeft: 6,
  },
  modalVariantPreview: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  modalPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  modalPreviewInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  modalPreviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  modalPreviewVariant: {
    fontSize: 12,
    color: "#666",
  },
  modalPreviewPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.red,
  },
  modalPreviewStock: {
    fontSize: 12,
    color: "#52C41A",
    fontWeight: "600",
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
  // Shipping modal styles
  addressSelectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addressCardContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  addressCardInfo: {
    flex: 1,
  },
  addressCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  addressCardPhone: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  addressCardAddress: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  shippingMethodCard: {
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
  },
  shippingMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shippingMethodInfo: {
    flex: 1,
  },
  shippingMethodName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  shippingMethodTime: {
    fontSize: 12,
    color: "#666",
  },
  shippingMethodPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.red,
  },
  addressListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    margin:5,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  addressListItemSelected: {
    backgroundColor: "#FFF5F7",
  },
  addressListContent: {
    flexDirection: "column",
    flex: 1,
  },
  addressListHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  addressListName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  defaultBadge: {
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressListPhone: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  addressListAddress: {
    flexDirection: "row",
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
});