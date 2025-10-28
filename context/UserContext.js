import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAvatarUrl } from "../lib";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }

      const url = await getAvatarUrl();
      setAvatarUrl(url);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const updateAvatar = async (newAvatarUrl) => {
    try {
      setAvatarUrl(newAvatarUrl);
      // Also update in AsyncStorage via the utility
      const { updateAvatar: updateAvatarUtil } = await import("../lib");
      await updateAvatarUtil(newAvatarUrl);

      // Update user object if it exists
      if (user) {
        updateUser({ avatarUrl: newAvatarUrl });
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userAvatar");
      setUser(null);
      setAvatarUrl("");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    avatarUrl,
    loading,
    updateUser,
    updateAvatar,
    logout,
    refreshUserData: loadUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
