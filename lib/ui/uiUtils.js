import { Alert } from "react-native";

export const showConfirmAlert = ({
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  confirmStyle = "default",
}) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: confirmStyle,
      onPress: onConfirm,
    },
  ]);
};

export const showAlert = (title, message, onPress) => {
  Alert.alert(title, message, [{ text: "OK", onPress }]);
};

export const showErrorAlert = (message, onPress) => {
  showAlert("Lỗi", message, onPress);
};

export const showSuccessAlert = (message, onPress) => {
  showAlert("Thành công", message, onPress);
};

export const truncateForDisplay = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const formatAddressForCard = (address, maxLength = 30) => {
  return truncateForDisplay(address, maxLength);
};
