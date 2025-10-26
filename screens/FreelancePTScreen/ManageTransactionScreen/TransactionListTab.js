import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionListTab = ({
  transactions,
  selectedFilter,
  setSelectedFilter,
  searchQuery,
  setSearchQuery,
  getStatusColor,
  getStatusText,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getTransactionTypeIcon,
  formatAmount,
  formatDate,
  refreshing,
  onRefresh,
  t,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState('all');

  const filterButtons = [
    { key: 'all', label: t('transaction.all', 'All') },
    { key: 'COMPLETED', label: t('transaction.completed', 'Completed') },
    { key: 'PENDING', label: t('transaction.pending', 'Pending') },
    { key: 'FAILED', label: t('transaction.failed', 'Failed') }
  ];

  const typeFilterButtons = [
    { key: 'all', label: t('transactionType.all', 'All Types'), icon: 'apps-outline' },
    { key: 'FreelancePTPackage', label: t('transactionType.ptPackage', 'PT Package'), icon: 'fitness-outline' },
    { key: 'ExtendFreelancePTPackage', label: t('transactionType.extendPT', 'Extend PT'), icon: 'refresh-outline' },
    { key: 'DistributeProfit', label: t('transactionType.profit', 'Profit'), icon: 'trending-up-outline' },
    { key: 'Withdraw', label: t('transactionType.withdraw', 'Withdraw'), icon: 'wallet-outline' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const statusMatch = selectedFilter === 'all' || transaction.status?.toUpperCase() === selectedFilter;
    const typeMatch = selectedTypeFilter === 'all' || transaction.transactionType === selectedTypeFilter;
    const searchMatch = searchQuery === '' || 
      transaction.orderCode?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTransactionTypeLabel(transaction.transactionType)?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && typeMatch && searchMatch;
  });


  const TransactionCard = ({ transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.orderCodeRow}>
            <Ionicons 
              name={getTransactionTypeIcon(transaction.transactionType)} 
              size={20} 
              color={getTransactionTypeColor(transaction.transactionType)} 
            />
            <Text style={styles.orderCode}>{transaction.orderCode}</Text>
          </View>
          <View style={[
            styles.transactionTypeBadge, 
            { backgroundColor: `${getTransactionTypeColor(transaction.transactionType)}15` }
          ]}>
            <Text style={[
              styles.transactionTypeText,
              { color: getTransactionTypeColor(transaction.transactionType) }
            ]}>
              {getTransactionTypeLabel(transaction.transactionType)}
            </Text>
          </View>
          {transaction.description && (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatAmount(transaction.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(transaction.createdAt)}</Text>
        </View>
        {transaction.paymentMethod && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{transaction.paymentMethod}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('transaction.searchPlaceholder', 'Search transactions...')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
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

      {/* Transaction Type Filter */}
      <View style={styles.typeFilterSection}>
        <Text style={styles.filterSectionTitle}>
          {t('transaction.filterByType', 'Filter by Type')}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.typeFilterScrollView}
          contentContainerStyle={styles.typeFilterContainer}
        >
          {typeFilterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.typeFilterButton,
                selectedTypeFilter === filter.key && styles.typeFilterButtonActive
              ]}
              onPress={() => setSelectedTypeFilter(filter.key)}
            >
              <Ionicons 
                name={filter.icon} 
                size={18} 
                color={selectedTypeFilter === filter.key ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.typeFilterButtonText,
                selectedTypeFilter === filter.key && styles.typeFilterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>
            {t('transaction.noTransactions', 'No Transactions Found')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? t('transaction.noSearchResults', 'Try different search terms')
              : t('transaction.noTransactionsYet', 'Transactions will appear here')
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};
const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
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
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  typeFilterSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  typeFilterScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  typeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeFilterButtonActive: {
    backgroundColor: '#ED2A46',
    borderColor: '#ED2A46',
  },
  typeFilterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  typeFilterButtonTextActive: {
    color: '#fff',
  },
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    minHeight: height * 0.6,
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
    marginRight: 12,
  },
  orderCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  transactionTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    minHeight: height * 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TransactionListTab;
