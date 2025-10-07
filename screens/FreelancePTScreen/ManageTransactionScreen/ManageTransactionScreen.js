import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";

const ManageTransactionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      clientName: 'John Smith',
      packageName: 'Basic Strength Training',
      amount: 50,
      status: 'completed',
      date: '2024-03-15',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN001234'
    },
    {
      id: 2,
      clientName: 'Sarah Johnson',
      packageName: 'Premium Cardio Package',
      amount: 75,
      status: 'pending',
      date: '2024-03-14',
      paymentMethod: 'PayPal',
      transactionId: 'TXN001235'
    },
    {
      id: 3,
      clientName: 'Mike Wilson',
      packageName: 'Weight Loss Program',
      amount: 60,
      status: 'completed',
      date: '2024-03-13',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN001236'
    },
    {
      id: 4,
      clientName: 'Emma Davis',
      packageName: 'Group Training Session',
      amount: 30,
      status: 'failed',
      date: '2024-03-12',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN001237'
    },
    {
      id: 5,
      clientName: 'Alex Brown',
      packageName: 'Basic Strength Training',
      amount: 50,
      status: 'completed',
      date: '2024-03-11',
      paymentMethod: 'Cash',
      transactionId: 'TXN001238'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = selectedFilter === 'all' || transaction.status === selectedFilter;
    const matchesSearch = transaction.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const TransactionCard = ({ transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.clientName}>{transaction.clientName}</Text>
          <Text style={styles.packageName}>{transaction.packageName}</Text>
        </View>
        <View>
          <Text style={styles.amount}>${transaction.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{transaction.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{transaction.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="receipt-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{transaction.transactionId}</Text>
        </View>
      </View>

      {transaction.status === 'pending' && (
        <View style={styles.transactionActions}>
          <TouchableOpacity style={styles.approveButton}>
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredTransactions.length}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{transactions.filter(t => t.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transactionsList}
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
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  statLabel: {
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: '#ED2A46',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ED2A46',
    textAlign: 'right',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  transactionDetails: {
    marginBottom: 12,
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
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ManageTransactionScreen;