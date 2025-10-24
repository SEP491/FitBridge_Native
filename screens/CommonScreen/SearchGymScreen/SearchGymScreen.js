import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import GymCard from "../../../components/GymCard/GymCard";
import FreelancePTProfileCard from "../../../components/FreelancePTProfileCard/FreelancePTProfileCard";
import FullScreenSearch from "../../../components/FullScreenSearch/FullScreenSearch";
import gymService from "../../../services/gymService";
import { useTranslation } from "../../../hooks/useTranslation";
import accountService from "../../../services/accountService";

export default function SearchGymScreen() {
  const [searchText, setSearchText] = useState("");
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
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('gyms'); // 'gyms' or 'freelancePts'
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    experienceYears: { min: '', max: '' },
    rating: 0,
    sortBy: 'relevance', // 'relevance', 'priceAsc', 'priceDesc', 'rating', 'experience'
  });

  const searchInputRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if we received a search query from HeaderHome
    if (route.params?.searchQuery) {
      setSearchText(route.params.searchQuery);
      performSearch(route.params.searchQuery, 1);
    }
  }, [route.params]);

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

      const response = await accountService.searchAllAccounts({
        searchTerm: query.trim(),
        page: activeTab === 'gyms' ? gymPage : freelancePTPage,
        size: 10,
      });

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
          setFreelancePTResults((prev) => [...prev, ...freelancePts.items]);
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
      }

    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert(t("errors.error"), t("errors.cannotSearch"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setCurrentGymPage(1);
    setCurrentFreelancePTPage(1);
    setGymResults([]);
    setFreelancePTResults([]);
    setHasSearched(false);
    performSearch(searchText, 1, 1);
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

  const handleSearchInputFocus = () => {
    setShowFullScreenSearch(true);
    // Blur the input to prevent keyboard from showing
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleFullScreenSearchClose = () => {
    setShowFullScreenSearch(false);
  };

  const handleKeywordSelect = (keyword) => {
    setSearchText(keyword);
    setShowFullScreenSearch(false);
    // Perform search with selected keyword
    performSearch(keyword, 1);
  };

  const handleFullScreenSearch = (searchQuery) => {
    setSearchText(searchQuery);
    setShowFullScreenSearch(false);
    // Perform search with entered query
    performSearch(searchQuery, 1, 1);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    // Apply filters to current results
    // You can implement actual filtering logic here based on your requirements
    performSearch(searchText, 1, 1);
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      experienceYears: { min: '', max: '' },
      rating: 0,
      sortBy: 'relevance',
    });
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

  const renderGymCard = (gym, index) => (
    <View key={gym.id || index} style={styles.gymCardContainer}>
      <GymCard gym={gym} fullWidth={true} height={200} />
    </View>
  );

  const renderFreelancePTCard = (pt, index) => (
    <View key={pt.id || index} style={styles.ptCardContainer}>
      <FreelancePTProfileCard pt={pt} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}

      {/* Search Bar */}
      <View style={styles.searchHeader}>
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
            placeholder={t("searchGymScreen.searchPlaceholder")}
            placeholderTextColor="#A39F9F"
            style={styles.searchInput}
            onSubmitEditing={handleSearch}
            onFocus={handleSearchInputFocus}
            returnKeyType="search"
          />
          {searchText?.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ED2A46" />
          ) : (
            <Text style={styles.searchButtonText}>
              {t("searchGymScreen.searchButton")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
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

          if (isCloseToBottom && getCurrentHasMore() && !loading) {
            loadMoreData();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Tabs */}
        {hasSearched && (
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
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#ED2A46" />
            </TouchableOpacity>
          </View>
        )}

        {hasSearched && (
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
        )}

        {loading && !refreshing && getCurrentResults()?.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED2A46" />
            <Text style={styles.loadingText}>
              {t("searchGymScreen.searching")}
            </Text>
          </View>
        ) : hasSearched && getCurrentResults()?.length === 0 ? (
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
              ? gymResults.map((gym, index) => renderGymCard(gym, index))
              : (
                <View style={styles.ptGrid}>
                  {freelancePTResults.map((pt, index) => renderFreelancePTCard(pt, index))}
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

        {!hasSearched && (
          <View style={styles.instructionContainer}>
            <Ionicons name="search-outline" size={80} color="#E0E0E0" />
            <Text style={styles.instructionTitle}>
              {t("searchGymScreen.searchTitle")}
            </Text>
            <Text style={styles.instructionSubtitle}>
              {t("searchGymScreen.searchSubtitle")}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Full Screen Search */}
      <FullScreenSearch
        visible={showFullScreenSearch}
        onKeywordSelect={handleKeywordSelect}
        onClose={handleFullScreenSearchClose}
        initialSearchText={searchText}
        onSearch={handleFullScreenSearch}
        showBackButton={false}
      />

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
              {/* Price Range Filter (for Freelance PT) */}
              {activeTab === 'freelancePts' && (
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
              )}

              {/* Experience Years Filter (for Freelance PT) */}
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
              {activeTab === 'freelancePts' && (
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
              )}

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
                      { value: 'rating', label: t('common.rating', 'Rating') },
                      { value: 'experience', label: t('common.experience', 'Experience') },
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
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  resultsContainer: {
    flex: 1,
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
  instructionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  instructionSubtitle: {
    fontSize: 16,
    color: "#6B6B6B",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
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
  // Modal Styles
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
