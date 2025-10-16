import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import bookingService from "../../../services/bookingService";
import { fetchUserFromStorage } from "../../../lib";

const ACTIVITY_TYPES = {
  WarmUp: { name: "Aerobic / Cardio", color: "#FFB6C1", icon: "bicycle" },
  Workout: { name: "Strength Training", color: "#98FB98", icon: "barbell" },
};

const MUSCLE_GROUPS = {
  Biceps: { name: "Biceps", icon: "💪", color: "#FF6B6B" },
  ForeArm: { name: "Forearm", icon: "🔴", color: "#4ECDC4" },
  Thigh: { name: "Thigh", icon: "🦵", color: "#45B7D1" },
  Calf: { name: "Calf", icon: "👟", color: "#96CEB4" },
  Chest: { name: "Chest", icon: "💪", color: "#FFEAA7" },
  Waist: { name: "Waist", icon: "⭕", color: "#DFE6E9" },
};

export default function SessionActivityDetailScreen({ route, navigation }) {
  const { activityId } = route.params;
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [newSet, setNewSet] = useState({
    weightLifted: "",
    numOfReps: "",
  });

  useEffect(() => {
    loadUserRole();
    fetchActivityDetail();
  }, [activityId]);

  const loadUserRole = async () => {
    try {
      const user = await fetchUserFromStorage();
      setUserRole(user?.role);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getSessionActivityDetail(
        activityId
      );
      console.log("Activity Detail Response:", response.data);
      if (response?.data) {
        setActivityData(response.data);
      }
    } catch (error) {
      console.error("Error fetching activity detail:", error);
      Alert.alert("Error", "Failed to load activity details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = async () => {
    // Validate inputs
    if (!newSet.weightLifted || !newSet.numOfReps) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    try {
      const payload = {
        sessionActivityId: activityId,
        weightLifted: parseFloat(newSet.weightLifted),
        numOfReps: parseInt(newSet.numOfReps),
      };

      await bookingService.addActivitySet(payload);

      Alert.alert("Success", "Set added successfully");
      setShowAddSetModal(false);
      setNewSet({ weightLifted: "", numOfReps: "" });

      // Refresh activity data
      fetchActivityDetail();
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert("Error", "Failed to add set");
    }
  };

  const resetModal = () => {
    setNewSet({ weightLifted: "", numOfReps: "" });
    setShowAddSetModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!activityData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#94A3B8" />
        <Text style={styles.emptyText}>Activity not found</Text>
      </View>
    );
  }

  const activityType = ACTIVITY_TYPES[activityData.activityType];
  const isRepsType = activityData.activitySetType === "Reps";

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View
          style={[
            styles.activityTypeIcon,
            { backgroundColor: activityType?.color || "#E2E8F0" },
          ]}
        >
          <Ionicons
            name={activityType?.icon || "fitness"}
            size={28}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.activityName}>{activityData.activityName}</Text>
          <Text style={styles.activityType}>{activityType?.name}</Text>
        </View>
      </View>

      {/* Activity Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={22} color="#F97316" />
          <Text style={styles.sectionTitle}>Activity Information</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Set Type:</Text>
            <View style={styles.setTypeBadge}>
              <Ionicons
                name={isRepsType ? "repeat" : "time"}
                size={16}
                color="#F97316"
              />
              <Text style={styles.setTypeText}>
                {activityData.activitySetType}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Sets:</Text>
            <Text style={styles.infoValue}>
              {activityData.activitySets?.length || 0} sets
            </Text>
          </View>
        </View>
      </View>

      {/* Muscle Groups */}
      {activityData.muscleGroups && activityData.muscleGroups.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body" size={22} color="#F97316" />
            <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
          </View>

          <View style={styles.muscleGrid}>
            {activityData.muscleGroups.map((muscleKey, index) => {
              const muscle = MUSCLE_GROUPS[muscleKey];
              return (
                <View key={index} style={styles.muscleChip}>
                  <Text style={styles.muscleEmoji}>{muscle?.icon}</Text>
                  <Text style={styles.muscleName}>
                    {muscle?.name || muscleKey}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Activity Sets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={22} color="#F97316" />
          <Text style={styles.sectionTitle}>Sets Details</Text>
        </View>

        {activityData.activitySets && activityData.activitySets.length > 0 ? (
          activityData.activitySets.map((set, index) => (
            <View key={set.id} style={styles.setCard}>
              <View style={styles.setHeader}>
                <Text style={styles.setNumber}>Set {index + 1}</Text>
                {set.isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10B981"
                    />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>

              <View style={styles.setDetailsGrid}>
                {isRepsType ? (
                  <>
                    <View style={styles.setDetailItem}>
                      <Ionicons name="repeat" size={20} color="#64748B" />
                      <Text style={styles.setDetailLabel}>Planned Reps</Text>
                      <Text style={styles.setDetailValue}>
                        {set.plannedNumOfReps}
                      </Text>
                    </View>
                    <View style={styles.setDetailItem}>
                      <Ionicons
                        name="checkmark-done"
                        size={20}
                        color="#64748B"
                      />
                      <Text style={styles.setDetailLabel}>Actual Reps</Text>
                      <Text style={styles.setDetailValue}>
                        {set.numOfReps || 0}
                      </Text>
                    </View>
                    <View style={styles.setDetailItem}>
                      <Ionicons name="barbell" size={20} color="#64748B" />
                      <Text style={styles.setDetailLabel}>Weight</Text>
                      <Text style={styles.setDetailValue}>
                        {set.weightLifted} kg
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.setDetailItem}>
                      <Ionicons name="time" size={20} color="#64748B" />
                      <Text style={styles.setDetailLabel}>Planned Time</Text>
                      <Text style={styles.setDetailValue}>
                        {set.plannedPracticeTime}s
                      </Text>
                    </View>
                    <View style={styles.setDetailItem}>
                      <Ionicons
                        name="checkmark-done"
                        size={20}
                        color="#64748B"
                      />
                      <Text style={styles.setDetailLabel}>Actual Time</Text>
                      <Text style={styles.setDetailValue}>
                        {set.practiceTime || 0}s
                      </Text>
                    </View>
                  </>
                )}
                <View style={styles.setDetailItem}>
                  <Ionicons name="pause-circle" size={20} color="#64748B" />
                  <Text style={styles.setDetailLabel}>Rest Time</Text>
                  <Text style={styles.setDetailValue}>
                    {set.restTime || 0}s
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySetContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptySetText}>No sets available</Text>
          </View>
        )}

        {/* Add Set Button - Only for FreelancePT */}
        {userRole === "FreelancePT" && (
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => setShowAddSetModal(true)}
          >
            <Ionicons name="add-circle" size={24} color="#F97316" />
            <Text style={styles.addSetButtonText}>Add New Set</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Set Modal */}
      <Modal
        visible={showAddSetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={resetModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Set</Text>
                <TouchableOpacity onPress={resetModal}>
                  <Ionicons name="close-circle" size={28} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <ScrollView style={styles.modalForm}>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Weight Lifted (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter weight in kg"
                    keyboardType="numeric"
                    value={newSet.weightLifted}
                    onChangeText={(text) =>
                      setNewSet({ ...newSet, weightLifted: text })
                    }
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Number of Reps *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter number of reps"
                    keyboardType="numeric"
                    value={newSet.numOfReps}
                    onChangeText={(text) =>
                      setNewSet({ ...newSet, numOfReps: text })
                    }
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={resetModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddSet}
                >
                  <Text style={styles.saveButtonText}>Add Set</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#94A3B8",
    fontWeight: "600",
  },

  // Header Card
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  activityTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  activityType: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "700",
  },
  setTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3E2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  setTypeText: {
    fontSize: 14,
    color: "#F97316",
    fontWeight: "700",
  },

  // Muscle Groups
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  muscleEmoji: {
    fontSize: 20,
  },
  muscleName: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },

  // Set Cards
  setCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#F1F5F9",
  },
  setNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F97316",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "700",
  },
  setDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  setDetailItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  setDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  setDetailValue: {
    fontSize: 18,
    color: "#1E293B",
    fontWeight: "700",
  },

  // Empty State
  emptySetContainer: {
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptySetText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "600",
  },

  // Add Set Button
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3E2",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: "#FB923C",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F97316",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "70%",
    paddingBottom: 20,
    borderTopWidth: 3,
    borderTopColor: "#FB923C",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F97316",
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  saveButton: {
    backgroundColor: "#F97316",
    borderWidth: 1.5,
    borderColor: "#EA580C",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
