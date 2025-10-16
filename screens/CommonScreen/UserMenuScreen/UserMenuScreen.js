import { View, Text, ScrollView, Animated, Alert } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext";
import { getAvatarUrl, clearAvatar } from "../../../lib";
import authService from "../../../services/authService";
import DeleteAccountBottomSheet from "../../../components/DeleteAccountBottomSheet/DeleteAccountBottomSheet";
import { useTranslation } from "../../../hooks/useTranslation";
import { ConnectionStates } from "../../../services/signalR/ConnectionStates";
import signalR_webrtcService from "../../../services/signalR/signalR-webrtcService";

export default function UserMenuScreen() {
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const { clearCart } = useCart(); // Assuming useCart is defined in your context or service
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Load avatar
      const url = await getAvatarUrl();
      setAvatarUrl(url);
    };
    fetchUser();

    // Animate on mount
  }, []);

  const navigation = useNavigation();

  // Define menu items with improved icons and organization
  let menuItems = [
    {
      icon: <Ionicons name="person-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.account"),
      navigation: "AccountScreen",
      category: "account",
    },

    {
      icon: <Ionicons name="document-text-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.profile"),
      navigation: "ProfileScreen",
      category: "account",
    },
    {
      label: "Join Call Video",
      icon: <Ionicons name="videocam-outline" size={28} color="#ED2A46" />,
      navigation: "VideoCallPrep",
      category: "account",
    },
    {
      icon: <Ionicons name="settings-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.settings"),
      navigation: "SettingScreen",
      category: "settings",
    },
  ];

  // Only add user-specific items if user role is "User"
  if (user && user.role === "Customer") {
    menuItems = [
      ...menuItems,
      {
        icon: <Ionicons name="time-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.subscription"),
        navigation: "SubscriptionScreen",
        category: "services",
      },
      {
        icon: <Ionicons name="ticket-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.vouchers"),
        navigation: "VoucherScreen",
        category: "services",
      },
      {
        icon: <Ionicons name="time-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.transactionHistory"),
        navigation: "TransactionHistoryScreen",
        category: "services",
      },
      {
        icon: <Ionicons name="time-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.myPackage"),
        navigation: "MyPackageScreen",
        category: "services",
      },
    ];
  }

  // Add remaining menu items
  menuItems = [
    ...menuItems,
    {
      icon: <Ionicons name="help-circle-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.faq"),
      navigation: "FAQScreen",
      category: "support",
    },
    {
      icon: <Ionicons name="apps-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.otherUtilities"),
      navigation: "UserMenu",
      category: "support",
    },
    {
      icon: <Ionicons name="trash-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.deleteAccount"),
      navigation: "UserMenu",
      category: "settings",
      onPress: () => setShowDeleteModal(true),
    },
    {
      icon: <Ionicons name="log-out-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.logout"),
      navigation: "UserMenu",
      category: "settings",
      onPress: async () => {
        Alert.alert(
          t("userMenu.confirmLogout"), // Title of the alert
          t("userMenu.logoutMessage"), // Message of the alert
          [
            {
              text: t("userMenu.cancel"), // Cancel button
              style: "cancel", // Style for cancel button (iOS/Android)
            },
            {
              text: t("userMenu.logout"), // Confirm button
              style: "destructive", // Red color for destructive action (iOS/Android)
              onPress: async () => {
                try {
                  // Use the authService logout method
                  const logoutSuccess = await authService.logout();

                  if (logoutSuccess) {
                    clearCart(); // Clear cart data
                    await clearAvatar(); // Clear avatar data
                    setAvatarUrl(""); // Clear local avatar state
                    if (global.updateNavigationUser) {
                      global.updateNavigationUser();
                    }
                    if (
                      signalR_webrtcService.connectionStatus.state ===
                      ConnectionStates.CONNECTED
                    ) {
                      signalR_webrtcService.stopConnection();
                      console.log("SignalR: Connection stopped on logout");
                    }
                    // Navigation will be handled automatically by the Navigator
                  } else {
                    Alert.alert(t("common.error"), t("errors.logoutError"));
                  }
                } catch (error) {
                  console.error("Error during logout:", error);
                  Alert.alert(t("common.error"), t("errors.logoutError"));
                }
              },
            },
          ],
          { cancelable: true } // Allow dismissing the alert by tapping outside (optional)
        );
      },
    },
  ];

  const MenuItem = ({ item, index }) => (
    <View style={[styles.menuItemWrapper]}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          item.onPress ? item.onPress() : navigation.navigate(item.navigation)
        }
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {item.icon}
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuItemText}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={["#FF914D", "#ED2A46", "#C41E3A"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.userInfo]}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: avatarUrl || user?.avatar,
                }}
                style={styles.userAvatar}
              />
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>
                {user ? user.fullName : t("userMenu.user")}
              </Text>
              <Text style={styles.userPhone}>
                {user ? user.phone : t("userMenu.pleaseLogin")}
              </Text>
              {user && user.role && (
                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>
                    {user.role === "GymPT"
                      ? "Gym PT"
                      : user.role === "FreelancePT"
                      ? "Freelance PT"
                      : t("userMenu.user")}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Menu Items with Categories */}
        <View style={styles.menuContainer}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("userMenu.account")}</Text>
            {menuItems
              .filter((item) => item.category === "account")
              .map((item, index) => (
                <MenuItem key={index} item={item} index={index} />
              ))}
          </View>

          {/* Services Section (only for users) */}
          {user && user.role === "Customer" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("userMenu.services")}</Text>
              {menuItems
                .filter((item) => item.category === "services")
                .map((item, index) => (
                  <MenuItem key={index} item={item} index={index} />
                ))}
            </View>
          )}

          {/* Management Section (only for FreelancePT) */}
          {user && user.role === "FreelancePT" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("userMenu.management")}
              </Text>
              <View style={styles.managementGrid}>
                <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => navigation.navigate("ManageVoucherScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.managementIconContainer}>
                    <Ionicons name="ticket-outline" size={32} color="#ED2A46" />
                  </View>
                  <Text style={styles.managementButtonText}>
                    {t("userMenu.manageVoucher")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => navigation.navigate("ManagePackageScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.managementIconContainer}>
                    <Ionicons name="cube-outline" size={32} color="#ED2A46" />
                  </View>
                  <Text style={styles.managementButtonText}>
                    {t("userMenu.managePackage")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => navigation.navigate("ManageTransactionScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.managementIconContainer}>
                    <Ionicons name="card-outline" size={32} color="#ED2A46" />
                  </View>
                  <Text style={styles.managementButtonText}>
                    {t("userMenu.manageTransaction")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => navigation.navigate("MyCustomerScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.managementIconContainer}>
                    <Ionicons name="people-outline" size={32} color="#ED2A46" />
                  </View>
                  <Text style={styles.managementButtonText}>
                    {t("userMenu.myCustomer")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("userMenu.support")}</Text>
            {menuItems
              .filter((item) => item.category === "support")
              .map((item, index) => (
                <MenuItem key={index} item={item} index={index} />
              ))}
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("userMenu.settings")}</Text>
            {menuItems
              .filter((item) => item.category === "settings")
              .map((item, index) => (
                <MenuItem key={index} item={item} index={index} />
              ))}
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t("userMenu.version")}</Text>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountBottomSheet
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={() => {
          // Handle account deletion confirmation
          console.log("Account deleted");
        }}
        clearCart={clearCart}
      />
    </View>
  );
}

const styles = {
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "white",
  },
  userTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  userPhone: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "500",
  },
  managementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  managementButton: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  managementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(237, 42, 70, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  managementButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 18,
  },
};
