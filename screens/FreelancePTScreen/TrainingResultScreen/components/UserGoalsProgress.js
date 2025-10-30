import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserGoalService from '../../../../services/user-goalService';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require('../../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../../assets/images/bodyparts/hip.png'),
  Shoulder: require('../../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../../assets/images/bodyparts/thigh.png'),
  Waist: require('../../../../assets/images/bodyparts/waist.png'),
  Back: require('../../../../assets/images/bodyparts/back.png'),
  Triceps: require('../../../../assets/images/bodyparts/triceps.png'),
  Glutes: require('../../../../assets/images/bodyparts/glutes.png'),
  FullBody: require('../../../../assets/images/bodyparts/fullbody.png'),
  Other: require('../../../../assets/images/bodyparts/other.png'),
};

export const UserGoalsProgress = ({ t, StatCard, stats, customerPurchasedId, onCreateGoal }) => {
   const [userGoals, setUserGoals] = React.useState(null);



  const fetchUserGoals = async () => {
    try {
      if (!customerPurchasedId) return;
      const response = await UserGoalService.getUserGoals(customerPurchasedId);
      if (response?.status === '200' || response?.status === 200) {
        setUserGoals(response.data);
      }
    } catch (error) {
      console.error("Error fetching user goals:", error);
    }
  };

    
   React.useEffect(() => {
    fetchUserGoals();
   }, [customerPurchasedId]);
  
  if (!userGoals) {
    return (
      <>
        <StatCard title={t('trainingResults.userGoalsProgress', 'User Goals Progress')} icon="trending-up">
          <View style={styles.emptyStateContainer}>
            <Ionicons name="flag-outline" size={48} color="#ED2A46" />
            <Text style={styles.emptyStateTitle}>
              {t('userGoals.noGoalsSet', 'No Goals Set')}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {t('userGoals.createGoalToTrack', 'Create goals to track your fitness progress')}
            </Text>
            {onCreateGoal && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={onCreateGoal}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>
                  {t('userGoals.createGoal', 'Create Goal')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </StatCard>
      </>
    );
  }

  // Define muscle groups to display
  const muscleGroups = [
    { key: 'Triceps', label: t('muscleGroups.triceps', 'Triceps') },
    { key: 'Biceps', label: t('muscleGroups.biceps', 'Biceps') },
    { key: 'ForeArm', label: t('muscleGroups.foreArm', 'Forearm') },
    { key: 'Chest', label: t('muscleGroups.chest', 'Chest') },
    { key: 'FullBody', label: t('muscleGroups.fullBody', 'Full Body') },
    { key: 'Back', label: t('muscleGroups.back', 'Back') },
    { key: 'Shoulder', label: t('muscleGroups.shoulder', 'Shoulder') },
    { key: 'Waist', label: t('muscleGroups.waist', 'Waist') },
    { key: 'Hip', label: t('muscleGroups.hip', 'Hip') },
    { key: 'Thigh', label: t('muscleGroups.thigh', 'Thigh') },
    { key: 'Calf', label: t('muscleGroups.calf', 'Calf') },
    { key: 'Glutes', label: t('muscleGroups.glutes', 'Glutes') },
    { key: 'Weight', label: t('muscleGroups.weight', 'Weight') },
  ];

  return (
    <>
      <StatCard title={t('trainingResults.currentUserStats', 'Current User Stats')} icon="body">
      <View style={styles.currentStatsContainer}>        
        {/* Main Stats Row - Height and Weight */}
        <View style={styles.mainStatsRow}>
          <View style={styles.mainStatCard}>
            <Text style={styles.mainStatLabel}>{t('userGoals.height', 'Height')}</Text>
            <Text style={styles.mainStatValue}>
              {userGoals?.currentHeight || userGoals?.startHeight || '-'}
            </Text>
            <Text style={styles.mainStatUnit}>cm</Text>
          </View>
          <View style={styles.mainStatDivider} />
          <View style={styles.mainStatCard}>
            <Text style={styles.mainStatLabel}>{t('userGoals.weight', 'Weight')}</Text>
            <Text style={styles.mainStatValue}>
              {userGoals?.currentWeight || userGoals?.startWeight || '-'}
            </Text>
            <Text style={styles.mainStatUnit}>kg</Text>
          </View>
        </View>
        
        {/* Muscle Stats Grid */}
        <View style={styles.muscleStatsGrid}>
          {muscleGroups.map((group, index) => {
            // Skip Height and Weight as they are displayed in the main stats row
            if (group.key === 'Weight') return null;
            
            const current = userGoals[`current${group.key}`];
            const start = userGoals[`start${group.key}`];
            
            // Skip if no current value
            if (current === null && start === null) return null;
            
            const displayValue = current !== null ? current : start;
            const muscleImage = muscleGroupImages[group.key];
            
            return (
              <View key={index} style={styles.muscleStatCard}>
                {muscleImage && (
                  <Image 
                    source={muscleImage}
                    style={styles.muscleStatImage}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.muscleStatLabel}>{group.label}</Text>
                <Text style={styles.muscleStatValue}>{displayValue || 0}</Text>
              </View>
            );
          })}
        </View>
      </View>
      </StatCard>

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
    </>
    
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
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
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
  currentStatsContainer: {
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  currentStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  mainStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ED2A46',
  },
  mainStatCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainStatDivider: {
    width: 2,
    height: 60,
    backgroundColor: '#ED2A46',
    marginHorizontal: 16,
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ED2A46',
    marginBottom: 4,
  },
  mainStatUnit: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  muscleStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  muscleStatCard: {
    width: '31%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  muscleStatImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  muscleStatLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  muscleStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED2A46',
  },
  emptyStateContainer: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ED2A46',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
