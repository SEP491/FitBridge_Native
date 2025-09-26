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
import { useCart } from "../../context/CartContext";
import CartCard from "../../components/CartCard/CartCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import cartService from "../../services/cartService";
import { formatPrice, showErrorAlert, showSuccessAlert } from "../../lib";
import { useTranslation } from "../../hooks/useTranslation";

export default function PaymentScreen({ navigation }) {
  const { cart, getTotalPrice, removeFromCart, clearCart } = useCart();
  const { t } = useTranslation();
  const totalPrice = getTotalPrice();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const handleCheckout = async () => {
    let requestData = {};

    requestData = {
      request: {
        voucherId: null,
        shippingFee: 0,
        addressId: null,
        paymentMethodId:
          selectedPaymentMethod === "bank"
            ? "01997597-d188-7f12-95f4-43ef8d442612"
            : "01997597-d188-7f12-95f4-43ef8d412633",
        orderItems: cart.map((item) => ({
          quantity: item.quantity || 0,
          productDetailId: null,
          gymCourseId: item.id,
          gymPtId: item.pt?.id || null,
          serviceInformationId: null,
          freelancePTPackageId: null,
        })),
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

      // if (
      //   response &&
      //   response.checkoutUrl &&
      //   typeof response.checkoutUrl === "string"
      // ) {
      //   Linking.openURL(response.checkoutUrl);
      // } else {
      //   console.error("Invalid or missing checkoutUrl:", response.checkoutUrl);
      //   showErrorAlert(t("errors.cannotLoadPaymentLink"));
      // }
    } catch (error) {
      console.error("Error processing cart:", error.response.data);
      showErrorAlert(
        error.response.data.message || t("errors.cartProcessError")
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
        {cart.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingVertical: 20 }}
          >
            {cart.map((item, index) => (
              <CartCard
                showRemove={false}
                showQuantityControls={false}
                key={item.cartItemId || index}
                product={{
                  gymId: item.gymId,
                  gymName: item.gymName,
                  rating: 5,
                  address: item.gymAddress,
                  image: item.gymImage,
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
            ))}
          </ScrollView>
        ) : (
          <Text style={{ fontSize: 20 }}>{t("payment.emptyCart")}</Text>
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
    backgroundColor: "#fff"
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
    shadowColor: "#000",shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
  cartUpper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },cardUnder: {
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
    shadowColor: "#000",shadowOpacity: 0.2,
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
    shadowColor: "#000",shadowOpacity: 0.25,
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
