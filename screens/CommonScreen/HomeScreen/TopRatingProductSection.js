import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import ProductCard from "../../../components/ProductCard/ProductCard";
import ProductCardSkeleton from "../../../components/ProductCard/ProductCardSkeleton";
import { useTranslation } from "../../../hooks/useTranslation";

export default function TopRatingProductSection({ refreshTrigger, products, viewMore = true }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Sort by rating (highest first) and filter products with rating >= 4.0
      const topRatedProducts = products
        .filter(product => product.rating >= 0)
        .sort((a, b) => b.rating - a.rating);

      setTopProducts(topRatedProducts);
    } catch (error) {
      console.error("Error fetching top rated products:", error);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const renderProductCard = (item) => {
    return <ProductCard product={item} />;
  };

  const renderSkeletonCard = () => {
    return <ProductCardSkeleton />;
  };

  // Create skeleton data array for swiper
  const skeletonData = Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-${i}` }));

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>{t("home.topRatedProducts")}</Text>
          <View style={styles.titleUnderline} />
        </View>
        {viewMore && (
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate("TopRatingProductsScreen")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <PairedSwiper
          data={skeletonData}
          renderItem={renderSkeletonCard}
          showsPagination={true}
          itemsPerSlide={2}
          height={280}
          loop={false}
          dotStyle={styles.paginationDot}
          activeDotStyle={styles.activePaginationDot}
          containerStyle={styles.swiperContainer}
          autoplay={false}
        />
      ) : topProducts && topProducts.length > 0 ? (
        <PairedSwiper
          data={topProducts}
          renderItem={renderProductCard}
          showsPagination={true}
          itemsPerSlide={2}
          height={280}
          loop={topProducts.length > 2}
          dotStyle={styles.paginationDot}
          activeDotStyle={styles.activePaginationDot}
          containerStyle={styles.swiperContainer}
          autoplay={true}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 25,
    paddingHorizontal: 15,
    width: "100%",
  },
  titleContainer: {
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
  sectionTitle: {
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
  viewMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMoreText: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "600",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
