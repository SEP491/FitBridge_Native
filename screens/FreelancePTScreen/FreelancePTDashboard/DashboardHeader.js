import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../../hooks/useTranslation";

const DashboardHeader = ({ user }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#FF914D", "#ED2A46", "#C41E3A"]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.userInfo]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.avatarUrl,
            }}
            style={styles.userAvatar}
          />
          <View style={styles.statusIndicator} />
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>
            {user ? user.fullName : t("userMenu.user")}
          </Text>
          <Text style={styles.userPhone}>
            {user ? user.phone : t("userMenu.pleaseLogin")}
          </Text>
          {user && user.role && (
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>
                {user.role === "GymPT"
                  ? "Gym PT"
                  : user.role === "FreelancePT"
                  ? "Freelance PT"
                  : t("userMenu.user")}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("NotificationScreen")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={28} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;
const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 64,
    paddingBottom: 20,
    borderRadius: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "white",
  },
  userTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  userPhone: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  notificationButton: {
    padding: 8,
  },
  iconContainer: {
    position: "relative",
    padding: 4,
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1,
    borderColor: "white",
  },
});

export default DashboardHeader;
