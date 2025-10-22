import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../constants/color";
import bookingService from "../../../services/bookingService";

export default function EditActivitySetScreen({ route, navigation }) {
  const { set: initialSet, activitySetType } = route.params;

  const [weightLifted, setWeightLifted] = useState(
    String(initialSet?.weightLifted ?? 0)
  );
  const [plannedNumOfReps, setPlannedNumOfReps] = useState(
    String(initialSet?.plannedNumOfReps ?? 0)
  );
  const [plannedPracticeTime, setPlannedPracticeTime] = useState(
    String(initialSet?.plannedPracticeTime ?? 0)
  );
  const [plannedDistance, setPlannedDistance] = useState(
    String(initialSet?.plannedDistance ?? 0)
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        activitySetId: initialSet.id,
        weightLifted:
          activitySetType === "Distance" ? 0 : Number(weightLifted) || 0,
        plannedNumOfReps:
          activitySetType === "Reps" ? Number(plannedNumOfReps) || 0 : 0,
        plannedPracticeTime:
          activitySetType === "Time" ? Number(plannedPracticeTime) || 0 : 0,
        plannedDistance:
          activitySetType === "Distance" ? Number(plannedDistance) || 0 : 0,
      };
      await bookingService.updateActivitySetPlan(payload);
      Alert.alert("Thành công", "Đã lưu set");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving set:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể lưu set");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Xóa set", "Bạn có chắc muốn xóa set này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: confirmDelete },
    ]);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await bookingService.deleteActivitySet(initialSet.id);
      Alert.alert("Thành công", "Đã xóa set");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting set:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể xóa set");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {activitySetType !== "Distance" && (
          <View style={styles.row}>
            <Text style={styles.label}>Tạ (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weightLifted}
              onChangeText={(v) => setWeightLifted(v.replace(/[^0-9]/g, ""))}
            />
          </View>
        )}

        {activitySetType === "Reps" && (
          <View style={styles.row}>
            <Text style={styles.label}>Số lần lặp (kế hoạch)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={plannedNumOfReps}
              onChangeText={(v) =>
                setPlannedNumOfReps(v.replace(/[^0-9]/g, ""))
              }
            />
          </View>
        )}

        {activitySetType === "Time" && (
          <View style={styles.row}>
            <Text style={styles.label}>Thời gian (giây)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={plannedPracticeTime}
              onChangeText={(v) =>
                setPlannedPracticeTime(v.replace(/[^0-9]/g, ""))
              }
            />
          </View>
        )}

        {activitySetType === "Distance" && (
          <View style={styles.row}>
            <Text style={styles.label}>Quãng đường (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={plannedDistance}
              onChangeText={(v) => setPlannedDistance(v.replace(/[^0-9]/g, ""))}
            />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.delete]}
          onPress={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Xóa</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.save]}
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Lưu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    color: "#1E293B",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  delete: {
    backgroundColor: "#DC2626",
  },
  save: {
    backgroundColor: colors.orange,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
