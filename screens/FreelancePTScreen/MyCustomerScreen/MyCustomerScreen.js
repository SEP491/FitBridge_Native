import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";
import customerPurchasedService from '../../../services/customerPurchased';
import accountService from '../../../services/accountService';

const MyCustomerScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  const fetchCustomers = async () => {  
    try {
      setLoading(true);
      const response = await accountService.getFreelancePTCustomers();
      console.log("Customers fetched:", response.data);
      
      // Fetch purchased packages for each customer
      const customersWithPackages = await Promise.all(
        response.data.items.map(async (customer) => {
          const packages = await fetchAllCustomersPurchasedById(customer.id);
          
          // Calculate stats from packages
          const totalPackages = packages.length;
          
          // Filter active packages (not expired and have sessions left)
          const activePackagesList = packages.filter(pkg => {
            const expDate = new Date(pkg.expirationDate);
            const today = new Date();
            return expDate > today && pkg.availableSessions > 0;
          });
          
          const activePackages = activePackagesList.length;
          
          // Only count sessions from active packages
          const totalActiveSessions = activePackagesList.reduce((sum, pkg) => sum + pkg.availableSessions, 0);
          
          return {
            id: customer.id,
            name: customer.fullName,
            avatarUrl: customer.avatarUrl,
            email: customer.email || 'N/A',
            phone: customer.phone || 'N/A',
            status: activePackages > 0 ? 'active' : 'inactive',
            totalPackages: totalPackages,
            totalSessions: totalActiveSessions, // Only active sessions
            activePackages: activePackages,
            packages: packages,
            joinDate: packages.length > 0 ? new Date(Math.min(...packages.map(p => new Date(p.expirationDate)))).toLocaleDateString() : 'N/A',
            lastSession: 'N/A', // This would need to come from booking data
          };
        })
      );
      
      setCustomers(customersWithPackages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load customers. Please try again.");
    }
  };

  const fetchAllCustomersPurchasedById = async (customerId) => {  
    try {
      const response = await customerPurchasedService.getAllCustomerPurchasedPackageById(customerId);
      console.log(`Packages for customer ${customerId}:`, response.data);
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching purchased packages:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const tabs = [
    { key: 'all', label: 'All Customers' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesTab = selectedTab === 'all' || customer.status === selectedTab;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalPackages = customers.reduce((sum, customer) => sum + customer.totalPackages, 0);

  const openPackageModal = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closePackageModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const getPackageStatus = (pkg) => {
    const expDate = new Date(pkg.expirationDate);
    const today = new Date();
    
    if (expDate < today) {
      return { status: 'Expired', color: '#F44336' };
    }
    if (pkg.availableSessions === 0) {
      return { status: 'Completed', color: '#9E9E9E' };
    }
    return { status: 'Active', color: '#4CAF50' };
  };

  const CustomerCard = ({ customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>
            {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerEmail}>{customer.email}</Text>
          <Text style={styles.customerPhone}>{customer.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) }]}>
          <Text style={styles.statusText}>{customer.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.customerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customer.totalPackages}</Text>
          <Text style={styles.statLabel}>Total Packages</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customer.activePackages}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customer.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions Left</Text>
        </View>
      </View>

      <View style={styles.customerDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Joined: {customer.joinDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Packages: {customer.packages.map(p => p.packageName).join(', ') || 'None'}</Text>
        </View>
      </View>

      <View style={styles.customerActions}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => Alert.alert('Info', `Message ${customer.name}`)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={() => Alert.alert('Info', `Schedule session with ${customer.name}`)}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => openPackageModal(customer)}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Package Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closePackageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedCustomer?.name}'s Packages
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCustomer?.packages.length || 0} Total Packages
                </Text>
              </View>
              <TouchableOpacity 
                onPress={closePackageModal}
                style={styles.closeButton}
              >
                <Ionicons name="close-circle" size={32} color="#ED2A46" />
              </TouchableOpacity>
            </View>

            {/* Packages List */}
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedCustomer?.packages.length === 0 ? (
                <View style={styles.emptyPackagesContainer}>
                  <Ionicons name="cube-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyPackagesText}>No packages found</Text>
                </View>
              ) : (
                selectedCustomer?.packages.map((pkg, index) => {
                  const packageStatus = getPackageStatus(pkg);
                  return (
                    <View key={index} style={styles.packageCard}>
                      {/* Package Header */}
                      <View style={styles.packageHeader}>
                        <View style={styles.packageIconContainer}>
                          <Ionicons name="cube" size={24} color="#ED2A46" />
                        </View>
                        <View style={styles.packageTitleContainer}>
                          <Text style={styles.packageName}>{pkg.packageName}</Text>
                          <View style={[styles.packageStatusBadge, { backgroundColor: packageStatus.color }]}>
                            <Text style={styles.packageStatusText}>{packageStatus.status}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Package Details */}
                      <View style={styles.packageDetailsContainer}>
                        <View style={styles.packageDetailRow}>
                          <Ionicons name="fitness-outline" size={18} color="#666" />
                          <Text style={styles.packageDetailLabel}>Sessions Available:</Text>
                          <Text style={styles.packageDetailValue}>
                            {pkg.availableSessions} / {pkg.totalSessions || pkg.availableSessions}
                          </Text>
                        </View>

                        <View style={styles.packageDetailRow}>
                          <Ionicons name="calendar-outline" size={18} color="#666" />
                          <Text style={styles.packageDetailLabel}>Purchase Date:</Text>
                          <Text style={styles.packageDetailValue}>
                            {new Date(pkg.purchasedDate).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.packageDetailRow}>
                          <Ionicons name="time-outline" size={18} color="#666" />
                          <Text style={styles.packageDetailLabel}>Expiration Date:</Text>
                          <Text style={[
                            styles.packageDetailValue,
                            packageStatus.status === 'Expired' && styles.expiredText
                          ]}>
                            {new Date(pkg.expirationDate).toLocaleDateString()}
                          </Text>
                        </View>

                        {pkg.price && (
                          <View style={styles.packageDetailRow}>
                            <Ionicons name="cash-outline" size={18} color="#666" />
                            <Text style={styles.packageDetailLabel}>Price:</Text>
                            <Text style={styles.packageDetailValue}>
                              ${pkg.price.toLocaleString()}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Progress Bar */}
                      {pkg.totalSessions && (
                        <View style={styles.progressContainer}>
                          <Text style={styles.progressLabel}>Session Progress</Text>
                          <View style={styles.progressBarBackground}>
                            <View 
                              style={[
                                styles.progressBarFill,
                                { 
                                  width: `${((pkg.totalSessions - pkg.availableSessions) / pkg.totalSessions) * 100}%`,
                                  backgroundColor: packageStatus.color
                                }
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {pkg.totalSessions - pkg.availableSessions} completed, {pkg.availableSessions} remaining
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={closePackageModal}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <>
          {/* Header Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statCardNumber}>{customers.length}</Text>
              <Text style={styles.statCardLabel}>Total Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardNumber}>{activeCustomers}</Text>
              <Text style={styles.statCardLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardNumber}>{totalPackages}</Text>
              <Text style={styles.statCardLabel}>Total Packages</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  selectedTab === tab.key && styles.tabButtonActive
                ]}
                onPress={() => setSelectedTab(tab.key)}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === tab.key && styles.tabButtonTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Customers List */}
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <CustomerCard customer={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.customersList}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
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
  statCardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonActive: {
    backgroundColor: '#ED2A46',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  customersList: {
    paddingBottom: 20,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ED2A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  customerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  packageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageTitleContainer: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  packageStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  packageDetailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  packageDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  packageDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  expiredText: {
    color: '#F44336',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
  },
  emptyPackagesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPackagesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeModalButton: {
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyCustomerScreen;