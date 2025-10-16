import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useCart } from "../../../context/CartContext";
import CartCard from "../../../components/CartCard/CartCard";
import Cart_FreelancePTCard from "../../../components/CartCard/Cart_FreelancePTCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import cartService from "../../../services/cartService";
import { formatPrice, showErrorAlert, showSuccessAlert } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";

export default function PaymentScreen({ navigation, route }) {
  const { cart, getTotalPrice, removeFromCart, clearCart } = useCart();
  const { t } = useTranslation();

  // Check if this is a direct purchase
  const directPurchaseItems = route?.params?.items || null;
  const directPurchaseAmount = route?.params?.totalAmount || 0;
  const isDirectPurchase = route?.params?.fromDirectPurchase || false;

  // Use direct purchase items if available, otherwise use cart
  const displayItems = isDirectPurchase ? directPurchaseItems : cart;
  console.log("displayItems:", displayItems);
  const totalPrice = isDirectPurchase ? directPurchaseAmount : getTotalPrice();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const handleCheckout = async () => {
    // Use displayItems (either direct purchase or cart items)
    console.log("Processing payment for:", displayItems);
    console.log("Is direct purchase:", isDirectPurchase);

    let requestData = {};

    requestData = {
      request: {
        couponId: null,
        customerPurchasedIdToExtend: null,
        shippingFee: 0,
        addressId: null,
        paymentMethodId:
          selectedPaymentMethod === "bank"
            ? "01997597-d188-7f12-95f4-43ef8d442612"
            : "01997597-d188-7f12-95f4-43ef8d412633",
        // voucherId: null,

        orderItems: displayItems.map((item) =>
          item.type === "FreelancePT"
            ? {
                quantity: 1,
                productDetailId: null,
                gymCourseId: null,
                gymPtId: null,
                serviceInformationId: null,
                freelancePTPackageId: item.id, // Use actual item ID
              }
            : item.type === "WithPt"
            ? {
                quantity: item.quantity,
                productDetailId: null,
                gymCourseId: item.id,
                gymPtId: item.pt ? item.pt.id : null,
                serviceInformationId: null,
                freelancePTPackageId: null,
              }
            : item.type === "Normal"
            ? {
                quantity: item.quantity,
                productDetailId: null,
                gymCourseId: item.id,
                gymPtId: null,
                serviceInformationId: null,
                freelancePTPackageId: null,
              }
            : {}
        ),
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
      <View style={styles.innerContainer}>
        {displayItems.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingVertical: 20 }}
          >
            {displayItems.map((item, index) => {
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
          </ScrollView>
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

        <View style={styles.paymentMethod}>
          <View style={styles.cartUpper}>
            <Text style={{ fontSize: 15, color: "#ED2A46" }}>
              {t("payment.paymentDetails")}
            </Text>
          </View>

          <View style={styles.cardUnder}>
            <View style={styles.row}>
              <Text>{t("payment.totalServiceAmount")}</Text>
              <Text>{formatPrice(totalPrice)}</Text>
            </View>
            <View style={[styles.row, styles.separator]}>
              <Text>{t("payment.additionalFees")}</Text>
              <Text>0 đ</Text>
            </View>
            <View style={styles.row}>
              <Text>{t("payment.total")}</Text>
              <Text>{formatPrice(totalPrice)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.orderSummary}>
        <View style={styles.proceedContainer}>
          <View>
            <Text style={{ fontSize: 15 }}>{t("payment.totalPayment")}</Text>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#ED2A46" }}
            >
              {formatPrice(totalPrice)}
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
  scrollView: {
    maxHeight: 250, // or use flexGrow/shrink with minHeight logic
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

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
});
