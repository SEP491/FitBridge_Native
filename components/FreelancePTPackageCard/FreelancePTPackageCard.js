import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../hooks/useTranslation";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 25;

export default function FreelancePTPackagesCard({ package: pkg, fullWidth = false, height = 140, isPurchasedPackage = false }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Helper function to get the correct field values based on data structure
  const getPackageData = () => {
    if (isPurchasedPackage) {
      return {
        id: pkg.id || pkg.freelancePTPackageId,
        name: pkg.packageName,
        imageUrl: pkg.courseImageUrl,
        sessions: pkg.availableSessions,
        expirationDate: pkg.expirationDate,
        ptName: pkg.freelancePTName,
        price: pkg.price,
        durationInDays: pkg.durationInDays,
        sessionDurationInMinutes: pkg.sessionDurationInMinutes,
      };
    }
    // For regular packages from API (getFreelancePTPackages)
    return {
      id: pkg.id,
      freelancePTPackageId: pkg.freelancePTPackageId,
      name: pkg.name || pkg.packageName,
      imageUrl: pkg.imageUrl || pkg.courseImageUrl,
      sessions: pkg.numOfSessions || pkg.availableSessions,
      expirationDate: null,
      ptName: null,
      price: pkg.price,
      durationInDays: pkg.durationInDays,
      sessionDurationInMinutes: pkg.sessionDurationInMinutes,
    };
  };

  const packageData = getPackageData();

  const handlePress = () => {
    // Navigate to package detail or freelance PT detail screen
    // You can customize this based on your navigation structure
    navigation.navigate("FreelancePTPackageDetailScreen", { 
      packageId: packageData.freelancePTPackageId,
      package: pkg 
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, fullWidth && styles.fullWidthCard]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              packageData.imageUrl && packageData.imageUrl !== 'string' && !packageData.imageUrl.includes('file:///')
                ? packageData.imageUrl
                : "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500",
          }}
          style={[styles.image, { height: height }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        {/* Duration Badge or Expiration Date */}
        {packageData.expirationDate ? (
          <View style={styles.durationBadge}>
            <Ionicons name="calendar-outline" size={12} color="#FFF" />
            <Text style={styles.durationText}>
              {new Date(packageData.expirationDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        ) : packageData.durationInDays ? (
          <View style={styles.durationBadge}>
            <Ionicons name="calendar-outline" size={12} color="#FFF" />
            <Text style={styles.durationText}>
              {packageData.durationInDays} {t("freelancePT.days") || "days"}
            </Text>
          </View>
        ) : null}

        {/* Sessions Badge */}
        {packageData.sessions && (
          <View style={styles.sessionsBadge}>
            <Ionicons name="barbell-outline" size={12} color="#FFF" />
            <Text style={styles.sessionsText}>
              {packageData.sessions} {t("freelancePT.sessions") || "sessions"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {packageData.name}
        </Text>

        {/* PT Name for purchased packages */}
        {packageData.ptName && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={12} color="#ED2A46" />
            <Text style={styles.detailText}>
              {packageData.ptName}
            </Text>
          </View>
        )}

        {/* Session Duration */}
        {packageData.sessionDurationInMinutes && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={12} color="#ED2A46" />
            <Text style={styles.detailText}>
              {packageData.sessionDurationInMinutes} {t("freelancePT.minutes") || "min"}
            </Text>
          </View>
        )}

        {/* Price (only show if available and not a purchased package) */}
        {packageData.price && !isPurchasedPackage && (
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(packageData.price)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  fullWidthCard: {
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  durationBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ED2A46",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  sessionsBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sessionsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1A1A1A",
    lineHeight: 18,
    minHeight: 36, // Ensure consistent height for 2 lines
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ED2A46",
  },
});
