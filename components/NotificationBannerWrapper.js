import React from "react";
import { useNavigation } from "@react-navigation/native";
import InAppNotificationBanner from "../components/InAppNotificationBanner";
import { useNotification } from "../context/NotificationContext";

const NotificationBannerWrapper = ({ children }) => {
  const navigation = useNavigation();
  const { inAppNotification, setInAppNotification, markAsRead } =
    useNotification();

  const handleNotificationPress = (notification) => {
    // Mark as read when tapped
    if (notification.id && !notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to notifications screen
    navigation.navigate("NotificationScreen");
  };

  const handleDismiss = () => {
    setInAppNotification(null);
  };

  return (
    <>
      {children}
      <InAppNotificationBanner
        notification={inAppNotification}
        onPress={handleNotificationPress}
        onDismiss={handleDismiss}
      />
    </>
  );
};

export default NotificationBannerWrapper;
