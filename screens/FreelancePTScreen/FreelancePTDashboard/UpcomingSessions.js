import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const UpcomingSessionCard = ({ session }) => {
  if (!session) return null;

  const statusConfig = {
    completed: { label: "Hoàn thành", color: "#4CAF50" },
    finished: { label: "Hoàn thành", color: "#4CAF50" },
    cancelled: { label: "Đã hủy", color: "#F44336" },
    canceled: { label: "Đã hủy", color: "#F44336" },
    default: { label: "Sắp diễn ra", color: "#2196F3" },
  };

  const config =
    statusConfig[session.sessionStatus?.toLowerCase?.()] ||
    statusConfig[session.sessionStatus] ||
    statusConfig.default;

  const formatTime = (timeString) => {
    if (!timeString) return "00:00";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F7F8FB"]}
      style={styles.sessionCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.sessionLeft}>
        <Image
          source={{ uri: session.customerAvatarURL }}
          style={styles.sessionAvatar}
        />
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{session.customerName}</Text>
          <Text style={styles.sessionTime}>
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </Text>
        </View>
      </View>
      <View style={[styles.sessionStatusBadge, { backgroundColor: `${config.color}1A` }]}>
        <Icon name="ellipse" size={10} color={config.color} style={{ marginRight: 4 }} />
        <Text style={[styles.sessionStatusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    </LinearGradient>
  );
};

const UpcomingSessions = ({ sessions = [], loading = false }) => {
  return (
    <View style={styles.upcomingSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
        <TouchableOpacity style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>Xem tất cả</Text>
          <Icon name="arrow-forward" size={16} color="#ED2A46" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ED2A46" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : sessions.length ? (
        sessions.map((session) => (
          <UpcomingSessionCard session={session} key={session.bookingId} />
        ))
      ) : (
        <Text style={styles.emptyStateText}>
          Bạn chưa có buổi tập nào trong hôm nay.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  upcomingSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1F1F",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionActionText: {
    fontSize: 13,
    color: "#ED2A46",
    marginRight: 6,
    fontWeight: "600",
  },
  sessionCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sessionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  sessionTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sessionStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#777",
  },
  emptyStateText: {
    fontSize: 13,
    color: "#777",
  },
});

export default UpcomingSessions;
