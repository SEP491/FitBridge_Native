import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
const RevenueCatContext = createContext();
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};

export const RevenueCatProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [currentOffering, setCurrentOffering] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const addDebugLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo((prev) => [...prev, { message: logMessage, isError }]);
  };

  const initializeRevenueCat = () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_APPLE,
      });
      console.log("RevenueCat initialized successfully");
      setInitialized(true);
    } catch (error) {
      console.error("Error initializing RevenueCat:", error);
    }
  };

  const loginRevenueCatUser = async (userId, userDisplayName, userEmail) => {
    try {
      const { customerInfo, created } = await Purchases.logIn(userId);
      console.log("Logging in RevenueCat user:", customerInfo);
      console.log("RevenueCat login successful for user:", userId);

      if (created) {
        console.log("✅ RevenueCat new user created:", userId);
      } else {
        console.log("✅ RevenueCat existing user logged in:", userId);
      }
      await Purchases.setAttributes({
        email: userEmail,
        displayName: userDisplayName,
      });

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
        setIsPremiumUser(true);
      } else {
        setIsPremiumUser(false);
      }
      setCustomerInfo(customerInfo);
    } catch (error) {
      console.error("Error logging in RevenueCat user:", error);
    }
  };

  const logoutRevenueCatUser = async () => {
    try {
      await Purchases.logOut();
      setCustomerInfo(null);
      console.log("✅ RevenueCat logged out (anonymous now)");
    } catch (error) {
      console.error("Error logging out RevenueCat user:", error);
    }
  };

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
          //   Alert.alert(
          //     "Lỗi cấu hình",
          //     "Offering không có gói subscription nào. Vui lòng:\n\n" +
          //       "1. Vào RevenueCat Dashboard\n" +
          //       "2. Chọn Offerings → Your Offering\n" +
          //       "3. Thêm ít nhất 1 package vào offering"
          //   );
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
        // Alert.alert(
        //   "Chưa có Offering",
        //   "Chưa có offering nào được đánh dấu là 'current'.\n\n" +
        //     "Cách sửa:\n" +
        //     "1. Vào RevenueCat Dashboard\n" +
        //     "2. Offerings → Create Offering\n" +
        //     "3. Set offering đó làm 'Current'"
        // );
        return null;
      }
    } catch (error) {
      addDebugLog(`❌ Lỗi khi lấy offerings: ${error.message}`, true);
      //   Alert.alert("Lỗi", `Không thể tải offerings: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      console.log("Current User ID:", info.originalAppUserId);
      console.log(
        "Is Anonymous:",
        info.originalAppUserId.startsWith("$RCAnonymousID")
      );
      const hasActiveSubscription =
        Object.keys(info.entitlements.active).length > 0;
      console.log("Has Active Subscription:", hasActiveSubscription);
      if (hasActiveSubscription) {
        const activeEntitlements = Object.keys(info.entitlements.active);
        console.log("Active Entitlements:", activeEntitlements);

        // Lấy thông tin chi tiết
        activeEntitlements.forEach((entitlementId) => {
          const entitlement = info.entitlements.active[entitlementId];
          console.log(`\nEntitlement: ${entitlementId}`);
          console.log(`  Product ID: ${entitlement.productIdentifier}`);
          console.log(`  Expires: ${entitlement.expirationDate}`);
          console.log(`  Will Renew: ${entitlement.willRenew}`);
        });
        setIsPremiumUser(true);
      }
      setCustomerInfo(info);
    } catch (error) {
      console.error("Error fetching customer info:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          return true;

        case PAYWALL_RESULT.RESTORED:
          addDebugLog("🔄 Khôi phục thành công!");
          Alert.alert("Thành công", "Đã khôi phục subscription của bạn!");
          await fetchCustomerInfo();
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

  const handleRestore = async () => {
    try {
      addDebugLog("🔄 Đang khôi phục purchases...");
      const info = await Purchases.restorePurchases();

      if (Object.keys(info.entitlements.active).length > 0) {
        addDebugLog("✅ Restore thành công");
        Alert.alert("Thành công", "Đã khôi phục subscription của bạn!");
        setCustomerInfo(info);
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

  const checkUserPremiumStatus = () => {
    if (!customerInfo) return false;
    return Object.keys(customerInfo.entitlements.active).length > 0;
  };

  const value = {
    initialized,
    customerInfo,
    currentOffering,
    isLoading,
    isPremiumUser,
    debugInfo,
    initializeRevenueCat,
    loginRevenueCatUser,
    logoutRevenueCatUser,
    fetchOfferings,
    presentPaywall,
    fetchCustomerInfo,
    handleRestore,
    checkUserPremiumStatus,
    addDebugLog,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};
