import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GymListBottomSheet = ({
  visible,
  onClose,
  gyms,
  searchRadius,
  onGymPress,
}) => {
  const renderGymItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gymItem}
      onPress={() => {
        onGymPress(item);
        onClose();
      }}
    >
      <View style={styles.gymItemContent}>
        <View style={styles.gymItemLeft}>
          <Text style={styles.gymItemName}>{item.gymName}</Text>
          <Text style={styles.gymItemAddress}>{item.address}</Text>
        </View>
        <View style={styles.gymItemRight}>
          <Text style={styles.gymItemDistance}>
            {item.distance?.toFixed(1)} km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Phòng tập gần đây ({gyms.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {gyms.length === 0 ? (
            <View style={styles.noGymsMessage}>
              <Text style={styles.noGymsText}>
                Không tìm thấy phòng tập nào trong phạm vi {searchRadius} km
              </Text>
            </View>
          ) : (
            <FlatList
              data={gyms}
              renderItem={renderGymItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.gymList}
              contentContainerStyle={styles.gymListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: "55%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  gymList: {
    flex: 1,
  },
  gymListContent: {
    paddingBottom: 20,
  },
  gymItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gymItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gymItemLeft: {
    flex: 1,
  },
  gymItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  gymItemAddress: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  gymItemRight: {
    alignItems: "flex-end",
  },
  gymItemDistance: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
  noGymsMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noGymsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default GymListBottomSheet;
