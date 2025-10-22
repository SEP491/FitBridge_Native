import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const UserGoalsProgress = ({ mockedUserGoals, prepareGoalsChartData, chartConfig, t, StatCard }) => {
  if (!mockedUserGoals || mockedUserGoals.length === 0) {
    return null;
  }

  return (
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
