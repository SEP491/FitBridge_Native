import {
  View,
  Text,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import authService from "../../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "../../../hooks/useTranslation";

import { jwtDecode } from "jwt-decode";
export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert(t("auth.notification"), t("auth.pleaseEnterPhonePassword"), [
        { text: "OK" },
      ]);
      return;
    }

    setIsLoading(true);
    const requestData = {
      identifier: identifier.trim(),
      password: password.trim(),
    };

    try {
      const response = await authService.login(requestData);
      // console.log("Login response:", response);
      const userData = jwtDecode(response.data.idToken);
      // console.log("Decoded user data:", userData);
      if (
        userData.role === "Customer" ||
        userData.role === "GymPT" ||
        userData.role === "FreelancePT"
      ) {
        // Store token and user data
        await AsyncStorage.setItem("token", response.data.accessToken);
        const user = {
          id: userData.sub,
          fullName: userData.name,
          phone: userData.phone,
          role: userData.role,
          email: userData.email,
        };
        await AsyncStorage.setItem("user", JSON.stringify(user));
        // Handle avatar - only store if it's not null/undefined
        if (userData.senderAvatar) {
          await AsyncStorage.setItem("userAvatar", userData.senderAvatar);
        } else {
          // Remove any existing avatar if the response doesn't have one
          await AsyncStorage.removeItem("userAvatar");
        }

        // Update navigation state - this will automatically redirect to MainApp
        if (global.updateNavigationUser) {
          global.updateNavigationUser();
        }
      } else {
        Alert.alert(t("auth.notification"), t("auth.noAccessPermission"), [
          { text: "OK" },
        ]);
        return;
      }
    } catch (error) {
      Alert.alert(t("auth.loginFailed"), error.response.data.message, [
        { text: "OK" },
      ]);
      console.error("Login error:", error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF914D" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Image
              source={require("../../../assets/LogoColor.png")}
              style={styles.logo}
            />
            <Text style={styles.welcomeTitle}>{t("welcome")}</Text>
            <Text style={styles.welcomeSubtitle}>{t("login")}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <LinearGradient
              colors={["#FF914D", "#ED2A46"]}
              style={styles.formContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.formContent}>
                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("loginScreen.identifier")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome
                      name="phone"
                      size={18}
                      color="#A39F9F"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="0123456789"
                      placeholderTextColor="#A39F9F"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("password")}</Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome
                      name="lock"
                      size={18}
                      color="#A39F9F"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder={t("password")}
                      secureTextEntry={secureText}
                      placeholderTextColor="#A39F9F"
                      style={styles.passwordInput}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setSecureText(!secureText)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome
                        name={secureText ? "eye-slash" : "eye"}
                        size={18}
                        color="#A39F9F"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPasswordScreen1")}
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPassword}>
                    {t("forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF914D", "#ED2A46"]}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>
                  {t("auth.loggingIn")}
                </Text>
              ) : (
                <Text style={styles.loginButtonText}>{t("login")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign Up Section */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpQuestion}>{t("dontHaveAccount")} </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Register");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpText}>{t("register")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A191A",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  formContainer: {
    borderRadius: 24,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A191A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A191A",
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A191A",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPassword: {
    color: "#FF914D",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#FF914D",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  signUpQuestion: {
    fontSize: 16,
    color: "#6B7280",
  },
  signUpText: {
    fontSize: 16,
    color: "#FF914D",
    fontWeight: "600",
  },
});
