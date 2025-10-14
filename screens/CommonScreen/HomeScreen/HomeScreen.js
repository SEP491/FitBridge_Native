import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import CarouselNative from "../../../components/Carousel/Carousel";
import GymCard from "../../../components/GymCard/GymCard";
import FreelancePTCard from "../../../components/FreelancePTPackageCard/FreelancePTPackageCard";
import FreelancePTProfileCard from "../../../components/FreelancePTProfileCard/FreelancePTProfileCard";
import BlogCard from "../../../components/BlogCard/BlogCard";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import FitnessSummary from "../../../components/FitnessSummary/FitnessSummary";
import gymService from "../../../services/gymService";
import { useNavigation } from "@react-navigation/native";
import { filterGymsByDistance, handleRefresh } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import { useLocationContext } from "../../../context/LocationContext";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
import HeaderHome from "../../../components/HeaderHome/HeaderHome";
import packageService from "../../../services/packageService";
import FreelancePTPackagesCard from "../../../components/FreelancePTPackageCard/FreelancePTPackageCard";

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [allGyms, setAllGyms] = useState([]);
  const [allFreelancePTPackages, setAllFreelancePTPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { location, refreshLocation, coordinates, hasLocation } =
    useLocationContext();

  const mockFreelancePT=[
    {
      id: 1,
      fullName: "Eva Elfie",
      avatarUrl:
        "https://i.pinimg.com/736x/0f/f6/69/0ff6690ae16b9358fb62ed4934d8e598.jpg",
      description: "Certified Personal Trainer with 5 years of experience",
      rating: 4.8,
      goalTrainingList: ["Weight Loss", "Muscle Gain", "Flexibility"],
      certifications: ["ACE", "NASM", "ISSA"],
      priceFrom: 500000,
      experienceYears: 5,
      totalPurchased: 120,
    }
  ]

  const fetchAllGyms = async (page = 1, pageSize = 200) => {
    try {
      const response = await gymService.getAllGyms({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;

      setAllGyms(items);
    } catch (error) {
      console.error("Error fetching hot research gym:", error);
    }
  };

  const fetchAllFreelancePTPackages = async (page = 1, pageSize = 200) => {
    try {
      const response = await packageService.getPackagesFreelance({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      console.log("Fetched freelance PT packages:", items);
      setAllFreelancePTPackages(items);
    } catch (error) {
      console.error("Error fetching freelance PT packages:", error);
    }
  };


  const handleFilterGymsByDistance = () => {
    if (!coordinates || !allGyms.length) return;

    const filteredGyms = filterGymsByDistance(allGyms, coordinates, 5);
    // console.log("Nearby gyms:", filteredGyms);
    setNearbyGyms(filteredGyms);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch user data from storage
      const userData = await fetchUserFromStorage();
      setUser(userData);

      // Fetch gyms data
      await fetchAllGyms();
      await fetchAllFreelancePTPackages();

      // Request location if not already available
      if (!hasLocation) {
        await refreshLocation();
      }
    } catch (error) {
      console.error("Error loading screen data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
      // Also refresh location when user pulls to refresh
      await refreshLocation();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (coordinates && allGyms.length > 0) {
      handleFilterGymsByDistance();
    }
  }, [coordinates, allGyms]);

  const { width } = Dimensions.get("window");
  const widthCarousel = width - 30;

  const blog = [
    {
      id: 1,
      title: "home.blogPost1Title",
      imageUrl:
        "https://i.pinimg.com/736x/0f/f6/69/0ff6690ae16b9358fb62ed4934d8e598.jpg",
      summary: "home.blogPost1Summary",
    },
    {
      id: 2,
      title: "home.blogPost2Title",
      imageUrl:
        "https://i.pinimg.com/736x/0e/fc/b5/0efcb577e982d3b47739b3d10d47ce42.jpg",
      summary: "home.blogPost2Summary",
    },
    {
      id: 3,
      title: "home.blogPost3Title",
      imageUrl:
        "https://i.pinimg.com/736x/63/69/ab/6369ab27dca3a6331a12c517441fabd2.jpg",
      summary: "home.blogPost3Summary",
    },
  ];

  const image = [
    {
      url: "https://img.freepik.com/free-psd/gym-fitness-facebook-cover-banner-template_106176-3896.jpg?semt=ais_hybrid&w=740",
    },
    {
      url: "https://img.freepik.com/premium-psd/fitness-gym-red-banner-template_1073294-95.jpg",
    },
    {
      url: "https://img.freepik.com/premium-psd/red-horizontal-workout-gym-poster-banner_179813-347.jpg",
    },
  ];

  const renderGymCard = (item) => {
    return <GymCard gym={item} />;
  };

  const renderBlogCard = (item) => {
    return <BlogCard blog={item} />;
  };

  const renderFreelancePTCard = (item) => {
    return <FreelancePTCard package={item} />;
  };

  const renderFreelancePTProfileCard = (item) => {
    return <FreelancePTProfileCard pt={item} />;
  };

  const hotResearchGym = allGyms.filter((gym) => gym.hotResearch === true);
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <HeaderHome user={user} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ED2A46"]} // Android
            tintColor="#ED2A46" // iOS
            title={t("home.refreshing")} // iOS
            titleColor="#ED2A46" // iOS
          />
        }
      >
        <View style={styles.carouselContainer}>
          <CarouselNative
            width={widthCarousel}
            height={160}
            autoPlay={true}
            scrollAnimationDuration={1000}
            style={styles.carousel}
            data={image}
          />
        </View>

        {/* Fitness Summary Section */}
        <FitnessSummary />

        {/* Freelance PT Trainers Section */}
        <View style={styles.gymSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.sectionTitle}>{t("home.freelancePTTrainers") || "Freelance Personal Trainers"}</Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("FreelancePTScreen", { freelancPT: mockFreelancePT })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ED2A46" />
            </View>
          ) : mockFreelancePT && mockFreelancePT.length > 0 ? (
            <PairedSwiper
              data={mockFreelancePT}
              renderItem={renderFreelancePTProfileCard}
              showsPagination={true}
              itemsPerSlide={2}
              height={280}
              loop={mockFreelancePT.length > 2}
              dotStyle={styles.paginationDot}
              activeDotStyle={styles.activePaginationDot}
              containerStyle={styles.swiperContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("home.noFreelancePT") || "No freelance trainers available"}
              </Text>
            </View>
          )}
        </View>


        {/* Freelance PT Packages Section */}
        <View style={styles.gymSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.sectionTitle}>{t("home.freelancePT")}</Text>
              <View style={styles.titleUnderline} />
            </View> 
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("FreelancePTPackagesScreen", { packages: allFreelancePTPackages })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ED2A46" />
            </View>
          ) : allFreelancePTPackages && allFreelancePTPackages.length > 0 ? (
            <PairedSwiper
              data={allFreelancePTPackages}
              renderItem={(item) => <FreelancePTPackagesCard package={item} />}
              showsPagination={true}
              itemsPerSlide={2}
              height={260}
              loop={allFreelancePTPackages.length > 2}
              dotStyle={styles.paginationDot}
              activeDotStyle={styles.activePaginationDot}
              containerStyle={styles.swiperContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("home.noFreelancePTPackages") || "No freelance PT packages available"}
              </Text>
            </View>
          )}
        </View>


        {/*Gym Sections */}
        <View style={styles.gymSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.sectionTitle}>{t("home.featuredGyms")}</Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("SearchGymScreen")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{t("common.search")}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ED2A46" />
              </View>
            </>
          ) : hotResearchGym && hotResearchGym.length > 0 ? (
            <PairedSwiper
              data={hotResearchGym}
              renderItem={renderGymCard}
              showsPagination={true}
              itemsPerSlide={2}
              height={240}
              loop={hotResearchGym.length > 2}
              dotStyle={styles.paginationDot}
              activeDotStyle={styles.activePaginationDot}
              containerStyle={styles.swiperContainer}
            />
          ) : (
            <></>
          )}
        </View>

        <View style={styles.gymSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.sectionTitle}>
                {t("home.nearbyGymsTitle")}
              </Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("MapScreen")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{t("home.viewMap")}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ED2A46" />
              </View>
            </>
          ) : nearbyGyms && nearbyGyms.length > 0 ? (
            <PairedSwiper
              data={nearbyGyms}
              showsPagination={true}
              renderItem={renderGymCard}
              itemsPerSlide={2}
              height={240}
              loop={true}
              dotStyle={styles.paginationDot}
              activeDotStyle={styles.activePaginationDot}
              containerStyle={styles.swiperContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("home.noNearbyGyms")}</Text>
            </View>
          )}
        </View>

        <View style={styles.gymSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.sectionTitle}>{t("home.blog")}</Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("BlogScreen")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
            </TouchableOpacity>
          </View>

          <PairedSwiper
            data={blog}
            renderItem={renderBlogCard}
            showsPagination={true}
            itemsPerSlide={2}
            height={220}
            loop={true}
            dotStyle={styles.paginationDot}
            activeDotStyle={styles.activePaginationDot}
            containerStyle={styles.swiperContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  gymSection: {
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
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: "#ED2A46",
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  emptyContainer: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
