import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";

const { width } = Dimensions.get("window");

// Individual Trainer Card Component
const TrainerCard = ({ trainer, onPress, onGymPress }) => {
  const { t } = useTranslation();

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <View style={styles.trainerCard}>
      {/* Trainer Header */}
      <View style={styles.trainerHeader}>
        {/* Avatar */}
        <View style={styles.trainerAvatarContainer}>
          {trainer.avatarUrl ? (
            <Image
              source={{ uri: trainer.avatarUrl }}
              style={styles.trainerAvatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[styles.trainerAvatar, styles.trainerAvatarPlaceholder]}
            >
              <Ionicons
                name={trainer.isMale ? "man" : "woman"}
                size={40}
                color="#9CA3AF"
              />
            </View>
          )}
        </View>

        {/* Trainer Info */}
        <View style={styles.trainerHeaderInfo}>
          <View style={styles.trainerNameRow}>
            <Text style={styles.trainerName} numberOfLines={1}>
              {trainer.fullName}
            </Text>
            <Ionicons
              name={trainer.isMale ? "male" : "female"}
              size={16}
              color={trainer.isMale ? "#3B82F6" : "#EC4899"}
            />
          </View>

          <View style={styles.trainerDetailsRow}>
            {trainer.dob && (
              <View style={styles.trainerDetailItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.trainerDetailText}>
                  {calculateAge(trainer.dob)} {t("chat.yearsOld")}
                </Text>
              </View>
            )}
            <View style={styles.trainerDetailItem}>
              <Ionicons name="fitness-outline" size={14} color="#6B7280" />
              <Text style={styles.trainerDetailText}>
                {trainer.experience} {t("chat.yearsExp")}
              </Text>
            </View>
          </View>

          {trainer.phoneNumber && (
            <View style={styles.trainerDetailItem}>
              <Ionicons name="call-outline" size={14} color="#6B7280" />
              <Text style={styles.trainerDetailText}>
                {trainer.phoneNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Goal Trainings */}
      {trainer.goalTrainings && trainer.goalTrainings.length > 0 && (
        <View style={styles.goalTrainingsContainer}>
          <Text style={styles.goalTrainingsLabel}>
            {t("chat.specializations")}:
          </Text>
          <View style={styles.goalTrainingsList}>
            {trainer.goalTrainings.map((goal, index) => (
              <View key={index} style={styles.goalTrainingTag}>
                <Text style={styles.goalTrainingText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Gym Info - Clickable */}
      {trainer.gymName && (
        <TouchableOpacity
          style={styles.trainerGymInfo}
          onPress={() => onGymPress({ id: trainer.gymId })}
          activeOpacity={0.7}
        >
          <View style={styles.gymInfoHeader}>
            <Ionicons name="business" size={16} color="#ED2A46" />
            <Text style={styles.gymInfoName} numberOfLines={1}>
              {trainer.gymName}
            </Text>
          </View>

          {trainer.gymAddress && (
            <View style={styles.gymInfoAddress}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.gymInfoAddressText} numberOfLines={2}>
                {trainer.gymAddress}
              </Text>
            </View>
          )}

          {trainer.distance_km !== undefined && (
            <View style={styles.gymInfoDistance}>
              <Ionicons name="navigate-outline" size={14} color="#6B7280" />
              <Text style={styles.gymInfoDistanceText}>
                {trainer.distance_km === 0
                  ? "< 0.1 km"
                  : `${trainer.distance_km} km`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Trainer Cards List Component
export const TrainerCardsList = ({ trainers, onTrainerPress, onGymPress }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(
    Math.max(3, Math.min(trainers.length, 3))
  );
  const initialCount = Math.max(3, Math.min(trainers.length, 3));
  const hasMore = visibleCount < trainers.length;
  const canCollapse = visibleCount > initialCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, trainers.length));
  };

  const handleCollapse = () => {
    setVisibleCount(initialCount);
  };

  return (
    <View style={styles.trainerCardsContainer}>
      <FlatList
        data={trainers.slice(0, visibleCount)}
        renderItem={({ item }) => (
          <TrainerCard
            trainer={item}
            onPress={onTrainerPress}
            onGymPress={onGymPress}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      <View style={styles.buttonContainer}>
        {hasMore && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
          >
            <Text style={styles.showMoreText}>
              {t("chat.showMoreTrainers")} ({trainers.length - visibleCount}{" "}
              {t("chat.remaining")})
            </Text>
            <Ionicons name="chevron-down" size={16} color="#ED2A46" />
          </TouchableOpacity>
        )}

        {canCollapse && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={handleCollapse}
          >
            <Text style={styles.collapseText}>{t("chat.collapse")}</Text>
            <Ionicons name="chevron-up" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  trainerCardsContainer: {
    marginTop: 12,
    width: width * 0.75,
  },
  trainerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trainerHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  trainerAvatarContainer: {
    marginRight: 12,
  },
  trainerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },
  trainerAvatarPlaceholder: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  trainerHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trainerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  trainerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  trainerDetailsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  trainerDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trainerDetailText: {
    fontSize: 13,
    color: "#6B7280",
  },
  goalTrainingsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  goalTrainingsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  goalTrainingsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  goalTrainingTag: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  goalTrainingText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  trainerGymInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  gymInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  gymInfoName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
    flex: 1,
  },
  gymInfoAddress: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginBottom: 4,
  },
  gymInfoAddressText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    lineHeight: 18,
  },
  gymInfoDistance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gymInfoDistanceText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Button Container Styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginHorizontal: 8,
    gap: 8,
  },
  showMoreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ED2A46",
  },
  showMoreText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "600",
    marginRight: 8,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 100,
  },
  collapseText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginRight: 8,
  },
});

export default TrainerCard;
