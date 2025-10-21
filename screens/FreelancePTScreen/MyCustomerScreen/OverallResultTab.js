import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const OverallResultTab = ({ customers }) => {
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No customers found</Text>
        </View>
      ) : (
        customers.map((customer) => (
          <View key={customer.id} style={styles.overallResultCard}>
            <View style={styles.overallResultHeader}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>
                  {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerEmail}>{customer.email}</Text>
              </View>
            </View>
            
            <Text style={styles.packagesTitle}>All Packages ({customer.packages.length})</Text>
            
            {customer.packages.length === 0 ? (
              <Text style={styles.noPackagesText}>No packages purchased</Text>
            ) : (
              customer.packages.map((pkg, index) => {
                const packageStatus = getPackageStatus(pkg);
                return (
                  <View key={index} style={styles.packageMiniCard}>
                    <View style={styles.packageMiniHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageMiniName}>{pkg.packageName}</Text>
                        <Text style={styles.packageMiniDate}>
                          Purchased: {new Date(pkg.purchaseDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[styles.packageStatusBadge, { backgroundColor: packageStatus.color }]}>
                        <Text style={styles.packageStatusText}>{packageStatus.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.packageMiniStats}>
                      <View style={styles.packageMiniStatItem}>
                        <Text style={styles.packageMiniStatLabel}>Sessions:</Text>
                        <Text style={styles.packageMiniStatValue}>
                          {pkg.availableSessions} / {pkg.totalSessions || pkg.availableSessions}
                        </Text>
                      </View>
                      <View style={styles.packageMiniStatItem}>
                        <Text style={styles.packageMiniStatLabel}>Expires:</Text>
                        <Text style={[
                          styles.packageMiniStatValue,
                          packageStatus.status === 'Expired' && styles.expiredText
                        ]}>
                          {new Date(pkg.expirationDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Progress Bar */}
                    {pkg.totalSessions && (
                      <View style={styles.packageMiniProgress}>
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
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  overallResultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  packagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noPackagesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  packageMiniCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ED2A46',
  },
  packageMiniHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageMiniName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageMiniDate: {
    fontSize: 12,
    color: '#666',
  },
  packageMiniStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageMiniStatItem: {
    flex: 1,
  },
  packageMiniStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  packageMiniStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  expiredText: {
    color: '#F44336',
  },
  packageMiniProgress: {
    marginTop: 4,
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
});

export default OverallResultTab;
