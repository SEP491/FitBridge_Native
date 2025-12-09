import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { Ionicons } from "@expo/vector-icons";
import transactionService from '../../../services/transactionService';
import paymentService from '../../../services/paymentService';
import DashboardTab from './DashboardTab';
import TransactionListTab from './TransactionListTab';
import WithdrawalTab from './WithdrawalTab';

const ManageTransactionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'transactions', 'withdrawal'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  
  // Withdrawal state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  
  useEffect(() => {
    loadTransactions();
    loadWithdrawalHistory();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions({
        page: 1,
        size: 100,
      });
      console.log('Transactions response:', response.data);
      
      if (response.data && response.data.items) {
        setTransactions(response.data.items);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadTransactions(), loadWithdrawalHistory()])
      .finally(() => setRefreshing(false));
  }, []);

  const loadWithdrawalHistory = async () => {
    try {
      const response = await paymentService.getRequestWithdrawal();
      console.log('Withdrawal history response:', response);
      
      if (response.data && response.data.items) {
        setWithdrawalHistory(response.data.items);
      } else {
        setWithdrawalHistory([]);
      }
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      setWithdrawalHistory([]);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      alert(t('withdrawal.invalidAmount', 'Please enter a valid amount'));
      return;
    }
    if (!bankAccount || !bankName || !accountName) {
      alert(t('withdrawal.fillAllFields', 'Please fill all fields'));
      return;
    }

    try {
      const withdrawalData = {
        amount: parseFloat(withdrawalAmount),
        note: '',
        bankName: bankName,
        accountName: accountName,
        accountNumber: bankAccount,
      };

      console.log('Submitting withdrawal request:', withdrawalData);
      const response = await paymentService.sendRequestWithdrawal(withdrawalData);
      console.log('Withdrawal response:', response);

      alert(t('withdrawal.requestSuccess', 'Withdrawal request submitted successfully'));
      
      // Clear form
      setWithdrawalAmount('');
      setBankAccount('');
      setBankName('');
      setAccountName('');
      
      // Reload withdrawal history
      loadWithdrawalHistory();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert(t('withdrawal.requestFailed', 'Failed to submit withdrawal request'));
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'FreelancePTPackage':
        return t('transactionType.freelancePTPackage', 'PT Package');
      case 'ExtendFreelancePTPackage':
        return t('transactionType.extendFreelancePTPackage', 'Extend PT Package');
      case 'DistributeProfit':
        return t('transactionType.distributeProfit', 'Profit Distribution');
      case 'Withdraw':
        return t('transactionType.withdraw', 'Withdrawal');
      default:
        return type || t('transactionType.other', 'Other');
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'FreelancePTPackage':
        return '#ED2A46'; // Red for PT packages
      case 'ExtendFreelancePTPackage':
        return '#9C27B0'; // Purple for PT package extension
      case 'DistributeProfit':
        return '#4CAF50'; // Green for profit
      case 'Withdraw':
        return '#FF9800'; // Orange for withdrawal
      default:
        return '#666'; // Gray for others
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'FreelancePTPackage':
        return 'fitness-outline';
      case 'ExtendFreelancePTPackage':
        return 'refresh-outline';
      case 'DistributeProfit':
        return 'trending-up-outline';
      case 'Withdraw':
        return 'wallet-outline';
      default:
        return 'receipt-outline';
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED': 
      case 'SUCCESS': 
        return '#4CAF50';
      case 'PENDING': 
        return '#FF9800';
      case 'FAILED': 
      case 'CANCELLED':
        return '#F44336';
        case 'RESOLVED':
          return '#4CAF50';
          case 'REJECTED':
            return '#F44336';
      default: 
        return '#666';
    }
  };

  const getStatusText = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED': 
      case 'SUCCESS': 
        return t('transaction.completed', 'Completed');
      case 'PENDING': 
        return t('transaction.pending', 'Pending');
      case 'FAILED': 
        return t('transaction.failed', 'Failed');
      case 'CANCELLED':
        return t('transaction.cancelled', 'Cancelled');
      case 'RESOLVED':
        return t('transaction.resolved', 'Resolved');
      case 'REJECTED':
        return t('transaction.rejected', 'Rejected');
      default: 
        return status;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = transactions
    .filter(t => t.status?.toUpperCase() === 'COMPLETED' || t.status?.toUpperCase() === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const completedCount = transactions.filter(t => 
    t.status?.toUpperCase() === 'COMPLETED' || t.status?.toUpperCase() === 'SUCCESS'
  ).length;
  
  const pendingCount = transactions.filter(t => 
    t.status?.toUpperCase() === 'PENDING'
  ).length;
  
  const failedCount = transactions.filter(t => 
    t.status?.toUpperCase() === 'FAILED' || t.status?.toUpperCase() === 'CANCELLED'
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED2A46" />
        <Text style={styles.loadingText}>
          {t('transaction.loading', 'Loading transactions...')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={activeTab === 'dashboard' ? '#ED2A46' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'dashboard' && styles.activeTabText
          ]}>
            {t('tabs.dashboard', 'Dashboard')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="receipt-outline"
            size={20}
            color={activeTab === 'transactions' ? '#ED2A46' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'transactions' && styles.activeTabText
          ]}>
            {t('tabs.transactions', 'Transactions')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'withdrawal' && styles.activeTab]}
          onPress={() => setActiveTab('withdrawal')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color={activeTab === 'withdrawal' ? '#ED2A46' : '#999'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'withdrawal' && styles.activeTabText
          ]}>
            {t('tabs.withdrawal', 'Withdrawal')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ED2A46']}
            tintColor="#ED2A46"
          />
        }
      >
        {activeTab === 'dashboard' && (
          <DashboardTab
            transactions={transactions}
            totalRevenue={totalRevenue}
            pendingCount={pendingCount}
            completedCount={completedCount}
            failedCount={failedCount}
            showCharts={showCharts}
            setShowCharts={setShowCharts}
            setActiveTab={setActiveTab}
            formatAmount={formatAmount}
            t={t}
          />
        )}
       
        {activeTab === 'withdrawal' && (
          <WithdrawalTab
            totalRevenue={totalRevenue}
            withdrawalAmount={withdrawalAmount}
            setWithdrawalAmount={setWithdrawalAmount}
            bankAccount={bankAccount}
            setBankAccount={setBankAccount}
            bankName={bankName}
            setBankName={setBankName}
            accountName={accountName}
            setAccountName={setAccountName}
            withdrawalHistory={withdrawalHistory}
            handleWithdrawal={handleWithdrawal}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            formatAmount={formatAmount}
            formatDate={formatDate}
            t={t}
          />
        )}
      </ScrollView>

       {activeTab === 'transactions' && (
          <TransactionListTab
            transactions={transactions}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getTransactionTypeLabel={getTransactionTypeLabel}
            getTransactionTypeColor={getTransactionTypeColor}
            getTransactionTypeIcon={getTransactionTypeIcon}
            formatAmount={formatAmount}
            formatDate={formatDate}
            refreshing={refreshing}
            onRefresh={onRefresh}
            t={t}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ED2A46',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#ED2A46',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default ManageTransactionScreen;