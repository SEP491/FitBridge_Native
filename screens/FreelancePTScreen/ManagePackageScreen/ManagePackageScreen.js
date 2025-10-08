import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import freelancePTPackageService from '../../../services/freelancePTPackageService';
import PackageCard from './PackageCard';
import CreatePackageModal from './CreatePackageModal';
import EditPackageModal from './EditPackageModal';

const ManagePackageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await freelancePTPackageService.getFreelancePTPackages({ page, size: 10 });

      if (response.status === "200" && response.data) {
        setPackages(response.data.items);
        setPagination({
          page: response.data.page,
          size: response.data.size,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      Alert.alert(t("managePackage.error"), t("managePackage.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages(pagination.page);
  };

  const handlePackageCreated = () => {
    fetchPackages(1); // Refresh the list from page 1
  };

  const handlePackageUpdated = () => {
    fetchPackages(pagination.page); // Refresh the current page
  };

  const handleEditPackage = async (packageId) => {
    try {
      const response = await freelancePTPackageService.getFreelancePTPackageById(packageId);
      if (response.status === "200" && response.data) {
        setSelectedPackage(response.data);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error fetching package details:", error);
      Alert.alert(t("managePackage.error"), "Failed to load package details");
    }
  };

  const calculateTotalRevenue = () => {
    return packages.reduce((sum, pkg) => sum + pkg.price, 0);
  };

  if (loading && packages.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ED2A46" />
        <Text style={styles.loadingText}>
          {t("managePackage.loadingPackages")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats - 3x2 Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={24} color="#ED2A46" />
          <Text style={styles.statNumber}>{pagination.total}</Text>
          <Text style={styles.statLabel}>
            {t("managePackage.totalPackages")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>
            {packages.length > 0 
              ? Math.round(packages.reduce((sum, p) => sum + p.durationInDays, 0) / packages.length)
              : 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.averageDays")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {packages.length > 0 
              ? Math.round(packages.reduce((sum, p) => sum + p.numOfSessions, 0) / packages.length)
              : 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.averageSessions")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {calculateTotalRevenue().toLocaleString('vi-VN', { maximumFractionDigits: 0 })}₫
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.totalValue")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>
            {packages.length > 0 
              ? Math.round(packages.reduce((sum, p) => sum + p.sessionDurationInMinutes, 0) / packages.length)
              : 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.averageMinutes")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart" size={24} color="#00BCD4" />
          <Text style={styles.statNumber}>
            {packages.length > 0 
              ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString('vi-VN', { maximumFractionDigits: 0 })
              : 0}₫
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.avgPrice")}</Text>
        </View>
      </View>

      {/* Add New Package Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>
          {t("managePackage.createNewPackage")}
        </Text>
      </TouchableOpacity>

      {/* Packages List */}
      <SafeAreaView style={{ width: "100%", flex: 1 }}>
        <FlatList
          data={packages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PackageCard 
              package={item}
              onPress={() => navigation.navigate('PackageDetailScreen', { packageId: item.id })}
              onEdit={() => handleEditPackage(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.packagesList}
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
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {t("managePackage.noPackages")}
              </Text>
              <Text style={styles.emptySubText}>
                {t("managePackage.createFirstPackage")}
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* Create Package Modal */}
      <CreatePackageModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPackageCreated={handlePackageCreated}
      />

      {/* Edit Package Modal */}
      <EditPackageModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage}
        onPackageUpdated={handlePackageUpdated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
    width: '100%',
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  packagesList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ManagePackageScreen;