import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import accountService from "../../../services/accountService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../../hooks/useTranslation";
import CustomerPurchasedCard from "../../../components/CustomerPurchasedCard/CustomerPurchasedCard";
import colors from "../../../constants/color";

export default function FreelanceChoosingCourseScreen() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [purchaseList, setPurchaseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadCustomerPurchases = async () => {
    try {
      setLoading(true);
      const response = await accountService.getCustomerPurchasedFreelancePT();
      console.log("Customer Purchased Data:", response.data);

      if (response.data && response.data.items) {
        const sorted = [...response.data.items].sort(
          (a, b) =>
            (b.totalAwaitingBookingRequests || 0) -
            (a.totalAwaitingBookingRequests || 0)
        );
        setPurchaseList(sorted);
      }
    } catch (error) {
      console.error("Error loading customer purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomerPurchases();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCustomerPurchases();
  }, []);

  const filteredPurchases = purchaseList.filter(
    (item) =>
      item.packageName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {t("freelanceCourseScreen.noCustomerFound")}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText
          ? t("freelanceCourseScreen.tryDifferentKeyword")
          : t("freelanceCourseScreen.noCustomerYet")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("freelanceCourseScreen.searchPlaceholder")}
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results Count */}
        {!loading && filteredPurchases.length > 0 && (
          <View style={styles.resultsCount}>
            <Text style={styles.resultsText}>
              {filteredPurchases.length}{" "}
              {filteredPurchases.length === 1
                ? t("freelanceCourseScreen.customer")
                : t("freelanceCourseScreen.customers")}
            </Text>
          </View>
        )}

        {/* Customer List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.orange]}
              tintColor={colors.orange}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {t("freelanceCourseScreen.loading")}
              </Text>
            </View>
          ) : filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase) => (
              <CustomerPurchasedCard
                key={purchase.id}
                purchase={purchase}
                onPress={() => {
                  navigation.navigate("FreelancePTRequestScreen", {
                    customerPurchasedId: purchase.id,
                    customerId: purchase.customerId,
                    duration: purchase.sessionDurationInMinutes,
                  });
                }}
              />
            ))
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("FreelancePTBookingHistoryScreen")}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#212529",
  },
  clearButton: {
    padding: 4,
  },
  resultsCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6C757D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF914D",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
