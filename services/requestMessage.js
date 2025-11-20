import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const requestMessage = async (
  method,
  url,
  data = null,
  headers = {},
  params = {}
) => {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_CHAT_MESSAGE_API;
  const token = await AsyncStorage.getItem("token");
  console.log("requestMessage token", token);
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

    return response.data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

export { requestMessage };
