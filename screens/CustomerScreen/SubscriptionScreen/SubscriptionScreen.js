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
import { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useRevenueCat } from "../../../context/RevenueCatContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const colors = {
  red: "#ED2A46",
  orange: "#FF914D",
  white: "#FFFFFF",
  black: "#000000",
  borderColor: "rgba(255, 255, 255, 0.5)",
  gray: "#F8F9FA",
  darkGray: "#2C3E50",
  lightGray: "#95A5A6",
};

export default function SubscriptionScreen() {
  const { t } = useTranslation();
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

  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    if (customerInfo && checkUserPremiumStatus()) {
      const details = getSubscriptionDetails();
      setSubscriptionDetails(details);
    }
  }, [customerInfo]);

  const getSubscriptionDetails = () => {
    if (!customerInfo || !checkUserPremiumStatus()) return null;

    const entitlements = Object.values(customerInfo.entitlements.active);
    if (entitlements.length === 0) return null;

    const firstEntitlement = entitlements[0];

    return {
      productId: firstEntitlement.productIdentifier,
      expiresDate: firstEntitlement.expirationDate,
      willRenew: firstEntitlement.willRenew,
      periodType: firstEntitlement.periodType,
    };
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return t("subscription.no_limit");
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const premiumFeatures = [
    {
      icon: "fitness",
      title: t("subscription.unlimited_access"),
      description: t("subscription.use_all_premium_features"),
    },
    {
      icon: "flash",
      title: t("subscription.priority_support"),
      description: t("subscription.support_24_7"),
    },
    {
      icon: "bar-chart",
      title: t("subscription.advanced_analytics"),
      description: t("subscription.track_workout_progress"),
    },
    {
      icon: "shield-checkmark",
      title: t("subscription.no_ads"),
      description: t("subscription.smooth_experience"),
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>{t("subscription.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.orange, colors.red, "#C41E3A"]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.premiumBadge}>
              <Ionicons name="barbell" size={24} color={colors.white} />
              <Text style={styles.premiumBadgeText}>
                {t("subscription.premium")}
              </Text>
            </View>

            {checkUserPremiumStatus() ? (
              <View style={styles.heroTextContainer}>
                <View style={styles.activeStatusBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.activeStatusText}>
                    {t("subscription.activated")}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>
                  {t("subscription.welcome_back_premium")}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {t("subscription.enjoying_premium_experience")}
                </Text>
              </View>
            ) : (
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>
                  {t("subscription.upgrade_to_premium")}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {t("subscription.unlock_all_features")}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>
                    {t("subscription.from")}
                  </Text>
                  <Text style={styles.priceText}>$2.00</Text>
                  <Text style={styles.priceLabel}>
                    {t("subscription.per_month")}
                  </Text>
                </View>
              </View>
            )}

            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Subscription Status Card */}
          {checkUserPremiumStatus() && subscriptionDetails ? (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.statusTitle}>
                    {t("subscription.current_plan")}
                  </Text>
                  <Text style={styles.statusPlanName}>
                    {t("subscription.premium_monthly")}
                  </Text>
                </View>
                <View style={styles.statusIconContainer}>
                  <Ionicons name="ribbon" size={32} color={colors.red} />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="calendar" size={20} color={colors.red} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {t("subscription.expiry_date")}
                    </Text>
                    <Text style={styles.detailValue}>
                      {formatExpiryDate(subscriptionDetails.expiresDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name={
                        subscriptionDetails.willRenew
                          ? "refresh-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={
                        subscriptionDetails.willRenew
                          ? "#4CAF50"
                          : colors.lightGray
                      }
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {t("subscription.auto_renew")}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: subscriptionDetails.willRenew
                            ? "#4CAF50"
                            : colors.lightGray,
                        },
                      ]}
                    >
                      {subscriptionDetails.willRenew
                        ? t("common.yes")
                        : t("common.no")}
                    </Text>
                  </View>
                </View>

                {/* <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="pricetag" size={20} color={colors.red} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {t("subscription.product_id")}
                    </Text>
                    <Text style={styles.detailValue}>
                      {subscriptionDetails.productId}
                    </Text>
                  </View>
                </View> */}
              </View>
            </View>
          ) : (
            // Premium Features for non-subscribers
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>
                {t("subscription.premium_features")}
              </Text>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name={feature.icon}
                      size={28}
                      color={colors.red}
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {!checkUserPremiumStatus() && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!currentOffering ||
                    currentOffering.availablePackages.length === 0) &&
                    styles.disabledButton,
                ]}
                onPress={presentPaywall}
                disabled={
                  !currentOffering ||
                  currentOffering.availablePackages.length === 0
                }
              >
                <LinearGradient
                  colors={[colors.orange, colors.red]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="barbell" size={24} color={colors.white} />
                  <Text style={styles.primaryButtonText}>
                    {t("subscription.upgrade_premium")}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestore}
            >
              <Ionicons name="refresh" size={20} color={colors.red} />
              <Text style={styles.secondaryButtonText}>
                {t("subscription.restore_purchase")}
              </Text>
            </TouchableOpacity>

            {checkUserPremiumStatus() && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  Alert.alert(
                    t("subscription.manage_subscription"),
                    t("subscription.manage_subscription_in_settings"),
                    [
                      { text: t("common.close"), style: "cancel" },
                      {
                        text: t("subscription.open_settings"),
                        onPress: () => {
                          // Open settings - implementation depends on platform
                          console.log("Open device settings");
                        },
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="settings" size={20} color={colors.darkGray} />
                <Text style={styles.manageButtonText}>
                  {t("subscription.manage_subscription")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={colors.red} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {t("subscription.important_note")}
              </Text>
              <Text style={styles.infoText}>
                {t("subscription.important_note_content")}
              </Text>
            </View>
          </View>

          {/* Warnings */}
          {!currentOffering && (
            <View style={styles.warningBox}>
              <Ionicons
                name="warning"
                size={24}
                color="#FF9800"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>
                  {t("subscription.offering_not_configured")}
                </Text>
                <Text style={styles.warningText}>
                  {t("subscription.check_revenuecat_dashboard")}
                </Text>
              </View>
            </View>
          )}

          {currentOffering &&
            currentOffering.availablePackages.length === 0 && (
              <View style={styles.warningBox}>
                <Ionicons
                  name="warning"
                  size={24}
                  color="#FF9800"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>
                    {t("subscription.no_packages")}
                  </Text>
                  <Text style={styles.warningText}>
                    {t("subscription.offering_has_no_packages")}
                  </Text>
                </View>
              </View>
            )}

          {/* Debug Section - Only in DEV */}
          {__DEV__ && (
            <>
              {debugInfo.length > 0 && (
                <View style={styles.debugSection}>
                  <TouchableOpacity
                    style={styles.debugHeader}
                    onPress={() => {
                      // Toggle debug visibility if needed
                    }}
                  >
                    <Ionicons name="bug" size={20} color={colors.red} />
                    <Text style={styles.debugTitle}>
                      {t("subscription.debug_logs")}
                    </Text>
                  </TouchableOpacity>
                  <ScrollView
                    style={styles.debugScroll}
                    nestedScrollEnabled
                    horizontal={false}
                  >
                    {debugInfo.slice(-15).map((log, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.debugText,
                          log.isError && styles.debugError,
                        ]}
                      >
                        {log.message}
                      </Text>
                    ))}
                  </ScrollView>
                </View>
              )}

              {currentOffering && (
                <View style={styles.debugSection}>
                  <View style={styles.debugHeader}>
                    <Ionicons name="cube" size={20} color={colors.red} />
                    <Text style={styles.debugTitle}>
                      {t("subscription.current_offering")}
                    </Text>
                  </View>
                  <View style={styles.debugContent}>
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
                          style={[
                            styles.debugText,
                            {
                              fontSize: 10,
                              marginLeft: 10,
                              color: colors.lightGray,
                            },
                          ]}
                        >
                          Product: {pkg.product.identifier}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.lightGray,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 24,
    gap: 8,
  },
  premiumBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTextContainer: {
    alignItems: "center",
    width: "100%",
  },
  activeStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeStatusText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 6,
  },
  priceLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  priceText: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.white,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 4,
  },
  statusPlanName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(237, 42, 70, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 20,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.lightGray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkGray,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(237, 42, 70, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.lightGray,
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.red,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.red,
    fontSize: 16,
    fontWeight: "700",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  manageButtonText: {
    color: colors.darkGray,
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(237, 42, 70, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.lightGray,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E65100",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#F57C00",
  },
  debugSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  debugHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.darkGray,
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugContent: {
    gap: 4,
  },
  debugText: {
    fontSize: 11,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 16,
  },
  debugError: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  packageInfo: {
    marginTop: 4,
    paddingLeft: 8,
  },
});
