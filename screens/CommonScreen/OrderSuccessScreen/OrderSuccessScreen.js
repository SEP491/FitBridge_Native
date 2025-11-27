import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, BackHandler, Linking, } from "react-native";
import { useState, useCallback, useEffect, use } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import cartService from "../../../services/cartService";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatPrice } from "../../../lib";
import { useCart } from "../../../context/CartContext";
import paymentService from "../../../services/paymentService";

const THEME_COLORS = {
  primary: "#ED2A46",
  secondary: "#FF914D",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#F5F5F5",
  lightGray: "#E0E0E0",
  warning: "#FFA726",
};

export default function OrderSuccessScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState("processing");
  const [orderData, setOrderData] = useState(null);

  const { orderCode } = route?.params || {};
  const { code } = route?.params || {};
  const { amount } = route?.params || {};
  const { cancel } = route?.params || {};
  const { id } = route?.params || {};
  const { isCOD, isOnlinePayment, checkoutUrl } = route?.params || {};

  const updateOrderFailed = async () => {
    const requestData = {
      orderCode: orderCode,
    };
    try {
      const response = await paymentService.updatePaymentCancel(requestData);
      console.log("updatePaymentCancel response:", response.data);
    } catch (error) {
      console.error("Error updating payment:", error.response.data);
    }
  };

  console.log("OrderSuccessScreen params:", route?.params);

  useFocusEffect(
    useCallback(() => {
      // Check if payment was cancelled
      if (cancel === "true" || cancel === true) {
        setOrderStatus("cancelled");
        setOrderData({
          status: "CANCELLED",
          orderCode: id || orderCode || "000000",
          amount: amount || 264000,
          description: t("orderSuccess.cancelledDescription") || "Payment was cancelled by user",
        });
        updateOrderFailed();
        return;
      }

      if (isOnlinePayment) {
        setOrderStatus("waitingForPayment");
      } else if (isCOD) {
        setOrderStatus("success");
      } else {
        setOrderStatus(code === "00" ? "success" : "failed");
        
        if (code === "00") {
          setOrderData({
            status: code,
            orderCode: orderCode || "000000",
            amount: amount || 0,
            description: t("orderSuccess.successDescription"),
          });
          setOrderStatus("success");
          clearCart();
        } else if (code === "01") {
          setOrderStatus("failed");
          updateOrderFailed();
        }
      }
    }, [code, orderCode, amount, isCOD, cancel, id])
  );

  const formatAmount = (amount) => {
    return formatPrice(amount);
  };

  const handleGoBack = () => {
    navigation.popToTop();
  };

  const handleCheckoutAgain = () => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl);
    }
  };

  const handleRetry = () => {
    setOrderStatus("processing");
  };

  const handleViewOrder = () => {
    // Navigate to ManageOrderScreen in ProfileStack
    navigation.navigate("MainApp", {
      screen: t("navigation.me"),
      params: {
        screen: "ManageOrderScreen",
      },
    });
  };

  // Processing State
  if (orderStatus === "processing") {
    return (
      <View style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.processingTitle}>{t("orderSuccess.processing")}</Text>
          <Text style={styles.processingSubtitle}>{t("orderSuccess.pleaseWait")}</Text>
        </View>
      </View>
    );
  }

  if (orderStatus === "waitingForPayment") {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.waitingIcon}>
            <Ionicons name="card-outline" size={50} color={THEME_COLORS.white} />
          </View>
          <Text style={styles.waitingTitle}>{t("orderSuccess.awaitingPayment")}</Text>
          <Text style={styles.successSubtitle}>{t("orderSuccess.pleaseCompletePayment")}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCheckoutAgain}>
              <Text style={styles.primaryButtonText}>{t("orderSuccess.continuePayment")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
              <Text style={styles.secondaryButtonText}>{t("orderSuccess.backToHome")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Cancelled State
  if (orderStatus === "cancelled") {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.cancelledIcon}>
            <Ionicons name="close-circle" size={50} color={THEME_COLORS.white} />
          </View>
          <Text style={styles.cancelledTitle}>{t("orderSuccess.paymentCancelled") || "Payment Cancelled"}</Text>
          <Text style={styles.successSubtitle}>
            {t("orderSuccess.cancelledMessage") || "You have cancelled the payment process"}
          </Text>

          {orderData && (
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetailsTitle}>{t("orderSuccess.orderInfo")}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.orderCode")}</Text>
                <Text style={styles.detailValue}>{orderData.orderCode}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.amount")}</Text>
                <Text style={styles.detailValue}>{formatAmount(parseInt(orderData.amount))}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.status")}</Text>
                <Text style={[styles.detailValue, { color: THEME_COLORS.warning }]}>
                  {t("orderSuccess.cancelled") || "CANCELLED"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrder}>
              <Text style={styles.primaryButtonText}>
                {t("orderSuccess.viewOrder") || "View Your Order"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
              <Text style={styles.secondaryButtonText}>{t("orderSuccess.backToHome")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Success State
  if (orderStatus === "success") {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={50} color={THEME_COLORS.white} />
          </View>
          <Text style={styles.successTitle}>{t("orderSuccess.paymentSuccess")}</Text>
          <Text style={styles.successSubtitle}>{t("orderSuccess.orderProcessedSuccess")}</Text>

          {orderData && (
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetailsTitle}>{t("orderSuccess.orderDetails")}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.orderCode")}</Text>
                <Text style={styles.detailValue}>{orderData.orderCode}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.amount")}</Text>
                <Text style={styles.detailValue}>{formatAmount(parseInt(orderData.amount))}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("orderSuccess.description")}</Text>
                <Text style={styles.detailValue}>{orderData.description}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoBack}>
              <Text style={styles.primaryButtonText}>{t("orderSuccess.backToHome")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Failed State
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.failedIcon}>
          <Ionicons name="alert-circle" size={50} color={THEME_COLORS.white} />
        </View>
        <Text style={styles.failedTitle}>{t("orderSuccess.paymentFailed")}</Text>
        <Text style={styles.failedSubtitle}>{t("orderSuccess.paymentError")}</Text>

        {orderData && (
          <View style={styles.orderDetails}>
            <Text style={styles.orderDetailsTitle}>{t("orderSuccess.orderInfo")}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("orderSuccess.orderCode")}</Text>
              <Text style={styles.detailValue}>{orderData.orderCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("orderSuccess.amount")}</Text>
              <Text style={styles.detailValue}>{formatAmount(orderData.amount)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("orderSuccess.status")}</Text>
              <Text style={styles.detailValue}>{t("orderSuccess.failed")}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <Text style={styles.primaryButtonText}>{t("orderSuccess.retry")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
            <Text style={styles.secondaryButtonText}>{t("orderSuccess.backToHome")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME_COLORS.black,
    marginTop: 20,
    textAlign: "center",
  },
  processingSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  failedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelledIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.warning,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  waitingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
    textAlign: "center",
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME_COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  cancelledTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME_COLORS.warning,
    marginBottom: 10,
    textAlign: "center",
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME_COLORS.secondary,
    marginBottom: 10,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  failedSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  orderDetails: {
    width: "100%",
    backgroundColor: THEME_COLORS.gray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME_COLORS.black,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: THEME_COLORS.black,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: THEME_COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: THEME_COLORS.secondary,
  },
  secondaryButtonText: {
    color: THEME_COLORS.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
});