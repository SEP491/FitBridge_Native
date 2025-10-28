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
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
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
import accountService from "../../services/accountService";
import GymCard from "../GymCard/GymCard";
import FreelancePTProfileCard from "../FreelancePTProfileCard/FreelancePTProfileCard";

export default function FullScreenSearch({
  visible,
  onKeywordSelect,
  onClose,
  initialSearchText = "",
  onSearch,
  showBackButton = true,
  searchText: controlledSearchText,
  onSearchTextChange,
}) {
  const [internalSearchText, setInternalSearchText] = useState(initialSearchText);
  const searchText = controlledSearchText !== undefined ? controlledSearchText : internalSearchText;
  const setSearchText = onSearchTextChange || setInternalSearchText;
  
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const [keywords, setKeywords] = useState([]);
  
  // Search results states
  const [gymResults, setGymResults] = useState([]);
  const [freelancePTResults, setFreelancePTResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalGymResults, setTotalGymResults] = useState(0);
  const [totalFreelancePTResults, setTotalFreelancePTResults] = useState(0);
  const [currentGymPage, setCurrentGymPage] = useState(1);
  const [currentFreelancePTPage, setCurrentFreelancePTPage] = useState(1);
  const [hasMoreGymData, setHasMoreGymData] = useState(false);
  const [hasMoreFreelancePTData, setHasMoreFreelancePTData] = useState(false);
  const [activeTab, setActiveTab] = useState('gyms'); // 'gyms' or 'freelancePts'
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    experienceYears: { min: '', max: '' },
    rating: 0,
    sortBy: 'relevance',
  });

  const [recentSearches, setRecentSearches] = useState([]);

  const loadKeywords = async () => {
    try {
      const response = await accountService.getKeywords({
        doApplyPaging: false,
      });
      setKeywords(response.data.items);
      console.log("Keywords Data:", response.data.items);
    } catch (error) {
      console.error("Error loading keywords:", error);
    }
  };

  // Load recent searches when component becomes visible
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      loadKeywords();

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

  const performSearch = async (query, gymPage = 1, freelancePTPage = 1, append = false) => {
    if (!query.trim()) {
      Alert.alert(
        t("errors.notification"),
        t("errors.pleaseEnterSearchKeyword")
      );
      return;
    }

    try {
      if (!append) {
        setLoading(true);
        setHasSearched(true);
      }

      // Build filter parameters
      const params = {
        searchTerm: query.trim(),
        size: 10,
      };

      // Add filter parameters only for Freelance PT tab
      if (activeTab === 'freelancePts') {
        params.searchType = 'FreelancePT';
        
        if (filters.priceRange.min) {
          params.fromPrice = parseFloat(filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          params.toPrice = parseFloat(filters.priceRange.max);
        }
        if (filters.rating > 0) {
          params.rating = filters.rating;
        }
        if (filters.experienceYears.min) {
          params.experienceYears = parseInt(filters.experienceYears.min);
        }
        if (filters.sortBy && filters.sortBy !== 'relevance') {
          params.sortBy = filters.sortBy;
        }
        if (filters.sortBy === 'priceAsc' || filters.sortBy === 'priceDesc') {
          params.sortOrder = filters.sortBy === 'priceAsc' ? 'asc' : 'desc';
          params.sortBy = 'price';
        }
      } else {
        params.searchType = 'Gym';
      }

      const response = await accountService.searchAllAccounts(params);

      console.log("Search results response:", response.data);

      const { gyms, freelancePts } = response.data;

      // Update gym results
      if (activeTab === 'gyms') {
        if (append) {
          setGymResults((prev) => [...prev, ...gyms.items]);
        } else {
          setGymResults(gyms.items);
        }
        setTotalGymResults(gyms.total);
        setCurrentGymPage(gyms.page);
        setHasMoreGymData(
          gyms.items?.length === 10 && gymResults?.length + gyms.items?.length < gyms.total
        );
      }

      // Update freelance PT results
      if (activeTab === 'freelancePts') {
        if (append) {
          setFreelancePTResults((prev) => [...prev, ...freelancePTs.items]);
        } else {
          setFreelancePTResults(freelancePts.items);
        }
        setTotalFreelancePTResults(freelancePts.total);
        setCurrentFreelancePTPage(freelancePts.page);
        setHasMoreFreelancePTData(
          freelancePts.items?.length === 10 && 
          freelancePTResults?.length + freelancePts.items?.length < freelancePts.total
        );
      }

      // Set total results for initial load
      if (!append) {
        setTotalGymResults(gyms.total);
        setTotalFreelancePTResults(freelancePts.total);
        setGymResults(gyms.items);
        setFreelancePTResults(freelancePts.items);

        // Auto-navigate to other tab if current tab has no results
        if (activeTab === 'gyms' && gyms.total === 0 && freelancePts.total > 0) {
          setActiveTab('freelancePts');
        } else if (activeTab === 'freelancePts' && freelancePts.total === 0 && gyms.total > 0) {
          setActiveTab('gyms');
        }
      }

    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert(t("errors.error"), t("errors.cannotSearch"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreData = () => {
    if (activeTab === 'gyms' && hasMoreGymData && !loading) {
      performSearch(searchText, currentGymPage + 1, currentFreelancePTPage, true);
    } else if (activeTab === 'freelancePts' && hasMoreFreelancePTData && !loading) {
      performSearch(searchText, currentGymPage, currentFreelancePTPage + 1, true);
    }
  };

  const onRefresh = () => {
    if (hasSearched && searchText.trim()) {
      setRefreshing(true);
      setCurrentGymPage(1);
      setCurrentFreelancePTPage(1);
      performSearch(searchText, 1, 1);
    }
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    setCurrentGymPage(1);
    setCurrentFreelancePTPage(1);
    setGymResults([]);
    setFreelancePTResults([]);
    performSearch(searchText, 1, 1);
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      experienceYears: { min: '', max: '' },
      rating: 0,
      sortBy: 'relevance',
    });
    setShowFilterModal(false);
    setCurrentGymPage(1);
    setCurrentFreelancePTPage(1);
    setGymResults([]);
    setFreelancePTResults([]);
    if (searchText.trim()) {
      performSearch(searchText, 1, 1);
    }
  };

  const getCurrentResults = () => {
    return activeTab === 'gyms' ? gymResults : freelancePTResults;
  };

  const getCurrentTotal = () => {
    return activeTab === 'gyms' ? totalGymResults : totalFreelancePTResults;
  };

  const getCurrentHasMore = () => {
    return activeTab === 'gyms' ? hasMoreGymData : hasMoreFreelancePTData;
  };

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

  const handleKeywordSelect = async (keyword) => {
    setSearchText(keyword);
    await saveToRecentSearches(keyword);
    // Perform search instead of just selecting
    await performSearch(keyword, 1, 1);
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      await saveToRecentSearches(searchText.trim());
      await performSearch(searchText.trim(), 1, 1);
    }
  };

  const saveToRecentSearches = async (keyword) => {
    try {
      const success = await addRecentSearch(keyword);
      if (success) {
        await loadRecentSearches();
      }
    } catch (error) {
      console.error("Error saving to recent searches:", error);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setGymResults([]);
    setFreelancePTResults([]);
    setHasSearched(false);
    setTotalGymResults(0);
    setTotalFreelancePTResults(0);
    setCurrentGymPage(1);
    setCurrentFreelancePTPage(1);
    setHasMoreGymData(false);
    setHasMoreFreelancePTData(false);
    setActiveTab('gyms');
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ED2A46"]}
              tintColor="#ED2A46"
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 20;

            if (isCloseToBottom && getCurrentHasMore() && !loading && hasSearched) {
              loadMoreData();
            }
          }}
          scrollEventThrottle={400}
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
          }}
        >
          {/* Show search results if searched */}
          {hasSearched ? (
            <>
              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'gyms' && styles.activeTab]}
                    onPress={() => setActiveTab('gyms')}
                  >
                    <Ionicons 
                      name="fitness" 
                      size={18} 
                      color={activeTab === 'gyms' ? '#ED2A46' : '#999'} 
                    />
                    <Text style={[
                      styles.tabText,
                      activeTab === 'gyms' && styles.activeTabText
                    ]}>
                      {t('common.gym', 'Gyms')} ({totalGymResults})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'freelancePts' && styles.activeTab]}
                    onPress={() => setActiveTab('freelancePts')}
                  >
                    <Ionicons 
                      name="person" 
                      size={18} 
                      color={activeTab === 'freelancePts' ? '#ED2A46' : '#999'} 
                    />
                    <Text style={[
                      styles.tabText,
                      activeTab === 'freelancePts' && styles.activeTabText
                    ]}>
                      {t('common.freelancePT', 'Freelance PT')} ({totalFreelancePTResults})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Filter Button */}
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    (filters.priceRange.min || filters.priceRange.max || 
                     filters.experienceYears.min || filters.rating > 0 || 
                     filters.sortBy !== 'relevance') && styles.filterButtonActive
                  ]}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons name="filter" size={20} color="#ED2A46" />
                  {(filters.priceRange.min || filters.priceRange.max || 
                    filters.experienceYears.min || filters.rating > 0 || 
                    filters.sortBy !== 'relevance') && (
                    <View style={styles.filterBadge} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Result Info */}
              <View style={styles.resultInfo}>
                <Text style={styles.resultText}>
                  {searchText
                    ? t("searchGymScreen.foundResultsFor", {
                        count: getCurrentTotal(),
                        query: searchText,
                      })
                    : t("searchGymScreen.foundResults", { count: getCurrentTotal() })}
                </Text>
              </View>

              {/* Loading State */}
              {loading && !refreshing && getCurrentResults()?.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#ED2A46" />
                  <Text style={styles.loadingText}>
                    {t("searchGymScreen.searching")}
                  </Text>
                </View>
              ) : getCurrentResults()?.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={80} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>
                    {t("searchGymScreen.noResultsTitle")}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {t("searchGymScreen.noResultsSubtitle")}
                  </Text>
                </View>
              ) : (
                <View style={styles.resultsGrid}>
                  {activeTab === 'gyms' 
                    ? gymResults.map((gym, index) => (
                        <View key={gym.id || index} style={styles.gymCardContainer}>
                          <GymCard gym={gym} fullWidth={true} height={200} />
                        </View>
                      ))
                    : (
                      <View style={styles.ptGrid}>
                        {freelancePTResults.map((pt, index) => (
                          <View key={pt.id || index} style={styles.ptCardContainer}>
                            <FreelancePTProfileCard pt={pt} />
                          </View>
                        ))}
                      </View>
                    )
                  }

                  {getCurrentHasMore() && (
                    <View style={styles.loadMoreContainer}>
                      <ActivityIndicator size="small" color="#ED2A46" />
                      <Text style={styles.loadMoreText}>
                        {t("searchGymScreen.loadingMore")}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Recent Searches - Show before search */}
              {recentSearches.length > 0 && !hasSearched && (
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

              {/* Hot Keywords - Show before search */}
              {!hasSearched && (
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
                    {keywords.map((keyword, index) => (
                      <TouchableOpacity
                        key={keyword.id}
                        style={styles.keywordItem}
                        onPress={() => handleKeywordSelect(keyword.gymName)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.keywordContent}>
                          <Ionicons
                            name={"trending-up"}
                            size={18}
                            color={getTrendColor("hot")}
                          />
                          <Text style={styles.keywordText}>{keyword.gymName}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('common.filter', 'Filter')}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t('common.priceRange', 'Price Range')}
                </Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder={t('common.min', 'Min')}
                    value={filters.priceRange.min}
                    onChangeText={(text) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, min: text }
                    })}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder={t('common.max', 'Max')}
                    value={filters.priceRange.max}
                    onChangeText={(text) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, max: text }
                    })}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Experience Years Filter (for Freelance PT only) */}
              {activeTab === 'freelancePts' && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>
                    {t('common.experienceYears', 'Experience (Years)')}
                  </Text>
                  <View style={styles.rangeInputs}>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder={t('common.min', 'Min')}
                      value={filters.experienceYears.min}
                      onChangeText={(text) => setFilters({
                        ...filters,
                        experienceYears: { ...filters.experienceYears, min: text }
                      })}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.rangeSeparator}>-</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder={t('common.max', 'Max')}
                      value={filters.experienceYears.max}
                      onChangeText={(text) => setFilters({
                        ...filters,
                        experienceYears: { ...filters.experienceYears, max: text }
                      })}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              )}

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t('common.minRating', 'Minimum Rating')}
                </Text>
                <View style={styles.ratingButtons}>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingButton,
                        filters.rating === rating && styles.activeRatingButton
                      ]}
                      onPress={() => setFilters({ ...filters, rating })}
                    >
                      <Ionicons 
                        name="star" 
                        size={16} 
                        color={filters.rating === rating ? '#fff' : '#FFD700'} 
                      />
                      <Text style={[
                        styles.ratingButtonText,
                        filters.rating === rating && styles.activeRatingButtonText
                      ]}>
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t('common.sortBy', 'Sort By')}
                </Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: 'relevance', label: t('common.relevance', 'Relevance') },
                    ...(activeTab === 'freelancePts' ? [
                      { value: 'priceAsc', label: t('common.priceAsc', 'Price: Low to High') },
                      { value: 'priceDesc', label: t('common.priceDesc', 'Price: High to Low') },
                      { value: 'rating', label: t('common.rating', 'Highest Rating') },
                      { value: 'experienceYears', label: t('common.experience', 'Most Experience') },
                    ] : [])
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        filters.sortBy === option.value && styles.activeSortOption
                      ]}
                      onPress={() => setFilters({ ...filters, sortBy: option.value })}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        filters.sortBy === option.value && styles.activeSortOptionText
                      ]}>
                        {option.label}
                      </Text>
                      {filters.sortBy === option.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#ED2A46" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>
                  {t('common.reset', 'Reset')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>
                  {t('common.apply', 'Apply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Search Results Styles
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingHorizontal: 16,
  },
  tabsWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ED2A46',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#ED2A46',
    fontWeight: '600',
  },
  filterButton: {
    padding: 12,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#FFF5F6',
    borderRadius: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ED2A46',
  },
  resultInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  resultText: {
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  resultsGrid: {
    paddingHorizontal: 20,
    paddingTop: 15,
    width: "100%",
  },
  ptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  gymCardContainer: {
    marginBottom: 15,
    width: "100%",
    alignSelf: "stretch",
  },
  ptCardContainer: {
    marginBottom: 15,
    width: '48%',
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeRatingButton: {
    backgroundColor: '#ED2A46',
    borderColor: '#ED2A46',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeRatingButtonText: {
    color: '#fff',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeSortOption: {
    backgroundColor: '#FFF5F6',
    borderColor: '#ED2A46',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeSortOptionText: {
    color: '#ED2A46',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ED2A46',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
