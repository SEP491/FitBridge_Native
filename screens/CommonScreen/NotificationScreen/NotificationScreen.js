import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Alert,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";
import { formatDate, formatTime } from "../../../lib";
import notificationService from "../../../services/notificationService";
import NotificationTestHelper from "../../../components/NotificationTestHelper/NotificationTestHelper";

export default function NotificationScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [expoPushToken, setExpoPushToken] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("undetermined");

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Load notifications
    loadNotifications();

    // Listen for notifications received while app is open
    notificationListener.current =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // Add to local notifications list
        const newNotif = {
          id: Date.now(),
          type: notification.request.content.data?.type || "system",
          title: notification.request.content.title,
          message: notification.request.content.body,
          timestamp: new Date(),
          isRead: false,
          icon: getIconForType(
            notification.request.content.data?.type || "system"
          ),
          color: getColorForType(
            notification.request.content.data?.type || "system"
          ),
        };
        setNotifications((prev) => [newNotif, ...prev]);
      });

    // Listen for notification taps
    responseListener.current =
      notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log("Notification tapped:", response);
          const notificationData = response.notification.request.content.data;
          // Handle navigation based on notification type
          handleNotificationTap(notificationData);
        }
      );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
        console.log("Push token registered:", token);
      }

      const permissions = await notificationService.checkPermissions();
      setPermissionStatus(permissions.status);
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const handleNotificationTap = (data) => {
    // TODO: Navigate to appropriate screen based on notification data
    console.log("Handle notification tap:", data);
    // Example:
    // if (data.type === 'booking') navigation.navigate('BookingHistoryScreen');
    // if (data.type === 'payment') navigation.navigate('TransactionHistoryScreen');
  };

  const getIconForType = (type) => {
    switch (type) {
      case "booking":
        return "calendar";
      case "payment":
        return "card";
      case "promotion":
        return "pricetag";
      case "system":
        return "person";
      default:
        return "notifications";
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case "booking":
        return "#17a2b8";
      case "payment":
        return "#28a745";
      case "promotion":
        return "#FF914D";
      case "system":
        return "#6f42c1";
      default:
        return colors.red;
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await notificationService.getNotifications();

      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          type: "booking",
          title: "Booking Confirmed",
          message:
            "Your session with PT John Smith has been confirmed for tomorrow at 10:00 AM",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          icon: "calendar",
          color: "#17a2b8",
        },
        {
          id: 2,
          type: "payment",
          title: "Payment Successful",
          message: "Your payment of $50.00 has been processed successfully",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isRead: false,
          icon: "card",
          color: "#28a745",
        },
        {
          id: 3,
          type: "promotion",
          title: "Special Offer! 🎉",
          message: "Get 20% off on all premium packages this week!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          isRead: true,
          icon: "pricetag",
          color: "#FF914D",
        },
        {
          id: 4,
          type: "system",
          title: "Profile Updated",
          message: "Your profile information has been updated successfully",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isRead: true,
          icon: "person",
          color: "#6f42c1",
        },
        {
          id: 5,
          type: "booking",
          title: "Session Reminder",
          message:
            "Your session starts in 1 hour. Don't forget to bring your gear!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          isRead: true,
          icon: "alarm",
          color: "#ED2A46",
        },
      ];

      setNotifications(mockData);
    } catch (error) {
      console.error("Error loading notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );

    // Update badge count
    const unread = notifications.filter((n) => !n.isRead && n.id !== id).length;
    await notificationService.setBadgeCount(unread);
  };

  const deleteNotification = (id) => {
    Alert.alert(
      t("common.confirm") || "Confirm",
      "Are you sure you want to delete this notification?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));
            // Update badge count
            const unread = notifications.filter(
              (n) => !n.isRead && n.id !== id
            ).length;
            await notificationService.setBadgeCount(unread);
          },
        },
      ]
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    await notificationService.setBadgeCount(0);
  };

  const clearAll = () => {
    Alert.alert(
      t("common.confirm") || "Confirm",
      "Are you sure you want to clear all notifications?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.clear") || "Clear",
          style: "destructive",
          onPress: async () => {
            setNotifications([]);
            await notificationService.setBadgeCount(0);
          },
        },
      ]
    );
  };

  // Request permissions if not granted
  const requestPermissions = async () => {
    const token = await notificationService.registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      const permissions = await notificationService.checkPermissions();
      setPermissionStatus(permissions.status);
      Alert.alert("Success", "Notifications enabled successfully!");
    } else {
      Alert.alert(
        "Error",
        "Failed to enable notifications. Please check your device settings."
      );
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return formatDate(timestamp);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotificationItem = ({ item, index }) => {
    return (
      <NotificationCard
        item={item}
        onPress={markAsRead}
        onDelete={deleteNotification}
        getTimeAgo={getTimeAgo}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={80} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        {filter === "unread"
          ? "You're all caught up! No unread notifications."
          : filter === "read"
          ? "No read notifications yet."
          : "You'll see notifications here when you receive them."}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Permission Banner */}
      {permissionStatus !== "granted" && (
        <View style={styles.permissionBanner}>
          <View style={styles.permissionBannerContent}>
            <Ionicons name="notifications-off" size={20} color="#856404" />
            <Text style={styles.permissionBannerText}>
              Enable notifications to stay updated
            </Text>
          </View>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statsCard}>
          <View style={styles.statsIconContainer}>
            <Ionicons name="notifications" size={24} color={colors.red} />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsCount}>{notifications.length}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </View>
        </View>
        <View style={styles.statsCard}>
          <View
            style={[styles.statsIconContainer, { backgroundColor: "#E3F2FD" }]}
          >
            <Ionicons name="mail-unread" size={24} color="#2196F3" />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsCount}>{unreadCount}</Text>
            <Text style={styles.statsLabel}>Unread</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "unread" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "unread" && styles.filterTextActive,
            ]}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "read" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("read")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "read" && styles.filterTextActive,
            ]}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionContainer}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={16} color={colors.red} />
              <Text style={styles.actionButtonText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
            <Ionicons name="trash-outline" size={16} color="#dc3545" />
            <Text style={[styles.actionButtonText, { color: "#dc3545" }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const NotificationCard = ({ item, onPress, onDelete, getTimeAgo }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.notificationCardUnread,
        ]}
        activeOpacity={0.9}
        onPress={() => onPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Unread Indicator */}
        {!item.isRead && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: `${item.color}15` },
          ]}
        >
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {getTimeAgo(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </TouchableOpacity>
      <NotificationTestHelper />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff3cd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ffeeba",
  },
  permissionBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  permissionBannerText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
    flex: 1,
  },
  permissionButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerStats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statsCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFE8EC",
    justifyContent: "center",
    alignItems: "center",
  },
  statsInfo: {
    flex: 1,
  },
  statsCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statsLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: {
    backgroundColor: colors.red,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#fff",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: colors.red,
    fontWeight: "500",
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  notificationCardUnread: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 6,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});
