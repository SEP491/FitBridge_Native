import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { useTranslation } from "../../../hooks/useTranslation";

export default function TopRatingProductSection({ refreshTrigger, viewMore = true }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when products API is ready
      // const response = await productService.getTopRatedProducts({ page: 1, size: 10 });
      // const productsData = response.data?.items || [];
      
      // For now, use mocked data with high ratings
      const mockedProducts = [
        {
          id: "019a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "Super Whey Protein Powder",
          description: "Premium quality whey protein for muscle building and recovery. Contains 25g protein per serving.",
          displayPrice: 200000,
          salePrice: 165000,
          quantity: 20,
          totalSoldQuantity: 150,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 165000,
          rating: 4.8,
          totalReviews: 203,
          countryOfOrigin: "USA",
        },
        {
          id: "219a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "BCAA Energy Drink",
          description: "Branched-chain amino acids for enhanced workout performance and recovery.",
          displayPrice: 180000,
          salePrice: 150000,
          quantity: 30,
          totalSoldQuantity: 200,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 150000,
          rating: 4.7,
          totalReviews: 145,
          countryOfOrigin: "Germany",
        },
        {
          id: "119a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "Mega Mass Gainer",
          description: "High-calorie mass gainer supplement for athletes looking to gain muscle mass quickly.",
          displayPrice: 350000,
          salePrice: 299000,
          quantity: 15,
          totalSoldQuantity: 87,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 299000,
          rating: 4.5,
          totalReviews: 89,
          countryOfOrigin: "USA",
        },
        {
          id: "319a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "Pre-Workout Booster",
          description: "Explosive energy formula to maximize your training intensity and focus.",
          displayPrice: 250000,
          salePrice: 220000,
          quantity: 25,
          totalSoldQuantity: 320,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 220000,
          rating: 4.6,
          totalReviews: 156,
          countryOfOrigin: "UK",
        },
        {
          id: "419a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "Creatine Monohydrate",
          description: "Pure creatine monohydrate for strength and power enhancement.",
          displayPrice: 220000,
          salePrice: 185000,
          quantity: 40,
          totalSoldQuantity: 280,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 185000,
          rating: 4.9,
          totalReviews: 267,
          countryOfOrigin: "Germany",
        },
        {
          id: "519a72dc-6e8b-7fcd-ad00-bccda42ae18f",
          name: "Glutamine Recovery",
          description: "Essential amino acid for muscle recovery and immune support.",
          displayPrice: 190000,
          salePrice: 160000,
          quantity: 35,
          totalSoldQuantity: 175,
          imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/97f44267-a909-473c-82ec-3fff91b4af80/view?project=68ed0fdd0037253031b8",
          priceFrom: 160000,
          rating: 4.4,
          totalReviews: 98,
          countryOfOrigin: "USA",
        },
      ];

      // Sort by rating (highest first) and filter products with rating >= 4.0
      const topRatedProducts = mockedProducts
        .filter(product => product.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating);

      setProducts(topRatedProducts);
    } catch (error) {
      console.error("Error fetching top rated products:", error);
      setProducts([]);
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
            onPress={() => navigation.navigate(t("navigation.ecommerce"), { 
              screen: "EcommerceMain",
              params: { category: "products" }
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
        </View>
      ) : products && products.length > 0 ? (
        <PairedSwiper
          data={products}
          renderItem={renderProductCard}
          showsPagination={true}
          itemsPerSlide={2}
          height={280}
          loop={products.length > 2}
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
