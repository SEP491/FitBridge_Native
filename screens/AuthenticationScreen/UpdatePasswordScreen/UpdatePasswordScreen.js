import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import accountService from "../../../services/accountService";
import { useNavigation } from "@react-navigation/native";

const UpdatePasswordScreen = () => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New password and confirmation do not match.");
        return;
      }
      const response = await accountService.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });
      console.log("Password changed successfully:", response);
      Alert.alert("Success", "Your password has been updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error changing password:", error.response.data.message);
      Alert.alert(
        "Error",
        error.response.data.message || "Failed to change password."
      );
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
            <Text style={styles.welcomeTitle}>{t("updatePassword.title")}</Text>
            <Text style={styles.welcomeSubtitle}>
              {t("updatePassword.subtitle")}
            </Text>
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
                {/* Old Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("updatePassword.oldPassword")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome
                      name="lock"
                      size={18}
                      color="#A39F9F"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      placeholder={t("updatePassword.oldPassword")}
                      secureTextEntry={true}
                      placeholderTextColor="#A39F9F"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* New Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("updatePassword.newPassword")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome
                      name="lock"
                      size={18}
                      color="#A39F9F"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={t("updatePassword.newPassword")}
                      secureTextEntry={true}
                      placeholderTextColor="#A39F9F"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("updatePassword.confirmNewPassword")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome
                      name="lock"
                      size={18}
                      color="#A39F9F"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder={t("updatePassword.confirmNewPassword")}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#A39F9F"
                      style={styles.passwordInput}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={handleToggleConfirmPassword}
                      activeOpacity={0.7}
                    >
                      <FontAwesome
                        name={showConfirmPassword ? "eye-slash" : "eye"}
                        size={18}
                        color="#A39F9F"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleChangePassword}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF914D", "#ED2A46"]}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>
                {t("updatePassword.changePassword")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

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
  loginButton: {
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#FF914D",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: 300,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  iconCircle: {
    backgroundColor: "#ED2A46",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalText: {
    color: "#1A191A",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#FF914D",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UpdatePasswordScreen;
