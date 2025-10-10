import { request } from "./request";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authService = {
  login: (loginData) => request("POST", "v1/identities/login", loginData),
  register: (registerData) =>
    request("POST", `v1/identities/register-customer`, registerData),

  // Check if token is valid by making a request to get user profile
  validateToken: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return { isValid: false };
      }

      const response = await request("GET", "v1/accounts/profile");

      const storedUser = await AsyncStorage.getItem("user");
      let user = response.data;

      if (storedUser) {
        const parsedStoredUser = JSON.parse(storedUser);
        user = {
          ...response.data,
          role: parsedStoredUser.role,
          id: parsedStoredUser.id,
        };
      }

      return {
        isValid: true,
        user: user,
      };
    } catch (error) {
      console.error("Token validation failed:", error.message);
      await AsyncStorage.multiRemove(["token", "user", "userAvatar"]);
      return { isValid: false };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user", "userAvatar"]);
      return true;
    } catch (error) {
      console.error("Logout error:", error.message);
      return false;
    }
  },
};

export default authService;
