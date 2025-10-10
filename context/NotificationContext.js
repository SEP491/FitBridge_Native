import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSignalR } from "./SignalRContext";
import {
  CLIENT_METHODS,
  HUB_METHODS,
} from "../services/signalR/signalingMethods";
import registerNotificationHandlers from "../services/signalR/registerNotificationHandlers";
import unregisterNotificationHandlers from "../services/signalR/unregisterNotificationHandlers";
import { LIFECYCLE_METHODS } from "../services/signalR/lifecycleMethods";
import { ConnectionStates } from "../services/signalR/ConnectionStates";
import authService from "../services/authService";
import { request } from "../services/request";
import * as Notifications from "expo-notifications";
import notificationService from "../services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { service: signalrService } = useSignalR();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await request("GET", "/v1/notifications");
      console.log("Fetch notifications response:", response);

      const { items, total, page: currentPage } = response.data;

      // Sort notifications by timestamp (latest first)
      const sortedItems = items.sort((a, b) => {
        return b.timestamp - a.timestamp; // Descending order (latest first)
      });

      // Set notifications directly from API
      setNotifications(sortedItems);

      // Calculate unread count
      const unread = sortedItems.filter((n) => !n.isRead).length;
      setUnreadCount(unread);

      console.log(
        `Notifications fetched successfully: ${total} total, ${unread} unread`
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error.response);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // TODO: Replace with your actual API endpoint
      await request("PUT", `/v1/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Replace with your actual API endpoint
      await request("PUT", "v1/notifications/read-all");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // TODO: Replace with your actual API endpoint
      await request("DELETE", `v1/notifications/${notificationId}`);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      console.log(`Notification ${notificationId} deleted`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Register for push notifications and start SignalR connection
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if user is authenticated
        const authResult = await authService.validateToken();

        if (!authResult.isValid) {
          console.log("User not authenticated, skipping notification setup");
          return;
        }

        // Check if we already have a stored token
        const storedToken = await AsyncStorage.getItem("fcmPushToken");
        if (storedToken) {
          setExpoPushToken(storedToken);
          console.log("Using stored FCM token:", storedToken);
        }

        // Check notification permissions
        const permissions = await notificationService.checkPermissions();
        console.log("Notification permissions status:", permissions.status);

        if (permissions.granted) {
          // Permission already granted
          console.log("Notification permission already granted");

          // Only register if we don't have a stored token
          if (!storedToken) {
            console.log(
              "No stored token, registering for push notifications..."
            );
            const token =
              await notificationService.registerForPushNotifications();
            if (token) {
              // Store token in AsyncStorage
              await AsyncStorage.setItem("fcmPushToken", token);
              setExpoPushToken(token);
              console.log("FCM token registered and stored:", token);
            }
          }
        } else {
          // Permission not granted yet - user can enable it manually from NotificationScreen
          console.log(
            "Notification permission not granted - user can enable from settings"
          );
        }

        // Start SignalR connection
        if (
          signalrService.connectionStatus.state !== ConnectionStates.CONNECTED
        ) {
          await signalrService.startConnection();
        }

        // Fetch notifications immediately (don't wait for SignalR)
        fetchNotifications();
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initialize();
  }, [signalrService, fetchNotifications]);

  // Setup SignalR event handlers
  useEffect(() => {
    const setupSignalRHandlers = () => {
      // Wait for connection to be established
      if (
        signalrService.connectionStatus.state === ConnectionStates.CONNECTED
      ) {
        console.log(
          "SignalR: Connection already connected, registering handlers"
        );
        registerNotificationHandlers(
          signalrService.connection,
          signalrService.boundTriggerCallback
        );
        setIsSignalRConnected(true);
        // Don't fetch here anymore, already fetched in initialization
      } else {
        console.log("SignalR: Waiting for connection...");
        signalrService.once(LIFECYCLE_METHODS.ON_CONNECTED, () => {
          console.log("SignalR: Connection connected, registering handlers");
          registerNotificationHandlers(
            signalrService.connection,
            signalrService.boundTriggerCallback
          );
          setIsSignalRConnected(true);
          // Refresh notifications when SignalR connects
          fetchNotifications();
        });
      }

      // Listen for notification received events
      signalrService.onEvent(
        CLIENT_METHODS.NOTIFICATION_RECEIVED,
        async (notification) => {
          console.log(
            "🔔 SignalR: Real-time notification received!",
            notification
          );

          // Add notification to local state
          // setNotifications((prev) => {
          //   console.log("📝 Adding notification to state");
          //   return [notification, ...prev];
          // });
          fetchNotifications();

          // Confirm receipt to server
          try {
            await signalrService.invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE);
            console.log("✅ Confirmed notification receipt to server");
          } catch (error) {
            console.error("❌ Failed to confirm notification receipt:", error);
          }

          // Refresh notifications from server to ensure sync
          console.log("🔄 Refreshing notifications from server...");
        }
      );

      // Listen for disconnection events
      signalrService.onEvent(LIFECYCLE_METHODS.ON_DISCONNECTED, () => {
        console.log("SignalR: Disconnected");
        setIsSignalRConnected(false);
      });

      signalrService.onEvent(LIFECYCLE_METHODS.ON_RECONNECTED, () => {
        console.log("SignalR: Reconnected");
        setIsSignalRConnected(true);
        fetchNotifications();
      });
    };

    setupSignalRHandlers();

    return () => {
      // Cleanup
      if (signalrService.connection) {
        unregisterNotificationHandlers(signalrService.connection);
      }
    };
  }, [signalrService, fetchNotifications]);

  // Listen for local notification taps
  useEffect(() => {
    // Listen for notification responses (when user taps notification)
    const responseSubscription =
      notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log("👆 Notification tapped:", response);
          const notificationData = response.notification.request.content.data;

          // Mark as read when tapped
          if (notificationData?.id) {
            markAsRead(notificationData.id);
          }

          // TODO: Handle navigation based on notification type
          // Example: navigation.navigate(notificationData.screen, notificationData.params);
        }
      );

    // Listen for notifications received while app is in foreground
    const receivedSubscription =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log("📱 Foreground notification received:", notification);
        // This will be triggered when a notification arrives while app is open
        // The notification will still be shown due to the handler configuration
      });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [markAsRead]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshing,
      expoPushToken,
      isSignalRConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      setNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refreshing,
      expoPushToken,
      isSignalRConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
