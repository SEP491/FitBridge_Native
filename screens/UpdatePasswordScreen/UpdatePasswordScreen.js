import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useTranslation } from "../../hooks/useTranslation";

const UpdatePasswordScreen = () => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChangePassword = () => {
    // Xử lý đổi mật khẩu xong hiện modal thành công
    setModalVisible(true);
  };

  const handleBackToLogin = () => {
    setModalVisible(false);
    // Có thể navigate về màn hình login nếu có navigation
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LinearGradient
        colors={["#FF914D", "#ED2A46"]}
        style={styles.linearGradient}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("updatePassword.oldPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("updatePassword.oldPassword")}
            secureTextEntry={true}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholderTextColor="#000"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("updatePassword.newPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("updatePassword.newPassword")}
            secureTextEntry={true}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#000"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t("updatePassword.confirmNewPassword")}
          </Text>
          <View style={styles.confirmInputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t("updatePassword.confirmNewPassword")}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#000"
            />
            <TouchableOpacity
              onPress={handleToggleConfirmPassword}
              style={{ paddingHorizontal: 8 }}
            >
              <Icon
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>
          {t("updatePassword.changePassword")}
        </Text>
      </TouchableOpacity>

      {/* Modal thông báo thành công */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.iconCircle}>
              <Icon name="check" size={50} color="#fff" />
            </View>
            <Text style={styles.modalText}>
              {t("updatePassword.resetPasswordSuccess")}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.modalButtonText}>
                {t("updatePassword.backToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 0.5,
    paddingHorizontal: 20,
    paddingTop: 30,
    height: 500,
    marginTop: 70,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#1A191A",
  },
  confirmInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#FF914D",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    width: 250,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
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
    color: "#ED2A46",
    fontSize: 16,
    marginBottom: 25,
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
