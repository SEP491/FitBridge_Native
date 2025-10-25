import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import couponService from "../../../services/couponService";

const CreateVoucherModal = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: "",
    maxDiscount: "",
    discountPercent: "",
    quantity: "",
  });

  const handleCreateVoucher = async () => {
    // Validation
    if (!formData.couponCode.trim()) {
      Alert.alert(t("manageVoucher.error"), t("manageVoucher.enterCouponCode"));
      return;
    }
    if (!formData.maxDiscount || formData.maxDiscount <= 0) {
      Alert.alert(
        t("manageVoucher.error"),
        t("manageVoucher.enterMaxDiscount")
      );
      return;
    }
    if (
      !formData.discountPercent ||
      formData.discountPercent <= 0 ||
      formData.discountPercent > 100
    ) {
      Alert.alert(
        t("manageVoucher.error"),
        t("manageVoucher.enterValidDiscountPercent")
      );
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      Alert.alert(t("manageVoucher.error"), t("manageVoucher.enterQuantity"));
      return;
    }

    try {
      setCreating(true);
      const data = {
        couponCode: formData.couponCode.trim(),
        maxDiscount: parseInt(formData.maxDiscount),
        discountPercent: parseInt(formData.discountPercent),
        quantity: parseInt(formData.quantity),
      };

      const response = await couponService.createCoupons(data);

      if (response.status === "200" || response.status === "201") {
        Alert.alert(
          t("manageVoucher.success"),
          t("manageVoucher.voucherCreated")
        );
        setFormData({
          couponCode: "",
          maxDiscount: "",
          discountPercent: "",
          quantity: "",
        });
        onSuccess(); // Callback to refresh the list
        onClose(); // Close modal
      }
    } catch (error) {
      console.error("Error creating coupon:", error.response.data);
      Alert.alert(t("manageVoucher.error"), t("manageVoucher.failedToCreate"));
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      couponCode: "",
      maxDiscount: "",
      discountPercent: "",
      quantity: "",
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("manageVoucher.createNewVoucher")}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Coupon Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("manageVoucher.couponCode")} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("manageVoucher.enterCouponCode")}
                value={formData.couponCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, couponCode: text.toUpperCase() })
                }
                autoCapitalize="characters"
              />
            </View>

            {/* Discount Percent */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("manageVoucher.discountPercent")} (%) *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("manageVoucher.enterDiscountPercent")}
                value={formData.discountPercent}
                onChangeText={(text) =>
                  setFormData({ ...formData, discountPercent: text })
                }
                keyboardType="numeric"
              />
            </View>

            {/* Max Discount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("manageVoucher.maxDiscount")} (VND) *
              </Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={styles.inputWithSuffixText}
                  placeholder={t("manageVoucher.enterMaxDiscount")}
                  value={formData.maxDiscount}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericText = text.replace(/[^0-9]/g, "");
                    setFormData({ ...formData, maxDiscount: numericText });
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>vn₫</Text>
              </View>
              {formData.maxDiscount ? (
                <Text style={styles.formattedAmount}>
                  {parseInt(formData.maxDiscount).toLocaleString("vi-VN")} ₫
                </Text>
              ) : null}
            </View>

            {/* Quantity */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("manageVoucher.quantity")} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("manageVoucher.enterQuantity")}
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity: text })
                }
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>
                {t("manageVoucher.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                creating && styles.createButtonDisabled,
              ]}
              onPress={handleCreateVoucher}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>
                  {t("manageVoucher.create")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputWithSuffix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputWithSuffixText: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    paddingRight: 16,
  },
  formattedAmount: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ED2A46",
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default CreateVoucherModal;
