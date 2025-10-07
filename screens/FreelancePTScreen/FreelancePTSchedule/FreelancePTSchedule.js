import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import Icon from "react-native-vector-icons/FontAwesome";
import WeekCalendar from "../../../components/WeekCalendar/WeekCalendar";

const FreelancePTSchedule = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([
    {
      id: 1,
      clientName: "John Smith",
      time: "09:00 - 10:00",
      type: "Strength Training",
      status: "confirmed",
      location: "Home Gym",
      price: 50,
    },
    {
      id: 2,
      clientName: "Sarah Johnson",
      time: "14:00 - 15:00",
      type: "Cardio Session",
      status: "pending",
      location: "Client's Home",
      price: 45,
    },
    {
      id: 3,
      clientName: "Mike Wilson",
      time: "16:30 - 17:30",
      type: "Weight Training",
      status: "confirmed",
      location: "Local Gym",
      price: 55,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const SessionCard = ({ session }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.clientName}>{session.clientName}</Text>
          <Text style={styles.sessionTime}>{session.time}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(session.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Icon name="dumbbell" size={16} color="#666" />
          <Text style={styles.detailText}>{session.type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{session.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="dollar" size={16} color="#666" />
          <Text style={styles.detailText}>${session.price}</Text>
        </View>
      </View>

      <View style={styles.sessionActions}>
        {session.status === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
            >
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
            >
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
        {session.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
          >
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Today's Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>$150</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Week Calendar */}
      <WeekCalendar
        onDateSelect={setSelectedDate}
        selectedDate={selectedDate}
        initialDate={new Date()}
      />

      {/* Sessions List */}
      <View style={styles.sessionsContainer}>
        <View style={styles.sessionsHeader}>
          <Text style={styles.sessionsTitle}>Today's Sessions</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add Session</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <SessionCard session={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sessionsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerStats: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ED2A46",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  sessionsContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sessionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED2A46",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  sessionsList: {
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  sessionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  sessionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  completeButton: {
    backgroundColor: "#ED2A46",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default FreelancePTSchedule;
