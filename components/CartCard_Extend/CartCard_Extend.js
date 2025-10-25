import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { formatPrice } from "../../lib";
import colors from "../../constants/color";
import { t } from "../../i18n";

export default function CartCard_Extend({
  itemToExtend,
  onRemove,
  showRemove = false,
}) {
  const renderGymCourseNormal = () => {
    return (
      <View style={styles.cartCart}>
        <View style={styles.cartUpper}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: itemToExtend.courseImageUrl }}
              style={styles.gymImage}
            />
            <View style={styles.imageOverlay} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.packageName} numberOfLines={2}>
                {itemToExtend.packageName}
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
            <Text style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              {itemToExtend.packageType}
            </Text>
            {/* Show PT information if ptList exists */}
            {!itemToExtend.canAssignPT && (
              <View style={styles.ptContainer}>
                <View style={styles.ptBadge}>
                  <Text style={styles.ptBadgeText}>PT</Text>
                </View>
                <Text style={styles.ptName} numberOfLines={1}>
                  {itemToExtend.ptName}
                </Text>
              </View>
            )}
            {/* Package details */}
            {/* <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t("cart.available")}</Text>
                <Text style={styles.detailValue}>
                  {itemToExtend.availableSessions} sessions
                </Text>
              </View>
              <View style={styles.detailSeparator} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t("cart.expires")}</Text>
                <Text style={styles.detailValue}>
                  {new Date(itemToExtend.expirationDate).toLocaleDateString()}
                </Text>
              </View>
            </View> */}
          </View>
        </View>
        <View style={styles.cartUnder}>
          <View>
            <Text style={styles.priceText}>{t("cart.extendPackage")}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFreelancePT = () => {
    return (
      <View style={styles.cartCart}>
        <View style={styles.cartUpper}>
          <View style={styles.imageContainer}>
            <Image
              source={
                itemToExtend.courseImageUrl &&
                itemToExtend.courseImageUrl !== "string"
                  ? { uri: itemToExtend.courseImageUrl }
                  : require("../../assets/images/gymroom.jpg")
              }
              style={styles.gymImage}
            />
            <View style={styles.imageOverlay} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.packageName} numberOfLines={2}>
                {itemToExtend.packageName}
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
            <Text style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              {itemToExtend.packageType}
            </Text>
            {/* Show PT information */}
            <View style={styles.ptContainer}>
              <View style={styles.ptBadge}>
                <Text style={styles.ptBadgeText}>PT</Text>
              </View>
              <Text style={styles.ptName} numberOfLines={1}>
                {itemToExtend.ptName}
              </Text>
            </View>
            {/* Package details */}
            {/* <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t("cart.available")}</Text>
                <Text style={styles.detailValue}>
                  {itemToExtend.availableSessions} sessions
                </Text>
              </View>
              <View style={styles.detailSeparator} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t("cart.expires")}</Text>
                <Text style={styles.detailValue}>
                  {new Date(itemToExtend.expirationDate).toLocaleDateString()}
                </Text>
              </View>
            </View> */}
          </View>
        </View>
        <View style={styles.cartUnder}>
          <View>
            <Text style={styles.priceText}>{t("cart.extendPackage")}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (itemToExtend.type === "freelancePT") {
    return renderFreelancePT();
  } else if (
    itemToExtend.type === "gymCourseNormal" ||
    itemToExtend.type === "gymCourseWithPT"
  ) {
    return renderGymCourseNormal();
  } else {
    return (
      <View style={styles.cartCart}>
        <Text>{t("cart.unknownType")}</Text>
      </View>
    );
  }
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
