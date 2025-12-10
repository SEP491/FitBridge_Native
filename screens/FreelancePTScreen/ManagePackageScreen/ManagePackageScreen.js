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
  const [summary, setSummary] = useState({
    totalPackages: 0,
    totalPrices: 0,
    averagePrice: 0,
    avgSessions: 0,
    ptMaxCourse: 0,
    ptCurrentCourse: 0,
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
      console.log("Fetched Packages:", response.data);
      if (response.status === "200" && response.data) {
        // Update packages from response.data.packages.items
        setPackages(response.data.packages?.items || []);
        
        // Update pagination from response.data.packages
        if (response.data.packages) {
          setPagination({
            page: response.data.packages.page || 1,
            size: response.data.packages.size || 10,
            total: response.data.packages.total || 0,
            totalPages: response.data.packages.totalPages || 0,
          });
        }
        
        // Update summary from response.data.summary
        if (response.data.summary) {
          setSummary({
            totalPackages: response.data.summary.totalPackages || 0,
            totalPrices: response.data.summary.totalPrices || 0,
            averagePrice: response.data.summary.averagePrice || 0,
            avgSessions: response.data.summary.avgSessions || 0,
            ptCurrentCourse: response.data.summary.ptCurrentCourse || 0,
            ptMaxCourse: response.data.summary.ptMaxCourse || 0,

          });
        }
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      Alert.alert(t("managePackage.error"), t("managePackage.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  console.log(packages);

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

  const handleToggleDisplay = async (packageId, currentIsDisplayed) => {
    const newIsDisplayed = !currentIsDisplayed;
    
    // If hiding the package, ask for confirmation
    if (currentIsDisplayed && !newIsDisplayed) {
      Alert.alert(
        t("managePackage.confirmHide"),
        t("managePackage.confirmHideMessage"),
        [
          {
            text: t("managePackage.cancel"),
            style: "cancel"
          },
          {
            text: t("managePackage.hide"),
            style: "destructive",
            onPress: () => performToggleDisplay(packageId, newIsDisplayed)
          }
        ]
      );
    } else {
      // Show package directly without confirmation
      performToggleDisplay(packageId, newIsDisplayed);
    }
  };

  const performToggleDisplay = async (packageId, newIsDisplayed) => {
    try {
      // Prepare request body with default values and only change isDisplayed
      const updateData = {
        isDisplayed: newIsDisplayed,
      };

      const response = await freelancePTPackageService.updateFreelancePTPackage(
        packageId,
        updateData
      );

      if (response.status === "200") {
        Alert.alert(
          t("managePackage.success"),
          newIsDisplayed 
            ? t("managePackage.packageDisplayed") 
            : t("managePackage.packageHidden")
        );
        // Refresh packages list
        fetchPackages(pagination.page);
      } else {
        Alert.alert(
          t("managePackage.error"),
          response.message || t("managePackage.failedToUpdate")
        );
      }
    } catch (error) {
      console.error("Error toggling package display:", error);
      Alert.alert(
        t("managePackage.error"),
        error.message || t("managePackage.failedToUpdate")
      );
    }
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
console.log(selectedPackage);
  return (
    <View style={styles.container}>
      {/* Header Stats - 3x2 Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={24} color="#ED2A46" />
          <Text style={styles.statNumber}>{summary.totalPackages}</Text>
          <Text style={styles.statLabel}>
            {t("managePackage.totalPackages")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {summary.totalPrices.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}₫
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.totalValue")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart" size={24} color="#00BCD4" />
          <Text style={styles.statNumber}>
            {summary.averagePrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}₫
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.avgPrice")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {summary.avgSessions || 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.averageSessions")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>
            {summary.ptCurrentCourse || 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.currentCourses")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>
            {summary.ptMaxCourse || 0}
          </Text>
          <Text style={styles.statLabel}>{t("managePackage.maxCourses")}</Text>
        </View>
        
      </View>

      {/* Add New Package Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            {t("managePackage.createNewPackage")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Packages List */}
      <View style={{ width: "100%", flex: 1, marginBottom: -20 }}>
        <FlatList
          data={packages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PackageCard 
              package={item}
              onPress={() => navigation.navigate('FreelancePTPackageDetailScreen', { packageId: item.id })}
              onEdit={() => handleEditPackage(item.id)}
              onToggleDisplay={() => handleToggleDisplay(item.id, item.isDisplayed)}
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
      </View>

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
        disableNumOfSessions={selectedPackage?.currentUserPurchased > 0}
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
    marginBottom: 10,
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
  announcementSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,  
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(100px)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderRadius: 35,
    margin: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  announcementTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  announcementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  announcementText2: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  addButtonContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  packagesList: {
    paddingBottom: 0,
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