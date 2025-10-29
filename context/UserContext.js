import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const getAvatarUser = async () => {
    setLoading(true);
    try {
      const url = await AsyncStorage.getItem("userAvatar");
      setAvatarUrl(url);
    } catch (error) {
      console.error("Error fetching avatar URL:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarUrl = async (url) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("userAvatar", url);
      setAvatarUrl(url);
    } catch (error) {
      console.error("Error updating avatar URL:", error);
    } finally {
      setLoading(false);
    }
  };
  const clearAvatarUrl = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("userAvatar");
      setAvatarUrl("");
    } catch (error) {
      console.error("Error clearing avatar URL:", error);
    } finally {
      setLoading(false);
    }
  };
  const value = {
    avatarUrl,
    loading,
    getAvatarUser,
    updateAvatarUrl,
    clearAvatarUrl,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
