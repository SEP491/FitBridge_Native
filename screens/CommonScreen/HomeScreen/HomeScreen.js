import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useLocationContext } from "../../../context/LocationContext";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";
import HeaderHome from "../../../components/HeaderHome/HeaderHome";

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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const [searchInitialTab, setSearchInitialTab] = useState("gyms");
  
  const { t } = useTranslation();
  const { refreshLocation } = useLocationContext();

  const loadUserData = async () => {
    try {
      const userData = await fetchUserFromStorage();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();
      await refreshLocation();
      // Trigger refresh in child components
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <HeaderHome 
        user={user} 
        showFullScreenSearch={showFullScreenSearch} 
        setShowFullScreenSearch={setShowFullScreenSearch}
        initialTab={searchInitialTab}
      />
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
        <FreelancePTTrainersSection refreshTrigger={refreshTrigger} />
        {/* <FreelancePTPackagesSection 
          refreshTrigger={refreshTrigger} 
          setShowFullScreenSearch={setShowFullScreenSearch}
          setSearchInitialTab={setSearchInitialTab}
        /> */}
        <FeaturedGymsSection refreshTrigger={refreshTrigger} />
        <NearbyGymsSection refreshTrigger={refreshTrigger} />
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
