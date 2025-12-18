import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const muscleGroupImages = {
  Biceps: require("../../../../assets/images/bodyparts/biceps.png"),
  Calf: require("../../../../assets/images/bodyparts/calf.png"),
  Chest: require("../../../../assets/images/bodyparts/chest.png"),
  ForeArm: require("../../../../assets/images/bodyparts/foreArm.png"),
  Hip: require("../../../../assets/images/bodyparts/hip.png"),
  Shoulders: require("../../../../assets/images/bodyparts/shoulder.png"),
  Thigh: require("../../../../assets/images/bodyparts/thigh.png"),
  AbsCore: require("../../../../assets/images/bodyparts/waist.png"),
  Back: require("../../../../assets/images/bodyparts/back.png"),
  Triceps: require("../../../../assets/images/bodyparts/triceps.png"),
  Glutes: require("../../../../assets/images/bodyparts/glutes.png"),
  FullBody: require("../../../../assets/images/bodyparts/fullbody.png"),
  Other: require("../../../../assets/images/bodyparts/other.png"),
  Thighs: require("../../../../assets/images/bodyparts/thigh.png"),
};

const getMuscleGroupImage = (muscleGroup) => {
  const normalized = muscleGroup?.replace(/\s+/g, "");
  return muscleGroupImages[normalized] || null;
};

export const MuscleGroupBreakdown = ({ stats, t, StatCard, getMuscleGroupText }) => {
  if (!stats.muscleGroupBreakdown || stats.muscleGroupBreakdown.length === 0) {
    return null;
  }

  return (
    <StatCard title={t("trainingResults.muscleGroupBreakdown")} icon="body">
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
            <Text style={styles.muscleBreakdownName}>
              {getMuscleGroupText
                ? getMuscleGroupText(muscle.muscleGroup)
                : muscle.muscleGroup}
            </Text>
          </View>
          <View style={styles.muscleBreakdownStats}>
            <View style={styles.muscleBreakdownStat}>
              <Text style={styles.muscleBreakdownLabel}>
                {t("trainingResults.sets")}
              </Text>
              <Text style={[styles.muscleBreakdownValue, { color: "#2196F3" }]}>
                {muscle.setsCompleted}/{muscle.setsCount}
              </Text>
            </View>
            <View style={styles.muscleBreakdownStat}>
              <Text style={styles.muscleBreakdownLabel}>
                {t("trainingResults.weightKg")}
              </Text>
              <Text style={[styles.muscleBreakdownValue, { color: "#FF6B35" }]}>
                {muscle.totalWeight}
              </Text>
            </View>
            <View style={styles.muscleBreakdownStat}>
              <Text style={styles.muscleBreakdownLabel}>
                {t("trainingResults.reps")}
              </Text>
              <Text style={[styles.muscleBreakdownValue, { color: "#4CAF50" }]}>
                {muscle.totalReps}
              </Text>
            </View>
            <View style={styles.muscleBreakdownStat}>
              <Text style={styles.muscleBreakdownLabel}>
                {t("trainingResults.time", "Time (s)")}
              </Text>
              <Text style={[styles.muscleBreakdownValue, { color: "#9C27B0" }]}>
                {muscle.totalTime}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </StatCard>
  );
};

const styles = StyleSheet.create({
  muscleBreakdownItem: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  muscleBreakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  muscleBreakdownImage: {
    width: 40,
    height: 40,
  },
  muscleBreakdownName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  muscleBreakdownStats: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  muscleBreakdownStat: {
    alignItems: "center",
  },
  muscleBreakdownLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  muscleBreakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
});
