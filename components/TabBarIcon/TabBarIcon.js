import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const TabBarIcon = ({ routeName, focused, color, size = 24 }) => {
  // Icon mapping with focused and unfocused variants
  const getIconName = (routeName, focused) => {
    const iconMap = {
      // Home icons
      "Trang chủ": focused ? "home" : "home-outline",
      Home: focused ? "home" : "home-outline",

      // Map icons
      "Bản Đồ": focused ? "map" : "map-outline",
      Map: focused ? "map" : "map-outline",

      // Schedule/Calendar icons
      "Lịch Tập": focused ? "calendar" : "calendar-outline",
      Schedule: focused ? "calendar" : "calendar-outline",
      "Đăng Ký Lịch PT": focused ? "calendar" : "calendar-outline",
      "PT Schedule": focused ? "calendar" : "calendar-outline",

      // Chat/AI Chatbox icons
      "AI Chatbox": focused ? "chatbubbles" : "chatbubbles-outline",
      "Trò chuyện": focused ? "chatbubbles" : "chatbubbles-outline",
      Chat: focused ? "chatbubbles" : "chatbubbles-outline",
      "Nhắn tin": focused ? "chatbubbles" : "chatbubbles-outline",
      Messages: focused ? "chatbubbles" : "chatbubbles-outline",

      // Profile/Me icons
      Tôi: focused ? "person" : "person-outline",
      Me: focused ? "person" : "person-outline",
      Profile: focused ? "person" : "person-outline",

      // Booking icons
      "Đặt lịch": focused ? "barbell" : "barbell-outline",
      Booking: focused ? "barbell" : "barbell-outline",

      // Withdrawal/Money icons
      "Rút Tiền": focused ? "wallet" : "wallet-outline",
      Withdrawal: focused ? "wallet" : "wallet-outline",

      "Yêu cầu": focused ? "clipboard" : "clipboard-outline",
      Requests: focused ? "clipboard" : "clipboard-outline",
    };

    return iconMap[routeName] || (focused ? "ellipse" : "ellipse-outline");
  };

  const iconName = getIconName(routeName, focused);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: size + 8,
        height: size + 8,
      }}
    >
      <Ionicons
        name={iconName}
        size={size}
        color={color}
        style={{
          // Add a subtle shadow/glow effect for focused icons
          ...(focused && {
            shadowColor: color,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 3, // For Android shadow
          }),
        }}
      />
    </View>
  );
};

export default TabBarIcon;
