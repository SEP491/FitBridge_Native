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

export default function FreelancePTProfileCard({
  pt,
  fullWidth = false,
  height = 140,
}) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handlePress = () => {
    // Navigate to PT profile or detail screen
    navigation.navigate("PTProfileScreen", {
      ptId: pt.id,
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
              pt?.avatarUrl ||
              "https://www.npta.ca/cdn/shop/files/Everything_You_Need_to_Know.jpg?v=1745621834&width=1100",
          }}
          style={[styles.image, { height: height }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        {/* Rating Badge */}
        {pt?.rating ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{pt.rating.toFixed(1)}</Text>
          </View>
        ) : (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {pt.rating ? pt.rating.toFixed(1) : "N/A"}
            </Text>
          </View>
        )}

        {/* Experience Badge */}
        {pt?.experienceYears ? (
          <View style={styles.experienceBadge}>
            <Ionicons name="medal-outline" size={12} color="#FFF" />
            <Text style={styles.experienceText}>
              {pt.experienceYears} {t("freelancePT.years") || "years"}
            </Text>
          </View>
        ) : (
          <View style={styles.experienceBadge}>
            <Ionicons name="medal-outline" size={12} color="#FFF" />
            <Text style={styles.experienceText}>
              {pt.experienceYears ? pt.experienceYears : "N/A"}{" "}
              {t("freelancePT.years") || "years"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        {/* PT Name */}
        <Text style={styles.name} numberOfLines={1}>
          {pt?.fullName}
        </Text>

        {/* Description */}
        {pt?.description ? (
          <Text
            style={styles.description}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {pt.description}
          </Text>
        ) : (
          <Text
            style={styles.description}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {/* Description not available */}
          </Text>
        )}

        {/* Goal Training Tags */}
        {pt?.goalTrainings && pt.goalTrainings.length > 0 ? (
          <View style={styles.tagsContainer} numberOfLines={1}>
            {pt.goalTrainings.slice(0, 2).map((goal, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {goal}
                </Text>
              </View>
            ))}
            {pt.goalTrainings.length > 2 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  +{pt.goalTrainings.length - 2}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tagsContainer} numberOfLines={1}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Goal Training Tags</Text>
            </View>
          </View>
        )}

        {/* Price and Total Purchased */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              {t("freelancePT.from") || "From"}
            </Text>
            <Text style={styles.price}>{formatPrice(pt?.priceFrom || 0)}</Text>
          </View>
          {pt?.totalPurchased && (
            <View style={styles.statsContainer}>
              <Ionicons name="people-outline" size={12} color="#6B6B6B" />
              <Text style={styles.statsText}>{pt.totalPurchased}</Text>
            </View>
          )}
        </View>
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
    marginBottom: 16,
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
  ratingBadge: {
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
  ratingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  experienceBadge: {
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
  experienceText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1A1A1A",
  },
  description: {
    fontSize: 12,
    color: "#6B6B6B",
    lineHeight: 16,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    overflow: "scroll",
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#FFF5F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ED2A46",
  },
  tagText: {
    fontSize: 7,
    color: "#ED2A46",
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#ED2A46",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 11,
    color: "#6B6B6B",
    fontWeight: "600",
  },
});
