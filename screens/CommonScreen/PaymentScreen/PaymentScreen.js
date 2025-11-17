import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import CartCard from "../../../components/CartCard/CartCard";
import Cart_FreelancePTCard from "../../../components/CartCard/Cart_FreelancePTCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import cartService from "../../../services/cartService";
import { formatPrice, showErrorAlert, showSuccessAlert } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import CartCard_Extend from "../../../components/CartCard_Extend/CartCard_Extend";

export default function PaymentScreen({ navigation, route }) {
  const {
    cart,
    getTotalPrice,
    removeFromCart,
    clearCart,
    selectedVoucher,
    setSelectedVoucher,
  } = useCart();
  const { t } = useTranslation();

  // Check if this is a direct purchase
  const directPurchaseItems = route?.params?.items || null;
  const directPurchaseAmount = route?.params?.totalAmount || 0;
  const isDirectPurchase = route?.params?.fromDirectPurchase || false;
  const customerPurchasedIdToExtend =
    route?.params?.customerPurchasedIdToExtend || null;
  const itemToExtend = route?.params?.itemToExtend || null;
  console.log("Items to Extend:", [itemToExtend]);
  // Use direct purchase items if available, otherwise use cart
  const displayItems =
    isDirectPurchase && customerPurchasedIdToExtend
      ? [itemToExtend]
      : isDirectPurchase
      ? directPurchaseItems
      : cart;

  console.log("displayItems:", displayItems);
  const totalPrice = isDirectPurchase ? directPurchaseAmount : getTotalPrice();

  // Calculate discount
  const voucherDiscount = selectedVoucher?.discountAmount || 0;
  const [subTotal, setSubTotal] = useState(totalPrice);

  // Update subtotal when displayItems or totalPrice changes
  useEffect(() => {
    if (!isExtending) {
      setSubTotal(totalPrice);
    }
  }, [totalPrice, isExtending]);

  const finalTotal = Math.max(0, subTotal - voucherDiscount);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [orderToExtend, setOrderToExtend] = useState([]);
  const isExtending = displayItems.some((item) => item.toExtend === true);

  useEffect(() => {
    const fetchOrderItemsToExtend = async () => {
      try {
        if (customerPurchasedIdToExtend) {
          const response = await cartService.getOrderItemsToExtend(
            customerPurchasedIdToExtend
          );
          console.log("Fetched order items to extend:", response);
          if (response && response.data) {
            setOrderToExtend(response.data);
            setSubTotal(response.data.totalAmount);
            console.log("Order items to extend set:", response.data);
          }
        } else {
          setOrderToExtend([]);
          return;
        }
      } catch (error) {
        console.error("Error fetching order items to extend:", error);
        showErrorAlert(error.response?.data?.message || "Error fetching data");
      }
    };
    fetchOrderItemsToExtend();
  }, [customerPurchasedIdToExtend]);
  // Function to apply voucher code
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      showErrorAlert(t("voucher.enterCode"));
      return;
    }

    setIsApplyingVoucher(true);
    try {
      // Determine if this is a freelance PT package
      const isFreelancePt = displayItems.some(
        (item) => item.type === "FreelancePT"
      );
      const isExtendingFreelancePT = displayItems.some(
        (item) => item.toExtend === true && item.packageType === "Freelance PT"
      );

      // Call your voucher validation API here
      // Replace this with your actual API call
      const requestData = {
        couponCode: voucherCode.trim(),
        totalPrice: isExtending ? orderToExtend.totalAmount : totalPrice,
        productType: "FreelancePTPackage",
        itemsId: isExtendingFreelancePT
          ? [itemToExtend.freelancePTPackageId]
          : displayItems.map((item) => item.id),
      };
      console.log("Applying voucher with data:", requestData);
      const response = await cartService.applyVoucher(requestData);
      console.log("Voucher applied successfully:", response);

      if (response && response.data && response.data) {
        setSelectedVoucher(response.data);
        console.log("Selected voucher set:", response.data);
        showSuccessAlert(t("voucher.applied"));
        // setVoucherCode("");
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      showErrorAlert(error.response?.data?.message || t("voucher.invalidCode"));
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCheckout = async () => {
    // Use displayItems (either direct purchase or cart items)
    console.log("Processing payment for:", displayItems);
    console.log("Is direct purchase:", isDirectPurchase);
    let requestData = {};
    requestData = {
      request: {
        couponId: selectedVoucher?.id || null,
        customerPurchasedIdToExtend: isExtending
          ? customerPurchasedIdToExtend
          : null,
        shippingFee: isExtending ? orderToExtend.shippingFee : 0,
        addressId: null,
        paymentMethodId:
          selectedPaymentMethod === "bank"
            ? "01997597-d188-7f12-95f4-43ef8d442612"
            : "01997597-d188-7f12-95f4-43ef8d412633",
        // voucherId: null,

        orderItems: isExtending
          ? orderToExtend.orderItems
          : displayItems.map((item) => {
              // Product with variant
              if (item.selectedVariant && !item.gymId) {
                return {
                  quantity: item.quantity || 1,
                  productDetailId: item.selectedVariant.id,
                  gymCourseId: null,
                  gymPtId: null,
                  serviceInformationId: null,
                  freelancePTPackageId: null,
                };
              }
              // Freelance PT
              if (item.type === "FreelancePT") {
                return {
                  quantity: 1,
                  productDetailId: null,
                  gymCourseId: null,
                  gymPtId: null,
                  serviceInformationId: null,
                  freelancePTPackageId: item.id,
                };
              }
              // Gym course with PT
              if (item.type === "WithPt") {
                return {
                  quantity: item.quantity,
                  productDetailId: null,
                  gymCourseId: item.id,
                  gymPtId: item.pt ? item.pt.id : null,
                  serviceInformationId: null,
                  freelancePTPackageId: null,
                };
              }
              // Normal gym course
              if (item.type === "Normal") {
                return {
                  quantity: item.quantity,
                  productDetailId: null,
                  gymCourseId: item.id,
                  gymPtId: null,
                  serviceInformationId: null,
                  freelancePTPackageId: null,
                };
              }
              return {};
            }),
      },
    };
    console.log("Checkout request:", requestData);

    try {
      let response;

      response = await cartService.processCart(requestData);
      console.log("Cart processed successfully:", response);

      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.checkoutUrl
      ) {
        Linking.openURL(response.data.data.checkoutUrl);

        // If direct purchase, navigate back after successful payment initiation
        if (isDirectPurchase) {
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }
      } else {
        console.error(
          "Invalid or missing checkoutUrl:",
          response &&
            response.data &&
            response.data.data &&
            response.data.data.checkoutUrl
        );
        showErrorAlert(t("errors.cannotLoadPaymentLink"));
      }
    } catch (error) {
      console.error("Error processing payment:", error.response?.data || error);
      showErrorAlert(
        error.response?.data?.message || t("errors.cartProcessError")
      );
      return;
    }
  };

  const handleRemoveItem = (cartItemId) => {
    Alert.alert(t("payment.removePackage"), t("payment.removePackageConfirm"), [
      {
        text: t("payment.cancel"),
        style: "cancel",
      },
      {
        text: t("payment.remove"),
        onPress: () => removeFromCart(cartItemId),
        style: "destructive",
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.innerContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayItems.length > 0 ? (
          <View style={styles.itemsContainer}>
            {displayItems.map((item, index) => {
              // Check if item is a product (has selectedVariant)
              if (item.selectedVariant && !item.gymId) {
                const variantImage = item.selectedVariant?.imageUrl;
                const productImage = item.imageUrl;
                const displayImage = (variantImage && variantImage !== null) ? variantImage : productImage;
                
                return (
                  <View key={item.cartItemId || item.id || index} style={styles.productPaymentCard}>
                    <Image
                      source={{ uri: displayImage }}
                      style={styles.productPaymentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.productPaymentInfo}>
                      <Text style={styles.productPaymentName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.selectedVariant && (
                        <Text style={styles.productPaymentVariant}>
                          {item.selectedVariant.weightValue} {item.selectedVariant.weightUnit} - {item.selectedVariant.flavourName}
                        </Text>
                      )}
                      <View style={styles.productPaymentPriceRow}>
                        <Text style={styles.productPaymentPrice}>
                          {formatPrice(item.selectedVariant?.salePrice || item.salePrice)}
                        </Text>
                        <Text style={styles.productPaymentQuantity}>
                          x{item.quantity || 1}
                        </Text>
                      </View>
                      <Text style={styles.productPaymentSubtotal}>
                        {t("payment.subtotal")}: {formatPrice((item.selectedVariant?.salePrice || item.salePrice) * (item.quantity || 1))}
                      </Text>
                    </View>
                    {!isDirectPurchase && (
                      <TouchableOpacity
                        style={styles.productRemoveButton}
                        onPress={() => handleRemoveItem(item.cartItemId)}
                      >
                        <MaterialIcons name="close" size={20} color="#FF4D4F" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              
              // Check if item type is FreelancePT
              if (item.type === "FreelancePT") {
                return (
                  <Cart_FreelancePTCard
                    key={item.cartItemId || item.id || index}
                    item={item}
                    showRemove={!isDirectPurchase}
                    onRemove={() => handleRemoveItem(item.cartItemId)}
                  />
                );
              }
              if (item.toExtend === true) {
                // Use regular CartCard for items to extend
                return <CartCard_Extend key={item.id} itemToExtend={item} />;
              }

              // Use regular CartCard for other types (GymCourse, etc.)
              return (
                <CartCard
                  showRemove={!isDirectPurchase}
                  showQuantityControls={false}
                  key={item.cartItemId || item.id || index}
                  product={{
                    gymId: item.gymId,
                    gymName: item.gymName,
                    rating: 5,
                    address: item.gymAddress,
                    image: item.gymImage || item.imageUrl,
                    quantity: item.quantity || 1,
                    selectedPackage: {
                      packageId: item.id,
                      packageName: item.name,
                      packagePrice: item.price,
                      type: item.type,
                    },
                    pt: item.pt
                      ? {
                          id: item.pt.id,
                          fullName: item.pt.fullName,
                          avatar: item.pt.avatar,
                          gender: item.pt.gender,
                          goalTraining: item.pt.goalTraining,
                        }
                      : null,
                  }}
                  onRemove={() => handleRemoveItem(item.cartItemId)}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>{t("payment.emptyCart")}</Text>
          </View>
        )}

        <View style={styles.paymentMethod}>
          <View style={styles.cartUpper}>
            <Text style={{ fontSize: 15, color: "#ED2A46" }}>
              {t("payment.paymentMethods")}
            </Text>
            <Text style={{ fontSize: 10 }}>{t("payment.seeAll")}</Text>
          </View>

          <View style={styles.cardUnder}>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPaymentMethod("bank")}
            >
              <View style={styles.paymentLeft}>
                <MaterialIcons name="payment" size={30} color="#ED2A46" />
                <Text>{t("payment.bankTransfer")}</Text>
              </View>
              {selectedPaymentMethod === "bank" && (
                <MaterialIcons name="check-circle" size={24} color="#ED2A46" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPaymentMethod("qr")}
            >
              <View style={styles.paymentLeft}>
                <MaterialIcons name="qr-code" size={30} color="#ED2A46" />
                <Text>{t("payment.qrCode")}</Text>
              </View>
              {selectedPaymentMethod === "qr" && (
                <MaterialIcons name="check-circle" size={24} color="#ED2A46" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Voucher Section - Modified to inline input */}
        <View style={styles.paymentMethod}>
          <View style={styles.cartUpper}>
            <Text style={{ fontSize: 15, color: "#ED2A46" }}>
              {t("payment.voucher")}
            </Text>
          </View>

          <View style={styles.voucherSection}>
            {selectedVoucher ? (
              <View style={styles.voucherApplied}>
                <View style={styles.voucherInfo}>
                  <MaterialIcons name="local-offer" size={24} color="#4CAF50" />
                  <View style={styles.voucherTextContainer}>
                    <Text style={styles.voucherCodeText}>
                      {selectedVoucher.couponCode || voucherCode}
                    </Text>
                    <Text style={styles.voucherDiscountText}>
                      -{formatPrice(voucherDiscount)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setVoucherCode("");
                    setSelectedVoucher(null);
                  }}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.voucherInputContainer}>
                <TextInput
                  style={styles.voucherInput}
                  placeholder={t("payment.enterVoucherCode")}
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  autoCapitalize="characters"
                  editable={!isApplyingVoucher}
                />
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    isApplyingVoucher && styles.applyButtonDisabled,
                  ]}
                  onPress={handleApplyVoucher}
                  disabled={isApplyingVoucher || !voucherCode.trim()}
                >
                  {isApplyingVoucher ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.applyButtonText}>
                      {t("payment.apply")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.paymentMethod}>
          <View style={styles.cartUpper}>
            <Text style={{ fontSize: 15, color: "#ED2A46" }}>
              {t("payment.paymentDetails")}
            </Text>
          </View>

          <View style={styles.cardUnder}>
            <View style={styles.row}>
              <Text>{t("payment.totalServiceAmount")}</Text>
              <Text>
                {" "}
                {isExtending
                  ? formatPrice(orderToExtend.totalAmount)
                  : formatPrice(subTotal)}
              </Text>
            </View>
            {selectedVoucher && voucherDiscount > 0 && (
              <View style={[styles.row]}>
                <Text style={styles.discountText}>
                  {t("payment.voucherDiscount")}
                </Text>
                <Text style={styles.discountAmount}>
                  -{formatPrice(voucherDiscount)}
                </Text>
              </View>
            )}
            <View style={[styles.row, styles.separator]}>
              <Text>{t("payment.additionalFees")}</Text>
              <Text>0 đ</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalText}>{t("payment.total")}</Text>
              <Text style={styles.totalAmount}>{formatPrice(finalTotal)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.orderSummary}>
        <View style={styles.proceedContainer}>
          <View>
            <Text style={{ fontSize: 15 }}>{t("payment.totalPayment")}</Text>
            {selectedVoucher && voucherDiscount > 0 && (
              <Text style={{ fontSize: 12, color: "#4CAF50", marginTop: 2 }}>
                {t("voucher.youSave")} {formatPrice(voucherDiscount)}
              </Text>
            )}
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#ED2A46" }}
            >
              {formatPrice(finalTotal)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => handleCheckout()}
          >
            <Text style={styles.checkoutText}>{t("payment.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120, // Space for the fixed bottom button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
  },
  itemsContainer: {
    paddingVertical: 20,
  },
  paymentMethod: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
  cartUpper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardUnder: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDD9D9",
  },
  orderSummary: {
    paddingVertical: 35,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 9,
  },
  proceedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  checkoutButton: {
    backgroundColor: "#FF914D",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voucherSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
    paddingTop: 10,
  },
  voucherInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD9D9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
  },
  applyButton: {
    backgroundColor: "#ED2A46",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  voucherApplied: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    // backgroundColor: "#F1F8F4",
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  voucherInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  voucherTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  voucherCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  voucherDiscountText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },

  discountText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  discountAmount: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  // Product payment card styles
  productPaymentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  productPaymentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  productPaymentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productPaymentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPaymentVariant: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productPaymentPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPaymentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  productPaymentQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  productPaymentSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  productRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});
