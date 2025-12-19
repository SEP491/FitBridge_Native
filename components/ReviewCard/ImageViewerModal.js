import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ImageViewerModal = ({
  visible,
  imageUrls = [],
  selectedIndex = 0,
  onClose,
  onNavigate,
}) => {
  if (!imageUrls || imageUrls.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={32} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.modalContent}>
          <Image
            source={{ uri: imageUrls[selectedIndex] }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          {imageUrls.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={() => onNavigate?.("prev")}
              >
                <Ionicons name="chevron-back" size={32} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={() => onNavigate?.("next")}
              >
                <Ionicons name="chevron-forward" size={32} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {selectedIndex + 1} / {imageUrls.length}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalContent: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  imageCounter: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ImageViewerModal;


