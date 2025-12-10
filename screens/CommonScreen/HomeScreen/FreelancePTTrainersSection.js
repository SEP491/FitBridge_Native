import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import FreelancePTProfileCard from "../../../components/FreelancePTProfileCard/FreelancePTProfileCard";
import { useTranslation } from "../../../hooks/useTranslation";
import accountService from "../../../services/accountService";

export default function FreelancePTTrainersSection({ refreshTrigger, setShowFullScreenSearch }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [freelancePT, setFreelancePT] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFreelancePT = async () => {
    setLoading(true);
    try {
      const response = await accountService.getAllFreelancePT({
        page: 1,
        size: 200,
      });
      const { items } = response.data;
      setFreelancePT(items);
    } catch (error) {
      console.error("Error fetching freelance PT:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancePT();
  }, [refreshTrigger]);

  const renderFreelancePTProfileCard = (item) => {
    return <FreelancePTProfileCard pt={item} />;
  };

  const handleViewMore = () => {
    navigation.navigate("FeaturedFreelancePTScreen");
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>
            {t("home.freelancePTTrainers") || "Freelance Personal Trainers"}
          </Text>
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
      ) : freelancePT && freelancePT.length > 0 ? (
        <PairedSwiper
          data={freelancePT}
          renderItem={renderFreelancePTProfileCard}
          showsPagination={true}
          itemsPerSlide={2}
          height={300}
          loop={freelancePT.length > 2}
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
