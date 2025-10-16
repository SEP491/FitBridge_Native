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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 25;

export default function GymCard({ gym, fullWidth = false, height = 140 }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("GymDetailScreen", { gymId: gym.id, gym: gym });
  };
  console.log("GymCard gym data:", gym?.gymImages[0]?.url);
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
              // gym?.gymImages[0]?.url ||
              "https://thesaigontimes.vn/wp-content/uploads/2024/12/g1-2.jpeg",
          }}
          style={[styles.image, { height: height }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        {/* Rating Badge */}
        {gym?.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{gym.rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Distance Badge */}
        {gym?.distance && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location" size={12} color="#FFF" />
            <Text style={styles.distanceText}>
              {gym.distance.toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        {/* Gym Name */}
        <Text style={styles.name} numberOfLines={1}>
          {gym?.gymName}
        </Text>

        {/* Represent Name */}
        {gym?.representName && (
          <Text style={styles.representName} numberOfLines={1}>
            {gym?.representName}
          </Text>
        )}

        {/* Description */}
        {gym?.gymDescription && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={12} color="#6B6B6B" />
            <Text style={styles.address} numberOfLines={2} ellipsizeMode="tail">
              {gym.gymAddress || gym.gymDescription.substring(0, 15) + "..."}
            </Text>
          </View>
        )}

        {/* Bottom Row - Rating and Reviews */}
        {/* <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={
                    i < Math.floor(gym?.rating || 0) ? "star" : "star-outline"
                  }
                  size={12}
                  color={
                    i < Math.floor(gym?.rating || 0) ? "#FFD700" : "#E5E5E5"
                  }
                />
              ))}
            </View>
          </View>
          {gym?.totalVote && (
            <View style={styles.statsContainer}>
              <Ionicons name="people-outline" size={12} color="#6B6B6B" />
              <Text style={styles.statsText}>{gym.totalVote}</Text>
            </View>
          )}
        </View> */}
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
  distanceBadge: {
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
  distanceText: {
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
  representName: {
    fontSize: 11,
    color: "#6B6B6B",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: "#6B6B6B",
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ratingContainer: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
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
