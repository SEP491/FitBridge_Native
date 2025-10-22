import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../../hooks/useTranslation';

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require('../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../assets/images/bodyparts/hip.png'),
  Shoulder: require('../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../assets/images/bodyparts/thigh.png'),
  Waist: require('../../../assets/images/bodyparts/waist.png'),
};

// Function to get muscle group image
const getMuscleGroupImage = (muscleGroup) => {
  // Normalize the muscle group name (remove spaces, handle case)
  const normalized = muscleGroup?.replace(/\s+/g, '');
  return muscleGroupImages[normalized] || null;
};

export const TrainingResultScreen = ({ route, navigation }) => {
  const { package: pkg, statistics: stats, customer } = route.params;
  const { t } = useTranslation();

  const StatCard = ({ title, children, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        {icon && <Ionicons name={icon} size={24} color="#ED2A46" />}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const StatRow = ({ label, value, icon, valueColor }) => (
    <View style={styles.statRow}>
      <View style={styles.statRowLeft}>
        {icon && <Ionicons name={icon} size={18} color="#666" />}
        <Text style={styles.statRowLabel}>{label}</Text>
      </View>
      <Text style={[styles.statRowValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trainingResults.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Customer & Package Info */}
        <View style={styles.infoCard}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.packageName}>{pkg.packageName}</Text>
        </View>

        {/* Overview Statistics */}
        <StatCard title={t('trainingResults.overview')} icon="stats-chart">
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.completionRate?.toFixed(2)}%</Text>
              <Text style={styles.overviewLabel}>{t('trainingResults.completionRate')}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.activityCompletionRate?.toFixed(2)}%</Text>
              <Text style={styles.overviewLabel}>{t('trainingResults.activityRate')}</Text>
            </View>
          </View>
        </StatCard>

        {/* Session Statistics */}
        <StatCard title={t('trainingResults.sessions')} icon="calendar">
          <StatRow 
            label={t('trainingResults.totalSessions')} 
            value={stats.totalSessions} 
            icon="fitness-outline"
          />
          <StatRow 
            label={t('trainingResults.completedSessions')} 
            value={stats.completedSessions} 
            icon="checkmark-circle-outline"
            valueColor="#4CAF50"
          />
          <StatRow 
            label={t('trainingResults.cancelledSessions')} 
            value={stats.cancelledSessions} 
            icon="close-circle-outline"
            valueColor="#F44336"
          />
          <StatRow 
            label={t('trainingResults.upcomingSessions')} 
            value={stats.upcomingSessions} 
            icon="time-outline"
            valueColor="#2196F3"
          />
          <StatRow 
            label={t('trainingResults.availableSessions')} 
            value={stats.availableSessions} 
            icon="calendar-outline"
          />
          <StatRow 
            label={t('trainingResults.expirationDate')} 
            value={new Date(stats.expirationDate).toLocaleDateString()} 
            icon="flag-outline"
          />
        </StatCard>

        {/* Activity Statistics */}
        <StatCard title={t('trainingResults.activities')} icon="barbell">
          <StatRow 
            label={t('trainingResults.totalActivities')} 
            value={stats.totalActivities} 
          />
          <StatRow 
            label={t('trainingResults.totalActivitySets')} 
            value={stats.totalActivitySets} 
          />
          <StatRow 
            label={t('trainingResults.completedActivitySets')} 
            value={stats.completedActivitySets} 
            valueColor="#4CAF50"
          />
          <StatRow 
            label={t('trainingResults.averageSetsPerSession')} 
            value={stats.averageSetsPerSession} 
          />
        </StatCard>

        {/* Performance Metrics */}
        <StatCard title={t('trainingResults.performance')} icon="trophy">
          <StatRow 
            label={t('trainingResults.averageSessionTime')} 
            value={`${Math.floor(stats.averageSessionTimeSeconds / 60)}m ${stats.averageSessionTimeSeconds % 60}s`}
            icon="timer-outline"
          />
          <StatRow 
            label={t('trainingResults.averageWeightLifted')} 
            value={`${stats.averageWeightLifted?.toFixed(1)} kg`}
            icon="barbell-outline"
          />
        </StatCard>

        {/* Muscle Group Performance */}
        {stats.mostTrainedMuscleGroup && (
          <StatCard title={t('trainingResults.mostTrainedMuscleGroup')} icon="body">
            <View style={styles.muscleGroupCard}>
              {getMuscleGroupImage(stats.mostTrainedMuscleGroup.muscleGroup) && (
                <Image 
                  source={getMuscleGroupImage(stats.mostTrainedMuscleGroup.muscleGroup)}
                  style={styles.muscleGroupImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.muscleGroupName}>{stats.mostTrainedMuscleGroup.muscleGroup}</Text>
              <View style={styles.muscleGroupStats}>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>{stats.mostTrainedMuscleGroup.totalSets}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.sets')}</Text>
                </View>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#FF6B35' }]}>{stats.mostTrainedMuscleGroup.totalWeight}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.weightKg')}</Text>
                </View>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>{stats.mostTrainedMuscleGroup.activityCount}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.activities')}</Text>
                </View>
              </View>
            </View>
          </StatCard>
        )}

        {stats.leastTrainedMuscleGroup && (
          <StatCard title={t('trainingResults.leastTrainedMuscleGroup')} icon="body-outline">
            <View style={styles.muscleGroupCard}>
              {getMuscleGroupImage(stats.leastTrainedMuscleGroup.muscleGroup) && (
                <Image 
                  source={getMuscleGroupImage(stats.leastTrainedMuscleGroup.muscleGroup)}
                  style={styles.muscleGroupImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.muscleGroupName}>{stats.leastTrainedMuscleGroup.muscleGroup}</Text>
              <View style={styles.muscleGroupStats}>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>{stats.leastTrainedMuscleGroup.totalSets}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.sets')}</Text>
                </View>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#FF6B35' }]}>{stats.leastTrainedMuscleGroup.totalWeight}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.weightKg')}</Text>
                </View>
                <View style={styles.muscleGroupStat}>
                  <Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>{stats.leastTrainedMuscleGroup.activityCount}</Text>
                  <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.activities')}</Text>
                </View>
              </View>
            </View>
          </StatCard>
        )}

        {/* Workout Statistics */}
        {stats.workoutStatistics && (
          <StatCard title={t('trainingResults.workoutDetails')} icon="analytics">
            <StatRow 
              label={t('trainingResults.totalWeightLifted')} 
              value={`${stats.workoutStatistics.totalWeightLifted} kg`}
              icon="barbell-outline"
            />
            <StatRow 
              label={t('trainingResults.totalRepsCompleted')} 
              value={`${stats.workoutStatistics.totalRepsCompleted} / ${stats.workoutStatistics.plannedNumOfReps}`}
            />
            <StatRow 
              label={t('trainingResults.totalPracticeTime')} 
              value={`${Math.floor(stats.workoutStatistics.totalPracticeTimeSeconds / 60)}m / ${Math.floor(stats.workoutStatistics.plannedPracticeTime / 60)}m`}
            />
            <StatRow 
              label={t('trainingResults.averageRestTime')} 
              value={`${stats.workoutStatistics.averageRestTimeSeconds}s`}
            />
          </StatCard>
        )}

        {/* Activity Type Breakdown */}
        {stats.workoutStatistics?.activityTypeBreakdown && (
          <StatCard title={t('trainingResults.activityTypeBreakdown')} icon="list">
            {Object.entries(stats.workoutStatistics.activityTypeBreakdown).map(([type, count]) => (
              <StatRow 
                key={type}
                label={type} 
                value={count}
              />
            ))}
          </StatCard>
        )}

        {/* Muscle Group Breakdown */}
        {stats.muscleGroupBreakdown && stats.muscleGroupBreakdown.length > 0 && (
          <StatCard title={t('trainingResults.muscleGroupBreakdown')} icon="body">
            {stats.muscleGroupBreakdown.map((muscle, index) => (
              <View key={index} style={styles.muscleBreakdownItem}>
                <View style={styles.muscleBreakdownHeader}>
                  {getMuscleGroupImage(muscle.muscleGroup) && (
                    <Image 
                      source={getMuscleGroupImage(muscle.muscleGroup)}
                      style={styles.muscleBreakdownImage}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.muscleBreakdownName}>{muscle.muscleGroup}</Text>
                </View>
                <View style={styles.muscleBreakdownStats}>
                  <View style={styles.muscleBreakdownStat}>
                    <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.activities')}</Text>
                    <Text style={[styles.muscleBreakdownValue, { color: '#4CAF50' }]}>{muscle.activityCount}</Text>
                  </View>
                  <View style={styles.muscleBreakdownStat}>
                    <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.sets')}</Text>
                    <Text style={[styles.muscleBreakdownValue, { color: '#2196F3' }]}>{muscle.setsCompleted}</Text>
                  </View>
                  <View style={styles.muscleBreakdownStat}>
                    <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.weightKg')}</Text>
                    <Text style={[styles.muscleBreakdownValue, { color: '#FF6B35' }]}>{muscle.totalWeight}</Text>
                  </View>
                  <View style={styles.muscleBreakdownStat}>
                    <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.reps')}</Text>
                    <Text style={[styles.muscleBreakdownValue, { color: '#9C27B0' }]}>{muscle.totalReps}</Text>
                  </View>
                </View>
              </View>
            ))}
          </StatCard>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 16,
    color: '#666',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  statRowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  muscleGroupCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  muscleGroupImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  muscleGroupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 12,
    textAlign: 'center',
  },
  muscleGroupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  muscleGroupStat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    borderRightWidth: 3,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 3,
    minWidth: '30%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  muscleGroupStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  muscleGroupStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  muscleBreakdownItem: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  muscleBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  muscleBreakdownImage: {
    width: 40,
    height: 40,
  },
  muscleBreakdownName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  muscleBreakdownStats: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  muscleBreakdownStat: {
    alignItems: 'center',
  },
  muscleBreakdownLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  muscleBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ED2A46',
  },
});

export default TrainingResultScreen;
