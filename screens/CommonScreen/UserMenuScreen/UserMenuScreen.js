import * as Notifications from "expo-notifications";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Alert,
  Touchable,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
import authService from "../../../services/authService";
import DeleteAccountBottomSheet from "../../../components/DeleteAccountBottomSheet/DeleteAccountBottomSheet";
import { useTranslation } from "../../../hooks/useTranslation";
import { ConnectionStates } from "../../../services/signalR/ConnectionStates";
import signalR_webrtcService from "../../../services/signalR/signalR-webrtcService";
import { useRevenueCat } from "../../../context/RevenueCatContext";
import { useUser } from "../../../context/UserContext";
import orderService from "../../../services/orderService";
import { fetchUserFromStorage } from "../../../lib";
import { useMeetingState } from "../../../context/meetingStateContext";
import notificationService from "../../../services/notificationService";

export default function UserMenuScreen() {
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { clearCart } = useCart(); // Assuming useCart is defined in your context or service
  const { t } = useTranslation();
  const { logoutRevenueCatUser } = useRevenueCat();
  const { avatarUrl, clearAvatarUrl } = useUser();
  const [orderSummary, setOrderSummary] = useState(null);
  const navigation = useNavigation();
  const { startCall, setCallInfo } = useMeetingState();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserFromStorage();
      console.log("Fetched user data:", userData);
      if (userData) {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.role === "Customer") {
      fetchOrders();
      fetchOrdersSummary();
    }
  }, [user]);

  // Refresh orders when screen comes into focus
  useEffect(() => {
    if (user && user.role === "Customer") {
      fetchOrders();
      fetchOrdersSummary();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getProductOrder({
        customerId: user?.id,
        sortOrder: "dsc",
      });
      setOrders(response.data.productOrders.items || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrdersSummary = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getProductOrder({
        customerId: user?.id,
        doApplyPaging: false,
      });
      setOrderSummary(response.data || null);
    } catch (error) {
      console.error("Error fetching order summary:", error);
    }
  };

  const getOrderCountByStatus = (status) => {
    if (status === "All") {
      return orderSummary?.summaryProductOrder?.totalProductOrders || 0;
    } else if (status === "Feedback") {
      return (
        orderSummary?.productOrders?.items?.filter(
          (order) =>
            order.currentStatus === "Finished" &&
            order.orderItems.some((item) => !item.isFeedback)
        ).length || 0
      );
    } else if (
      status === "Processing" ||
      status === "Shipping" ||
      status === "Pending" ||
      status === "Finished"
    ) {
      return (
        orderSummary?.summaryProductOrder?.[
          status === "Processing"
            ? "totalProcessing"
            : status === "Shipping"
            ? "totalShipping"
            : status === "Pending"
            ? "totalPending"
            : "totalFinished"
        ] || 0
      );
    }
    return 0;
  };

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
        icon: <Ionicons name="albums-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.subscription"),
        navigation: "SubscriptionScreen",
        category: "services",
      },

      {
        icon: <Ionicons name="time-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.transactionHistory"),
        navigation: "TransactionHistoryScreen",
        category: "services",
      },
      {
        icon: <Ionicons name="cube-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.myPackage"),
        navigation: "MyPackageScreen",
        category: "services",
      },
      {
        icon: <Ionicons name="star-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.myReviews&Ratings"),
        navigation: "MyReviewsRatingsScreen",
        category: "services",
      },
    ];
  }
  if (user && user.role === "FreelancePT") {
    menuItems = [
      ...menuItems,
      {
        icon: <Ionicons name="person-outline" size={28} color="#ED2A46" />,
        label: t("userMenu.contracts"),
        navigation: "ContractScreen",
        category: "account",
      },
    ];
  }
  // Add remaining menu items
  menuItems = [
    ...menuItems,
    {
      icon: <Ionicons name="flag-outline" size={28} color="#ED2A46" />,
      label: t("userMenu.myReports") || "My Reports",
      navigation: "MyReportsScreen",
      category: "services",
    },
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
                    try {
                    const pushSubscription =
                      await Notifications.getDevicePushTokenAsync();
                    console.log("pushSubscription", pushSubscription);
                    const token = pushSubscription.data;
                    await notificationService.unregisterDeviceToken({
                      deviceToken: token,
                    }).catch((error) => {
                      console.error("Error unregistering device token:", error);
                    });
                    } catch (error) {
                      console.error("Error unregistering device token:", error);
                    }
                    clearCart(); // Clear cart data
                    await clearAvatarUrl(); // Clear avatar data
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
                  } else {
                    Alert.alert(t("common.error"), t("errors.logoutError"));
                  }
                  logoutRevenueCatUser();
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
          {user && user.role === "FreelancePT" && (
            <View style={styles.viewMyPersonalScreenButtonContainer}>
              <TouchableOpacity
                style={styles.viewMyPersonalScreenButton}
                onPress={() =>
                  navigation.navigate("PTProfileScreen", { ptId: user?.id })
                }
              >
                <Text style={styles.viewMyPersonalScreenButtonText}>
                  {t("userMenu.viewMyPersonalScreen")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

          {/* Manage Orders Section (only for customers) */}
          {user && user.role === "Customer" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("userMenu.myOrders") || "My Orders"}
              </Text>
              <View style={styles.ordersContainer}>
                <TouchableOpacity
                  style={styles.orderStatusButton}
                  onPress={() =>
                    navigation.navigate("ManageOrderScreen", {
                      initialStatus: "Pending",
                      orders: orders,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.orderIconContainer}>
                    <Ionicons name="time-outline" size={28} color="#FF9800" />
                    {getOrderCountByStatus("Pending") > 0 && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>
                          {getOrderCountByStatus("Pending")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderStatusText}>
                    {t("orders.pending") || "Pending"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.orderStatusButton}
                  onPress={() =>
                    navigation.navigate("ManageOrderScreen", {
                      initialStatus: "Processing",
                      orders: orders,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.orderIconContainer}>
                    <Ionicons
                      name="construct-outline"
                      size={28}
                      color="#2196F3"
                    />
                    {getOrderCountByStatus("Processing") > 0 && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>
                          {getOrderCountByStatus("Processing")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderStatusText}>
                    {t("orders.processing") || "Processing"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.orderStatusButton}
                  onPress={() =>
                    navigation.navigate("ManageOrderScreen", {
                      initialStatus: "Shipping",
                      orders: orders,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.orderIconContainer}>
                    <Ionicons name="car-outline" size={28} color="#00BCD4" />
                    {getOrderCountByStatus("Shipping") > 0 && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>
                          {getOrderCountByStatus("Shipping")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderStatusText}>
                    {t("orders.shipping") || "Shipping"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.orderStatusButton}
                  onPress={() =>
                    navigation.navigate("ManageOrderScreen", {
                      initialStatus: "Finished",
                      filterFeedback: true,
                      orders: orders,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.orderIconContainer}>
                    <Ionicons name="star-outline" size={28} color="#FF9800" />
                    {getOrderCountByStatus("Feedback") > 0 && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>
                          {getOrderCountByStatus("Feedback")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderStatusText}>
                    {t("orders.feedback") || "Feedback"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.viewAllOrdersButton}
                onPress={() =>
                  navigation.navigate("ManageOrderScreen", { orders: orders })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllOrdersText}>
                  {t("orders.viewAll") || "View All Orders"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ED2A46" />
              </TouchableOpacity>
            </View>
          )}

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

                <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => navigation.navigate("ManageCerScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.managementIconContainer}>
                    <Ionicons
                      name="document-outline"
                      size={32}
                      color="#ED2A46"
                    />
                  </View>
                  <Text style={styles.managementButtonText}>
                    {t("userMenu.certificateManagement")}
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

            {/* Test Video Call Button */}
            {/* <TouchableOpacity
              style={styles.testButton}
              onPress={async () => {
                try {
                  // Set dummy booking info for testing
                  const testBooking = {
                    bookingId: "test-booking-123",
                    bookingName: "Test Training Session",
                    customerName: user?.fullName || "Test User",
                    ptName: "Test Trainer",
                    customerAvatarUrl: avatarUrl || user?.avatar,
                    bookingDate: new Date().toISOString().split("T")[0],
                    ptFreelanceStartTime: "10:00:00",
                    ptFreelanceEndTime: "11:00:00",
                  };

                  // Store booking info in context
                  if (setCallInfo) {
                    setCallInfo({ booking: testBooking });
                  }

                  // Start test call with dummy room ID
                  const testRoomId = "test-room-" + Date.now();
                  const userName = user?.fullName || "Test User";
                  await startCall(userName, testRoomId, 5000, false);

                  Alert.alert(
                    t("userMenu.testVideoCallAlertTitle"),
                    t("userMenu.testVideoCallAlertMessage"),
                    [{ text: t("common.ok") }]
                  );
                } catch (error) {
                  console.error("Error starting test call:", error);
                  Alert.alert(
                    "Error",
                    "Failed to start test call: " + error.message
                  );
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.testButtonContent}>
                <Ionicons name="videocam-outline" size={28} color="#ED2A46" />
                <Text style={styles.testButtonText}>
                  {t("userMenu.testVideoCall")}
                </Text>
              </View>
            </TouchableOpacity> */}
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
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerGradient: {
    paddingTop: 64,
    paddingBottom: 10,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
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
  viewMyPersonalScreenButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // marginBottom: 15,
  },

  viewMyPersonalScreenButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(100px)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
  },
  viewMyPersonalScreenButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
  ordersContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  orderStatusButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  orderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  orderBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF6B6B",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  orderBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  viewAllOrdersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  viewAllOrdersText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ED2A46",
    marginRight: 8,
  },
  testButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#ED2A46",
    borderStyle: "dashed",
  },
  testButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  testButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ED2A46",
    marginLeft: 16,
  },
};
