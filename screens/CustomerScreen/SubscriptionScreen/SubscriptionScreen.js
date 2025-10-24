import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
import { useNavigation } from "@react-navigation/native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { useRevenueCat } from "../../../context/RevenueCatContext";

const { width } = Dimensions.get("window");

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const {
    fetchOfferings,
    fetchCustomerInfo,
    presentPaywall,
    customerInfo,
    currentOffering,
    isLoading,
    isPremiumUser,
    debugInfo,
    handleRestore,
    checkUserPremiumStatus,
  } = useRevenueCat();

  useEffect(() => {
    const setup = async () => {
      const offering = await fetchOfferings();
      await fetchCustomerInfo();
    };
    setup();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nâng cấp Premium</Text>
          {checkUserPremiumStatus() && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓ Đã kích hoạt</Text>
            </View>
          )}
        </View>

        {/* Status Info */}
        {customerInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Trạng thái tài khoản:</Text>
            <Text style={styles.infoText}>
              {checkUserPremiumStatus()
                ? "Bạn đã có Premium"
                : "Bạn đang dùng phiên bản miễn phí"}
            </Text>
          </View>
        )}

        {/* Warning nếu không có offering */}
        {!currentOffering && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Chưa cấu hình Offering</Text>
            <Text style={styles.warningText}>
              Vui lòng tạo và cấu hình Offering trên RevenueCat Dashboard.
            </Text>
          </View>
        )}

        {/* Warning nếu không có packages */}
        {currentOffering && currentOffering.availablePackages.length === 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Chưa có Packages</Text>
            <Text style={styles.warningText}>
              Offering đã có nhưng chưa có packages. Vui lòng thêm packages vào
              offering.
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!currentOffering ||
                currentOffering.availablePackages.length === 0) &&
                styles.disabledButton,
            ]}
            onPress={presentPaywall}
            disabled={
              !currentOffering || currentOffering.availablePackages.length === 0
            }
          >
            <Text style={styles.primaryButtonText}>
              {checkUserPremiumStatus()
                ? "Quản lý Subscription"
                : "Xem các gói Premium (UI)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestore}
          >
            <Text style={styles.secondaryButtonText}>Khôi phục mua hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.tertiaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Logs */}
        {__DEV__ && debugInfo.length > 0 && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>🔧 Debug Logs:</Text>
            <ScrollView style={styles.debugScroll} nestedScrollEnabled>
              {debugInfo.slice(-15).map((log, index) => (
                <Text
                  key={index}
                  style={[styles.debugText, log.isError && styles.debugError]}
                >
                  {log.message}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Current Offering Info */}
        {__DEV__ && currentOffering && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>📦 Current Offering:</Text>
            <Text style={styles.debugText}>
              ID: {currentOffering.identifier}
            </Text>
            <Text style={styles.debugText}>
              Packages: {currentOffering.availablePackages.length}
            </Text>
            {currentOffering.availablePackages.map((pkg, index) => (
              <View key={index} style={styles.packageInfo}>
                <Text style={styles.debugText}>
                  • {pkg.identifier}: {pkg.product.priceString}
                </Text>
                <Text
                  style={[styles.debugText, { fontSize: 10, marginLeft: 10 }]}
                >
                  Product: {pkg.product.identifier}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  activeBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: "#FFF",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  warningBox: {
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#856404",
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tertiaryButton: {
    padding: 16,
    alignItems: "center",
  },
  tertiaryButtonText: {
    color: "#666",
    fontSize: 16,
  },
  debugBox: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#DEE2E6",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  debugError: {
    color: "#DC3545",
    fontWeight: "600",
  },
  packageInfo: {
    marginTop: 4,
  },
});
