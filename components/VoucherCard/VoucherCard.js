import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import LogoColor from "../../assets/images/LogoColor.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../../i18n";

const VoucherCard = ({ voucher, userName }) => {
  const { t } = useTranslation();

  if (!voucher) {
    return null;
  }

  return (
    <View style={styles.voucherContainer}>
      <View style={styles.voucherContent}>
        {/* Left Side - Discount Section */}
        <View style={styles.voucherLeft}>
          {/* Decorative dots */}
          <View style={styles.decorativeDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Header */}
          <View style={styles.leftHeader}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userName || "Personal Trainer"}
            </Text>
            <Text style={styles.headerSubtitle}>GIFT VOUCHER</Text>
          </View>

          {/* Main Discount */}
          <View style={styles.discountSection}>
            <Text style={styles.discountText}>
              GIẢM {voucher.discountPercent}%
            </Text>
          </View>

          {/* Validity Info */}
          <View style={styles.validitySection}>
            <View style={styles.validityBox}>
              <Text style={styles.validityText}>
                ✨ Áp dụng cho tất cả gói tập của{" "}
                {userName || "Personal Trainer"} trên FitBridge
              </Text>
            </View>
          </View>
        </View>

        {/* Right Side - Details Section */}
        <View style={styles.voucherRight}>
          {/* Voucher Code */}
          <View style={styles.codeSection}>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>VOUCHER CODE</Text>
              <Text style={styles.codeValue}>{voucher.couponCode}</Text>
            </View>
          </View>

          {/* Max Discount */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>Giá trị tối đa</Text>
            <Text style={styles.detailValue}>
              {voucher.maxDiscount?.toLocaleString("vi-VN")} ₫
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <QRCode
              value={voucher.couponCode}
              size={80}
              backgroundColor="white"
              color="black"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>fitbridge.shop</Text>
            <Ionicons name="fitness" size={24} color="#ED2A46" />
          </View>
        </View>
      </View>

      {/* Dashed Line Separator */}
      <View style={styles.dashedLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  voucherContainer: {
    width: "100%",
    marginHorizontal: "auto",
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voucherContent: {
    flexDirection: "row",
  },
  voucherLeft: {
    flex: 4,
    padding: 32,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    position: "relative",
  },
  decorativeDots: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  leftHeader: {
    marginBottom: 19,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1.5,
  },
  discountSection: {
    alignItems: "center",
  },
  discountText: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  validitySection: {
    marginTop: 32,
  },
  validityBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  validityText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  voucherRight: {
    flex: 3,
    padding: 12,
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#e5e7eb",
  },
  codeSection: {
    marginBottom: 8,
  },
  codeBox: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: 2,
  },
  detailsSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 16,
    alignItems: "flex-end",
  },
  detailLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  qrSection: {
    width: "100%",
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  dashedLine: {
    position: "absolute",
    left: "66.666%",
    top: 0,
    bottom: 0,
    width: 2,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ED2A46",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
  },
});

// Add gradient background using LinearGradient
export const VoucherCardWithGradient = ({ voucher, userName }) => {
  const { LinearGradient } = require("expo-linear-gradient");

  return (
    <View style={styles.voucherContainer}>
      <View style={styles.voucherContent}>
        {/* Left Side with Gradient */}
        <LinearGradient
          colors={
            voucher.isActive ? ["#FF914D", "#ED2A46"] : ["#6B7280", "#4B5563"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.voucherLeft]}
        >
          {/* Decorative dots */}
          <View style={styles.decorativeDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Header */}
          <View style={styles.leftHeader}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userName || "Personal Trainer"}
            </Text>
            <Text style={styles.headerSubtitle}>GIFT VOUCHER</Text>
          </View>

          {/* Main Discount */}
          <View style={styles.discountSection}>
            <Text style={styles.discountText}>
              GIẢM {voucher.discountPercent}%
            </Text>
          </View>

          {/* Usage Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (voucher.numberOfUsedCoupon / voucher.quantity) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {t("manageVoucher.percentUsed", {
                percent: Math.round(
                  (voucher.numberOfUsedCoupon / voucher.quantity) * 100
                ),
              })}
            </Text>
          </View>

          {/* Validity Info */}
          {/* <View style={styles.validitySection}>
            <View style={styles.validityBox}>
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {t('manageVoucher.percentUsed', { percent: Math.round((voucher.numberOfUsedCoupon / voucher.quantity) * 100) })}
                      </Text>
                    </View>

          {/* Validity Info */}
          {/* <View style={styles.validitySection}>
            <View style={styles.validityBox}>
              <Text style={styles.validityText}>
                ✨ Áp dụng cho tất cả gói tập của {userName || 'Personal Trainer'} trên FitBridge
              </Text>
            </View>
          </View> */}
        </LinearGradient>

        {/* Right Side - Details Section */}
        <View style={styles.voucherRight}>
          {/* Voucher Code */}
          <View style={styles.codeSection}>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>VOUCHER CODE</Text>
              <Text style={styles.codeValue}>{voucher.couponCode}</Text>
            </View>
          </View>

          {/* Max Discount */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>Giá trị tối đa</Text>
            <Text style={styles.detailValue}>
              {voucher.maxDiscount?.toLocaleString("vi-VN")} ₫
            </Text>
          </View>

          {/* QR Code */}
          {/* <View style={styles.qrSection}>
            <QRCode
              value={voucher.couponCode}
              size={80}
              backgroundColor="white"
              color="black"
            />
          </View> */}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>fitbridge.shop</Text>
            <Image
              source={LogoColor}
              style={{ width: 40, height: 40, resizeMode: "contain" }}
            />
          </View>
        </View>
      </View>

      {/* Dashed Line Separator */}
      <View style={styles.dashedLine} />
    </View>
  );
};

export default VoucherCard;
