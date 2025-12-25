import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import authService from "../../services/authService";
import { useTranslation } from "../../hooks/useTranslation";
import notificationService from "../../services/notificationService";

const DeleteAccountBottomSheet = ({
  visible,
  onClose,
  onConfirmDelete,
  clearCart,
}) => {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteReasons = [
    {
      id: 1,
      title: t("deleteAccount.reasons.noLongerUse.title"),
      description: t("deleteAccount.reasons.noLongerUse.description"),
    },
    {
      id: 2,
      title: t("deleteAccount.reasons.foundBetter.title"),
      description: t("deleteAccount.reasons.foundBetter.description"),
    },
    {
      id: 3,
      title: t("deleteAccount.reasons.unsatisfiedService.title"),
      description: t("deleteAccount.reasons.unsatisfiedService.description"),
    },
    {
      id: 4,
      title: t("deleteAccount.reasons.securityConcerns.title"),
      description: t("deleteAccount.reasons.securityConcerns.description"),
    },
    {
      id: 5,
      title: t("deleteAccount.reasons.tooManyNotifications.title"),
      description: t("deleteAccount.reasons.tooManyNotifications.description"),
    },
    {
      id: 6,
      title: t("deleteAccount.reasons.otherReason.title"),
      description: t("deleteAccount.reasons.otherReason.description"),
    },
  ];

  const handleDeleteAccount = async () => {
    if (!selectedReason) {
      Alert.alert(
        t("deleteAccount.notification"),
        t("deleteAccount.pleaseSelectReason")
      );
      return;
    }

    Alert.alert(
      t("deleteAccount.confirmTitle"),
      t("deleteAccount.confirmMessage"),
      [
        {
          text: t("deleteAccount.cancel"),
          style: "cancel",
        },
        {
          text: t("deleteAccount.deleteButton"),
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Here you would typically call an API to delete the account
              // For now, we'll just logout the user
              const logoutSuccess = await authService.logout();

              if (logoutSuccess) {
                try {
                  const pushSubscription =
                    await Notifications.getDevicePushTokenAsync();
                  console.log("pushSubscription", pushSubscription);
                  const token = pushSubscription.data;
                  await notificationService
                    .unregisterDeviceToken({
                      deviceToken: token,
                    })
                    .catch((error) => {
                      console.error("Error unregistering device token:", error);
                    });
                } catch (error) {
                  console.error("Error unregistering device token:", error);
                }
                clearCart(); // Clear cart data
                if (global.updateNavigationUser) {
                  global.updateNavigationUser();
                }
                onConfirmDelete();
                onClose();
                Alert.alert(
                  t("deleteAccount.success"),
                  t("deleteAccount.accountDeleted")
                );
              } else {
                Alert.alert(
                  t("deleteAccount.error"),
                  t("deleteAccount.deleteFailed")
                );
              }
            } catch (error) {
              console.error(
                "Error deleting account:",
                error.response?.data?.message
              );
              Alert.alert(
                t("deleteAccount.error"),
                error.response?.data?.message || t("deleteAccount.deleteFailed")
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("deleteAccount.title")}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Warning Message */}
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={24} color="#FF6B6B" />
            <Text style={styles.warningText}>{t("deleteAccount.warning")}</Text>
          </View>

          {/* Reason Selection */}
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>
              {t("deleteAccount.reasonsTitle")}
            </Text>
            <ScrollView style={styles.reasonsList}>
              {deleteReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.selectedReasonItem,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.reasonContent}>
                    <View style={styles.reasonTextContainer}>
                      <Text style={styles.reasonTitle}>{reason.title}</Text>
                      <Text style={styles.reasonDescription}>
                        {reason.description}
                      </Text>
                    </View>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioButton,
                          selectedReason === reason.id &&
                            styles.selectedRadioButton,
                        ]}
                      >
                        {selectedReason === reason.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>
                {t("deleteAccount.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                (!selectedReason || isLoading) && styles.disabledButton,
              ]}
              onPress={handleDeleteAccount}
              disabled={!selectedReason || isLoading}
            >
              <LinearGradient
                colors={["#FF6B6B", "#E63946"]}
                style={styles.deleteButtonGradient}
              >
                <Text style={styles.deleteButtonText}>
                  {isLoading
                    ? t("deleteAccount.processing")
                    : t("deleteAccount.deleteButton")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#B91C1C",
    lineHeight: 20,
  },
  reasonsContainer: {
    padding: 20,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedReasonItem: {
    backgroundColor: "#FEF2F2",
    borderColor: "#ED2A46",
  },
  reasonContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    borderColor: "#ED2A46",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ED2A46",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default DeleteAccountBottomSheet;
