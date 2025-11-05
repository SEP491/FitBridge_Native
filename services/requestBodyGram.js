import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const requestBodyGram = async (
  method,
  url,
  data = null,
  headers = {},
  params = {}
) => {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BODYGRAM_URL;
  const apiKey = process.env.EXPO_PUBLIC_BODYGRAM_API_KEY;
  const authHeader = apiKey ? { Authorization: `${apiKey}` } : {};
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

export { requestBodyGram };
