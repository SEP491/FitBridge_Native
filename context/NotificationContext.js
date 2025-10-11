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
import { request } from "../services/request";
import notificationService from "../services/notificationService";

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
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await notificationService.getNotifications();
      console.log("Fetch notifications response:", response);

      const { items, total, page: currentPage } = response.data;

      // Sort notifications by timestamp (latest first)
      const sortedItems = items.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });

      setNotifications(sortedItems);

      // Calculate unread count
      const unread = sortedItems.filter((n) => !n.isRead).length;
      setUnreadCount(unread);

      console.log(
        `Notifications fetched successfully: ${total} total, ${unread} unread`
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

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
      await notificationService.markAllAsRead();

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
      await notificationService.deleteNotification(notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      console.log(`Notification ${notificationId} deleted`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();

      setNotifications([]);
      setUnreadCount(0);

      console.log("All notifications deleted");
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Handler for receiving notifications
    const handleNotificationReceived = (notification) => {
      if (!isSubscribed) return;

      console.log("🔔 SignalR: Real-time notification received!", notification);

      fetchNotifications();
      console.log("🔄 Refreshing notifications from server...");

      // Confirm receipt to server
      signalrService
        .invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE)
        .then(() => {
          console.log("✅ Confirmed notification receipt to server");
        })
        .catch((error) => {
          console.error("❌ Failed to confirm notification receipt:", error);
        });
    };

    // Handler for disconnection
    const handleDisconnected = () => {
      if (!isSubscribed) return;
      console.log("SignalR: Disconnected");
      setIsSignalRConnected(false);
    };

    // Handler for reconnection
    const handleReconnected = () => {
      if (!isSubscribed) return;
      console.log("SignalR: Reconnected");
      setIsSignalRConnected(true);
      fetchNotifications();
    };

    // Handler for initial connection
    const handleConnected = () => {
      if (!isSubscribed) return;
      console.log("SignalR: Connection established, registering handlers");
      registerNotificationHandlers(
        signalrService.connection,
        signalrService.boundTriggerCallback
      );
      setIsSignalRConnected(true);
      fetchNotifications();
    };

    const setupSignalRHandlers = () => {
      // Register event listeners
      signalrService.onEvent(
        CLIENT_METHODS.NOTIFICATION_RECEIVED,
        handleNotificationReceived
      );
      signalrService.onEvent(
        LIFECYCLE_METHODS.ON_DISCONNECTED,
        handleDisconnected
      );
      signalrService.onEvent(
        LIFECYCLE_METHODS.ON_RECONNECTED,
        handleReconnected
      );

      // Check connection state and setup accordingly
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
        fetchNotifications();
      } else {
        console.log("SignalR: Waiting for connection...");
        signalrService.once(LIFECYCLE_METHODS.ON_CONNECTED, handleConnected);
      }
    };

    setupSignalRHandlers();

    return () => {
      // Cleanup: unsubscribe from all events
      isSubscribed = false;

      console.log("SignalR: Cleaning up notification handlers");

      signalrService.offEvent(
        CLIENT_METHODS.NOTIFICATION_RECEIVED,
        handleNotificationReceived
      );
      signalrService.offEvent(
        LIFECYCLE_METHODS.ON_DISCONNECTED,
        handleDisconnected
      );
      signalrService.offEvent(
        LIFECYCLE_METHODS.ON_RECONNECTED,
        handleReconnected
      );
      signalrService.offEvent(LIFECYCLE_METHODS.ON_CONNECTED, handleConnected);

      // Unregister SignalR connection handlers
      if (signalrService.connection) {
        unregisterNotificationHandlers(signalrService.connection);
      }
    };
  }, []);

  useEffect(() => {
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
      isSignalRConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      setNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refreshing,
      isSignalRConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
