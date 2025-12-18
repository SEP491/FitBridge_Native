import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const muscleGroupImages = {
  Biceps: require('../../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../../assets/images/bodyparts/hip.png'),
  Shoulders: require('../../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../../assets/images/bodyparts/thigh.png'),
  AbsCore: require('../../../../assets/images/bodyparts/waist.png'),
  Back: require('../../../../assets/images/bodyparts/back.png'),
  Triceps: require('../../../../assets/images/bodyparts/triceps.png'),
  Glutes: require('../../../../assets/images/bodyparts/glutes.png'),
  FullBody: require('../../../../assets/images/bodyparts/fullbody.png'),
  Other: require('../../../../assets/images/bodyparts/other.png'),
  Thighs: require('../../../../assets/images/bodyparts/thigh.png'),
};

const getMuscleGroupImage = (muscleGroup) => {
  const normalized = muscleGroup?.replace(/\s+/g, '');
  return muscleGroupImages[normalized] || null;
};

export const MuscleGroupPerformance = ({ stats, t, StatCard, getMuscleGroupText }) => {
  return (
    <>
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
            <Text style={styles.muscleGroupName}>
              {getMuscleGroupText
                ? getMuscleGroupText(stats.mostTrainedMuscleGroup.muscleGroup)
                : stats.mostTrainedMuscleGroup.muscleGroup}
            </Text>
            <View style={styles.muscleGroupStats}>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>
                  {stats.mostTrainedMuscleGroup.setsCompleted}/{stats.mostTrainedMuscleGroup.setsCount}
                </Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.sets')}</Text>
              </View>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#FF6B35' }]}>{stats.mostTrainedMuscleGroup.totalWeight}</Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.weightKg')}</Text>
              </View>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>{stats.mostTrainedMuscleGroup.totalReps}</Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.reps')}</Text>
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
            <Text style={styles.muscleGroupName}>
              {getMuscleGroupText
                ? getMuscleGroupText(stats.leastTrainedMuscleGroup.muscleGroup)
                : stats.leastTrainedMuscleGroup.muscleGroup}
            </Text>
            <View style={styles.muscleGroupStats}>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>
                  {stats.leastTrainedMuscleGroup.setsCompleted}/{stats.leastTrainedMuscleGroup.setsCount}
                </Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.sets')}</Text>
              </View>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#FF6B35' }]}>{stats.leastTrainedMuscleGroup.totalWeight}</Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.weightKg')}</Text>
              </View>
              <View style={styles.muscleGroupStat}>
                <Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>{stats.leastTrainedMuscleGroup.totalReps}</Text>
                <Text style={styles.muscleGroupStatLabel}>{t('trainingResults.reps')}</Text>
              </View>
            </View>
          </View>
        </StatCard>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
});
