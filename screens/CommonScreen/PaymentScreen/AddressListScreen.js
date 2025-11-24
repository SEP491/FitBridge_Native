import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "../../../hooks/useTranslation";
import addressService from "../../../services/addressService";

export default function AddressListScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { onSelectAddress, currentAddress } = route.params || {};
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);


useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    console.log("AddressListScreen focused");
    // Always refresh when coming back to this screen
    fetchAddresses();
  });
  return unsubscribe;
}, [navigation]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();
      setAddresses(response.data);
        console.log("Fetched addresses:", response.data);
        console.log("Current address to match:", currentAddress);
        
        // Set selected address based on current address
        if (currentAddress) {
          const matchedAddress = response.data.find(
            addr => addr.id === currentAddress.id || 
                   addr.id === currentAddress.id
          );
          console.log("Matched address:", matchedAddress);
          if (matchedAddress) {
            setSelectedAddressId(matchedAddress.id);
          }
        }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert(t("common.error"), "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [navigation]);
  
  const handleSelectAddress = (address) => {
    const formattedAddress = {
      id: address.id,
      recipientName: address.receiverName,
      phoneNumber: address.phoneNumber,
      fullAddress: address.googleMapAddressString || 
        `${address.houseNumber} ${address.street}, ${address.ward}, ${address.district}, ${address.city}`,
      isDefault: selectedAddressId === address.id,
      city: address.city,
      district: address.district,
      ward: address.ward,
      street: address.street,
      houseNumber: address.houseNumber,
      note: address.note,
      latitude: address.latitude,
      longitude: address.longitude,
      customerId: address.customerId,
      receiverName: address.receiverName,
      googleMapAddressString: address.googleMapAddressString,
    };

    console.log("Selected address from list:", formattedAddress);
    if (onSelectAddress) {
      onSelectAddress(formattedAddress);
    }
    navigation.goBack();
  };

  const handleCreateNewAddress = () => {
    navigation.navigate("AddressSelectionScreen", {
      onSelectAddress: (newAddress) => {
        // Pass the new address back to payment screen
        if (onSelectAddress) {
          onSelectAddress(newAddress);
        }
      },
    });
  };

  const renderAddressItem = ({ item }) => {
    const isSelected = selectedAddressId === item.id;
    const fullAddress = item.googleMapAddressString || 
      `${item.houseNumber} ${item.street}, ${item.ward}, ${item.district}, ${item.city}`;

    return (
      <TouchableOpacity
        style={[styles.addressItem, isSelected && styles.addressItemSelected]}
        onPress={() => handleSelectAddress(item)}
      >
        <View style={styles.addressContent}>
          <View style={styles.addressHeader}>
            <MaterialIcons name="location-on" size={24} color="#ED2A46" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{item.receiverName}</Text>
              <Text style={styles.addressPhone}>{item.phoneNumber}</Text>
            </View>
            {isSelected && (
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            )}
          </View>
          
          <Text style={styles.addressDetail}>{fullAddress}</Text>
          
          {item.note && (
            <View style={styles.noteContainer}>
              <MaterialIcons name="note" size={16} color="#666" />
              <Text style={styles.noteText}>{item.note}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>


      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED2A46" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="location-off" size={64} color="#DDD" />
          <Text style={styles.emptyText}>{t("payment.noAddresses")}</Text>
          <Text style={styles.emptySubText}>
            {t("payment.createFirstAddress")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create New Address Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNewAddress}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>
            {t("payment.createNewAddress")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addressItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressItemSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F0F9F4",
  },
  addressContent: {
    gap: 12,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
  },
  addressDetail: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginLeft: 36,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  noteText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  createButton: {
    backgroundColor: "#ED2A46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
