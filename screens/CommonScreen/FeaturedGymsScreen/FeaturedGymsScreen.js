import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import gymService from "../../../services/gymService";
import GymCard from "../../../components/GymCard/GymCard";
import FullScreenSearch from "../../../components/FullScreenSearch/FullScreenSearch";

export default function FeaturedGymsScreen() {
  const { t } = useTranslation();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);

  const fetchTopGyms = async () => {
    try {
      setLoading(true);
      const response = await gymService.getAllGyms({
        page: 1,
        size: 200,
      });
      const gymsData = response.data?.items || [];
      // Filter only hot research gyms and take top 10
      const hotResearchGyms = gymsData
        .filter((gym) => gym.hotResearch === true)
        .slice(0, 10);
      setGyms(hotResearchGyms);
    } catch (error) {
      console.error("Error fetching top gyms:", error);
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopGyms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopGyms();
    setRefreshing(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {t("gym.featuredGyms", "Featured Gyms")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t("gym.topRanked", "Top 10 Most Popular Gyms")}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ED2A46"]}
              tintColor="#ED2A46"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ED2A46" />
              <Text style={styles.loadingText}>
                {t("common.loading", "Loading...")}
              </Text>
            </View>
          ) : gyms.length > 0 ? (
            <View style={styles.gridContainer}>
              {gyms.map((gym, index) => (
                <View key={gym.id || index} style={styles.cardWrapper}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <GymCard gym={gym} fullWidth={true} height={200} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("gym.noGyms", "No gyms available")}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full Screen Search */}
      <FullScreenSearch
        visible={showFullScreenSearch}
        onClose={() => setShowFullScreenSearch(false)}
        initialTab="gyms"
        showBackButton={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ED2A46",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  gridContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 15,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ED2A46",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
    fontWeight: "500",
  },
});
