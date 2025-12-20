import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import bookingService from "../../services/bookingService";
import BookingRequestCard from "../../components/BookingRequestCard/BookingRequestCard";
import { BookingRequestCardSkeletonList } from "../../components/BookingRequestCard/BookingRequestCardSkeleton";
import LoadingIndicator from "../../components/LoadingIndicator";

// Format time for BookingRequestCard
const formatTime = (timeString) => {
  if (!timeString) return "-";
  const parts = timeString.split(":");
  return `${parts[0]}:${parts[1]}`;
};

// Format date for BookingRequestCard
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Map sessionStatus to requestStatus for BookingRequestCard
const mapSessionStatusToRequestStatus = (sessionStatus) => {
  const statusLower = sessionStatus?.toLowerCase() || "";
  switch (statusLower) {
    case "finished":
    case "completed":
      return "Approved";
    case "booked":
    case "scheduled":
      return "Pending";
    case "cancelled":
    case "canceled":
      return "Rejected";
    default:
      return "Pending";
  }
};

const CustomerPurchasedBookingHistoryScreen = ({ route, navigation }) => {
  const { customerPurchasedId, customer } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [hasMore, setHasMore] = useState(true);

  const fetchBookings = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await bookingService.getBookingHistoryForCustomer({
        customerId: customer.id,
        customerPurchasedId,
        page,
        size: 10,
        sortOrder:'dsc'
      });

      if (response?.status === "200" && response?.data) {
        const { items, page: currentPage, total, totalPages } = response.data;

        if (isRefresh || page === 1) {
          setBookings(items || []);
        } else {
          setBookings((prev) => [...prev, ...(items || [])]);
        }

        setPagination({
          page: currentPage,
          size: 10,
          total,
          totalPages,
        });

        setHasMore(currentPage < totalPages);
      }
    } catch (error) {
      console.error("Error fetching booking history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [customerPurchasedId]);

  const handleRefresh = () => {
    fetchBookings(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBookings(pagination.page + 1);
    }
  };

  const handleBookingPress = (booking) => {
    navigation.navigate("BookingDetailScreen", {
      Booking: {
        bookingId: booking.bookingId,
        bookingName: booking.bookingName,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        sessionStatus: booking.sessionStatus,
        ptName: booking.ptName,
        ptAvatarUrl: booking.ptAvatarUrl,
        customerId: booking.customerId,
        customerPurchasedId: booking.customerPurchasedId,
      },
    });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingIndicator variant="inline" />;
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có lịch sử buổi tập nào</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {loading && bookings.length === 0 ? (
        <View style={styles.skeletonContainer}>
          <BookingRequestCardSkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => {
            // Map booking data to BookingRequestCard format
            const request = {
              requestStatus: mapSessionStatusToRequestStatus(item.sessionStatus),
              requestType: null, 
              bookingDate: item.bookingDate,
              startTime: item.startTime,
              endTime: item.endTime,
              bookingName: item.bookingName || "Buổi tập",
              note: item.note || item.nutritionTip || null,
              // Customer info (from route params or fallback)
              customerName: customer?.fullName || customer?.name || "Customer",
              customerAvatarUrl: customer?.avatarUrl || customer?.customerAvatarUrl || null,
              // PT info
              ptName: item.ptName || null,
              ptAvatarUrl: item.ptAvatarUrl || null,
            };

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleBookingPress(item)}
              >
                <BookingRequestCard
                  request={request}
                  userRole="FreelancePT"
                  onApprove={null} // No actions for history
                  onReject={null} // No actions for history
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.bookingId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#ED2A46" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
});

export default CustomerPurchasedBookingHistoryScreen;

