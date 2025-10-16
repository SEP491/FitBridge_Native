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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
              <Text style={styles.courseTitle} numberOfLines={1}>
                {course.name}
              </Text>
              <Text style={styles.courseType}>
                {course.packageType === "FreelancePTPackage"
                  ? t("courseScreen.courseWithPTFreelance")
                  : t("courseScreen.courseWithPT")}
              </Text>
              <Text style={styles.priceText}>{formatPrice(course.price)}</Text>
            </View>

            {/* Course Details */}
            <View style={styles.courseDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="event"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.detailValue}>
                  {course.availableSessions}
                </Text>
                <Text style={styles.detailLabel}>
                  {t("courseScreen.sessions")}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.detailValue}>
                  {formatDate(course.expirationDate)}
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
                  <Text style={styles.ptName}>{course.pt.fullName}</Text>

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
                </View>
              </View>
            </View>
          )}
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
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  courseType: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginBottom: 4,
  },
  priceText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  courseDetails: {
    alignItems: "flex-end",
    gap: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  detailValue: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  ptSection: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  ptInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  ptDetails: {
    flex: 1,
  },
  ptName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 2,
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
});

export default CourseCard;
