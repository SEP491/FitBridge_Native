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
import accountService from "../../../services/accountService";
import FreelancePTProfileCard from "../../../components/FreelancePTProfileCard/FreelancePTProfileCard";
import FullScreenSearch from "../../../components/FullScreenSearch/FullScreenSearch";

export default function FeaturedFreelancePTScreen() {
  const { t } = useTranslation();
  const [freelancePTs, setFreelancePTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);

  const fetchTopFreelancePTs = async () => {
    try {
      setLoading(true);
      const response = await accountService.getAllFreelancePT({
        page: 1,
        size: 10,
        sortBy: "rating", // Sort by rating to get top-ranked PTs
        sortOrder: "desc",
      });
      const { items } = response.data;
      setFreelancePTs(items || []);
    } catch (error) {
      console.error("Error fetching top freelance PTs:", error);
      setFreelancePTs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopFreelancePTs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopFreelancePTs();
    setRefreshing(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {t("freelancePT.featuredTrainers", "Featured Personal Trainers")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t("freelancePT.topRanked", "Top 10 Ranked Trainers")}
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
          ) : freelancePTs.length > 0 ? (
            <View style={styles.gridContainer}>
              {freelancePTs.map((pt, index) => (
                <View key={pt.id || index} style={styles.cardWrapper}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <FreelancePTProfileCard pt={pt} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("freelancePT.noTrainers", "No trainers available")}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full Screen Search */}
      <FullScreenSearch
        visible={showFullScreenSearch}
        onClose={() => setShowFullScreenSearch(false)}
        initialTab="freelancePts"
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 15,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 30,
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
