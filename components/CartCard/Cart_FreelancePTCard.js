import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { formatPrice } from "../../lib";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
export default function Cart_FreelancePTCard({
  item,
  onRemove,
  onQuantityChange,
  showRemove = true,
  showQuantityControls = false, // FreelancePT packages typically have quantity: 1
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.cartCart}>
      <View style={styles.cartUpper}>
        <View style={styles.imageContainer}>
          <Image
            source={
              item.imageUrl && item.imageUrl !== "string"
                ? { uri: item.imageUrl }
                : require("../../assets/images/gymroom.jpg")
            }
            style={styles.gymImage}
          />
          <View style={styles.imageOverlay} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.packageName} numberOfLines={2}>
              {item.name}
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

          {item.type && (
            <Text style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              {item.type} {t("cart.package")}
            </Text>
          )}
          {/* Show PT information */}
          {item.pt && (
            <View style={styles.ptContainer}>
              <View style={styles.ptBadge}>
                <Text style={styles.ptBadgeText}>{t("cart.pt")}</Text>
              </View>
              <Text style={styles.ptName} numberOfLines={1}>
                {item.pt.fullName}
              </Text>
            </View>
          )}

          {/* Package details */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t("cart.duration")}</Text>
              <Text style={styles.detailValue}>
                {item.durationInDays} {t("cart.days")}
              </Text>
            </View>
            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t("cart.sessions")}</Text>
              <Text style={styles.detailValue}>{item.numOfSessions}</Text>
            </View>
            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {t("cart.sessionDuration")}
              </Text>
              <Text style={styles.detailValue}>
                {item.sessionDurationInMinutes}m
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cartUnder}>
        <View>
          <Text style={styles.priceText}>
            {formatPrice(item.price * (item.quantity || 1))}
          </Text>
          <Text style={styles.perSessionText}>
            {formatPrice(item.price / item.numOfSessions)}
            {t("cart.perSession")}
          </Text>
        </View>

        {showQuantityControls ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                onQuantityChange && onQuantityChange(item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              activeOpacity={0.7}
            >
              <AntDesign
                name="minus"
                size={16}
                color={item.quantity <= 1 ? "#ccc" : colors.red}
              />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.quantity || 1}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                onQuantityChange && onQuantityChange(item.quantity + 1)
              }
              activeOpacity={0.7}
            >
              <AntDesign name="plus" size={16} color={colors.red} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quantityDisplayOnly}>
            <Text style={styles.quantityLabel}>{t("cart.quantity")}</Text>
            <Text style={styles.quantityValueOnly}>{item.quantity || 1}</Text>
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
  freelanceBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freelanceBadgeText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
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
    justifyContent: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  packageName: {
    color: colors.orange,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 8,
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
    marginBottom: 8,
    backgroundColor: "#FFF8F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  ptBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  ptBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ptName: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailSeparator: {
    width: 1,
    height: 24,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "700",
  },
  perSessionText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginTop: 2,
  },
});
