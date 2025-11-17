import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";

export default function AddressSection({
  selectedAddress,
  onSelectAddress,
  visible = true,
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (!visible) return null;

  const handleNavigateToAddressSelection = () => {
    navigation.navigate("AddressSelectionScreen", {
      currentAddress: selectedAddress,
      onSelectAddress: onSelectAddress,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("payment.deliveryAddress")}</Text>
        <TouchableOpacity onPress={handleNavigateToAddressSelection}>
          <Text style={styles.actionText}>
            {selectedAddress ? t("payment.change") : t("payment.select")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {selectedAddress ? (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <MaterialIcons name="location-on" size={24} color="#ED2A46" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>
                  {selectedAddress.recipientName}
                </Text>
                <Text style={styles.addressPhone}>
                  {selectedAddress.phoneNumber}
                </Text>
              </View>
            </View>
            <Text style={styles.addressDetail}>
              {selectedAddress.fullAddress}
            </Text>
            {selectedAddress.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>
                  {t("payment.default")}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={handleNavigateToAddressSelection}
          >
            <MaterialIcons name="add-location" size={24} color="#ED2A46" />
            <Text style={styles.addAddressText}>
              {t("payment.addDeliveryAddress")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    color: "#ED2A46",
  },
  actionText: {
    fontSize: 10,
    color: "#ED2A46",
  },
  content: {
    marginTop: 10,
  },
  addressCard: {
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
    paddingTop: 12,
    position: "relative",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 13,
    color: "#666",
  },
  addressDetail: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginLeft: 36,
  },
  defaultBadge: {
    position: "absolute",
    top: 12,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
    gap: 8,
  },
  addAddressText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "600",
  },
});
