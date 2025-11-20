import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { formatPrice } from "../../../../lib";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function ProductPaymentCard({ item, onRemove, showRemove = true }) {
  const { t } = useTranslation();
  const variantImage = item.selectedVariant?.imageUrl;
  const productImage = item.imageUrl;
  const displayImage = variantImage && variantImage !== null ? variantImage : productImage;

  return (
    <View style={styles.productPaymentCard}>
      <Image
        source={{ uri: displayImage }}
        style={styles.productPaymentImage}
        resizeMode="cover"
      />
      <View style={styles.productPaymentInfo}>
        <Text style={styles.productPaymentName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.selectedVariant && (
          <Text style={styles.productPaymentVariant}>
            {item.selectedVariant.weightValue} {item.selectedVariant.weightUnit} -{" "}
            {item.selectedVariant.flavourName}
          </Text>
        )}
        <View style={styles.productPaymentPriceRow}>
          <Text style={styles.productPaymentPrice}>
            {formatPrice(item.selectedVariant?.salePrice || item.salePrice)}
          </Text>
          <Text style={styles.productPaymentQuantity}>x{item.quantity || 1}</Text>
        </View>
        <Text style={styles.productPaymentSubtotal}>
          {t("payment.subtotal")}:{" "}
          {formatPrice(
            (item.selectedVariant?.salePrice || item.salePrice) * (item.quantity || 1)
          )}
        </Text>
      </View>
      {showRemove && (
        <TouchableOpacity style={styles.productRemoveButton} onPress={onRemove}>
          <MaterialIcons name="close" size={20} color="#FF4D4F" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  productPaymentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  productPaymentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  productPaymentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productPaymentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPaymentVariant: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productPaymentPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPaymentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ED2A46",
  },
  productPaymentQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  productPaymentSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  productRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});
