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
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";

const ManageVoucherScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: 'WELCOME20',
      discount: 20,
      type: 'percentage',
      description: 'Welcome discount for new clients',
      status: 'active',
      usageCount: 15,
      maxUsage: 100,
      expiryDate: '2024-12-31'
    },
    {
      id: 2,
      code: 'SUMMER50',
      discount: 50,
      type: 'fixed',
      description: 'Summer special discount',
      status: 'active',
      usageCount: 8,
      maxUsage: 50,
      expiryDate: '2024-08-31'
    },
    {
      id: 3,
      code: 'STUDENT15',
      discount: 15,
      type: 'percentage',
      description: 'Student discount',
      status: 'inactive',
      usageCount: 25,
      maxUsage: 200,
      expiryDate: '2024-06-30'
    }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const VoucherCard = ({ voucher }) => (
    <View style={styles.voucherCard}>
      <View style={styles.voucherHeader}>
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherCode}>{voucher.code}</Text>
          <Text style={styles.voucherDescription}>{voucher.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(voucher.status) }]}>
          <Text style={styles.statusText}>{voucher.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.voucherDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Discount:</Text>
          <Text style={styles.detailValue}>
            {voucher.type === 'percentage' ? `${voucher.discount}%` : `$${voucher.discount}`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Usage:</Text>
          <Text style={styles.detailValue}>{voucher.usageCount}/{voucher.maxUsage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expires:</Text>
          <Text style={styles.detailValue}>{voucher.expiryDate}</Text>
        </View>
      </View>

      <View style={styles.voucherActions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: voucher.status === 'active' ? '#F44336' : '#4CAF50' }]}
        >
          <Ionicons name={voucher.status === 'active' ? 'pause' : 'play'} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>
            {voucher.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vouchers.filter(v => v.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active Vouchers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vouchers.reduce((sum, v) => sum + v.usageCount, 0)}</Text>
          <Text style={styles.statLabel}>Total Usage</Text>
        </View>
      </View>

      {/* Add New Voucher Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => Alert.alert('Info', 'Add new voucher functionality')}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Create New Voucher</Text>
      </TouchableOpacity>

      {/* Vouchers List */}
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <VoucherCard voucher={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vouchersList}
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
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  vouchersList: {
    paddingBottom: 20,
  },
  voucherCard: {
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
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  voucherDescription: {
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
  voucherDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  voucherActions: {
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
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
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

export default ManageVoucherScreen;