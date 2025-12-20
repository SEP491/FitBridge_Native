import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import colors from "../../constants/color";

/**
 * Standardized Loading Indicator Component
 * 
 * @param {Object} props
 * @param {string} props.size - "small" | "large" (default: "large")
 * @param {string} props.variant - "page" | "button" | "inline" (default: "page")
 * @param {string} props.message - Optional loading message text
 * @param {string} props.color - Override color (optional)
 */
const LoadingIndicator = ({
  size = "large",
  variant = "page",
  message,
  color,
}) => {
  // Determine color based on variant if not explicitly provided
  const getColor = () => {
    if (color) return color;
    
    switch (variant) {
      case "button":
        return colors.white;
      case "inline":
        return colors.red;
      case "page":
      default:
        return colors.red;
    }
  };

  // Determine size based on variant if not explicitly provided
  const getSize = () => {
    if (size) return size;
    
    switch (variant) {
      case "button":
      case "inline":
        return "small";
      case "page":
      default:
        return "large";
    }
  };

  const indicatorColor = getColor();
  const indicatorSize = getSize();

  // For button variant, just return the indicator without container
  if (variant === "button") {
    return <ActivityIndicator size={indicatorSize} color={indicatorColor} />;
  }

  // For inline variant, return minimal container
  if (variant === "inline") {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size={indicatorSize} color={indicatorColor} />
        {message && <Text style={styles.inlineText}>{message}</Text>}
      </View>
    );
  }

  // For page variant (default), return full container
  return (
    <View style={styles.pageContainer}>
      <ActivityIndicator size={indicatorSize} color={indicatorColor} />
      {message && <Text style={styles.pageText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  pageText: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 16,
    textAlign: "center",
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  inlineText: {
    fontSize: 14,
    color: "#6c757d",
  },
});

export default LoadingIndicator;

