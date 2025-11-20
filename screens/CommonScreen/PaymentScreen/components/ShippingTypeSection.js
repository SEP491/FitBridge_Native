import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "../../../../hooks/useTranslation";
import { formatPrice } from "../../../../lib";

export default function ShippingTypeSection({
  visible = true,
  selectedShippingType,
  onSelectShippingType,
  shippingTypes = [],
  loading = false,
}) {
  const { t } = useTranslation();

  if (!visible) return null;

  // Default shipping types if none provided
  const defaultShippingTypes = [
    {
      id: "standard",
      name: t("payment.standardShipping"),
      description: t("payment.standardShippingDesc"),
      fee: 30000,
      estimatedDays: "3-5",
      icon: "local-shipping",
    },
    {
      id: "express",
      name: t("payment.expressShipping"),
      description: t("payment.expressShippingDesc"),
      fee: 50000,
      estimatedDays: "1-2",
      icon: "flash-on",
    },
    {
      id: "same-day",
      name: t("payment.sameDayShipping"),
      description: t("payment.sameDayShippingDesc"),
      fee: 80000,
      estimatedDays: "0",
      icon: "schedule",
    },
  ];

  const displayShippingTypes = shippingTypes.length > 0 ? shippingTypes : defaultShippingTypes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("payment.shippingType")}</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED2A46" />
            <Text style={styles.loadingText}>{t("payment.loadingShippingOptions")}</Text>
          </View>
        ) : shippingTypes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-shipping" size={40} color="#CCC" />
            <Text style={styles.emptyText}>{t("payment.selectAddressFirst")}</Text>
          </View>
        ) : (
          displayShippingTypes.map((type, index) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.shippingOption,
                index === 0 && styles.firstOption,
              ]}
              onPress={() => onSelectShippingType(type)}
            >
              <View style={styles.shippingLeft}>
                <MaterialIcons
                  name={type.icon}
                  size={28}
                  color={selectedShippingType?.id === type.id ? "#ED2A46" : "#666"}
                />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingName}>{type.name}</Text>
                  <Text style={styles.shippingDescription}>
                    {type.description}
                  </Text>
                  {type.estimatedDays !== "0" && (
                    <Text style={styles.estimatedTime}>
                      {t("payment.estimatedDelivery")}: {type.estimatedDays} {t("payment.days")}
                    </Text>
                  )}
                  {type.distance && (
                    <Text style={styles.distanceText}>
                      {t("payment.distance")}: {type.distance.toFixed(2)} km
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingFee}>{formatPrice(type.fee)}</Text>
                {selectedShippingType?.id === type.id && (
                  <MaterialIcons name="check-circle" size={24} color="#ED2A46" />
                )}
              </View>
            </TouchableOpacity>
          ))
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
    marginBottom: 5,
  },
  title: {
    fontSize: 15,
    color: "#ED2A46",
    fontWeight: "600",
  },
  content: {
    marginTop: 10,
  },
  shippingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
  },
  firstOption: {
    borderTopWidth: 0,
  },
  shippingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  shippingDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  estimatedTime: {
    fontSize: 11,
    color: "#999",
  },
  shippingRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  shippingFee: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  distanceText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});
