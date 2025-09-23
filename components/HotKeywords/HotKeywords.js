import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import React, { useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";
import hotKeywordsService from "../../services/hotKeywordsService";

const { width } = Dimensions.get("window");

export default function HotKeywords({
  visible,
  onKeywordSelect,
  onClose,
  headerHeight = 140,
}) {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  // Hot keywords data - you can make this dynamic later
  const hotKeywords = [
    { id: 1, text: "Gym 24/7", trend: "hot", icon: "trending-up" },
    { id: 2, text: "Boxing", trend: "rising", icon: "flame" },
    { id: 3, text: "Yoga Studio", trend: "hot", icon: "trending-up" },
    { id: 4, text: "Swimming Pool", trend: "rising", icon: "flame" },
    { id: 5, text: "Personal Training", trend: "hot", icon: "trending-up" },
    { id: 6, text: "Crossfit", trend: "new", icon: "sparkles" },
    { id: 7, text: "Pilates", trend: "rising", icon: "flame" },
    { id: 8, text: "Fitness Center", trend: "hot", icon: "trending-up" },
    { id: 9, text: "Dance Studio", trend: "new", icon: "sparkles" },
    { id: 10, text: "Martial Arts", trend: "rising", icon: "flame" },
  ];

  const recentSearches = hotKeywordsService.getRecentSearches();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTrendColor = (trend) => {
    switch (trend) {
      case "hot":
        return "#FF4757";
      case "rising":
        return "#FF6B35";
      case "new":
        return "#5352ED";
      default:
        return "#FF4757";
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case "hot":
        return t("hotKeywords.hot");
      case "rising":
        return t("hotKeywords.rising");
      case "new":
        return t("hotKeywords.new");
      default:
        return t("hotKeywords.hot");
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            top: headerHeight,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("hotKeywords.trending")}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.sectionTitle}>
                  {t("hotKeywords.recent")}
                </Text>
              </View>
              {recentSearches.map((item, index) => (
                <TouchableOpacity
                  key={`recent-${index}`}
                  style={styles.recentItem}
                  onPress={() => onKeywordSelect(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search-outline" size={16} color="#999" />
                  <Text style={styles.recentText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hot Keywords */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={20} color="#FF4757" />
              <Text style={styles.sectionTitle}>
                {t("hotKeywords.trendingNow")}
              </Text>
            </View>
            <View style={styles.keywordsGrid}>
              {hotKeywords.map((keyword, index) => (
                <TouchableOpacity
                  key={keyword.id}
                  style={[
                    styles.keywordItem,
                    { backgroundColor: getTrendColor(keyword.trend) + "15" },
                  ]}
                  onPress={() => onKeywordSelect(keyword.text)}
                  activeOpacity={0.8}
                >
                  <View style={styles.keywordContent}>
                    <Ionicons
                      name={keyword.icon}
                      size={16}
                      color={getTrendColor(keyword.trend)}
                    />
                    <Text style={styles.keywordText}>{keyword.text}</Text>
                  </View>
                  <View
                    style={[
                      styles.trendBadge,
                      { backgroundColor: getTrendColor(keyword.trend) },
                    ]}
                  >
                    <Text style={styles.trendBadgeText}>
                      {getTrendText(keyword.trend)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash-outline" size={20} color="#5352ED" />
              <Text style={styles.sectionTitle}>
                {t("hotKeywords.quickSearch")}
              </Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => onKeywordSelect("gyms near me")}
              >
                <Ionicons name="location-outline" size={20} color="#5352ED" />
                <Text style={styles.quickActionText}>
                  {t("hotKeywords.nearMe")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => onKeywordSelect("24/7 gyms")}
              >
                <Ionicons name="time-outline" size={20} color="#5352ED" />
                <Text style={styles.quickActionText}>
                  {t("hotKeywords.open247")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => onKeywordSelect("premium gyms")}
              >
                <Ionicons name="star-outline" size={20} color="#5352ED" />
                <Text style={styles.quickActionText}>
                  {t("hotKeywords.premium")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 8,
  },
  recentText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
  },
  keywordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: "45%",
    maxWidth: "48%",
  },
  keywordContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 6,
    flex: 1,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActionItem: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginTop: 6,
  },
});
