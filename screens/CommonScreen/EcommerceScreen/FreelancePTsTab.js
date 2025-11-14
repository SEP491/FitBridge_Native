import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import accountService from "../../../services/accountService";
import FreelancePTProfileCard from "../../../components/FreelancePTProfileCard/FreelancePTProfileCard";

export default function FreelancePTsTab({ refreshTrigger }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [featuredData, setFeaturedData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalFeatured, setTotalFeatured] = useState(0);
  const [totalAll, setTotalAll] = useState(0);

  useEffect(() => {
    fetchData(1, false);
  }, [refreshTrigger]);

  const fetchData = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }

      const params = {
        size: 10,
        page: page,
      };

      const response = await accountService.searchAllAccounts(params);
      const data = response.data;

      const pts = data.freelancePTs?.items || [];
      const total = data.freelancePTs?.totalCount || 0;
      const totalPages = data.freelancePTs?.totalPages || 0;

      if (append) {
        setAllData((prev) => [...prev, ...pts]);
      } else {
        const featured = pts.slice(0, Math.min(5, pts.length));
        const remaining = pts.slice(Math.min(5, pts.length));

        setFeaturedData(featured);
        setAllData(remaining);
        setTotalFeatured(featured.length);
      }

      setTotalAll(total);
      setHasMore(page < totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching freelance PTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = () => {
    if (!loading && hasMore) {
      fetchData(currentPage + 1, true);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Featured Section */}
      {featuredData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderBar}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="star" size={20} color="#FF9500" />
              <Text style={styles.sectionHeaderTitle}>
                {t("ecommerce.featured")}
              </Text>
              <View style={[styles.countBadge, styles.featuredBadge]}>
                <Text style={styles.countBadgeText}>{totalFeatured}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ptGrid}>
            {featuredData.map((pt, index) => (
              <View key={pt.id || index} style={styles.ptCardContainer}>
                <FreelancePTProfileCard pt={pt} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* All Freelance PTs Section */}
      {allData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderBar}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="list" size={20} color="#ED2A46" />
              <Text style={styles.sectionHeaderTitle}>
                {t("ecommerce.allPTs")}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{totalAll}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ptGrid}>
            {allData.map((pt, index) => (
              <View key={pt.id || index} style={styles.ptCardContainer}>
                <FreelancePTProfileCard pt={pt} />
              </View>
            ))}
          </View>
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreData}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.red} />
              ) : (
                <>
                  <Text style={styles.loadMoreText}>
                    {t("common.loadMore")}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.red} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderBar: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
    marginBottom: 0,
  },
  featuredBadge: {
    backgroundColor: "#FF9500",
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#ED2A46",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  ptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    width: "100%",
  },
  ptCardContainer: {
    marginBottom: 15,
    width: "48%",
  },
  loadMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red,
  },
});
