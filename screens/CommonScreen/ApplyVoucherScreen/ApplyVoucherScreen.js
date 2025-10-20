import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import couponService from "../../../services/couponService";
import VoucherSelectionCard from "../../../components/VoucherCard/VoucherSelectionCard";
import { useTranslation } from "../../../hooks/useTranslation";
import { showErrorAlert, showSuccessAlert } from "../../../lib";
import { useCart } from "../../../context/CartContext";

export default function ApplyVoucherScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { selectedVoucher, setSelectedVoucher } = useCart();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(
    selectedVoucher?.id || null
  );

  // Get items and total price from route params or cart
  const {
    items = [],
    totalPrice = 0,
    isFreelancePt = false,
  } = route?.params || {};

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await couponService.getCoupons();
      console.log("Fetched Vouchers:", response.data.items);

      // Filter only active vouchers
      const activeVouchers = response.data.items.filter(
        (voucher) =>
          voucher.isActive && voucher.quantity - voucher.numberOfUsedCoupon > 0
      );

      setVouchers(activeVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      showErrorAlert(t("voucher.applyFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVoucher = (voucher) => {
    if (selectedVoucherId === voucher.id) {
      // Deselect if already selected
      setSelectedVoucherId(null);
    } else {
      setSelectedVoucherId(voucher.id);
    }
  };

  const handleApplyVoucher = async () => {
    if (!selectedVoucherId) {
      showErrorAlert(t("voucher.applyFailed"));
      return;
    }

    const selectedVoucherData = vouchers.find(
      (v) => v.id === selectedVoucherId
    );
    if (!selectedVoucherData) return;

    try {
      setApplying(true);

      // Prepare request body
      const requestBody = {
        couponCode: selectedVoucherData.couponCode,
        isFreelancePtCoupon: isFreelancePt,
        itemsId: items.map((item) => item.id),
        totalPrice: totalPrice,
      };

      console.log("Applying voucher with request:", requestBody);

      const response = await couponService.applyVoucher(requestBody);
      console.log("Apply voucher response:", response.data);

      // Store the selected voucher with discount info in cart context
      setSelectedVoucher({
        ...selectedVoucherData,
        discountAmount: response.data.data.discountAmount || 0,
      });

      showSuccessAlert(t("voucher.applySuccess"));
      navigation.goBack();
    } catch (error) {
      console.error("Error applying voucher:", error);
      showErrorAlert(error.response?.data?.message || t("voucher.applyFailed"));
    } finally {
      setApplying(false);
    }
  };

  const renderVoucherItem = ({ item }) => (
    <VoucherSelectionCard
      voucher={item}
      isSelected={selectedVoucherId === item.id}
      onSelect={() => handleSelectVoucher(item)}
      disabled={false}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="card-giftcard" size={64} color="#CCCCCC" />
      <Text style={styles.emptyText}>{t("voucher.noVouchers")}</Text>
      <Text style={styles.emptySubText}>
        {t("voucher.noVouchersDescription")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>{t("voucher.loadingVouchers")}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={vouchers}
            renderItem={renderVoucherItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />

          {/* Apply Button */}
          {vouchers.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  !selectedVoucherId && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyVoucher}
                disabled={!selectedVoucherId || applying}
              >
                {applying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.applyButtonText}>
                    {selectedVoucherId
                      ? t("voucher.apply")
                      : t("payment.confirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  applyButton: {
    backgroundColor: "#FF914D",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  applyButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
