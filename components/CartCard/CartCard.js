import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { formatPrice } from "../../lib";
import colors from "../../constants/color";

export default function CartCard({
  product,
  onRemove,
  onQuantityChange,
  showRemove = true,
  showQuantityControls = true,
}) {
  return (
    <View style={styles.cartCart}>
      <View style={styles.cartUpper}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.gymImage} />
          <View style={styles.imageOverlay} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={styles.gymName} numberOfLines={1}>
                {product.gymName}
              </Text>
              {showRemove && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={onRemove}
                  activeOpacity={0.7}
                >
                  <AntDesign name="close" size={18} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.ratingAddressContainer}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>★</Text>
                <Text style={styles.ratingNumber}>{product.rating}/5</Text>
              </View>
              <Text
                style={styles.addressText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {product.address}
              </Text>
            </View>
          </View>
          <Text style={styles.packageName}>
            {product.selectedPackage.packageName}
          </Text>

          {/* Show PT information if package is WithPt */}
          {product.selectedPackage.type === "WithPt" && product.pt && (
            <View style={styles.ptContainer}>
              <View style={styles.ptBadge}>
                <Text style={styles.ptBadgeText}>PT</Text>
              </View>
              <Text style={styles.ptName}>{product.pt.fullName}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cartUnder}>
        <Text style={styles.priceText}>
          {formatPrice(
            product.selectedPackage.packagePrice * (product.quantity || 1)
          )}
        </Text>

        {showQuantityControls ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                onQuantityChange && onQuantityChange(product.quantity - 1)
              }
              disabled={product.quantity <= 1}
              activeOpacity={0.7}
            >
              <AntDesign
                name="minus"
                size={16}
                color={product.quantity <= 1 ? "#ccc" : colors.red}
              />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{product.quantity || 1}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                onQuantityChange && onQuantityChange(product.quantity + 1)
              }
              disabled={product.isGymCourse && (product.quantity || 1) >= 1}
              activeOpacity={0.7}
            >
              <AntDesign 
                name="plus" 
                size={16} 
                color={product.isGymCourse && (product.quantity || 1) >= 1 ? "#ccc" : colors.red} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quantityDisplayOnly}>
            <Text style={styles.quantityLabel}>Qty:</Text>
            <Text style={styles.quantityValueOnly}>
              {product.quantity || 1}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gymImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
  },
  cartCart: {
    alignSelf: "center",
    width: "95%",
    backgroundColor: colors.white,
    borderRadius: 24,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cartUpper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleContainer: {
    minHeight: 55,
    justifyContent: "center",
  },
  gymName: {
    fontWeight: "700",
    color: colors.orange,
    fontSize: 19,
    letterSpacing: 0.3,
  },
  ratingAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFF8F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: {
    color: "#FFB800",
    fontSize: 12,
    marginRight: 3,
  },
  ratingNumber: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  addressText: {
    color: "#666",
    fontSize: 12,
    flex: 1,
    fontWeight: "500",
  },
  packageName: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    letterSpacing: 0.2,
  },
  cartUnder: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  quantityDisplayOnly: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginRight: 8,
  },
  quantityValueOnly: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.red,
    textAlign: "left",
    letterSpacing: 0.3,
  },
  removeButton: {
    backgroundColor: colors.red,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ptContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#FFF8F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  ptBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  ptBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ptName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
});
