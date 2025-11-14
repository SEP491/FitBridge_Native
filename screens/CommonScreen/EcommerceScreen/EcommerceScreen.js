import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useNavigation, useRoute } from "@react-navigation/native";
import colors from "../../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullScreenSearch from "../../../components/FullScreenSearch/FullScreenSearch";
import { useCart } from "../../../context/CartContext";
import AllTab from "./AllTab";
import GymsTab from "./GymsTab";
import FreelancePTsTab from "./FreelancePTsTab";
import ProductsTab from "./ProductsTab";
import CarouselBannerSection from "./CarouselBannerSection";

export default function EcommerceScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { getCartCount } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Handle navigation params to open search with specific category
  useEffect(() => {
    if (route.params?.category) {
      const category = route.params.category;
      setSelectedCategory(category);
      // Clear the params after handling
      navigation.setParams({ category: undefined });
    }
  }, [route.params?.category]);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    // Small delay to show refreshing state
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleOpenSearch = (tab = "gyms") => {
    setShowSearch(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
  };

  // Render the active tab component
  const renderActiveTab = () => {
    switch (selectedCategory) {
      case "all":
        return <AllTab refreshTrigger={refreshTrigger} />;
      case "gyms":
        return <GymsTab refreshTrigger={refreshTrigger} />;
      case "freelancePts":
        return <FreelancePTsTab refreshTrigger={refreshTrigger} />;
      case "products":
        return <ProductsTab />;
      default:
        return <AllTab refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.red} barStyle="light-content" />

      {/* Header with Search Bar and Cart */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={handleOpenSearch}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>
            {t("search.searchGymsAndPTs")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("CartScreen")}
          activeOpacity={0.7}
        >
          <Ionicons name="cart" size={28} color={colors.red} />
          {getCartCount() > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getCartCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Categories Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("ecommerce.categories")}
          </Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === "all" && styles.categoryCardSelected
              ]}
              onPress={() => handleCategorySelect("all")}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory === "all" && styles.categoryIconSelected
              ]}>
                <Ionicons name="apps" size={32} color={selectedCategory === "all" ? "#FFFFFF" : colors.red} />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === "all" && styles.categoryTextSelected
              ]}>
                {t("ecommerce.all")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === "gyms" && styles.categoryCardSelected
              ]}
              onPress={() => handleCategorySelect("gyms")}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory === "gyms" && styles.categoryIconSelected
              ]}>
                <Ionicons name="fitness" size={32} color={selectedCategory === "gyms" ? "#FFFFFF" : colors.red} />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === "gyms" && styles.categoryTextSelected
              ]}>
                {t("ecommerce.gyms")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === "freelancePts" && styles.categoryCardSelected
              ]}
              onPress={() => handleCategorySelect("freelancePts")}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory === "freelancePts" && styles.categoryIconSelected
              ]}>
                <Ionicons name="person" size={32} color={selectedCategory === "freelancePts" ? "#FFFFFF" : colors.red} />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === "freelancePts" && styles.categoryTextSelected
              ]}>
                {t("ecommerce.personalTrainers")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === "products" && styles.categoryCardSelected
              ]}
              onPress={() => handleCategorySelect("products")}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory === "products" && styles.categoryIconSelected
              ]}>
                <Ionicons name="cube" size={32} color={selectedCategory === "products" ? "#FFFFFF" : colors.red} />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === "products" && styles.categoryTextSelected
              ]}>
                {t("ecommerce.products")}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

      {/* Main Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
          />
        }
      >
      <CarouselBannerSection />

        {/* Active Tab Content */}
        {renderActiveTab()}
      </ScrollView>

      {/* Full Screen Search */}
      <FullScreenSearch
        visible={showSearch}
        onClose={handleCloseSearch}
        autoSearchOnOpen={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: colors.red,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#999",
  },
  cartButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: colors.red,
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "23%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryCardSelected: {
    backgroundColor: colors.red,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryIconSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  homeSection: {
    marginTop: 25,
    paddingHorizontal: 15,
    width: "100%",
  },
  homeTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  titleWithIcon: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  homeSectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ED2A46",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#ED2A46",
    marginTop: 4,
    borderRadius: 2,
  },
  swiperContainer: {
    paddingBottom: 25,
  },
  paginationDot: {
    backgroundColor: "#E0E0E0",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 20,
  },
  activePaginationDot: {
    backgroundColor: "#ED2A46",
    width: 21,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    top: 20,
  },
  sectionHeaderBar: {
    backgroundColor: '#FFF5F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
    marginBottom: 0,
  },
  featuredBadge: {
    backgroundColor: '#FF9500',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#ED2A46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
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
    paddingHorizontal: 20,
    paddingTop: 15,
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
  flatListRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  flatListGymItem: {
    width: '48%',
    marginBottom: 15,
  },
  flatListPTItem: {
    width: '48%',
    marginBottom: 15,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  featuredContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  trendingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
});
