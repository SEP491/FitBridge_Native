import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const InAppNotificationBanner = ({ notification, onPress, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (notification) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissBanner();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    dismissBanner();
    if (onPress) onPress(notification);
  };

  if (!notification) return null;

  // Get notification type mapping (icon, color)
  const getNotificationTypeMapping = (notificationType) => {
    const mappings = {
      Info: {
        icon: "information-circle",
        color: "#17a2b8",
        backgroundColor: "#d1ecf1",
      },
      Warning: {
        icon: "warning",
        color: "#ffc107",
        backgroundColor: "#fff3cd",
      },
      Error: {
        icon: "alert-circle",
        color: "#dc3545",
        backgroundColor: "#f8d7da",
      },
      Success: {
        icon: "checkmark-circle",
        color: "#28a745",
        backgroundColor: "#d4edda",
      },
    };
    return (
      mappings[notification.notificationType] || {
        icon: "notifications",
        color: "#ED2A46",
        backgroundColor: "#ffe5e9",
      }
    );
  };

  const typeMapping = getNotificationTypeMapping(notification.notificationType);
  const iconName = notification.icon || typeMapping.icon;
  const iconColor = notification.color || typeMapping.color;
  const backgroundColor = typeMapping.backgroundColor;

  // Clean HTML from message
  const cleanBody = (text) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top || (Platform.OS === "ios" ? 50 : 10),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.banner, { backgroundColor }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName} size={24} color="#fff" />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {cleanBody(notification.body || notification.message)}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissBanner}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});

export default InAppNotificationBanner;
