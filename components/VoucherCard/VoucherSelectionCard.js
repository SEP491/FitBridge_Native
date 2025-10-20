import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../../hooks/useTranslation";
import { formatPrice } from "../../lib";

const VoucherSelectionCard = ({ voucher, isSelected, onSelect, disabled }) => {
  const { t } = useTranslation();

  if (!voucher) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
      onPress={disabled ? null : onSelect}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.leftSection}>
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <MaterialIcons name="local-offer" size={24} color="#ED2A46" />
          <Text style={styles.discountText}>{voucher.discountPercent}%</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.codeText}>{voucher.couponCode}</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="confirmation-number" size={14} color="#666" />
          <Text style={styles.detailText}>
            {t("voucher.maxDiscount")}: {formatPrice(voucher.maxDiscount)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="inventory" size={14} color="#666" />
          <Text style={styles.detailText}>
            {t("manageVoucher.remaining")}: {voucher.quantity - voucher.numberOfUsedCoupon}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isSelected ? (
          <View style={styles.selectedBadge}>
            <MaterialIcons name="check-circle" size={28} color="#4CAF50" />
            <Text style={styles.appliedText}>{t("voucher.applied")}</Text>
          </View>
        ) : disabled ? (
          <View style={styles.disabledBadge}>
            <MaterialIcons name="block" size={24} color="#999" />
          </View>
        ) : (
          <View style={styles.applyButton}>
            <Text style={styles.applyButtonText}>{t("voucher.apply")}</Text>
          </View>
        )}
      </View>

      {/* Active Status Indicator */}
      {voucher.isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.activeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedContainer: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#F1F8F4",
  },
  disabledContainer: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },
  leftSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  discountBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  discountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ED2A46",
    marginTop: 4,
  },
  middleSection: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 12,
  },
  selectedBadge: {
    alignItems: "center",
  },
  appliedText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 4,
  },
  disabledBadge: {
    opacity: 0.5,
  },
  applyButton: {
    backgroundColor: "#FF914D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
});

export default VoucherSelectionCard;
