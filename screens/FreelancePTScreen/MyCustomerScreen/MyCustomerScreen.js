import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";

const MyCustomerScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2024-01-15',
      totalSessions: 25,
      completedSessions: 22,
      totalSpent: 1250,
      status: 'active',
      lastSession: '2024-03-10',
      preferredTime: 'Morning',
      goals: 'Muscle Building'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      joinDate: '2024-02-20',
      totalSessions: 15,
      completedSessions: 14,
      totalSpent: 1125,
      status: 'active',
      lastSession: '2024-03-08',
      preferredTime: 'Evening',
      goals: 'Weight Loss'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 345-6789',
      joinDate: '2023-12-05',
      totalSessions: 40,
      completedSessions: 38,
      totalSpent: 2200,
      status: 'active',
      lastSession: '2024-03-12',
      preferredTime: 'Afternoon',
      goals: 'Strength Training'
    },
    {
      id: 4,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 456-7890',
      joinDate: '2024-01-30',
      totalSessions: 8,
      completedSessions: 6,
      totalSpent: 480,
      status: 'inactive',
      lastSession: '2024-02-28',
      preferredTime: 'Morning',
      goals: 'General Fitness'
    },
    {
      id: 5,
      name: 'Alex Brown',
      email: 'alex.brown@email.com',
      phone: '+1 (555) 567-8901',
      joinDate: '2024-03-01',
      totalSessions: 5,
      completedSessions: 5,
      totalSpent: 250,
      status: 'active',
      lastSession: '2024-03-11',
      preferredTime: 'Evening',
      goals: 'Cardio Fitness'
    }
  ]);

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
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.goals.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  const CustomerCard = ({ customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>
            {customer.name.split(' ').map(n => n[0]).join('')}
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
          <Text style={styles.statNumber}>{customer.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customer.completedSessions}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${customer.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <View style={styles.customerDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Joined: {customer.joinDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Last Session: {customer.lastSession}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="fitness-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Goals: {customer.goals}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="alarm-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Preferred: {customer.preferredTime}</Text>
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
          onPress={() => Alert.alert('Info', `View ${customer.name}'s profile`)}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.statCardNumber}>${totalRevenue}</Text>
          <Text style={styles.statCardLabel}>Total Revenue</Text>
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
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.customersList}
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
});

export default MyCustomerScreen;