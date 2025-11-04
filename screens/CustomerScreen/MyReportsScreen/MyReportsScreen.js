import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import ReportService from "../../../services/reportService";
import colors from "../../../constants/color";
import { useNavigation } from "@react-navigation/native";

export default function MyReportsScreen() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [activeTab, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await ReportService.getMyReports();
      console.log("Reports Response:", response);

      if (response.status === "200") {
        // Ensure we're setting an array
        const reportsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.items || []);
        setReports(reportsData);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filterReports = () => {
    if (!reports || !Array.isArray(reports)) {
      setFilteredReports([]);
      return;
    }

    if (activeTab === "all") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(
        (report) => report.status.toLowerCase() === activeTab.toLowerCase()
      );
      setFilteredReports(filtered);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formatDate(dateString)} ${hours}:${minutes}`;
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          color: "#f57c00",
          backgroundColor: "#fff3e0",
          icon: "hourglass-empty",
          label: "Pending",
        };
      case "resolved":
        return {
          color: "#2e7d32",
          backgroundColor: "#e8f5e8",
          icon: "check-circle",
          label: "Resolved",
        };
      case "rejected":
        return {
          color: "#d32f2f",
          backgroundColor: "#ffebee",
          icon: "cancel",
          label: "Rejected",
        };
      default:
        return {
          color: "#666",
          backgroundColor: "#f5f5f5",
          icon: "info",
          label: status || "Unknown",
        };
    }
  };

  const getReportTypeConfig = (type) => {
    switch (type) {
      case "FreelancePtReport":
        return {
          color: "#1976d2",
          icon: "person",
          label: "Freelance PT",
        };
      case "GymCourseReport":
        return {
          color: colors.red,
          icon: "fitness-center",
          label: "Gym Course",
        };
      case "ProductReport":
        return {
          color: "#7b1fa2",
          icon: "shopping-cart",
          label: "Product",
        };
      default:
        return {
          color: "#666",
          icon: "flag",
          label: type || "Report",
        };
    }
  };

  const handleViewDetail = (report) => {
    navigation.navigate("ReportDetailScreen", { reportId: report.id });
  };

  const renderReportItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const typeConfig = getReportTypeConfig(item.reportType);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => handleViewDetail(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.typeIconContainer,
                { backgroundColor: typeConfig.color },
              ]}
            >
              <MaterialIcons
                name={typeConfig.icon}
                size={16}
                color="#fff"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.reportTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.reportType}>{typeConfig.label}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            <MaterialIcons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Reported User Info */}
        {item.reportedUserName && (
          <View style={styles.reportedUserContainer}>
            <Image
              source={{
                uri:
                  item.reportedUserAvatarUrl ||
                  "https://via.placeholder.com/40",
              }}
              style={styles.reportedUserAvatar}
            />
            <View style={styles.reportedUserInfo}>
              <Text style={styles.reportedUserLabel}>Reported User</Text>
              <Text style={styles.reportedUserName}>
                {item.reportedUserName}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          {item.resolvedAt && (
            <View style={styles.dateContainer}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#2e7d32" />
              <Text style={[styles.dateText, { color: "#2e7d32" }]}>
                Resolved: {formatDate(item.resolvedAt)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="flag" size={48} color="#e0e0e0" />
      </View>
      <Text style={styles.emptyTitle}>No Reports Found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "all"
          ? "You haven't submitted any reports yet"
          : `No ${activeTab} reports found`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
          {activeTab === "all" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
          {activeTab === "pending" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "resolved" && styles.activeTab]}
          onPress={() => setActiveTab("resolved")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "resolved" && styles.activeTabText,
            ]}
          >
            Resolved
          </Text>
          {activeTab === "resolved" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "rejected" && styles.activeTab]}
          onPress={() => setActiveTab("rejected")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rejected" && styles.activeTabText,
            ]}
          >
            Rejected
          </Text>
          {activeTab === "rejected" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredReports.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  activeTab: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#fff",
    opacity: 0.5,
  },
  tabText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: colors.white,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flex: 1,
  },
  reportCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  reportType: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  reportDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  reportedUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
  },
  reportedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  reportedUserInfo: {
    flex: 1,
  },
  reportedUserLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  reportedUserName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
});
