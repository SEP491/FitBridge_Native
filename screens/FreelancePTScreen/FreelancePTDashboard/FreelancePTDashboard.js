import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/FontAwesome';

const FreelancePTDashboard = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 2450.00,
    monthlyEarnings: 850.00,
    totalClients: 15,
    activeClients: 8,
    upcomingSessions: 5,
    completedSessions: 42,
    rating: 4.8,
    reviews: 23
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const StatCard = ({ title, value, icon, color = "#ED2A46", onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Icon name={icon} size={20} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, onPress, color = "#ED2A46" }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.nameText}>Freelance PT</Text>
      </View>

      {/* Earnings Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings Overview</Text>
        <View style={styles.earningsCard}>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <Text style={styles.earningsValue}>${dashboardData.totalEarnings.toFixed(2)}</Text>
            </View>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsLabel}>This Month</Text>
              <Text style={styles.earningsValue}>${dashboardData.monthlyEarnings.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Clients"
            value={dashboardData.totalClients.toString()}
            icon="users"
            color="#4CAF50"
            onPress={() => navigation.navigate('ClientsList')}
          />
          <StatCard
            title="Active Clients"
            value={dashboardData.activeClients.toString()}
            icon="user-plus"
            color="#2196F3"
          />
          <StatCard
            title="Upcoming Sessions"
            value={dashboardData.upcomingSessions.toString()}
            icon="calendar"
            color="#FF9800"
            onPress={() => navigation.navigate('Schedule')}
          />
          <StatCard
            title="Completed Sessions"
            value={dashboardData.completedSessions.toString()}
            icon="check-circle"
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceCard}>
          <View style={styles.performanceItem}>
            <Icon name="star" size={24} color="#FFD700" />
            <View style={styles.performanceText}>
              <Text style={styles.performanceValue}>{dashboardData.rating}/5.0</Text>
              <Text style={styles.performanceLabel}>Average Rating</Text>
            </View>
          </View>
          <View style={styles.performanceItem}>
            <Icon name="comment" size={24} color="#ED2A46" />
            <View style={styles.performanceText}>
              <Text style={styles.performanceValue}>{dashboardData.reviews}</Text>
              <Text style={styles.performanceLabel}>Reviews</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Schedule Session"
            icon="calendar-plus-o"
            onPress={() => navigation.navigate('ScheduleSession')}
            color="#4CAF50"
          />
          <QuickAction
            title="View Clients"
            icon="users"
            onPress={() => navigation.navigate('ClientsList')}
            color="#2196F3"
          />
          <QuickAction
            title="Earnings"
            icon="money"
            onPress={() => navigation.navigate('Withdrawal')}
            color="#FF9800"
          />
          <QuickAction
            title="Messages"
            icon="comments"
            onPress={() => navigation.navigate('Chat')}
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.activityText}>Session with John completed - $50.00</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="calendar" size={16} color="#2196F3" />
            <Text style={styles.activityText}>New session booked with Sarah for tomorrow</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.activityText}>Received 5-star review from Mike</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ED2A46',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ED2A46',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statContent: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceText: {
    marginLeft: 16,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
});

export default FreelancePTDashboard;