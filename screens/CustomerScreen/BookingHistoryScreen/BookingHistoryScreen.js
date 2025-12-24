import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Foundation from "@expo/vector-icons/Foundation";
import { useNavigation } from "@react-navigation/native";
import accountService from "../../../services/accountService";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatDate, formatTime } from "../../../lib";
import LoadingIndicator from "../../../components/LoadingIndicator";

const { width } = Dimensions.get("window");

export default function BookingHistoryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter bookings based on search query (client-side filter for PT name)
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookings;
    }
    return bookings.filter((booking) =>
      booking.ptName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  const loadBookingHistory = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page,
        size: 10,
      };

      // Add optional filters
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await accountService.getBookingHistory(params);
      console.log("Booking History:", response.data);

      if (response.data && response.data.items) {
        if (append) {
          setBookings((prev) => [...prev, ...response.data.items]);
        } else {
          setBookings(response.data.items);
        }
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalBookings(response.data.total);
      }
    } catch (error) {
      console.error("Error loading booking history:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadBookingHistory(1, false);
  }, [selectedStatus, startDate, endDate]);

  const loadMoreBookings = useCallback(() => {
    if (!loadingMore && currentPage < totalPages) {
      loadBookingHistory(currentPage + 1, true);
    }
  }, [loadingMore, currentPage, totalPages]);

  // Calculate duration with rounded minutes (concise format)
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end - start;
    const totalMinutes = Math.ceil(diffMs / (1000 * 60)); // Round up total minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}p`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}p`;
    }
  };

  // Get status color with gradients (updated to match new API statuses)
  const getStatusColor = (status) => {
    switch (status) {
      case "Finished":
        return {
          primary: "#28a745",
          secondary: "#20c997",
          background: "rgba(40, 167, 69, 0.1)",
          icon: "checkmark-circle",
        };
      case "Cancelled":
        return {
          primary: "#dc3545",
          secondary: "#e83e8c",
          background: "rgba(220, 53, 69, 0.1)",
          icon: "close-circle",
        };
      case "WaitingForEdit":
        return {
          primary: "#ffc107",
          secondary: "#ff9800",
          background: "rgba(255, 193, 7, 0.1)",
          icon: "time",
        };
      case "Booked":
      default:
        return {
          primary: "#17a2b8",
          secondary: "#6f42c1",
          background: "rgba(23, 162, 184, 0.1)",
          icon: "calendar",
        };
    }
  };

  // Get status text in Vietnamese (updated to match new API statuses)
  const getStatusText = (status) => {
    switch (status) {
      case "Finished":
        return t("booking.completed");
      case "Cancelled":
        return t("booking.canceled");
      case "WaitingForEdit":
        return t("booking.waitingForEdit");
      case "Booked":
      default:
        return t("booking.booked");
    }
  };

  const renderBookingCard = ({ item: booking, index }) => {
    const statusInfo = getStatusColor(booking.sessionStatus);
    const statusText = getStatusText(booking.sessionStatus);

    return (
      <TouchableOpacity
        style={[styles.bookingItem, { transform: [{ scale: 1 }] }]}
        activeOpacity={0.95}
        onPress={() => {
          // Only navigate for freelance PT package bookings
          // Freelance PT bookings have packageName set, gym PT bookings have packageName as null
          if (booking.packageName) {
            navigation.navigate("BookingDetailScreen", {
              Booking: booking,
            });
          }
        }}
      >
        {/* Header with date and status */}
        <View
          style={[
            styles.bookingHeader,
            { backgroundColor: statusInfo.background },
          ]}
        >
          <View style={styles.dateContainer}>
            <Text style={styles.bookingDate}>
              {formatDate(booking.bookingDate)}
            </Text>
            <Text style={styles.bookingName}>{booking.bookingName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusInfo.primary,
                shadowColor: statusInfo.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
          >
            <Ionicons name={statusInfo.icon} size={14} color="#fff" />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* PT Card */}
          <View style={styles.ptCard}>
            <View style={styles.ptHeader}>
              <View style={styles.ptAvatar}>
                <Image
                  source={{
                    uri:
                      booking.ptAvatarUrl ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDVautKC6iIhByPKtNOGlHRa2E52Ahxt4jQ&s",
                  }}
                  style={styles.ptAvatarImage}
                />
              </View>
              <View style={styles.ptInfo}>
                <Text style={styles.ptLabel}>
                  {t("booking.personalTrainer")}
                </Text>
                <Text style={styles.ptName}>{booking.ptName}</Text>
                {booking.packageName && (
                  <Text style={styles.packageName}>{booking.packageName}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.userCard}>
            <View style={styles.userHeader}>
              {booking.customerAvatarUrl ? (
                <Image
                  source={{ uri: booking.customerAvatarUrl }}
                  style={styles.customerAvatarImage}
                />
              ) : (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {booking.customerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userLabel}>{t("booking.customer")}</Text>
                <Text style={styles.userName}>{booking.customerName}</Text>
              </View>
            </View>
          </View>

          {/* Time Info */}
          <View style={styles.slotInfo}>
            <View style={styles.slotHeader}>
              <View style={styles.slotIconContainer}>
                <MaterialIcons name="access-time" size={20} color="#fff" />
              </View>
              <View style={styles.slotDetails}>
                <Text style={styles.slotTime}>
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}
                </Text>
                {booking.gymSlotName && (
                  <Text style={styles.slotName}>{booking.gymSlotName}</Text>
                )}
              </View>
              <View style={styles.slotDuration}>
                <Text style={styles.durationText}>
                  {calculateDuration(booking.startTime, booking.endTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Border */}
        <View
          style={[styles.bottomBorder, { backgroundColor: statusInfo.primary }]}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery
          ? t("booking.noResultsFound")
          : t("booking.noBookingHistory")}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `${t("booking.noSearchResults")} "${searchQuery}"`
          : t("booking.bookWithPTPrompt")}
      </Text>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookingHistory(1, false);
    setRefreshing(false);
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedStatus && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("")}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedStatus && styles.filterChipTextActive,
            ]}
          >
            {t("booking.all")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Booked" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Booked")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Booked" && styles.filterChipTextActive,
            ]}
          >
            {t("booking.booked")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Finished" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Finished")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Finished" && styles.filterChipTextActive,
            ]}
          >
            {t("booking.completed")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "Cancelled" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("Cancelled")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "Cancelled" && styles.filterChipTextActive,
            ]}
          >
            {t("booking.canceled")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === "WaitingForEdit" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus("WaitingForEdit")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === "WaitingForEdit" &&
                styles.filterChipTextActive,
            ]}
          >
            {t("booking.waitingForEdit")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="history" size={24} color="#fff" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>
              {t("booking.totalBookings")}
            </Text>
            <Text style={styles.summaryCount}>{totalBookings}</Text>
            <Text style={styles.summarySubText}>
              {t("booking.page")} {currentPage} / {totalPages}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadBookingHistory(1, false)}
        >
          <Ionicons name="refresh" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("booking.searchByPTName")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter */}
      {renderStatusFilter()}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {
              filteredBookings.filter((b) => b.sessionStatus === "Booked")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>{t("booking.booked")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {
              filteredBookings.filter((b) => b.sessionStatus === "Finished")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>{t("booking.completed")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {
              filteredBookings.filter((b) => b.sessionStatus === "Cancelled")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>{t("booking.canceled")}</Text>
        </View>
      </View>

      {/* Booking History List */}
      {loading ? (
        <LoadingIndicator
          variant="page"
          color="#E42D46"
          message={t("booking.loadingHistory")}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#E42D46"]}
              tintColor="#E42D46"
              progressBackgroundColor="#fff"
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            loadingMore ? (
              <LoadingIndicator
                variant="inline"
                color="#E42D46"
                message={t("booking.loadingMore")}
              />
            ) : (
              <View style={styles.bottomSpacing} />
            )
          }
          onEndReached={loadMoreBookings}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E42D46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryInfo: {},
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  summarySubText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bookingItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateContainer: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  bookingName: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  ptCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#E42D46",
  },
  ptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  ptAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E42D46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  ptAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  ptInfo: {
    flex: 1,
  },
  ptLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  ptName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 2,
  },
  ptDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ptDetailText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  userCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#17a2b8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  customerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  slotInfo: {
    marginBottom: 16,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E42D46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  slotDetails: {
    flex: 1,
  },
  slotName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  slotTime: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
  },
  slotDuration: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  bottomBorder: {
    height: 4,
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 20,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingRight: 16,
    columnGap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterChipActive: {
    backgroundColor: "#E42D46",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748b",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  clearButton: {
    marginLeft: 8,
  },
});
