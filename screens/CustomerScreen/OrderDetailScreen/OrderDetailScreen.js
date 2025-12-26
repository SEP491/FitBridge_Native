import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";
import orderService from "../../../services/orderService";
import paymentService from "../../../services/paymentService";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatPrice } from "../../../lib";

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { selectedOrder } = route.params;
  const order = selectedOrder;
  const [showTrackingWebView, setShowTrackingWebView] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "#3498DB";
      case "Pending":
        return "#F39C12";
      case "Processing":
        return "#1ABC9C";
      case "Assigning":
        return "#9B59B6";
      case "Shipping":
        return "#3498DB";
      case "Finished":
        return "#27AE60";
      case "Cancelled":
        return "#E74C3C";
      default:
        return "#8E44AD";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Created":
        return "document-text-outline";
      case "Pending":
        return "time-outline";
      case "Processing":
        return "construct-outline";
      case "Assigning":
        return "people-outline";
      case "Shipping":
        return "car-outline";
      case "Finished":
        return "checkmark-circle-outline";
      case "Cancelled":
        return "close-circle-outline";
      default:
        return "document-outline";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethod = () => {
    if (!order?.checkoutUrl) {
      return t("orders.paymentMethods.cod");
    }
    const method = order.paymentMethod?.toLowerCase();
    if (method === "vnpay") return t("orders.paymentMethods.vnpay");
    if (method === "momo") return t("orders.paymentMethods.momo");
    if (method === "zalopay") return t("orders.paymentMethods.zalopay");
    return t("orders.paymentMethods.online");
  };

  const getStatusText = (status) => {
    const statusKey = status?.toLowerCase();
    return t(`orders.status.${statusKey}`) || status;
  };

  const handleCompletePayment = async () => {
    try {
      const response = await paymentService.repaidOrder({ orderId: order.id });
      if (response && response.data) {
        Linking.openURL(response.data);
      }
    } catch (error) {
      console.error("Error during payment completion:", error);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("orders.orderDetails")}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>{t("orders.noOrdersFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Info Card */}
        <View style={styles.cardInfo}>
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: getStatusColor(order.currentStatus) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(order.currentStatus)}
              size={32}
              color="#fff"
            />
            <Text style={styles.statusBannerText}>{getStatusText(order.currentStatus)}</Text>
          </View>
          <View style={{paddingHorizontal: 15}}>
            <Text style={styles.cardTitle}>Thông tin vận chuyển</Text>
            <Text style={styles.orderIdText}>{order.shippingDetail.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("orders.orderDate")}</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>

          {order.updatedAt !== order.createdAt && (
            <View style={styles.infoRow}>
              <Ionicons name="refresh-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("common.lastUpdate")}</Text>
                <Text style={styles.infoValue}>
                  {formatDate(order.updatedAt)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Shipping Detail Card */}
        {order.shippingDetail && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={24} color="#ED2A46" />
              <Text style={styles.cardTitle}>
                {t("payment.shippingAddress")}
              </Text>
            </View>

            <View style={styles.shippingInfo}>
              <View style={styles.shippingRow}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.shippingText}>
                  {order.shippingDetail.receiverName}
                </Text>
              </View>

              <View style={styles.shippingRow}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.shippingText}>
                  {order.shippingDetail.phoneNumber}
                </Text>
              </View>

              <View style={styles.shippingRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.shippingText}>
                  {order.shippingDetail.googleMapAddressString}
                </Text>
              </View>

              {order.shippingDetail.note && (
                <View style={styles.noteContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.noteText}>
                    {order.shippingDetail.note}
                  </Text>
                </View>
              )}
            </View>

            {order.ahamoveSharedLink && (
              <TouchableOpacity
                style={styles.trackInlineButton}
                onPress={() => setShowTrackingWebView(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.trackInlineButtonText}>
                  {t("orders.trackOrder")}
                </Text>
                <Ionicons
                  name="open-outline"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Order Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cart-outline" size={24} color="#ED2A46" />
            <Text style={styles.cardTitle}>
              {t("orders.items")} ({order.orderItems.length})
            </Text>
          </View>

          {order.orderItems.map((item, index) => (
            <View key={index} style={styles.productItem}>
              {item.productDetail && (
                <>
                  <View style={styles.productImageContainer}>
                    {item.productDetail.imageUrl ? (
                      <Image
                        source={{ uri: item.productDetail.imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={32} color="#CCC" />
                      </View>
                    )}
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {item.productDetail.flavourName || "Product"}
                      {item.productDetail.weightValue > 0 &&
                        ` - ${item.productDetail.weightValue}${
                          item.productDetail.weightUnit || ""
                        }`}
                    </Text>

                    <Text style={styles.productServingInfo}>
                      {item.productDetail.servingSizeInformation}
                    </Text>

                    {item.productDetail.proteinPerServingGrams > 0 && (
                      <Text style={styles.productNutrition}>
                        {t("orders.protein")}:{" "}
                        {item.productDetail.proteinPerServingGrams}g |{" "}
                        {t("orders.calories")}:{" "}
                        {item.productDetail.caloriesPerServingKcal} kcal
                      </Text>
                    )}

                    <View style={styles.productPriceRow}>
                      <Text style={styles.productQuantity}>
                        {t("orders.quantity")}: {item.quantity}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>

                    {item.productDetail.displayPrice !== item.price && (
                      <View style={styles.priceCompare}>
                        <Text style={styles.originalPrice}>
                          {formatPrice(item.productDetail.displayPrice)}
                        </Text>
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveText}>
                            -
                            {Math.round(
                              ((item.productDetail.displayPrice - item.price) /
                                item.productDetail.displayPrice) *
                                100
                            )}
                            %
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              )}

              {!item.productDetail && (
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {t("orders.quantity")}: {item.quantity}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calculator-outline" size={24} color="#ED2A46" />
            <Text style={styles.cardTitle}>{t("payment.paymentSummary")}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("orders.orderId")}</Text>
            <Text style={styles.summaryOrderIDValue} numberOfLines={1} ellipsizeMode="tail">{order.id}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("orders.voucherId")}</Text>
            <Text style={styles.summaryOrderIDValue} numberOfLines={1} ellipsizeMode="tail">{order.couponId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("orders.paymentMethod")}</Text>
            <Text style={styles.summaryValue}>{getPaymentMethod()}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("orders.subtotal")}</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(order.subTotalPrice)}
            </Text>
          </View>

          {order.totalAmount - (order.subTotalPrice + order.shippingFee) < 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("payment.discount")}</Text>
            <Text style={styles.summaryValue}>
                {formatPrice(order.totalAmount - (order.subTotalPrice + order.shippingFee) )}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("orders.shippingFee")}</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(order.shippingFee)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t("orders.total")}</Text>
            <Text style={styles.totalValue}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
        </View>


        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      {order.currentStatus === "Created" && order.checkoutUrl && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleCompletePayment}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.paymentButtonText}>
              {t("orders.completePayment")}
            </Text>
          </TouchableOpacity>
        </View>
      )}


      {order.currentStatus === "Finished" &&
        order.orderItems.some((item) => !item.isFeedback) && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() =>
                navigation.navigate("FeedbackScreen", { orderId: order.id })
              }
            >
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.feedbackButtonText}>
                {t("orders.leaveFeedback")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Tracking WebView Modal */}
      <Modal
        visible={showTrackingWebView}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTrackingWebView(false)}
      >
        <SafeAreaView style={styles.webViewContainer} edges={["top"]}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.webViewCloseButton}
              onPress={() => setShowTrackingWebView(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.webViewHeaderTitle}>
              {t("orders.trackOrder")}
            </Text>
            <View style={styles.webViewPlaceholder} />
          </View>
          {order.ahamoveSharedLink && (
            <WebView
              source={{ uri: order.ahamoveSharedLink }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#ED2A46" />
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error: ", nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView HTTP error: ", nativeEvent.statusCode);
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

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
    backgroundColor: "#fff",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: -64,
  },
  statusBanner: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statusBannerText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  cardInfo: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
    card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  orderIdText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
    fontFamily: "monospace",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  shippingInfo: {
    gap: 12,
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  shippingText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  trackInlineButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00BCD4",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  trackInlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  productItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productServingInfo: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  productNutrition: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productQuantity: {
    fontSize: 13,
    color: "#666",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  priceCompare: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  saveBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  summaryOrderIDValue: {
    fontSize: 11,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ED2A46",
  },
  trackingId: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  bottomActions: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  trackingButton: {
    backgroundColor: "#00BCD4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  feedbackButton: {
    backgroundColor: "#FF9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webViewCloseButton: {
    padding: 8,
  },
  webViewHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  webViewPlaceholder: {
    width: 40,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default OrderDetailScreen;
