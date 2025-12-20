import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { mockedDataDashboard } from "./mockedDataDashboard";

const TopPackageCard = ({ packageData, formatCurrency, renderRevenueComparison }) => {
  if (!packageData) return null;

  return (
    <TouchableOpacity style={styles.topPackageCard} activeOpacity={0.9}>
      <LinearGradient
        colors={["#FFD89B", "#FFF8E1", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topPackageGradient}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <View style={styles.topPackageContent}>
          {/* Enhanced Rank Badge */}
          <View style={styles.topPackageHeader}>
            <LinearGradient
              colors={["#FFD700", "#FFA500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rankBadge}
            >
              <Icon name="trophy" size={14} color="#FFF" />
              <Text style={styles.rankText}>#1</Text>
            </LinearGradient>
          </View>

          {/* Package Info */}
          <View style={styles.topPackageInfo}>
            <Text style={styles.packageName}>
              {packageData.packageName || "Gói tập 1"}
            </Text>
            <View style={styles.purchaseInfo}>
              <Icon name="people" size={14} color="#FF6B35" />
              <Text style={styles.purchaseCount}>
                {packageData.totalPurchase || 0} người đã mua
              </Text>
            </View>
          </View>

          {/* Revenue Display */}
          <View style={styles.revenueDisplayContainer}>
            <Text style={styles.revenueLabel}>Doanh thu</Text>
            <Text style={styles.packageRevenue}>
              {formatCurrency(packageData.totalProfit || packageData.totalIncome || 0)}
            </Text>
          </View>

          {/* Comparison Info */}
          {renderRevenueComparison(packageData.compareToLastMonth)}

          {/* View Details Button */}
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            <Icon name="arrow-forward" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {/* Package Image */}
        <View style={styles.topPackageImageContainer}>
          <View style={styles.imageGlow} />
          <Image
            source={{
              uri: packageData.imageURL || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
            }}
            style={styles.packageIconImage}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SecondaryPackageCard = ({ packageData, rank, hasMargin, formatCurrency, renderComparisonBadge }) => {
  if (!packageData) return null;

  const rankConfig = {
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

  const config = rankConfig[rank] || rankConfig[2];

  return (
    <TouchableOpacity
      style={[
        styles.secondaryPackageCard,
        hasMargin && styles.secondaryPackageCardWithMargin,
      ]}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={config.gradientColors}
        style={styles.secondaryPackageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Elements */}
        <View style={styles.secondaryDecorativeCircle} />

        <View style={styles.secondaryPackageContent}>
          {/* Enhanced Rank Badge */}
          <View style={styles.secondaryPackageHeader}>
            <LinearGradient
              colors={config.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.secondaryRankBadge}
            >
              <Icon
                name={config.iconName}
                size={14}
                color="#FFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.secondaryRankText}>#{rank}</Text>
            </LinearGradient>
          </View>

          {/* Package Info */}
          <View style={styles.secondaryPackageInfo}>
            <Text style={styles.secondaryPackageName}>
              {packageData.packageName || `Gói tập ${rank}`}
            </Text>
            <View style={styles.secondaryPurchaseInfo}>
              <Icon
                name="people"
                size={12}
                color={config.accentColor}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.secondaryPurchaseCount}>
                {packageData.totalPurchase || 0} người đã mua
              </Text>
            </View>
          </View>

          {/* Revenue Display */}
          <View style={styles.secondaryRevenueSection}>
            <View style={styles.secondaryRevenueContainer}>
              <Text style={styles.secondaryPackageRevenue}>
                {formatCurrency(packageData.totalProfit || packageData.totalIncome || 0)}
              </Text>
              {renderComparisonBadge(packageData.compareToLastMonth)}
            </View>
          </View>
        </View>

        {/* Enhanced Package Image */}
        <View style={styles.secondaryPackageImageContainer}>
          <View style={styles.secondaryImageGlow} />
          <Image
            source={{
              uri:
                packageData.imageURL ||
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
            }}
            style={styles.packageSecondaryIconImage}
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
        {/* Top Package Card */}
        <TopPackageCard 
          packageData={sortedPackages[0]} 
          formatCurrency={formatCurrency}
          renderRevenueComparison={renderRevenueComparison}
        />

        {/* Secondary Packages Container */}
        {sortedPackages.length > 1 && (
          <View style={styles.secondaryPackagesContainer}>
            <SecondaryPackageCard
              packageData={sortedPackages[1]}
              rank={2}
              hasMargin={!!sortedPackages[2]}
              formatCurrency={formatCurrency}
              renderComparisonBadge={renderComparisonBadge}
            />
            {sortedPackages[2] && (
              <SecondaryPackageCard
                packageData={sortedPackages[2]}
                rank={3}
                hasMargin={false}
                formatCurrency={formatCurrency}
                renderComparisonBadge={renderComparisonBadge}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bestsellerSection: {
    padding: 20,
    marginTop: 20,
  },
  bestsellerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  bestsellerContainer: {
    flexDirection: "row",
  },
  topPackageCard: {
    flex: 1,
    borderRadius: 40,
    marginRight: 12,
    elevation: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  topPackageGradient: {
    padding: 20,
    justifyContent: "space-between",
    position: "relative",
    minHeight: 250,
    borderRadius: 40,
  },
  topPackageContent: {
    zIndex: 2,
  },
  topPackageHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
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
    color: "#FF6B35",
  },
  topPackageInfo: {
  },
  purchaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  purchaseCount: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  topPackageImageContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  packageIconImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  packageRevenue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C41E3A",
    letterSpacing: -0.5,
  },
  secondaryPackagesContainer: {
    flex: 1,
  },
  secondaryPackageCard: {
    flex: 1,
    borderRadius: 40,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",
  },
  secondaryPackageGradient: {
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
    borderRadius: 40,
  },
  secondaryPackageCardWithMargin: {
    marginBottom: 5,
  },
  secondaryPackageContent: {
    zIndex: 2,
    flex: 1,
  },
  secondaryPackageHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 5,
  },  
  secondaryRankBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryRankText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  secondaryPackageInfo: {
  },
  secondaryPackageImageContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  packageSecondaryIconImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryPackageName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
    lineHeight: 18,
  },
  secondaryPurchaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  secondaryPurchaseCount: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  secondaryRevenueSection: {
    marginTop: 5,
  },
  secondaryRevenueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryPackageRevenue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#C41E3A",
    letterSpacing: -0.3,
    marginRight: 6,
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
    width: 80,
    height: 80,
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
    marginTop: 12,
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    right: -10,
    top: -10,
  },
});

export default BestsellerPackages;
