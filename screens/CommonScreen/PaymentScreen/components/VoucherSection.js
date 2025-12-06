import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { formatPrice } from "../../../../lib";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function VoucherSection({
  voucherCode,
  onVoucherCodeChange,
  selectedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  isApplying = false,
}) {
  const { t } = useTranslation();
  const voucherDiscount = selectedVoucher?.discountAmount || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("payment.voucher")}</Text>
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
            <TouchableOpacity onPress={onRemoveVoucher}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.voucherInputContainer}>
            <TextInput
              style={styles.voucherInput}
              placeholder={t("payment.enterVoucherCode")}
              value={voucherCode}
              onChangeText={(text) => onVoucherCodeChange(text.toUpperCase())}
              autoCapitalize="words"
              editable={!isApplying}
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                isApplying && styles.applyButtonDisabled,
              ]}
              onPress={onApplyVoucher}
              disabled={isApplying || !voucherCode.trim()}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>{t("payment.apply")}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    color: "#ED2A46",
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
});
