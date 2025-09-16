import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../../hooks/useTranslation";

const PackageSelectionBottomSheet = ({
  visible,
  onClose,
  gymCourse,
  isPackageInCart,
  handleAddToCart,
  handleAddToCartWithPT,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("gym.packageSelection")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.packageContainer}>
              {/* Normal Packages */}
              {gymCourse?.packageNormal?.length > 0 && (
                <View style={styles.packageSection}>
                  <LinearGradient
                    colors={["#FF914D", "#ED2A46"]}
                    style={styles.packageTitleContainer}
                  >
                    <MaterialIcons
                      name="fitness-center"
                      size={20}
                      color="#FFF"
                    />
                    <Text style={styles.packageTitle}>
                      {t("gym.monthlyPackages")}
                    </Text>
                  </LinearGradient>

                  {gymCourse?.packageNormal?.map((item) => (
                    <View key={item.id} style={styles.packageItem}>
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageName}>{item.name}</Text>
                        <Text style={styles.packagePrice}>
                          {item.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          isPackageInCart(item.id) && styles.addedButton,
                        ]}
                        onPress={() =>
                          !isPackageInCart(item.id) && handleAddToCart(item)
                        }
                      >
                        {isPackageInCart(item.id) ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#FFF"
                          />
                        ) : (
                          <Ionicons
                            name="add-circle-outline"
                            size={24}
                            color="#ED2A46"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* PT Packages */}
              {gymCourse?.packagePT?.length > 0 && (
                <View style={styles.packageSection}>
                  <LinearGradient
                    colors={["#FF914D", "#ED2A46"]}
                    style={styles.packageTitleContainer}
                  >
                    <MaterialIcons name="people" size={20} color="#FFF" />
                    <Text style={styles.packageTitle}>
                      {t("gym.monthlyPackagesWithPT")}
                    </Text>
                  </LinearGradient>

                  {gymCourse?.packagePT?.map((item) => (
                    <View key={item.id} style={styles.packageItem}>
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageName}>{item.name}</Text>
                        <Text style={styles.packagePrice}>
                          {item.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          isPackageInCart(item.id) && styles.addedButton,
                        ]}
                        onPress={() =>
                          !isPackageInCart(item.id) &&
                          handleAddToCartWithPT(item)
                        }
                      >
                        {isPackageInCart(item.id) ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#FFF"
                          />
                        ) : (
                          <Ionicons
                            name="add-circle-outline"
                            size={24}
                            color="#ED2A46"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {!gymCourse?.packageNormal?.length &&
                !gymCourse?.packagePT?.length && (
                  <View style={styles.noPackagesMessage}>
                    <Text style={styles.noPackagesText}>
                      {t("gym.noPackagesAvailable")}
                    </Text>
                  </View>
                )}
            </View>
          </ScrollView>
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
    maxHeight: "80%",
    minHeight: "50%",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  packageContainer: {
    padding: 20,
  },
  packageSection: {
    marginBottom: 24,
  },
  packageTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 8,
  },
  packageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ED2A46",
  },
  addButton: {
    marginLeft: 12,
    padding: 4,
  },
  addedButton: {
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    padding: 4,
  },
  noPackagesMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noPackagesText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default PackageSelectionBottomSheet;
