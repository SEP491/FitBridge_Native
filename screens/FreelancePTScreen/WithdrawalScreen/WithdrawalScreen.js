import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/FontAwesome';

const WithdrawalScreen = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');

  const handleWithdrawal = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('errors.error'), 'Please enter a valid amount');
      return;
    }
    
    Alert.alert(
      t('common.success'),
      'Withdrawal request submitted successfully',
      [{ text: t('common.confirm'), onPress: () => {} }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>$1,250.00</Text>
        </View>

        {/* Withdrawal Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Withdrawal Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'bank' && styles.methodCardSelected
            ]}
            onPress={() => setSelectedMethod('bank')}
          >
            <Icon name="bank" size={20} color="#ED2A46" />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Bank Transfer</Text>
              <Text style={styles.methodSubtitle}>2-3 business days</Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedMethod === 'bank' && styles.radioButtonSelected
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'paypal' && styles.methodCardSelected
            ]}
            onPress={() => setSelectedMethod('paypal')}
          >
            <Icon name="paypal" size={20} color="#ED2A46" />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>PayPal</Text>
              <Text style={styles.methodSubtitle}>Instant transfer</Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedMethod === 'paypal' && styles.radioButtonSelected
            ]} />
          </TouchableOpacity>
        </View>

        {/* Recent Withdrawals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
          
          <View style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyAmount}>$500.00</Text>
              <Text style={styles.historyDate}>March 15, 2024</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusCompleted]}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          <View style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyAmount}>$300.00</Text>
              <Text style={styles.historyDate}>March 10, 2024</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusPending]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdrawal}>
          <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: '#333',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  methodCardSelected: {
    borderColor: '#ED2A46',
    backgroundColor: '#fff5f5',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    borderColor: '#ED2A46',
    backgroundColor: '#ED2A46',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  withdrawButton: {
    backgroundColor: '#ED2A46',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WithdrawalScreen;