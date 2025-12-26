import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { mockedDataDashboard } from "./mockedDataDashboard";
import { t } from "../../../i18n";

const PackageCard = ({ packageData, rank, formatCurrency, renderRevenueComparison, renderComparisonBadge }) => {
  if (!packageData) return null;

  const rankConfig = {
    1: {
      iconColor: "#FFD700",
      iconName: "trophy",
      gradientColors: ["#FFD89B", "#FFF8E1", "#FFFFFF"],
      badgeGradient: ["#FFD700", "#FFA500"],
      accentColor: "#FF6B35",
    },
    2: {
      iconColor: "#FFA500",
      iconName: "medal",
      gradientColors: ["#FFF8E1", "#FFE0B2", "#FFCC80"],
      badgeGradient: ["#FFA500", "#FF8C00"],
      accentColor: "#FF6B35",
    },
    3: {
      iconColor: "#CD7F32",
      iconName: "medal",
      gradientColors: ["#FFF3E0", "#FFE0B2", "#FFCC80"],
      badgeGradient: ["#CD7F32", "#B8860B"],
      accentColor: "#D2691E",
    },
  };

  const config = rankConfig[rank] || rankConfig[1];

  return (
    <TouchableOpacity style={styles.packageCard} activeOpacity={0.9}>
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.packageGradient}
      >
        {/* Decorative Elements */}
        {rank === 1 && (
          <>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
          </>
        )}
        {rank !== 1 && <View style={styles.secondaryDecorativeCircle} />}

        <View style={styles.packageContent}>
          {/* Enhanced Rank Badge */}
          <View style={styles.packageHeader}>
            <LinearGradient
              colors={config.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rankBadge}
            >
              <Icon
                name={config.iconName}
                size={rank === 1 ? 14 : 14}
                color="#FFF"
                style={{ marginRight: rank === 1 ? 0 : 4 }}
              />
              <Text style={styles.rankText}>#{rank}</Text>
            </LinearGradient>
            <View style={styles.purchaseInfo}>
              <Icon name="people" size={14} color={config.accentColor} />
              <Text style={styles.purchaseCount}>
                {packageData.totalPurchase || 0} lượt mua
              </Text>
            </View>
          </View>
          

          {/* Package Info */}
          <View style={styles.packageInfo}>
            
            <Text style={styles.packageName}>
              {packageData.packageName || `Gói tập ${rank}`}
            </Text>
          </View>

          {/* Revenue Display */}
          <View style={styles.revenueDisplayContainer}>
            <Text style={styles.revenueLabel}>{t("transactionType.profit")}</Text>
            <View style={styles.revenueRow}>
              <Text style={styles.packageRevenue}>
                {formatCurrency(packageData.totalProfit || packageData.totalIncome || 0)}
              </Text>
              {rank === 1
                ? renderRevenueComparison(packageData.compareToLastMonth)
                : renderComparisonBadge(packageData.compareToLastMonth)}
            </View>
          </View>
        </View>

        {/* Package Image */}
        <View style={styles.packageImageContainer}>
          {rank === 1 && <View style={styles.imageGlow} />}
          {rank !== 1 && <View style={styles.secondaryImageGlow} />}
          <Image
            source={{
              uri: packageData.imageURL || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
            }}
            style={rank === 1 ? styles.packageIconImage : styles.packageSecondaryIconImage}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};


const BestsellerPackages = ({ formatCurrency, renderRevenueComparison, renderComparisonBadge, mostPopularPackages = [] }) => {
  // Transform API data to match component structure
  const transformedPackages = mostPopularPackages.map((pkg, index) => ({
    packageName: pkg.packageName,
    totalPurchase: pkg.totalPackagesSold,
    totalIncome: pkg.totalProfit, // Using totalProfit as income
    imageURL: pkg.packageImageUrl,
    packageId: pkg.packageId,
    packagePrice: pkg.packagePrice,
    totalRevenue: pkg.totalRevenue,
    totalProfit: pkg.totalProfit,
  }));

  const sortedPackages = [...transformedPackages].sort(
    (a, b) => (b.totalProfit || 0) - (a.totalProfit || 0)
  );

  if (sortedPackages.length === 0) {
    return null;
  }

  return (
    <View style={styles.bestsellerSection}>
      <Text style={styles.bestsellerTitle}>
        Top gói tập nhiều doanh thu nhất
      </Text>

      <View style={styles.bestsellerContainer}>
        {sortedPackages.slice(0, 3).map((pkg, index) => (
          <PackageCard
            key={pkg.packageId || index}
            packageData={pkg}
            rank={index + 1}
            formatCurrency={formatCurrency}
            renderRevenueComparison={renderRevenueComparison}
            renderComparisonBadge={renderComparisonBadge}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bestsellerSection: {
    padding: 20,
  },
  bestsellerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  bestsellerContainer: {
    flexDirection: "column",
    gap: 12,
  },
  packageCard: {
    width: "100%",
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 1,
  },
  packageGradient: {
    padding: 20,
    justifyContent: "space-between",
    position: "relative",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  packageContent: {
    zIndex: 2,
    flex: 1,
    marginRight: 20,

  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
    gap:10,
    alignItems: "center"
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    marginLeft:5
  },
  packageInfo: {
  },
  purchaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
    marginBottom: 8,
  },
  purchaseCount: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  packageImageContainer: {
    position: "relative",
    zIndex: 1,
  },
  packageIconImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  packageSecondaryIconImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
    lineHeight: 24,
  },
  packageRevenue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C41E3A",
    letterSpacing: -0.5,
  },
  revenueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  secondaryDecorativeCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    right: -15,
    bottom: -15,
  },
  secondaryImageGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    right: -5,
    top: -5,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    top: -20,
    left: -20,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    top: 50,
    right: 30,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    bottom: 20,
    left: 40,
  },
  revenueDisplayContainer: {
    marginTop: 8,
  },
  revenueLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 4,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35",
    marginRight: 6,
  },
  imageGlow: {
    position: "absolute",
    width: 120,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    right: -10,
    top: -10,
  },
});

export default BestsellerPackages;
