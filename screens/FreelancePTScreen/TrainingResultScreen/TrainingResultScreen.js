import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../../hooks/useTranslation';
import { BarChart, StackedBarChart, LineChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require('../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../assets/images/bodyparts/hip.png'),
  Shoulders: require('../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../assets/images/bodyparts/thigh.png'),
  AbsCore: require('../../../assets/images/bodyparts/waist.png'),
  Back: require('../../../assets/images/bodyparts/back.png'),
  Triceps: require('../../../assets/images/bodyparts/triceps.png'),
  Glutes: require('../../../assets/images/bodyparts/glutes.png'),
  FullBody: require('../../../assets/images/bodyparts/fullbody.png'),
  Other: require('../../../assets/images/bodyparts/other.png'), 
  Thighs: require('../../../assets/images/bodyparts/thigh.png'),
};



// Function to get muscle group image
const getMuscleGroupImage = (muscleGroup) => {
  // Normalize the muscle group name (remove spaces, handle case)
  const normalized = muscleGroup?.replace(/\s+/g, '');
  return muscleGroupImages[normalized] || null;
};

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
    
    // Calculate progress for each muscle group
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
              Overview & Progress
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
              Detailed Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview & Progress Tab */}
        {activeTab === 'overview' && (
          <>
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

            {/* Daily Muscle Group Progress Chart */}
            {muscleReport?.muscleGroupActivities && muscleReport.muscleGroupActivities.length > 0 && (
              <StatCard title="Daily Progress Tracking" icon="trending-up">
                {/* Muscle Group Dropdown */}
                <View style={styles.chartControlsContainer}>
                  <Text style={styles.chartControlLabel}>Muscle Group:</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowMuscleDropdown(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedMuscleGroup || 'Select Muscle Group'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Metric Selection Buttons */}
                <View style={styles.metricButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.metricButton,
                      selectedMetric === 'Weight' && styles.metricButtonActive
                    ]}
                    onPress={() => setSelectedMetric('Weight')}
                  >
                    <Ionicons 
                      name="barbell" 
                      size={18} 
                      color={selectedMetric === 'Weight' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.metricButtonText,
                      selectedMetric === 'Weight' && styles.metricButtonTextActive
                    ]}>
                      Weight
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.metricButton,
                      selectedMetric === 'Reps' && styles.metricButtonActive
                    ]}
                    onPress={() => setSelectedMetric('Reps')}
                  >
                    <Ionicons 
                      name="fitness" 
                      size={18} 
                      color={selectedMetric === 'Reps' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.metricButtonText,
                      selectedMetric === 'Reps' && styles.metricButtonTextActive
                    ]}>
                      Reps
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.metricButton,
                      selectedMetric === 'Time' && styles.metricButtonActive
                    ]}
                    onPress={() => setSelectedMetric('Time')}
                  >
                    <Ionicons 
                      name="time" 
                      size={18} 
                      color={selectedMetric === 'Time' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.metricButtonText,
                      selectedMetric === 'Time' && styles.metricButtonTextActive
                    ]}>
                      Time
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Line Chart */}
                {prepareLineChartData() && (
                  <View style={styles.lineChartContainer}>
                    <LineChart
                      data={prepareLineChartData()}
                      width={SCREEN_WIDTH - 64}
                      height={250}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(237, 42, 70, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '6',
                          strokeWidth: '2',
                          stroke: '#ED2A46'
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '', // solid lines
                          stroke: '#E0E0E0',
                          strokeWidth: 1,
                        },
                      }}
                      bezier
                      style={styles.lineChart}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      fromZero
                    />
                  </View>
                )}

                {/* Summary Stats for Selected Muscle */}
                {selectedMuscleGroup && muscleReport.muscleGroupActivities.find(m => m.muscleGroup === selectedMuscleGroup) && (
                  <View style={styles.muscleSummaryContainer}>
                    {(() => {
                      const muscleData = muscleReport.muscleGroupActivities.find(m => m.muscleGroup === selectedMuscleGroup);
                      return (
                        <>
                          <View style={styles.muscleSummaryRow}>
                            <View style={styles.muscleSummaryItem}>
                              <Text style={styles.muscleSummaryValue}>{muscleData.setsCompleted}/{muscleData.setsCount}</Text>
                              <Text style={styles.muscleSummaryLabel}>Sets Completed</Text>
                            </View>
                            <View style={styles.muscleSummaryItem}>
                              <Text style={[styles.muscleSummaryValue, { color: '#4CAF50' }]}>
                                {muscleData.totalWeight} kg
                              </Text>
                              <Text style={styles.muscleSummaryLabel}>Total Weight</Text>
                            </View>
                          </View>
                          <View style={styles.muscleSummaryRow}>
                            <View style={styles.muscleSummaryItem}>
                              <Text style={[styles.muscleSummaryValue, { color: '#2196F3' }]}>
                                {muscleData.totalReps}
                              </Text>
                              <Text style={styles.muscleSummaryLabel}>Total Reps</Text>
                            </View>
                            <View style={styles.muscleSummaryItem}>
                              <Text style={[styles.muscleSummaryValue, { color: '#FF9800' }]}>
                                {muscleData.averageWeightLifted?.toFixed(1)} kg
                              </Text>
                              <Text style={styles.muscleSummaryLabel}>Avg Weight</Text>
                            </View>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                )}
              </StatCard>
            )}

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

            {/* User Goals Progress */}
            {mockedUserGoals && mockedUserGoals.length > 0 && (
              <StatCard title={t('trainingResults.userGoals') || 'User Goals Progress'} icon="trending-up">
                <View style={styles.chartContainer}>
                  <StackedBarChart
                    data={prepareGoalsChartData()}
                    width={SCREEN_WIDTH - 64}
                    height={280}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero
                    showBarTops={false}
                    withInnerLines={true}
                    segments={5}
                  />
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
                      <Text style={styles.legendText}>{t('trainingResults.start') || 'Start'}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={styles.legendText}>{t('trainingResults.current') || 'Current'}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#ED2A46' }]} />
                      <Text style={styles.legendText}>{t('trainingResults.target') || 'Target'}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Detailed Goals Info */}
                <View style={styles.goalsDetailContainer}>
                  {mockedUserGoals.map((goal, index) => {
                    const muscleKey = goal.muscleGroup.toLowerCase();
                    const start = goal[`start${goal.muscleGroup}`] || 0;
                    const current = goal[`current${goal.muscleGroup}`] || 0;
                    const target = goal[`target${goal.muscleGroup}`] || 0;
                    const progressPercent = ((current - start) / (target - start) * 100)?.toFixed(1);
                    
                    return (
                      <View key={index} style={styles.goalDetailItem}>
                        <View style={styles.goalHeader}>
                          <Text style={styles.goalMuscleGroup}>{goal.muscleGroup}</Text>
                          <Text style={[
                            styles.goalProgress,
                            { color: progressPercent >= 100 ? '#4CAF50' : '#FF6B35' }
                          ]}>
                            {progressPercent}%
                          </Text>
                        </View>
                        <View style={styles.goalValues}>
                          <View style={styles.goalValue}>
                            <Text style={styles.goalValueLabel}>{t('trainingResults.start') || 'Start'}</Text>
                            <Text style={styles.goalValueNumber}>{start}</Text>
                          </View>
                          <View style={styles.goalValue}>
                            <Text style={styles.goalValueLabel}>{t('trainingResults.current') || 'Current'}</Text>
                            <Text style={[styles.goalValueNumber, { color: '#4CAF50' }]}>{current}</Text>
                          </View>
                          <View style={styles.goalValue}>
                            <Text style={styles.goalValueLabel}>{t('trainingResults.target') || 'Target'}</Text>
                            <Text style={[styles.goalValueNumber, { color: '#ED2A46' }]}>{target}</Text>
                          </View>
                        </View>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { width: `${Math.min(progressPercent, 100)}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </StatCard>
            )}
          </>
        )}

        {/* Detailed Statistics Tab */}
        {activeTab === 'details' && (
          <>
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
          </>
        )}

        {/* Muscle Group Dropdown Modal */}
        <Modal
          visible={showMuscleDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMuscleDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMuscleDropdown(false)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderTitle}>Select Muscle Group</Text>
                <TouchableOpacity onPress={() => setShowMuscleDropdown(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList}>
                {muscleReport?.muscleGroupActivities?.map((muscle, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedMuscleGroup === muscle.muscleGroup && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedMuscleGroup(muscle.muscleGroup);
                      setShowMuscleDropdown(false);
                    }}
                  >
                    {getMuscleGroupImage(muscle.muscleGroup) && (
                      <Image 
                        source={getMuscleGroupImage(muscle.muscleGroup)}
                        style={styles.dropdownItemImage}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={[
                      styles.dropdownItemText,
                      selectedMuscleGroup === muscle.muscleGroup && styles.dropdownItemTextSelected
                    ]}>
                      {muscle.muscleGroup}
                    </Text>
                    {selectedMuscleGroup === muscle.muscleGroup && (
                      <Ionicons name="checkmark" size={24} color="#ED2A46" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

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
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  goalsDetailContainer: {
    marginTop: 16,
    gap: 12,
  },
  goalDetailItem: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ED2A46',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalMuscleGroup: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
  },
  goalValue: {
    alignItems: 'center',
  },
  goalValueLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  goalValueNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  // Daily Progress Chart Styles
  chartControlsContainer: {
    marginBottom: 16,
  },
  chartControlLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  metricButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricButtonActive: {
    backgroundColor: '#ED2A46',
    borderColor: '#ED2A46',
  },
  metricButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  metricButtonTextActive: {
    color: '#fff',
  },
  lineChartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  lineChart: {
    borderRadius: 16,
  },
  muscleSummaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  muscleSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  muscleSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  muscleSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  muscleSummaryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF0F2',
  },
  dropdownItemImage: {
    width: 32,
    height: 32,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#ED2A46',
    fontWeight: '700',
  },
});

export default TrainingResultScreen;
