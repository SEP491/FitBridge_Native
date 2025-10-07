import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";

const ManagePackageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Basic Strength Training',
      duration: '1 hour',
      price: 50,
      description: 'Individual strength training session',
      location: 'Client\'s Home',
      status: 'active',
      bookings: 15,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Premium Cardio Package',
      duration: '1.5 hours',
      price: 75,
      description: 'Intensive cardio workout with nutrition guidance',
      location: 'Local Gym / Outdoor',
      status: 'active',
      bookings: 8,
      rating: 4.9
    },
    {
      id: 3,
      name: 'Weight Loss Program',
      duration: '1 hour',
      price: 60,
      description: 'Customized weight loss training program',
      location: 'Flexible',
      status: 'inactive',
      bookings: 22,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Group Training Session',
      duration: '45 minutes',
      price: 30,
      description: 'Small group training (2-4 people)',
      location: 'Local Park',
      status: 'active',
      bookings: 5,
      rating: 4.6
    }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const PackageCard = ({ package: pkg }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <Text style={styles.packageDescription}>{pkg.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pkg.status) }]}>
          <Text style={styles.statusText}>{pkg.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.packageDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{pkg.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>${pkg.price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{pkg.location}</Text>
        </View>
      </View>

      <View style={styles.packageStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pkg.bookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pkg.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${pkg.price * pkg.bookings}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <View style={styles.packageActions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.duplicateButton}
          onPress={() => Alert.alert('Info', 'Duplicate package functionality')}
        >
          <Ionicons name="copy" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Duplicate</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: pkg.status === 'active' ? '#F44336' : '#4CAF50' }]}
        >
          <Ionicons name={pkg.status === 'active' ? 'pause' : 'play'} size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>{packages.filter(p => p.status === 'active').length}</Text>
          <Text style={styles.statCardLabel}>Active Packages</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>{packages.reduce((sum, p) => sum + p.bookings, 0)}</Text>
          <Text style={styles.statCardLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>${packages.reduce((sum, p) => sum + (p.price * p.bookings), 0)}</Text>
          <Text style={styles.statCardLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Add New Package Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => Alert.alert('Info', 'Add new package functionality')}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Create New Package</Text>
      </TouchableOpacity>

      {/* Packages List */}
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PackageCard package={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.packagesList}
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  statCardLabel: {
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
    marginBottom: 20,
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
  packageCard: {
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageDescription: {
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
  packageDetails: {
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
  packageStats: {
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
    fontSize: 12,
    color: '#666',
  },
  packageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
  },
  duplicateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 10,
  },
  toggleButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ManagePackageScreen;