import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "../../lib/storage/storageUtils";

export default function FullScreenSearch({
  visible,
  onKeywordSelect,
  onClose,
  initialSearchText = "",
  onSearch,
  showBackButton = true,
}) {
  const [searchText, setSearchText] = useState(initialSearchText);
  const { t } = useTranslation();
  const searchInputRef = useRef(null);

  // Hot keywords data
  const [hotKeywords] = useState([
    { id: 1, text: "Gym 24/7", trend: "hot", icon: "trending-up" },
    { id: 2, text: "Boxing", trend: "rising", icon: "flame" },
    { id: 3, text: "Yoga Studio", trend: "hot", icon: "trending-up" },
    { id: 4, text: "Swimming Pool", trend: "rising", icon: "flame" },
    // { id: 5, text: "Personal Training", trend: "hot", icon: "trending-up" },
    // { id: 6, text: "Crossfit", trend: "new", icon: "sparkles" },
    // { id: 7, text: "Pilates", trend: "rising", icon: "flame" },
    // { id: 8, text: "Fitness Center", trend: "hot", icon: "trending-up" },
    // { id: 9, text: "Dance Studio", trend: "new", icon: "sparkles" },
    // { id: 10, text: "Martial Arts", trend: "rising", icon: "flame" },
  ]);

  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches when component becomes visible
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      // Auto focus on search input when visible
      if (searchInputRef.current) {
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    }
  }, [visible]);

  const loadRecentSearches = async () => {
    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

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

  const handleKeywordSelect = async (keyword) => {
    setSearchText(keyword);
    // Save to recent searches when user selects a keyword
    await saveToRecentSearches(keyword);
    onKeywordSelect(keyword);
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      // Save to recent searches when user performs a search
      await saveToRecentSearches(searchText.trim());
      onSearch && onSearch(searchText.trim());
      onKeywordSelect(searchText.trim());
    }
  };

  const saveToRecentSearches = async (keyword) => {
    try {
      const success = await addRecentSearch(keyword);
      if (success) {
        // Reload recent searches to update UI
        await loadRecentSearches();
      }
    } catch (error) {
      console.error("Error saving to recent searches:", error);
    }
  };

  const clearSearch = () => {
    setSearchText("");
  };

  const handleRemoveRecentSearch = async (keyword) => {
    try {
      const success = await removeRecentSearch(keyword);
      if (success) {
        await loadRecentSearches();
      }
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const handleClearAllRecentSearches = async () => {
    try {
      const success = await clearRecentSearches();
      if (success) {
        setRecentSearches([]);
      }
    } catch (error) {
      console.error("Error clearing all recent searches:", error);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          {showBackButton && (
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="caret-back" size={30} color="#ED2A46" />
            </TouchableOpacity>
          )}

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("gym.searchGymPlaceholder")}
              placeholderTextColor="#A39F9F"
              style={styles.searchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchButton}
            disabled={!searchText.trim()}
          >
            <Text
              style={[
                styles.searchButtonText,
                !searchText.trim() && styles.searchButtonTextDisabled,
              ]}
            >
              {t("searchGymScreen.searchButton")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScrollBeginDrag={() => {
            // Dismiss keyboard when user starts scrolling
            Keyboard.dismiss();
          }}
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.sectionTitle}>
                    {t("hotKeywords.recent")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={handleClearAllRecentSearches}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearAllText}>
                    {t("searchGymScreen.clearAll", "Clear All")}
                  </Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((item, index) => (
                <View key={`recent-${index}`} style={styles.recentItem}>
                  <TouchableOpacity
                    style={styles.recentItemContent}
                    onPress={() => handleKeywordSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search-outline" size={16} color="#999" />
                    <Text style={styles.recentText}>{item}</Text>
                    <Ionicons name="arrow-up-outline" size={16} color="#999" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveRecentSearch(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Hot Keywords */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="flame" size={20} color="#FF4757" />
                <Text style={styles.sectionTitle}>
                  {t("hotKeywords.trendingNow")}
                </Text>
              </View>
            </View>
            <View style={styles.keywordsList}>
              {hotKeywords.map((keyword, index) => (
                <TouchableOpacity
                  key={keyword.id}
                  style={styles.keywordItem}
                  onPress={() => handleKeywordSelect(keyword.text)}
                  activeOpacity={0.7}
                >
                  <View style={styles.keywordContent}>
                    <Ionicons
                      name={keyword.icon}
                      size={18}
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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    zIndex: 2000,
  },
  safeArea: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: {
    color: "#ED2A46",
    fontSize: 16,
    fontWeight: "600",
  },
  searchButtonTextDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "500",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  recentItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  recentText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  keywordsList: {
    flexDirection: "column",
  },
  keywordItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    width: "100%",
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
    marginLeft: 8,
    flex: 1,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  quickActions: {
    flexDirection: "column",
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});
