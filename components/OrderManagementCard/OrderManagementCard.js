import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../hooks/useTranslation";
import FeedbackModal from "./FeedbackModal";
import paymentService from "../../services/paymentService";
import orderService from "../../services/orderService";
import { Button } from "react-native-web";

const OrderManagementCard = ({ order, onRefresh }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [unreviewedItems, setUnreviewedItems] = useState([]);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [notReceivedDescription, setNotReceivedDescription] = useState("");
  const [notReceivedModalVisible, setNotReceivedModalVisible] = useState(false);

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
      case "Accepted":
        return "#2ECC71";
      case "Arrived":
        return "#8E44AD";
      case "InReturn":
        return "#E67E22";
      case "Returned":
        return "#D35400";
      case "CustomerNotReceived":
        return "#E74C3C";
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
      case "Accepted":
        return "checkmark-done-outline";
      case "Shipping":
        return "car-outline";
      case "Arrived":
        return "location-outline";
      case "InReturn":
        return "arrow-undo-outline";
      case "Returned":
        return "return-down-back-outline";
      case "CustomerNotReceived":
        return "close-outline";
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewDetails = () => {
    navigation.navigate("OrderDetailScreen", { selectedOrder: order });
  };

  const handleCheckoutAgain = async () => {
    try {
      const response = await paymentService.repaidOrder({ orderId: order.id });
      if (response && response.data) {
        Linking.openURL(response.data);
      }
    } catch (error) {
      console.error("Error during checkout again:", error);
    }
  };

  const handleOpenFeedbackModal = () => {
    // Find all product items that haven't been reviewed
    const itemsToReview = order.orderItems.filter(
      (item) => item.productDetail && !item.isFeedback
    );
    if (itemsToReview.length > 0) {
      setUnreviewedItems(itemsToReview);
      setFeedbackModalVisible(true);
    }
  };

  const handleCancelOrder = async () => {
    console.log("Cancelling order with reason:", cancelReason);
    try {
      const response = await orderService.cancelOrder(order.id, {
        status: "Cancelled",
        description: cancelReason,
      });
      if (response && response.data) {
        Alert.alert(
          t("common.success"),
          t("orders.orderCancelledSuccessfully")
        );
        setCancelModalVisible(false);
        setCancelReason("");
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert(t("common.error"), t("orders.errorCancellingOrder"));
    }
  };

  const handleOpenCancelModal = () => {
    setCancelModalVisible(true);
  };

  const handleReceivedConfirmation = () => {
    Alert.alert(t("orders.confirmReceived"), t("orders.areYouSureReceived"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        onPress: async () => {
          try {
            const response = await orderService.confirmOrderReceived(order.id);
            if (response && response.data) {
              Alert.alert(
                t("common.success"),
                t("orders.orderReceivedSuccessfully")
              );
              if (onRefresh) {
                onRefresh();
              }
            }
          } catch (error) {
            console.error("Error confirming received:", error);
            Alert.alert(t("common.error"), t("orders.errorConfirmingReceived"));
          }
        },
      },
    ]);
  };

  const handleNotReceivedConfirmation = () => {
    Alert.alert(t("orders.notReceived"), t("orders.areYouSureNotReceived"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        onPress: async () => {
          try {
            const response = await orderService.markOrderNotReceived(
              order.id,
              notReceivedDescription
            );
            if (response && response.data) {
              Alert.alert(
                t("common.success"),
                t("orders.orderMarkedNotReceived")
              );
              if (onRefresh) {
                onRefresh();
              }
            }
          } catch (error) {
            console.error("Error marking not received:", error);
            Alert.alert(t("common.error"), t("orders.errorMarkingNotReceived"));
          }
        },
      },
    ]);
  };

  const handleCloseFeedbackModal = (success) => {
    setFeedbackModalVisible(false);
    setUnreviewedItems([]);
    if (success && onRefresh) {
      // Refresh the order list after successful feedback submission
      onRefresh();
    }
  };

  return (
    <View style={styles.card}>
      {/* Status Header */}
      <View
        style={[
          styles.statusHeader,
          { backgroundColor: getStatusColor(order.currentStatus) },
        ]}
      >
        <View style={styles.statusLeft}>
          <Ionicons
            name={getStatusIcon(order.currentStatus)}
            size={20}
            color="#fff"
          />
          <Text style={styles.statusText}>{order.currentStatus}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
      </View>

      {/* Order Info */}

      <View style={styles.orderInfo}>
        <TouchableOpacity onPress={handleViewDetails}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>{t("orders.orderId")}:</Text>
            <Text
              style={styles.orderIdValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order.id}
            </Text>
          </View>

          {/* Order Items Preview */}
          <View style={styles.itemsContainer}>
            {order.orderItems.slice(0, 2).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                {item.productDetail && (
                  <>
                    <Image
                      source={
                        item.productDetail.imageUrl
                          ? { uri: item.productDetail.imageUrl }
                          : require("../../assets/images/LogoColor.png")
                      }
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.productDetail.flavourName || "Product"}
                        {item.productDetail.weightValue > 0 &&
                          ` - ${item.productDetail.weightValue}${
                            item.productDetail.weightUnit || ""
                          }`}
                      </Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemQuantity} numberOfLines={1}>
                          {item.productDetail.flavourName || "Product"}
                          {item.productDetail.weightValue > 0 &&
                            ` - ${item.productDetail.weightValue}${
                              item.productDetail.weightUnit || ""
                            }`}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Text>
                            {item.productDetail.salePrice <
                            item.productDetail.displayPrice ? (
                              <Text style={styles.originalPrice}>
                                {formatPrice(item.productDetail.displayPrice)}
                              </Text>
                            ) : null}
                          </Text>
                          <Text style={styles.itemPrice}>
                            {formatPrice(item.productDetail.salePrice)}
                          </Text>
                        </View>
                      </View>
                          <Text style={styles.itemNutrition}>
                            {t("orders.quantity")}: {item.quantity}
                          </Text>
                    </View>
                  </>
                )}
                {!item.productDetail && (
                  <Text style={styles.itemText} numberOfLines={1}>
                    • Quantity: {item.quantity} - {formatPrice(item.salePrice)}
                  </Text>
                )}
              </View>
            ))}
            {order.orderItems.length > 2 && (
              <Text style={styles.moreItems}>
                +{order.orderItems.length - 2} {t("orders.moreItems")}
              </Text>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {t("orders.total")}:{" "}
                <Text style={styles.itemsLabel}>
                  ({order.orderItems.length} {t("orders.items")})
                </Text>
              </Text>
              <Text style={styles.totalValue}>
                {formatPrice(order.totalAmount)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.currentStatus === "Created" && order.checkoutUrl && (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkoutButton]}
              onPress={handleCheckoutAgain}
            >
              <Ionicons name="card-outline" size={18} color="#4CAF50" />
              <Text style={styles.checkoutButtonText}>
                {t("orders.completePayment")}
              </Text>
            </TouchableOpacity>
          )}

          {order.currentStatus === "Pending" && !order.checkoutUrl && (
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={handleOpenCancelModal}
            >
              <Ionicons name="close-outline" size={18} color="#00BCD4" />
              <Text style={styles.trackButtonText}>
                {t("orders.cancelOrder")}
              </Text>
            </TouchableOpacity>
          )}

          {order.currentStatus === "Arrived" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 1,
                gap: 8,
              }}
            >
              <TouchableOpacity
                style={[styles.actionButton, styles.trackButton]}
                onPress={handleReceivedConfirmation}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color="#00BCD4"
                />
                <Text style={styles.trackButtonText}>
                  {t("orders.confirmReceived")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.notReceivedButton]}
                onPress={() => setNotReceivedModalVisible(true)}
              >
                <Ionicons name="close-outline" size={18} color="#ffffffff" />
                <Text style={styles.notReceivedButtonText}>
                  {t("orders.notReceivedOrder")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {order.currentStatus === "CustomerNotReceived" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={handleReceivedConfirmation}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color="#00BCD4"
              />
              <Text style={styles.trackButtonText}>
                {t("orders.confirmReceived")}
              </Text>
            </TouchableOpacity>
          )}
          {order.currentStatus === "Finished" &&
            order.orderItems.some((item) => !item.isFeedback) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.feedbackButton]}
                onPress={handleOpenFeedbackModal}
              >
                <Ionicons name="star-outline" size={18} color="#FF9800" />
                <Text style={styles.feedbackButtonText}>
                  {t("orders.leaveFeedback")}
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Feedback Modal */}
      {unreviewedItems.length > 0 && (
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={handleCloseFeedbackModal}
          orderItems={unreviewedItems}
        />
      )}

      {/* Cancel Order Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <View style={styles.cancelModalHeader}>
              <Text style={styles.cancelModalTitle}>
                {t("orders.cancelOrder")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCancelModalVisible(false);
                  setCancelReason("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.cancelModalContent}>
              <Text style={styles.cancelModalLabel}>
                {t("orders.cancelReason")}
              </Text>
              <TextInput
                style={styles.cancelReasonInput}
                multiline
                numberOfLines={4}
                placeholder={t("orders.enterCancelReason")}
                value={cancelReason}
                onChangeText={setCancelReason}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelModalButton,
                  styles.cancelModalButtonSecondary,
                ]}
                onPress={() => {
                  setCancelModalVisible(false);
                  setCancelReason("");
                }}
              >
                <Text style={styles.cancelModalButtonTextSecondary}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cancelModalButton,
                  styles.cancelModalButtonPrimary,
                ]}
                onPress={handleCancelOrder}
              >
                <Text style={styles.cancelModalButtonTextPrimary}>
                  {t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Not Received Modal */}
      <Modal
        visible={notReceivedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotReceivedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <View style={styles.cancelModalHeader}>
              <Text style={styles.cancelModalTitle}>
                {t("orders.notReceived")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setNotReceivedModalVisible(false);
                  setNotReceivedDescription("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.cancelModalContent}>
              <Text style={styles.cancelModalLabel}>
                {t("orders.notReceivedDescription")}
              </Text>
              <TextInput
                style={styles.cancelReasonInput}
                multiline
                numberOfLines={4}
                placeholder={t("orders.enterNotReceivedDescription")}
                value={notReceivedDescription}
                onChangeText={setNotReceivedDescription}
                textAlignVertical="top"
              />
              <View style={styles.cancelModalActions}>
                <TouchableOpacity
                  style={[
                    styles.cancelModalButton,
                    styles.cancelModalButtonSecondary,
                  ]}
                  onPress={() => {
                    setNotReceivedModalVisible(false);
                    setNotReceivedDescription("");
                  }}
                >
                  <Text style={styles.cancelModalButtonTextSecondary}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cancelModalButton,
                    styles.cancelModalButtonPrimary,
                  ]}
                  onPress={handleNotReceivedConfirmation}
                >
                  <Text style={styles.cancelModalButtonTextPrimary}>
                    {t("common.confirm")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dateText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  orderInfo: {
    padding: 16,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  orderIdLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  orderIdValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  itemPrice: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "600",
  },
  originalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
  itemNutrition: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  itemText: {
    fontSize: 13,
    color: "#666",
  },
  moreItems: {
    fontSize: 12,
    color: "#ED2A46",
    fontWeight: "600",
    marginTop: 4,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
  },
  priceValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 15,
    color: "#333",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 16,
    color: "#ED2A46",
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    minWidth: "45%",
  },
  feedbackButton: {
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  feedbackButtonText: {
    fontSize: 13,
    color: "#FF9800",
    fontWeight: "600",
  },
  checkoutButton: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  checkoutButtonText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  trackButton: {
    backgroundColor: "#E0F7FA",
    borderWidth: 1,
    borderColor: "#00BCD4",
  },
  notReceivedButton: {
    backgroundColor: "#ED2A46",
    borderWidth: 1,
    borderColor: "#ED2A46",
  },
  notReceivedButtonText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  trackButtonText: {
    fontSize: 13,
    color: "#00BCD4",
    fontWeight: "600",
  },
  detailsButton: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#ED2A46",
  },
  detailsButtonText: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  cancelModalContent: {
    padding: 16,
  },
  cancelModalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cancelReasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
  },
  cancelModalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButtonSecondary: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelModalButtonPrimary: {
    backgroundColor: "#ED2A46",
  },
  cancelModalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  cancelModalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default OrderManagementCard;
