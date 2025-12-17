import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import defaultImage from "../../../assets/images/LogoColor.png";
import { useNavigation } from "@react-navigation/native";
import { t } from "../../../i18n";
const UpcomingSessionCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionLeft}>
        <Animated.View style={[styles.sessionAvatar, { opacity }]} />
        <View style={styles.sessionInfo}>
          <Animated.View style={[styles.skeletonNameLine, { opacity }]} />
          <Animated.View style={[styles.skeletonTimeLine, { opacity }]} />
        </View>
      </View>
      <Animated.View style={[styles.skeletonStatusBadge, { opacity }]} />
    </View>
  );
};

const UpcomingSessionCardSkeletonList = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <UpcomingSessionCardSkeleton key={`session-skeleton-${index}`} />
      ))}
    </>
  );
};

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
          source={session.customerAvatarUrl ? { uri: session.customerAvatarUrl } : defaultImage}
          style={styles.sessionAvatar}
        />
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{session.customerName}</Text>
          <Text style={styles.sessionTime}>
            {formatTime(session.ptFreelanceStartTime)} - {formatTime(session.ptFreelanceEndTime)}
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
  const navigation = useNavigation();

  // Only keep sessions that are still in the future compared to current time
  // Supports both "HH:mm" strings and full ISO datetime strings like "2025-10-15T15:11:51.091405+00:00"
  const filterUpcomingByNow = (allSessions) => {
    if (!Array.isArray(allSessions)) return [];

    const now = new Date();

    return allSessions.filter((session) => {
      const raw = session?.ptFreelanceStartTime;
      if (!raw) return false;

      let sessionDateTime;

      // If it's an ISO datetime (contains "T"), let Date parse it directly
      if (typeof raw === "string" && raw.includes("T")) {
        sessionDateTime = new Date(raw);
      } else if (typeof raw === "string") {
        // Fallback: treat as "HH:mm" (or "HH:mm:ss") on today
        const [hourStr, minuteStr] = raw.split(":");
        const hour = Number(hourStr);
        const minute = Number(minuteStr ?? 0);

        if (Number.isNaN(hour) || Number.isNaN(minute)) return false;

        sessionDateTime = new Date(now);
        sessionDateTime.setHours(hour, minute, 0, 0);
      } else {
        return false;
      }

      if (Number.isNaN(sessionDateTime.getTime())) return false;

      return sessionDateTime.getTime() > now.getTime();
    });
  };

  const upcomingSessions = filterUpcomingByNow(sessions);

  const handleNavigateToSchedule = () => {
    navigation.navigate("MainApp", {
      screen: t("navigation.freelancePTSchedule"),
      params: { screen: "FreelancePTSchedule" },
    });
  };

  return (
    <View style={styles.upcomingSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
        <TouchableOpacity onPress={handleNavigateToSchedule} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>Xem tất cả</Text>
          <Icon name="arrow-forward" size={16} color="#ED2A46" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <UpcomingSessionCardSkeletonList count={3} />
      ) : upcomingSessions.length ? (
        upcomingSessions.map((session) => (
          <UpcomingSessionCard session={session} key={session.bookingId} />
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Bạn chưa có buổi tập nào sắp tới trong hôm nay.
          </Text>
        </View>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    elevation: 3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    elevation: 3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#777",
  },
  skeletonNameLine: {
    width: "60%",
    height: 15,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  skeletonTimeLine: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  skeletonStatusBadge: {
    width: 80,
    height: 28,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
});

export default UpcomingSessions;
