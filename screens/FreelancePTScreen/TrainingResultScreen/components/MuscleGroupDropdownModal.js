import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

export const MuscleGroupDropdownModal = ({
  visible,
  onClose,
  muscleReport,
  selectedMuscleGroup,
  onSelectMuscle,
  t,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderTitle}>
              {t("trainingResults.selectMuscleGroup", "Select Muscle Group")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dropdownList}>
            {muscleReport?.muscleGroupActivities?.map((muscle, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedMuscleGroup === muscle.muscleGroup &&
                    styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onSelectMuscle(muscle.muscleGroup);
                  onClose();
                }}
              >
                {getMuscleGroupImage(muscle.muscleGroup) && (
                  <Image
                    source={getMuscleGroupImage(muscle.muscleGroup)}
                    style={styles.dropdownItemImage}
                    resizeMode="contain"
                  />
                )}
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedMuscleGroup === muscle.muscleGroup &&
                      styles.dropdownItemTextSelected,
                  ]}
                >
                  {muscle.muscleGroup}
                </Text>
                {selectedMuscleGroup === muscle.muscleGroup && (
                  <Ionicons name="checkmark" size={24} color="#ED2A46" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  dropdownItemSelected: {
    backgroundColor: "#FFF0F2",
  },
  dropdownItemImage: {
    width: 32,
    height: 32,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: "#ED2A46",
    fontWeight: "700",
  },
});
