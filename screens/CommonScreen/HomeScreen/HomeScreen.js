import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import gymService from "../../../services/gymService";
import { filterGymsByDistance } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import { useLocationContext } from "../../../context/LocationContext";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
import HeaderHome from "../../../components/HeaderHome/HeaderHome";
import packageService from "../../../services/packageService";
import accountService from "../../../services/accountService";

// Import section components
import CarouselBannerSection from "./CarouselBannerSection";
import FitnessSummarySection from "./FitnessSummarySection";
import FreelancePTTrainersSection from "./FreelancePTTrainersSection";
import FreelancePTPackagesSection from "./FreelancePTPackagesSection";
import FeaturedGymsSection from "./FeaturedGymsSection";
import NearbyGymsSection from "./NearbyGymsSection";
import BlogSection from "./BlogSection";

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [allGyms, setAllGyms] = useState([]);
  const [allFreelancePTPackages, setAllFreelancePTPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allFreelancePT, setAllFreelancePT] = useState([]);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const { t } = useTranslation();
  const { location, refreshLocation, coordinates, hasLocation } =
    useLocationContext();

  const mockFreelancePT = [
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
    },
    {
      id: 2,
      fullName: "Luna Star",
      avatarUrl:
        "https://i.pinimg.com/736x/0e/fc/b5/0efcb577e982d3b47739b3d10d47ce42.jpg",
      description:
        "Expert Fitness Coach specializing in HIIT and Strength Training",
      rating: 4.9,
      goalTrainingList: ["HIIT", "Strength Training", "Endurance"],
      certifications: ["NSCA", "ACSM"],
      priceFrom: 600000,
      experienceYears: 4,
      totalPurchased: 95,
    },
    {
      id: 3,
      fullName: "Mia Khalifa",
      avatarUrl:
        "https://i.pinimg.com/736x/63/69/ab/6369ab27dca3a6331a12c517441fabd2.jpg",
      description:
        "Yoga Instructor and Wellness Coach with a holistic approach",
      rating: 4.7,
      goalTrainingList: ["Yoga", "Mindfulness", "Flexibility"],
      certifications: ["RYT 200", "Wellness Coach"],
      priceFrom: 450000,
      experienceYears: 6,
      totalPurchased: 110,
    },
  ];

  const fetchAllFreelancePT = async (page = 1, pageSize = 200) => {
    try {
      const response = await accountService.getAllFreelancePT({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      console.log("Fetched freelance PT:", items);
      setAllFreelancePT(items);
    } catch (error) {
      console.error("Error fetching freelance PT:", error);
    }
  };

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
      await fetchAllFreelancePT();

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

  console.log("All freelance PT:", allFreelancePT);

  useEffect(() => {
    if (coordinates && allGyms.length > 0) {
      handleFilterGymsByDistance();
    }
  }, [coordinates, allGyms]);
  return (
    <View style={styles.container}>
      <HeaderHome user={user} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ED2A46"]}
            tintColor="#ED2A46"
            title={t("home.refreshing")}
            titleColor="#ED2A46"
          />
        }
      >
        <CarouselBannerSection />
        <FitnessSummarySection />
        <FreelancePTTrainersSection
          freelancePT={allFreelancePT}
          loading={loading}
        />
        <FeaturedGymsSection gyms={allGyms} loading={loading} />
        <NearbyGymsSection gyms={nearbyGyms} loading={loading} />
        <BlogSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
