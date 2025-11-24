import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import GymCard from "../../../components/GymCard/GymCard";
import { useTranslation } from "../../../hooks/useTranslation";
import accountService from "../../../services/accountService";
import gymService from "../../../services/gymService";

export default function FeaturedGymsSection({ refreshTrigger }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [gyms, setGyms] = useState();
  const [loading, setLoading] = useState(false);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const response = await gymService.getAllGyms({
        page: 1,
        size: 200,
      });
      // The API returns data with gyms property containing items array
      const gymsData = response.data?.items || [];
      setGyms(gymsData);
    }
    catch (error) {
      console.error("Error fetching gyms:", error);
      setGyms([]);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [refreshTrigger]);

  const renderGymCard = (item) => {
    return <GymCard gym={item} />;
  };

  // Filter only hot research gyms
  const hotResearchGym = Array.isArray(gyms) 
    ? gyms.filter((gym) => gym.hotResearch === true)
    : [];

  const handleViewMore = () => {
    navigation.navigate("FeaturedGymsScreen");
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>{t("home.featuredGyms")}</Text>
          <View style={styles.titleUnderline} />
        </View>

        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={handleViewMore}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
        </View>
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
