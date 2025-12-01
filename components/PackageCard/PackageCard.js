import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";

export default function PackageCard({
  item,
  onRenew,
  onReport,
  onFeedback,
  t,
  mode = "package", // "package" for MyPackage, "review" for MyReviewsRatings
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const isPackageExpired = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  const getDaysRemaining = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPackageTypeConfig = (type) => {
    switch (type) {
      case "freelancePT":
        return {
          color: "#1976d2",
          backgroundColor: "#e3f2fd",
          icon: "person",
          label: t("myPackage.packageTypes.freelancePT"),
        };
      case "gymCourseWithPT":
        return {
          color: colors.red,
          backgroundColor: "#fff5f5",
          icon: "people",
          label: t("myPackage.packageTypes.gymWithPT"),
        };
      case "gymCourseNormal":
        return {
          color: "#2e7d32",
          backgroundColor: "#e8f5e8",
          icon: "fitness",
          label: t("myPackage.packageTypes.gymMembership"),
        };
      default:
        return {
          color: "#666",
          backgroundColor: "#f5f5f5",
          icon: "card-membership",
          label: t("myPackage.packageTypes.package"),
        };
    }
  };

  const expired = isPackageExpired(item.expirationDate);
  const daysRemaining = getDaysRemaining(item.expirationDate);
  const typeConfig = getPackageTypeConfig(item.type);
  const isFreelancePT = item.type === "freelancePT";
  const isGymWithPT = item.type === "gymCourseWithPT";
  const isGymNormal = item.type === "gymCourseNormal";
  const isReviewMode = mode === "review";

  return (
    <View style={[styles.packageCard, expired && styles.expiredCard]}>
      {/* First Row: Image and Information */}
      <View style={styles.mainRow}>
        {/* Image with Badge */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.courseImageUrl ||
                "https://fitness-nation.net/wp-content/uploads/2019/04/5-Things-to-Consider-When-Buying-a-Gym-Membership.jpg",
            }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          {/* Package Type Badge on Image */}
          <View
            style={[
              styles.typeImageBadge,
              { backgroundColor: typeConfig.color },
            ]}
          >
            <Ionicons name={typeConfig.icon} size={10} color="#fff" />
            <Text style={styles.typeImageBadgeText}>{typeConfig.label}</Text>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.cardContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.packageTitle} numberOfLines={2}>
                {item.packageName}
              </Text>

              {/* In review mode we don't show remaining days badge, only for active packages */}
              {!isReviewMode && !expired && daysRemaining >= 0 && (
                <View
                  style={[
                    styles.statusBadge,
                    daysRemaining <= 7
                      ? styles.warningBadge
                      : styles.activeBadge,
                  ]}
                >
                  <View style={styles.statusDot} />
                  <Text
                    style={[
                      styles.statusText,
                      daysRemaining <= 7 && styles.warningText,
                    ]}
                  >
                    {daysRemaining === 0
                      ? t("myPackage.today")
                      : `${daysRemaining}d`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {/* Freelance PT Info Card */}
            {isFreelancePT && item.ptName && (
              <View
                style={[
                  styles.ptInfoCard,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderLeftColor: typeConfig.color,
                  },
                ]}
              >
                <View style={[styles.ptAvatar, { backgroundColor: "#fff" }]}>
                  <Ionicons name="person" size={14} color={typeConfig.color} />
                </View>
                <View style={styles.ptInfo}>
                  <Text style={styles.ptLabel}>
                    {t("myPackage.labels.personalTrainer")}
                  </Text>
                  <Text style={styles.ptName}>{item.ptName}</Text>
                </View>
              </View>
            )}

            {/* Gym Course with PT Info Card */}
            {isGymWithPT && (
              <View
                style={[
                  styles.ptInfoCard,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderLeftColor: typeConfig.color,
                  },
                ]}
              >
                <View style={[styles.ptAvatar, { backgroundColor: "#fff" }]}>
                  <Ionicons name="people" size={14} color={typeConfig.color} />
                </View>
                <View style={styles.ptInfo}>
                  <Text style={styles.ptLabel}>
                    {t("myPackage.labels.assignedTrainer")}
                  </Text>
                  <Text style={styles.ptName}>{item.ptName}</Text>
                </View>
              </View>
            )}

            {/* Gym Normal Membership Badge */}
            {isGymNormal && (
              <View
                style={[
                  styles.membershipBadge,
                  {
                    backgroundColor: typeConfig.backgroundColor,
                    borderColor: typeConfig.color,
                  },
                ]}
              >
                <MaterialIcons
                  name="verified"
                  size={14}
                  color={typeConfig.color}
                />
                <Text
                  style={[styles.membershipText, { color: typeConfig.color }]}
                >
                  {t("myPackage.labels.fullGymAccess")}
                </Text>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#fff3e0" }]}>
                  <MaterialIcons
                    name="fitness-center"
                    size={16}
                    color="#f57c00"
                  />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{item.availableSessions}</Text>
                  <Text style={styles.statLabel}>
                    {t("myPackage.sessions")}
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#e8f5e8" }]}>
                  <Ionicons name="calendar" size={16} color="#2e7d32" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {formatDate(item.expirationDate)}
                  </Text>
                  <Text style={styles.statLabel}>
                    {isReviewMode
                      ? t("myPackage.purchasedOn") || t("myPackage.expiresOn")
                      : t("myPackage.expiresOn")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Second Row: Action Buttons */}
      {isReviewMode ? (
        // Review mode: only feedback action is relevant
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => onFeedback && onFeedback(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={18} color="#FF9800" />
            <Text style={styles.feedbackButtonText}>
              {item.hasReviewed
                ? t("myPackage.viewFeedback")
                : t("myPackage.leaveFeedback")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : !expired ? (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.renewButton,
              { backgroundColor: typeConfig.color },
            ]}
            onPress={() => onRenew && onRenew(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.renewButtonText}>{t("myPackage.renew")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReport && onReport(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="flag-outline" size={18} color={colors.red} />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => onFeedback && onFeedback(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={18} color="#FF9800" />
            <Text style={styles.feedbackButtonText}>
              {item.hasReviewed
                ? t("myPackage.viewFeedback")
                : t("myPackage.leaveFeedback")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReport && onReport(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="flag-outline" size={18} color={colors.red} />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  expiredCard: {
    opacity: 1,
  },
  mainRow: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  courseImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  typeImageBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  typeImageBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "space-between",
  },
  headerSection: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  activeBadge: {
    backgroundColor: "#e8f5e8",
  },
  warningBadge: {
    backgroundColor: "#fff3e0",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2e7d32",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2e7d32",
  },
  warningText: {
    color: "#f57c00",
  },
  infoSection: {
    gap: 8,
  },
  ptInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    borderLeftWidth: 2,
    gap: 6,
  },
  ptAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ptInfo: {
    flex: 1,
  },
  ptLabel: {
    fontSize: 9,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  ptName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  membershipText: {
    fontSize: 10,
    fontWeight: "700",
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  renewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  renewButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.red,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportButtonText: {
    fontSize: 14,
    color: colors.red,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFF3E0",
    borderWidth: 1.5,
    borderColor: "#FF9800",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: "#FF9800",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});