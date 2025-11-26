import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require("../../../../assets/images/bodyparts/biceps.png"),
  Calf: require("../../../../assets/images/bodyparts/calf.png"),
  Chest: require("../../../../assets/images/bodyparts/chest.png"),
  ForeArm: require("../../../../assets/images/bodyparts/foreArm.png"),
  Hip: require("../../../../assets/images/bodyparts/hip.png"),
  Shoulder: require("../../../../assets/images/bodyparts/shoulder.png"),
  Thigh: require("../../../../assets/images/bodyparts/thigh.png"),
  Waist: require("../../../../assets/images/bodyparts/waist.png"),
};

const BodyMeasurementHistoryModal = ({ visible, onClose, measurements, t }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("vi-VN", options);
  };

  const measurementFields = [
    {
      key: "height",
      label: t("userGoals.height", "Height"),
      unit: t("profile.units.cm", "cm"),
      image: null,
    },
    {
      key: "weight",
      label: t("userGoals.weight", "Weight"),
      unit: t("profile.units.kg", "kg"),
      image: null,
    },
    {
      key: "biceps",
      label: t("muscleGroups.biceps", "Biceps"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Biceps,
    },
    {
      key: "foreArm",
      label: t("muscleGroups.foreArm", "Forearm"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.ForeArm,
    },
    {
      key: "chest",
      label: t("muscleGroups.chest", "Chest"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Chest,
    },
    {
      key: "shoulder",
      label: t("muscleGroups.shoulder", "Shoulder"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Shoulder,
    },
    {
      key: "waist",
      label: t("muscleGroups.waist", "Waist"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Waist,
    },
    {
      key: "hip",
      label: t("muscleGroups.hip", "Hip"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Hip,
    },
    {
      key: "thigh",
      label: t("muscleGroups.thigh", "Thigh"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Thigh,
    },
    {
      key: "calf",
      label: t("muscleGroups.calf", "Calf"),
      unit: t("profile.units.cm", "cm"),
      image: muscleGroupImages.Calf,
    },
  ];

  const renderAccordionItem = (measurement, index) => {
    const isExpanded = expandedId === measurement.id;
    const isFirst = index === 0;

    return (
      <View key={measurement.id} style={styles.accordionItem}>
        <TouchableOpacity
          style={[styles.accordionHeader, isFirst && styles.accordionHeaderFirst]}
          onPress={() => toggleAccordion(measurement.id)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <View style={[styles.indexBadge, isFirst && styles.indexBadgeFirst]}>
              <Text style={[styles.indexText, isFirst && styles.indexTextFirst]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.accordionHeaderInfo}>
              <Text style={[styles.accordionDate, isFirst && styles.accordionDateFirst]}>
                {formatDate(measurement.createdAt)}
              </Text>
              {isFirst && (
                <View style={styles.latestBadge}>
                  <Text style={styles.latestBadgeText}>
                    {t("userGoals.latest", "Latest")}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={isFirst ? "#ED2A46" : "#666"}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionContent}>
            {/* Primary Stats */}
            <View style={styles.primaryStats}>
              <View style={styles.primaryStatCard}>
                <Ionicons name="resize-outline" size={24} color="#ED2A46" />
                <Text style={styles.primaryStatLabel}>
                  {t("userGoals.height", "Height")}
                </Text>
                <Text style={styles.primaryStatValue}>
                  {measurement.height || "-"}
                </Text>
                <Text style={styles.primaryStatUnit}>
                  {t("profile.units.cm", "cm")}
                </Text>
              </View>
              <View style={styles.primaryStatDivider} />
              <View style={styles.primaryStatCard}>
                <Ionicons name="speedometer-outline" size={24} color="#ED2A46" />
                <Text style={styles.primaryStatLabel}>
                  {t("userGoals.weight", "Weight")}
                </Text>
                <Text style={styles.primaryStatValue}>
                  {measurement.weight || "-"}
                </Text>
                <Text style={styles.primaryStatUnit}>
                  {t("profile.units.kg", "kg")}
                </Text>
              </View>
            </View>

            {/* Muscle Measurements Grid */}
            <View style={styles.measurementsGrid}>
              {measurementFields.map((field) => {
                // Skip height and weight as they're shown in primary stats
                if (field.key === "height" || field.key === "weight") return null;

                const value = measurement[field.key];
                if (value === null || value === undefined) return null;

                return (
                  <View key={field.key} style={styles.measurementCard}>
                    {field.image && (
                      <Image
                        source={field.image}
                        style={styles.measurementImage}
                        resizeMode="contain"
                      />
                    )}
                    <View style={styles.measurementInfo}>
                      <Text style={styles.measurementLabel}>{field.label}</Text>
                      <View style={styles.measurementValueContainer}>
                        <Text style={styles.measurementValue}>{value}</Text>
                        <Text style={styles.measurementUnit}>{field.unit}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Timestamp */}
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={14} color="#999" />
              <Text style={styles.timestampText}>
                {t("userGoals.recorded", "Recorded")} {formatDate(measurement.createdAt)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("bodyMeasurements.measurementHistory", "Measurement History")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {measurements.length > 0 ? (
              <View style={styles.accordionContainer}>
                {measurements.map((measurement, index) =>
                  renderAccordionItem(measurement, index)
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={64} color="#DDD" />
                <Text style={styles.emptyStateTitle}>
                  {t("userGoals.noMeasurements", "No Measurements Yet")}
                </Text>
                <Text style={styles.emptyStateDescription}>
                  {t(
                    "userGoals.addMeasurementsToTrack",
                    "Add body measurements to track your progress over time"
                  )}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  accordionContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  accordionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  accordionHeaderFirst: {
    backgroundColor: "#FFF0F2",
    borderBottomWidth: 2,
    borderBottomColor: "#ED2A46",
  },
  accordionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  indexBadgeFirst: {
    backgroundColor: "#ED2A46",
  },
  indexText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  indexTextFirst: {
    color: "#fff",
  },
  accordionHeaderInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accordionDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  accordionDateFirst: {
    color: "#ED2A46",
    fontSize: 15,
  },
  latestBadge: {
    backgroundColor: "#ED2A46",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  latestBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  accordionContent: {
    padding: 16,
    backgroundColor: "#fff",
  },
  primaryStats: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  primaryStatCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryStatDivider: {
    width: 2,
    height: 60,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  primaryStatLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  primaryStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ED2A46",
    marginBottom: 2,
  },
  primaryStatUnit: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  measurementCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  measurementImage: {
    width: 40,
    height: 40,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  measurementValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  measurementUnit: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default BodyMeasurementHistoryModal;
