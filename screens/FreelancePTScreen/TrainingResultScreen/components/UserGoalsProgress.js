import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const UserGoalsProgress = ({ mockedUserGoals, prepareGoalsChartData, chartConfig, t, StatCard, stats }) => {
  const userGoals = stats?.userGoals;
  console.log("Rendering UserGoalsProgress with userGoals:", userGoals);
  
  if (!userGoals) {
    return null;
  }

  // Define muscle groups to display
  const muscleGroups = [
    { key: 'Biceps', label: t('muscleGroups.biceps', 'Biceps') },
    { key: 'ForeArm', label: t('muscleGroups.foreArm', 'Forearm') },
    { key: 'Thigh', label: t('muscleGroups.thigh', 'Thigh') },
    { key: 'Calf', label: t('muscleGroups.calf', 'Calf') },
    { key: 'Chest', label: t('muscleGroups.chest', 'Chest') },
    { key: 'Waist', label: t('muscleGroups.waist', 'Waist') },
    { key: 'Hip', label: t('muscleGroups.hip', 'Hip') },
    { key: 'Shoulder', label: t('muscleGroups.shoulder', 'Shoulder') },
    { key: 'Weight', label: t('muscleGroups.weight', 'Weight') },
  ];

  return (
    <StatCard title={t('trainingResults.userGoalsProgress', 'User Goals Progress')} icon="trending-up">
      {/* Detailed Goals Info */}
      <View style={styles.goalsDetailContainer}>
        {muscleGroups.map((group, index) => {
          const start = userGoals[`start${group.key}`];
          const current = userGoals[`current${group.key}`];
          const target = userGoals[`target${group.key}`];
          
          // Skip if no target is set or start is missing
          if (!target || start === null || start === undefined) return null;
          
          // Use start value if current is null
          const currentValue = current !== null ? current : start;
          
          // Calculate progress percentage based on goal direction
          let progressPercent = 0;
          
          if (target === start) {
            // If target equals start, progress is 100%
            progressPercent = 100;
          } else if (target > start) {
            // Goal is to increase (e.g., muscle gain)
            const totalChange = target - start;
            const currentChange = currentValue - start;
            progressPercent = (currentChange / totalChange) * 100;
          } else {
            // Goal is to decrease (e.g., weight loss, waist reduction)
            const totalChange = start - target;
            const currentChange = start - currentValue;
            progressPercent = (currentChange / totalChange) * 100;
          }
          
          // Clamp progress between 0 and 200 (allow showing over-achievement)
          progressPercent = Math.max(0, Math.min(progressPercent, 200));
          
          return (
            <View key={index} style={styles.goalDetailItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalMuscleGroup}>{group.label}</Text>
                <Text style={[
                  styles.goalProgress,
                  { color: progressPercent >= 100 ? '#4CAF50' : progressPercent >= 50 ? '#FF9800' : '#FF6B35' }
                ]}>
                  {progressPercent.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.goalValues}>
                <View style={styles.goalValue}>
                  <Text style={styles.goalValueLabel}>{t('userGoals.start', 'Start')}</Text>
                  <Text style={styles.goalValueNumber}>{start || 0}</Text>
                </View>
                <View style={styles.goalValue}>
                  <Text style={styles.goalValueLabel}>{t('userGoals.current', 'Current')}</Text>
                  <Text style={[styles.goalValueNumber, { color: '#4CAF50' }]}>
                    {currentValue || start || 0}
                  </Text>
                </View>
                <View style={styles.goalValue}>
                  <Text style={styles.goalValueLabel}>{t('userGoals.target', 'Target')}</Text>
                  <Text style={[styles.goalValueNumber, { color: '#ED2A46' }]}>{target}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    </StatCard>
  );
};

const styles = StyleSheet.create({
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
});
