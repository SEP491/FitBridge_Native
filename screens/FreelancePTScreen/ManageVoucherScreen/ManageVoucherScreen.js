import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import couponService from "../../../services/couponService";
import CreateVoucherModal from "./CreateVoucherModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { VoucherCardWithGradient } from "../../../components/VoucherCard/VoucherCard";
import VoucherCardVertical from "../../../components/VoucherCard/VoucherCardVertical";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageVoucherScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCoupons();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserName(userData.fullName || userData.name || '');
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true);
      const response = await couponService.getCoupons({ page, size: 10 });

      if (response.status === "200" && response.data) {
        setVouchers(response.data.items);
        setPagination({
          page: response.data.page,
          size: response.data.size,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      Alert.alert(t("manageVoucher.error"), t("manageVoucher.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons(pagination.page);
  };

  const handleVoucherCreated = () => {
    fetchCoupons(1); // Refresh the list from page 1
  };

  if (loading && vouchers.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ED2A46" />
        <Text style={styles.loadingText}>
          {t("manageVoucher.loadingVouchers")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats - 3x2 Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="pricetag" size={24} color="#ED2A46" />
          <Text style={styles.statNumber}>{pagination.total}</Text>
          <Text style={styles.statLabel}>
            {t("manageVoucher.totalVouchers")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>
            {vouchers.filter((v) => v.isActive).length}
          </Text>
          <Text style={styles.statLabel}>{t("manageVoucher.active")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={24} color="#F44336" />
          <Text style={styles.statNumber}>
            {vouchers.filter((v) => !v.isActive).length}
          </Text>
          <Text style={styles.statLabel}>{t("manageVoucher.inactive")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {vouchers.reduce((sum, v) => sum + v.numberOfUsedCoupon, 0)}
          </Text>
          <Text style={styles.statLabel}>{t("manageVoucher.totalUsage")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {vouchers.length > 0
              ? Math.round(
                  (vouchers.reduce((sum, v) => sum + v.numberOfUsedCoupon, 0) /
                    vouchers.reduce((sum, v) => sum + v.quantity, 0)) *
                    100
                )
              : 0}
            %
          </Text>
          <Text style={styles.statLabel}>{t("manageVoucher.usageRate")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="gift" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>
            {vouchers.reduce((sum, v) => sum + v.quantity, 0) -
              vouchers.reduce((sum, v) => sum + v.numberOfUsedCoupon, 0)}
          </Text>
          <Text style={styles.statLabel}>{t("manageVoucher.remaining")}</Text>
        </View>
      </View>

      {/* Add New Voucher Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>
          {t("manageVoucher.createNewVoucher")}
        </Text>
      </TouchableOpacity>

      {/* Vouchers List */}
      <SafeAreaView style={{ width: "100%", paddingTop: -45, paddingBottom: 250 }}>
        <FlatList
          data={vouchers}a
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('VoucherDetailScreen', { voucherId: item.id })}>
              <VoucherCardWithGradient voucher={item} userName={userName} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.vouchersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ED2A46"]}
              tintColor="#ED2A46"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {t("manageVoucher.noVouchers")}
              </Text>
              <Text style={styles.emptySubText}>
                {t("manageVoucher.createFirstVoucher")}
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* Create Voucher Modal */}
      <View
        style={{
          height: "120%",
          width: "120%",
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          display: showCreateModal ? "flex" : "none",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <CreateVoucherModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleVoucherCreated}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 12,
    width: "100%",
  },
  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    padding: 16,
    width: "90%",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  vouchersList: {
    paddingBottom: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    width: "100%",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});

export default ManageVoucherScreen;
