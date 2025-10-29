import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import trainingResultsService from '../../../services/training-resultsService';
import { ProgressChart } from 'react-native-chart-kit';
import customerPurchasedService from '../../../services/customerPurchased';

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require('../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../assets/images/bodyparts/hip.png'),
  Shoulder: require('../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../assets/images/bodyparts/thigh.png'),
  Waist: require('../../../assets/images/bodyparts/waist.png'),
};

const getMuscleGroupImage = (muscleGroup) => {
  const normalized = muscleGroup?.replace(/\s+/g, '');
  return muscleGroupImages[normalized] || null;
};

export const CustomerDetailScreen = ({ route, navigation }) => {
  const { customer } = route.params;
  console.log('Customer Data:', customer);  
  const [expandedPackages, setExpandedPackages] = useState({});
  const [packageStatistics, setPackageStatistics] = useState({});
  const [packageMuscleReports, setPackageMuscleReports] = useState({});
  const [loadingStats, setLoadingStats] = useState({});

  const fetchPackageStatistics = async (pkgId, index) => {
    if (packageStatistics[pkgId]) {
      return; // Already fetched
    }

    setLoadingStats(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await customerPurchasedService.getCustomerPurchasedPackageResult(pkgId);
      console.log('Package Statistics Response:', response);
      if (response?.status === "200" && response?.data) {
        setPackageStatistics(prev => ({
          ...prev,
          [pkgId]: response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch package statistics:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [index]: false }));
    }
  }

  const fetchPackageMuscleReport = async (pkgId, index) => {
    if (packageMuscleReports[pkgId]) {
      return; // Already fetched
    }

    try {
      const response = await customerPurchasedService.getCustomerPurchasedMuscleReport(pkgId);
      console.log('Package Muscle Report Response:', response);
      if (response?.status === "200" && response?.data) {
        setPackageMuscleReports(prev => ({
          ...prev,
          [pkgId]: response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch package muscle report:', error);
    }
  }

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

  const handleCall = () => {
    if (!customer.phone) return;
    const phoneNumber = customer.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    if (!customer.email) return;
    Linking.openURL(`mailto:${customer.email}`);
  };

  const handleMessage = () => {
    if (!customer.phone) return;
    const phoneNumber = customer.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const togglePackage = async (index, pkg) => {
    const isExpanding = !expandedPackages[index];
    
    setExpandedPackages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));

    // Fetch statistics and muscle report when expanding
    if (isExpanding && pkg.id) {
      await fetchPackageStatistics(pkg.id, index);
      await fetchPackageMuscleReport(pkg.id, index);
    }
  };

  const handleViewDetails = (pkg, stats) => {
    const muscleReport = packageMuscleReports[pkg.id];
    navigation.navigate('TrainingResultScreen', {
      package: pkg,
      statistics: stats,
      muscleReport: muscleReport,
      customer: customer
    });
  };

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Customer Detail Section */}
        <View style={styles.customerDetailCard}>
          <View style={styles.customerAvatarLarge}>
            {customer.avatarUrl ? (
              <Image 
                source={{ uri: customer.avatarUrl }}
                style={styles.customerAvatarLargeImage}
              />
            ) : (
              <Text style={styles.customerAvatarLargeText}>
                {customer.name ? customer.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'N/A'}
              </Text>
            )}
          </View>
          
          <Text style={styles.customerNameLarge}>{customer.name || 'N/A'}</Text>
          
          <View style={[styles.statusBadgeLarge, { backgroundColor: (customer.status === 'active' || customer.status === 'Active') ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusTextLarge}>{(customer.status || 'UNKNOWN').toUpperCase()}</Text>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color="#ED2A46" />
              <Text style={styles.contactText}>{customer.email || 'N/A'}</Text>
            </View>
            
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color="#ED2A46" />
              <Text style={styles.contactText}>{customer.phone || 'N/A'}</Text>
            </View>
            
            <View style={styles.contactRow}>
              <Ionicons name="calendar-outline" size={20} color="#ED2A46" />
              <Text style={styles.contactText}>Joined: {customer.joinDate || 'N/A'}</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsSection}>
            <Text style={styles.sectionTitle}>Quick Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{customer.totalPackages || 0}</Text>
                <Text style={styles.statLabel}>Total Packages</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{customer.activePackages || 0}</Text>
                <Text style={styles.statLabel}>Active Packages</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{customer.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Sessions Left</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Packages Section */}
        <View style={styles.packagesSection}>
          <Text style={styles.packagesSectionTitle}>
            All Packages ({customer.packages.length})
          </Text>

          {customer.packages.length === 0 ? (
            <View style={styles.emptyPackages}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No packages purchased yet</Text>
            </View>
          ) : (
            customer.packages.map((pkg, index) => {
              const packageStatus = getPackageStatus(pkg);
              const isExpanded = expandedPackages[index];
              const stats = packageStatistics[pkg.id];
              
              const isLoadingStats = loadingStats[index];
              
              return (
                <View key={index} style={styles.packageCard}>
                  {/* Package Header - Always Visible */}
                  <TouchableOpacity 
                    style={styles.packageHeader}
                    onPress={() => togglePackage(index, pkg)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.packageIconContainer}>
                      <Ionicons name="cube" size={28} color="#ED2A46" />
                    </View>
                    <View style={styles.packageHeaderInfo}>
                      <Text style={styles.packageName}>{pkg.packageName}</Text>
                      <View style={styles.packageHeaderBottom}>
                        <View style={[styles.packageStatusBadge, { backgroundColor: packageStatus.color }]}>
                          <Text style={styles.packageStatusText}>{packageStatus.status}</Text>
                        </View>
                        <Text style={styles.sessionsPreview}>
                          {pkg.availableSessions} sessions left
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>

                  {/* Package Details - Collapsible */}
                  {isExpanded && (
                    <>
                      {/* Statistics Section */}
                      {isLoadingStats ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="large" color="#ED2A46" />
                          <Text style={styles.loadingText}>Loading statistics...</Text>
                        </View>
                      ) : stats ? (
                        <View style={styles.statisticsSection}>
                          <Text style={styles.statisticsTitle}>Training Statistics</Text>
                          
                          <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                              <ProgressChart
                                data={{
                                  data: [(stats.completionRate || 0) / 100]
                                }}
                                width={80}
                                height={80}
                                strokeWidth={8}
                                radius={32}
                                chartConfig={{
                                  backgroundColor: '#f8f9fa',
                                  backgroundGradientFrom: '#f8f9fa',
                                  backgroundGradientTo: '#f8f9fa',
                                  color: (opacity = 1) => `rgba(20, 200, 72, ${opacity})`,
                                }}
                                hideLegend={true}
                                style={{ marginVertical: 0 }}
                              />
                              <View style={styles.progressChartLabel}>
                                <Text style={[styles.progressChartValue, { color: '#4CAF50' }]}>
                                  {(stats.completionRate || 0).toFixed(0)}%
                                </Text>
                              </View>
                              <Text style={styles.statLabel}>Completion Rate</Text>
                            </View>
                            
                            <View style={styles.statItem}>
                              <ProgressChart
                                data={{
                                  data: [(stats.activityCompletionRate || 0) / 100]
                                }}
                                width={80}
                                height={80}
                                strokeWidth={8}
                                radius={32}
                                chartConfig={{
                                  backgroundColor: '#f8f9fa',
                                  backgroundGradientFrom: '#f8f9fa',
                                  backgroundGradientTo: '#f8f9fa',
                                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                                }}
                                hideLegend={true}
                                style={{ marginVertical: 0 }}
                              />
                              <View style={styles.progressChartLabel}>
                                <Text style={[styles.progressChartValue, { color: '#2196F3' }]}>
                                  {(stats.activityCompletionRate || 0).toFixed(0)}%
                                </Text>
                              </View>
                              <Text style={styles.statLabel}>Activity Rate</Text>
                            </View>

                            <View style={styles.statItem}>
                              <ProgressChart
                                data={{
                                  data: [(stats.totalSessions || 1) / ((stats?.totalSessions || 0) + (stats?.availableSessions || 0))]
                                }}
                                width={80}
                                height={80}
                                strokeWidth={8}
                                radius={32}
                                chartConfig={{
                                  backgroundColor: '#f8f9fa',
                                  backgroundGradientFrom: '#f8f9fa',
                                  backgroundGradientTo: '#f8f9fa',
                                  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                                }}
                                hideLegend={true}
                                style={{ marginVertical: 0 }}
                              />
                              <View style={styles.progressChartLabel}>
                                <Text style={[styles.progressChartValue, { color: '#FF9800' }]}>
                                  {((stats.totalSessions || 1) / ((stats?.totalSessions || 0) + (stats?.availableSessions || 0))).toFixed(2)}%
                                </Text>
                              </View>
                              <Text style={styles.statLabel}>Sessions Used</Text>
                            </View>
                            
                            
                          </View>

                          {/* Most Trained Muscle Group Preview */}
                          {stats.mostTrainedMuscleGroup && (
                            <View style={styles.muscleGroupPreview}>
                              <View style={styles.muscleGroupPreviewHeader}>
                                <Ionicons name="trophy" size={18} color="#ED2A46" />
                                <Text style={styles.muscleGroupPreviewTitle}>Most Trained</Text>
                              </View>
                              <View style={styles.muscleGroupPreviewContent}>
                                {getMuscleGroupImage(stats.mostTrainedMuscleGroup.muscleGroup) && (
                                  <Image 
                                    source={getMuscleGroupImage(stats.mostTrainedMuscleGroup.muscleGroup)}
                                    style={styles.muscleGroupPreviewImage}
                                    resizeMode="contain"
                                  />
                                )}
                                <View style={styles.muscleGroupPreviewInfo}>
                                  <Text style={styles.muscleGroupPreviewName}>
                                    {stats.mostTrainedMuscleGroup.muscleGroup}
                                  </Text>
                                  <View style={styles.muscleGroupPreviewStatsRow}>
                                    <Text style={styles.muscleGroupPreviewStats}>
                                      <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>{stats.mostTrainedMuscleGroup.totalSets}</Text> sets • <Text style={{ color: '#FF6B35', fontWeight: 'bold' }}>{stats.mostTrainedMuscleGroup.totalWeight} kg</Text>
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}

                          <TouchableOpacity 
                            style={styles.viewDetailsButton}
                            onPress={() => handleViewDetails(pkg, stats)}
                          >
                            <Text style={styles.viewDetailsButtonText}>View Full Statistics</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.noStatsContainer}>
                          <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
                          <Text style={styles.noStatsText}>No statistics available yet</Text>
                        </View>
                      )}

                      <View style={styles.packageDetails}>
                        <View style={styles.packageDetailRow}>
                          <View style={styles.packageDetailItem}>
                            <Ionicons name="fitness-outline" size={18} color="#666" />
                            <Text style={styles.packageDetailLabel}>Sessions</Text>
                          </View>
                          <Text style={styles.packageDetailValue}>
                            {stats?.totalSessions} / {stats?.totalSessions + stats?.availableSessions}
                          </Text>
                        </View>

                        <View style={styles.packageDetailRow}>
                          <View style={styles.packageDetailItem}>
                            <Ionicons name="calendar-outline" size={18} color="#666" />
                            <Text style={styles.packageDetailLabel}>Purchase Date</Text>
                          </View>
                          <Text style={styles.packageDetailValue}>
                            {new Date(pkg.purchaseDate).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.packageDetailRow}>
                          <View style={styles.packageDetailItem}>
                            <Ionicons name="time-outline" size={18} color="#666" />
                            <Text style={styles.packageDetailLabel}>Expires On</Text>
                          </View>
                          <Text style={[
                            styles.packageDetailValue,
                            packageStatus.status === 'Expired' && styles.expiredText
                          ]}>
                            {new Date(pkg.expirationDate).toLocaleDateString()}
                          </Text>
                        </View>

                        {pkg.price && (
                          <View style={styles.packageDetailRow}>
                            <View style={styles.packageDetailItem}>
                              <Ionicons name="cash-outline" size={18} color="#666" />
                              <Text style={styles.packageDetailLabel}>Price</Text>
                            </View>
                            <Text style={styles.packageDetailValue}>
                              ${pkg.price.toLocaleString()}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Progress Bar */}
                      {pkg?.totalSessions && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={styles.progressPercentage}>
                              {Math.round(((pkg?.totalSessions - pkg?.availableSessions) / pkg?.totalSessions) * 100)}%
                            </Text>
                          </View>
                          <View style={styles.progressBarBackground}>
                            <View 
                              style={[
                                styles.progressBarFill,
                                { 
                                  width: `${((pkg?.totalSessions - pkg?.availableSessions) / pkg?.totalSessions) * 100}%`,
                                  backgroundColor: packageStatus.color
                                }
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {pkg?.totalSessions - pkg?.availableSessions} completed • {pkg?.availableSessions} remaining
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  customerDetailCard: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  customerAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ED2A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#ED2A46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  customerAvatarLargeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  customerAvatarLargeText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  customerNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusTextLarge: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  contactSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  quickStatsSection: {
    width: '100%',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  packagesSection: {
    padding: 16,
    paddingTop: 0,
  },
  packagesSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyPackages: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  packageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageHeaderInfo: {
    flex: 1,
  },
  packageHeaderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sessionsPreview: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  packageStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statisticsSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  sessionsBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 35,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressChartLabel: {
    position: 'absolute',
    top: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressChartValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  noStatsContainer: {
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 12,
  },
  noStatsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  muscleGroupPreview: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  muscleGroupPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  muscleGroupPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ED2A46',
  },
  muscleGroupPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  muscleGroupPreviewImage: {
    width: 50,
    height: 50,
  },
  muscleGroupPreviewInfo: {
    flex: 1,
  },
  muscleGroupPreviewName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  muscleGroupPreviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleGroupPreviewStats: {
    fontSize: 13,
    color: '#666',
  },
  packageDetails: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  packageDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  packageDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  packageDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  expiredText: {
    color: '#F44336',
  },
  progressSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ED2A46',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default CustomerDetailScreen;
