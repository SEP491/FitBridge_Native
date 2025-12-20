import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import React, { use, useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import CartCard from "../../../components/CartCard/CartCard";
import Cart_FreelancePTCard from "../../../components/CartCard/Cart_FreelancePTCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import cartService from "../../../services/cartService";
import {
  formatPrice,
  showErrorAlert,
  showSuccessAlert,
  fetchUserFromStorage,
} from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import CartCard_Extend from "../../../components/CartCard_Extend/CartCard_Extend";
import {
  ProductPaymentCard,
  AddressSection,
  PaymentMethodSection,
  VoucherSection,
  PaymentDetailsSection,
} from "./components";
import addressService from "../../../services/addressService";
import orderService from "../../../services/orderService";
import LoadingIndicator from "../../../components/LoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Check if this is a direct purchase or selected cart items
  const directPurchaseItems = route?.params?.items || null;
  const directPurchaseAmount = route?.params?.totalAmount || 0;
  const isDirectPurchase = route?.params?.fromDirectPurchase || false;
  const customerPurchasedIdToExtend =
    route?.params?.customerPurchasedIdToExtend || null;
  const itemToExtend = route?.params?.itemToExtend || null;
  const selectedCartItemIds = route?.params?.selectedCartItemIds || [];

  // Check if items are coming from cart checkout (selected items)
  const isFromCartCheckout =
    route?.params?.items && !isDirectPurchase && !customerPurchasedIdToExtend;

  console.log("Items to Extend:", [itemToExtend]);
  console.log("Is from cart checkout:", isFromCartCheckout);

  // Use direct purchase items if available, otherwise use cart or selected items
  const displayItems =
    isDirectPurchase && customerPurchasedIdToExtend
      ? [itemToExtend]
      : isDirectPurchase || isFromCartCheckout
      ? directPurchaseItems
      : cart;

  console.log("displayItems:", displayItems);
  const totalPrice =
    isDirectPurchase || isFromCartCheckout
      ? route?.params?.total || directPurchaseAmount
      : getTotalPrice();

  // Calculate discount
  const voucherDiscount = selectedVoucher?.discountAmount || 0;
  const [subTotal, setSubTotal] = useState(totalPrice);

  // Update subtotal when displayItems or totalPrice changes
  useEffect(() => {
    if (!isExtending) {
      setSubTotal(totalPrice);
    }
  }, [totalPrice, isExtending]);

  const finalTotal = Math.max(0, voucherDiscount ? voucherDiscount : subTotal);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [orderToExtend, setOrderToExtend] = useState([]);
  const isExtending = displayItems.some((item) => item.toExtend === true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Check if cart contains any products
  const hasProducts = displayItems.some(
    (item) => item.selectedVariant && !item.gymId
  );

  // Auth guard - check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      setUserLoading(true);
      const userData = await fetchUserFromStorage();
      if (!userData) {
        Alert.alert(t("auth.loginRequired"), t("auth.pleaseLoginToCheckout"), [
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
          {
            text: t("navigation.login"),
            onPress: () => {
              navigation.goBack();
              navigation.navigate(t("navigation.login"), { screen: "Login" });
            },
          },
        ]);
      } else {
        setCurrentUser(userData);
        fetchAddresses();
      }
      setUserLoading(false);
    };
    checkAuth();
  }, []);

  // Clear voucher code when user exits the screen
  useEffect(() => {
    return () => {
      setVoucherCode("");
      setSelectedVoucher(null);
    };
  }, []);

  const estimateShippingPrice = async (addressId) => {
    try {
      const response = await orderService.orderShippingPriceEstimate({
        addressId: addressId,
      });
      console.log("Estimated shipping price:", response);
      return response.data?.total_pay || 0;
    } catch (error) {
      console.error("Error estimating shipping price:", error);
      return 0;
    }
  };

  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    const loadShippingFee = async () => {
      if (selectedAddress && hasProducts) {
        const fee = await estimateShippingPrice(selectedAddress.id);
        setShippingFee(fee);
      } else {
        setShippingFee(0);
      }
    };
    loadShippingFee();
  }, [selectedAddress, hasProducts]);

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

  const handleAddressSelection = (addressData) => {
    console.log("Address selected in PaymentScreen:", addressData);
    setSelectedAddress(addressData);
  };

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
      // Determine if this is a product (has selectedVariant and no gymId)
      const hasProducts = displayItems.some(
        (item) => item.selectedVariant && !item.gymId
      );

      // Determine if this is a freelance PT package
      const isFreelancePt = displayItems.some(
        (item) => item.type === "FreelancePT"
      );
      const isExtendingFreelancePT = displayItems.some(
        (item) => item.toExtend === true && item.packageType === "Freelance PT"
      );
      const isGymCourse = displayItems.some((item) => item.type === "Normal");

      // Determine productType and itemsId based on cart contents
      let productType;
      let itemsId;

      if (hasProducts) {
        // Handle products
        productType = "Product";
        itemsId = displayItems
          .filter((item) => item.selectedVariant && !item.gymId)
          .map((item) => item.selectedVariant.id);
      } else if (isFreelancePt || isExtendingFreelancePT) {
        // Handle Freelance PT packages
        productType = "FreelancePTPackage";
        itemsId = isExtendingFreelancePT
          ? [itemToExtend.freelancePTPackageId]
          : displayItems
              .filter((item) => item.type === "FreelancePT")
              .map((item) => item.id);
      } else if (isGymCourse) {
        // Handle Gym Course packages
        productType = "GymCourse";
        itemsId = displayItems
          .filter((item) => item.type === "Normal")
          .map((item) => item.id);
      } else {
        // Default to FreelancePTPackage for backward compatibility
        productType = "FreelancePTPackage";
        itemsId = displayItems.map((item) => item.id);
      }

      // Call your voucher validation API here
      const requestData = {
        couponCode: voucherCode.trim(),
        totalPrice: isExtending ? orderToExtend.totalAmount : totalPrice,
        productType: productType,
        itemsId: itemsId,
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
    // Validate address for products
    if (hasProducts && !selectedAddress) {
      showErrorAlert(t("payment.pleaseSelectAddress"));
      return;
    }

    // Use displayItems (either direct purchase or cart items)
    console.log("Processing payment for:", displayItems);
    console.log("Is direct purchase:", isDirectPurchase);

    try {
      let requestData = {
        request: {
          couponId: selectedVoucher?.id || null,
          customerPurchasedIdToExtend: isExtending
            ? customerPurchasedIdToExtend
            : null,
          shippingFee: hasProducts
            ? shippingFee
            : isExtending
            ? orderToExtend.shippingFee
            : 0,
          addressId: hasProducts && selectedAddress ? selectedAddress.id : null,
          paymentMethodId:
            selectedPaymentMethod === "bank"
              ? "01997597-d188-7f12-95f4-43ef8d442612"
              : "01997597-d188-7f12-95f4-43ef8d442643",
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
                    subscriptionPlansInformationId: null,
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
                    subscriptionPlansInformationId: null,
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
                    subscriptionPlansInformationId: null,
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
                    subscriptionPlansInformationId: null,
                    freelancePTPackageId: null,
                  };
                }
                return {};
              }),
        },
      };

      console.log("Processing checkout:", requestData);

      const response = await cartService.processCart(requestData);
      console.log("Cart processed successfully:", response);

      // Check if payment method is COD
      const cleanupCartAfterCheckout = () => {
        if (isFromCartCheckout && selectedCartItemIds.length > 0) {
          clearCart(selectedCartItemIds);
        } else if (!isDirectPurchase && !isFromCartCheckout) {
          clearCart();
        }
      };

      if (response && response.data.isCOD) {
        console.log(
          "COD payment detected, navigating to PurchaseSuccessScreen"
        );
        cleanupCartAfterCheckout();

        // Navigate to OrderSuccessScreen
        navigation.navigate("OrderSuccessScreen", {
          isCOD: true,
        });
      } else if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.checkoutUrl
      ) {
        cleanupCartAfterCheckout();

        // Open payment URL for online payment
        navigation.navigate("OrderSuccessScreen", {
          isOnlinePayment: true,
          checkoutUrl: response.data.data.checkoutUrl,
        });
        Linking.openURL(response.data.data.checkoutUrl);

        // If direct purchase, navigate back after successful payment initiation
        if (isDirectPurchase) {
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }
      } else {
        throw new Error(
          "Invalid response - missing checkout URL or payment info"
        );
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

  // Show loading while checking auth
  if (userLoading) {
    return (
      <View style={styles.container}>
        <LoadingIndicator variant="page" message={t("common.loading")} />
      </View>
    );
  }

  // If user is not logged in, show empty state (alert already shown)
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("auth.loginRequired")}</Text>
        </View>
      </View>
    );
  }

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
                return (
                  <ProductPaymentCard
                    key={item.cartItemId || item.id || index}
                    item={item}
                    onRemove={() => handleRemoveItem(item.cartItemId)}
                    showRemove={!isDirectPurchase && !isFromCartCheckout}
                  />
                );
              }

              // Check if item type is FreelancePT
              if (item.type === "FreelancePT") {
                return (
                  <Cart_FreelancePTCard
                    key={item.cartItemId || item.id || index}
                    item={item}
                    showRemove={!isDirectPurchase && !isFromCartCheckout}
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
                  showRemove={!isDirectPurchase && !isFromCartCheckout}
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

        {/* Address Section - Only shown when there are products */}
        <AddressSection
          visible={hasProducts}
          selectedAddress={selectedAddress}
          onSelectAddress={handleAddressSelection}
          addresses={addresses}
          loading={loading}
        />

        {/* Payment Method Section */}
        <PaymentMethodSection
          hasProducts={hasProducts}
          selectedMethod={selectedPaymentMethod}
          onSelectMethod={setSelectedPaymentMethod}
        />

        {/* Voucher Section */}
        <VoucherSection
          voucherCode={voucherCode}
          onVoucherCodeChange={setVoucherCode}
          selectedVoucher={selectedVoucher}
          onApplyVoucher={handleApplyVoucher}
          onRemoveVoucher={() => {
            setVoucherCode("");
            setSelectedVoucher(null);
          }}
          isApplying={isApplyingVoucher}
        />

        {/* Payment Details Section */}
        <PaymentDetailsSection
          subTotal={isExtending ? orderToExtend.totalAmount : subTotal}
          shippingFee={hasProducts ? shippingFee : 0}
          voucherDiscount={voucherDiscount}
          finalTotal={hasProducts ? finalTotal + shippingFee : finalTotal}
          showVoucherDiscount={selectedVoucher && voucherDiscount > 0}
          showShippingFee={hasProducts}
        />
      </ScrollView>

      <View style={styles.orderSummary}>
        <View style={styles.proceedContainer}>
          <View>
            <Text style={{ fontSize: 15 }}>{t("payment.totalPayment")}</Text>
            {selectedVoucher && voucherDiscount > 0 && (
              <Text style={{ fontSize: 12, color: "#4CAF50", marginTop: 2 }}>
                {t("voucher.youSave")} {formatPrice(subTotal - voucherDiscount)}
              </Text>
            )}
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#ED2A46" }}
            >
              {formatPrice(hasProducts ? finalTotal + shippingFee : finalTotal)}
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
    marginTop: 25,
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
});
