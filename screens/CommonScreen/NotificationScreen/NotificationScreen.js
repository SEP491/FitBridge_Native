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
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";
import { formatDate, formatTime } from "../../../lib";
import { useNotification } from "../../../context/NotificationContext";

export default function NotificationScreen() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    refreshing,
    isSignalRConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    pingCount,
    setPingCount,
  } = useNotification();

  const [filter, setFilter] = useState("all"); // all, unread, read

  // Helper function to clean HTML from notification body
  const cleanNotificationBody = (body) => {
    if (!body) return "";
    // Remove HTML tags and decode HTML entities
    return body
      .replace(/<br\s*\/?>/gi, "\n") // Replace <br/> with newline
      .replace(/<[^>]*>/g, "") // Remove all other HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  const onRefresh = async () => {
    await fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleDeleteNotification = (id) => {
    Alert.alert(
      t("common.confirm") || "Confirm",
      t("notifications.deleteConfirmMessage") ||
        "Are you sure you want to delete this notification?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNotification(id);
            setPingCount((prev) => Math.max(0, prev - 1));
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const clearAll = () => {
    Alert.alert(
      t("common.confirm") || "Confirm",
      t("notifications.clearAllConfirmMessage") ||
        "Are you sure you want to clear all notifications?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.clear") || "Clear",
          style: "destructive",
          onPress: async () => {
            await deleteAllNotifications();
            setPingCount(0);
          },
        },
      ]
    );
  };

  // Request permissions if not granted

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("notifications.timeAgo.justNow") || "Just now";
    if (minutes < 60)
      return (
        t("notifications.timeAgo.minutesAgo", { count: minutes }) ||
        `${minutes}m ago`
      );
    if (hours < 24)
      return (
        t("notifications.timeAgo.hoursAgo", { count: hours }) || `${hours}h ago`
      );
    if (days === 1) return t("notifications.timeAgo.yesterday") || "Yesterday";
    if (days < 7)
      return (
        t("notifications.timeAgo.daysAgo", { count: days }) || `${days}d ago`
      );
    return formatDate(timestamp);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  const renderNotificationItem = ({ item, index }) => {
    return (
      <NotificationCard
        item={item}
        onPress={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        getTimeAgo={getTimeAgo}
        cleanBody={cleanNotificationBody}
        t={t}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={80} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>
        {t("notifications.empty.title") || "No Notifications"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === "unread"
          ? t("notifications.empty.unreadSubtitle") ||
            "You're all caught up! No unread notifications."
          : filter === "read"
          ? t("notifications.empty.readSubtitle") ||
            "No read notifications yet."
          : t("notifications.empty.allSubtitle") ||
            "You'll see notifications here when you receive them."}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* SignalR Connection Status (for debugging) */}
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>
            SignalR: {isSignalRConnected ? "Connected ✓" : "Disconnected ✗"}
          </Text>
        </View>
      )}

      {/* Header Stats */}
      {/* <View style={styles.headerStats}>
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
      </View> */}

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
            {t("notifications.filters.all") || "All"}
            {pingCount > 0 && ` (${pingCount})`}
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
            {t("notifications.filters.unread") || "Unread"}{" "}
            {unreadCount > 0 && `(${unreadCount})`}
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
            {t("notifications.filters.read") || "Read"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionContainer}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={16} color={colors.red} />
              <Text style={styles.actionButtonText}>
                {t("notifications.markAllAsRead") || "Mark all as read"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
            <Ionicons name="trash-outline" size={16} color="#dc3545" />
            <Text style={[styles.actionButtonText, { color: "#dc3545" }]}>
              {t("notifications.clearAll") || "Clear all"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
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

const NotificationCard = ({
  item,
  onPress,
  onDelete,
  getTimeAgo,
  cleanBody,
  t,
}) => {
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

  // Get notification type mapping (icon, color, badge)
  const getNotificationTypeMapping = (notificationType) => {
    const mappings = {
      Info: {
        icon: "information-circle",
        color: "#17a2b8",
        label: t("notifications.types.info") || "Info",
      },
      Warning: {
        icon: "warning",
        color: "#ffc107",
        label: t("notifications.types.warning") || "Warning",
      },
      Error: {
        icon: "alert-circle",
        color: "#dc3545",
        label: t("notifications.types.error") || "Error",
      },
    };
    return mappings[notificationType] || mappings.Info;
  };

  const typeMapping = getNotificationTypeMapping(item.notificationType);
  const iconName = item.icon || typeMapping.icon;
  const iconColor = item.color || typeMapping.color;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.notificationCardUnread,
        ]}
        activeOpacity={0.9}
        onPress={() => onPress(item.id)}
        onPren={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Unread Indicator */}
        {!item.isRead && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: `${iconColor}15` },
          ]}
        >
          <Ionicons name={iconName} size={24} color={iconColor} />
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

          {/* Message with HTML cleaned */}
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {cleanBody(item.body || item.message)}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  debugBanner: {
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#90caf9",
  },
  debugText: {
    fontSize: 10,
    color: "#1976d2",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
