import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFitnessContext } from "../../context/FitnessContext";
import { useTranslation } from "../../hooks/useTranslation";
import LoadingIndicator from "../LoadingIndicator";
import { useNavigation } from "@react-navigation/native";

const FitnessSummary = () => {
  const { fitnessData, isLoading, error, stepGoalProgress } =
    useFitnessContext();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleViewDetails = () => {
    navigation.navigate("FitnessDetail");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.sectionTitle}>
              {t("fitness.todaysActivity")}
            </Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>
        <LoadingIndicator
          variant="page"
          message={t("fitness.loadingFitnessData")}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.sectionTitle}>
              {t("fitness.todaysActivity")}
            </Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>
            {t("fitness.unableToLoadFitnessData")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title Section with HomeScreen Style */}
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>{t("fitness.todaysActivity")}</Text>
          <View style={styles.titleUnderline} />
        </View>
        <TouchableOpacity
          onPress={handleViewDetails}
          style={styles.viewMoreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>{t("fitness.viewDetails")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {/* Steps Card */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="walk-outline" size={24} color="#34C759" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>
              {fitnessData.steps.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{t("fitness.steps")}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stepGoalProgress.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {stepGoalProgress.progress}%
            </Text>
          </View>
        </View>

        {/* Distance Card */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="location-outline" size={24} color="#FF9500" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>
              {fitnessData.distance.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>{t("fitness.km")}</Text>
          </View>
          <Text style={styles.statSubtext}>{t("fitness.distance")}</Text>
        </View>

        {/* Calories Card */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame-outline" size={24} color="#FF3B30" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{fitnessData.calories}</Text>
            <Text style={styles.statLabel}>{t("fitness.kcal")}</Text>
          </View>
          <Text style={styles.statSubtext}>{t("fitness.calories")}</Text>
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusCard}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: fitnessData.isTracking ? "#34C759" : "#FF9500",
              },
            ]}
          />
          <Text style={styles.statusText}>
            {fitnessData.isTracking
              ? t("fitness.trackingActive")
              : t("fitness.trackingPaused")}
          </Text>
        </View>

        {/* Motion & Fitness Attribution - iOS Only */}
        {Platform.OS === "ios" && (
          <View style={styles.healthKitAttributionContainer}>
            <Ionicons name="walk-outline" size={14} color="#34C759" />
            <Text style={styles.healthKitAttributionText}>
              {t("fitness.poweredByMotionFitness")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 15,
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  titleWithIcon: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ED2A46",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#ED2A46",
    marginTop: 4,
    borderRadius: 2,
  },
  viewMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMoreText: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    minHeight: 90,
    justifyContent: "center",
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statInfo: {
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statSubtext: {
    fontSize: 10,
    color: "#8E8E93",
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  healthKitAttributionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  healthKitAttributionText: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "400",
    marginLeft: 6,
  },
  loadingContainer: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE6E6",
    borderStyle: "dashed",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 12,
  },
});

export default FitnessSummary;
