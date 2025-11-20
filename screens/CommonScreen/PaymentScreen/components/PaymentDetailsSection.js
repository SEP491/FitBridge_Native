import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatPrice } from "../../../../lib";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PaymentDetailsSection({
  subTotal,
  voucherDiscount = 0,
  shippingFee = 0,
  finalTotal,
  showVoucherDiscount = false,
  showShippingFee = false,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("payment.paymentDetails")}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text>{t("payment.totalServiceAmount")}</Text>
          <Text>{formatPrice(subTotal)}</Text>
        </View>
        
        {showVoucherDiscount && voucherDiscount > 0 && (
          <View style={styles.row}>
            <Text style={styles.discountText}>
              {t("payment.voucherDiscount")}
            </Text>
            <Text style={styles.discountAmount}>
              -{formatPrice(voucherDiscount)}
            </Text>
          </View>
        )}
        
        {showShippingFee && (
          <View style={styles.row}>
            <Text>{t("payment.shippingFee")}</Text>
            <Text>{formatPrice(shippingFee)}</Text>
          </View>
        )}
        
        <View style={[styles.row, styles.separator]}>
          <Text>{t("payment.additionalFees")}</Text>
          <Text>0 đ</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.totalText}>{t("payment.total")}</Text>
          <Text style={styles.totalAmount}>{formatPrice(finalTotal)}</Text>
        </View>
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
  content: {
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
  discountText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  discountAmount: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ED2A46",
  },
});
