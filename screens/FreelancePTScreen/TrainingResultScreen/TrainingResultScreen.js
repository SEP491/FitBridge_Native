import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../../hooks/useTranslation';
import { OverviewStatistics } from './components/OverviewStatistics';
import { DailyProgressChart } from './components/DailyProgressChart';
import { MuscleGroupPerformance } from './components/MuscleGroupPerformance';
import { UserGoalsProgress } from './components/UserGoalsProgress';
import { SessionStatistics } from './components/SessionStatistics';
import { MuscleGroupBreakdown } from './components/MuscleGroupBreakdown';
import { MuscleGroupDropdownModal } from './components/MuscleGroupDropdownModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TrainingResultScreen = ({ route, navigation }) => {
  const { package: pkg, statistics: stats, muscleReport, customer } = route.params;
  const { t } = useTranslation();

  // State for muscle group chart
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Weight'); // 'Weight', 'Reps', 'Time'
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'details'

  console.log('Muscle Report:', muscleReport);

  // Initialize selected muscle group
  React.useEffect(() => {
    if (muscleReport?.muscleGroupActivities && muscleReport.muscleGroupActivities.length > 0 && !selectedMuscleGroup) {
      setSelectedMuscleGroup(muscleReport.muscleGroupActivities[0].muscleGroup);
    }
  }, [muscleReport]);

  // Prepare line chart data based on selected muscle group and metric
  const prepareLineChartData = () => {
    if (!muscleReport?.muscleGroupActivities || !selectedMuscleGroup) {
      return null;
    }

    const muscleData = muscleReport.muscleGroupActivities.find(
      m => m.muscleGroup === selectedMuscleGroup
    );

    if (!muscleData || !muscleData.dailyResults || muscleData.dailyResults.length === 0) {
      return null;
    }

    // Sort by date
    const sortedResults = [...muscleData.dailyResults].sort(
      (a, b) => new Date(a.practiceDay) - new Date(b.practiceDay)
    );

    const labels = sortedResults.map(result => {
      const date = new Date(result.practiceDay);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let data = [];
    let yAxisSuffix = '';
    
    switch (selectedMetric) {
      case 'Weight':
        data = sortedResults.map(result => result.totalWeights || 0);
        yAxisSuffix = ' kg';
        break;
      case 'Reps':
        data = sortedResults.map(result => result.totalReps || 0);
        yAxisSuffix = '';
        break;
      case 'Time':
        data = sortedResults.map(result => result.totalTime || 0);
        yAxisSuffix = ' s';
        break;
    }

    return {
      labels,
      datasets: [{
        data: data.length > 0 ? data : [0],
        color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
        strokeWidth: 3,
      }],
      legend: [`${selectedMuscleGroup} - ${selectedMetric}`]
    };
  };

  // Mocked user goals data - should come from API in future
  const mockedUserGoals = [
    {
      muscleGroup: 'Chest',
      targetChest: 80,
      startChest: 50,
      currentChest: 60,
    },
    {
      muscleGroup: 'Back',
      targetBack: 90,
      startBack: 70,
      currentBack: 80,
    },
    {
      muscleGroup: 'Biceps',
      targetBiceps: 40,
      startBiceps: 30,
      currentBiceps: 35,
    },
    {
      muscleGroup: 'Hips',
      targetHips: 50,
      startHips: 80,
      currentHips: 60,
    }
  ];

  // Prepare data for stacked bar chart
  const prepareGoalsChartData = () => {
    const labels = mockedUserGoals.map(goal => goal.muscleGroup);
    
    const data = [];
    mockedUserGoals.forEach(goal => {
      const start = goal[`start${goal.muscleGroup}`] || 0;
      const current = goal[`current${goal.muscleGroup}`] || 0;
      const target = goal[`target${goal.muscleGroup}`] || 0;
      data.push([start, current, target]);
    });

    return {
      labels,
      data,
      barColors: ['#94A3B8', '#4CAF50', '#ED2A46'],
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    fillShadowGradient: '#ED2A46',
    fillShadowGradientOpacity: 1,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
    },
  };

  // Shared StatCard component
  const StatCard = ({ title, children, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        {icon && <Ionicons name={icon} size={24} color="#ED2A46" />}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  // Shared StatRow component
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Customer & Package Info */}
        <View style={styles.infoCard}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.packageName}>{pkg.packageName}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Ionicons
              name="stats-chart"
              size={20}
              color={activeTab === 'overview' ? '#ED2A46' : '#64748B'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              {t('trainingResults.overviewAndProgress') || 'Overview & Progress'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Ionicons
              name="analytics"
              size={20}
              color={activeTab === 'details' ? '#ED2A46' : '#64748B'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'details' && styles.activeTabText,
              ]}
            >
              {t('trainingResults.detailedStatistics') || 'Detailed Statistics'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview & Progress Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Overview Statistics */}
            <OverviewStatistics stats={stats} t={t} StatCard={StatCard} />

            {/* Daily Muscle Group Progress Chart */}
            <DailyProgressChart
              muscleReport={muscleReport}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              setShowMuscleDropdown={setShowMuscleDropdown}
              prepareLineChartData={prepareLineChartData}
              StatCard={StatCard}
            />

            {/* Muscle Group Performance */}
            <MuscleGroupPerformance stats={stats} t={t} StatCard={StatCard} />

            {/* User Goals Progress */}
            <UserGoalsProgress
              mockedUserGoals={mockedUserGoals}
              prepareGoalsChartData={prepareGoalsChartData}
              chartConfig={chartConfig}
              t={t}
              StatCard={StatCard}
              stats={stats}
            />
          </>
        )}

        {/* Detailed Statistics Tab */}
        {activeTab === 'details' && (
          <>
            {/* Session Statistics */}
            <SessionStatistics stats={stats} t={t} StatCard={StatCard} StatRow={StatRow} />

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
                value={`${stats.averageSessionTimePerSession?.toFixed(1)} min`}
                icon="timer-outline"
              />
              <StatRow 
                label={t('trainingResults.averageWeightLifted')} 
                value={`${stats.averageWeightLiftedPerSession?.toFixed(1)} kg`}
                icon="barbell-outline"
              />
              <StatRow 
                label={t('trainingResults.averageRepsPerSession') || 'Avg Reps/Session'} 
                value={stats.averageRepsPerSession?.toFixed(1)}
                icon="refresh-outline"
              />
            </StatCard>

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
            <MuscleGroupBreakdown stats={stats} t={t} StatCard={StatCard} />
          </>
        )}

        {/* Muscle Group Dropdown Modal */}
        <MuscleGroupDropdownModal
          visible={showMuscleDropdown}
          onClose={() => setShowMuscleDropdown(false)}
          muscleReport={muscleReport}
          selectedMuscleGroup={selectedMuscleGroup}
          onSelectMuscle={setSelectedMuscleGroup}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF0F2',
    borderWidth: 2,
    borderColor: '#ED2A46',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#ED2A46',
    fontWeight: '700',
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
});

export default TrainingResultScreen;
