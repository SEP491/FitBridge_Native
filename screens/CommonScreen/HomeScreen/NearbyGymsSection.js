import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import GymCard from "../../../components/GymCard/GymCard";
import { useTranslation } from "../../../hooks/useTranslation";
import { useLocationContext } from "../../../context/LocationContext";
import gymService from "../../../services/gymService";
import { filterGymsByDistance } from "../../../lib";

export default function NearbyGymsSection({ refreshTrigger }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { coordinates } = useLocationContext();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyGyms = async () => {
    setLoading(true);
    try {
      // Fetch all gyms
      const response = await gymService.getAllGyms({
        page: 1,
        size: 200,
      });
      const { items } = response.data;

      // Filter by distance if coordinates are available
      if (coordinates) {
        const filteredGyms = filterGymsByDistance(items, coordinates, 5);
        setGyms(filteredGyms);
      } else {
        setGyms(items);
      }
    } catch (error) {
      console.error("Error fetching nearby gyms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyGyms();
  }, [coordinates, refreshTrigger]);

  const renderGymCard = (item) => {
    return <GymCard gym={item} />;
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>{t("home.nearbyGymsTitle")}</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
        </View>
      ) : gyms && gyms.length > 0 ? (
        <PairedSwiper
          data={gyms}
          showsPagination={true}
          renderItem={renderGymCard}
          itemsPerSlide={2}
          height={280}
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
