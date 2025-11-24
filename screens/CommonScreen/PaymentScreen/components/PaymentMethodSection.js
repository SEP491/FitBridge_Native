import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PaymentMethodSection({
  selectedMethod,
  onSelectMethod,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("payment.paymentMethods")}</Text>
        <Text style={styles.seeAll}>{t("payment.seeAll")}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => onSelectMethod("bank")}
        >
          <View style={styles.paymentLeft}>
            <MaterialIcons name="payment" size={30} color="#ED2A46" />
            <Text>{t("payment.bankTransfer")}</Text>
          </View>
          {selectedMethod === "bank" && (
            <MaterialIcons name="check-circle" size={24} color="#ED2A46" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => onSelectMethod("cod")}
        >
          <View style={styles.paymentLeft}>
            <MaterialIcons name="local-shipping" size={30} color="#ED2A46" />
            <Text>{t("payment.cashOnDelivery")}</Text>
          </View>
          {selectedMethod === "cod" && (
            <MaterialIcons name="check-circle" size={24} color="#ED2A46" />
          )}
        </TouchableOpacity>
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
  seeAll: {
    fontSize: 10,
  },
  content: {
    marginTop: 10,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD9D9",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
