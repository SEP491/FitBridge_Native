import React from "react";
import { View, Text, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../../../hooks/useTranslation";

const DashboardHeader = ({ user }) => {
  const { t } = useTranslation();

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
      </Animated.View>
    </LinearGradient>
  );
};
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;
const styles = StyleSheet.create({
  headerGradient: {
    paddingVertical: 20,
    paddingTop: HEIGHT * 0.07,
    paddingBottom: HEIGHT   ,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
});

export default DashboardHeader;
