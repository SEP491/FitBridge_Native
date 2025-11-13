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
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjZlYzNkNC00ZDM0LTQ1ZjItYmJmNy05OGI5YTNkZmMzMWMiLCJ1bmlxdWVfbmFtZSI6ImpvaG4iLCJyb2xlIjoiQ3VzdG9tZXIiLCJBdmF0YXJVcmwiOiJodHRwczovL3N0YXRpYy53aWtpYS5ub2Nvb2tpZS5uZXQvZ29rdXJha3VnYWkvaW1hZ2VzLzAvMGEvVGFvX1Nhb3RvbWVfUG9ydHJhaXQucG5nL3JldmlzaW9uL2xhdGVzdD9jYj0yMDI0MDYwODAzMTE0MCIsIm5iZiI6MTc2MjkzMDYzOCwiZXhwIjoxNzYyOTM0MjM4LCJpYXQiOjE3NjI5MzA2Mzh9.MaF4P1gz2A8yISRqNlC58YucuBPcpwJ4Epl4kuvqFS0";
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
