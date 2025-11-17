import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const request = async (method, url, data = null, headers = {}, params = {}) => {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const token = await AsyncStorage.getItem("token");
  console.log("Token:", token);
  console.log("API URL:", `${API_BASE_URL}${url}`);
  console.log("Method:", method);
  console.log("Params:", params);
  
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      headers: {
        ...headers,
        ...authHeader,
      },
      params,
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.message);
    console.error("API Error Details:", error.response?.data);
    console.error("API Error Status:", error.response?.status);
    throw error;
  }
};

export { request };
