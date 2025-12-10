import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paymentService from '../../../services/paymentService';
import { useFocusEffect } from '@react-navigation/native';
import dashBoardService from '../../../services/dashBoardService';

const WithdrawalTab = ({
  totalRevenue,
  withdrawalAmount,
  setWithdrawalAmount,
  bankAccount,
  setBankAccount,
  bankName,
  setBankName,
  accountName,
  setAccountName,
  withdrawalHistory,
  handleWithdrawal,
  getStatusColor,
  getStatusText,
  formatAmount,
  formatDate,
  t,
}) => {

  const [availableBalance, setAvailableBalance] = useState(0);

  const loadAvailableBalance = async () => {
    const response = await dashBoardService.getWalletBalance();
    setAvailableBalance(response.data.totalAvailableBalance);
  };

  useFocusEffect(
    useCallback(() => {
      loadAvailableBalance();
    }, [])
  );
  // Format amount input with thousand separators
  const formatAmountInput = (value) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Format with thousand separators
    if (numericValue === '') return '';
    
    return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
  };

  // Handle amount change with formatting
  const handleAmountChange = (text) => {
    // Remove all non-digit characters
    const numericValue = text.replace(/\D/g, '');
    setWithdrawalAmount(numericValue);
  };

  return (
    <View style={styles.withdrawalContainer}>
      {/* Available Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={32} color="#4CAF50" />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>
              {t('withdrawal.availableBalance', 'Available Balance')}
            </Text>
            <Text style={styles.balanceAmount}>{formatAmount(availableBalance)}</Text>
          </View>
        </View>
      </View>

      {/* Withdrawal Form */}
      <View style={styles.withdrawalForm}>
        <Text style={styles.formTitle}>
          {t('withdrawal.requestWithdrawal', 'Request Withdrawal')}
        </Text>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('withdrawal.amount', 'Amount')} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t('withdrawal.enterAmount', 'Enter amount')}
              value={formatAmountInput(withdrawalAmount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Bank Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('withdrawal.bankName', 'Bank Name')} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t('withdrawal.enterBankName', 'Enter bank name')}
              value={bankName}
              onChangeText={setBankName}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Account Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('withdrawal.accountNumber', 'Account Number')} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t('withdrawal.enterAccountNumber', 'Enter account number')}
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Account Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('withdrawal.accountName', 'Account Name')} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t('withdrawal.enterAccountName', 'Enter account name')}
              value={accountName}
              onChangeText={setAccountName}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleWithdrawal}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {t('withdrawal.submitRequest', 'Submit Request')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Withdrawal History */}
      <View style={styles.withdrawalHistory}>
        <Text style={styles.historyTitle}>
          {t('withdrawal.history', 'Withdrawal History')}
        </Text>
        {withdrawalHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="file-tray-outline" size={60} color="#E0E0E0" />
            <Text style={styles.emptyHistoryText}>
              {t('withdrawal.noHistory', 'No withdrawal history')}
            </Text>
          </View>
        ) : (
          withdrawalHistory.map((item) => (
            <View key={item.id} style={styles.withdrawalCard}>
              <View style={styles.withdrawalCardHeader}>
                <View style={styles.withdrawalInfo}>
                  <Text style={styles.withdrawalAmount}>
                    {formatAmount(item.amount)}
                  </Text>
                  <Text style={styles.withdrawalMethod}>{item.bankName}</Text>
                  <Text style={styles.withdrawalAccountName}>{item.accountName}</Text>
                  <Text style={styles.withdrawalAccount}>{item.accountNumber}</Text>
                  {item.reason && (
                    <Text style={styles.withdrawalReason}>
                      {t('withdrawal.reason', 'Reason')}: {item.reason}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.withdrawalStatusBadge,
                  { backgroundColor: getStatusColor(item.status) }
                ]}>
                  <Text style={styles.withdrawalStatusText}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.withdrawalCardFooter}>
                <View style={styles.withdrawalDate}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.withdrawalDateText}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                {item.imageUrl && (
                  <TouchableOpacity onPress={handleViewProof(item.imageUrl)}>
                  <View style={styles.withdrawalDate}>
                    <Ionicons name="image-outline" size={14} color="#2196F3" />
                    <Text style={styles.withdrawalDateText}>
                      {t('withdrawal.hasProof', 'Proof attached')}
                    </Text>
                  </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  withdrawalContainer: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  withdrawalForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  withdrawalHistory: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  withdrawalCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
  },
  withdrawalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  withdrawalInfo: {
    flex: 1,
    marginRight: 12,
  },
  withdrawalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  withdrawalMethod: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontWeight: '600',
  },
  withdrawalAccountName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  withdrawalAccount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  withdrawalReason: {
    fontSize: 11,
    color: '#FF9800',
    fontStyle: 'italic',
    marginTop: 4,
  },
  withdrawalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  withdrawalStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  withdrawalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  withdrawalDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  withdrawalDateText: {
    fontSize: 12,
    color: '#666',
  },
});

export default WithdrawalTab;
