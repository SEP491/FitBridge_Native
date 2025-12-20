import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";

const CourseCard = ({ course, onPress }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(course.expirationDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining < 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.cardTouchable}
      activeOpacity={0.8}
    >
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[colors.orange, colors.red]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Course Header */}
          <View style={styles.courseHeader}>
            <View style={styles.courseInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.courseTitle} numberOfLines={1}>
                  {course.name}
                </Text>
                {course.packageType === "FreelancePTPackage" && (
                  <View
                    style={[
                      styles.pendingBadge,
                      course.totalAwaitingBookingRequests === 0 &&
                        styles.pendingBadgeInactive,
                    ]}
                  >
                    <Ionicons
                      name="notifications"
                      size={18}
                      color={colors.white}
                    />
                    <Text style={styles.pendingBadgeText}>
                      {course.totalAwaitingBookingRequests || 0}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.sessionsBadge}>
                <MaterialIcons name="event" size={14} color={colors.white} />
                <Text style={styles.sessionsText}>
                  {course.availableSessions}{" "}
                  {t("courseScreen.sessionsAvailable") ||
                    t("courseScreen.sessions")}
                </Text>
              </View>
            </View>
          </View>

          {/* PT Information */}
          {course.pt && (
            <View style={styles.ptSection}>
              <View style={styles.ptInfo}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri:
                        course.pt.avatarUrl ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDVautKC6iIhByPKtNOGlHRa2E52Ahxt4jQ&s",
                    }}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.ptDetails}>
                  <View style={styles.ptNameRow}>
                    <Ionicons
                      name="person"
                      size={14}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.ptName}>{course.pt.fullName}</Text>
                  </View>

                  {course.pt.experience && (
                    <View style={styles.ptInfoRow}>
                      {course.pt.isMale ? (
                        <Foundation
                          name="male-symbol"
                          size={12}
                          color="rgba(255,255,255,0.8)"
                        />
                      ) : (
                        <Foundation
                          name="female-symbol"
                          size={12}
                          color="rgba(255,255,255,0.8)"
                        />
                      )}
                      <Text style={styles.ptInfoText}>
                        {course.pt.isMale
                          ? t("courseScreen.male")
                          : t("courseScreen.female")}
                        • {course.pt.experience}{" "}
                        {t("courseScreen.yearsExperience")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Expiration Info */}
          <View style={styles.expirationSection}>
            <View style={styles.expirationRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.expirationLabel}>
                {t("courseScreen.expiresOn") ||
                  t("freelanceCourseScreen.expiresOn")}
                :{" "}
              </Text>
              <Text style={styles.expirationDate}>
                {formatDate(course.expirationDate)}
              </Text>
            </View>

            {isExpired ? (
              <View style={styles.statusBadgeExpired}>
                <Text style={styles.statusText}>
                  {t("courseScreen.expired") ||
                    t("freelanceCourseScreen.expired")}
                </Text>
              </View>
            ) : isExpiringSoon ? (
              <View style={styles.statusBadgeWarning}>
                <Text style={styles.statusText}>
                  {daysRemaining}{" "}
                  {t("courseScreen.daysLeft") ||
                    t("freelanceCourseScreen.daysLeft")}
                </Text>
              </View>
            ) : (
              <View style={styles.statusBadgeActive}>
                <Text style={styles.statusText}>
                  {daysRemaining}{" "}
                  {t("courseScreen.daysLeft") ||
                    t("freelanceCourseScreen.daysLeft")}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardTouchable: {
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    flex: 1,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF1744",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minWidth: 48,
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    elevation: 6,
    shadowColor: "#FF1744",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  pendingBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  pendingBadgeInactive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  sessionsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  sessionsText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  ptSection: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  ptInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  ptDetails: {
    flex: 1,
  },
  ptNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  ptName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  ptInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ptInfoText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginLeft: 4,
  },
  expirationSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expirationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expirationLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  expirationDate: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadgeActive: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
  statusBadgeWarning: {
    backgroundColor: "rgba(255, 193, 7, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.5)",
  },
  statusBadgeExpired: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.5)",
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
});

export default CourseCard;
