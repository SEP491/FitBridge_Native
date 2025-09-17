import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import authService from "../../services/authService";
import { useTranslation } from "../../hooks/useTranslation";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isMale, setIsMale] = useState(true);
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDateConfirm = (selectedDate) => {
    setShowDatePicker(false);
    setDateOfBirth(selectedDate);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !confirmPassword) {
      Alert.alert(t("auth.notification"), t("auth.pleaseEnterAllInfo"), [
        { text: "OK" },
      ]);
      return;
    }

    if (email && !validateEmail(email)) {
      Alert.alert(t("auth.notification"), t("auth.invalidEmail"), [
        { text: "OK" },
      ]);
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(t("auth.notification"), t("auth.passwordMinLength"), [
        { text: "OK" },
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("auth.notification"), t("auth.passwordNotMatch"), [
        { text: "OK" },
      ]);
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(t("auth.notification"), t("auth.pleaseAgreeTerms"), [
        { text: "OK" },
      ]);
      return;
    }

    setIsLoading(true);
    const requestData = {
      email,
      phoneNumber: phone || null,
      password,
      fullName,
      dob: dateOfBirth.toISOString(), // Format as YYYY-MM-DD
      isMale,
      isTestAccount: false,
    };
    console.log("Register request data:", requestData);

    try {
      const response = await authService.register(requestData);
      console.log("Registration successful:", response.data.status);
      Alert.alert(t("auth.registerSuccess"), t("auth.accountCreated"), [
        {
          text: t("auth.loginNow"),
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert(t("errors.error"), error.response.data.message, [
        { text: "OK" },
      ]);
      console.error("Registration error:", error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF914D" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require("../../assets/LogoColor.png")}
                  style={styles.logo}
                />
                <Text style={styles.welcomeTitle}>{t("createAccount")}</Text>
                <Text style={styles.welcomeSubtitle}>
                  {t("auth.pleaseEnterAllInfo")}
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
                    {/* Full Name Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("profile.fullName")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        <FontAwesome
                          name="user"
                          size={18}
                          color="#A39F9F"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder={t("profile.fullName")}
                          placeholderTextColor="#A39F9F"
                          style={styles.input}
                          maxLength={50}
                        />
                      </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("email")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="email"
                          size={18}
                          color="#A39F9F"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          placeholder={t("email")}
                          placeholderTextColor="#A39F9F"
                          style={styles.input}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("profile.phoneNumber")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        <FontAwesome
                          name="phone"
                          size={18}
                          color="#A39F9F"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="0123456789"
                          placeholderTextColor="#A39F9F"
                          style={styles.input}
                          keyboardType="phone-pad"
                          maxLength={10}
                        />
                      </View>
                    </View>

                    {/* Date of Birth Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("profile.dateOfBirth")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <FontAwesome
                          name="calendar"
                          size={18}
                          color="#A39F9F"
                          style={styles.inputIcon}
                        />
                        <Text style={styles.dateText}>
                          {formatDate(dateOfBirth)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("profile.gender")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
                      <View style={styles.genderContainer}>
                        <TouchableOpacity
                          style={[
                            styles.genderButton,
                            isMale && styles.genderButtonActive,
                          ]}
                          onPress={() => setIsMale(true)}
                          activeOpacity={0.7}
                        >
                          <FontAwesome
                            name="mars"
                            size={18}
                            color={isMale ? "#FFFFFF" : "#A39F9F"}
                            style={styles.genderIcon}
                          />
                          <Text
                            style={[
                              styles.genderText,
                              isMale && styles.genderTextActive,
                            ]}
                          >
                            {t("profile.genderOptions.male")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.genderButton,
                            !isMale && styles.genderButtonActive,
                          ]}
                          onPress={() => setIsMale(false)}
                          activeOpacity={0.7}
                        >
                          <FontAwesome
                            name="venus"
                            size={18}
                            color={!isMale ? "#FFFFFF" : "#A39F9F"}
                            style={styles.genderIcon}
                          />
                          <Text
                            style={[
                              styles.genderText,
                              !isMale && styles.genderTextActive,
                            ]}
                          >
                            {t("profile.genderOptions.female")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("password")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
                      </Text>
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
                          placeholder={t("auth.passwordMinLength")}
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

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t("confirmPassword")}{" "}
                        <Text style={styles.required}>
                          {t("auth.required")}
                        </Text>
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
                          placeholder={t("auth.enterPasswordAgain")}
                          secureTextEntry={secureConfirmText}
                          placeholderTextColor="#A39F9F"
                          style={styles.passwordInput}
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() =>
                            setSecureConfirmText(!secureConfirmText)
                          }
                          activeOpacity={0.7}
                        >
                          <FontAwesome
                            name={secureConfirmText ? "eye-slash" : "eye"}
                            size={18}
                            color="#A39F9F"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsSection}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      agreedToTerms && styles.checkboxChecked,
                    ]}
                  >
                    {agreedToTerms && (
                      <FontAwesome name="check" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    {t("auth.agreeWithTerms")}{" "}
                    <Text style={styles.termsLink}>
                      {t("auth.termsOfService")}
                    </Text>{" "}
                    {t("auth.and")}{" "}
                    <Text style={styles.termsLink}>
                      {t("auth.privacyPolicy")}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  isLoading && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF914D", "#ED2A46"]}
                  style={styles.registerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading ? t("auth.registering") : t("register")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginSection}>
                <Text style={styles.loginQuestion}>
                  {t("alreadyHaveAccount")}{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginText}>{t("login")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
        date={dateOfBirth}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        confirmTextIOS={t("common.confirm")}
        cancelTextIOS={t("common.cancel")}
        headerTextIOS={t("profile.selectDateOfBirth")}
        display="spinner"
        isDarkModeEnabled={false}
        buttonTextColorIOS="#FF914D"
        textColor="#1A191A"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A191A",
    marginBottom: 6,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  formSection: {
    marginBottom: 20,
  },
  formContainer: {
    borderRadius: 24,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A191A",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A191A",
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A191A",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: "#1A191A",
    paddingVertical: 0,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: "#FF914D",
    borderColor: "#FF914D",
  },
  genderIcon: {
    marginRight: 8,
  },
  genderText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#A39F9F",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },
  termsSection: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#FF914D",
    borderColor: "#FF914D",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  termsLink: {
    color: "#FF914D",
    fontWeight: "500",
  },
  registerButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#FF914D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  loginQuestion: {
    fontSize: 15,
    color: "#6B7280",
  },
  loginText: {
    fontSize: 15,
    color: "#FF914D",
    fontWeight: "600",
  },
});
