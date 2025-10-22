import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DailyProgressChart = ({ 
  muscleReport, 
  selectedMuscleGroup, 
  selectedMetric, 
  setSelectedMetric,
  setShowMuscleDropdown,
  prepareLineChartData,
  StatCard 
}) => {
  if (!muscleReport?.muscleGroupActivities || muscleReport.muscleGroupActivities.length === 0) {
    return null;
  }

  return (
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
                strokeDasharray: '',
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
                {/* Row 1: Sets and Total Weight */}
                <View style={styles.muscleSummaryRow}>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={styles.muscleSummaryValue}>
                      {muscleData.setsCompleted}/{muscleData.setsCount}
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Sets Completed</Text>
                  </View>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#FF6B35' }]}>
                      {muscleData.totalWeight} kg
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Total Weight</Text>
                  </View>
                </View>

                {/* Row 2: Total Reps and Total Time */}
                <View style={styles.muscleSummaryRow}>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#2196F3' }]}>
                      {muscleData.totalReps}
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Total Reps</Text>
                  </View>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#9C27B0' }]}>
                      {muscleData.totalTime}s
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Total Time</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.summaryDivider} />

                {/* Row 3: Average Session Time and Average Weight */}
                <View style={styles.muscleSummaryRow}>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#00BCD4' }]}>
                      {muscleData.averageSessionTimeSeconds}s
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Avg Session Time</Text>
                  </View>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#4CAF50' }]}>
                      {muscleData.averageWeightLiftedPerSession?.toFixed(1)} kg
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Avg Weight/Session</Text>
                  </View>
                </View>

                {/* Row 4: Average Sets and Average Reps */}
                <View style={styles.muscleSummaryRow}>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#FF9800' }]}>
                      {muscleData.averageSetsPerSession?.toFixed(1)}
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Avg Sets/Session</Text>
                  </View>
                  <View style={styles.muscleSummaryItem}>
                    <Text style={[styles.muscleSummaryValue, { color: '#E91E63' }]}>
                      {muscleData.averageRepsPerSession?.toFixed(1)}
                    </Text>
                    <Text style={styles.muscleSummaryLabel}>Avg Reps/Session</Text>
                  </View>
                </View>
              </>
            );
          })()}
        </View>
      )}
    </StatCard>
  );
};

const styles = StyleSheet.create({
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
});
