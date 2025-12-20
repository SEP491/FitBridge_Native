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

const hasNonZeroStats = (m) => {
  if (!m) return false;
  return (
    (m.totalTime || 0) > 0 ||
    (m.setsCompleted || 0) > 0 ||
    (m.totalWeight || 0) > 0 ||
    (m.totalReps || 0) > 0
  );
};


export const MuscleGroupPerformance = ({
  stats,
  t,
  StatCard,
  getMuscleGroupText,
}) => {

  const MuscleCard = ({ title, muscle, t, getMuscleGroupText }) => {
    if (!muscle) return null;
    const image = getMuscleGroupImage(muscle.muscleGroup);
    const name = getMuscleGroupText
      ? getMuscleGroupText(muscle.muscleGroup)
      : muscle.muscleGroup;

    const metrics = [
      {
        key: 'sets',
        value: `${muscle.setsCompleted}/${muscle.setsCount}`,
        label: t('trainingResults.sets'),
        color: '#2196F3',
      },
      {
        key: 'weight',
        value: muscle.totalWeight,
        label: t('trainingResults.weightKg'),
        color: '#FF6B35',
      },
      {
        key: 'reps',
        value: muscle.totalReps,
        label: t('trainingResults.reps'),
        color: '#4CAF50',
      },
      {
        key: 'time',
        value: muscle.totalTime,
        label: t('trainingResults.time'),
        color: '#9C27B0',
      },
    ];

    // Chunk metrics into rows of 3
    const rows = [];
    for (let i = 0; i < metrics.length; i += 2) {
      rows.push(metrics.slice(i, i + 2));
    }

    return (
      <StatCard title={title} icon="body">
        <View style={styles.muscleGroupCard}>
          {image && (
            <Image
              source={image}
              style={styles.muscleGroupImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.muscleGroupName}>{name}</Text>
          <View style={styles.muscleGroupStats}>
            {rows.map((row, rowIndex) => (
              <View
                key={`row-${rowIndex}`}
                style={styles.muscleGroupStatsRow}
              >
                {row.map((metric) => (
                  <View
                    key={metric.key}
                    style={styles.muscleGroupStat}
                  >
                    <Text
                      style={[
                        styles.muscleGroupStatValue,
                        { color: metric.color },
                      ]}
                    >
                      {metric.value}
                    </Text>
                    <Text style={styles.muscleGroupStatLabel}>
                      {metric.label}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </StatCard>
    );
  };
  
  // Try to get a list of muscle stats from possible keys
  const listKeys = ['muscleGroupStats', 'muscleGroups', 'muscleGroupDetails'];
  let muscleList = [];
  for (const key of listKeys) {
    if (Array.isArray(stats?.[key]) && stats[key].length > 0) {
      muscleList = stats[key];
      break;
    }
  }

  let itemsToRender = [];

  if (muscleList.length > 0) {
    // Filter out zero-only stats and sort by setsCompleted desc
    const nonZero = muscleList.filter(hasNonZeroStats);
    const sorted = nonZero.sort(
      (a, b) => (b.setsCompleted || 0) - (a.setsCompleted || 0)
    );
    itemsToRender = sorted.slice(0, 3);
  } else {
    // Fallback to most/least trained fields
    const candidates = [];
    if (hasNonZeroStats(stats.mostTrainedMuscleGroup)) {
      candidates.push({
        muscle: stats.mostTrainedMuscleGroup,
        title: t('trainingResults.mostTrainedMuscleGroup'),
      });
    }
    if (
      hasNonZeroStats(stats.leastTrainedMuscleGroup) &&
      stats.leastTrainedMuscleGroup?.muscleGroup !==
        stats.mostTrainedMuscleGroup?.muscleGroup
    ) {
      candidates.push({
        muscle: stats.leastTrainedMuscleGroup,
        title: t('trainingResults.leastTrainedMuscleGroup'),
      });
    }
    itemsToRender = candidates.map((c) => c.muscle);
  }

  if (!itemsToRender.length) return null;

  return (
    <>
      {itemsToRender.map((muscle, index) => {
        // Choose titles for top 3 when coming from list
        const defaultTitles = [
          t('trainingResults.topMuscle1', 'Top Muscle Group'),
          t('trainingResults.topMuscle2', 'Second Muscle Group'),
          t('trainingResults.topMuscle3', 'Third Muscle Group'),
        ];
        const title =
          muscleList.length > 0
            ? defaultTitles[index] || defaultTitles[0]
            : index === 0
            ? t('trainingResults.mostTrainedMuscleGroup')
            : t('trainingResults.leastTrainedMuscleGroup');

        return (
          <MuscleCard
            key={`${muscle.muscleGroup || 'muscle'}-${index}`}
            title={title}
            muscle={muscle}
            t={t}
            getMuscleGroupText={getMuscleGroupText}
          />
        );
      })}
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
    width: '100%',
  },
  muscleGroupStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    flex: 1,
    marginHorizontal: 4,
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
