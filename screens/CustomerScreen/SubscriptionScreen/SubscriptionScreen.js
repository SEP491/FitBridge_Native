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

const { width } = Dimensions.get("window");

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [currentOffering, setCurrentOffering] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  // Helper để thêm debug log
  const addDebugLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo((prev) => [...prev, { message: logMessage, isError }]);
  };

  // BƯỚC 1: Khởi tạo RevenueCat

  // BƯỚC 2: Lấy offerings với debug chi tiết
  const fetchOfferings = async () => {
    try {
      addDebugLog("📦 Đang tải offerings...");
      const offerings = await Purchases.getOfferings();

      addDebugLog(`📊 Tổng số offerings: ${Object.keys(offerings.all).length}`);

      if (offerings.current !== null) {
        const current = offerings.current;
        setCurrentOffering(current);

        // Log chi tiết offering
        addDebugLog(`✅ Current Offering ID: ${current.identifier}`);
        addDebugLog(`📦 Server Description: ${current.serverDescription}`);
        addDebugLog(`📋 Số packages: ${current.availablePackages.length}`);

        // Log chi tiết từng package
        current.availablePackages.forEach((pkg, index) => {
          addDebugLog(
            `   Package ${index + 1}: ${pkg.identifier} - ` +
              `${pkg.product.title} - ${pkg.product.priceString}`
          );
          addDebugLog(`      Product ID: ${pkg.product.identifier}`);
        });

        // KIỂM TRA QUAN TRỌNG: Có packages không?
        if (current.availablePackages.length === 0) {
          addDebugLog("⚠️ WARNING: Offering không có packages nào!", true);
          Alert.alert(
            "Lỗi cấu hình",
            "Offering không có gói subscription nào. Vui lòng:\n\n" +
              "1. Vào RevenueCat Dashboard\n" +
              "2. Chọn Offerings → Your Offering\n" +
              "3. Thêm ít nhất 1 package vào offering"
          );
          return null;
        }

        // KIỂM tra Paywall configuration
        addDebugLog("🎨 Kiểm tra Paywall configuration...");
        try {
          // Thử present paywall để xem có paywall template không
          addDebugLog("   Attempting to check paywall availability...");
        } catch (e) {
          addDebugLog(`⚠️ Paywall check warning: ${e.message}`);
        }

        return current;
      } else {
        addDebugLog("❌ Không có current offering", true);
        Alert.alert(
          "Chưa có Offering",
          "Chưa có offering nào được đánh dấu là 'current'.\n\n" +
            "Cách sửa:\n" +
            "1. Vào RevenueCat Dashboard\n" +
            "2. Offerings → Create Offering\n" +
            "3. Set offering đó làm 'Current'"
        );
        return null;
      }
    } catch (error) {
      addDebugLog(`❌ Lỗi khi lấy offerings: ${error.message}`, true);
      Alert.alert("Lỗi", `Không thể tải offerings: ${error.message}`);
      return null;
    }
  };

  // BƯỚC 3: Lấy customer info
  const fetchCustomerInfo = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Kiểm tra user ID
      console.log("Current User ID:", customerInfo.originalAppUserId);
      console.log(
        "Is Anonymous:",
        customerInfo.originalAppUserId.startsWith("$RCAnonymousID")
      );

      // Kiểm tra subscriptions
      const hasActiveSubscription =
        Object.keys(customerInfo.entitlements.active).length > 0;
      console.log("Has Active Subscription:", hasActiveSubscription);

      if (hasActiveSubscription) {
        const activeEntitlements = Object.keys(
          customerInfo.entitlements.active
        );
        console.log("Active Entitlements:", activeEntitlements);

        // Lấy thông tin chi tiết
        activeEntitlements.forEach((entitlementId) => {
          const entitlement = customerInfo.entitlements.active[entitlementId];
          console.log(`\nEntitlement: ${entitlementId}`);
          console.log(`  Product ID: ${entitlement.productIdentifier}`);
          console.log(`  Expires: ${entitlement.expirationDate}`);
          console.log(`  Will Renew: ${entitlement.willRenew}`);
        });
      }
      setCustomerInfo(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error("Error checking user:", error);
      return null;
    }
  };

  // BƯỚC 4: Hiển thị paywall với error handling tốt hơn
  const presentPaywall = async () => {
    try {
      addDebugLog("💳 Chuẩn bị hiển thị paywall...");

      // Kiểm tra có offering không
      if (!currentOffering) {
        addDebugLog("❌ Không có offering để hiển thị paywall", true);
        Alert.alert(
          "Lỗi",
          "Không thể hiển thị paywall vì chưa có offering. Vui lòng kiểm tra cấu hình trên RevenueCat Dashboard."
        );
        return false;
      }

      // Kiểm tra có packages không
      if (currentOffering.availablePackages.length === 0) {
        addDebugLog("❌ Offering không có packages", true);
        Alert.alert(
          "Lỗi cấu hình",
          "Offering không có gói subscription nào. Vui lòng thêm packages vào offering trên RevenueCat Dashboard."
        );
        return false;
      }

      addDebugLog(
        `💳 Đang present paywall với offering: ${currentOffering.identifier}`
      );
      addDebugLog(
        `   Packages available: ${currentOffering.availablePackages.length}`
      );

      // QUAN TRỌNG: Kiểm tra paywall configuration
      const paywallResult = await RevenueCatUI.presentPaywall({
        offering: currentOffering,
      }).catch((error) => {
        addDebugLog(`❌ Lỗi present paywall: ${error.message}`, true);

        // Xử lý lỗi cụ thể "No selected package"
        if (error.message.includes("No selected package")) {
          Alert.alert(
            "Lỗi: Paywall chưa cấu hình đúng",
            "Lỗi 'No selected package' nghĩa là Paywall Template chưa liên kết đúng với package.\n\n" +
              "Cách sửa:\n" +
              "1. Vào RevenueCat Dashboard → Paywalls\n" +
              "2. Chọn paywall đang dùng cho offering 'standard'\n" +
              "3. Trong phần Packages:\n" +
              "   - Tick chọn '$rc_monthly'\n" +
              "   - Click 'Set as default' hoặc 'Primary'\n" +
              "4. Save và đợi 2-3 phút\n" +
              "5. Force close app và mở lại\n\n" +
              "Hoặc dùng nút 'Mua trực tiếp' bên dưới để bypass UI.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Lỗi Paywall", error.message);
        }

        throw error;
      });

      addDebugLog(`📊 Paywall result: ${paywallResult}`);

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
          addDebugLog("✅ Mua thành công!");
          Alert.alert("Thành công", "Bạn đã subscribe thành công!");
          await fetchCustomerInfo();
          navigation.goBack();
          return true;

        case PAYWALL_RESULT.RESTORED:
          addDebugLog("🔄 Khôi phục thành công!");
          Alert.alert("Thành công", "Đã khôi phục subscription của bạn!");
          await fetchCustomerInfo();
          navigation.goBack();
          return true;

        case PAYWALL_RESULT.CANCELLED:
          addDebugLog("❌ User đã hủy");
          return false;

        case PAYWALL_RESULT.NOT_PRESENTED:
          addDebugLog("⚠️ Paywall không được hiển thị", true);
          Alert.alert(
            "Không thể hiển thị Paywall",
            "Có thể bạn chưa cấu hình Paywall Template trên Dashboard."
          );
          return false;

        case PAYWALL_RESULT.ERROR:
          addDebugLog("❌ Có lỗi xảy ra với paywall", true);
          return false;

        default:
          return false;
      }
    } catch (error) {
      addDebugLog(`❌ Exception in presentPaywall: ${error.message}`, true);
      return false;
    }
  };

  // Restore purchases
  const handleRestore = async () => {
    try {
      addDebugLog("🔄 Đang khôi phục purchases...");
      const info = await Purchases.restorePurchases();

      if (Object.keys(info.entitlements.active).length > 0) {
        addDebugLog("✅ Restore thành công");
        Alert.alert("Thành công", "Đã khôi phục subscription của bạn!");
        setCustomerInfo(info);
        navigation.goBack();
      } else {
        addDebugLog("ℹ️ Không có purchase nào để restore");
        Alert.alert(
          "Thông báo",
          "Không tìm thấy subscription nào để khôi phục."
        );
      }
    } catch (error) {
      addDebugLog(`❌ Lỗi restore: ${error.message}`, true);
      Alert.alert("Lỗi", "Không thể khôi phục purchases");
    }
  };

  // Khởi tạo
  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);

      const offering = await fetchOfferings();
      await fetchCustomerInfo();

      setIsLoading(false);
    };

    setup();
  }, []);

  const hasActiveSubscription = () => {
    if (!customerInfo) return false;
    return Object.keys(customerInfo.entitlements.active).length > 0;
  };

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
          {hasActiveSubscription() && (
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
              {hasActiveSubscription()
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
              {hasActiveSubscription()
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
